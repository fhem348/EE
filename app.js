const express = require('express')
const bodyParser = require('body-parser')

const userRouter = require('./routers/user.router')
const resumeRouter = require('./routers/resume.router')

const app = express()
const port = 3000

app.use(bodyParser.json())

app.use('/users', userRouter)
app.use('/resumes', resumeRouter)

app.listen(port, () => {
    console.log(`이 포트로 연결된데요! ${port}`)
})
