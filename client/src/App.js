import React, { useState, useEffect} from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import getWeb3 from "./getWeb3";
import {Button,Container,Row,Col, Navbar,Nav} from 'react-bootstrap'
import ReactLogo from './logo.svg';
import "./App.css";
import 'bootstrap/dist/css/bootstrap.css';
import testAdd from './test/ipfs'
import EthCrypto from 'eth-crypto';
import PrivateKeyForm from './components/privatekey'
import DriveTable from './components/DriveTable'
import PDContract from "./contracts/PedersenCommitment.json";
import Header from './components/Header'
import Home from './pages/home'
import Verify from './pages/verify'
import CreateCert from './pages/createCert'
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')

function App (props) {
  const [web3,setweb3] = useState(null)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [initflag,setinitflag] = useState(false);

  useEffect(()=>{
    async function fetchData(){
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        if(!window.ipfs)await window["INITIPFS"](true)
        setweb3(web3)
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        console.log(networkId)
        // const deployedNetwork = PDContract.networks[networkId];
        const instance = new web3.eth.Contract(
          PDContract.abi,
          // deployedNetwork && deployedNetwork.address,
          "0xf07AceA1dB989df2236339D616338bEcB84a0600"
        );// 0x4CF247a90956185559EE5fb2A9A7E8dDd8A8E985 Drive address
        setaccount(accounts)
        setcontract(instance)
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    fetchData()//.then(runExample())
  });

  async function runExample  (){
    // const { web3,accounts } = this.state;
    // console.log("trigger")
    if(initflag)return
    if(!web3){
      
      return
    }
    if(!accounts)return
    setinitflag(true)
    let nonce = Math.floor(Math.random() * 1000000)
    // let location = useLocation();
    // 簽章
    // web3.eth.personal.sign(web3.utils.fromUtf8(`I am signing my one-time nonce: ${nonce}`), accounts[0], (err,sig)=>{
      // console.log(sig)
    //   web3.eth.personal.ecRecover(`I am signing my one-time nonce: ${nonce}`,sig)
    //   .then((pubKey)=>{
    //     console.log(pubKey)
    //     if(pubKey === accounts[0].toLowerCase()){
    //        console.log('pass')
    //       //  history.push('/Upload')
          
    //     }
    //   })
      
    // });

   
  };
  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
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
              <Link to="/" style={{color: "white"}}>Home</Link>
            </Nav.Item>
            &nbsp;&nbsp;
            <Nav.Item>
              <Link to="/about" style={{color: "white"}}>Create certificate</Link>
            </Nav.Item>
            &nbsp;&nbsp;
            <Nav.Item>
              <Link to="/users" style={{color: "white"}}>Verify Certificate</Link>
            </Nav.Item>
        </Nav>
      </Navbar>
        

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/about">
            <CreateCert web3={web3}/>
          </Route>
          <Route path="/users">
            <Verify web3={web3}/>
          </Route>
          <Route path="/">
            <Home web3={web3}/>
          </Route>
        </Switch>
      </div>
    </Router>
    </>
  );
}

export default App;
