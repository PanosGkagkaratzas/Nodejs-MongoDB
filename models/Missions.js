const mongoose = require('mongoose');

const MissionsSchema = mongoose.Schema({
    User_id: {
        type: String,
        required: true,
    },
    Vehicle_plate: {
        type: String,
        required: true,
    },
    Start_time: {
        type: String,
        required: true
    },
    End_Time: {
        type: String,
        required: true
    },
    Start: {
        type: String,
        required: true
    },
    Stops: {
        type: [String],
        required: true
    },
    Coordinates: {
        type: [String],
        required: true
    },
    Active: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Missions', MissionsSchema);