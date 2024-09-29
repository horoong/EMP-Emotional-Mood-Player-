import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import config from './index.js';

const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession({
  host: config.MYSQL_HOST,
  port: 3306,
  user: config.MYSQL_USER,
  password: config.MYSQL_PW,
  database: config.MYSQL_NAME,
});

const sessionConfig = {
  key: 'auth_session',
  secret: config.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 * 3,
  },
};

export default sessionConfig;