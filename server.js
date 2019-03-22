const fs = require('fs')
const pg =  require('pg')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const errorHandler = require('errorhandler')

var studentData = []

const app = express()
const db = new pg.Client('postgres://localhost:5432/test')
db.connect()


if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(errorHandler())

app.post('/user', (req, res)=>{
    studentData.push(req.body)
    var total_students
    db.query('SELECT COUNT(*) FROM students', (err, res) => {
        if (err) {
            console.log(err.stack)
        }
        else {
            console.log(res.rows[0].count)
            total_students = parseInt(res.rows[0].count)
        }
    })
    db.query('SELECT * FROM students WHERE name = $1', [req.body.name], (err, res)=> 
    {
        if (err) {
            console.log(err.stack)
        }
        else {
            if (res.rowCount == 0) {
                db.query('INSERT INTO students (id, name) VALUES ($1, $2)', [total_students+1, req.body.name], (err, res)=> {
                    if (err) {
                        console.log(err.stack)
                    }
                })
                // db.query('INSERT INTO ')
            }
        }
    })
    console.log(studentData)
    res.status(201).send({res:'Success!'})
})

app.get('/schedule/:id', (req, res)=>{
    console.log(req.params.id)
    res.status(201).send({data:studentData[req.params.id].tableData})
})

app.get('/', (req,res)=>{
    console.log('hello')
})

app.listen(3001)