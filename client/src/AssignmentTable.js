import React from 'react'


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
        this.state={data:arr}
    }

    render()
    {
        var result = []
        for (var i = 0; i < 13; i++)
        {
            var temp = []
            for (var j = 0; j < 7; j++)
            {
                if (this.state.data[i][j] == 0)
                {
                    temp.push("No student")
                }
            }
            result.push(temp)
        }

        return (<TimeTable data={this.state.data} content={result}/>)
    }
}

function Content(props)
{
    if (props.functional)
    {
        return <div>{props.content}</div>
    }
    if (props.cellData == 0)
    {
        return <div>No student!</div>
    }
    else if (props.cellData == 1)
    {
        return (<div>
            <div># of student: 1</div>
            <div>No conflict!</div>
            <select><option>Name 1</option></select>
            <button>confirm</button>
        </div>)
    }
    else 
    {
        return (<div>
            <div># of student: {props.cellData}</div>
            <div>Conflict!</div>
            <select>
                <option>Name 1</option>
                <option>Name 2</option>
            </select>
            <button>confirm</button>
        </div>)
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
    else if (props.cellData == 1)
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
    
    
    return <div style={style} key={props.col}><Content functional={props.functional} cellData={props.cellData} content={props.content}/></div>
} 

function Row(props)
{
    var list = []
    list.push(<Cell functional={true} key={-1} row={props.row} col={-1} content={props.time} />)
    for (var i = 0; i < 7; i++)
    {   
        list.push(<Cell functional={props.functional} key={i} row={props.row} col ={i} cellData={props.rowData[i]} content={props.content[i]}/>)
    }
    return <div style={{display:"flex"}} >{list}</div>
}

function TimeTable(props)
{
    console.log(props.content)
    var list = []
    for (var i = 0; i < 13; i++)
    {   
        var timeSlot = (i + 8).toString() + ":30"
        list.push(<Row functional={false} key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={props.content[i]} />)
    }
    return (<div>
        <div style={{display:"flex"}}><Row functional={true} row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} /></div>
        {list}
    </div>)
}

export default AssignmentTable