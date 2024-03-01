const express = require('express');
const router = express.Router();
const Missions = require('../models/Missions');
var x=0;

// POST A NEW MISSION
router.post('/' , (req, res) => {
  var current = new Date();
  var current_Date = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
  var current_Time = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
  var dateTime = current_Date + ' ' + current_Time;
   
    const mission = new Missions({
      User_id: req.body.User_id,
      Vehicle_plate: req.body.Vehicle_plate,
      Start_time: dateTime.toString(),
      End_Time: req.body.End_Time,
      Start: req.body.Start,
      Stops: req.body.Stops,
      Coordinates: req.body.Coordinates,
      Active: req.body.Active
    });

    Missions.findOne({Vehicle_plate: req.body.Vehicle_plate, Active: true})
    .then(doc => {
      if(doc)
      {
        if(x==0)
        {
          Missions.updateOne({ Vehicle_plate: req.body.Vehicle_plate, Active: true },
            { $set: {
              Stops: req.body.Stops
              } 
            }
          )
          .catch(err => {
            res.send({ message : 'Updating mission failed!'});
          })
          Missions.updateOne({ Vehicle_plate: req.body.Vehicle_plate, Active: true },
            { $push: {
              Coordinates: req.body.Coordinates
              } 
            })
            .catch(err => {
              res.send({ message : 'Updating mission failed!'});
            })
            x=1;
        }
        else{
          Missions.updateOne({ Vehicle_plate: req.body.Vehicle_plate, Active: true },
            { $push: {
              Stops: req.body.Stops,
              Coordinates: req.body.Coordinates
              } 
            })
            .catch(err => {
              res.send({ message : 'Updating mission failed!'});
            })
            Missions.updateOne({ Vehicle_plate: req.body.Vehicle_plate, Active: true },
              { $set: {
                Active: req.body.Active,
                End_Time: req.body.End_Time
                } 
              }
            )
          .catch(err => {
            res.send({ message : 'Updating mission failed!'});
          })
        }   
    }
    else{
      x=0;
      mission.save()
      console.log("Mission saved successfully");
    }
  })
});
    
// GET MISSION INFO BASED ON USER ID
router.get('/:User_id', function(req, res) {
  Missions.find({User_id : req.params.User_id},{Vehicle_plate:true,Start_time:true,Start:true,Stops:true,End_Time:true,Active:true})
  .then(doc => {
      if(doc){
          res.json(doc);
      }
      else{
          res.send("Mission not found");
      }
  })
  .catch((err) => res.status(400).send("Error: " + err));
});

// MOBILE GET MISSION INFO BASED ON VEHICLE PLATE
router.get('/mob/:Vehicle_plate', function(req, res) {
  Missions.find({Vehicle_plate : req.params.Vehicle_plate},{Start_time:true,Start:true,Stops:true})
  .then(doc => {
      if(doc){
          res.json(doc);
      }
      else{
          res.send("Mission not found");
      }
  })
  .catch((err) => res.status(400).send("Error: " + err));
});

// GET ALL MISSIONS 
router.get('/get/totalMissions', function(req, res) {
  Missions.find({},{Vehicle_plate:true,Start_time:true,Start:true,Stops:true,End_Time:true,Active:true})
  .then((missions) => res.json(missions))
  .catch((err) => res.status(400).json("Error: " + err));
});

//GET COORDINATES
router.get('/getCoordinates/:ID', function(req, res) {
  Missions.findById({"_id" :req.params.ID},{_id:0,Coordinates:true})
  .then(doc => {
      if(doc){
        res.json(doc);
      }
      else{
          res.send("Coordinates error");
      }
  })
  .catch((err) => res.status(400).send("Error: " + err));
});

//DELETE A MISSION
router.delete('/:ID', function(req, res) {
  //Missions.findByIdAndDelete({ID : req.body.ID})
  Missions.findByIdAndDelete(req.params.ID)
  .then(doc => {
      if(doc){
          res.send("Mission has been deleted");
      }
      else{
          res.send("Error deleting mission");
      }
  })
  .catch((err) => res.status(400).send("Error: " + err));
});

// Check if a user is logged in
// If not return to home page
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/users/');
}

// All these functions below will render a specific page based on url
router.get('/', isLoggedIn, function(req, res) {
  res.render('user_missions', { Missions: new Missions() , layout: 'user_missions' })
})

router.get('/get/getOne', isLoggedIn, function(req, res) {
  res.render('getMission', { Missions: new Missions() , layout: 'getMission' })
})

router.get('/get/getAll', isLoggedIn, function(req, res) {
  res.render('getAllMissions', { Missions: new Missions() , layout: 'getAllMissions' })
})

router.get('/get/getMap', isLoggedIn, function(req, res) {
  res.render('getMap', { Missions: new Missions() , layout: 'getMap' })
})

module.exports = router;