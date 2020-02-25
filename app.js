var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var expressValidator = require('express-validator');
var expressSession = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

var manifest = require('./routes/manifest');
var crud = require('./routes/crud');
var api = require('./routes/api');

var app = express();

require('./config/passport');

app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(expressValidator());
app.use(cookieParser());
app.use(expressSession({secret: '14372ads', saveUninitialized: false, resave: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', manifest);
app.use('/api', api);
app.use('/public', express.static('public'));
app.listen(3000, () => console.log('skeleton on 3000'));
