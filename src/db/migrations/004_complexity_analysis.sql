CREATE TABLE problems_new (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('Predict Output', 'Find the Error', 'Complexity Analysis')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  statement_markdown TEXT NOT NULL,
  example_code TEXT NOT NULL,
  code_language TEXT NOT NULL
) STRICT;

INSERT INTO problems_new (id, slug, title, question_type, difficulty, statement_markdown, example_code, code_language)
SELECT id, slug, title, question_type, difficulty, statement_markdown, example_code, code_language
FROM problems;

DROP TABLE problems;
ALTER TABLE problems_new RENAME TO problems;
