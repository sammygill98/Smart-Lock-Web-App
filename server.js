var express = require("express");
var mongoClient = require("mongodb").MongoClient;
var db = undefined;
var app = express();
var dir = __dirname;
var bodyParser = require('body-parser');
var session = require("client-sessions");

// Used to make the server look in our directory for 
  // our javascript, css, and other files
app.use(express.static(dir));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  cookieName: 'smartlocksession',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
}));
app.use(bodyParser.json());

mongoClient.connect("mongodb://ersp:abc123@ds044917.mlab.com:44917/smart-lock", (err, database) => {
  if(err) {
    return console.log(err);
  }

  db = database.db("smart-lock");
  app.listen(3000, function() {
    console.log("listening on 3000");
  })
})

app.get("/", (req, res) => {
  res.sendFile(dir + "/views/index.html");
})

app.get("/authenticate", (req, res) => {
  var email = req.query.email;
  var req = req;
  db.collection("users").find({user: email}).toArray((err, result) => {
    if(result.length) {
      req.smartlocksession.user = email;
      res.send({redirect: "/register"});
    }
    else {
      db.collection("users").insert({user: email, lockId: null, role: null}, (err, doc) => {
      req.smartlocksession.user = email;
      res.send({redirect: "/register"});
      })
    }
  })
})

app.get("/dashboard", (req, res) => {
  res.sendFile(dir + "/views/dashboard.html");
})

app.get("/register", (req, res) => {
  res.sendFile(dir + "/views/register.html");
})