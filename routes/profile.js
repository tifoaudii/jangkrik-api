const passport = require('passport');
const Profile = require('../models/Profile');

module.exports = app => {

  //get current user's profile
  app.get('/api/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar']);

    if (!profile) {
      res.status(400).json({
        error: "there is no profile for this user"
      });
    }

    res.json(profile);
  });

  app.post('/api/profile', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      //get fields
      const profileFields = {};
      profileFields.user = req.user.id;
      profileFields.username = req.body.name;
      profileFields.handle = (req.body.handle) ? req.body.handle : '';
      profileFields.company = (req.body.company) ? req.body.company : '';
      profileFields.website = (req.body.website) ? req.body.website : '';
      profileFields.location = (req.body.location) ? req.body.location : '';
      profileFields.bio = (req.body.bio) ? req.body.bio : '';
      profileFields.status = (req.body.status) ? req.body.status : '';
      profileFields.github = (req.body.github) ? req.body.github : '';
      profileFields.skills = (req.body.skills !== undefined) ? req.body.skills : '';
      profileFields.social = {
        youtube: (req.body.youtube) ? req.body.youtube : '',
        instagram: (req.body.instagram) ? req.body.instagram : '',
        facebook: (req.body.facebook) ? req.body.facebook : '',
        linkedin: (req.body.linkedin) ? req.body.linkedin : '',
      };

      //check the user's profile
      const profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update
        const newProfile = await Profile.findOneAndUpdate(
          { user: req.user.id }, 
          { $set: profileFields },
          { new: true }
        );

        res.json(newProfile);
      }else{
        //check if handle exist
        const profile = await Profile.findOne({ handle: profileFields.handle });
        if(profile){
          res.status(400).json({ error: "that handle already exist" });
        }
        //create new profile
        const createProfile = new Profile(profileFields);
        const newProfile = await createProfile.save();
        res.json(newProfile);
      }
    }
  );

  app.get('/api/profile/handle/:handle', async (req,res)=>{
    const handle = await Profile.findOne({ handle: req.params.handle}).populate('user', ['name','avatar']);

    if(!handle){
      res.status(400).json({ error: "user's profile not defined" });
    }else {
      res.json(handle);
    }
  });

  app.get('/api/profile/user_id/:user_id', async (req,res)=>{
    const id = await Profile.findOne({ _id : req.params.user_id }).populate('user', ['name','avatar']);

    if(!id){
      res.status(400).json({ error: "user's profile not defined" });
    }else {
      res.json(id);
    }
  });
}