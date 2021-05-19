import React, { useState, useEffect} from "react";
import getWeb3 from "./getWeb3";
import {Button,Container,Row,Col} from 'react-bootstrap'
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import testAdd from './test/ipfs'
import EthCrypto from 'eth-crypto';
import PrivateKeyForm from './components/privatekey'
import DriveTable from './components/DriveTable'
import DriveContract from "./contracts/Drive.json";
import Header from './components/Header'
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
function App (props) {
  // const [storageValue ,setstorageValue] = useState(0)
  const [web3,setweb3] = useState(null)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [uploadfile,setuploadfile] = useState(null)
  const [privatekey,setprivatekey] = useState(null)
  const [initflag,setinitflag] = useState(false);
  const [filelist,setfilelist] = useState([])
  // const [dekey,setdekey] = useState(null)
  // const [deiv,setdeiv] = useState(null)


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
        // const deployedNetwork = DriveContract.networks[networkId];
        const instance = new web3.eth.Contract(
          DriveContract.abi,
          // deployedNetwork && deployedNetwork.address,
          "0x4CF247a90956185559EE5fb2A9A7E8dDd8A8E985"
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

    // fetchData().then(runExample())
    fetchData().then(initList())
  });
// function OK
  function captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
  
    setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
  }
// function OK
  async function UploadtoChainEncrypted(){
    // check if there is private key
    if(!privatekey){
      alert('please enter your private key first')
      return;
    }
    // private key turn public key
    try{
      let pubkey = privateKeyToPublicKey(privatekey).toString('hex')
      // gen key ,iv
      var key = generateHexString(58);
      console.log("key",key)
      var iv = CryptoJS.lib.WordArray.random(128/8);

    // encrypt key
    
      const encrypted = await EthCrypto.encryptWithPublicKey(
        pubkey, // publicKey
        key // message
      )
      // encrypt file
      let encryptedFile =await  EncryptFile(key);
      console.log(encryptedFile)
      // send to ipfs
      let cid =await window["ipfsadd"](encryptedFile,true)
      // send to chain
      await contract.methods.UploadEncrypt(
                cid.toString(),uploadfile.name,uploadfile.type,iv.toString(CryptoJS.enc.Hex),
                encrypted.ciphertext,encrypted.ephemPublicKey,encrypted.iv,encrypted.mac
            ).send({ from: accounts[0],gas:4500000 });
    }
    catch(err){
      console.log(err.message)
      alert(err.message)
    }
  }
// function OK
  async function EncryptFile(key,iv){
    var file = uploadfile;
    var reader = new FileReader();
    var encryptedFile
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload =  function (e) {
        var encrypted = CryptoJS.AES.encrypt(e.target.result, key, { iv: iv, 
            mode: CryptoJS.mode.CTR, 
        });
      // Read file callback!
        encryptedFile = new Blob([encrypted], {type: file.type});
        console.log('encryptedFile finish',encryptedFile);
        resolve(encryptedFile)
        // setuploadfile(encryptedFile)
      }
      reader.readAsDataURL(file);
    });
  }
// for testing not use now
  // async function UploadtoChainEncryptedfortest(){
  //   var key = generateHexString(58);
  //   setdekey(key)
  //   var salt = CryptoJS.lib.WordArray.random(128/8);
	//   var iv = CryptoJS.lib.WordArray.random(128/8);
  //   setdeiv(iv)
  //   var file = uploadfile;
  //   var reader = new FileReader();
  //   console.log(key,iv)
  //     // Read file callback!
  //   reader.onload =  function (e) {
      
  //       var encrypted = CryptoJS.AES.encrypt(e.target.result, key, { iv: iv, 
  //           mode: CryptoJS.mode.CTR, 
  //           // padding: CryptoJS.pad.Pkcs7 
  //       });
  //       console.log(encrypted.ciphertext)
  //       var encryptedFile = new Blob([encrypted], {type: file.type});
  //       setcontract(e.target.result)
  //       let decrypted =  CryptoJS.AES.decrypt(encrypted, key, { iv: iv, 
  //       // let decrypted =  CryptoJS.AES.decrypt(encryptedFile, key, { iv: iv, 
  //           mode: CryptoJS.mode.CTR, 
  //           // padding: CryptoJS.pad.Pkcs7 
  //       }).toString(CryptoJS.enc.Utf8);
  //       console.log(decrypted)
  //       console.log(_base64ToArrayBuffer(e.target.result.split(',')[1]))
  //       // if(e.target.result == decrypted){
  //       //     console.log("same")
  //       // }
  //       // if("data:application/pdf;base64,"+btoa(String.fromCharCode(...new Uint8Array(_base64ToArrayBuffer(e.target.result.split(',')[1])))) == e.target.result){
  //       //   console.log("same using array buffer")
  //       // }
  //       // data:application/pdf;base64,
  //       // var decryptedFile = new File([decrypted], "test", {type: "application/pdf"});
  //       // console.log('decryptedFile', decryptedFile);
  //       // var link = document.createElement('a');
  //       // link.href = decrypted;
  //       // var fileName = "reportName";
  //       // link.download = fileName;
  //       // link.click();
  //       console.log('encryptedFile', encryptedFile.size);
  //       setuploadfile(encryptedFile)
  //   }
  //   reader.readAsDataURL(file);
  // }
// function OK
  async function UploadtoChain(){// without encryption'
    
      if(uploadfile && contract){
          console.log(uploadfile.name)
          console.log(contract )
          
          let cid =await window["ipfsadd"](uploadfile,true)
          console.log(cid.toString())
          // setstorageValue(cid.toString())
          try{
            console.log(cid.toString(),uploadfile.name,uploadfile.type)
          await contract.methods.Upload(cid.toString(),uploadfile.name,uploadfile.type)
                .send({ from: accounts[0],gas:4500000 });
          }
          catch(err){
            console.log(err.message)
          }
          // test decrypt
          // await GetfileDecrypt(dekey,deiv,cid.toString())
      }
      else{
          console.log('no file selected')
          alert('no file selected')
      }
  }
// function OK
  async function DecryptFile(decryptkeyIndex, iv, ipfsHash ,fname,ftype){
    // check if there is private key
    if(!privatekey){// 
      alert('please enter your private key first')
      return;
    }
    let abcd = await contract.methods.keyArray(decryptkeyIndex).call()
    console.log(abcd)
    // DecryptFileKey
    const rkey = await EthCrypto.decryptWithPrivateKey(
      privatekey, // privateKey
      {
        ciphertext:abcd[0],
        ephemPublicKey:abcd[1],
        iv:abcd[2],
        mac:abcd[3]
      }
    );
    console.log(rkey)
    await GetfileDecrypt(rkey, iv, ipfsHash, fname,ftype)
  }
// function OK
  async function GetfileDecrypt(key, iv, ipfsHash, fname,ftype){//  encryption
    console.log(ipfsHash)
    let download = await window["ipfsget"](ipfsHash,true)
    var blob = new Blob(download[0], {type: ftype});
    
    var reader = new FileReader();
    reader.onload = () => {
        var decrypted = CryptoJS.AES.decrypt(reader.result, key, { iv: iv, 
        mode: CryptoJS.mode.CTR, 
        }).toString(CryptoJS.enc.Utf8);
        const a = document.createElement("a");
        a.href = decrypted;
        a.download = fname;
        a.click();
    };
    reader.readAsBinaryString(blob);
    
  }
// function OK
//   async function Getfile(){// without encryption
//     console.log(storageValue)
//     let download = await window["ipfsget"](storageValue,true)
//     console.log(download)
//     var blob = new Blob(download[0], {type: "application/pdf"});
//     var link = document.createElement('a');
//     link.href = window.URL.createObjectURL(blob);
//     var fileName = "reportName";
//     link.download = fileName;
//     link.click();
//   }
// // for testing 
//   async function testencryptbypublickey(){
//     let pubkey = privateKeyToPublicKey(privatekey).toString('hex')
//     let k = generateHexString(58)
//     console.log(k)
//     const encrypted = await EthCrypto.encryptWithPublicKey(
//       pubkey, // publicKey
//       k // message
//     )
//     console.log(encrypted)
//     const message = await EthCrypto.decryptWithPrivateKey(
//       privatekey, // privateKey
//       encrypted
//     );
//     console.log(message)
//   }
// function OK
  function generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0,length);
  }
// for testing 
  // function _base64ToArrayBuffer(base64) {
  //   var binary_string = window.atob(base64);
  //   var len = binary_string.length;
  //   var bytes = new Uint8Array(len);
  //   for (var i = 0; i < len; i++) {
  //       bytes[i] = binary_string.charCodeAt(i);
  //   }
  //   return bytes.buffer;
  // }
// for log in // for testing 
  // async function runExample  (){
  //   // const { web3,accounts } = this.state;
  //   console.log("trigger")
  //   if(initflag)return
  //   if(!web3)return
  //   if(!accounts)return
  //   setinitflag(true)
  //   let nonce = Math.floor(Math.random() * 1000000)
  //   // let location = useLocation();
  //   web3.eth.personal.sign(web3.utils.fromUtf8(`I am signing my one-time nonce: ${nonce}`), accounts[0], (err,sig)=>{
  //     // console.log(sig)
  //     web3.eth.personal.ecRecover(`I am signing my one-time nonce: ${nonce}`,sig)
  //     .then((pubKey)=>{
  //       console.log(pubKey)
  //       if(pubKey === accounts[0].toLowerCase()){
  //          console.log('pass')
  //         //  history.push('/Upload')
          
  //       }
  //     })
      
  //   });

   
  // };

  async function initList(){
    if(initflag)return
    await getList()
  }

  async function getList(){
    if(!contract)return
     let file =  await contract.methods.ViewFiles().call()
     console.log(file)
     setfilelist(file)
     setinitflag(true)

  }

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
    return (
      <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Header></Header>
        <Row>
          <Col sm={9}>
          <div className="App">
            <br/>
                  <h2>IPFS drive</h2>
            <br/>
            <h4>refresh file</h4>
            <Button variant="secondary" content='Upload' onClick = {getList}><i className="fas fa-sync"></i></Button> 
            <DriveTable files={filelist} DecryptFile={DecryptFile} />
          </div>
          </Col>
          <Col xs lg="2">
            <PrivateKeyForm privatekey={privatekey} setprivatekey={setprivatekey} style={{ marginRight: 4 }}/>
            <form className="Uploadform">
              <Container>
                  <Row>
                    <Col>
                    <label className="password"> &nbsp;&nbsp;&nbsp;upload&nbsp;&nbsp;</label>
                    <a className="middle"><Button variant="secondary" content='Upload' onClick = {UploadtoChain}>Upload &nbsp;&nbsp;&nbsp;&nbsp;file&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Button></a>
                    </Col>
                    <Col xs={7}>
                    <label className="password">Encrypt upload</label>
                    <a><Button variant="dark" content='Upload' onClick = {UploadtoChainEncrypted}>Upload file Encrypt</Button></a>
                    </Col>
                  </Row>
              </Container>
            </form>
            <form className="Uploadform">
              <label className="password">Upload file</label>
              <input type="file" onChange={captureFile} style={{ marginBottom: 4 }}/>
            </form>
          </Col>
        </Row>
      </Container>
      
      
      </>
      );
}

export default App;
