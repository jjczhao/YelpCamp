var express          = require('express'),
    app              = express(),
    bodyParser       = require('body-parser'),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    methodOverride   = require("method-override"),
    flash            = require("connect-flash"),
    User             = require("./models/user"),
    Comment          = require("./models/comment"),
    Campground       = require("./models/campground"),
    seedDb           = require("./seeding");

var commentRoutes = require("./routes/comments"),
    campgroundRoute = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");



mongoose.connect("mongodb://localhost:27017/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


//seedDb();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Passport configuration
app.locals.moment = require("moment");
app.use(require("express-session")({
    secret: "This is the best app ever",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(8000, function () {
    console.log('server is listening on port 8000');
});