const mongoose =require('mongoose');


const whatappSchema = mongoose.Schema({
  message:String,
  name:String,
  timestamp:String,
  received:Boolean 
});


module.exports = mongoose.model('messagecontents',whatappSchema); 