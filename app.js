const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const router = require("./router");
const flash = require("connect-flash");
const markdown = require("marked");
const app = express();
const sanitizeHTML = require('sanitize-html');
const csrf = require('csurf');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api', require('./router-api'))



let sessionOptions = session({
  secret: "Js is soooooooo cool",
  store: new MongoStore({
    client: require("./db"),
    url: "mongodb://localhost:27017/",
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
});

app.use(sessionOptions);
app.use(flash());

app.use(function(req, res, next){
  //make our markdown function available from within ejs templates
  res.locals.filterUserHTML = function(content){
    return sanitizeHTML(markdown.parse(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
  }
  
  //make all error and success flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  
  //make current user id available on the req object
  if(req.session.user){
    req.visitorId = req.session.user._id;
  }
  else{
    req.visitorId = 0;
  }
  //make user session data available from with view templates
  res.locals.user = req.session.user
  next();
})



app.use(express.static("public"));

app.set("views", "views");
app.set("view engine", "ejs");

app.use(csrf());

app.use(function(req, res, next){
res.locals.csrfToken = req.csrfToken();
next()
})

app.use("/", router);

app.use(function(err, req, res, next){
if(err){
if(err.code == "EBADCSRFTOKEN"){
req.flash('errors', "Cross site request forgery detected. ");
req.session.save(() => {
  res.redirect('/');
});
}else{
res.render('404');
}
}
})

/**
* creating a server that is going to use our express app
* as its server
*
* We can add socket functionalities to this server now.
* 
* Previously our db.js asked to listen our app at port 3000. But now it will ask our "server" to listen. */

const server = require('http').createServer(app);

//socket functionalities 
const io = require('socket.io')(server);

io.use(function(socket, next){
  sessionOptions(socket.request, socket.request.res, next);
})

io.on('connection', function(socket){
 if(socket.request.session.user){ //if the user is logged in

  let user = socket.request.session.user

  socket.emit('welcome', {username: user.username, avatar: user.avatar})

  socket.on('chatMessageFromBrowser', function(data) {
    socket.broadcast.emit('chatMessageFromServer', {message: sanitizeHTML(data.message, {allowedTags: [], allowedAttributes: {}}), username: user.username, avatar: user.avatar});
  //console.log(data.message);
  })
 }
  
})
module.exports = server;
