var express = require('express');
var path = require('path');
// Permet de lire les cookies
var cookieParser = require('cookie-parser');
const logger = require("morgan");
const middlewareLogIn = require("./middleware/authMiddleware")

//  const bodyParser = require('body-parser');

let cors = require("cors")

// 
const corsOption = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false

}




var indexRouter = require('./routes/index');
let usersRouter = require('./routes/user.routes');
let postRouter = require('./routes/post.routes')

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Permet de se connecter directement si le cookie est présent 
app.get('/jwtid', middlewareLogIn.logInMiddleware, (req, res) => {
    res.status(200).send("Connexion réussie")

})
// app.use(cors(corsOption));
app.use(
    cors({
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    })
  );

app.use('/', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/post', postRouter)



module.exports = app;
