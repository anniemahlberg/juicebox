const PORT = 3000;
const express = require('express');
const server = express();
const morgan = require('morgan');
const { client } = require('./db');
const apiRouter = require('./api');

server.use(morgan('dev'));
server.use(express.json());
server.use('/api', apiRouter);

client.connect();
server.listen(PORT, () => {
    console.log('The server is up on port', PORT);
})
