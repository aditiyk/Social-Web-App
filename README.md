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
> - To do this we use the espression session destroy() method 
>   - It deletes the session in the database. 
>   -  After that the user is redirected to the home page.
> - If there is a failed login, temporary flash messages are shown and user is redirected back to the home page.

## Viewing a post that the user created

> + A new route is created to do this in our router.js
> + To find a document with the requested id, we use MongoDB ObjectId() to check if the _id of our database maches the requested id
> <img width="704" alt="id" src="https://user-images.githubusercontent.com/85080181/152195210-9c48dda1-ce4f-4414-99ca-0edb16eeff62.PNG">

## Displaying a user profile screen

+ Firstly, profile.ejs template is created.
+ To pull in real data for whichever user we're looking for we need to first verify whether that user actually *exists*
+ we create a function in our controller called :- *ifUserExists* which returns a promise.
+ If the promise resolves, that means it has found a user in the database that matches the requested username.
+ If it rejects, a 404 screen is rendered.  
+ users can also follow, unfollow or chat with other logged in users.
<img width="877" alt="kitty" src="https://user-images.githubusercontent.com/85080181/152197718-bb6585fc-56eb-47db-b14c-68cd261c2517.PNG">

> Users can edit or delete their *own* posts. 
> To allow users to create paragraphs, make their text bold or italic when they edit or submit a post, a package called *marked* has been used.
> - To not allow a random visitor to view our edit screen, 
>    - in the postController it has been checked first is the authorId of that particular post matches with the requested visitor id
>    - Only if the visitor is the owner of that post, the edit and delete options are shown
>    - Otherwise the visitor is redirected to the homepage and is displayed a corresponding flash message.
>    <img width="706" alt="edit1" src="https://user-images.githubusercontent.com/85080181/152199772-ce7d16f7-2556-49b6-a219-a2dec176184d.PNG">
>    <img width="705" alt="edit2" src="https://user-images.githubusercontent.com/85080181/152199853-f2d50a6f-3a57-4d03-8182-a7f47aaeea88.PNG">










# **Video:-** 


https://user-images.githubusercontent.com/85080181/151333389-6ab4910e-e60e-402a-9b50-119ddb69ebc7.mp4



