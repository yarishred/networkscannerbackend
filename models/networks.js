//Database Connection
const mongoose = require("mongoose");

// Create Schema
const Schema = mongoose.Schema;
const NetworkSchema = new Schema({
  networkName: {
    type: String,
    required: true,
  },
  subnet: {
    type: String,
    required: true,
  },
  cidr: {
    type: String,
    required: true,
  },
  snmpCommunity: {
    type: String,
    required: true,
  },
  hosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Hosts",
    },
  ],
});

module.exports = mongoose.model("Networks", NetworkSchema);
