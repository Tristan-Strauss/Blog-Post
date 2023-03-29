require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let loggedIn = false;

mongoose.connect("mongodb://127.0.0.1:27017/blogDB").then(function(){
  console.log("Connected to the database successfully");
}).catch(function(err){
  console.log(err);
});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);


app.get("/", function(req,res){
  Post.find({}).then(function(foundPosts){
    res.render("home", {postArray:foundPosts});
  }).catch(function(err){
    console.log(err);
  });
});

app.get("/about", function(req,res){
  res.render("about");
});

app.get("/contact", function(req,res){
  res.render("contact");
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  // By Default these values are " admin:admin "
  if (username == process.env.ADMIN_USERNAME || password == process.env.ADMIN_PASSWORD){
    loggedIn = true;
    res.redirect("compose");
  } else {
    res.redirect("login");
  };
});

app.get("/compose", function(req,res){

  if(loggedIn == false){
    res.render("login")
  } else {
    res.render("compose");
  };
});

app.post("/compose", function(req,res){
  const title = req.body.newEntryTitle;
  const post = new Post ({
    title: title,
    content: req.body.newEntryBody
  });

  post.save().then(function(){
    res.redirect("/");
  }).catch(function(err){
    console.log(err);
  });

  loggedIn = false;
});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id:requestedPostId}).then(function(post){
    res.render("post", {
      postTitle:post.title,
      postBody:post.content
    });
  }).catch(function(err){
    console.log(err);
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
