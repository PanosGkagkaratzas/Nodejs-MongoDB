const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Missions = require('../models/Missions');
const router = express.Router();

var session = require('express-session')
var passport = require('passport');
const { db } = require('../models/User');
var localStrategy = require('passport-local').Strategy;

// POST A NEW USER
router.post('/register' , (req, res) => {
    var current = new Date();
    var current_Date = current.getDate() + '-' + (current.getMonth() + 1) + '-' + current.getFullYear();
    var current_Time = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    var dateTime = current_Date + ' ' + current_Time;

    if (req.body.FirstName == "" || req.body.LastName == "" || req.body.Account_Type == "" || req.body.Email == "" || req.body.Password == "" || req.body.Confirm_password == "" || req.body.Recovery_PIN == "")
    {
        res.send("Empty fields detected!");
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.FirstName)) {
        res.send("Invalid first name detected!");  
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.LastName)) {
        res.send("Invalid last name detected!");   
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
        res.send("Invalid email detected!");
    } else if (!/^[A-Za-z]\w{7,14}$/.test(req.body.Password)) {
        res.send("Invalid password form detected!");
    } else if(!((req.body.Password) === (req.body.Confirm_password))){
        res.send("Password fields must have the same password!");
    } else if (!/^[0-9]{4}$/.test(req.body.Recovery_PIN)) {
        res.send("Invalid recovery PIN detected!");  
    }
    else { User.findOne({ Email: req.body.Email })
        .then(result => {
            if (result){
                res.send("User with this email already exists!")
            }
            else { 
                const saltRounds = 10;
                bcrypt.hash(req.body.Password , saltRounds)
                .then(hashedPassword => {

                    bcrypt.hash(req.body.Recovery_PIN , saltRounds)
                    .then(hashedPin => {
                        const newUser = new User({
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName,
                            Account_Type: req.body.Account_Type,
                            Email: req.body.Email,
                            Password: hashedPassword,
                            Recovery_PIN: hashedPin,
                            Register_time: dateTime.toString()
                        })
                    
                        newUser.save()
                        .then(data => {
                            res.send("User has been successfully registered!");
                        }).catch(error => {
                            console.log("Error: ",error);
                        })
                    });   
                })  
            }
        })
    }
});

// LOGIN POST
router.post('/login' , (req, res) => {

    if (req.body.Email == "" || req.body.Password == "")
    {
        res.send("Empty fields detected!");
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
        res.send("Invalid email detected!");
    } else if (!/^[A-Za-z]\w{7,14}$/.test(req.body.Password)) {
        res.send("Invalid password form detected!");
    } else { User.findOne({ Email: req.body.Email })
        .then(data => {
            if (data){
                const hashedPassword = data.Password

                bcrypt.compare(req.body.Password, hashedPassword)
                .then(result  => {
                    if (result)
                    {
                        User.find({Email : req.body.Email},{_id:true})
                        .then(doc => {
                            res.json(doc)
                        })
                    }
                    else{
                        res.send("Wrong password...")
                    }
                })
            } else {
                res.send("Login failed due to wrong credentials...")
            }
        })
    }
});

//GET USERS ID BASED ON EMAIL
router.get('/getID/:Email', function(req, res) {
    User.findOne({Email : req.params.Email},{_id:true})
    .then(doc => {
        if(doc){
            res.json(doc)
        }
    })
    .catch((err) => res.status(400).send("Error: " + err));
});

// GET USERS NAME, SURNAME BASED ON EMAIL
router.get('/login/username/:ID', function(req, res) {
    
    var id = req.params.ID;
    User.findById(id, {_id:0,FirstName:true,LastName:true}, function (err, doc) {
        if (err){
            console.log(err);
        }
        else{
            res.json(doc);
        }
    })

});

// RECOVER PASSWORD POST
router.post('/recovery/', function(req, res) {

    if (req.body.Email == "" || req.body.Password == "" || req.body.Password2 == "" || req.body.Recovery_PIN == "")
    {
        res.send("Empty fields detected!");
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
        res.send("Invalid email detected!");
    } else if (!/^[0-9]{4}$/.test(req.body.Recovery_PIN)) {
        res.send("Invalid recovery PIN detected!");  
    } else if (!/^[A-Za-z]\w{7,14}$/.test(req.body.Password)) {
        res.send("Invalid password form detected!");
    } else if(!((req.body.Password) === (req.body.Password2))){
        res.send("Password fields must have the same password!");
    } 
    else { User.findOne({ Email: req.body.Email })
        .then(data => {
            if (data){

                const hashedDataPIN = data.Recovery_PIN

                bcrypt.compare(req.body.Recovery_PIN, hashedDataPIN)
                .then(result  => {
                    if (result)
                    {

                        const hashedPassword = req.body.Password;
                        const saltRounds = 10;

                        bcrypt.hash(hashedPassword , saltRounds)
                        .then(hashedPassword => {

                            bcrypt.hash(req.body.Recovery_PIN , saltRounds)
                            .then(hashedPin => {

                                User.updateOne({ Email: req.body.Email},
                                { $set: {
                                        Password: hashedPassword,
                                        Recovery_PIN: hashedPin
                                    }
                                }
                                ,res.send("Password changed successfully")
                                )
                                .catch(err => {
                                    res.send({ message : err});
                                })
                            });
                        });
                    }
                    else{
                        res.send("Wrong PIN")
                    }
                })
            }
            else{
                res.send("Email not found!")
            }
        })
        .catch((err) => res.status(400).send("Error: " + err));
        }
});

// CHANGE PASSWORD POST
router.post('/changePass/', function(req, res) {

    if (req.body.Email == "" || req.body.Password == "" || req.body.newPassword == "" || req.body.newPassword2 == "")
    {
        res.send("Empty fields detected!");
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
        res.send("Invalid email detected!");
    } else if (!/^[A-Za-z]\w{7,14}$/.test(req.body.Password)) {
        res.send("Invalid password form detected!");
    } else if (!/^[A-Za-z]\w{7,14}$/.test(req.body.newPassword)) {
        res.send("Invalid password form detected!");
    } else if(!((req.body.newPassword) === (req.body.newPassword2))){
        res.send("Password fields must have the same password!");
    } 
    else { User.findOne({ Email: req.body.Email })
        .then(data => {
            if (data){

                const hashedDataPassword = data.Password

                bcrypt.compare(req.body.Password, hashedDataPassword)
                .then(result  => {
                    if (result)
                    {
                        const hashedPassword = req.body.newPassword;
                        const saltRounds = 10;

                        bcrypt.hash(hashedPassword , saltRounds)
                        .then(hashedPassword => {

                            User.updateOne({ Email: req.body.Email},
                            { $set: {
                                    Password: hashedPassword
                                }
                            }
                            ,res.send("Password changed successfully")
                            )
                            .catch(err => {
                                res.send({ message : err});
                            })
                            
                        });
                    } else{
                        res.send("Wrong password...")
                    }
                })
            }
            else{
                res.send("Email not found!")
            }
        })
        .catch((err) => res.status(400).send("Error: " + err));
        }
});

// DELETE A USER ONLY FROM USERS COLLECTION(in case of registration error)
router.delete('/register/vehicle/deleteUser/', function(req, res) {
    var myID = req.body.ID;

    User.findByIdAndDelete(myID, function(err, obj) {
        if (err) 
        {
            res.send(err)
        }
        else{
            res.send("User deleted successfully!")
        }
    })

});

// DELETE A USERS ACCOUNT
router.delete('/login/completeDelete/', function(req, res) {

    var myID = req.body.ID;
    var query = { User_id: myID }

    User.findByIdAndDelete(myID, function(err, obj) {
        if (err) 
        {
            res.send("Error deleting user")
        }
        else{
            Vehicle.deleteMany(query, function(err, obj) {
                if (err)
                {
                    res.send("Error deleting vehicle")
                }
                else{
                    Missions.deleteMany(query, function(err, obj) {
                        if (err)
                        {
                            res.send("Error deleting mission")
                        }
                        else{
                            res.send("User deleted successfully!")
                        }
                    })  
                }
            })
        }
    })
});

// GET USERS INFO BASED ON ID
router.get('/login/getAccount/:ID', function(req, res) {

    var id = req.params.ID;
    User.findById(id, {_id:0,FirstName:true,LastName:true,Email:true,Register_time:true}, function (err, doc) {
        if (err){
            res.json("User not found");
        }
        else{
            res.json(doc);
        }
    })

});

// GET USERS ACCOUNT TYPE AT LOGIN
router.get('/login/accountType/:Email', function(req, res) {
    User.find({Email : req.params.Email},{_id:0,Account_Type:true})
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

// GET USERS ID AT LOGIN
router.get('/login/getID/:Email', function(req, res) {
    User.findOne({Email : req.params.Email},{_id:true})
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

// GET ALL USERS
router.get('/login/totalUsers/', function(req, res) {
        User.find({},{_id:0,FirstName:true, LastName:true, Email:true, Register_time:true})
        .then((users) => res.json(users))
        .catch((err) => res.status(400).json("Error: " + err));
    }
);

// UPDATE USERS INFO
router.post('/login/updateUser/', function(req, res) {
    if (req.body.FirstName == "" || req.body.LastName == "" || req.body.Email == "")
    {
        res.send("Empty fields detected!");
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.FirstName)) {
        res.send("Invalid first name detected!");  
    } else if (!/^[a-zA-ZΑ-Ωα-ωίϊΐόάέύϋΰήώ]*$/.test(req.body.LastName)) {
        res.send("Invalid last name detected!");   
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.Email)) {
        res.send("Invalid email detected!");
    } else if(req.body.Email == req.body.OldEmail){
        User.findOne({Email : req.body.OldEmail})
        .then(doc => {
            if(doc)
            {
                User.updateOne({ Email: req.body.Email},
                    { $set: {
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName
                        }
                    }
                ).exec()
                
                res.send("Profile changed successfully")
            }
            else{
                res.send("User not found")
            }
        })
    } else { 
        User.findOne({Email : req.body.Email})
        .then(doc => {
            if(doc)
            {
                res.send("User with this email already exists!")
            }
        })
        User.findOne({Email : req.body.OldEmail})
        .then(doc => {
            if(doc)
            {
                User.updateOne({ Email: req.body.OldEmail},
                    { $set: {
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName,
                            Email: req.body.Email
                        }
                    }
                ).exec()
                
                res.send("Profile changed successfully")
            }
            else{
                res.send("User not found")
            }
        })
    }
});

// Check if a user is logged in
// If not return to home page
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/users/');
}

// Setup a session cookie for logged in users
router.use(session({
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: false, 
    cookie: { maxAge: 3600000 }
}));

router.use(passport.initialize());
router.use(passport.session());

// Passport gets a unique id for every user, saves this id into a cookie and that cookie is sent to the client
passport.serializeUser(function (user, done){
    done(null,user.id);
})

// The browser will recieve this cookie and every time it makes requests to the server it wil append this cookie
// Passport will pull this cookie which contains the unique id, then will pass the id to database to identify the user
passport.deserializeUser(function (id, done){
    User.findById(id, function(err, user){
        done(err, user)
    });
});

router.get('/',function(req, res) {
    var message = req.flash('message')

    res.render('login', { User: new User() , message })
})

// Flash message middleware    
router.use((req, res, next)=>{
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

// Receive email and password from user
// Firstly do a regular expression check then check if this email exists
// Finally check if the password is correct
passport.use(new localStrategy({
    usernameField: 'Email',
    passwordField: 'Password',
    passReqToCallback: true

  },function (req, email, pass, done) {

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            console.log("Invalid email detected!");               
            return done(null, false, req.flash('message', 'Invalid email detected!' ));
        }
        else if (!/^[A-Za-z]\w{7,14}$/.test(pass)) {
            console.log("Invalid password form detected!");               
            return done(null, false, req.flash('message', 'Invalid password form detected!' ));
        }
        else{
            User.findOne({Email: email}, function (err,user){
                if(err){
                    return done(err);
                }
                
                if(!user){
                    console.log("User not found");               
                    return done(null, false, req.flash('message', 'User not found' ));  
                }
                
                User.findOne({Email: email})
                .then(data => {
                    bcrypt.compare(pass, data.Password)
                    .then(result  => {
                        if (result)
                        {
                            return done(null, user);
                        }
                        else{
                            return done(null, false, req.flash('message', 'Incorrect password' ));  
                        }
                    });
                });
            });
        }  
    }
));

// If authentication is successfull, user will be redirected to home page οtherwise he will be redirected to sign in page
router.post('/login2',passport.authenticate('local',{
    successRedirect: '/users/login/redirect',
    failureRedirect: '/users/',
    failureFlash : true
}))

// Clear the login session and delete the unique user id
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/users');
});

// All these functions below will render a specific page based on url
router.get('/register', function(req, res) {
    res.render('register_user', { User: new User(), layout: 'register_user' })
})

router.get('/login/redirect', isLoggedIn, function(req, res) {
    res.render('redirect', { layout: "redirect" })
})

router.get('/login/user', isLoggedIn, function(req, res) {
    res.render('user_main', { User: new User(), layout: "user_main" })
})

router.get('/login/admin', isLoggedIn, function(req, res) {
    res.render('admin_main', { User: new User(), layout: "admin_main" })
})

router.get('/login/getOne', isLoggedIn, function(req, res) {
    res.render('getAccount', { User: new User(), layout: "getAccount" })
})

router.get('/login/getAll', isLoggedIn, function(req, res) {
    res.render('getAllUsers', { User: new User(), layout: "getAllUsers" })
})

module.exports = router;
