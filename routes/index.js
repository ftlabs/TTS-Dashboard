const express = require('express');
const router = express.Router();
//const authS3O = require('@financial-times/s3o-middleware');
const session = require('cookie-session');
const OktaMiddleware = require('@financial-times/okta-express-middleware');

const okta = new OktaMiddleware({
  client_id: process.env.OKTA_CLIENT,
  client_secret: process.env.OKTA_SECRET,
  issuer: process.env.OKTA_ISSUER,
  appBaseUrl: process.env.BASE_URL,
  scope: 'openid offline_access name'
});

router.use(session({
	secret: process.env.SESSION_TOKEN,
	maxAge: 24 * 3600 * 1000, //24h
	httpOnly: true
}));

const services = require('../bin/lib/list-services');

/* GET home page. */
router.get('/',function(req, res, next) {

  router.use(okta.router);
  router.use(okta.ensureAuthenticated());
  router.use(okta.verifyJwts());

  res.render('index', { 
    title: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
    serviceName: process.env.SERVICE_NAME || 'FT Labs TTS Dashboard',
    availableServices : Object.keys(services).map(s => {
      return{
        shortname : s,
        name : services[s].name,
        voices : services[s].voices,
        limit : services[s].limit
      };
    }),
    token : process.env.SERVICE_TOKEN  
  });
});
router.post('/', authS3O);

module.exports = router;
