//To fill our database with some real Reddit data

var request = require('request-promise');
var mysql = require('promise-mysql');
var RedditAPI = require('./reddit');

function getSubreddits() {
    return request("https://www.reddit.com/.json")
        .then(response => {
            
            var result = JSON.parse(response)
            
             // console.log('data result', JSON.stringify(result.data.children, null, 4))
            
            return result.data.children.map(inputData => { 
                // console.log(inputData.data.subreddit)
                return inputData.data.subreddit
                
            })
        });
}

// A list of subreddit names 
//[ 'todayilearned',
//   'sadcringe',
//   'sports',
//   'BlackPeopleTwitter',
//   'OldSchoolCool',
//   'aww',
//   'mildlyinteresting',
//   'creepy',
//   'smashbros',
//   'gifs',
//   'pics',
//   'funny',
//   'PoliticalHumor',
//   'Eyebleach',
//   'marvelstudios',
//   'instant_regret',
//   'DesignPorn',
//   'explainlikeimfive',
//   'quityourbullshit',
//   'gaming',
//   'StarWars',
//   'oldpeoplefacebook',
//   'whitepeoplegifs',
//   'movies',
//   'food' ]


function getPostsForSubreddit(subredditName) {
    var url = 'https://www.reddit.com/r/' + subredditName + '.json?limit=50'
    return request(url)
        .then(
            response => {
                // console.log(response)
                var result = JSON.parse(response)
                
               // console.log(result) // Cannot read property 'children' of undefined
               // console.log(result.data.children)
               
                return result.data.children
                
                    .filter( inputData => {
                            return !inputData.data.is_self 
                            
                        }
                        
                    ) // Use .filter to remove self-posts
                    .map( inputData => {
                        var mappedObj = {
                                         title: inputData.data.title,
                                         url: inputData.data.url,
                                         user: inputData.data.author
                                        }
                            // console.log('mapped data', JSON.stringify(mappedObj, null, 4))
                        return mappedObj
                        
                    }) // Use .map to return title/url/user objects only

            }
        )
};





function crawl() {
    // create a connection to the DB
    var connection = mysql.createPool({
        host     : 'localhost',
        user     : 'jin827',
        password : '',
        database: 'reddit',
        connectionLimit: 10
    });

    // create a RedditAPI object. we will use it to insert new data
    var myReddit = new RedditAPI(connection);

    // This object will be used as a dictionary from usernames to user IDs
    var users = {};

    /*
    Crawling will go as follows:

        1. Get a list of popular subreddits
        2. Loop thru each subreddit and:
            a. Use the `createSubreddit` function to create it in your database
            b. When the creation succeeds, you will get the new subreddit's ID
            c. Call getPostsForSubreddit with the subreddit's name
            d. Loop thru each post and:
                i. Create the user associated with the post if it doesn't exist
                2. Create the post using the subreddit Id, userId, title and url
     */

       //Get a list of subreddits
    getSubreddits()
        .then(subredditNames => {
            subredditNames.forEach(subredditName => {
                var subId;
                myReddit.createSubreddits({name: subredditName, description: subredditName})
                    .then(subredditId => {
                        subId = subredditId;
                        return getPostsForSubreddit(subredditName)
                    })
                    .then(posts => {
                        posts.forEach(post => {
                            var userIdPromise;
                            if (users[post.user]) {
                                userIdPromise = Promise.resolve(users[post.user]);
                            }
                            else {
                                userIdPromise = myReddit.createUser({
                                    username: post.user,
                                    password: 'abc123'
                                })
                            
                            .catch(function(err) {
                                    console.log(err);
                                    return users[post.user];
                                })
                            }

                            userIdPromise.then(userId => {
                                users[post.user] = userId;
                                return myReddit.createPost({
                                    subredditId: subId,
                                    userId: userId,
                                    title: post.title,
                                    url: post.url
                                })
                        })
                    })
            })
        })
    })
        
    .catch( err => { 
       console.log(err, "ERROR") 
    })
};  


//execute crawl and check your database to see if all the data got imported

// getSubreddits();

// getPostsForSubreddit('gaming'); // why it doesn't work with subredditName ?

 crawl();