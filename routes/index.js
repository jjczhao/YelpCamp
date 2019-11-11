var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");


//root route
router.get('/', function (req, res) {
    res.render('landing');
});




//=============
// AUTH Routes
//=============

//shows register page
router.get("/register", function (req, res) {
    res.render("register");
});

//process register
router.post("/register", function (req, res) {
    User.register(new User({
        username: req.body.username
    }), req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.render("register");
        }
        
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username + "!");
            res.redirect("/campgrounds");
        });
    });
});

//shows login page
router.get("/login", function (req, res) {
    res.render("login");
});

//process login
router.post("/login", passport.authenticate("local", {
    successFlash: "Successfully logged in!",
    failureFlash: "Username or Password is incorrect!",
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}));

//logout route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "Logged out!");
    res.redirect("/campgrounds");
});

module.exports = router;
