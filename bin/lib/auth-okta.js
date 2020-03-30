const express = require('express');
const router = express.Router();
const session = require('cookie-session');

const OktaMiddleware = require('@financial-times/okta-express-middleware');

const okta = new OktaMiddleware({
  client_id: process.env.OKTA_CLIENT,
  client_secret: process.env.OKTA_SECRET,
  issuer: process.env.OKTA_ISSUER,
  appBaseUrl: process.env.BASE_URL,
  scope: 'openid offline_access'
});

router.use(session({
	secret: process.env.SESSION_TOKEN,
	maxAge: 24 * 3600 * 1000, //24h
	httpOnly: true
}));

/* Auth with OKTA */
router.use((req, res, next) => {
  okta.router(req, res, error => {
    if (error) {
      return next(error);
    }
    okta.ensureAuthenticated()(req, res, error => {
      if (error) {
        return next(error);
      }
      okta.verifyJwts()(req, res, next);
    });
  });
});

module.exports = router;
