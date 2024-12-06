const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    try {
        await user.save();
        const token = user.generateJwt();
        return res.status(200).json({ token });
    } catch (err) {
        return res.status(404).json(err);
    }
};

// const login = async (req, res) => {
//     if (!req.body.email || !req.body.password) {
//         return res.status(400).json({ message: "All fields required" });
//     }

//     try {
//         const { user, info } = await new Promise((resolve, reject) => {
//             passport.authenticate('local', (err, user, info) => {
//                 if (err) return reject(err);
//                 resolve({ user, info });
//             })(req, res);
//         });

//         if (user) {
//             const token = user.generateJwt();
//             return res.status(200).json({ token });
//         } else {
//             return res.status(401).json(info);
//         }
//     } catch (err) {
//         return res.status(404).json(err);
//     }
// };



const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const { user, info } = await new Promise((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {
                // 디버깅 로그 추가
                console.log('Passport Authentication Debug:');
                console.log('Error:', err); // Passport에서 발생한 오류
                console.log('User:', user); // 인증된 사용자 객체
                console.log('Info:', info); // 인증 실패 메시지 또는 기타 정보
                
                if (err) return reject(err); // 인증 과정에서 오류 발생
                resolve({ user, info }); // 인증 결과 반환
            })(req, res);
        });

        if (user) {
            const token = user.generateJwt();
            console.log('JWT Token Generated:', token); // JWT 생성 로그
            return res.status(200).json({ token });
        } else {
            console.log('Authentication Failed:', info); // 인증 실패 로그
            return res.status(401).json(info);
        }
    } catch (err) {
        console.log('Login Error:', err); // 기타 에러 로그
        return res.status(404).json(err);
    }
};


module.exports = {
    register,
    login,
};
