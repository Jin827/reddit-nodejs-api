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
        console.log(post, "each post")
        if (post.subredditId === false){
            throw new Error("subredditId is not defined")
        }
        return this.conn.query(`
            INSERT INTO posts (userId, title, url, subredditId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [ post.userId, post.title, post.url, post.subredditId ]
        )
            .then( function(data){
                //console.log(data)
                return data.insertId;
            });
    }
            
// placeholder (?) :
// - No need to concatenate strings together for every parameter in the query
// - Make sure to properly escape any given string 

    getAllPosts() {
        
        return this.conn.query(`
            SELECT p.id, p.title, p.url, p.userId, p.createdAt, p.updatedAt, p.subredditId, 
                   u.id, u.username, u.createdAt AS userCreate, u.updatedAt AS userUpdate,  
                   s.id, s.name, s.description, s.createdAt AS subCreate, s.updatedAt AS subUpdate,
                   v.postId, v.voteDirection, SUM(v.voteDirection) AS voteScore
            FROM posts p
            JOIN users u ON u.id = p.userId
            JOIN subreddits s ON s.id = p.subredditId
            JOIN votes v ON v.postId = p.id
            GROUP BY v.postId
            ORDER BY voteScore DESC
            LIMIT 25
        `) 
        .then(function(data){
                console.log(data)
                return data.map( (row) => {
                return { 
                        id: row.id,
                        title: row.title,
                        url: row.url,
                        user: {
                            id: row.userId,
                            username: row.username,
                            createdAt: row.userCreate,
                            updatedAt: row.userUpdate
                            },
                        subredditId: {
                            id: row.subredditId,
                            name: row.name,
                            description: row.description,
                            createdAt: row.subCreate,
                            updatedAt: row.subUpdate
                        },
                        
                        voteScore: row.voteScore,
                        createdAt: row.createdAt,
                        updatedAt: row.updatedAt
                        }
                })
        })
    }
    

    
   createSubreddits(subreddit) {
       //console.log(subreddit, "subreddit info")
       
       return this.conn.query(`
       INSERT INTO subreddits ( name, description, createdAt, updatedAt )
       VALUES ( ?, ?, NOW(), NOW() )`,
        [ subreddit.name, subreddit.description ]
       )
       .then(result => {
            // console.log("create subreddit result =>", result)
            return result.insertId;
        })
        .catch(error => {
               
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error("duplicate subreddits not allowed");
            }
            else {
                throw error;
            }
        });
       
   }
   
   
   
   
   getAllSubreddits(){
       
       return this.conn.query(`
       SELECT s.id, s.name, s.description, s.createdAt, s.updatedAt
       FROM subreddits s
       ORDER BY createdAt DESC
       `)
       .then( function(data){ 
           console.log(data)
           return data.map( row => {
                           return { id: row.id,
                                    name: row.name,
                                    description: row.description,
                                    createdAt: row.createdAt,
                                    updatedAt: row.updatedAt
                                   }  
                })
            }
       )
   }
    


    createVote(vote){
        
        if (vote.voteDirection !== 1 && vote.voteDirection !== 0 && vote.voteDirection !== -1 ){
                throw new Error("vote is not defined")
        }
         
         
        return this.conn.query(`
            INSERT INTO votes ( postId, userId, voteDirection, createdAt, updatedAt)
            VALUE ( ?, ?, ?, NOW(), NOW() )
            ON DUPLICATE KEY UPDATE voteDirection=?;`,
            [ vote.postId, vote.userId, vote.voteDirection, vote.voteDirection ]
         )
         
         
        
        
    }
    
}

module.exports = RedditAPI;


// ON DUPLICATE KEY UPDATE : a row is inserted that would cause a duplicate value in a UNIQUE index or PRIMARY KEY
        


