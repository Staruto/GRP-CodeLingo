CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  created_at INTEGER NOT NULL
) STRICT;

CREATE TABLE problems (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('Predict Output', 'Find the Error')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  statement_markdown TEXT NOT NULL,
  example_code TEXT NOT NULL,
  code_language TEXT NOT NULL
) STRICT;

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
) STRICT;

CREATE TABLE problem_tags (
  problem_id INTEGER NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags (id),
  PRIMARY KEY (problem_id, tag_id)
) STRICT;

CREATE TABLE problem_options (
  problem_id INTEGER NOT NULL REFERENCES problems (id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  PRIMARY KEY (problem_id, option_key),
  UNIQUE (problem_id, position)
) STRICT;

CREATE TABLE problem_answers (
  problem_id INTEGER PRIMARY KEY REFERENCES problems (id) ON DELETE CASCADE,
  expected_output TEXT,
  correct_option_key TEXT,
  CHECK ((expected_output IS NULL) <> (correct_option_key IS NULL)),
  FOREIGN KEY (problem_id, correct_option_key) REFERENCES problem_options (problem_id, option_key)
) STRICT;

CREATE TABLE verdicts (
  code TEXT PRIMARY KEY
) STRICT;

INSERT INTO verdicts (code) VALUES ('AC'), ('WA');

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  problem_id INTEGER NOT NULL REFERENCES problems (id) ON DELETE RESTRICT,
  verdict TEXT NOT NULL REFERENCES verdicts (code) ON DELETE RESTRICT,
  submitted_at INTEGER NOT NULL,
  submitted_text TEXT,
  selected_option_key TEXT,
  CHECK ((submitted_text IS NULL) <> (selected_option_key IS NULL)),
  FOREIGN KEY (problem_id, selected_option_key)
    REFERENCES problem_options (problem_id, option_key) ON DELETE RESTRICT
) STRICT;

CREATE TRIGGER submissions_no_update
BEFORE UPDATE ON submissions
BEGIN
  SELECT RAISE(ABORT, 'Submissions are immutable');
END;

CREATE TRIGGER submissions_no_delete
BEFORE DELETE ON submissions
BEGIN
  SELECT RAISE(ABORT, 'Submissions are immutable');
END;

CREATE INDEX submissions_by_user_problem_verdict_time
ON submissions (user_id, problem_id, verdict, submitted_at);

CREATE INDEX submissions_by_user_time
ON submissions (user_id, submitted_at);
