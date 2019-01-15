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
        this.state={tableData:arr, studentData:[]}
    }

    render()
    {
        // var result = []
        // for (var i = 0; i < 13; i++)
        // {
        //     var temp = []
        //     for (var j = 0; j < 7; j++)
        //     {
        //         if (this.state.TableData[i][j] == 0)
        //         {
        //             temp.push("No student")
        //         }
        //     }
        //     result.push(temp)
        // }

        return (<TimeTable data={this.state.tableData} content={this.state.studentData}/>)
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
    else
    {
        var status
        if (props.cellData == 1)
        {
            status = 'No Conflict'
        }
        else
        {
            status = 'Conflict!'
        }
        var list = props.content.map((item)=>{return(<option>{item.name}</option>)})

        return (<div>
            <div># of student: {props.cellData}</div>
            <div>{status}</div>
            <select>{list}</select>
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
            for (var j = 0; j < props.content.length; j++)
            {
                if (props.content[j].col == i)
                {
                    arr.push(props.content[j])
                }
            }
            list.push(<Cell functional={false} key={i} row={props.row} col={i} cellData={props.rowData[i]} content={arr} />)
        }
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
        var arr = []
        for (var j = 0; j < props.content.length; j++)
        {
            if (props.content[j].row == i)
            {
                arr.push(props.content[j])
            }
        }
        list.push(<Row functional={false} key = {i} row={i} time={timeSlot} rowData={props.data[i]} content={arr} />)
    }
    return (<div>
        <div style={{display:"flex"}}><Row functional={true} row={-1} rowData={[]} time={"Time"} content={["MON","TUE","WED","THU","FRI","SAT","SUN"]} /></div>
        {list}
    </div>)
}

export default AssignmentTable