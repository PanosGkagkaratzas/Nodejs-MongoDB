var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressLayouts = require('express-ejs-layouts');
var flash = require('connect-flash');

//if we don't want to show some info inside this file we can create an .env and just call it here
require('dotenv/config');
var PORT = process.env.PORT || 8080

//Parse the recieved data to format that we can handle them
app.use(bodyParser.json());
//Parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error("Error connecting to database instance due to:", error))
db.once('open', () => console.log('Connected to database!'))

//Import Routes
const userRoute = require('./routes/users');
const missionRoute = require('./routes/missions');
const vehicleRoute = require('./routes/vehicle');

//Set view engine
app.set('view engine','ejs')
app.set('views', __dirname + '/views/')
app.set('layout', 'login')
app.use(expressLayouts)
app.use(express.static('public'))

app.use(flash());

app.use('/users', userRoute);
app.use('/users/login/stats/missions', missionRoute);
app.use('/users/register/vehicle', vehicleRoute);
app.use('/users/login/vehicle', vehicleRoute);

//How we start listening to the server
app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}/users`)});