const postsCollection = require('../db').db().collection("posts");
const followsCollection = require('../db').db().collection("follows");
const ObjectId = require('mongodb').ObjectId
const User = require('./User');
const sanitizeHTML = require('sanitize-html');

let Post = function(data, userid, requestedPostId){
    this.data = data;
    this.errors= [];
    //if there are validation problems we can just push the message into this array
    this.userid = userid;
    this.requestedPostId = requestedPostId;
}

Post.prototype.cleanUp = function(){
    if(typeof (this.data.title) != "string"){
        this.data.title = "";
    }
    if(typeof (this.data.body) != "string"){
        this.data.body = "";
    }
    
    //get rid of any bogus properties
    this.data={
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: []}),
        body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: []}),
        createdDate: new Date(), 
        author: ObjectId(this.userid)
    }
}
Post.prototype.validate = function(){
    //title and body must not be empty
    if(this.data.title == ""){this.errors.push("You must provide a title!")}
    if(this.data.body == ""){this.errors.push("You must provide post content!")}
}

Post.prototype.create = function(){
    //within this we'd call cleanUp and validate
    
    
    //this function will return a promise
    return new Promise((resolve, reject) => {
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
            //if the errors array is empty then save the document in the DB
            postsCollection.insertOne(this.data).then((info) => {
                resolve(info.insertedId)
            }).catch(() => {
                this.errors.push("Please try again later.");
                reject(this.errors);
            })
            
        }else{
            
            reject(this.errors);
        }
    })
}

Post.prototype.update = function(){
    return new Promise(async (resolve, reject) => {
        //first we need to find the relevant post document in the database
    

        try{
            let post = await Post.findSingleById(this.requestedPostId, this.userid);
            if(post.isVisitorOwner)
            {
               
            let status = await this.actuallyUpdate();
              resolve(status);
            }
            else{
              reject();
            }
        }catch{
         reject();
        }
    })
}

Post.prototype.actuallyUpdate = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
        await postsCollection.findOneAndUpdate({_id: new ObjectId(this.requestedPostId)}, {$set: {title: this.data.title, body: this.data.body}});
        /**1)we're interested in a document with the _id 
         * 2) this.requestedPostId is the document that we want to find
         * 3) $set tells us what we want to do with the document that we just found. Here we are changing the title and body
        */
        resolve("success");
        }else{
        resolve("failure");
        }
    })
}


Post.reusablePostQuery= function(uniqueOperations, visitorId, finalOperations =[]){
    return new Promise(async function(resolve, reject){
       let aggOperations = uniqueOperations.concat([
           
        {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
        {$project: {title: 1, body: 1, createdDate: 1, authorId: "$author", author: {$arrayElemAt: ["$authorDocument", 0]}} }
    ]).concat(finalOperations)

        let posts = await postsCollection.aggregate(aggOperations).toArray()
        //aggregate lets us run multiple operations
        //first operation: does _id of our DB match the requested id coming from our controller
        /*second op: the document that we want to look up should be pulled from the users collection in mongodb, 
        the field from within the current post item that we wanna perform the match on, is the author field*/ 
    
    
        //clean up author property in each post object
    
        posts = posts.map(function(post){ 
            post.isVisitorOwner= post.authorId.equals(visitorId);
            post.authorId = undefined;
            post.author ={
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
    
       resolve(posts);
    })
}

Post.findSingleById= function(id, visitorId){
return new Promise(async function(resolve, reject){
    if(typeof(id) != 'string' || !ObjectId.isValid(id)){
        //if the address is not a simple string of text or not a valid mongodb id, do this

        reject();
        return
    }
   let posts = await Post.reusablePostQuery([
       {$match: {_id: new ObjectId(id)}}
   ], visitorId)

    if(posts.length){ 
        console.log(posts[0]);
        resolve(posts[0]);
        //return the first item in that array
    }else{
        reject();
    }
})
}

Post.findByAuthorId = function(authorId){
return Post.reusablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
])
}


Post.delete = function(postIdToDelete, currentUserId){
    return new Promise( async (resolve, reject) => {
try {
let post = await Post.findSingleById(postIdToDelete, currentUserId);
if(post.isVisitorOwner){
await postsCollection.deleteOne({_id: new ObjectId(postIdToDelete)});
resolve();
}else{
    reject();
}
}catch{
reject();
}
})
}

Post.search = function(searchTerm){
return new Promise(async (resolve, reject) => {
if(typeof(searchTerm) == "string") {
    let posts = await Post.reusablePostQuery([
        {
            $match: {$text: {$search: searchTerm}}
        }], undefined, [{ $sort: {score: {$meta: "textScore"}}}
    ]);
    resolve(posts);
}
else{
reject();
}
})
}


Post.countPostsByAuthor = function(id){
return new Promise(async (resolve, reject) => {
let postCount= await postsCollection.countDocuments({author: id});
resolve(postCount);
})
}


Post.getFeed = async function(id){

    //create an array of the user ids that the current user follows
    let followedUsers = await followsCollection.find({authorId: new ObjectId(id)}).toArray()
    followedUsers = followedUsers.map(function(followDoc){

        return followDoc.followedId
    })
    //look for posts where the author is in the above array of followed users
    return Post.reusablePostQuery([
        {$match: {author: {$in: followedUsers}}},
        {$sort: {createdDate: -1}}
    ])
}


module.exports = Post;