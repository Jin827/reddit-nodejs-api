"use strict";
var bcrypt = require('bcrypt-as-promised');
var HASH_ROUNDS = 10;

class RedditAPI {
    constructor(conn) {
        this.conn = conn;
    }

    createUser(user) {
        /*
        first we have to hash the password. we will learn about hashing next week.
        the goal of hashing is to store a digested version of the password from which
        it is infeasible to recover the original password, but which can still be used
        to assess with great confidence whether a provided password is the correct one or not
         */
        return bcrypt.hash(user.password, HASH_ROUNDS)
            .then(hashedPassword => {
                return this.conn.query('INSERT INTO users (username,password, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())', [user.username, hashedPassword]);
            })
            .then(result => {
                return result.insertId;
            })
            .catch(error => {
                // Special error handling for duplicate entry
                if (error.code === 'ER_DUP_ENTRY') {
                    throw new Error('A user with this username already exists');
                }
                else {
                    throw error;
                }
            });
    }

    createPost(post) {
        return this.conn.query(
            `
            INSERT INTO posts (userId, title, url, createdAt, updatedAt)
            VALUES (?, ?, ?, NOW(), NOW())`,
            [post.userId, post.title, post.url]
        )
            .then(result => {
                return result.insertId;
            });
    }

    getAllPosts() {
        
        return this.conn.query(
            `
            SELECT id, title, url, userId, createdAt, updatedAt
            FROM posts
            ORDER BY createdAt DESC
            LIMIT 25
            JOIN users NOT IN (password)
            ON users.id = posts.userId
            WHERE posts.userId
        `) 
        
        .then (function(data){
            this.map(row => {
                if (row.id === row.userId) {
                    return this.conn.query}
            })
        })
        
    }
}

module.exports = RedditAPI;


