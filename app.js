    var express =          require("express"),
    app =              express(),
    request =          require("request"),
    methodOverride =   require("method-override"),   
    bodyParser =       require("body-parser"), //body parser allows us to take data from forms and use req.body.parametr ex: req.body.name
    mongoose =         require("mongoose");

//APP CONFIG
    //Connecting to DB and Creating a DATABASE NAMED "blog"
mongoose.connect("mongodb://civilizador:Asimssoft1@ds239648.mlab.com:39648/heroku_tfnzlrqt");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//MONGOOSE MODEL CONFIG

    //Creating Schema for mongodb
var shiftSchema = new mongoose.Schema
(
    {    created: {type: Date, default: Date.now},
        ticket: String,
        fqdn:  String,
        state: String,
        carrier: String,
        last: String,
        next: String,
        owner: String,
        updated: {type: Date, default: Date.now},
        notes: String
        // we will use a default value each time blog created it will post creation time.
    }
);
    //Creating DB model , we will pass a Schema that we just ceated above and any name to call our model in our case "ShiftModel". 
            //And will use it to interact with mongoDB using mongoose methods
var Shift = mongoose.model("Shift", shiftSchema);

// //test entry to our shift to
// Shift.create(
//     { ticket: "INC000015884",
//         fqdn: "10101/T3/HSNRTXQVK00/TULSOKTB",
//             state: "External",
//                 carrier: "ATT",
//                     last: "Tried to reach CL couple times during the night. Was forwarding me to Voice mail.",
//                         next: "Call ATT",
//                           owner: "Asim"
                 
// });


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
    
     //1b. INDEX ROUTE - External Tickets
    
        app.get("/tickets/monitoring",function(req,res)
    {   Shift.find({}, function(err, tickets)
    {if(err) {throw err}
    else{ res.render("monitoring",{tickets: tickets}); }
         });
    });

    //2. "NEW" ROUTE
    app.get("/tickets/new",function(req, res) {
        res.render("new");
    });

    //3. "CREATE" ROUTE - POST request to /tickets
    app.post("/tickets",function(req,res){
    //create a new blog post
    
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
       Shift.findById(req.params.id, function(err,ticket)
       {
           if(err) {throw err}
           else {res.render("show",{ticket: ticket})}
        } );
  });
  
  
  
  //5. "EDIT" ROUTE - will take customer to edit.ejs which contains edit form
                //foundBlog will contain blog post retrieved from DB by ID. 
            //We will pass it's value to blogToEdit variable that we have on edit.ejs page
    app.get("/tickets/:id/edit", function(req, res) 
    {     Shift.findById(req.params.id,function(err, foundticket) 
         {
       if(err) {throw err}
       else{
           res.render("edit" , {ticket: foundticket});
           }
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
  
  
  
  
   
app.listen(process.env.PORT,process.env.IP,function(){console.log("Server had been started")});