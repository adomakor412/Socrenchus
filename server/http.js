import express from 'express';
import graphqlHTTP from 'express-graphql';
import { graphqlBatchHTTPWrapper } from 'react-relay-network-layer';
var app = express();
import proxy from 'express-http-proxy';
import request from 'superagent';
import md5 from 'md5';

import passport from 'passport';
import bodyParser from 'body-parser';
import BearerStrategy from 'passport-http-bearer';
import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';

// <GraphQL>
import {schema, graphql} from './graphql';
// </GraphQL>

import {User} from './bookshelf';

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(passport.initialize());

if (process.env.NODE_ENV === "production") {
  app.use('/index.ios.bundle', express.static('ios/main.jsbundle'));
  app.use('/index.android.bundle', express.static('android/app/src/main/assets/index.android.bundle'));
} else {
  app.get('/index.ios.bundle', proxy('localhost:8081', function (req, res) {
    return {
      forwardPath: function(req, res) {
        return '/index.ios.bundle'
      }
    }
  }));
  app.get('/index.android.bundle', proxy('localhost:8081', function (req, res) {
    return {
      forwardPath: function(req, res) {
        return '/index.android.bundle'
      }
    }
  }));
}

app.use('/static', express.static('server/static'));

passport.use(new BearerStrategy({passReqToCallback: true}, function(req, token, done) {
  const { fcm_token } = req.body;
  console.log('the fcm token: ', req.body)
  request
  .get('https://graph.facebook.com/me')
  .query({
    fields: 'id,name,email,picture{url}',
    access_token: token,
  })
  .accept('json')
  .end(function(err, res){
    if (err) { return done(err); }
    let { id, name, email, picture } = res.body;
    let avatar_url = picture.data.url;
    let facebook_id = id;
    const query = { where: { facebook_id } };
    if (fcm_token) {
      query.orWhere = { fcm_token };
    }
    User.findOrCreate(query, { name, email, avatar_url }).asCallback((err, user) => {
      if (err) { return done(err, false); }
      if (user.facebook_id && user.facebook_id != '' && facebook_id != user.facebook_id) {
        return done('Sorry, only one login per device right now.', false)
      }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  });
}));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: process.env.JWT_SECRET
}, function(jwt_payload, done) {
  User.forge({id: jwt_payload.user_id}).fetch().asCallback((err, user) => {
    if (err) {
        return done(err, false);
    }
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
  });
}));

app.post('/login',
  passport.authenticate('bearer', {session: false}),
  function(req, res) {
    console.log('authenticated!!');
    res.send({
      jwt: jwt.sign({ user_id: req.user.get('id') }, process.env.JWT_SECRET, {expiresIn: '7d'})
    });
  });

app.post('/try_without_login',
  function(req, res) {
    console.log('anonymous!!');
    User.findOrCreate({ fcm_token: req.body.fcm_token }, {
      name: 'Anonymous Coward',
      email: `${md5(req.body.fcm_token + 'fcm_token')}@example.com`
    }, {overwrite: false}).asCallback((err, user) => {
      if (err) {
        console.error(err);
      } else {
        if (user.isAnonymous()) {
          res.send({
            jwt: jwt.sign({ user_id: user.get('id') }, process.env.JWT_SECRET, {expiresIn: '7d'})
          });
        } else {
          const error = "Can't try without login once you've already logged in!"
          console.error(error);
          res.status(500);
          res.send({error});
        }
      }
    });
  });

app.use('/location',
  passport.authenticate('jwt', {session: false}),
  function(req, res) {
    req.user.updateLocation(req.body.location.coords);
    res.send();
  }
);

app.use('/fcm',
  passport.authenticate('jwt', {session: false}),
  function(req, res) {
    req.user.updateFCMToken(req.body.token);
    res.send();
  }
);

const middleware = [
  passport.authenticate('jwt', {session: false, failWithError: true}),
  function(err, req, res, next) {
    return res.status(401).send({ success: false, message: err })
  }
];

const graphqlServer = graphqlHTTP((req) => ({
  schema,
  rootValue: { currentUserID: req.user.get('id') },
  pretty: true,
}));

app.use('/graphql/batch',
  ...middleware,
  graphqlBatchHTTPWrapper(graphqlServer)
);

app.use('/graphql',
  ...middleware,
  graphqlServer
);


app.use('/graphql-debug', graphqlHTTP((req) => {
  if (process.env.NODE_ENV !== 'production') {
    return {
      schema,
      rootValue: { currentUserID: req.query.userID || 1 },
      graphiql: true
    };
  }
}));

app.get('/', function(req, res) {
  let output = `
    <body style="margin:0;">
      <iframe
        scrolling="no"
        style="height:100%;width:100%;border-style:none;"
        src="${process.env.IFRAME_LINK}"/>
    </body>
  `
  res.send(output);
});

module.exports = function(http) {
  return http.createServer(app);
}

