const createError = require('http-errors');
const express = require('express');
const debug = require('debug')('app');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config()
const ensureToken = require('./middleware/ensureToken');
const app = express();
const cors = require('cors')
// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth')
const botRouter = require('./routes/bot')
const proxyRouter = require('./routes/proxy')



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const whiteList = ['http://localhost:3000/', 'http://localhost:3000']
const corsOptions = {
  origin: (origin, callback)=>{
    if (whiteList.indexOf(origin) !== -1){
      callback(null, true)
    }else{
      callback(new Error('Not Allowed by CORS'))
    }
    optionsSuccessStatus:200
  }
}
// app.use(cors(corsOptions))
app.use(cors({ credentials: true, origin: true }))

// app.use(express.static(path.join(__dirname, 'public')));

// Base Routes
app.use('/api/auth', authRouter);
app.use('/users', usersRouter);
app.use(ensureToken) //Add this before routes that need to be protected ny valid token
app.use('/api/bot', botRouter);
app.use('/api/proxy', proxyRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT, ()=>{
  debug(`Listening on ${process.env.PORT}`);
  
})

module.exports = app;
