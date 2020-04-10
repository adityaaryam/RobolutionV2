const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use("/public", express.static(__dirname + '/public'));
members= [];


app.get("/home",function(req,res){
    res.render("home");
})

//Blog List page
app.get("/blog_list",function(req,res){
  res.render("blog_list",{members:members});
})

//Register
app.route("/register")
  .get(function(req,res){
    res.render("register");
  })
  .post(function(req,res){
    member = {
      id: String(members.length+1),
      username: req.body.username,
      name :req.body.name,
      pass: req.body.pass,
      profile: "",
      articles : []
    }
    console.log(member);
    members.push(member);
    res.render("profile",{member:member})
  });


//Login
app.route("/login")
  .get(function(req,res){
    res.render("login");
  })
  .post(function(req,res){
    var username = req.body.username;
    var pass = req.body.pass;
    members.forEach(element => {
      if(element.username === username && element.pass === pass)
      {
        res.render("dashboard",{member:element});
      }
    });
    res.render("register");
  })

//profile details
app.route("/profile")
  .post(function(req,res){  
    name = req.body.name;
    p={
      batch : req.body.batch,
      subteam : req.body.subteam,
      skill : req.body.skill,
      facebook : req.body.facebook,
      github : req.body.github,
      instagram : req.body.instagram
    };

    members.forEach(element =>{
      if(element.name === name)
      {
        element.profile = (p);
        res.render("dashboard",{member:element});
      }
    })
  })

//Picture Gallery
app.get("/gallery",function(req,res){
  res.render("gallery");
})

//Blog Article rendering
app.get("/blog/:author/:title",function(req,res){
  var author = req.params.author;
  var title = req.params.title;
  var article; 
  var member;
  for(var i=0;i<members.length;i++){
    if(members[i].name === author)
    {
      for(var j=0;j<members[i].articles.length;j++)
      {
        if(members[i].articles[j].title === title)
        {
          member=members[i]
          article=members[i].articles[j]
        }
      }
    }
  };
  res.render("blog",{article:article,profile:member});
})


//Blog composing page
app.route("/compose")
  .get(function(req,res){
    res.render("compose");
  })
  .post(function(req,res){
    var name = req.body.author;
    a={
      title : req.body.title,
      author : req.body.author,
      date : req.body.date,
      topic : req.body.topic,
      article : req.body.article
    };
    members.forEach(element =>{
      if(element.name === name)
      {
        res.render("dashboard",{member:element});
      }
    })
  })

//Blog Category rendering
app.get("/blog/:category",function(req,res){
  var list = []
  var category = req.params.category;
  var category1 = _.camelCase(category);
  console.log(category1)
  console.log(category)
  members.forEach(member=>{
    member.articles.forEach(article=>{
      if(article.topic === category)
      list.push(article)
    })
  })
  res.render("blog_category",{category:category1,articles:list});
})

//Workshop Details
app.get("/ws",function(req,res){
  res.render("ws");
})

//Team page
app.get("/team",function(req,res){
  res.render("team");
})

//Achievements Page
app.get("/achievement",function(req,res){
  res.render("achievements")
})

//Projects Page
app.get("/projects",function(req,res){
  res.render("projects");
})

//Hosting The App
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});


