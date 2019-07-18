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
    let data = {time:[], students:{}}
    console.log(req.params.id)
    let changeFlag = true

    while (changeFlag)//iteratively assign time slots
    {
        changeFlag = false
        let preferred = await db.query('SELECT * FROM (SELECT timeslots_id, COUNT(timeslots_id) FROM raw_students_preferred GROUP BY timeslots_id) AS foo WHERE count = 1')
        if (preferred.err) {console.log(preferred.err.stack)}
        for (let e of preferred.rows)
        {
            await insertProcessedTime(e.timeslots_id, data, true)
            changeFlag = await updateTimeInDB() || changeFlag
            console.log("preferred", changeFlag, e.timeslots_id)
        }
        let available = await db.query('SELECT * FROM (SELECT timeslots_id, COUNT(timeslots_id) FROM raw_students_available GROUP BY timeslots_id) AS foo WHERE count = 1')
        if (available.err) {console.log(available.err.stack)}
        for (let e of available.rows)
        {
            await insertProcessedTime(e.timeslots_id, data, false)
            changeFlag = await updateTimeInDB() || changeFlag
            console.log("available", changeFlag, e.timeslots_id)
        }
        // console.log(changeFlag)
    }
    //TODO: change conflicted of conflicted timeslots to be true
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
                if (data.students[row.name])
                {
                    data.students[row.name].timeslots_id.push(e.timeslots_id)
                }
                else
                {
                    let obj = {timeslots_id:[e.timeslots_id], required_classes:row.required_classes}
                    data.students[row.name] = obj
                }
            }
            data.time.push({timeslots_id:e.timeslots_id, names:name_arr, conflicted:true})
        }
    }
    let assignedTime = await db.query('SELECT * FROM processed_students_time JOIN students ON students.id = student_id')
    for (let temp of assignedTime.rows)
    {
        data.time.push({timeslots_id:temp.timeslots_id, names:[temp.name], conflicted:false})
        if (data.students[temp.name])
        {
            data.students[temp.name].timeslots_id.push(temp.timeslots_id)
        }
        else
        {
            let obj = {timeslots_id:[temp.timeslots_id], required_classes:temp.required_classes}
            data.students[temp.name] = obj
        }
    }
    console.log(data)
    res.status(201).send(data)
})

//TODO: need to process information passed back
app.post('/result', async (req, res)=>{
    for (let s of Object.keys(req.body))
    {
        let student_id = await db.query("SELECT * FROM students WHERE name = $1", [s])
        if (student_id.err) {console.log(student_id.err.stack)}
        for (let t of req.body[s])
        {
            let timeslots_id = await db.query("SELECT * FROM timeslots WHERE row = $1 and col = $2", [t.row, t.col])
            await db.query("INSERT INTO final_time (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)", [student_id.rows[0].id, timeslots_id.rows[0].id, 1], (err)=>{
                if (err) {console.log(err.stack)}
            })
        }
    }
    res.status(201).send({res:"received"})
})

app.get('/final/:id', async (req, res) => {
    console.log(req.params.id)
    let data = await db.query('SELECT * FROM final_time JOIN students ON students.id=student_id JOIN timeslots ON timeslots_id=timeslots.id')
    if (data.err) {console.log(data.err.stack)}
    let arr = []
    for (let r of data.rows)
    {
        let obj = {row:r.row, col:r.col, student:r.name}
        arr.push(obj)
    }
    res.status(201).send({data:arr})
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
            // console.log("yes")
            let response = await db.query('DELETE FROM raw_students_preferred WHERE student_id = $1', [e.student_id])
            if (response.err) {console.log(response.err.stack)}
            if (response.rowCount != 0)
            {
                flag = true
            }
            response = await db.query('DELETE FROM raw_students_available WHERE student_id = $1', [e.student_id])
            if (response.err) {console.log(response.err.stack)}
            if (!flag && response.rowCount != 0)
            {
                flag = true
            }
        }
    }
    return flag
}

async function insertProcessedTime(timeslots_id, data, preferredTime)
{
    console.log(preferredTime)
    let time_id = parseInt(timeslots_id)
    let temp = await db.query('SELECT * FROM raw_students_preferred JOIN students ON students.id = raw_students_preferred.student_id WHERE timeslots_id = $1', [time_id])
    if (!preferredTime)
    {
        temp = await db.query('SELECT * FROM raw_students_available JOIN students ON students.id = raw_students_available.student_id WHERE timeslots_id = $1', [time_id])
    }
    if (temp.err) {console.log(temp.err.stack)}
    // console.log(temp)
    if (temp.rowCount == 0)
    {
        return
    }
    await db.query('INSERT INTO processed_students_time (student_id, timeslots_id, teacher_id) VALUES ($1, $2, $3)', [temp.rows[0].student_id, temp.rows[0].timeslots_id, temp.rows[0].teacher_id], (err)=>{
        if (err) {console.log(err.stack)}
    })

    await db.query('DELETE FROM raw_students_preferred WHERE timeslots_id = $1', [temp.rows[0].timeslots_id], (err) => {
        if (err) {console.log(err.stack)}
    })
    
    await db.query('DELETE FROM raw_students_available WHERE timeslots_id = $1', [temp.rows[0].timeslots_id], (err) => {
        if (err) {console.log(err.stack)}
    })

    
}