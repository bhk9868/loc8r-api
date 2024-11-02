const mongoose = require('mongoose');
const readLine = require('readline');
mongoose.set("strictQuery", false);

const dbPassword = process.env.MONGODB_PASSWORD;
const dbURI = `mongodb+srv://myatlasdbuser:${dbPassword}@cluster0.5o6gh.mongodb.net/Loc8r`;


const connect = () => {
  mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.log("MongoDB connection error: ", err));
};

connect();

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
  });
  mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
  });
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
  });

  gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
    });
  };

// For nodemon restarts
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
  // For app termination
  process.on('SIGINT', function() {
    gracefulShutdown('app termination', function () {
      process.exit(0);
    });
  });
  // For Heroku app termination
  process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function () {
      process.exit(0);
    });
  });

  require('./locations');
