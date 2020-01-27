import signale from '../logger';
signale.await('creating apollo graphql server');

import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';
import helmet from 'helmet';
import express from 'express';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import { validateToken } from '../helpers/auth';
import { getTokenFromReq } from '../helpers/utils';
import prismaClient from './prismaClient';

// server port
const port = Number(process.env.PORT || 4000);

// graphQl server creation
import createServer from './createServer';
const apollo = createServer();

// express server
const app = express();

// middlewares
signale.await('initializing express middlewares');
app.use(compress());
app.use(helmet());
app.use(helmet({ hidePoweredBy: true }));
// rate limit middleware only in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 300,
  });
  app.use(limiter);
}
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cookieParser(process.env.COOKIE_SECRET || 'v4a87x87taxmy'));

// graphdoc auto-generated graphql doc
app.use('/', express.static('graphdoc'));

// decode the JWT so we can get the user on each request
app.use((req, _res, next) => {
  const token = getTokenFromReq(req);
  if (token) {
    const decodedToken = validateToken(token);
    if (decodedToken) {
      req.userId = decodedToken.userId;
    }
  }
  next();
});

// create a middleware that populates the user on each request
app.use(async (req, _res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next();
  const user = await prismaClient.users.findOne({ where: { id: String(req.userId) } });
  if (user) {
    req.user = user;
  }
  next();
});

apollo.applyMiddleware({
  app,
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URLS?.split(','),
  },
});

const server = app.listen(port, () => {
  signale.success(`\u{1F680}  server ready at http://localhost:${port}${apollo.graphqlPath}`);
});

// Add subscription support
apollo.installSubscriptionHandlers(server);

export default server;
