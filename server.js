const express = require("express");
const mongoose = require("mongoose");
const { urlencoded } = require("body-parser");
const cors = require("cors");

const app = express();
require("dotenv").config();

const User = require("./database");

app.use(urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users/:_id/exercises", (req, res, next) => {
  const idUser = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;
  if (!date) {
    date = new Date().toDateString();
  }else{
    date = new Date(req.body.date).toDateString()
  }
  const exercise = {
    description: description,
    duration: duration,
    date: date,
  };
  User.findOneAndUpdate({ _id: idUser }, { $inc: { count: 1 } })
    .then((user) => {
      return user.addExercise(exercise);
    })
    .then((userSaved) => {
      res.json({
        _id: idUser,
        username: userSaved.username, 
        date: date,
        duration: userSaved.duration,
        description: description
      });
    })
    .catch(err => console.log(err));
});

app.post("/api/users", (req, res, next) => {
  const username = req.body.username;
  const user = new User({
    username: username,
    count: 0,
  });
  user
    .save()
    .then((result) => {
      res.json({ _id: result._id, username: result.username });
    })
    .catch((err) => console.log(err));
});

app.get('/api/users/:_id/logs', (req, res, next) => {
  const userId = req.params._id;
  const limit = req.query.limit;
  
  User.findById(userId)
    .then(user => {
      let logData = [...user.log]
      let logIdless = [];
      for (let i = 0; i< logData.length; i++) {
        logIdless.push({description:logData[i].description, duration: logData[i].duration, date: logData[i].date.toDateString()})
      }
      if (req.query.from || req.query.to){
        let fromDate = new Date(0);
        let toDate = new Date(); 
        if (req.query.from){
          fromDate = new Date(req.query.from)
        }
        if (req.query.to){
          toDate = new Date(req.query.to);
        }
        logIdless = logIdless.filter(exercise => {
          let exerciseDate = new Date(exercise.date)
          return exerciseDate >= fromDate && exerciseDate <= toDate
        })
      }
      if (limit){
        logIdless = logIdless.slice(0,limit)
      };
      res.json({_id: user._id, username: user.username, count: user.count, log: logIdless})
    })
    .catch(err => console.log(err))
})

app.get("/api/users", (req, res, next) => {
  User.find().then((usersData) => {
    const users = [];
    for (let i = 0; i < usersData.length; i++) {
      users.push({ _id: usersData[i]._id, username: usersData[i].username });
    }
    res.json(users);
  });
});

mongoose
  .connect(
    "mongodb+srv://AndresH:WMUCWC0XiWsDxR4W@cluster0.lhsrw.mongodb.net/Exercise-Project?retryWrites=true&w=majority"
  )
  .then(() => {
    return app.listen(process.env.PORT || 3000);
  })
  .then((result) => {
    console.log("Your app is listening on port " + result.address().port);
  })
  .catch((err) => console.log(err));
