const express = require('express');
const bodyParser = require('body-parser');

const userRouter = require('./routers/user.router');
const postRouter = require('./routers/post.router');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/users', userRouter);
app.use('/posts', postRouter);

app.listen(port, () => {
    console.log(`서버가 열립니다. ${port}`);
});
