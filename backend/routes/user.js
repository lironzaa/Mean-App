const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            message: 'User created!',
            result: result
          })
        })
        .catch(err => {
          res.status(500).json({
            error: err
          })
        })
    })
})

router.post('/login', (req, res) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: 'Auth failed'
        })
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
    })
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: 'Auth failed'
        })
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'secret_JWT',
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token,
        expiresIn: 3600
      })
    })
    .catch(err => {
      return res.status(404).json({
        message: 'Auth failed'
      })
    })
});

module.exports = router;