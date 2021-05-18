import React, { Component , useState, useEffect } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import {Navbar,Button} from 'react-bootstrap'
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLogo from './logo.svg';
import Upload from './Upload';
import Header from './components/Header'
import {
  useHistory,
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function Login () {
  // state = { storageValue: 0, web3: null, accounts: null, contract: null };
  const [storageValue ,setstorageValue] = useState(0)
  const [web3,setweb3] = useState(null)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  let history = useHistory();

  useEffect(()=>{
    async function fetchData(){
      try {
        // Get network provider and web3 instance.
        let web3 = await getWeb3();
  
        // Use web3 to get the user's accounts.
        let accounts = await web3.eth.getAccounts();
  
        // Get the contract instance.
        let networkId = await web3.eth.net.getId();
        let deployedNetwork = SimpleStorageContract.networks[networkId];
        let instance = new web3.eth.Contract(
          SimpleStorageContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
  
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        // this.setState({ web3, accounts, contract: instance });
        setweb3(web3)
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
    fetchData()
  } 
  ,[]);

  async function runExample  (){
    // const { web3,accounts } = this.state;
    let nonce = Math.floor(Math.random() * 1000000)
    // let location = useLocation();
    web3.eth.personal.sign(web3.utils.fromUtf8(`I am signing my one-time nonce: ${nonce}`), accounts[0], (err,sig)=>{
      // console.log(sig)
      web3.eth.personal.ecRecover(`I am signing my one-time nonce: ${nonce}`,sig)
      .then((pubKey)=>{
        console.log(pubKey)
        if(pubKey === accounts[0].toLowerCase()){
           console.log('pass')
           history.push('/Upload')
          
        }
      })
      
    });

   
  };

  // render() {
    if (!web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
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
          
        </Router>
        
      </Navbar>
      <div className="App">
          <form>
              <h3>Sign In</h3>

              <Button variant="info" onClick={runExample}>Info</Button>
          </form>
      </div>
      </>
      );
  // }
}


export default Login;
