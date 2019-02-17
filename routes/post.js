const passport = require('passport');
const Post = require('../models/Post');
const Profile = require('../models/Profile');

module.exports = app => {
  //testing
  app.get('/api/test', (req, res) => {
    res.json({ message: "post work" })
  });

  //create a post
  app.post('/api/post', passport.authenticate('jwt', { session: false }), async (req, res) => {

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    await newPost.save();
    res.json(newPost);
  });

  //get all posts
  app.get('/api/post', async (req,res) => {
    const post = await Post.find().populate('user',['name','avatar']).sort({ date: -1 });

    if(!post){
      return res.status(401).json({ error: 'there are no post'})
    }
    res.json(post)
  });

  //fetch post by id
  app.get('/api/post/:id', async(req,res)=> {
    const post = await Post.findById(req.params.id);

    if(!post){
      return res.status(401).json({ error: 'post not detected' });
    }else{
      res.json(post)
    }
  });

  //delete post
  app.delete('/api/post/delete/:id',passport.authenticate('jwt', { session: false }), async (req,res)=>{
    const deletedPost = await Post.findById(req.params.id);

    if(deletedPost.user.toString() !== req.user.id){
      return res.status(401).json({ error: 'you are not authorize'});
    }

    deletedPost.remove().then(()=>res.json({ message: 'delete post is success'}));
  });

  //add like to the post
  app.post('/api/post/like/:id', passport.authenticate('jwt', { session: false }), async(req,res)=>{
    let post = await Post.findById(req.params.id);

    if(!post){
      return res.status(401).json({ error: 'there is no post'});
    }

    if((post.likes.filter(like => like.user.toString() === req.user.id)) < 1){
      post.likes.push({ user: req.user });
      await post.save();
      
      res.json(post);
    }else{
      post.likes = post.likes.filter(like => like.user.toString() !== req.user.id );
      await post.save();

      res.json(post);
    }
  });

  //add comment
  app.post('/api/post/comment/:id', passport.authenticate('jwt', { session: false }), async (req,res)=>{
    const post = await Post.findById(req.params.id);

    const createComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };

    post.comments.push(createComment);
    await post.save();
    res.json(post);
  });

  
  //delete comment
  app.delete('/api/post/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), async (req,res)=>{
    const post = await Post.findById(req.params.id);
    const removedIndexComment = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id);

    //delete comment by using splices
    post.comments.splice(removedIndexComment, 1);
    const updatedPost = await post.save();
    res.json(updatedPost);
  });

};