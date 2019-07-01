import React from 'react'
import Client from './client'


class AssignmentTable extends React.Component
{
    constructor(props)
    {
        super(props)
        var arr=[]
        for (var i = 0; i < 13; i++)
        {
            arr.push(new Array(7).fill(0))
        }
        arr[0][0] = 1
        arr[0][1] = 2

        Client.getTeacherSchedule(1, (res)=>{
            console.log(res)
        })

        this.state={tableData:arr, studentData:[{name:"Jack", numClass:2, timeSlot:[{row:0, col:0}, {row:0,col:1}], confirmedTime:[]},{name:"Jane", numClass:1, timeSlot:[{row:0,col:1}], confirmedTime:[]}], summaryData:{totalStudent:0, totalLesson:0, totalConflicts:0}}
        this.clickHandler=this.clickHandler.bind(this)
    }

    clickHandler(row, col, stdt)
    {
        console.log(stdt)
        var arr = this.state.tableData
        arr[row][col] = stdt
        var list = this.state.studentData
        for (var s of list)
        {
            for (var i = 0; i < s.timeSlot.length; i++)
            {
                if (s.timeSlot[i].row == row && s.timeSlot[i].col == col)
                {
                    s.timeSlot.splice(i, 1)
                    break;
                }
            }
        }
        for (var s of list)
        {
            if (s.name == stdt)
            {
                s.confirmedTime.push({row:row, col:col})
            }
        }
        this.setState({tableData:arr, studentData:list})
    }

    render()
    {
        var conflictCounter = 0
        for (var a of this.state.tableData)
        {
            for (var e of a)
            {
                if (!isNaN(e) && e > 1)
                {
                    conflictCounter++
                }
            }
        }
        var studentTable = this.state.studentData.map((item, index)=>{return <div key={index}>Name: {item.name} | Number of classes needed: {item.numClass} | Number of classes assigned : {item.confirmedTime.length}</div>})
        return (<div>
            <div>Summary</div>
            <div>{conflictCounter} conflicted time slot(s)!</div>
            <div style={{width:600,border:"1px dashed black"}}>Student summary
                {studentTable}
            </div>
            <TimeTable data={this.state.tableData} content={this.state.studentData} clickHandler={this.clickHandler}/>
            </div>)
    }
}

class Content extends React.Component
{
    constructor(props)
    {
        super(props)
        if (this.props.content[0])
        {
            this.state={selectValue:this.props.content[0].name}
        }
        else
        {
            this.state={selectValue:""}
        }
        this.changeHandler=this.changeHandler.bind(this)
    }

    changeHandler(event)
    {
        this.setState({selectValue: event.target.value})
    }

    render()
    {
        if (this.props.functional)
        {
            return <div>{this.props.content}</div>
        }
        if (this.props.cellData == 0)
        {
            return <div>No student!</div>
        }
        else
        {
            var status
            if (this.props.cellData == 1)
            {
                status = <div><div># of student: {this.props.cellData}</div><div>'No Conflict'</div></div>
            }
            else if (isNaN(this.props.cellData))
            {
                status = <div>assigned:  {this.props.cellData} </div>
            }
            else
            {
                status = <div><div># of student: {this.props.cellData}</div><div>'Conflict!'</div></div>
            }
            var list = this.props.content.map((item, index)=>{return(<option key={index}>{item.name}</option>)})

            return (<div>
                {status}
                <select onChange={this.changeHandler}>{list}</select>
                <button onClick={()=>this.props.clickHandler(this.props.row, this.props.col, this.state.selectValue)}>confirm</button>
            </div>)
        }
    }
}

function Cell(props)
{
    var style 
    if (props.cellData == 0||props.functional)
    {
        style = {
            width:110,
            height:100,
            border:"1px solid black",
            backgroundColor:"white",
        }
    }
    else if (props.cellData == 1||isNaN(props.cellData))
    {
        style = {
            width:110,
            height:100,
            border:"1px solid black",
            backgroundColor:"green",
        }
    }
    else
    {
        style = {
            width:110,
            height:100,
            border:"1px solid black",
            backgroundColor:"red",
        }
    }
    
    return <div style={style} key={props.col}><Content functional={props.functional} row={props.row} col={props.col} cellData={props.cellData} content={props.content} clickHandler={props.clickHandler}/></div>
} 

function Row(props)
{
    var list = []
    list.push(<Cell functional={true} key={-1} row={props.row} col={-1} content={props.time} />)
    if (props.functional)
    {
        for (var i = 0; i < 7; i++)
        {   

            list.push(<Cell functional={true} key={i} row={props.row} col ={i} cellData={props.rowData[i]} content={props.content[i]}/>)
        }
    }
    else        
    {
        for (var i = 0; i < 7; i++)
        {
            var arr = []
            for (var element of props.content)
            {
                for (var t of element.timeSlot)
                {
                    if (t.col == i)
                    {
                        arr.push(element)
                        break
                    }
                }
            }
            list.push(<Cell functional={false} key={i} row={props.row} col={i} cellData={props.rowData[i]} content={arr} clickHandler={props.clickHandler}/>)
        }
    }
    return <div style={{display:"flex"}} >{list}</div>
}

function TimeTable(props)
{
    var list = []
    for (var i = 0; i < 13; i++)
    {   
        var timeSlot = (i + 8).toString() + ":30"
        var arr = []
        for (var element of props.content)
        {
            for (var t of element.timeSlot)
            {
                if (t.row == i)
                {
                    arr.push(element)
                    break
                }
            }
        }
        list.push(<Row functional={false} key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={arr} clickHandler={props.clickHandler}/>)
    }
    return (<div>
        <div style={{display:"flex"}}><Row functional={true} row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} /></div>
        {list}
    </div>)
}

export default AssignmentTable