import React from "react"
import Client from "./client"
import Popup from "reactjs-popup"

//TODO: add update popup window and summary table 

class TeacherTimeTable extends React.Component
{
    constructor(props)
    {
        super(props)
        let arr=[]
        for (let i = 0; i < 13; i++)
        {
            arr.push(new Array(7).fill(0))
        }
        this.state={tableData:arr, students:[], studentData:[]}
    }

    async componentWillMount()
    {
        let data = await Client.getFinalSchedule(1)
        let tableData = this.state.tableData
        let students = this.state.students
        for (let r of data.data)
        {
            tableData[r.row][r.col] = r.student
            if (!students.includes(r.student))
            {
                students.push(r.student)
            }
        }
        this.setState({tableData:tableData, students:students})
        console.log(this.state)
    }

    render()
    {
        return (
            <div>
                <TimeTable data={this.state.tableData} content={this.state.studentData}/>
            </div>
        )

    }
}


class Content extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state={selectValue:""}
        // console.log(this.props.content[0])
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
            let text = <div>Assigned: {this.props.cellData}</div>
            console.log(this.props)
            return (<div>
                {text}
                <button>Update</button>
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
    
    return <div style={style} key={props.col}><Content functional={props.functional} row={props.row} col={props.col} cellData={props.cellData} content={props.content}/></div>
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
        for (let i = 0; i < 7; i++)
        {
            var arr = []
            for (var element of props.content)
            {
                for (let t of element.timeSlot)
                {
                    if (t.col == i)
                    {
                        arr.push(element)
                        break
                    }
                }
            }
            list.push(<Cell functional={false} key={i} row={props.row} col={i} cellData={props.rowData[i]} content={arr}/>)
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
        list.push(<Row functional={false} key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={arr}/>)
    }
    return (<div>
        <div style={{display:"flex"}}><Row functional={true} row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} /></div>
        {list}
    </div>)
}

export default TeacherTimeTable 