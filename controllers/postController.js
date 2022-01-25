const Post = require('../models/Post');
const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey(process.env.SENDGRIDAPIKEY)

exports.viewCreateScreen = function(req, res){
    res.render("create-post");
}

exports.create = function(req, res){
    //whatever the user types will be saved
    let post = new Post(req.body, req.session.user._id);
    post.create().then(function(newId){
        sendgrid.send({
            to: 'spiiritualcorn@gmail.com',
            from: 'test@test.com',
            subject: "Congrats on craeting a new post!",
            text: "You did a great job of creating a post",
            html: 'You did a <strong>great</strong> job of creating a post'
        })
     req.flash("success", "New post successfully created.");
     req.session.save(() => res.redirect(`/post/${newId}`))
    }).catch(function(errors){
        errors.forEach((error) => req.flash("errors", error));
        req.session.save(()  => res.redirect("/create-post"));
    });
    
}

exports.apiCreate = function(req, res){
  
    let post = new Post(req.body, req.apiUser._id);
    post.create().then(function(newId){
     res.json("congrats");
    }).catch(function(errors){
       res.json(errors)
    });
    
}



exports.viewSingle = async function(req, res){
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId);
        res.render('single-post-screen', {post: post, title: post.title});
    }catch{
        //if someone types a wrong url then reject the promise
        res.render('404');
    }
}

exports.viewEditScreen = async function(req, res){
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        if (post.isVisitorOwner) {
          res.render("edit-post", {post: post})
        } else {
          req.flash("errors", "You do not have permission to perform that action.")
          req.session.save(() => res.redirect("/"))
        }
      } catch {
        res.render("404")
      }
}

exports.edit = function(req, res){
    let post = new Post(req.body, req.visitorId, req.params.id);
    post.update().then((status) => {
        
        //if the promise is successful A) post was successfully updated in the db 
        //B) there is a validation error even though own has permission to modify the post
        if(status =="success"){
            //success in db so we redirect to the edit screen with a green success message
            req.flash("success", "Congrats! Post successfully Updated");
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
            
            
        }else{
            post.errors.forEach(function(error){
                req.flash("errors", error)
            })
            
            //saving the session data nd redirecting 
            
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
        
    }).catch(() => {
        //a post with the requested id doens't exist
        //or if the current vistor isn't the owner of the current post
        req.flash("errors", "You do not have permission to perform that action");
        
        //saving the session data and redirecting back to the homepage
        req.session.save(function(){
            res.redirect('/');
        })
    });
}

exports.delete = function(req, res)
{
Post.delete(req.params.id, req.visitorId).then(() => {
req.flash("success" , "Post successfully deleted");
req.session.save(() => {
    res.redirect(`/profile/${req.session.user.username}`);
})
}).catch(() => {
req.flash("errors", "You do not have permission to perform that action");
res.session.save(() => res.redirect("/"));
})
}


exports.apiDelete = function(req, res)
{
Post.delete(req.params.id, req.apiUser._id).then(() => {
res.json("success :)")
}).catch(() => {
res.json("You do not have permission to perform that action :(")
})
}

exports.search = function(req, res){
Post.search(req.body.searchTerm).then(posts=> {
    res.json(posts);
}).catch(() => {
 res.json([]);
});
}