const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const transporter = require('../../mailer');
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register users
// @access  Public
router.post(
  '/',
  [
    check('firstname', 'Firstname is required').not().isEmpty(),
    check('lastname', 'Lastname is required').not().isEmpty(),
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'firstname',
      'Please enter a firstname less than 15 characters'
    ).isLength({ max: 15 }),
    check(
      'lastname',
      'Please enter a lastname less than 15 characters'
    ).isLength({ max: 15 }),
    check(
      'username',
      'Please enter a username less than 15 characters'
    ).isLength({ max: 15 }),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      retStatus = 'Error';
      return res.send({
        retStatus: retStatus,
        authorized: false,
        msg:
          'An error as occured. Please verify the informations provided and try again.',
      });
    }

    const { firstname, lastname, username, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        retStatus = 'Error';
        return res.send({
          retStatus: retStatus,
          authorized: false,
          msg: 'User already exists. Either change the username or email.',
        });
      }
      user = await User.findOne({ username });
      if (user) {
        retStatus = 'Error';
        return res.send({
          retStatus: retStatus,
          authorized: false,
          msg: 'User already exists. Either change the username or email.',
        });
      }

      // Create User
      user = new User({
        firstname,
        lastname,
        username,
        email,
        password,
      });

      // Add randomness by genSalt using bcrypt, and then encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user in Database
      await user.save();

      // Get payload

      const payload = {
        user: {
          id: user.id,
        },
      };

      // Use payload and token to sign token

      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          user.token = token;
          user.save();
          const url = `http://localhost:3000/confirmation/${token}`;
          const html = `Hello, <br />Thank you for signing up for Hypertube.<br /><br />Please click the link below to activate your account:<br /><a href=${url}>${url}</a>`;

          var mailOptions = {
            from: 'no-reply.hypertube@outlook.com',
            to: user.email,
            subject: 'Confirm your Hypertube Account',
            html: html,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.json({ token }); // callback : if no error, get token
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/users/:id
// @desc    Create or update user's profile
// @access  Private
router.post(
  '/:id',
  [
    auth,
    [
      check('lang', 'Lang is required').isIn(['fr', 'en', 'es']),
      check('username', 'Please fill in username').not().isEmpty(),
      check('firstname', 'Please fill in first name').not().isEmpty(),
      check('lastname', 'Please fill in last name').not().isEmpty(),
      check('email', 'Please ensure email is in correct format').isEmail(),
      check('firstname', 'First name is too long').isLength({ max: 15 }),
      check('lastname', 'Last name is too long').isLength({ max: 15 }),
      check('username','Username is too long').isLength({ max: 15 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      retStatus = 'Error';
      return res.send({
        retStatus: retStatus,
        authorized: false,
        msg:
          'An error as occured. Please verify the informations provided and try again.',
      });
    }
    const { username, firstname, lastname, email, lang } = req.body;
    const userFields = {
      _id: req.user.id,
      username: username,
      firstname: firstname,
      lastname: lastname,
      email: email,
      lang: lang,
    };
    try {
      let user = await User.findOne({ _id: req.user.id }).select('-password');
      if (email !== user.email) {
        let newMail = await User.findOne({ email: email });
        if (newMail) {
          retStatus = 'Error';
          return res.send({
            retStatus: retStatus,
            authorized: false,
            msg: 'Username or email taken. Choose another one.',
          });
        }
      }
      if (username !== user.username) {
        let newUsername = await User.findOne({ username: username });
        if (newUsername) {
          retStatus = 'Error';
          return res.send({
            retStatus: retStatus,
            authorized: false,
            msg: 'Username or email taken. Choose another one.',
          });
        }
      }
      if (user) {
        user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: userFields },
          { new: true }
        );
        return res.json(user);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/resetPWD/:id',
  [
    auth,
    [
      check('password', 'Please fill in password').not().isEmpty(),
      check('password2', 'Please fill confirm password').not().isEmpty(),
      check(
        'password',
        'Password must at least contain 6 characters'
      ).isLength({ min: 6 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      retStatus = 'Error';
      return res.send({
        retStatus: retStatus,
        authorized: false,
        msg:
          'An error as occured. Please verify the informations provided and try again.',
      });
    }
    const { password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const userFields = {
      _id: req.user.id,
      password: await bcrypt.hash(password, salt),
    };
    try {
      let user = await User.findOne({ _id: req.user.id }).select(
        '-username -password'
      );

      if (user) {
        user = await User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: userFields },
          { new: true }
        );
        return res.json(user);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
