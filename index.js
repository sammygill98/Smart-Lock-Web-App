var mongoClient = require("mongodb").MongoClient;
var db = undefined;



exports.connectServer = function() {
    mongoClient.connect("mongodb://ersp:abc123@ds044917.mlab.com:44917/smart-lock", (err, database) => {
        if(err) {
        return console.log(err);
        }
  
        console.log("hello");
        module.exports.db =  database.db("smart-lock");
   })
}

exports.findUser = function(user) {
    db.collection("users").find({username: user}).toArray((err, result) => {
        if(result[0]) {
            console.log("found a user!!!");
        }
        else {
            console.log("did not find a user!");
        }
    })
}

exports.isLoggedIn = function(user) {
    return((user != undefined));
 },
 
 
exports.getTime = function() {
    var d = new Date();
    var minutes = d.getMinutes();
    var hours = d.getHours();
    if (d.getMinutes() < 10) {
       minutes = "0" + minutes;
    }
    if (d.getHours() > 12) {
       hours = hours % 12;
    }
    var date = hours + ":" + minutes
       if (d.getHours()/12 == 0) {
          date = date + " AM";
       } else {
          date = date + " PM";
       }
    return date;
 };
 
exports.convertToMilitary = function(time) {
    if(time.indexOf("PM") != -1) {
       time = time.replace("PM", "");
       time = time.replace(" ", "");
       var timeArray = time.split(":");
       timeArray[0] = parseInt(timeArray[0]);
       if(timeArray[0] != 12) {
          timeArray[0] += 12;
       }
 
       var timeString = parseInt(timeArray[0].toString() + timeArray[1]);
       return timeString;
    }
    time = time.replace("AM", "");
    time = time.replace(" ", "");
    var timeArray = time.split(":");
    return (parseInt(timeArray[0] + timeArray[1]));
 }
 
exports.checkRestrictions = function(inputArray, dbArray) {
    var inputStart = inputArray[0];
    var inputEnd = inputArray[1];
    for(var i = 0; i < dbArray.length; dbArray++) {
       if(inputStart < dbArray[i][1] && inputStart > dbArray[i][0]) {
          return false;
       }
       if(inputEnd < dbArray[i][1] && inputEnd > dbArray[i][0]) {
          return false;
       }
    }
    return true;
 }
 
exports.checkActionPermission = function(timesArray, currentTime) {
       if(currentTime > timesArray[0][0] && currentTime < timesArray[0][1]) {
             return false;
       }
       return true;
 }