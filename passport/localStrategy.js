const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => { //실제 전략을 수행, 첫 번째 인수에서 넣어준 email과 password는 각각 async 함수의 첫 번째와 두 번째 매개변수, 세 번째 매개변수인 done 함수는 passport.authenticate의 콜백함수
    try {
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' }); //첫 번째 인수를 사용하는 경우는 서버 쪽에서 에러가 발생했을 때고, 세 번째
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
