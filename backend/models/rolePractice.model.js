'use strict';

const { pool } = require('../config/db');
const { asArray } = require('../utils/normalizers');

/**
 * ════════════════════════════════════════════════════════
 * CAREER ROLES & CURRICULUM DEFINITIONS
 * ════════════════════════════════════════════════════════
 */
const CAREER_ROLES = [
  {
    id: 'software-developer',
    title: 'Software Developer',
    icon: '💻',
    tagline: 'Core Software Engineering & System Optimization',
    description: 'Master Data Structures & Algorithms, memory efficiency, clean object-oriented code, and production problem-solving skills.',
    targetSkills: ['Programming Fundamentals', 'Data Structures & Algorithms (DSA)', 'Problem Solving', 'System Design & Optimization'],
    recommendedLanguages: ['cpp', 'java', 'python', 'c'],
    defaultTopics: ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Recursion', 'Sorting', 'Dynamic Programming'],
    stages: [
      { level: 1, title: 'Stage 1: Logic & Fundamentals', description: 'Conditionals, loops, arrays, strings, and basic math algorithms.' },
      { level: 2, title: 'Stage 2: DSA Core Mastery', description: 'Linear & Non-linear Data Structures: Stacks, Queues, Trees, and Sorting.' },
      { level: 3, title: 'Stage 3: Advanced Algorithmic Mastery', description: 'Graphs, Dynamic Programming, Heap/Priority Queues, and System Optimization.' }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    icon: '📊',
    tagline: 'Data Processing, Numerical Computing & Math Algorithms',
    description: 'Focus on array manipulations, hash maps, matrix algorithms, mathematical reasoning, and Python data structure implementations.',
    targetSkills: ['Python Mastery', 'Array & Matrix Algorithms', 'Hash Maps & Sets', 'Mathematical Logic', 'Statistical Computing'],
    recommendedLanguages: ['python'],
    defaultTopics: ['Arrays', 'Strings', 'Hash Map', 'Recursion', 'Sorting', 'Matrix', 'Basic Algorithms'],
    stages: [
      { level: 1, title: 'Stage 1: Python Data Foundations', description: 'Lists, dictionaries, string manipulations, and basic search algorithms.' },
      { level: 2, title: 'Stage 2: Matrix & Hash Structure Optimization', description: '2D Arrays, Hash tables, sliding window, and two-pointer techniques.' },
      { level: 3, title: 'Stage 3: Complex Algorithmic Analytics', description: 'Divide & conquer, mathematical optimization, and memoization.' }
    ]
  },
  {
    id: 'web-developer',
    title: 'Web Developer',
    icon: '🌐',
    tagline: 'Full-Stack Data Flow & Interactive Logic',
    description: 'Master JavaScript and Python coding patterns, JSON parsing, async data processing, hash structures, strings, and stack operations.',
    targetSkills: ['JavaScript & Modern JS', 'Data Formats & Parsing', 'String Algorithms', 'Hash Tables & Caching', 'Logic Optimization'],
    recommendedLanguages: ['javascript', 'python'],
    defaultTopics: ['Strings', 'Arrays', 'Hash Map', 'Stacks', 'Queues', 'Recursion', 'Basic Algorithms'],
    stages: [
      { level: 1, title: 'Stage 1: JS Syntax & Array Methods', description: 'Filter, map, reduce, string operations, and fundamental logic.' },
      { level: 2, title: 'Stage 2: Data Structures & State Management', description: 'Stacks, queues, hash maps for O(1) lookups, and tree traversal.' },
      { level: 3, title: 'Stage 3: Complex Data Processing & Async Logic', description: 'Trie structures, graph algorithms, and algorithmic efficiency.' }
    ]
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI / ML Engineer',
    icon: '🤖',
    tagline: 'Mathematical Optimization, Trees, Graphs & Dynamic Programming',
    description: 'Build algorithmic mastery required for Machine Learning: tree/graph traversals, dynamic programming, matrix math, and greedy algorithms.',
    targetSkills: ['Mathematical Algorithmic Logic', 'Graph & Tree Algorithms', 'Dynamic Programming', 'Optimization Methods'],
    recommendedLanguages: ['python', 'cpp'],
    defaultTopics: ['Trees', 'Graphs', 'Dynamic Programming', 'Recursion', 'Arrays', 'Matrix', 'Sorting'],
    stages: [
      { level: 1, title: 'Stage 1: Math & Search Fundamentals', description: 'Binary Search, recursion, vector operations, and array transformations.' },
      { level: 2, title: 'Stage 2: Tree & Graph Traversals', description: 'BFS, DFS, Binary Trees, Graph Shortest Paths, and Heaps.' },
      { level: 3, title: 'Stage 3: Dynamic Programming & Matrix Solvers', description: 'Knapsack, DAGs, Matrix Chain Multiplication, and State Space Search.' }
    ]
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud / DevOps Engineer',
    icon: '☁️',
    tagline: 'System Scripting, File Operations & Resource Scheduling',
    description: 'Master low-level systems programming, string manipulation, process queues, stack operations, and system resource optimization.',
    targetSkills: ['Systems Scripting', 'String & Log Parsing', 'Process Queue Scheduling', 'Resource Allocation Logic'],
    recommendedLanguages: ['python', 'c', 'cpp'],
    defaultTopics: ['Strings', 'Queues', 'Stacks', 'Arrays', 'Basic Algorithms', 'Sorting'],
    stages: [
      { level: 1, title: 'Stage 1: Log Parsing & String Manipulation', description: 'Regex, string tokenization, file I/O simulations, and data formatting.' },
      { level: 2, title: 'Stage 2: Queues, Stacks & Task Schedulers', description: 'Priority queues, circular buffers, LRU cache logic, and stack handlers.' },
      { level: 3, title: 'Stage 3: Graph Network Routing & Optimization', description: 'Network graph traversal, shortest path routing, and resource management.' }
    ]
  }
];

/**
 * Get List of All Career Roles
 */
function getRoles() {
  return CAREER_ROLES;
}

/**
 * Fetch User's Role Preference
 */
async function getUserRolePreference(userId) {
  const [rows] = await pool.query(
    'SELECT target_role, preferred_language, preferred_difficulty, selected_dsa_topics FROM user_role_preferences WHERE user_id = ?',
    [userId]
  );

  if (!rows[0]) {
    return {
      target_role: 'Software Developer',
      preferred_language: 'cpp',
      preferred_difficulty: 'All',
      selected_dsa_topics: CAREER_ROLES[0].defaultTopics
    };
  }

  const pref = rows[0];
  const topics = asArray(pref.selected_dsa_topics);

  return {
    target_role: pref.target_role || 'Software Developer',
    preferred_language: pref.preferred_language || 'cpp',
    preferred_difficulty: pref.preferred_difficulty || 'All',
    selected_dsa_topics: topics.length ? topics : CAREER_ROLES[0].defaultTopics
  };
}

/**
 * Save / Update User Role Preference
 */
async function setUserRolePreference(userId, { targetRole, preferredLanguage, preferredDifficulty, selectedDsaTopics }) {
  const roleObj = CAREER_ROLES.find(r => r.title.toLowerCase() === (targetRole || '').toLowerCase() || r.id === targetRole) || CAREER_ROLES[0];
  const roleTitle = roleObj.title;
  const lang = preferredLanguage || roleObj.recommendedLanguages[0] || 'cpp';
  const diff = preferredDifficulty || 'All';
  const topics = Array.isArray(selectedDsaTopics) && selectedDsaTopics.length ? selectedDsaTopics : roleObj.defaultTopics;

  await pool.query(`
    INSERT INTO user_role_preferences (user_id, target_role, preferred_language, preferred_difficulty, selected_dsa_topics)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      target_role = VALUES(target_role),
      preferred_language = VALUES(preferred_language),
      preferred_difficulty = VALUES(preferred_difficulty),
      selected_dsa_topics = VALUES(selected_dsa_topics)
  `, [userId, roleTitle, lang, diff, JSON.stringify(topics)]);

  return {
    target_role: roleTitle,
    preferred_language: lang,
    preferred_difficulty: diff,
    selected_dsa_topics: topics
  };
}

/**
 * Generate Dynamic Role Roadmap & Filtered Problem Recommendations
 */
async function getRoleRoadmap(userId) {
  const pref = await getUserRolePreference(userId);
  const roleObj = CAREER_ROLES.find(r => r.title.toLowerCase() === pref.target_role.toLowerCase()) || CAREER_ROLES[0];

  // 1. Fetch user solved count in problems & practice programs
  const [solvedProbs] = await pool.query(
    `SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND verdict = 'AC'`,
    [userId]
  );
  const solvedProblemIds = solvedProbs.map(p => p.problem_id);

  const [solvedPractice] = await pool.query(
    `SELECT DISTINCT program_id FROM student_practice_progress WHERE student_id = ? AND is_completed = TRUE`,
    [userId]
  );
  const solvedPracticeIds = solvedPractice.map(p => p.program_id);

  // 2. Fetch problems matched with selected DSA topics, language, & difficulty
  let problemQuery = `SELECT id, title, slug, difficulty, topics, time_limit_ms, memory_limit_mb, accepted_count, total_count FROM problems WHERE is_public = TRUE`;
  const queryParams = [];

  if (pref.preferred_difficulty && pref.preferred_difficulty !== 'All') {
    problemQuery += ` AND difficulty = ?`;
    queryParams.push(pref.preferred_difficulty);
  }

  problemQuery += ` ORDER BY CASE difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END, id ASC`;

  const [allProblems] = await pool.query(problemQuery, queryParams);

  // Filter problems by selected DSA topics
  const targetTopicsSet = new Set((pref.selected_dsa_topics || []).map(t => t.toLowerCase()));

  const matchedProblems = allProblems.map(p => {
    const pTopics = asArray(p.topics);

    const matchesTopic = pTopics.some(t => targetTopicsSet.has(t.toLowerCase())) || targetTopicsSet.size === 0;
    const isSolved = solvedProblemIds.includes(p.id);

    return {
      ...p,
      topics: pTopics,
      isSolved,
      matchesTopic
    };
  });

  // Prioritize matching topics
  const recommendedProblems = matchedProblems
    .filter(p => p.matchesTopic)
    .slice(0, 10);

  // If few match, append additional problems
  if (recommendedProblems.length < 5) {
    matchedProblems.forEach(p => {
      if (!recommendedProblems.find(r => r.id === p.id)) {
        recommendedProblems.push(p);
      }
    });
  }

  // 3. Fetch Practice Programs for Preferred Language & Topics
  const [practicePrograms] = await pool.query(`
    SELECT id, title, language, category, difficulty, description
    FROM practice_programs
    WHERE is_published = TRUE AND LOWER(language) = LOWER(?)
    ORDER BY id ASC
    LIMIT 12
  `, [pref.preferred_language]);

  const recommendedPractice = practicePrograms.map(prog => ({
    ...prog,
    isSolved: solvedPracticeIds.includes(prog.id)
  }));

  // 4. Calculate Stage Progress
  const totalRecommended = recommendedProblems.length + recommendedPractice.length;
  const totalSolvedInRole = recommendedProblems.filter(p => p.isSolved).length + recommendedPractice.filter(p => p.isSolved).length;
  const roleProgressPercent = totalRecommended > 0 ? Math.round((totalSolvedInRole / totalRecommended) * 100) : 0;

  let currentStageIndex = 0;
  if (roleProgressPercent >= 70) currentStageIndex = 2;
  else if (roleProgressPercent >= 30) currentStageIndex = 1;

  return {
    role: {
      id: roleObj.id,
      title: roleObj.title,
      icon: roleObj.icon,
      tagline: roleObj.tagline,
      description: roleObj.description,
      targetSkills: roleObj.targetSkills,
      stages: roleObj.stages
    },
    userPreferences: pref,
    progress: {
      totalTasks: totalRecommended,
      completedTasks: totalSolvedInRole,
      progressPercentage: roleProgressPercent,
      currentStage: roleObj.stages[currentStageIndex]
    },
    recommendedProblems: recommendedProblems.slice(0, 8),
    recommendedPractice
  };
}

module.exports = {
  CAREER_ROLES,
  getRoles,
  getUserRolePreference,
  setUserRolePreference,
  getRoleRoadmap
};
