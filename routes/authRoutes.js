const  passport =         require("passport");
const  mongoose =         require("mongoose");
const  Shift =            require("../models/ticketmod");
const  User =             require("../models/usermod");
const  middleware  =      require("../middleware.js");
const  flash    =         require("connect-flash");


 //  REGISTER ROUTE
    module.exports = function (app) {
          //   show register form page
            app.get("/register",function(req, res) {
                res.render("users/register");
            });
       
        //   handle sign up logic
            app.post("/register", function(req, res)
            {
           var newUser = new User({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            avatar: req.body.avatar
          });
       
          User.register(newUser, req.body.password, function(err, user) {
            if (err) {
              console.log(err.message);
              return res.render("users/register", { error: err.message });
            }
            passport.authenticate("local")(req, res, function() {
              req.flash("success", "Welcome to Shift TO" + " " + user.username);
              res.redirect("/");
            });
          });
         });
       
          //  LOGIN ROUTE
        
        //  show login form
        app.get("/login",function(req, res) {
                  res.render("login",{currentUser:req.user});
        });
        
        // handling login logic
        
        app.post("/login", passport.authenticate("local", {
            successRedirect: "/", //build in methods that authenticate user.
            failureRedirect: "/login"
            }), function(req, res){
        });
        
        // logout route
        
         app.get("/logout", function(req, res){
            req.logout();
            res.redirect("/login");
        });
        
        function escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
       function myFunction() {
        var x = document.getElementsByClassName("myInput");
      var y = document.getElementsByClassName("check");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }
    
    
    // USER SHOW ROUTE 
        app.get("/user/:id", function(req, res){
            User.findById(req.params.id, function(err, foundUser) {
                if(err) {
                    req.flash("error","something is wrong")
                    res.redirect("/")
                } else {
                    Shift.find().where('ownerId').equals(foundUser._id).exec(function(err,posts){
                        if(err) {req.flash("error","something is wrong")}
                        res.render("users/show",{foundUser:foundUser,foundPosts:posts,currentUser:req.user});  
                    });  
                } 
            })
        });
         
         // USER Edit FORM
        app.get("/user/:id/edit", function(req, res){
            const groups = ['Operations_data','Operations_Voice','Dev_Ops','Team_Leads','CS_Tier1','CS_Tier2','CS_Tier3'];
            User.findById(req.params.id, function(err, foundUser) {
               if(err) {req.flash("error","something is wrong")
                res.redirect("/")
            }else {
                res.render("users/editUser",{foundUser:foundUser,groups:groups});  
                    } 
             })
        });
         
         app.put("/user/:id", function(req, res){
         // find and update the correct campground
            User.findByIdAndUpdate(req.params.id, req.body.userDet, function(err, foundUser){
                if(err){ req.flash("error","failed to update profile, check Your information and try again.") } else {
                   //redirect somewhere(show page)
                   res.redirect("/user/" + req.params.id);
                 }
            });
         });
    }                 
      