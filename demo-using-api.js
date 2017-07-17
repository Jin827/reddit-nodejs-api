// load the mysql library
var mysql = require('promise-mysql');

// create a connection to our Cloud9 server
var connection = mysql.createPool({
    host     : 'localhost',
    user     : 'jin827', 
    password : '',
    database: 'reddit',
    connectionLimit: 10
});

// load our API and pass it the connection
var RedditAPI = require('./reddit.js');

var myReddit = new RedditAPI(connection);

// We call this function to create a new user to test our API
// The function will return the newly created user's ID in the callback



// myReddit.createUser({
//     username: 'PM_ME_CUTES5',
//     password: 'abc123'
// })
//     .then(newUserId => {
//         // Now that we have a user ID, we can use it to create a new post
//         // Each post should be associated with a user ID
//         console.log('New user created! ID=' + newUserId);

//         return myReddit.createPost({
//             title: 'Hello Reddit! This is my first post',
//             url: 'http://www.digg.com',
//             userId: newUserId
//         })
//     })
//     .then(newPostId => {
//         // If we reach that part of the code, then we have a new post. We can print the ID
//         console.log('New post created! ID=' + newPostId);
//     })
//     .catch(error => {
//         console.log(error.stack);
//     });
    

// myReddit.createPost({
//     userId: 1,
//     title:"Mary is the best TA ever!",
//     srl:"https://www.reddit.com/",
//     subredditId:1
// })
// .then(result => console.log('createPost result', result))
// .catch(err => {
//     console.log(err, "ERROR")
//     return err
// });


// myReddit.getAllPosts()
//     .then( result => {
//     console.log('Give me all the posts =>', result)});


// myReddit.createSubreddits({name: "testing9", description: "all about hyojin"})
//     .then(newId => {
//         console.log('New subreddit ID=' + newId)
//     })
//     .catch(err =>{
//         console.log(err);
//     });
    
   
// myReddit.getAllSubreddits()
//     .then( result => {
//     console.log('New subreddits in order by created time =', result)});
    
// myReddit.createVote({userId:6, postId:8, voteDirection:-1})
// .then(function(){ return connection.end() })
// .catch( err => console.log(err))



    
