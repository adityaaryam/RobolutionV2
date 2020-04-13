const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
var multer  = require('multer')
const app = express();
const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const salt =10;

const upload = multer({
  limits:{
    fileSize: 200000
  }
})

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
  instagram : String,
  img : Buffer
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

//Blog List page +++
app.get("/blog_list",function(req,res){
  var list = [];
  members.find({} , (err, member) => {
    if(err)
    console.log(err)
    else
    {
      res.render("blog_list",{members:member});
    }
  })
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
      else
      {
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
      }
    })
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
app.post("/profile",upload.single("img"),function(req,res){  
    name = req.body.name;
    p= new profile({
      batch : req.body.batch,
      subteam : req.body.subteam,
      skill : req.body.skill,
      facebook : req.body.facebook,
      github : req.body.github,
      instagram : req.body.instagram,
      img : req.file.buffer
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

//Blog Article rendering++++
app.get("/blog/:username/:title",function(req,res){
  var username = req.params.username;
  var title = req.params.title;
  var m;
  members.findOne({username:username},function(err,member){
    m=member;
  })

  members.findOne({username : username,'articles.title' : title},function(err,member){
    if(member){
      member.articles.forEach(article=>{
        if(article.title === title)
        {
          var thumb = new Buffer(member.profile.img).toString('base64');
          var thumb1 = new Buffer(article.img).toString('base64');
          var category = _.camelCase(article.topic)
          res.render("blog",{article:article,member:member,category:category,img:thumb,img1:thumb1});
        }
      })
    }
  });
})

//dashboard ++++
app.get("/dashboard/:username",function(req,res){
  var username = req.params.username;
  members.findOne({username : username},function(err,doc){
    if(!err)
    {
        var thumb = new Buffer(doc.profile.img).toString('base64');
        res.render("dashboard",{member: doc, img: thumb});
    }
    else
    console.log("There was some Error!!");
})
})

//Blog composing page
app.route("/compose/:username")
  .get(function(req,res){
    username = req.params.username;
    res.render("compose",{username : username});
  })
app.post("/compose",upload.array("img"),function(req,res){
    var name = req.body.author;
    a= new articles({
      title : req.body.title,
      author : req.body.author,
      date : req.body.date,
      topic : req.body.topic,
      article : req.body.article,
      img : req.file.buffer
    });
    members.findOne({username: req.body.username},function(err,found){
      if(found)
      { 
        found.articles.push(a);
        found.save();
      }
    });
    res.redirect("/dashboard/"+req.body.username);
})

//Blog Category rendering
app.get("/blog/:category",function(req,res){
  var list = []
  var category = _.camelCase(req.params.category);

  members.find({'articles.topic' : req.params.category} , (err, member) => {
    if(err)
    console.log(err)
    else
    {
      console.log(member)
      res.render("blog_category",{members:member,topic:req.params.category,category:category});
    }
  })
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


