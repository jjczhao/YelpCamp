var express = require("express");

var router = express.Router({
    mergeParams: true
});
var Campground = require("../models/campground"),
    Comment = require("../models/comment");

var middleware = require("../middleware");

// ============================
// Comment routes
// ============================

// new comment form page
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", "Campground not found!");
        } else {
            res.render("comments/new", {
                campground: campground
            });
        }
    });
});

// insert to comments database
router.post("/", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong!");
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment posted!");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampgound) {
        if (err || !foundCampgound) {
            req.flash("error", "No campground found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                req.flash("error", "Ops..Something went wrong!");
                res.redirect("back");
            } else {
                res.render('comments/edit', {
                    campground_id: req.params.id,
                    comment: foundComment
                });
            }
        });
    });
});

// update comment in database
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            req.flash("error", "Ops..Something went wrong!");
            res.redirect("back");
        } else {
            req.flash("success", "Successfully edited comment!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// delete route
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function (err) {
        if (err) {
            req.flash("error", "Ops..Something went wrong!");
            res.redirect("back");
        } else {
            req.flash("success", "successfully deleted comment!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


module.exports = router;