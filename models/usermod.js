var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar : String,
    email: String,
    group: String
});
//  adds additional methods from passportLocalMongoose to our User Schema.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);