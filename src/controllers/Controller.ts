import { urlencoded } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as validator from 'express-validator';
import * as logger from 'morgan';
import * as passport from 'passport';
import { join } from 'path';
import Auth from '../Auth';
import { router as api } from './api';
import { IUserModel } from '../models/v1/user';
const app = express();
app.use((req, res, next) => {
  // Allow access from other domain
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  // No cache kept in local
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});
app.use(express.static(join(__dirname, '../public')));
app.use(urlencoded({
  extended: true,
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'TEST'));
app.use(validator());
app.use(logger('dev'));
app.use(Auth.initialize());

app.use('/api', api);

app.get('/testget', (req, res) => {
  return res.status(200).send({ gg: 'ez' });
});

declare global {
  namespace Express{
      interface Request {
          user?: User;
      }
      interface User extends IUserModel {
        [_: string]: any;
      }
  }
}

export default app;
