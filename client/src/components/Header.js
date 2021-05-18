import React from "react";
import {Navbar} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLogo from '../logo.svg';
import Upload from '../Upload';
import App from '../App'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function Header () {
    return (
      <>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="/">
          <img
            alt=""
            src={ReactLogo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          React Bootstrap
        </Navbar.Brand>
        <Router>
          <Link to="/">Login</Link>
          &nbsp;&nbsp;&nbsp;
          <Link to="/Upload">Upload</Link>
          <Switch>
          <Route exact path="/">
            <App />
          </Route>
          <Route path="/Upload">
            <Upload />
          </Route>
        </Switch>
        </Router>
        
      </Navbar>
      </>
      );
}


export default Header;
