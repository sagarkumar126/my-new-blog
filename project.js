require('dotenv').config();
const session = require('express-session');
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');
const passport = require('./server/config/passport');

const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routehelpers');

const app = express();
const Port = process.env.PORT || 5000;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const User = require('./server/models/User');
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.locals.isActiveRoute = isActiveRoute;

// Set locals.user + currentUserId from JWT token (available in EVERY view)
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
      res.locals.currentUserId = decoded.userId;  // ⭐ global for index.ejs
    } catch (err) {
      res.locals.user = null;
      res.locals.currentUserId = null;
    }
  } else {
    res.locals.user = null;
    res.locals.currentUserId = null;
  }
  next();
});

app.set('layout extractLocals', true);

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));
app.use('/auth', require('./server/routes/auth'));

app.listen(Port, () => {
  console.log(`App is listening on port ${Port}`);
});




