# This is a full stack web application made using **Node.js** , **Express** , **MongoDB** , **ejs** and **Bootstrap**



## This app follows the MVC pattern since it allows us to separate code into 3 components to prevent spaghetti tangle of code.



>***Model-View-Controller is a design pattern which divides our programming logic into three parts.***
>
>>***The *Model* consists of our business logic whereas the controller controls the data flow into the model object while *View* represents the visualization of the data.***

##### This is how it looks at first glance:-
![es1](https://user-images.githubusercontent.com/85080181/151331405-d5a20d64-8684-4586-8cea-fd0fa3b234f1.PNG)

> ### User registration validation is taken taken care of in the User model.
> 
> - For validation checks, the validator package has been used.
> - If a username is valid, then it is checked inside the database if it is already taken. 
> - To do that, the findOne() method is used which returns a promise. To make sure that Javascript waits till our promise resolves or rejects, async-await syntax has been used.
> - In order to hash the password entered by users, *bcrypt.js* library is used.
> - To hash the email, the *md5* library is used.
> - Image displaying the hashed passwords in MongoDB:-
> <img width="387" alt="mongo" src="https://user-images.githubusercontent.com/85080181/152190429-0158f81c-3595-4c61-a642-87d8de9feac1.PNG">
> 
> - If there are no validation errors in the registration form, then the user data is saved into the database.

Note: *Both client side and server side validation has been performed to take extra care that no malicious users can register.*

## Enabling Sessions in our application

+ HTTP requests are stateless. Each request is ran without any knowledge about the requests that ran before it.
+ So, in order for the server to know that after a successful login, the subsequent requests are from the same user, we use session-management.
+ The package *express-session* is installed to do so.

> Note: *Logout*
> - A logout route has been created in order to safely log a user out on clicking the Sign out button.
> - To do this we use the espression session destroy() method -  After that the user is redirected to the home page.




1) On successfully logging in they can view all the posts from the users that they follow.
2) Users can edit and delete their own posts.
3) They can follow and unfollow other users.
4) They can chat with all the users that are logged in.

![es3](https://user-images.githubusercontent.com/85080181/151332924-cb45ba71-706c-4075-b9e1-f824d1b31f45.PNG)


**Video:-** 


https://user-images.githubusercontent.com/85080181/151333389-6ab4910e-e60e-402a-9b50-119ddb69ebc7.mp4



