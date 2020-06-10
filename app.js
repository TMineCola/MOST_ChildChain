require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { ContractListener } = require('./lib/contract-listener');

const indexRouter = require('./routes/index');
const voteRouter = require('./routes/vote');
const crosschainRouter = require('./routes/cross-chain');

// Check legality of ROLE 
(process.env.ROLE !== "BRIDGE" && process.env.ROLE !== "MEMBER") ? process.env.ROLE = "MEMBER" :  process.env.ROLE = process.env.ROLE;

const contractListener = new ContractListener();

contractListener.start();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/vote', voteRouter);
app.use('/crosschain', crosschainRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.MODE === 'DEV' ? err : { infomation: "Internal server error." };

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
