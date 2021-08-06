import React, { useState, useEffect} from "react";
// import getWeb3 from "../getWeb3";
import EthCrypto from 'eth-crypto';

import {Button,Container,Row,Col,Form,Table,Badge,Modal} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import PDContract from "../contracts/PedersenCommitment.json";
import row from "../model/row"
import testAdd from '../test/ipfs'
import PrivateKeyForm from '../components/privatekey'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'

const didJWT = require('did-jwt')
const crypto = require('crypto'); 
const J = require('dag-jose-utils')
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
function Verify (props) {
  const [web3,] = useState(props.web3)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [Certificate,setCert] = useState(null)
  const [Verify,setVerify] = useState(null)
  const [filelist,setfilelist] = useState([])
  const [VerifyCount,setVerifyCount] = useState(0)
  const [CertCount,setCertCount] = useState(0)
  const [type,setType] = useState(0)
  const [show,setShow] = useState(false)
  // const [modalType,setModal] = useState(0)
  const [prikey,setpriKey] = useState("")
  const [pubkey,setpubKey] = useState("")
  const [V_IPFSorDownload,setV_IPFSorDownload] = useState(true);
  const [V_IPFSorUPload,setV_IPFSorUPload] = useState(false);
  const [V_IPFSHash,setV_IPFSHash] = useState("");
  // const [readObj,setReadObj] = useState(null)
  const [result,setresult] = useState("")
  


  // type : 0 => IPFS
  // type : 1 => Upload Certificate Manually
  // modalType : 0 => Re Verify Each Row
  // modalType : 1 => View Raw Verification
  // modalType : 2 => View Raw Certification

  useEffect(()=>{
    async function fetchData(){
      try {
        // Get network provider and web3 instance.
        //const web3 = await getWeb3();
        if(!window.ipfs)await window["INITIPFS"](true)
        //setweb3(web3)
        // Use web3 to get the user's accounts.
        if(!accounts)setaccount(await web3.eth.getAccounts());
        // Get the contract instance.
        // const networkId = await web3.eth.net.getId();
        // console.log(networkId)
        // const deployedNetwork = PDContract.networks[networkId];
        if(!contract){
          let i = new web3.eth.Contract(
            PDContract.abi,
            // deployedNetwork && deployedNetwork.address,
            "0xf07AceA1dB989df2236339D616338bEcB84a0600"
          );// 0x4CF247a90956185559EE5fb2A9A7E8dDd8A8E985 Drive address
          
          setcontract(i)
        }
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

  // function OK
  function captureCertFile (event) {
    event.stopPropagation()
    event.preventDefault()
    var reader = new FileReader();
    reader.onload = function (event){
      console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      console.log(obj)
      setCert(obj)
      setCertCount(Object.keys(obj.Certificate).length)
    };
    reader.readAsText(event.target.files[0]);
    // setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
  }

  function captureVerifyFile (event) {
    event.stopPropagation()
    event.preventDefault()
    var reader = new FileReader();
    reader.onload =async function (event){
      try{
          var obj = JSON.parse(event.target.result);
          // setReadObj(obj)
          ////////////////////////
          // decode the JWT's key
          const rkey = await EthCrypto.decryptWithPrivateKey(
            prikey, // privateKey
            {
              ciphertext:obj.decodeMessage.ciphertext,
              ephemPublicKey:obj.decodeMessage.ephemPublicKey,
              iv:obj.decodeMessage.iv,
              mac:obj.decodeMessage.mac
            }
          );
          // decode JWT
          let Vlist =  await decryptJWEFILE(obj.jwt,rkey);
          ////////////////////////
          setVerify(Vlist)
          setVerifyCount(Object.keys(Vlist.VerifyList).length)
          if(Vlist.IPFSHash === "None"){
            setType(1)
          }
          else{
            setType(0)
            // get file from ipfs
            GetfileFromIPFS(Vlist.IPFSHash)
          }
      }catch(e){
        alert(e.message)
      }
    };
    reader.readAsText(event.target.files[0]);
    // setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
  }

  async function GetVfileFromIPFS(){
    let download = await window["ipfsget"](V_IPFSHash,true)
    var blob = new Blob(download[0], {type: "text/plain"});
    
    var reader = new FileReader();
    reader.onload =async (event) => {
      try{
        var obj = JSON.parse(event.target.result);
        // setReadObj(obj)
        ////////////////////////
        // decode the JWT's key
        const rkey = await EthCrypto.decryptWithPrivateKey(
          prikey, // privateKey
          {
            ciphertext:obj.decodeMessage.ciphertext,
            ephemPublicKey:obj.decodeMessage.ephemPublicKey,
            iv:obj.decodeMessage.iv,
            mac:obj.decodeMessage.mac
          }
        );
        // decode JWT
        let Vlist =  await decryptJWEFILE(obj.jwt,rkey);
        ////////////////////////
        setVerify(Vlist)
        setVerifyCount(Object.keys(Vlist.VerifyList).length)
        if(Vlist.IPFSHash === "None"){
          setType(1)
        }
        else{
          setType(0)
          // get file from ipfs
          GetfileFromIPFS(Vlist.IPFSHash)
        }
    }catch(e){
      alert(e.message)
    }
    };
    reader.readAsBinaryString(blob);
    
  }

  async function doVerification(){
      if(!Certificate || !Verify){
        alert("please upload file first")
        return;
      }
      setfilelist([])
      let mapping = Certificate.Certificate
      let flag = true;
      Verify.VerifyList.forEach(async element => {
        // console.log(element)
        let key = "0x"+ CryptoJS.SHA256(element.key+element.random).toString()
        // console.log(mapping[key])
        let result = await VerifyCommitment(mapping[key],"0x"+ CryptoJS.SHA256(element.value).toString(),element.random)
        // console.log(result)
        if(result){
          var r = new row(element.key,element.value,element.random,mapping[key],typeof element.value);
          setfilelist( arr => [...arr, r]);
        }
        else{
          flag = false
        }
      });
      if(flag)
        alert("Verification Success")
      else{
        alert("Verification fail")
        setfilelist([])
      }
  }
  async function VerifyCommitment(Commitment,C_value,C_random){
    try{
      let v  = await contract.methods.openCommitment(Commitment ,C_random,C_value).call();
      return v
    }
    catch(e){
      console.log(e)
      return false
    }
  }

  function CheckSignature(){
    if(!Certificate){
      alert("please upload Certificate first")
      return;
    }
    let V_Certificate = {
      Certificate:Certificate.Certificate,
      Issuer_address:Certificate.Issuer_address,
      Receiver_address:Certificate.Receiver_address
    }
    let VerStr = JSON.stringify(V_Certificate)
    web3.eth.personal.ecRecover(VerStr,Certificate.Issuer_signature)
    .then((addr)=>{
      // console.log(addr)
      // console.log(Certificate.Issuer_address)
      if(addr === Certificate.Issuer_address.toLowerCase()){
        // console.log(Certificate.Issuer_address)
        alert('Certificate Issuer : '+Certificate.Issuer_address +"\n"
             +'Certificate Signature : '+Certificate.Issuer_signature +"\n"
             +'Status : Pass')
        //  history.push('/Upload')
        
      }
    })
  }

  function handleCheckBox(position){
    // console.log(position)
    if(position > -1){
    // let obj = filelist.indexOf(position)
    // obj.share = !obj.share
    const Updatelist = filelist.map((item,index)=>{
      if(index === position){
        let newrow = new row(item.key,item.value,item.random,item.Commitment,item.type,!item.share)
        return newrow
      }
      else{
        return item
      }
    }
    );
    setfilelist(Updatelist)
    // console.log(filelist)
    }
  }

  async function GenSelectiveVerification(){
    // Verify List
    let VerifyList = []
    filelist.forEach(element => {
      if(element.share){
        let item = {
          key:element.key,
          value:element.value,
          random:element.random
        }
        VerifyList.push(item)
      }
    });
    if(VerifyList.length > 0){
      let writeObj = {
        IPFSHash:Verify.IPFSHash,
        VerifyList:VerifyList
      }

    //encrypt JWT key
    let key = crypto.randomBytes(32)
    let VJwt =await encryptJWEFile(writeObj,key)
    // console.log(key.toString('Hex'))
    const encrypted = await EthCrypto.encryptWithPublicKey(
      pubkey, //receiver publicKey
      key.toString('Hex') // message
    )

    //
    let exportObj = {
      jwt:VJwt,
      decodeMessage:encrypted
    }
      const fileData2 = JSON.stringify(exportObj);
      const blob2 = new Blob([fileData2], {type: "text/plain"});
    
      if(V_IPFSorDownload){
        let cid =await window["ipfsadd"](blob2,true)
        // console.log(cid)
        setresult(cid)
        alert("Verify has been published to IPFS,\n IPFS Hash is "+cid)
      }
      else{
        const url2 = URL.createObjectURL(blob2);
        const link2 = document.createElement('a');
        link2.download = 'Verify.json';
        link2.href = url2;
        link2.click();
      }
    }
    else{
      alert("Nothing can share")
    }

    setShow(false)
  }
  async function GetfileFromIPFS(ipfsHash){
    let download = await window["ipfsget"](ipfsHash,true)
    var blob = new Blob(download[0], {type: "text/plain"});
    
    var reader = new FileReader();
    reader.onload = (event) => {
      // console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      // console.log(obj)
      setCert(obj)
      setCertCount(Object.keys(obj.Certificate).length)
    };
    reader.readAsBinaryString(blob);
    
  }

  function openRawVerifyfile(){
    var newwin = window.open("/raw");
    newwin.document.write("<html><title>raw file</title><body>"+JSON.stringify(Verify)+"</body></html>")
  }

  function ProveIsReceiver(){
    if(!Certificate){
      alert("please upload verify.json first!")
      return
    }
      let nonce = Math.floor(Math.random() * 1000000)
    // let location = useLocation();
    web3.eth.personal.sign(web3.utils.fromUtf8(`I am going to prove myself, one-time nonce: ${nonce}`), accounts[0], (err,sig)=>{
      // console.log(sig)
      web3.eth.personal.ecRecover(`I am going to prove myself, one-time nonce: ${nonce}`,sig)
      .then((addr)=>{
        // console.log(addr)
        if(addr === Certificate.Receiver_address.toLowerCase()){
           alert('the signer address is equal to receiver!')
          //  history.push('/Upload')
          
        }
      })
    })
  }

  async function decryptJWEFILE(jweObj,key){
    let dec = didJWT.xc20pDirDecrypter(Buffer.from(key,'hex'))
    let decoded =await didJWT.decryptJWE(jweObj,dec)
    return J.decodeCleartext(decoded)
  }

  async function encryptJWEFile(payload,key){
    let enc = didJWT.xc20pDirEncrypter(key);
    let w = await J.prepareCleartext(payload)
    let jwt = await didJWT.createJWE(w,[enc])
    return jwt
  }

    return (
      <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* <Header></Header> */}
        
        <Modal show={show} onHide={()=>{setShow(false)}}>
              <Modal.Header closeButton>
                <Modal.Title>Let's Encrypted for your sharing target</Modal.Title>
              </Modal.Header>
            
              <Modal.Body>
                <PrivateKeyForm Title={"Share Target's publicKey Key"} privatekey={pubkey} setprivatekey={setpubKey} style={{ marginRight: 4 }}/>
                <form className="Uploadform">
                  <label className="password">Shared Verification Publish to IPFS(On)</label>
                  <BootstrapSwitchButton checked={V_IPFSorDownload} onChange={()=>{setV_IPFSorDownload(!V_IPFSorDownload)}} onstyle="info" onlabel="IPFS" offlabel="Local" width="100"/>
                  <br/>
                </form>
              </Modal.Body>
              <Modal.Footer>
              <Button variant="secondary" content='Upload' onClick = {GenSelectiveVerification}>Continue Generate Selective Verification</Button>
              </Modal.Footer>
        </Modal>
        <Row>
          <Col sm={9}>
          <div className="App">
            <br/>
                  <h2>Verify</h2>
            <br/>
            <h4>Verify Keys : TotalKeys = {VerifyCount} : {CertCount}</h4>
            <Form>
                <Form.Row>
                    <Col></Col>
                    <Col xs={1}>
                      <Button variant="secondary" content='Upload' onClick = {doVerification}>Verification</Button>
                    </Col>
                    <Col xs={3}>
                      <Button variant="secondary" content='Upload' onClick = {()=>{setShow(true)}}>Generate Selective Verification</Button>
                    </Col>
                    <Col></Col>
                </Form.Row>
                <Form.Row>
                    <Col></Col>
                    <Col xs={4}>
                      {(result)?"Shared Verify JWE IPFS : "+result:""}
                    </Col>
                    <Col></Col>
                </Form.Row>
            </Form>
            <Table striped bordered hover size="sm" style = {{width :'85%',margin:"auto",marginTop : "1%"}}>
            <thead>
              <tr>
                <th>#</th>
                <th>key</th>
                <th>value</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody >
            {filelist.map((self,index) => <tr key={index}>
                <td width="3%">{index}</td>
                {/* name */}
                <td>{self.key}</td>
                {/* type */}
                <td>{self.value}</td>
                {/* hash */}
                <td width="35%">
                  {/* {console.log(index)} */}
                  <Form.Check type="checkbox" checked={self.share} label="Allow to Share" onChange={()=>{handleCheckBox(index)}} /></td>
              </tr>)}
            </tbody>
          </Table>
          </div>
          </Col>
          <Col xs lg="2">
            <PrivateKeyForm Title={"Opener private Key"} privatekey={prikey} setprivatekey={setpriKey} style={{ marginRight: 4 }}/>
            
            <form className="Uploadform">
              <label className="password">Upload Verify file or IPFSHash</label>
              <BootstrapSwitchButton checked={V_IPFSorUPload} onChange={()=>{setV_IPFSorUPload(!V_IPFSorUPload)}} onstyle="info" onlabel="IPFS" offlabel="Upload" width="100"/>

              {(V_IPFSorUPload)?
                <>
                  &nbsp;&nbsp;&nbsp;
                  <Button variant="dark" content='Upload' onClick = {GetVfileFromIPFS}>Get Verifiy file!</Button>
                  <label className="password">Verification IPFS Hash</label>
                  <input type={type} className="password__input" value={V_IPFSHash} onChange={(e)=>{setV_IPFSHash(e.target.value)}} />
                </>:
                <>
                <label className="password">Upload Verify file</label>
                <input type="file" onChange={captureVerifyFile} style={{ marginBottom: 4 }}/>
                </>
              }
            </form>
            {(type === 0)?<></>:
            <form className="Uploadform">
            <Container>
              <Row>
                <label className="password">Upload Certificate file</label>
                <input type="file" onChange={captureCertFile} style={{ marginBottom: 4 }}/>
              </Row>
              <Row>
                <label className="password">Certificate Issuer : </label>
                <span>{(Certificate)?Certificate.Issuer_address:""}</span>
                <br/>
              </Row>
            </Container>
            </form>
            }

            <form className="Uploadform">
              <label className="password">File Status</label>
              Certificate:&nbsp;{(Certificate)? <Badge variant="success">Load Success</Badge>:<Badge variant="danger">No file</Badge>}
              &nbsp;{(Verify)?<a href={"https://ipfs.io/ipfs/"+Verify.IPFSHash} target="_blank" rel="noreferrer" >View Raw</a>:""}
              <br/>
              Verification:&nbsp;{(Verify)?<Badge variant="success">Load Success</Badge>:<Badge variant="danger">No file</Badge>}
              &nbsp;{(Verify)?<a href="javascript:void(0)" onClick={openRawVerifyfile}>View Raw</a>:""}
              <br/>
              &nbsp;{(Verify)?<a href={"https://ipfs.io/ipfs/"+V_IPFSHash} target="_blank" rel="noreferrer" >View Raw JWT</a>:""}
            </form>
            <form className="Uploadform">
              <label className="password">Functions</label>
              <Row>
              {(Certificate)?<Button variant="dark" content='Upload' onClick = {CheckSignature}>Check Certificate Issuer's Signature</Button>:""}
              </Row>
              <Row>
                &nbsp;
              </Row>
              <Row>
              {(Certificate)?<Button variant="dark" content='Upload' onClick = {ProveIsReceiver}>Prove I'm the receiver</Button>:""}
              </Row>
              <Row>
                &nbsp;
              </Row>
              {/* <Row>
              {(Certificate)?<Button variant="dark" content='Upload' onClick = {doVerification}>Verify PedersenCommitments</Button>:""}
              </Row> */}
            </form>
          </Col>
           
        </Row>
      </Container>
      
      
      </>
      );
}

export default Verify;
