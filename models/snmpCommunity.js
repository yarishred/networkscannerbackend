//Database Connection
const mongoose = require("mongoose");

// Create Schema
const Schema = mongoose.Schema;
const snmpCommunitySchema = new Schema({
  snmpCommunity: {
    type: String,
    required: true,
  },
  network: [
    {
      type: Schema.Types.ObjectId,
      ref: "Network",
    },
  ],
});



module.exports = mongoose.model("SNMPCommunity", snmpCommunitySchema);
