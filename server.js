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

app.post('/user', async (req, res)=>{
    console.log(req.body)
    var total_students, student_id, teacher_id
    teacher_id = 1
    db.query('SELECT COUNT(*) FROM students', (err, res) => {
        if (err) {console.log(err.stack)}
        else {
            total_students = parseInt(res.rows[0].count)
        }
    })
    let response = await db.query('SELECT * FROM students WHERE name = $1', [req.body.name])
    if (response.err) {console.log(response.err.stack)}
    else {
        console.log(response.rowCount)
        if (response.rowCount == 0) {
            student_id = total_students+1
            db.query('INSERT INTO students (id, name) VALUES ($1, $2)', [total_students+1, req.body.name], (err)=> {
                if (err) {
                    console.log(err.stack)
                }
            })
        }
        else {
            console.log(response.rows[0].id)
            student_id = response.rows[0].id
            console.log(student_id)
        }
    }
    console.log(student_id)
    for (var e of req.body.pickedTime)
    {
        let time_id
        console.log(e.time, e.day)
        time_id = parseInt(e.time)*7 + parseInt(e.day) + 1
        db.query('INSERT INTO raw_students_available (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [student_id, time_id, teacher_id], (err) => {
            if (err) {console.log(err.stack)}
        })
    }
    for (var e of req.body.preferredTime)
    {
        let time_id = await db.query('SELECT id FROM timeslots WHERE time = $1', [e])
        if (time_id.err) {console.log(time_id.err.stack)}
        else {
            db.query('INSERT INTO raw_students_preferred (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [student_id, time_id.rows[0].id, teacher_id], (err)=> {
                if (err) {console.log(err.stack)}
            })
        }
    }
    // console.log(studentData)
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

//auxilary functions
