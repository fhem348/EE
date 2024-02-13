const jwtwebToken = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const jwtValidate = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization
        if (!authorization) {
            throw new Error('인증 정보가 올바르지 않습니다.')
        }

        const [tokenType, tokenValue] = authorization.split(' ')
        if (tokenType !== 'Bearer') {
            throw new Error('인증 정보가 올바르지 않습니다.')
        }

        if (!tokenValue) {
            throw new Error('인증 정보가 올바르지 않습니다.')
        }
        const token = jwtwebToken.verify(tokenValue, 'resume@#')

        if (!token.userId) {
            throw new Error('인증 정보가 올바르지 않습니다.')
        }
        const user = await prisma.user.findFirst({
            where: {
                userId: token.userId,
            },
        })

        if (!user) {
            throw new Error('인증 정보가 올바르지 않습니다.')
        }

        res.locals.user = user

        next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: err.message,
        })
    }
}

module.exports = jwtValidate
