const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const app = express();
const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const salt =10;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use("/public", express.static(__dirname + '/public'));
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost:27017/robolutionDB", {useNewUrlParser: true, useUnifiedTopology: true});

length=1;
const profileSchema = new mongoose.Schema({
  batch : String,
  subteam : String,
  skill : String,
  facebook : String,
  github : String,
  instagram : String
});

const articlesSchema = new mongoose.Schema({
  title : String,
  author : String,
  date : String,
  topic : String,
  article : String
});

const membersSchema = new mongoose.Schema({
  id: Number,
  username: String,
  name : String,
  password: String,
  profile: profileSchema,
  articles : [articlesSchema]
});


const profile = mongoose.model("profile",profileSchema);
const articles = mongoose.model("articles",articlesSchema);
const members = mongoose.model("members",membersSchema);


app.get("/",function(req,res){
  res.redirect("/home");
})

app.get("/home",function(req,res){
    res.render("home");
})

//Blog List page ++++
app.get("/blog_list",function(req,res){
  res.render("blog_list",{members:members});
})

//Register +++++
app.route("/register")
  .get(function(req,res){
    res.render("register");
  })
  .post(function(req,res){
    members.findOne({username: req.body.username},function(err,found){
      if(found)
      res.redirect("/login");
    })
    bcrypt.hash(req.body.pass, salt, function(err, hash) {
      member = new members({
        id: members.length+1,
        username: req.body.username,
        name : req.body.name,
        password: hash
      })
      member.save(function(err){
        if(err)
        console.log(err);
        else
        res.render("profile",{member:member});
      });
    });
  })


//Login +++
app.route("/login")
  .get(function(req,res){
    res.render("login");
  })
  .post(function(req,res){
    members.findOne({username: req.body.username},function(err,found){
      if(err)
      console.log(err)
      else{
        if(found){
          bcrypt.compare(req.body.pass, found.password, function(err, result) {
            if(result === true)
            res.redirect("/dashboard/"+found.username);
            else
            res.redirect("/register");
          });
        }
      }
    })
})

//profile details +++++
app.route("/profile")
  .post(function(req,res){  
    name = req.body.name;
    p= new profile({
      batch : req.body.batch,
      subteam : req.body.subteam,
      skill : req.body.skill,
      facebook : req.body.facebook,
      github : req.body.github,
      instagram : req.body.instagram
    });

    members.findOne({name:name},function(err,found){
      found.profile = p;
      found.save();
      res.redirect("/dashboard/"+found.username);
  })
  })

//Picture Gallery +++++
app.get("/gallery",function(req,res){
  res.render("gallery");
})

//Blog Article rendering
app.get("/blog/:author/:title",function(req,res){
  var author = req.params.author;
  var title = req.params.title;
  var a; 
  var m;
  members.findOne({username : author},function(err,member){
    if(member){
      console.log(member);
      member.articles.findOne({title : title},function(err,article){
        if(article){
          m=member,
          a=article
        }
      });
    }
  });
  console.log("a=");
  console.log(m);
  console.log(a);
  /*for(var i=0;i<members.length;i++){
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
  };*/
  res.render("blog",{article:a,profile:m});
})

//dashboard ++++
app.get("/dashboard/:username",function(req,res){
  var username = req.params.username;
  members.findOne({username : username},function(err,doc){
    if(!err)
    {
        res.render("dashboard",{member: doc});
    }
    else
    console.log("There was some Error!!");
})
})

//Blog composing page  +++++
app.route("/compose")
  .get(function(req,res){
    res.render("compose");
  })
  .post(function(req,res){
    var name = req.body.author;
    a= new articles({
      title : req.body.title,
      author : req.body.author,
      date : req.body.date,
      topic : req.body.topic,
      article : req.body.article
    });
    var username;
    members.findOne({name:name},function(err,found){
      if(found)
      { 
        found.articles.push(a);
        found.save();
        res.redirect("/dashboard/"+found.username);
      }
    });
    
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

//Workshop Details  ++++
app.get("/ws",function(req,res){
  res.render("ws");
})

//Team page  ++++
app.get("/team",function(req,res){
  res.render("team");
})

//Achievements Page  ++++
app.get("/achievement",function(req,res){
  res.render("achievements")
})

//Projects Page  ++++
app.get("/projects",function(req,res){
  res.render("projects");
})

//Hosting The App  ++++
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});


