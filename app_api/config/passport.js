const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

// Local Strategy 설정
passport.use(new LocalStrategy(
    {
        usernameField: 'email', // email을 기본 사용자 이름으로 사용
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
