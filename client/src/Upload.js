import React, { Component , useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import {Navbar,Button,Form} from 'react-bootstrap'
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactLogo from './logo.svg';
import EthCrypto from 'eth-crypto';
import PrivateKeyForm from './components/privatekey'
import DriveTable from './components/DriveTable'
import DriveContract from "./contracts/Drive.json";
// import a from 'eth-simple-keyring'
// import {testAdd} from './test/ipfs'
import {
  useHistory,
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
function Upload (props) {
  // state = { storageValue: 0, web3: null, accounts: null, contract: null };
  const [storageValue ,setstorageValue] = useState(0)
  const [web3,setweb3] = useState(null)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [uploadfile,setuploadfile] = useState(null)
  const [privatekey,setprivatekey] = useState("9ef8787a4f1d91166e1ed778819cc5f30702019f5a04dd9b0cd0ec9c1081a793")
  let history = useHistory();
//   const [ipfs,setipfs]= useState(null);
  const [dekey,setdekey] = useState(null)
  const [deiv,setdeiv] = useState(null)
  const [initflag,setinitflag] = useState(false);


  useEffect(()=>{
    async function fetchData(){
      try {
        // Get network provider and web3 instance.
        if(!window.ipfs)await window["INITIPFS"](true)
        let web3 = await getWeb3();
        // if(!initflag) {
          // let web3 = await 
          setweb3(web3)
        
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        console.log(networkId)
        const deployedNetwork = DriveContract.networks[networkId];
        const instance = new web3.eth.Contract(
          DriveContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        console.log(instance)
        // setipfs(ipfs);
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        // this.setState({ web3, accounts, contract: instance });
        
        setaccount(accounts)
        setcontract(instance)
        // setinitflag(true)
        // }
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
    }
    fetchData()
  });

  function captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
  
    setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
  }
  async function UploadtoChainEncrypted(){
    var key = generateHexString(58);
    setdekey(key)
    var salt = CryptoJS.lib.WordArray.random(128/8);
	var iv = CryptoJS.lib.WordArray.random(128/8);
    setdeiv(iv)
    var file = uploadfile;
    var reader = new FileReader();
    console.log(key,iv)
      // Read file callback!
    reader.onload =  function (e) {
      
        var encrypted = CryptoJS.AES.encrypt(e.target.result, key, { iv: iv, 
            mode: CryptoJS.mode.CTR, 
            // padding: CryptoJS.pad.Pkcs7 
        });
        console.log(encrypted.ciphertext)
        var encryptedFile = new Blob([encrypted], {type: file.type});
        setcontract(e.target.result)
        let decrypted =  CryptoJS.AES.decrypt(encrypted, key, { iv: iv, 
        // let decrypted =  CryptoJS.AES.decrypt(encryptedFile, key, { iv: iv, 
            mode: CryptoJS.mode.CTR, 
            // padding: CryptoJS.pad.Pkcs7 
        }).toString(CryptoJS.enc.Utf8);
        console.log(decrypted)
        console.log(_base64ToArrayBuffer(e.target.result.split(',')[1]))
        // if(e.target.result == decrypted){
        //     console.log("same")
        // }
        if("data:application/pdf;base64,"+btoa(String.fromCharCode(...new Uint8Array(_base64ToArrayBuffer(e.target.result.split(',')[1])))) == e.target.result){
          console.log("same using array buffer")
        }
        // data:application/pdf;base64,
        var decryptedFile = new File([decrypted], "test", {type: "application/pdf"});
        // console.log('decryptedFile', decryptedFile);
        // var link = document.createElement('a');
        // link.href = decrypted;
        // var fileName = "reportName";
        // link.download = fileName;
        // link.click();
        console.log('encryptedFile', encryptedFile.size);
        setuploadfile(encryptedFile)
    }
    reader.readAsDataURL(file);
  }

  async function UploadtoChain(){// without encryption'
    
    console.log(web3)
    let deployedNetwork = DriveContract.networks["5777"]
    const instance = new web3.eth.Contract(
      DriveContract.abi,
      deployedNetwork && deployedNetwork.address,
    );
    console.log(instance)
      if(uploadfile && contract){
          console.log(uploadfile.name)
          console.log(contract )
          
          let cid =await window["ipfsadd"](uploadfile,true)
          console.log(cid.toString())
          setstorageValue(cid.toString())
          try{
          await contract.methods.Upload(cid.toString(),uploadfile.name,uploadfile.type)
                .send({ from: accounts[0] });
          }
          catch(err){
            console.log(err.message)
          }
          // test decrypt
          // await GetfileDecrypt(dekey,deiv,cid.toString())
      }
      else{
          console.log('no file selected')
      }
  }
  async function GetfileDecrypt(key, iv, ipfsHash){//  encryption
    console.log(ipfsHash)
    let download = await window["ipfsget"](ipfsHash,true)
    var blob = new Blob(download[0], {type: "application/pdf"});
    
    
    let reader = new FileReader();
    reader.onload = () => {
        var decrypted = CryptoJS.AES.decrypt(reader.result, key, { iv: iv, 
        mode: CryptoJS.mode.CTR, 
        // padding: CryptoJS.pad.Pkcs7 
        }).toString(CryptoJS.enc.Utf8);
        // var decryptedFile = new Blob([decrypted], {type: "application/pdf"});
        const a = document.createElement("a");
        // const url = window.URL.createObjectURL(decryptedFile);
        const filename = "QAQ";
        a.href = decrypted;
        a.download = filename;
        a.click();
        // window.URL.revokeObjectURL(url);
    };
    reader.readAsBinaryString(blob);
    
  }
  async function Getfile(){// without encryption
    console.log(storageValue)
    let download = await window["ipfsget"](storageValue,true)
    console.log(download)
    var blob = new Blob(download[0], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = "reportName";
    link.download = fileName;
    link.click();
  }

  async function testencryptbypublickey(){
    let pubkey = privateKeyToPublicKey(privatekey).toString('hex')
    let k = generateHexString(58)
    console.log(k)
    const encrypted = await EthCrypto.encryptWithPublicKey(
      pubkey, // publicKey
      k // message
    )
    console.log(encrypted)
    const message = await EthCrypto.decryptWithPrivateKey(
      privatekey, // privateKey
      encrypted
    );
    console.log(message)
  }

  function generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0,length);
  }
  function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

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
          //  history.push('/Upload')
          
        }
      })
      
    });

   
  };

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
      <PrivateKeyForm/>
      <div className="App">
        <br/>
              <h3>IPFS drive</h3>
              <Form>
              {/* <Form.Field> */}
              <input
                type="file"
                onChange={captureFile}
                // accept="application/json"
                style={{ marginBottom: 4 }}
              />
              {/* </Form.Field> */}
              <a><Button variant="info" content='Upload' onClick = {UploadtoChainEncrypted}>Upload file Encrypt</Button></a>
              &nbsp;&nbsp;&nbsp;
              <a><Button variant="info" content='Upload' onClick = {UploadtoChain}>Upload file</Button></a>
              </Form>
              <Button variant="info" content='Upload' onClick = {Getfile}>Get file</Button>
              <Button variant="info" content='Upload' onClick = {testencryptbypublickey}>test key encrypt</Button>
              <DriveTable/>
      </div>
      </>
      );
  // }
}


export default Upload;
