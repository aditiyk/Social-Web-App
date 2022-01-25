const usersCollection = require("../db").db().collection("users");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const md5 = require('md5');
const { resolveInclude } = require("ejs");

let User = function (data, getAvatar) {
  this.data = data;
  this.errors = [];
  if(getAvatar == undefined ){getAvatar = false}
  if(getAvatar){this.getAvatar()}
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }
  
  //get rid of any useless properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function(){
  return new Promise(async  (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username");
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
      ) {
        this.errors.push("Username can only contain letters and numbers");
      }
      if (!validator.isEmail(this.data.email)) {
        this.errors.push("You must provide a valid email");
      }
      if (this.data.password == "") {
        this.errors.push("You must provide a password");
      }
      if (this.data.password.length > 0 && this.data.password.length < 12) {
        this.errors.push("password must be of atleast 12 characters");
      }
      if (this.data.password.length > 50) {
        this.errors.push("password cannot exceed 50 characters");
      }
      if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push("username must be of atleast 3 characters");
      }
      if (this.data.username.length > 30) {
        this.errors.push("username cannot exceed 30 characters");
      }
      
      //Only if usernsame is valid, then check to see if it is already taken
      if(this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
        //communicating with the db is an asynchronous action and it is guarenteed that it won't be able to complete
        //before JS begins the next operation 
        //BUT findOne method retuens a promise!
        //so JS waits until the promise resolves or rejects
        let usernameExists = await usersCollection.findOne({username: this.data.username})
        if(usernameExists){this.errors.push("That username is already taken!")}
      }
      //Only is email is valid then check to see if it is taken
      if(validator.isEmail(this.data.email)){
        
        let emailExists = await usersCollection.findOne({email: this.data.email})
        if(emailExists){this.errors.push("That email is already taken!")}
      }
      
      resolve()
    })
  }
  
  User.prototype.login = function () {
    return new Promise((resolve, reject) => {
      this.cleanUp();
      usersCollection
      .findOne({ username: this.data.username })
      .then((attempedUser) => {
        if (
          attempedUser &&
          bcrypt.compareSync(this.data.password, attempedUser.password)
          ) {
            this.data =attempedUser
            this.getAvatar()
            resolve("wohoooo");
            //console.log("congratulations right password & username");
          } else {
            // console.log("invalid username/password");
            reject("invalid");
          }
        })
        .catch(function () {
          reject("please try again later");
        });
        //since we know that findOne results a promise so we write the above syntax
      });
    };
    
    User.prototype.register = function(){
      return new Promise (async (resolve, reject) => {
        //validate user data
        this.cleanUp();
        await this.validate(); //we just added asynchronous action to the validate function 
        //so we must let it complete before JS moves onto the if block
        /**WE use await keyword so that all of our validation work completes before moving on to the if block */
        
        //if there are no validation errors save the data to a database
        if (!this.errors.length) {
          //hash users password
          let salt = bcrypt.genSaltSync(10);
          this.data.password = bcrypt.hashSync(this.data.password, salt);
          await usersCollection.insertOne(this.data);
          this.getAvatar()
          resolve();
        }
        
        else{
          reject(this.errors)
        }
      })
    }
    
    User.prototype.getAvatar = function(){
      this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
      //we need to hash the email using the md5 library
    }
    
    User.findByUsername = function(username){
      return new Promise(function(resolve, reject){
        if(typeof(username) != 'string'){
          reject();
          return;
          //return to prevent the futher execution of our function
        }
        usersCollection.findOne({username: username}).then(function(userDoc){
          if(userDoc){
            userDoc = new User(userDoc, true);
            userDoc = {
              _id: userDoc.data._id,
              username: userDoc.data.username, 
              avatar: userDoc.avatar
              
            }
            resolve(userDoc);
          }else{
            reject();
          }
        }).catch(function(){
          reject();
          
        })
        
      })
    }

    User.doesEmailExist = function(email){
      return new Promise(async function(resolve, reject){
       if(typeof(email) != "string"){
         resolve(false);
         return;
       }

       let user = await usersCollection.findOne({email: email});
       if(user){
         resolve(true)
       }else{
        resolve(false);
       }
      } )
    }
    
    module.exports = User;
    