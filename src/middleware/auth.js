const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies['x-access-token'];
    if (token) {
      const decoded = jwt.verify(token, `${process.env.TOKEN_KEY}`);

      const user = await User.findOne({
        _id: decoded._id,
        'tokens.token': token,
      });

      if (!user) {
        throw new Error('Something went wrong!');
      }
    } else {
      throw new Error('Authentication Failed! Please Login again!!');
    }
    next();
  } catch (e) {
    let err = e.toString().replace('Error: ', '');
    res.send(
      `<script>alert("${err}");
      location.href="login.html"</script>`
    );
  }
};

module.exports = auth;
