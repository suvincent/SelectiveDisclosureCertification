import React, { useState,useEffect} from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {getWeb3,walletconnectinit} from "./getWeb3";
import {Button, Navbar,Nav} from 'react-bootstrap'
import ReactLogo from './logo.svg';
import "./App.css";
import 'bootstrap/dist/css/bootstrap.css';
import testAdd from './test/ipfs'
// import EthCrypto from 'eth-crypto';
// import PrivateKeyForm from './components/privatekey'
// import DriveTable from './components/DriveTable'
// import PDContract from "./contracts/PedersenCommitment.json";
// import Header from './components/Header'
import Home from './pages/home'
import Verify from './pages/verify'
import CreateCert from './pages/createCert'
import Contact from "./pages/contact";
// import CryptoJS from "cryptojs"
// const CryptoJS = require("crypto-js")
// const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')

function App () {
  const [web3,setweb3] = useState(null)

  useEffect(() => {
    return () => {

      window.addEventListener("beforeunload", (ev) => 
      {  
          // ev.preventDefault();
          window.provider.disconnect();
          // return ev.returnValue = 'wallet has disconnected';
      });
    }
   
  });


  async function defaultinit(){
    try{
      const a = await getWeb3();
      console.log(a)
      setweb3(a)
    }
    catch(err){
      console.log(err.message)
    }
  }
  
  async function walletinit(){
    try{
      const web3 = await walletconnectinit();
      console.log(web3)
      setweb3(web3)
    }
    catch(err){
      console.log(err.message)
    }
  }


  if (!web3) {
    return <>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossOrigin="anonymous"/>
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
        
    </Navbar>
    <div className="App">
      <Button variant="secondary" content='Upload' onClick = {walletinit} style={{marginTop:"2%"}} >Connect to wallet</Button>
      &nbsp;
      <Button variant="secondary" content='Upload' onClick = {defaultinit} style={{marginTop:"2%"}} >Connect to chrome metamask</Button>
    </div>
    </>;
  }
  
  return (
    <>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossOrigin="anonymous"/>
    <Router> 
      <div>
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
        <Nav>
            <Nav.Item>
              <Link to="/SelectiveDisclosureCertification/" style={{color: "white"}}>Home</Link>
            </Nav.Item>
            &nbsp;&nbsp;
            <Nav.Item>
              <Link to="/SelectiveDisclosureCertification/create" style={{color: "white"}}>Create certificate</Link>
            </Nav.Item>
            &nbsp;&nbsp;
            <Nav.Item>
              <Link to="/SelectiveDisclosureCertification/verify" style={{color: "white"}}>Verify Certificate</Link>
            </Nav.Item>
            &nbsp;&nbsp;
            <Nav.Item>
              <Link to="/SelectiveDisclosureCertification/contact" style={{color: "white"}}>Contact identity</Link>
            </Nav.Item>
        </Nav>
      </Navbar>
        

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/SelectiveDisclosureCertification/create">
            <CreateCert web3={web3}/>
          </Route>
          <Route path="/SelectiveDisclosureCertification/verify">
            <Verify web3={web3}/>
          </Route>
          <Route path="/SelectiveDisclosureCertification/contact">
            <Contact web3={web3}/>
          </Route>
          <Route path="/SelectiveDisclosureCertification/">
            <Home web3={web3}/>
          </Route>
        </Switch>
      </div>
    </Router>
    
    </>
  );
}

export default App;
