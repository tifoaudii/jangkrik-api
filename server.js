const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');


const postRoutes = require('./routes/post');
const profileRoutes = require('./routes/profile');
const userRoutes = require('./routes/user');

const app = express();

//DB config
const db = require('./config/keys').mongoURI;

//use bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//use passport middleware and strategy
app.use(passport.initialize());
require('./services/passport')(passport);

//Connect mongoDb using mongoose
mongoose
  .connect(db)
  .then(()=>console.log('connected'))
  .catch(err => console.log(err)); 

//Use routes
postRoutes(app);
profileRoutes(app);
userRoutes(app);


const port = process.env.PORT || 5000;

app.listen(port, ()=> console.log(`server is running in ${port}`));