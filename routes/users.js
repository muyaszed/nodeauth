var express = require('express');
var router = express.Router();
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const uploads = multer({dest: './uploads'});
const { body, validationResult } = require('express-validator/check');
const User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'login'});
});

// router.post('/login',
//
//   passport.authenticate('local'),
//   function(req, res) {
//    res.redirect('/users/profile');
// });

// passport.use(new LocalStrategy(function(username, password, done){
//
//   User.getUserByUsername(username, function(err, user){
//     if(err) throw err;
//     if(!user){
//       return done(null, false, {message: 'Unknown User'});
//     }
//
//     User.comparePassword(password, user.password, function(err, isMatch){
//       if(err) return done(err);
//       if(isMatch){
//         return done(null, user);
//       } else {
//         return done(null, false, {message:'Invalid Password'});
//       }
//     });
//   });
// }));


router.post('/login',
  passport.authenticate('local', { successRedirect: '/users/profile',
                                    successFlash: "Welcome, you are signed in",
                                    failureRedirect: '/users/login',
                                    failureFlash: true
                                  }));

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({username: username}, function(err, user) {
      console.log('Check username');
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, {message: 'Incorrect username.'});
      }

      const a = User.validPassword(password, user);

      a.then(res => {
        console.log(`The response: ${res}`);
        if (!res) {
          return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
      }).catch(err => {
        return done(null, false, {message: 'There are problem.'});
      });

      // if (!a) {
      //   console.log("i'm here");
      //   return done(null, false, {message: 'Incorrect password.'});
      // }
      //
      // return done(null, user);
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// passport.deserializeUser(function(id, done) {
//   User.getUserById(id, function(err, user) {
//     done(err, user);
//   });
// });
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


router.get('/profile', allowedAccess, function(re, res, next) {
  res.render('profile', {title: 'profile'});
});

router.get('/logout', function(req, res){

  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/');
});

router.post('/register', uploads.single('profile-image'), [
  body('inputName').isLength({min: 1}).withMessage('Name cannot be empty'),
  body('inputEmail').isLength({min: 1}).withMessage('Email cannot be empty').isEmail().withMessage('Please insert correct email address'),
  body('inputUsername').isLength({min: 1}).withMessage('Username cannot be empty'),
  body('inputPassword').isLength({min: 6}).withMessage('Password cannot be empty'),
  body('inputConfirmPassword').isLength({min: 1}).withMessage('Password confirmation cannot be empty').custom(
    (value, {req}) => value === req.body.inputPassword
  ).withMessage('Password is not the same')
], function(req, res, next) {
  console.log(req.body.inputName);
  const name = req.body.inputName;
  const email = req.body.inputEmail;
  const username = req.body.inputUsername;
  const password = req.body.inputPassword;
  const passwordConfirm = req.body.inputConfirmPassword;
  let profileImage = '';

  //default image if no image is uploaded
  if(req.file) {
    console.log("Uploading file.....");
    profileImage = req.file.filename;
  }else {
    console.log('No file uploded....');
    profileImage = 'noimage.jpg';
  }

  const errors = validationResult(req);

  //validation error handling
  if (!errors.isEmpty()) {
    console.log(errors.array());
    res.render('register', {
      errors: errors
    });
  } else {
    console.log("No errors");
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password,
      profileimage: profileImage
    });

    User.createUser(newUser, function(err, user) {
      if (err) throw err;
      console.log(user);
    });


    res.location('/users/profile');
    res.redirect('/users/profile');
  }



});

function allowedAccess(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }else {
    res.redirect('/users/login');
  }
}

module.exports = router;
