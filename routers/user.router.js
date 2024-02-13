const express = require('express')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const jwtwebToken = require('jsonwebToken')
const jwtValidate = require('../middleware/jwt-validate.middleware')

const router = express.Router()

router.post('/sign-up', async (req, res) => {
    const { email, password, passwordConfirm, name } = req.body
    if (!email) {
        return res
            .status(400)
            .json({ success: false, message: '이메일은 필수입니다.' })
    }

    if (!password) {
        return res
            .status(400)
            .json({ success: false, message: '비밀번호는 필수죠.' })
    }

    if (!passwordConfirm) {
        return res
            .status(400)
            .json({ success: false, message: '재확인은 필수에요.' })
    }

    if (!name) {
        return res
            .status(400)
            .json({ success: false, message: '모든것에는 이름이있어요.' })
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: '비밀번호는 최소 6자 이상입니다.',
        })
    }

    if (password !== passwordConfirm) {
        return res
            .status(400)
            .json({ success: false, message: '비밀번호가 서로 다릅니다.' })
    }

    const user = await prisma.user.findFirst({
        where: {
            email,
        },
    })

    if (user) {
        return res
            .status(400)
            .json({ success: false, message: '사용할 수 없는 이메일입니다.' })
    }

    await prisma.user.create({
        data: {
            email,
            password,
            name,
        },
    })

    return res.status(201).json({
        email,
        name,
    })
})

router.post('/sign-in', async (req, res) => {
    const { email, password } = req.body
    if (!email) {
        return res
            .status(400)
            .json({ success: false, message: '이메일은 필수입니다.' })
    }

    if (!password) {
        return res
            .status(400)
            .json({ success: false, message: '비밀번호는 필수죠.' })
    }

    const user = await prisma.user.findFirst({
        where: {
            email,
            password,
        },
    })

    if (!user) {
        return res
            .status(401)
            .json({ success: false, message: '잘못된 접근입니다.' })
    }

    const accessToken = jwtwebToken.sign({ userId: user.userId }, 'resume@#', {
        expiresIn: '12h',
    })
    return res.json({
        accessToken,
    })
})

router.get('/me', jwtValidate, (req, res) => {
    const user = res.locals.user

    return res.json({
        email: user.email,
        name: user.name,
    })
})

module.exports = router
