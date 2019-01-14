    const   mongoose =         require("mongoose");
    const   Shift =            require("../models/ticketmod");
    const   User =             require("../models/usermod");
    const   middleware  =      require("../middleware.js");
    const   flash    =         require("connect-flash");
    const   ping =             require('ping');
    const   groups =           ['NOC','Operations_data','Operations_Voice','Dev_Ops','Team_Leads','CS_Tier1','CS_Tier2','CS_Tier3'];

    module.exports = (app) => {
        //1. INDEX ROUTE
    
        app.get("/",function(req, res){ 
               res.redirect("/tickets");   
            });
        app.get("/tickets",function(req, res) { 
            if(req.query.search){  
               const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                    Shift.find({ticket: regex}, function(err, tickets)
                        {
                            if(err) {   throw err   }
                                else{res.render("index",{tickets: tickets,currentUser:req.user}); }
                       });
            }
                else{
                    Shift.find({}, function(err, tickets){
                            if(err) {throw err}
                            else{ res.render("index",{tickets: tickets,currentUser:req.user}); }
                        });
                    } 
        });  
               
    
          //1i. INDEX ROUTE - Filtered tickets
        
            app.get("/tickets/external",function(req,res){
                Shift.find({'state': 'external'}, function(err, tickets){
                    if(err) {throw err} else { res.render("index",{tickets: tickets}); }
                });
            });
 
            app.get("/tickets/arch",function(req,res){
                Shift.find({'state': 'archive'}, function(err, tickets){
                    if(err) {throw err} else { res.render("index",{tickets: tickets}); }
                });
            });
 
            app.get("/tickets/monitoring",function(req,res){
                Shift.find({'state': 'monitoring'}, function(err, tickets){
                    if(err) {throw err} else { res.render("index",{tickets: tickets}); }
                });
            });
           
            app.get("/tickets/mytickets", middleware.isLoggedIn, function(req,res){
                    Shift.find({'owner': req.user.username}).exec(function(err,tickets){
                        if(err) {throw err}else{ 
                            res.render("index",{tickets: tickets}); 
                        }
                    });
                });  
                
            app.get("/tickets/mygroup", middleware.isLoggedIn, async function(req,res){
                User.find({'owner': req.user.username}, function(err, foundUser) {
                    if(err) {throw err}
                        else{ 
                            Shift.find( {'group': foundUser.group} ).exec( function(err,tickets){
                                if(err) {throw err}
                                    else{  res.render("index",{tickets: tickets});  }   
                            });
                        }
                });
            });
          
        //2. "NEW" ROUTE
        app.get("/tickets/new", middleware.isLoggedIn, function(req, res) {
              const ticketNumber = Math.random().toString(16).substring(5).toUpperCase()+( Math.floor( Math.random() * 100000 ) ) ;
              const groups = ['Operations_data','Operations_Voice','Dev_Ops','Team_Leads','CS_Tier1','CS_Tier2','CS_Tier3'];
              const carrier = ['ATT', 'Verizon', 'Comcast', 'Sprint', 'T-mobile', 'U.S. Cellular', 'Shentel'] ;
                res.render("new" , {ticketNumber:ticketNumber,currentUser:req.user,groups:groups,carrier:carrier})
        });
    
        //3. "CREATE" ROUTE - POST request to /tickets
        app.post("/tickets", middleware.isLoggedIn, function(req,res){
            //  create a new ticket.
            Shift.create(req.body.ticket, function(err,ticket){
            if(err){throw err , console.log("Something is wrong") }
        //redirect back
            else {res.redirect("/tickets");}
            }
            );
        });
        
        //4. "SHOW" ROUTE.
          app.get("/tickets/:id", async function (req, res) {
          let foundTicket = await Shift.findById(req.params.id).populate("comments").exec()
          let hosts = ( JSON.stringify(foundTicket.fqdn) )
          console.log(hosts)
          let host1 = hosts.substring(2,hosts.length-2).split(',')
          console.log(host1)
        //   .map((h) => h.replace(/[^0-9.]/g, ''));
          let msg=[];
           await Promise.all(
            host1.map((host) => (
             ping.promise.probe(host)
                    .then(function (res) {
                        console.log(res);
                        msg.push(res);
                         console.log(msg);
                    })              
            ))
          )  ;
          
            res.render("show", {
            ticket: foundTicket,
            user: req.user,
            msg: JSON.stringify(msg),
            currentUser: req.user,
          })
        });
      
        //5. "EDIT" ROUTE - will take customer to edit.ejs which contains edit form
                    //foundBlog will contain blog post retrieved from DB by ID. 
                //We will pass it's value to blogToEdit variable that we have on edit.ejs page
        app.get("/tickets/:id/edit", middleware.isLoggedIn, function(req, res) 
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
            else {res.redirect("/");}
            });
        });
        
    }

