require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport'); // Required before the database models
require('./app_api/models/db');
require('./app_api/config/passport'); // Configuration after the database models


//var indexRouter = require('./routes/index');
//var usersRouter = require('./app_api/models/users');
//const indexRouter = require('./app_server/routes/index');
const apiRouter = require('./app_api/routes/index');


//app.use('/', indexRouter);


const app = express();


const cors = require('cors');
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-type, Accept, Authorization');
  next();
});

app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build')));
app.use(passport.initialize());

// app.use('/', indexRouter);
app.use('/api', apiRouter);


// const corsOptions = {
//   origin: '*',
//   allowedHeaders: ['Origin', 'X-Requested-With', 'Content-type', 'Accept', 'Authorization'],
// };

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public', 'build')));
app.use(passport.initialize());
//app.use('/users', usersRouter);
app.use(cors(corsOptions));
app.use('/api', apiRouter);

// app.use(express.static(path.join(__dirname, 'dist/loc8r-public')));


// app.get('*', function (req, res, next) {
//   res.sendFile(path.join(__dirname, 'app_public', 'dist/loc8r-public', 'index.html'));
// });

// app.get(/(\/about)|(\/location\/[a-z0-9]{24})/, function (req, res, next) {
//   res.sendFile(path.join(__dirname, 'app_public', 'build/browser', 'index.html'));
// });

// app.use('/api', (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept, Authorization");
//   next();
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// error handlers
// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      res
          .status(401)
          .json({ "message": err.name + ": " + err.message });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Render!');
});

// 포트를 열고 모든 IP 주소에서 요청을 받도록 설정
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
