import React, { Component } from 'react';
import './App.css';
import Client from './client'

class StudentSubmissionForm extends Component
{
    constructor(props)
    {
        super(props)
        var arr=[]
        for (var i = 0; i < 13; i++)
        {
            arr.push(new Array(7).fill(0))
        }
        this.state={value:"", nameStud:"", tableData:arr, isMouseDown:false, numClass:"", teacher:"Teacher 1", subject:"Reading",location:"location 1", pickedTime:[], preferredTime:[]}
        this.changeHandler=this.changeHandler.bind(this)
        this.tableToggle=this.tableToggle.bind(this)
        this.mouseDown=this.mouseDown.bind(this)
        this.mouseOver=this.mouseOver.bind(this)
        this.mouseUp=this.mouseUp.bind(this)
        this.processPickedTime=this.processPickedTime.bind(this)
        this.postToServer=this.postToServer.bind(this)
        this.preferredTimeHandler=this.preferredTimeHandler.bind(this)
    }

    mouseDown(row, col)
    {
        this.setState({isMouseDown:true})
        this.tableToggle(row,col)
    }

    mouseOver(row, col)
    {
        if (this.state.isMouseDown)
        {
            this.tableToggle(row,col)
        }
    }

    mouseUp()
    {
        this.setState({isMouseDown:false})
    }

    processPickedTime()
    {
        let pickedTime = []
        for (var i = 0; i < 13; i++)
        {
            for (var j = 0; j<7; j++)
            {
                var _day
                switch (j) {
                    case 0:
                        _day="MON"
                        break;
                    case 1:
                        _day="TUE"
                        break;
                    case 2:
                        _day="WED"
                        break;
                    case 3:
                        _day="THU"
                        break;
                    case 4:
                        _day="FRI"
                        break;
                    case 5:
                        _day="SAT"
                        break;
                    case 6:
                        _day="SUN"
                        break;
                }
                if (this.state.tableData[i][j])
                {
                    // pickedTime.push({day:_day,time:((i+8).toString()+":30")})
                    pickedTime.push({day:j,time:i})
                }
            }
        }
        return pickedTime
    }

    tableToggle(row, col)
    {
        if (row < 0 || col < 0)
        {
            return
        }
        var listCopy = this.state.tableData
        if (listCopy[row][col]==0)
        {
            listCopy[row][col]=1
        }
        else
        {
            listCopy[row][col]=0
        }
        this.setState({tableData:listCopy, pickedTime:this.processPickedTime()})
    }

    postToServer()
    {
        var data = {name:this.state.nameStud, numClass:this.state.numClass, teacher:this.state.teacher, location:this.state.location, pickedTime:this.state.pickedTime, preferredTime:this.state.preferredTime}
        Client.logStudentData(data, (res)=>{
            alert(res.res)
        })
    }

    changeHandler(event)
    {
        this.setState({[event.target.name]:event.target.value},()=>console.log(this.state))
    }

    preferredTimeHandler(event)
    {
        var arr = this.state.preferredTime
        var index = event.target.name[event.target.name.length-1]
        if (parseInt(index) > arr.length)
        {
            arr.push(event.target.value)
        }
        else
        {
            arr[parseInt(index)] = event.target.value
        }
        this.setState({preferredTime: arr})
    }

    render()
    {
        var listCopy = []
        listCopy.push({day:"None", time:""})
        listCopy = listCopy.concat(this.state.pickedTime)
        var preferredTimeSelect=[]
        for (var i = 0; i < this.state.numClass; i++)
        {
            preferredTimeSelect.push(<select name={"preferredTime"+i} key={i} index={i} onChange={(event)=>this.preferredTimeHandler(event)}>{listCopy.map((item,index)=><option key={index}>{item.day} {item.time}</option>)}</select>)
        }
        return (<form>
            <div>name of student:</div>
            <input name="nameStud" value={this.state.nameStud} onChange={(event)=>this.changeHandler(event)}/>
            <div>number of classes</div>
            <input name="numClass" value={this.state.numClass} onChange={(event)=>this.changeHandler(event)}/>
            <div>Teacher:</div>
            <select name="teacher" value={this.state.teacher} onChange={(event)=>this.changeHandler(event)}>
                <option>Y</option>
                <option>M</option>
            </select>
            <div>Subject:</div>
            <select nmae="subject" value={this.state.subject} onChange={(event)=>this.changeHandler(event)} >
                <option>Reading</option>
                <option>Grammar</option>
            </select>
            <div>Location</div>
            <select name="location" value={this.state.location} onChange={(event)=>this.changeHandler(event)} >
                <option>location 1</option>
                <option>location 2</option>
            </select>
            <br/>
            <div>Click and drag to toggle available time slot for classes</div>
            <TimeTable data={this.state.tableData} mouseDown={this.mouseDown} mouseOver={this.mouseOver} mouseUp={this.mouseUp} />
            <div>pick your preferred time:</div>
            {preferredTimeSelect}
            <button type="submit" onClick={()=>this.postToServer()}>Submit</button>
            </form>)
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
    
    return <div style={style} key={props.col} onMouseDown={() => props.mouseDown(props.row,props.col)} onMouseOver={()=>props.mouseOver(props.row,props.col)} onMouseUp={()=>props.mouseUp()} >{props.content}</div>
}

function Row(props)
{
    var list = []
    list.push(<Cell key={-1} row={props.row} col={-1} content={props.time} mouseDown={props.mouseDown} mouseOver={props.mouseOver} mouseUp={props.mouseUp}/>)
    for (var i = 0; i < 7; i++)
    {   
        list.push(<Cell key={i} row={props.row} col ={i} cellData={props.rowData[i]} content={props.content[i]} mouseDown={props.mouseDown} mouseOver={props.mouseOver} mouseUp={props.mouseUp}/>)
    }
    return <div style={{display:"flex"}} >{list}</div>
}

function TimeTable(props)
{
    var list = []
    for (var i = 0; i < 13; i++)
    {   
        var timeSlot = (i + 8).toString() + ":30"
        list.push(<Row key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={[]} mouseDown={props.mouseDown} mouseOver={props.mouseOver} mouseUp={props.mouseUp} />)
    }
    return (<div>
        <div style={{display:"flex"}}><Row row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} mouseDown={props.mouseDown} mouseOver={props.mouseOver} mouseUp={props.mouseUp}/></div>
        {list}
    </div>)
}

export default StudentSubmissionForm
