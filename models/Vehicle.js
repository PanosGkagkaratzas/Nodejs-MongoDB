const mongoose = require('mongoose');

const VehicleSchema = mongoose.Schema({
    User_id: {
        type: String,
        required: true,
    },
    Vehicle_plate: {
        type: String,
        required: true,
    },
    Manufactor: {
        type:  String,
        required: true
    },
    Model: {
        type: String,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    Color: {
        type:  String,
        required: true
    },
    CC: {
        type: String,
        required: true
    },
    HP: {
        type: String,
        required: true
    },
    Date_of_construction: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);