 
 var mongoose =         require("mongoose");
 
  //  Schema for TICKETS
    var shiftSchema = new mongoose.Schema
    (
        {       created: {type: Date, default: Date.now},
                ticket: String,
                fqdn:  String,
                state: String,
                carrier: String,
        last: String,
        next: String,
        owner: String,
         updated: String,
       
        notes: String,
        author: String,
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment" // name of the model
            }
                    ]
        }
    );
module.exports = mongoose.model("Shift",shiftSchema);