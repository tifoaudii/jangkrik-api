const User = require('../models/User');
const gravatar = require('gravatar');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');

module.exports = app => {

  app.get('/user', (req,res)=> {
    res.send("hi there")
  });

  app.post('/api/register', async (req,res)=> {
    const user = await User.findOne({ email: req.body.email });

    if(user){
      return res.status(400).json({ error: "email already exist" });
    }else {
      const avatar = gravatar.url(req.body.email, {
        s: '200', //size
        r: 'pg', // rating
        d: 'mm' // default
      });
      
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bycrypt.genSalt(10,(err,salt)=> {
        bycrypt.hash(newUser.password, salt, async (err, hash)=>{
          if(err) throw err;
          newUser.password = hash;
          const user = await newUser.save();

          res.json(user);
        })
      })
    }
  });

  app.post('/api/login', async (req,res)=> {
    const email = req.body.email;
    const password = req.body.password;

    //check email
    const user = await User.findOne({ email });

    if(!user){
      return res.status(400).json({ email: "User not found!"});
    }
    
    //check password
    const userPassword = await bycrypt.compare(password, user.password);

    if(userPassword){
      //sign token to client
      const payload = {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      }

      jwt.sign(payload, keys.secretJWT, { 
        expiresIn: 30*24*60*60*1000 
      },(err, token )=>{
        res.json({
          success: true,
          token: 'bearer ' + token
        })
      });
    }else{
      return res.send({ password: "password incorrect" });
    }
  });

  app.get('/api/current_user',passport.authenticate('jwt', { session: false }),(req,res)=>{
    res.send(req.user);
  });

  app.get('/api/logout', (req,res)=>{
    req.logout();
    res.redirect('/');
  })
}