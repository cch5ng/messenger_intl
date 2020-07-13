const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY
};

module.exports = passportJwtStrategy => {
  passportJwtStrategy.use(
    new JwtStrategy(opts, (jwt_payload, done ) => {
      User.findById(jwt_payload.id)
          .then(user => {
            if(user) {
              return done(null, user);
            }
            return done(null, false);
          })
          .catch(err => console.error(err));
     }
    )
  );
}
