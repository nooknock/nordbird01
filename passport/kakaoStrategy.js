const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  passport.use(
      new KakaoStrategy({
    clientID: process.env.KAKAO_ID, //노출되지 않아야 하므로 process.env.KAKAO_ID로 설정, 나중에 아이디를 발급받아 .env 파일에 넣을 것
    callbackURL: '/auth/kakao/callback',  // 카카오로부터 인증 결과를 받을 라우터 주소, 아래에서 라우터를 작성할 때 이 주소를 사용
  },
          async (accessToken, refreshToken, profile, done) => {  //기존에 카카오를 통해 회원가입한 사용자가 있는지 조회, 있다면 이미 회원 가입 되어 있는 경우이므로 사용자 정보와 함께 done 함수를 호출하고 전략 종료
    console.log('kakao profile', profile);

    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });

      if (exUser) {
        done(null, exUser);

      } else {  //카카오를 통해 회원 가입한 사용자가 없다면 회원 가입 진행, 카카오에서는 인증 후 callbackURL에 적힌 주소로 accessToken, refreshToken과 profile을 보냄, profile에는 사용자 정보들이 들어있음
                //카카오에서 보내주는 것이므로 데이터는 console.log 메서드로 확인해보는 것이 좋다 profile 객체에서 원하는 정보를 꺼내와 회원가입을
        const newUser = await User.create({
          email: profile._json && profile._json.kakao_account_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);  //사용자를 생성한 뒤 done 함수를 호출
    }
  }));
};
