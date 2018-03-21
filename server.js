"use strict";
const express = require("express");
const mongoClient = require("mongodb").MongoClient;
const app = express();
let dir = __dirname;
let bodyParser = require('body-parser');
let  session = require("client-sessions");
const async = require("async");
const schedule = require('node-schedule');
let  d = new Date();

const mod = require("../Module/index.js");
const server = require("http").Server(app);
const socket = require("socket.io")(server);

// Used to make the server look in our directory for
// our javascript, css, and other files
app.use(express.static(dir));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
//duration: 7 * 24 * 60 * 1000,
duration: 10 * 1000,
}));


app.use(bodyParser.json());

mongoClient.connect("mongodb://ersp:abc123@ds044917.mlab.com:44917/smart-lock", (err, database) => {

  server.listen(3000, function() {

    console.log("listening on 3000");
    mod.connectServer();
  })
})

var dashboard = socket.of("/dashboardConnection");
dashboard.on("connection", function(socket) {
  console.log("Connected to dashboard socket from server end");
  socket.on("request", function(data) {
    console.log(data);

            // Do all of the lock stuff here....

            socket.emit("response", "response string");
          })
})

// Route for accessing the site, sends back the homepage
app.get("/", (req, res) => {
  res.sendFile(dir + "/views/login.html");
})

app.get("/addMembers", (req, res) => {
  res.sendFile(dir + "/views/addMembers.html");
})

app.get("/addRoles", (req, res) => {
  res.sendFile(dir + "/views/addRoles.html");
})

app.get("/addRules", (req, res) => {
  res.sendFile(dir + "/views/addRules.html");
})

app.get("/registerLock", (req, res) => {
  res.sendFile(dir + "/views/register.html");
})

app.get("/editAdmins", (req, res) => {
 res.sendFile(dir+ "/views/editAdmins.html");
})

// Route for authenticating users after they log in via Google
  // Determines whether or not the user has a lock associated with them

  app.get("/authenticate", (req, res) => {
  // User email is obtained from the Javascript function after user has logged
    // in viga Google
  var email = req.query.email;
  var fullname = req.query.fullname;
  req.session.fullname = fullname;
  req.session.username = email;
  mod.authenticate(email, fullname, function(locks, lockId) {
    if(lockId) {
      req.session.lock = lockId;
    }
    res.send(locks);
  })
  })

var dashboard = socket.of("/dashboardConnection");
dashboard.on("connection", function(socket) {
      console.log("Connected to dashboard socket from server end");
      socket.on("request", function(data) {
            console.log(data);
            //check whether lock is locked/unlocked on server side
            var currLock = req.session.lock;
            var status = mod.getLockStatus(currLock, function(data) {});

            //get status of lock from database/lights
            //check if the current user has ability to lock/unlock or is a valid user
            //if everything is okay then it will allow client to do action

            socket.emit("response", "response string");
      })
})

// Route that redirects users to their lock dashboard, sends the dashboard page back
app.get("/dashboard", (req, res) => {
  if(!mod.isLoggedIn(req.session.username)) {
    res.redirect("/");
    return;
  }
  res.sendFile(dir + "/views/dashboard.html");
})

/**
 * This route is only used to send back the personal data of the user
 * back to the Javascript function that loads the dashboard. This
 * is because the dashboard will contain some information personalized
 * to the user.
 */
 app.get("/dashboardInformation", (req, res) => {

  mod.getLockInfo(req.session.lock, req.session.username, function(data) {
    res.send(data);
  })
})

 app.get("/getLocks", (req, res) => {
  mod.getLocks(req.session.username, function(data) {
    res.send(data);
  })
})

 app.get("/getSettings", (req, res) => {
  mod.getSettings(req.session.username, req.session.lock, function(data) {
    console.log("getSettings in server.js: " + data);
    res.send(data);
  })
})

 app.get("/getMembers", (req, res) => {
  let id = req.session.lock;
  mod.getLockMembers(id, function(members) {res.send({members: members});});
})
 


 app.get("/getName", (req, res) => {
  res.send(req.session.username);
})


// Route that redirects users to register their lock, sends registration page
app.get("/register", (req, res) => {
  if(!mod.isLoggedIn(req.session.username)) {
    res.redirect("/");
    return;
  }
  res.sendFile(dir + "/views/register.html");
})


app.get("/lockStatus", (req, res) => {
  mod.getLockStatus(req.session.lock, function(data) {
    res.send(data);
  })
})


app.get("/selectLock", (req, res) => {
  res.sendFile(dir + "/views/locks.html");
})

app.get("/selectDashboard", (req, res) => {
  req.session.lock = parseInt(req.query.lockId);
  res.send();
})

app.get("/settings", (req, res) => {
  lockId = req.session.lock;

  res.sendFile(dir + "/views/settings.html");
})


app.get("/switchLock", (req, res) => {
  req.session.lock = parseInt(req.query.lockId);
  res.send();
})

app.get("/switchSettings", (req, res) => {
  console.log("the botton clicked is: " + req.query.setting);
  mod.switchSettings(req.query.setting, function(data) {
    console.log("the data sent in server.js is: " + data);
    res.send(data);
  })
})

app.get("/timeStatus", (req, res) => {

  let time = mod.getTime();

  res.send(time);
})

app.get("/canAccess", (req, res) => {
  var username = req.session.username;
  var lockId = req.session.lock;
  mod.canAccess(username, lockId, function(roles) {
    res.send({roles: roles});
  });
});


app.get("/canAccess", (req, res) => {
  let username = req.session.username;
  let lockId = req.session.lock;
  mod.canAccess(username, lockId, function(roles) {
    res.send({roles: roles});
  });
});

app.get("/showHistory", (req, res) => {
  let id = req.session.lock;
  mod.getLockHistory(id, function(history) {

    var id = req.session.lock;
    mod.getLockHistory(id, function(history) {
      history.times.push(history.owner);
      history.actions.push(history.owner);
      res.send({members: history.times, memActions: history.actions});
    });
  })
})

app.get("/signOut", (req, res) => {
 req.session.reset();
 res.send();
})


/* ---------------------- POST ROUTES BELOW ---------------------- */

//add member who can access lock
app.post("/addMember", (req, res) => {

  let username = req.body.username;
  let lockId = req.session.lock;
      //call the module
      mod.addMember(username,lockId, function(members) {res.send({members: members});});

      //call the mod
      mod.addMember(username,lockId, function(members) {res.send({members: members});});
    })
//remove member from lock 
app.post("/removeMember", (req, res) => {
  
})


//add time restrictions to when lock will be locked/unlocked
app.post("/addTimeRestriction", (req, res) => {
      //convert to military time


      let start = mod.convertToMilitary(req.body.startTime);
      let end = mod.convertToMilitary(req.body.endTime);


      mod.createRole(req.body.action, req.body.username, req.session.lock, start, end, function(result) {
        if(result) {
          res.send();
        }
        else {
          res.send({error: "error message"});
        }
      })
    })

//rule for lock
app.post("/createRule", (req, res) => {
  mod.createRule(req.session.lock, req.session.username, req.body.action, req.body.time);
})

//lock function
app.post("/lock", (req, res) => {
  mod.lock(req.session.username, req.session.lock, function(result){
    if(result){
      res.send();
    }
    else{
      res.send({error: "You do not have permission to lock!"});
    }
  })
});


// Proccesses the lock registration in the database
app.post("/registerLock", (req, res) => {
  let id = parseInt(req.body.id);
  let username = req.session.username;
  
  //console.log("user Name in server.js: " + req.session.username);
  //console.log("lock Name in server.js: " + req.body.lockName);
  mod.registerLock(id, req.body.lockName, req.session.username, function(result) {
  // let username = req.body.username;
  // mod.registerLock(id, req.body.lockName, req.body.userName, function(result) {
    if(result) {
      req.session.lock = id;
      res.send({redirect: "/dashboard"});
    }
    else {
      res.send({redirect:"failure"});
    }
  });
})

//unlock function
app.post("/unlock", (req, res) => {
  mod.unlock(req.session.username, req.session.lock, function(result) {
    if(result) {
      res.send();
    }
    else {
      res.send({error:"You do not have permission to do this!"});
    }
  })
})

//update role in data base
app.post("/updateRole", (req, res) => {
  let username = req.body.username;
  let lockId = req.session.lock;

      //use boolean values to set roles 
      let canAddMembers = (req.body.canAddMembers == "true");
      let canCreateRules = (req.body.canCreateRules == "true");
      let canManageRoles = (req.body.canManageRoles == "true");
      //update 
      db.collection("roles").update({username: username, lockId: lockId}, {$set: {canAddMembers: canAddMembers, canCreateRules: canCreateRules, canManageRoles: canManageRoles}})
    });


/* ---------------------- OTHER STUFF BELOW ---------------------- */

// Template function to do whatever you want every minute
