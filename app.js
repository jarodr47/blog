//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect to local mogogdb server
mongoose.connect("mongodb://localhost:27017/dailyBlog", {useNewUrlParser: true});

//create schema for boilerplate posts to be used on Home, About, and Contact routes.
const postSchema = new mongoose.Schema ({
  title: String,
  post: String
})

//create a data model that will use the postSchema
const Post = mongoose.model("Post", postSchema);

//create schema for blogs to store individual blog posts.
const blogsSchema = new mongoose.Schema ({
  title: String,
  post: String
})

//create a data model that will use the blogSchema
const Blog = mongoose.model("Blog", blogsSchema);

//initialize starting entries for Home, Contact, and About routes.
const homeStartingContent = new Post ({
  title: "home",
  post: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing."
});
const aboutContent = new Post ({
  title: "about",
  post: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui."
});
const contactContent = new Post ({
  title: "contact",
  post: "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero."
});

const defaultPosts = [homeStartingContent, aboutContent, contactContent];
let posts2 = [];


app.get("/", function(req, res) {
  //we check if our DB has any existing posts, if not then insert boilerplate ones and serve up
  Post.find({}, function(err, results){
    if (results.length === 0) {
      Post.insertMany(defaultPosts, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("success");
        }
      })
      res.render("home", {homeStartingContent: results.post, posts: posts2});
    } else {
      //if the database does have data, then look for the Home post and serve that
      Post.findOne({title: "home"}, function(err, result){
        if (err) {
          console.log(err);
        } else {
          //after the home post is found, we will look for all other blogposts in the db and present previews
          Blog.find({}, function(err, results){
            res.render("home", {homeStartingContent: result.post, posts: results});
          });
          console.log("success");
        }
      });
    }
  })
})

//this get route is specific to requesting blog posts when clicked from the home page
app.get("/posts/:_id", function(req, res) {
  //when request is made we gather all posts
  Blog.find({}, function(err, results){
    //then we iterate the results looking for the post id that corresponds to the one clicked
    results.forEach(function(element){
      //if we find a match we shold be able to just serve that element with our post
      if (_.lowerCase(element._id) === _.lowerCase(req.params._id)) {
        //I think this findOne is unnecessary, will come back to this
        Blog.findOne({_id: element._id}, function(err, result){
          if (err){
            console.log(err);
          } else {
            res.render("post", {title: result.title, body: result.post});
          }
        })
      }
    });
  })
});

app.get("/about", function(req, res) {
  Post.findOne({title: "about"}, function(err, result){
    if (err) {
      console.log(err);
    } else {
      res.render("about", {aboutContent: result.post});
      console.log("success");
    }
  });
})

app.get("/contact", function(req, res) {
  Post.findOne({title: "contact"}, function(err, result){
    if (err) {
      console.log(err);
    } else {
      res.render("contact", {contactContent: result.post});
      console.log("success");
    }
  });
})

app.get("/compose", function(req, res) {
  res.render("compose");
})

//when user composes a new blog we create a new document and save it to the db
app.post("/compose", function (req, res) {
  const newBlog = new Blog ({
    title: req.body.postTitle,
    post: req.body.postBody
  })
  newBlog.save();
  res.redirect("/");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
