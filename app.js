// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// -----------------------
// Imports
// -----------------------
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Routers
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

// -----------------------
// Environment Variables
// -----------------------
const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
const secretKey = process.env.SECRET || "fallbackSecret";

// Debug logs
console.log("ATLASDB_URL:", dbUrl);
console.log("SECRET:", secretKey);

// -----------------------
// Database Connection
// -----------------------
async function main() {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB:", dbUrl);
}

main().catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
});

// -----------------------
// View Engine & Middleware
// -----------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// -----------------------
// Session Store Setup
// -----------------------
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secretKey,
    },
    touchAfter: 24 * 3600, // 1 day in seconds
});

store.on("error", (err) => {
    console.log("❌ Mongo Store Error:", err);
});

const sessionOptions = {
    store,
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// -----------------------
// Passport Configuration
// -----------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -----------------------
// Flash Messages Middleware
// -----------------------
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// -----------------------
// Routes
// -----------------------
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// -----------------------
// 404 & Error Handling
// -----------------------
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    res.status(status).render("error.ejs", { message });
});

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
