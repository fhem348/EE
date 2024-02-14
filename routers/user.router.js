const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwtwebToken = require('jsonwebtoken');

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    try {
        const { email, password, passwordConfirm, name, age, gender, image } =
            req.body;
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: ' 이메일이 없습니다.' });
        }
        if (!password) {
            return res
                .status(400)
                .json({ success: false, message: ' 비밀번호가 없습니다.' });
        }
        if (!passwordConfirm) {
            return res
                .status(400)
                .json({ success: false, message: ' 비밀번호확인이 없습니다.' });
        }
        if (!name) {
            return res
                .status(400)
                .json({ success: false, message: ' 이름이 없습니다.' });
        }
        if (!age) {
            return res
                .status(400)
                .json({ success: false, message: ' 나이가 없습니다.' });
        }
        if (!gender) {
            return res
                .status(400)
                .json({ success: false, message: ' 성별이 없습니다.' });
        }
        if (!image) {
            return res
                .status(400)
                .json({ success: false, message: ' 프로필이미지가 없습니다.' });
        }

        if (password !== passwordConfirm) {
            return res.status(409).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.',
            });
        }

        // 비밀번호 hash
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (user) {
            return res.status(409).json({
                success: false,
                message: ' 이미 가입된 이메일입니다.',
            });
        }

        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                age,
                gender,
                image,
            },
        });
        return res.status(201).json({ email, name });
    } catch (err) {
        next(err);
    }
});

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: '이메일은 필수값입니다.' });
        }

        if (!password) {
            return res
                .status(400)
                .json({ success: false, message: '비밀번호는 필수값입니다.' });
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: '올바르지 않은 로그인입니다.',
            });
        } else if (!(await bcrypt.compare(password, user.password)))
            return res.status(401).json({
                success: false,
                message: '비밀번호가 일치하지 않습니다.',
            });

        // 로그인 성공,  토큰 만들기
        const accessToken = jwtwebToken.sign(
            { userId: user.userId },
            process.env.SECRET_KEY,
            {
                expiresIn: '12h',
            }
        );
        res.cookie('authorization', `Bearer ${accessToken}`);
        return res.status(200).json({ message: '로그인에 성공하였습니다.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
