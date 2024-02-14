const jwtwebToken = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwtvalidate = async (req, res, next) => {
    try {
        // accessToken 가져오기
        const authorization = req.cookies.authorization;
        if (!authorization) {
            throw new Error('인증 정보가 올바르지 않습니다.');
        }

        // accessToken 인증방식
        const [tokenType, tokenValue] = authorization.split(' ');
        if (tokenType !== 'Bearer') {
            throw new Error('인증 정보가 올바르지 않습니다.');
        }

        if (!tokenValue) {
            throw new Error('인증 정보가 올바르지 않습니다.');
        }

        // 12h 유효기간

        const token = jwtwebToken.verify(tokenValue, process.env.SECRET_KEY);

        // accessToken userId있는가

        if (!token.userId) {
            throw new Error('인증 정보가 올바르지 않습니다.');
        }

        const user = await prisma.user.findFirst({
            where: {
                userId: token.userId,
            },
        });

        if (!user) {
            throw new Error('인증 정보가 올바르지 않습니다.');
        }

        // user 정보 담기
        res.local.user = {};

        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
};
