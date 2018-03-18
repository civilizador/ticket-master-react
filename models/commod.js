//  SCHEMA for COMMENTS
    
 var mongoose =         require("mongoose");
 
    var commentSchema = new mongoose.Schema({
    text: String,
    author: {
                id: {
                     type: mongoose.Schema.Types.ObjectId, //   id from the User model
                     ref: "User" // ref refers to the model that we are going to use here. Which is User.
                         },
        username: String
    },
    created: {type: String, default: Date.now  }
       });

module.exports = mongoose.model("Comment", commentSchema);
    
    
    
 