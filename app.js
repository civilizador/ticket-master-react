    var express =      require("express"),
    app =              express(),
    request =          require("request"),
    passport =         require("passport"),
    LocalStrategy =    require("passport-local"),
    methodOverride =   require("method-override"),   
    bodyParser =       require("body-parser"), //body parser allows us to take data from forms and use req.body.parametr ex: req.body.name
    Shift =            require("./models/ticketmod"),
    User =             require("./models/usermod"),
    Comment =          require("./models/commod"),    
    mongoose =         require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
    
//APP CONFIG

    //  Connecting to DB 
    
    mongoose.connect("mongodb://civilizador:Asimssoft1@ds113019.mlab.com:13019/shift_to");
    
    //  Basic app configuration
    
    app.set("view engine", "ejs");
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(express.static("public"));
    app.use(methodOverride("_method"));
    app.use(express.static(__dirname + "/public"));

    //  PASSPORT.js CONFIGURATION
    
        //  Creating a new session.
    app.use(require("express-session")
    ({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
        //   Creating a function that will check if there is a username in other words is user loged in or not.
    
    app.use(function(req, res, next){
    res.locals.currentUser = req.user;// req.user will either be empty or contain information about user from the request
    next();
                });
                
    //  END of PASSPORT configuration


//seedDB();

//RESTFULL ROUTES

    //1. INDEX ROUTE
     app.get("/",function(req, res) 
    {  res.redirect("/tickets");     });
    
        app.get("/tickets",function(req,res)
    {   Shift.find({}, function(err, tickets)
    {if(err) {throw err}
    else{ res.render("index",{tickets: tickets}); }
         });
    });
    
      //1i. INDEX ROUTE - External Tickets
    
        app.get("/tickets/external",function(req,res)
    {   Shift.find({}, function(err, tickets)
    {if(err) {throw err}
    else{ res.render("external",{tickets: tickets}); }
         });
    });
    
    //1i. INDEX ROUTE - External Tickets
    
        app.get("/tickets/arch",function(req,res)
    {   Shift.find({}, function(err, tickets)
    {if(err) {throw err}
    else{ res.render("arch",{tickets: tickets}); }
         });
    });
    
    
     //1b. INDEX ROUTE - External Tickets
    
        app.get("/tickets/monitoring",function(req,res)
    {   Shift.find({}, function(err, tickets)
    {if(err) {throw err}
    else{ res.render("monitoring",{tickets: tickets}); }
         });
    });
    
    //2. "NEW" ROUTE
    app.get("/tickets/new", isLoggedIn, function(req, res) {
        res.render("new", {currentUser: req.user}); 
    });

    //3. "CREATE" ROUTE - POST request to /tickets
    app.post("/tickets", isLoggedIn, function(req,res){
        //  create a new ticket.
    
        Shift.create(req.body.ticket, function(err,ticket)
        {
        if(err){throw err , console.log("Something is wrong") }
    //redirect back
        else {res.redirect("/tickets");}
        }
        );
    });

    //4. "SHOW" ROUTE - this route comes when user click on "Read More". 
            //It grabs ID of the post .We use findById method to pull up entry by id from db and send it to show.ejs by assigning to post variable
    app.get("/tickets/:id",function(req, res) 
    {
       Shift.findById(req.params.id).populate("comments").exec(function(err,foundTicket)
       {
           if(err) {throw err}
           else {res.render("show",{ticket: foundTicket, user: req.user})}
        } );
  });
  
    //5. "EDIT" ROUTE - will take customer to edit.ejs which contains edit form
                //foundBlog will contain blog post retrieved from DB by ID. 
            //We will pass it's value to blogToEdit variable that we have on edit.ejs page
    app.get("/tickets/:id/edit", isLoggedIn, function(req, res) 
    {     Shift.findById(req.params.id,function(err, foundTicket) 
         {
       if(err) {throw err}
       else{res.render("edit" , {ticket: foundTicket, currentUser: req.user})}
         }
     ); } );
     
       //6. "UPDATE" ROUTE  - when submiting edited blog post a PUT request with this information will be send to /blogs/:id
            //req.params.id -  the way it works whatever request recieved dril down to params and within params find "id"
    app.put("/tickets/:id",function(req,res)
    {  Shift.findByIdAndUpdate(req.params.id,req.body.ticket,function(err, updatedticket)
        {
            if(err){throw err}
            else {res.redirect("/tickets/" + req.params.id);}
        }
        );
    });
    
    //7. "DELETE" ROUTE
     app.delete("/tickets/:id", function(req, res)
     {
         //destroy blog post
        Shift.findByIdAndRemove(req.params.id, function(err)
        {    if(err) {throw err}
          //redirect to index route.
        else {res.redirect("/tickets");}
        });
    });
    
    
     //  CREATE ROUTE for comments
  
    app.post("/tickets/:id/comments", isLoggedIn, function(req,res)
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
    
    //  REGISTER ROUTE
                 
    //   show register form page
        app.get("/register",function(req, res) {
            res.render("register");
        });
   
    //   handle sign up logic
        app.post("/register", function(req, res)
        {
        var newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(err, user){
         if(err){
            console.log(err);
             res.render("register");
                }
             passport.authenticate("local")(req, res, function(){
             res.redirect("/tickets"); 
              });
            });
        });
   
  
    //  LOGIN ROUTE
    
     // show login form
     
     app.get("/login",function(req, res) {
        res.render("login",{currentUser:req.user});
    });
    
    // handling login logic
    app.post("/login", passport.authenticate("local", 
        {
        successRedirect: "/tickets", //build in methods that authenticate user.
        failureRedirect: "/tickets/login"
        }), function(req, res){
    });
    
    // logout route
   
    app.get("/logout", function(req, res){
        req.logout();
        res.redirect("/tickets");
    });
    
    //  CHECKS if USER IS LOGED IN?
    function isLoggedIn(req, res, next){
                if(req.isAuthenticated()){
                  return next();
                    }
                    res.redirect("/login");
                }
   
   
app.listen(process.env.PORT,process.env.IP,function(){console.log("Server had been started")});