const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');
var axios = require('axios');

//display signup page
router.get('/signUp', function (req, res, next) {
  console.log("signup route", req.originalUrl)
  res.render('signup', {
    title: 'signup',
    name: '',
    email: '',
    phonenumber: '',
    password: ''
  })
})

//display login page
router.get('/login', function (req, res, next) {
  console.log("Login route")
  res.render('login', {
    title: 'Login',
    email: '',
    password: ''
  })
})
router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
  console.log("req signup=====", req.body)
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
        req.body.email
      )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: 'This email is already in use!'
        });
      } else {
        // email is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO users (name, email, phone_number, password) VALUES (  ${db.escape(
                  req.body.name
                )}, ${db.escape(
                  req.body.email
                )}, ${db.escape(
                  req.body.phone_number
                )}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err
                  });
                }
                // return res.status(201).send({
                //   msg: 'Registered!'
                // });
                res.render('registered', {
                  title: 'Welcome You Are Registered Successfully...!'
                })
              }
            );
          }
        });
      }
    }
  );
});

router.post('/authenticationLogin', (req, res, next) => {
  console.log("auth====", req.body)
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: 'email or password is incorrect!'
        });
      }
      // check password
      console.log("name=====", result[0]['name'])
      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: 'email or password is incorrect!'
            });
          }
          if (bResult) {
            const token = jwt.sign({
                email: result[0].email,
                userId: result[0].id
              },
              'SECRETKEY', {
                expiresIn: '7d'
              }
            );
            // db.query(
            //   `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            // );
            // res.status(200).send({
            //   msg: 'Logged in!',
            //   token,
            //   user: result[0]
            // });
            // return res.render('home', {
            //   title: 'Home',
            //   name: result[0]['name'],
            //   courrency_result: ""
            // })
            res.cookie("userHeader",token,{
              expires:new Date(Date.now() + 86400),
              httpOnly: true
            });
            return res.redirect('home')
          }
          return res.status(401).send({
            msg: 'email or password is incorrect!'
          });
        }
      );
    }
  );
});

//display home page
router.get('/home', userMiddleware.isLoggedIn, function (req, res, next) {
  if (true) {
    res.render('home', {
      title: "Dashboard",
      name: 'Geospoc',
      courrency_result: ""
    });
  } else {
    req.flash('success', 'Please login first!');
    res.redirect('login');
  }
});

//Convert Currency
router.post('/convertcurrency', userMiddleware.isLoggedIn, (req, res, next) => {
  console.log("convert====", req.body)
    let query = req.body.from + '_' + req.body.to;
    let apiKey = '2544df131aea40ddb7e2';
    let amount = 10;
    let total;
    const options = {
      method: 'GET',
      url: 'https://free.currconv.com/api/v7/convert?q=' + query + '&compact=ultra&apiKey=' + apiKey,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    axios.request(options).then((response) => {
      if (response.data[query]) {
        total = response.data[query] * amount;
        res.render('home', {
          title: "Dashboard",
          name: 'Geospoc',
          courrency_result: Math. round(total),
        });
      }
    }).catch(function (error) {
      console.error(error);
    });
})

// Logout user
router.get('/logout', userMiddleware.isLoggedIn, function (req, res) {
  res.redirect('login');
});

module.exports = router;