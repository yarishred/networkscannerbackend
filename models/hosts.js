//Database Connection
const mongoose = require('mongoose');

// Create Schema
const Schema = mongoose.Schema
const HostsSchema = new Schema({
    hostName: {
        type: String,
        required: true,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    operatingSystem: {
        type: String,
        required: true,
    },
    networkName: {
        type: Schema.Types.ObjectId,
        ref: 'Networks',
     }


})


module.exports = mongoose.model('Hosts', HostsSchema)