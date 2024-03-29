var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var comment = require("../models/comment");
var middleware = require("../middleware");

router.get('/', function (req, res) {

    Campground.find({}, function (err, campgrounds) {
        if (err) {
            req.flash("error", "Error finding campgrounds!");
        } else {
            res.render('campgrounds/index', {
                campgrounds: campgrounds,
                page: 'campgrounds'
            });
        }
    });
    // res.render('campgrounds', {
    //     campgrounds: campgrounds
    // });
});

router.post('/', middleware.isLoggedIn, function (req, res) {
    //get data from form and add to campgrounds array
    // redirect back to campgrounds page
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    // campgrounds.push({
    //     name: name,
    //     image: image
    // });
    Campground.create({
        name: name,
        image: image,
        description: description,
        price: price,
        author: author,
        likes:[]
    }, function (err, newlyCreated) {
        if (err) {
            req.flash("error", "Error in create new campground page!");
        } else {
            req.flash("success", "Successfully created" + newlyCreated.name + "page!");
            res.redirect('/campgrounds');
        }
    });

});

router.get('/new', middleware.isLoggedIn, function (req, res) {
    res.render('campgrounds/new');
});

router.get('/:id', function (req, res) {
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments likes").exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            res.render('campgrounds/shows', {
                campground: foundCampground
            });
        }
    });
});


// Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("back");
        }
        res.render("campgrounds/edit", {
            campground: foundCampground
        });
    });
});
// Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, editedCampground) {
        if (err) {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Successfully edited campground!");
            res.redirect("/campgrounds/" + editedCampground._id);
        }
    });
});

// delete campground
router.delete('/:id', middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err, removedCampground) {
        if (err || !removedCampground) {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({_id: {$in: removedCampground.comments}}, function(err){
                if(err){
                    req.flash("error", "Comments not found!");
                    return res.redirect("/campgrounds");
                }
                req.flash("success", "Successfully removed campground!");
                res.redirect("/campgrounds");
            });
        }
    });
});


// like and unlike route
router.post("/:id/like", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        
        var foundUserLike = foundCampground.likes.some(function(like){
            return like.equals(req.user._id);
        });

        if(foundUserLike){
            foundCampground.likes.pull(req.user._id);
        }else{
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function(err){
            if(err){
                req.flash("error", "Something went wrong!");
                return res.redirect("/campgrounds");
            }

            return res.redirect("/campgrounds/"+ foundCampground._id);
        });
    });  
});





module.exports = router;