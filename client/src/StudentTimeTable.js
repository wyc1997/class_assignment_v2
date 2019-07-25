import React from 'react'
import Client from './client'

class StudentTimeTable extends React.Component
{
    constructor(props)
    {
        super(props)
        console.log("this is", props.Id)
        var arr=[]
        for (var i = 0; i < 13; i++)
        {
            arr.push(new Array(7).fill(0))
        }
        this.state={name:"", schedule:arr}
        Client.getStudentSchedule(props.Id, (res)=>{
            let arr = this.state.schedule
            for (let temp of res.data)
            {
                arr[temp.row][temp.col]++
            }
            this.setState({name:res.name ,schedule:arr})
            console.log('Successfully received data from server!')
        })
        console.log(this.state.schedule)
    }


    render()
    {
        console.log(this.state.schedule)
        return (<div>
        <span>Name: {this.state.name}</span>
        <TimeTable data={this.state.schedule}/></div>)
    }
}

function Cell(props)
{
    var style
    if (props.cellData==1)
    {
        style = {
            width:50,
            height:30,
            border:"1px solid black",
            backgroundColor:"green"
        }
    }
    else
    {
        style = {
            width:50,
            height:30,
            border:"1px solid black",
            backgroundColor:"white"
        }
    }
    
    return <div style={style} key={props.col}>{props.content}</div>
}

function Row(props)
{
    var list = []
    list.push(<Cell key={-1} row={props.row} col={-1} content={props.time} />)
    for (var i = 0; i < 7; i++)
    {   
        list.push(<Cell key={i} row={props.row} col ={i} cellData={props.rowData[i]} content={props.content[i]}/>)
    }
    return <div style={{display:"flex"}} >{list}</div>
}

function TimeTable(props)
{
    var list = []
    for (var i = 0; i < 13; i++)
    {   
        var timeSlot = (i + 8).toString() + ":30"
        list.push(<Row key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={[]} />)
    }
    return (<div>
        <div style={{display:"flex"}}><Row row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} /></div>
        {list}
    </div>)
}

export default StudentTimeTable