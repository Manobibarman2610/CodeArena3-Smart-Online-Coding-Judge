-- ════════════════════════════════════════════════════
-- CODE ARENA — Comprehensive MySQL Database Schema
-- ════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS codearena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codearena;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ai_analyses;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS leaderboard_global;
DROP TABLE IF EXISTS user_activity;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS contest_participants;
DROP TABLE IF EXISTS contest_problems;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS user_hints;
DROP TABLE IF EXISTS hints;
DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ── 1. USERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('student','faculty','admin') DEFAULT 'student',
  institution   VARCHAR(200),
  rating        INT  DEFAULT 1200,
  streak        INT  DEFAULT 0,
  last_active   DATE,
  avatar_url    VARCHAR(500),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── 2. PROBLEMS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS problems (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  slug            VARCHAR(200) UNIQUE NOT NULL,
  difficulty      ENUM('Easy','Medium','Hard','Expert') NOT NULL,
  description     MEDIUMTEXT   NOT NULL,
  constraints     TEXT,
  sample_input    TEXT,
  sample_output   TEXT,
  time_limit_ms   INT  DEFAULT 2000,
  memory_limit_mb INT  DEFAULT 256,
  topics          JSON,
  starter_code    JSON,
  created_by      INT,
  is_public       BOOLEAN DEFAULT TRUE,
  accepted_count  INT DEFAULT 0,
  total_count     INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 3. TEST CASES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_cases (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  problem_id  INT NOT NULL,
  input       TEXT NOT NULL,
  output      TEXT NOT NULL,
  is_sample   BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 4. HINTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hints (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  problem_id     INT NOT NULL,
  hint_number    INT NOT NULL,
  title          VARCHAR(200),
  content        TEXT NOT NULL,
  penalty_points INT DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prob_hint (problem_id, hint_number),
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 5. USER UNLOCKED HINTS ───────────────────────────
CREATE TABLE IF NOT EXISTS user_hints (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  problem_id  INT NOT NULL,
  hint_id     INT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_hint (user_id, hint_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (hint_id)    REFERENCES hints(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 6. CONTESTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS contests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  type        ENUM('Sprint','Grand Arena','Campus League') NOT NULL,
  description TEXT,
  start_time  DATETIME NOT NULL,
  end_time    DATETIME NOT NULL,
  created_by  INT,
  is_public   BOOLEAN DEFAULT TRUE,
  status      ENUM('upcoming','live','ended') DEFAULT 'upcoming',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 7. CONTEST PROBLEMS ──────────────────────────────
CREATE TABLE IF NOT EXISTS contest_problems (
  contest_id  INT NOT NULL,
  problem_id  INT NOT NULL,
  points      INT DEFAULT 100,
  order_index INT DEFAULT 0,
  PRIMARY KEY (contest_id, problem_id),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 8. CONTEST PARTICIPANTS ───────────────────────────
CREATE TABLE IF NOT EXISTS contest_participants (
  contest_id    INT NOT NULL,
  user_id       INT NOT NULL,
  score         INT DEFAULT 0,
  `rank`        INT,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (contest_id, user_id),
  FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 9. SUBMISSIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL,
  problem_id         INT NOT NULL,
  contest_id         INT,
  language           VARCHAR(30)  NOT NULL,
  code               MEDIUMTEXT   NOT NULL,
  verdict            ENUM('AC','WA','TLE','MLE','RE','CE','Pending') DEFAULT 'Pending',
  runtime_ms         INT,
  memory_mb          FLOAT,
  score              INT DEFAULT 0,
  passed_test_cases  INT DEFAULT 0,
  total_test_cases   INT DEFAULT 0,
  error_output       TEXT,
  compiler_output    TEXT,
  judge_token        VARCHAR(100),
  submitted_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (problem_id)  REFERENCES problems(id)  ON DELETE CASCADE,
  FOREIGN KEY (contest_id)  REFERENCES contests(id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 10. ASSIGNMENTS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  faculty_id  INT NOT NULL,
  problem_ids JSON NOT NULL,
  deadline    DATETIME NOT NULL,
  class_group VARCHAR(100),
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 11. USER ACTIVITY (Heatmap) ──────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
  user_id        INT  NOT NULL,
  activity_date  DATE NOT NULL,
  submissions    INT  DEFAULT 0,
  PRIMARY KEY (user_id, activity_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 12. GLOBAL LEADERBOARD ───────────────────────────
CREATE TABLE IF NOT EXISTS leaderboard_global (
  user_id          INT PRIMARY KEY,
  rating           INT DEFAULT 1200,
  problems_solved  INT DEFAULT 0,
  contests_entered INT DEFAULT 0,
  `rank`           INT,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 13. NOTIFICATIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  link       VARCHAR(255),
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 14. ACHIEVEMENTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(50) UNIQUE NOT NULL,
  title       VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon        VARCHAR(50) NOT NULL,
  requirement VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- ── 15. USER ACHIEVEMENTS ────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_ach (user_id, achievement_id),
  FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 16. AI ANALYSES & FEEDBACK ───────────────────────
CREATE TABLE IF NOT EXISTS ai_analyses (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  problem_id     INT NOT NULL,
  submission_id  INT,
  language       VARCHAR(30) NOT NULL,
  code           MEDIUMTEXT NOT NULL,
  analysis_json  JSON NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (problem_id)    REFERENCES problems(id)    ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── 17. USER ROLE PREFERENCES (Personalized Role-Based Practice) ──
CREATE TABLE IF NOT EXISTS user_role_preferences (
  user_id              INT PRIMARY KEY,
  target_role          VARCHAR(100) DEFAULT 'Software Developer',
  preferred_language   VARCHAR(50)  DEFAULT 'cpp',
  preferred_difficulty VARCHAR(50)  DEFAULT 'All',
  selected_dsa_topics  JSON,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 18. PRACTICE PROGRAMS ────────────────────────────
CREATE TABLE IF NOT EXISTS practice_programs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  slug             VARCHAR(220) NOT NULL UNIQUE,
  language         VARCHAR(30) NOT NULL,
  category         VARCHAR(100) NOT NULL,
  difficulty       ENUM('Easy','Medium','Hard','Expert') NOT NULL,
  description      MEDIUMTEXT NOT NULL,
  input_format     TEXT,
  output_format    TEXT,
  constraints      TEXT,
  sample_input     TEXT,
  sample_output    TEXT,
  explanation      TEXT,
  starter_code     MEDIUMTEXT,
  hints            JSON,
  test_cases       JSON,
  time_limit_ms    INT DEFAULT 2000,
  memory_limit_mb  INT DEFAULT 256,
  created_by       INT,
  is_published     BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_practice_language_published (language, is_published)
) ENGINE=InnoDB;

-- ── 19. STUDENT PRACTICE PROGRESS ─────────────────────
CREATE TABLE IF NOT EXISTS student_practice_progress (
  student_id        INT NOT NULL,
  program_id        INT NOT NULL,
  language          VARCHAR(30) NOT NULL,
  attempts          INT DEFAULT 0,
  is_completed      BOOLEAN DEFAULT FALSE,
  last_verdict      VARCHAR(30),
  best_runtime_ms   INT,
  score             INT DEFAULT 0,
  last_attempted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (student_id, program_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES practice_programs(id) ON DELETE CASCADE,
  INDEX idx_practice_progress_program (program_id),
  INDEX idx_practice_progress_student_language (student_id, language)
) ENGINE=InnoDB;

-- ── 20. STUDENT TOPIC SKILLS ─────────────────────────
CREATE TABLE IF NOT EXISTS student_topic_skills (
  student_id      INT NOT NULL,
  topic           VARCHAR(100) NOT NULL,
  mastery_score   INT DEFAULT 0,
  status          VARCHAR(30) NOT NULL DEFAULT 'needs_practice',
  solved_count    INT DEFAULT 0,
  attempted_count INT DEFAULT 0,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, topic),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── 21. STUDENT LEARNING PATHS ───────────────────────
CREATE TABLE IF NOT EXISTS student_learning_paths (
  student_id         INT PRIMARY KEY,
  current_level      VARCHAR(50) DEFAULT 'Beginner',
  level_score        INT DEFAULT 0,
  recommended_topics JSON,
  strong_topics      JSON,
  weak_topics        JSON,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── INDEXES for performance ──────────────────────────
CREATE INDEX idx_submissions_user    ON submissions(user_id);
CREATE INDEX idx_submissions_problem ON submissions(problem_id);
CREATE INDEX idx_submissions_contest ON submissions(contest_id);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_public     ON problems(is_public);
CREATE INDEX idx_contests_status     ON contests(status);
CREATE INDEX idx_activity_user_date  ON user_activity(user_id, activity_date);
CREATE INDEX idx_notif_user_unread   ON notifications(user_id, is_read);
