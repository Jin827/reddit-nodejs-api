-- This creates the users table. The username field is constrained to unique
-- values only, by using a UNIQUE KEY on that column
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(60) NOT NULL, -- why 60??? ask me :)
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  UNIQUE KEY username (username)
);

-- This creates the posts table. The userId column references the id column of
-- users. If a user is deleted, the corresponding posts' userIds will be set NULL.
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) DEFAULT NULL,
  url VARCHAR(2000) DEFAULT NULL,
  userId INT DEFAULT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  KEY userId (userId), -- why did we add this here? ask me :)
  CONSTRAINT validUser FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
  
);

ALTER TABLE posts ADD subredditId INT;

CREATE TABLE subreddits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) UNIQUE,
  description VARCHAR(200),
  createdAt DATETIME,  
  updatedAt DATETIME 
);

ALTER TABLE posts ADD CONSTRAINT validId FOREIGN KEY (subredditId) REFERENCES subreddits (id); 

CREATE TABLE votes (
  userId INT NOT NULL,
  postId INT NOT NULL,
  voteDirection TINYINT,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  PRIMARY KEY (userId, postId), 
  FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE, 
  FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE 
);
