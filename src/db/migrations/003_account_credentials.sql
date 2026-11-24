ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;

CREATE UNIQUE INDEX users_username_nocase ON users (username COLLATE NOCASE);
CREATE UNIQUE INDEX users_email_nocase ON users (email COLLATE NOCASE);
