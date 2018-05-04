var express = require("express");
var router  = express.Router();
var Entry = require("../models/entry");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//
router.get("/", function(req, res){
  res.redirect("/entries/search");
});

//INDEX - show all entries
router.get("/search", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all entries from DB
      Entry.find({name: regex}, function(err, allEntries){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allEntries);
         }
      });
  } else {
      // Get all entries from DB
      Entry.find({}, function(err, allEntries){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allEntries);
            } else {
              res.render("entries/index",{entries: allEntries, page: 'entries'});
            }
         }
      });
  }
});

//CREATE - add new entry to DB
router.post("/search", middleware.isLoggedIn, function(req, res){
  // get data from form and add to entries array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }

  var newEntry = {
    name: name, 
    image: image, 
    description: desc, 
    author:author
  };
  // Create a new entry and save to DB
  Entry.create(newEntry, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else {
          //redirect back to entries page
          console.log(newlyCreated);
          res.redirect("/entries/search");
      }

  });
});

//NEW - show form to create new entry
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("entries/new"); 
});

// SHOW - shows more info about one entry
router.get("/:id", function(req, res){
    //find the entry with provided ID
    Entry.findById(req.params.id).populate("comments").exec(function(err, foundEntry){
        if(err){
          console.log(err);
        } else {
          console.log(foundEntry)
          //render show template with that entry
          res.render("entries/show", {entry: foundEntry});
        }
    });
});

router.get("/:id/edit", middleware.checkUserEntry, function(req, res){
    //find the entry with provided ID
    Entry.findById(req.params.id, function(err, foundEntry){
        if(err){
            console.log(err);
        } else {
            //render show template with that entry
            res.render("entries/edit", {entry: foundEntry});
        }
    });
});

router.put("/:id", function(req, res){
   
    var newData = {
      name: req.body.name, 
      image: req.body.image, 
      description: req.body.description, 
    };

    Entry.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, entry){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/entries/" + entry._id);
        }
  });
});

router.delete("/:id", function(req, res) {
  Entry.findByIdAndRemove(req.params.id, function(err, entry) {
    Comment.remove({
      _id: {
        $in: entry.comments
      }
    }, function(err, comments) {
      req.flash('error', entry.name + ' deleted!');
      res.redirect('/entries/search');
    })
  });
});

module.exports = router;

