import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import StudentSubmissionForm from './components/StudentSubmissionForm';
import StudentTimeTable from './components/StudentTimeTable';
import App from './App';
import AssignmentTable from './components/AssignmentTable'
import TeacherTimeTable from './components/TeacherTimeTable'

// ReactDOM.render(<StudentSubmissionForm/>, document.getElementById('root'));
// ReactDOM.render(<AssignmentTable />, document.getElementById('root'));
// ReactDOM.render(<TeacherTimeTable/>, document.getElementById('root'));
ReactDOM.render(<StudentTimeTable Id={4}/>, document.getElementById('body'));
ReactDOM.render(<h1>hello</h1>, document.getElementById('header'))
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
