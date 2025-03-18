const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router; 