const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('resume router')
})

module.exports = router
