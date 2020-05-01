require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {
    NODE_ENV
} = require('./config')
const winston = require('winston');

const app = express()

const morganOption = (NODE_ENV === 'production') ?
    'tiny' :
    'common';

const cards = [{
    id: 1,
    title: 'Task One',
    content: 'This is card one'
}];
const lists = [{
    id: 1,
    header: 'List One',
    cardIds: [1]
}];

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    console.log(process.env.API_TOKEN)
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {

    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({
                filename: 'info.log'
            })
        ]
    });

    if (NODE_ENV === 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.simple()
        }))
    } else {
        console.error(error);
        response = {
            message: error.message,
            error
        }
    }
    res.status(500).json(response);
})

app.use(function validateBearerToken(req, res, next) {
    const apiToken = 'cfed1579-be8e-458c-aba4-22476668a0a7'
    const authToken = req.get('Auth')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({
            error: 'Unauthorized request'
        })
    }
    // move to the next middleware
    next()
})

module.exports = app