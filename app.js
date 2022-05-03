const express = require('express');
const app = express();
const cors = require('cors');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const indexrouter = require('./routes/index');
const authrouter = require('./routes/auth.js');
// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(cors());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
// add routes
app.use('/', indexrouter);
app.use('/api', authrouter);

// set up port
const PORT = process.env.PORT || 3005;
// run server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));