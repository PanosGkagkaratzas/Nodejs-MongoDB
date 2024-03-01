const express = require('express');
const User = require('../models/User');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Missions = require('../models/Missions');

// POST A NEW VEHICLE
router.post('/',(req, res) => {

    if (req.body.Manufactor == "" || req.body.Model == "" || req.body.Vehicle_plate == "" || req.body.Type == "" || req.body.Color == "" || req.body.CC == "" || req.body.HP == "" || req.body.Date_of_construction == "null")
    {
        res.send("Empty fields detected!");
    } else if (!/^[a-zA-Z]*$/.test(req.body.Manufactor)) {
        res.send("Invalid manufactor detected!");  
    }  else if (!/^[a-zA-Z0-9 ]*$/.test(req.body.Model)) {
        res.send("Invalid model detected!");  
    } else if (!/^[ABEHIKMNOPTXYZ]{3}-[0-9]{4}$/.test(req.body.Vehicle_plate)) {
        res.send("Invalid vehicle plate detected!");
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.Color)) {
        res.send("Invalid color detected!");  
    } else if (!/^[0-9]*$/.test(req.body.CC)) {
        res.send("Invalid CC detected!");  
    } else if (!/^[0-9]*$/.test(req.body.HP)) {
        res.send("Invalid horse power detected!");  
    } else if (!/(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/.test(req.body.Date_of_construction)) {
        res.send("Invalid date detected!");
    } else {
        Vehicle.findOne({Vehicle_plate : req.body.Vehicle_plate})
        .then(doc => {

            if(doc)
            {
                res.send("Vehicle with this plate already exists.\nPlease select another plate")
            }

            else{

                const newVehicle = new Vehicle({
                    User_id: req.body.User_id,
                    Vehicle_plate: req.body.Vehicle_plate,
                    Manufactor: req.body.Manufactor,
                    Model: req.body.Model,
                    Type: req.body.Type,
                    Color: req.body.Color,
                    CC: req.body.CC,
                    HP: req.body.HP,
                    Date_of_construction: req.body.Date_of_construction
                })

                newVehicle.save()
                .then(data => {
                    res.send("Vehicle has been successfully registered!");
                }).catch(error => {
                    console.log(error);
                })
            }
        })
    }
})

// GET VEHICLE PLATE BASED ON USER
router.get('/getVehiclePlate/:User_id', function(req, res) {
    Vehicle.find({User_id:req.params.User_id},{_id:0,Vehicle_plate:true})
    .then(doc => {
        if(doc){
            res.json(doc);
        }
        else{
            res.send("Vehicle not found");
        }
    })
    .catch((err) => res.status(400).send("Error: " + err));
});

// GET VEHICLE INFO BASED ON VEHICLE PLATE
router.get('/getVehicle/:User_id', function(req, res) {
    Vehicle.find({User_id : req.params.User_id})
    .then(doc => {
        if(doc){
            res.json(doc);
        }
        else{
            res.send("User not found");
        }
    })
    .catch((err) => res.status(400).send("Error: " + err));
});

// (MOBILE) GET VEHICLE INFO BASED ON VEHICLE PLATE
router.get('/getVehicle/mob/:Vehicle_plate', function(req, res) {
    Vehicle.find({Vehicle_plate : req.params.Vehicle_plate})
    .then(doc => {
        if(doc){
            res.json(doc);
        }
        else{
            res.send("User not found");
        }
    })
    .catch((err) => res.status(400).send("Error: " + err));
});

// GET ALL VEHICLES 
router.get('/totalVehicles', function(req, res) {
    Vehicle.find({},{_id:0,User_id:true,Vehicle_plate:true, Manufactor:true, Model:true, Type:true, Color:true, CC:true, HP:true, Date_of_construction:true})
    .then((vehicles) => res.json(vehicles))
    .catch((err) => res.status(400).json("Error: " + err));
});

// UPDATE VEHICLE INFO
router.post('/updateVehicle', function(req, res) {
    if (req.body.Vehicle_plate =="" || req.body.Manufactor == "" || req.body.Model == "" || req.body.Type == "" || req.body.Color == "" || req.body.CC == "" || req.body.HP == "" || req.body.Date_of_construction == "null")
    {
        res.send("Empty fields detected!");
    } else if (!/^[ABEHIKMNOPTXYZ]{3}-[0-9]{4}$/.test(req.body.Vehicle_plate)) {
        res.send("Invalid vehicle plate detected!");
    } else if (!/^[a-zA-Z]*$/.test(req.body.Manufactor)) {
        res.send("Invalid manufactor detected!");  
    } else if (!/^[a-zA-Z0-9 ]*$/.test(req.body.Model)) {
        res.send("Invalid model detected!");  
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.Color)) {
        res.send("Invalid color detected!");  
    } else if (!/^[0-9]*$/.test(req.body.CC)) {
        res.send("Invalid CC detected!");  
    } else if (!/^[0-9]*$/.test(req.body.HP)) {
        res.send("Invalid horse power detected!");  
    } else if(req.body.Vehicle_plate == req.body.OldPlate){
        Vehicle.findOne({Vehicle_plate : req.body.OldPlate})
        .then(doc => {
            if(doc)
            {
                Vehicle.updateOne({ Vehicle_plate: req.body.OldPlate},
                    { $set: {
                            Vehicle_plate: req.body.Vehicle_plate,
                            Manufactor: req.body.Manufactor,
                            Model: req.body.Model,
                            Color: req.body.Color,
                            CC: req.body.CC,
                            HP: req.body.HP
                        }
                    }
                ).exec()
                Missions.updateMany({ Vehicle_plate: req.body.OldPlate},
                    { $set: {
                        Vehicle_plate: req.body.Vehicle_plate
                    }
                }).exec()
                res.send("Vehicle changed successfully")
            }
            else{
                res.send("Vehicle not found")
            }
        })
    } else { Vehicle.findOne({Vehicle_plate : req.body.Vehicle_plate})
        .then(doc => {
            if(doc)
            {
                res.send("Vehicle with this plate already exists.\nPlease select another plate")
            }
            else{ Vehicle.findOne({Vehicle_plate : req.body.OldPlate})
            .then(doc => {
                if(doc)
                {
                    Vehicle.updateOne({ Vehicle_plate: req.body.OldPlate},
                        { $set: {
                                Vehicle_plate: req.body.Vehicle_plate,
                                Manufactor: req.body.Manufactor,
                                Model: req.body.Model,
                                Color: req.body.Color,
                                CC: req.body.CC,
                                HP: req.body.HP
                            }
                        }
                    ).exec()
                    Missions.updateMany({ Vehicle_plate: req.body.OldPlate},
                        { $set: {
                            Vehicle_plate: req.body.Vehicle_plate
                        }
                    }).exec()
                    res.send("Vehicle changed successfully")
                }
                else{
                    res.send("Vehicle not found")
                }
            })
        }
        });
    }
});

// Vehicle counter
router.get('/counter/:ID', function(req, res) {

    Vehicle.count({User_id:req.params.ID}, function(error, numOfDocs) {
        res.json(numOfDocs);
    });
});

// DELETE VEHICLE
router.delete('/deleteVehicle', function(req, res) {
    Vehicle.findOneAndDelete({Vehicle_plate : req.body.Vehicle_plate})
    .then(doc => {
        if(doc){
            res.send("Vehicle has been deleted!")
        }
        else{
            res.send("Error deleting vehicle")
        }
    })
});

// Check if a user is logged in
// If not return to home page
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/users/');
}

// All these functions below will render a specific page based on url
router.get('/', function(req, res) {
    res.render('register_vehicle', { Vehicle: new Vehicle() , layout: 'register_vehicle' })
})

router.get('/getOne', isLoggedIn, function(req, res) {
    res.render('getVehicle', { Vehicle: new Vehicle() , layout: 'getVehicle' })
})

router.get('/getAll', isLoggedIn, function(req, res) {
    res.render('getAllVehicles', { Vehicle: new Vehicle() , layout: 'getAllVehicles' })
})

module.exports = router;