require('dotenv').config();
const createError = require("http-errors");
const express = require("express");
const cors = require('cors')
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require('mongoose');
const passport = require("passport");

//const indexRouter = require("./routes/index");
//const pingRouter = require("./routes/ping");
const conversationRouter = require("./routes/conversation");
const invitationRouter = require("./routes/invitation");
const userRouter = require("./routes/user");

const { json, urlencoded } = express;

//initial db setup
const dbUsername = process.env.DB_USERNAME;
const dbPwd = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbUrl= `mongodb+srv://${dbUsername}:${dbPwd}@cluster0-wkjls.mongodb.net/${dbName}?retryWrites=true&w=majority`;

var app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

if (process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, "../client/public")));
}

app.use(logger("dev"));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());
require("./controllers/passportJwtStrategy")(passport);

app.use("/conversations", conversationRouter);
app.use("/invitations", passport.authenticate('jwt', { session: false}), invitationRouter);
app.use("/user", userRouter);

if (process.env.NODE_ENV === 'production') {
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

mongoose.set('useFindAndModify', false);
//connect to mongodb
mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true})
        .then(_res => console.log('Successfully connected to Cloud mongodb'))
        .catch(_err => console.error('Could not connect to Cloud mongodb'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
