var express = require('express');
var indexrouter = express.Router();
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');
var axios = require('axios');
//display welcome page
indexrouter.get('/', function(req, res, next){    
    res.render('welcome', {
        title: 'Welcome'
    })
  })

module.exports = indexrouter;