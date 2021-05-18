import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Upload from './Upload';
import Login from './Login'
import * as serviceWorker from './serviceWorker';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
ReactDOM.render(
  <Router>
          <Route exact path="/" component = {App}/> 
          {/* <Route path="/Upload" component = {Upload} /> */}
  </Router>, document.getElementById('root'));
{/* <App/>, document.getElementById('root')); */}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
