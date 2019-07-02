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
            db.query('INSERT INTO students (id, name, required_classes) VALUES ($1, $2, $3)', [total_students+1, req.body.name, parseInt(req.body.numClass)], (err)=> {
                if (err) {
                    console.log(err.stack)
                }
            })
        }
        else {
            student_id = response.rows[0].id
        }
    }
    console.log(student_id)
    for (let e of req.body.pickedTime)
    {
        let time_id = parseInt(e.time)*7 + parseInt(e.day) + 1
        db.query('INSERT INTO raw_students_available (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [student_id, time_id, teacher_id], (err) => {
            if (err) {console.log(err.stack)}
        })
    }
    for (let e of req.body.preferredTime)
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

app.get('/student/:id', (req, res)=>{
    console.log(req.params.id)
    res.status(201).send({data:studentData[req.params.id].tableData})
})

app.get('/teacher/:id', async (req, res)=>{
    let data = {time:[]}
    console.log(req.params.id)
    let changeFlag = true

    while (changeFlag)//iteratively assign time slots
    {
        let preferred = await db.query('SELECT * FROM (SELECT timeslots_id, COUNT(timeslots_id) FROM raw_students_preferred GROUP BY timeslots_id) AS foo WHERE count = 1')
        if (preferred.err) {console.log(preferred.err.stack)}
        for (let e of preferred.rows)
        {
            let time_id = parseInt(e.timeslots_id)
            let temp = await db.query('SELECT * FROM raw_students_preferred JOIN students ON students.id = raw_students_preferred.student_id WHERE timeslots_id = $1', [time_id])
            if (temp.err) {console.log(temp.err.stack)}
            // console.log(temp)
            data.time.push({timeslots_id:temp.rows[0].timeslots_id, names:[temp.rows[0].name], conflicted:false})
            db.query('INSERT INTO processed_students_time (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [temp.rows[0].student_id, temp.rows[0].timeslots_id, temp.rows[0].teacher_id], (err)=>{
                if (err) {console.log(err.stack)}
            })
            changeFlag = await updateTimeInDB()
        }
        let available = await db.query('SELECT * FROM (SELECT timeslots_id, COUNT(timeslots_id) FROM raw_students_available GROUP BY timeslots_id) AS foo WHERE count = 1')
        if (available.err) {console.log(available.err.stack)}
        for (let e of available.rows)
        {
            let time_id = parseInt(e.timeslots_id)
            let temp = await db.query('SELECT * FROM raw_students_available JOIN students ON students.id = raw_students_available.student_id WHERE timeslots_id = $1', [time_id])
            if (temp.err) {console.log(temp.err.stack)}
            console.log(temp)

            data.time.push({timeslots_id:temp.rows[0].timeslots_id, name:[temp.rows[0].name], conflicted:false})
            db.query('INSERT INTO processed_students_time (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [temp.rows[0].student_id, temp.rows[0].timeslots_id, temp.rows[0].teacher_id], (err)=>{
                if (err) {console.log(err.stack)}
            })
            changeFlag = await updateTimeInDB()
        }
        changeFlag = await updateTimeInDB()
    }

    //TODO: select all remaining time, then for each time select the available student
    //put it in data to send to front end
    let unassignedTime = await db.query('SELECT timeslots_id, COUNT(timeslots_id) FROM raw_students_available GROUP BY timeslots_id')
    if (unassignedTime.err) {console.log(unassignedTime.err.stack)}
    for (let e of unassignedTime.rows)
    {
        if (e.count > 1)
        {
            let temp = await db.query('SELECT * FROM raw_students_available JOIN students ON students.id = student_id WHERE timeslots_id = $1', [e.timeslots_id])
            if (temp.err) {console.log(temp.err.stack)}
            let name_arr = []
            for (let row of temp.rows)
            {
                name_arr.push(row.name)
            }
            data.time.push({timeslots_id:e.timeslots_id, name:name_arr, conflicted:true})
        }
    }

    console.log(data)
    res.status(201).send(data)
})

app.get('/', (req,res)=>{
    console.log('hello')
})

app.listen(3001)

//auxilary functions
async function updateTimeInDB()
{
    let time = await db.query('SELECT * FROM (SELECT student_id, COUNT(student_id) FROM processed_students_time GROUP BY student_id) AS foo JOIN students ON students.id = student_id')
    if (time.err) {console.log(time.err.stack)}
    let flag = false
    for (e of time.rows)
    {
        if (e.count == e.required_classes)
        {
            flag = true
            let response = await db.query('DELETE FROM raw_students_preferred WHERE student_id = $1', [e.student_id])
            if (response.err) {console.log(response.err.stack)}
            response = await db.query('DELETE FROM raw_students_available WHERE student_id = $1', [e.student_id])
            if (response.err) {console.log(response.err.stack)}
        }
    }
    return flag
}