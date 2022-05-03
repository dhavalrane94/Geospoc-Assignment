const jwt = require("jsonwebtoken");

module.exports = {
  validateRegister: (req, res, next) => {
    // email min length 3
    if (!req.body.email || req.body.email.length < 3) {
      return res.status(400).send({
        msg: 'Please enter a email with min. 3 chars'
      });
    }
    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({
        msg: 'Please enter a password with min. 6 chars'
      });
    }
    // // password (repeat) does not match
    // if (
    //   !req.body.password_repeat ||
    //   req.body.password != req.body.password_repeat
    // ) {
    //   return res.status(400).send({
    //     msg: 'Both passwords must match'
    //   });
    // }
    next();
  },

  isLoggedIn: (req, res, next) => {
    console.log("headers======",req.cookies.userHeader)
    try {
      const token = req.cookies.userHeader;
      const decoded = jwt.verify(
        token,
        'SECRETKEY'
      );
      req.userData = decoded;
      next();
    } catch (err) {
      return res.status(401).send({
        msg: 'Your session is not valid!'
      });
    }
  }
};