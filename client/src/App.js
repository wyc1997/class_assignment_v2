import {BrowserRouter, Route} from 'react-router-dom';
import StudentSubmissionForm from './components/StudentSubmissionForm'
import StudentTimeTable from './components/StudentTimeTable'
import React from 'react'



class App extends React.Component
{
    render()
    {
        return (
            <BrowserRouter>
        <div>
          {/* <Route exact={true} path='/' component={Home}/> */}
          <Route exact={true} path='/form' render={()=><StudentSubmissionForm />}/>
          <Route exact={true} path='/user/:Id' component={StudentTimeTable}/>
          </div>
          </BrowserRouter>
        )
    }
}

export default App