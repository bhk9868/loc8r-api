const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true, // 이메일은 고유해야 함
    required: true // 반드시 제공되어야 함
  },
  name: {
    type: String,
    required: true // 반드시 제공되어야 함
  },
  hash: String, // 암호화된 비밀번호
  salt: String  // 비밀번호 해시를 생성하기 위한 고유 값
});
// 비밀번호 설정 메서드 추가
userSchema.methods.setPassword = function(password) {
    // salt 생성
    this.salt = crypto.randomBytes(16).toString('hex');
    // hash 생성
    this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  };

  userSchema.methods.validPassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    const expiry = new Date(); // 현재 날짜와 시간을 가져옴
    expiry.setDate(expiry.getDate() + 7); // 현재 날짜에서 7일 후로 만료일 설정
  
    return jwt.sign({
        _id: this._id,           // 사용자 고유 ID
        email: this.email,       // 사용자 이메일
        name: this.name,         // 사용자 이름
        exp: parseInt(expiry.getTime() / 1000, 10), // UNIX timestamp (초 단위)
      },
      process.env.JWT_SECRET // 환경 변수에서 비밀키를 가져옴
    );
};
  
mongoose.model('User', userSchema);
