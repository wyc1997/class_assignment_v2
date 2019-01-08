const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorHandler = require('errorhandler')

var studentData = []

const app = express()

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(errorHandler())

app.post('/user', (req, res)=>{
    studentData.push(req.body)
    console.log(studentData)
    res.status(201).send({res:'Success!'})
})

app.listen(3001)