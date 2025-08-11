const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email:{
        type : String,
        required : true,
    }
});

userSchema.plugin(passportLocalMongoose); //this is used to add a username and hash,salt fields to the user schema by default instead of directly adding it in our user shcema

module.exports = mongoose.model('User',userSchema);