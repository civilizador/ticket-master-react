    const   mongoose =         require("mongoose");
    const   Shift =            require("../models/ticketmod");
    const   User =             require("../models/usermod");
    const   Comment =          require("../models/commod");   
    const   middleware  =      require("../middleware.js");
      
    module.exports = (app) => {
            //  CREATE ROUTE for comments
      
        app.post("/tickets/:id/comments", middleware.isLoggedIn, function(req,res)
        {
            //    looking for camp by ID
            Shift.findById(req.params.id,function (err,foundTicket) 
            {
                if(err) {console.log("Something wrong"), console.log(err);}
                else
                {          //     create new comment 
                    Comment.create(req.body.comment,function(err,comment)
                    {
                        if(err) {console.log("Something wrong"), console.log(err);}
                        else 
                        {
                            comment.author.id = req.user._id; // after creating comment with Comment.create we can grab user id from the request
                        comment.author.username = req.user.username;//   and just plug it in the author field
                        console.log(req.user.username);
                //      save comment
                        comment.save();
                            foundTicket.comments.push(comment._id); //   pushing just created comment by passing  "comment" value.
        //                                                 //  "comment" - is a above function's placeholder which contains just created comment.
                            foundTicket.save();
                            res.redirect("/tickets/" + foundTicket._id);
                            console.log(comment);
                        }
                    });
                }
            });
        });
        
    }
          