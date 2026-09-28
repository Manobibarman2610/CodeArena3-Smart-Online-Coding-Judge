'use strict';

const { pool } = require('../config/db');
const { asArray } = require('../utils/normalizers');

/**
 * Recalculate student skills and learning paths based on actual submission records
 */
async function evaluateStudentSkill(studentId) {
  // 1. Fetch all submissions by student
  const [submissions] = await pool.query(`
    SELECT s.problem_id, s.verdict, p.difficulty, p.topics
    FROM submissions s
    JOIN problems p ON p.id = s.problem_id
    WHERE s.user_id = ?
  `, [studentId]);

  const [practiceSubs] = await pool.query(`
    SELECT spp.program_id, spp.is_completed, spp.last_verdict, pp.category AS topic, pp.difficulty
    FROM student_practice_progress spp
    JOIN practice_programs pp ON pp.id = spp.program_id
    WHERE spp.student_id = ?
  `, [studentId]);

  const topicStats = {};

  // Aggregate standard problem submissions
  submissions.forEach(sub => {
    const topics = asArray(sub.topics);

    topics.forEach(t => {
      if (!topicStats[t]) topicStats[t] = { attempts: 0, solved: 0 };
      topicStats[t].attempts++;
      if (sub.verdict === 'AC') topicStats[t].solved++;
    });
  });

  // Aggregate practice submissions
  practiceSubs.forEach(ps => {
    const t = ps.topic;
    if (t) {
      if (!topicStats[t]) topicStats[t] = { attempts: 0, solved: 0 };
      topicStats[t].attempts++;
      if (ps.is_completed || ps.last_verdict === 'AC') topicStats[t].solved++;
    }
  });

  // Calculate topic mastery and classify
  const strongTopics = [];
  const weakTopics = [];
  const improvingTopics = [];

  for (const [topic, stat] of Object.entries(topicStats)) {
    const accuracy = stat.attempts > 0 ? (stat.solved / stat.attempts) * 100 : 0;
    const mastery = Math.round(accuracy);
    let status = 'needs_practice';

    if (accuracy >= 75 && stat.solved >= 3) {
      status = 'strong';
      strongTopics.push(topic);
    } else if (accuracy >= 50 || stat.solved >= 2) {
      status = 'improving';
      improvingTopics.push(topic);
    } else {
      status = 'needs_practice';
      weakTopics.push(topic);
    }

    await pool.query(`
      INSERT INTO student_topic_skills 
        (student_id, topic, mastery_score, status, solved_count, attempted_count)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        mastery_score = VALUES(mastery_score),
        status = VALUES(status),
        solved_count = VALUES(solved_count),
        attempted_count = VALUES(attempted_count)
    `, [studentId, topic, mastery, status, stat.solved, stat.attempts]);
  }

  // Calculate overall skill level
  const totalSolved = Object.values(topicStats).reduce((sum, t) => sum + t.solved, 0);
  let currentLevel = 'Beginner';
  let levelScore = Math.min(totalSolved * 25, 1000);

  if (totalSolved >= 40) currentLevel = 'Competitive';
  else if (totalSolved >= 20) currentLevel = 'Advanced';
  else if (totalSolved >= 8) currentLevel = 'Intermediate';

  // Generate recommended topics and next challenges
  const recommendedTopics = [
    ...weakTopics.slice(0, 3),
    ...improvingTopics.slice(0, 2)
  ];
  if (recommendedTopics.length === 0) {
    recommendedTopics.push('Arrays', 'Strings', 'Hash Map');
  }

  await pool.query(`
    INSERT INTO student_learning_paths 
      (student_id, current_level, level_score, recommended_topics, strong_topics, weak_topics)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      current_level = VALUES(current_level),
      level_score = VALUES(level_score),
      recommended_topics = VALUES(recommended_topics),
      strong_topics = VALUES(strong_topics),
      weak_topics = VALUES(weak_topics)
  `, [
    studentId,
    currentLevel,
    levelScore,
    JSON.stringify(recommendedTopics),
    JSON.stringify(strongTopics.length ? strongTopics : ['Basic Algorithms']),
    JSON.stringify(weakTopics.length ? weakTopics : ['Dynamic Programming', 'Graphs'])
  ]);

  return {
    currentLevel,
    levelScore,
    strongTopics,
    weakTopics,
    improvingTopics,
    recommendedTopics
  };
}

/**
 * Get personalized learning path with recommended practice and problems
 */
async function getLearningPath(studentId) {
  let [pathRows] = await pool.query(
    'SELECT * FROM student_learning_paths WHERE student_id = ?',
    [studentId]
  );

  if (!pathRows[0]) {
    await evaluateStudentSkill(studentId);
    [pathRows] = await pool.query('SELECT * FROM student_learning_paths WHERE student_id = ?', [studentId]);
  }

  const [topicSkills] = await pool.query(
    'SELECT topic, mastery_score, status, solved_count, attempted_count FROM student_topic_skills WHERE student_id = ? ORDER BY mastery_score DESC',
    [studentId]
  );

  const path = pathRows[0] || {};
  const recTopics = asArray(path.recommended_topics);

  // Fetch recommended unsolved problems
  const [recommendedProblems] = await pool.query(`
    SELECT p.id, p.title, p.slug, p.difficulty, p.topics
    FROM problems p
    WHERE p.is_public = TRUE
      AND p.id NOT IN (SELECT problem_id FROM submissions WHERE user_id = ? AND verdict = 'AC')
    ORDER BY 
      CASE p.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END,
      p.accepted_count DESC
    LIMIT 6
  `, [studentId]);

  // Fetch recommended practice programs
  const [recommendedPractice] = await pool.query(`
    SELECT pp.id, pp.title, pp.language, pp.category, pp.difficulty
    FROM practice_programs pp
    WHERE pp.is_published = TRUE
      AND pp.id NOT IN (SELECT program_id FROM student_practice_progress WHERE student_id = ? AND is_completed = TRUE)
    ORDER BY 
      CASE pp.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END,
      pp.id ASC
    LIMIT 8
  `, [studentId]);

  return {
    current_level: path.current_level || 'Beginner',
    level_score: path.level_score || 0,
    topic_skills: topicSkills,
    strong_topics: asArray(path.strong_topics),
    weak_topics: asArray(path.weak_topics),
    recommended_topics: recTopics,
    recommended_problems: recommendedProblems,
    recommended_practice: recommendedPractice
  };
}

module.exports = {
  evaluateStudentSkill,
  getLearningPath
};
