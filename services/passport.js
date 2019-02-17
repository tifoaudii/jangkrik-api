const jwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model('users');


const opts = {};
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretJWT;

module.exports = passport => {
  passport.use(new jwtStrategy(opts, async (jwt_payload, done)=>{
  const user = await User.findById(jwt_payload.id);

  if(user){
    return done(null,user);
  }
  return done(null,false);
  }));
}