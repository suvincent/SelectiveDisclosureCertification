import React, { useState, useEffect} from "react";
// import getWeb3 from "../getWeb3";
import {Button,Container,Row,Col,Form} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import testAdd from '../test/ipfs'
import EthCrypto from 'eth-crypto';
import PrivateKeyForm from '../components/privatekey'
import DriveTable from '../components/DriveTable'
import PDContract from "../contracts/PedersenCommitment.json";
import row from "../model/row"
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
const didJWT = require('did-jwt')
const crypto = require('crypto'); 
const J = require('dag-jose-utils')
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
function CreateCert (props) {
  // const [storageValue ,setstorageValue] = useState(0)
  const [web3,] = useState(props.web3)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [uploadfile,setuploadfile] = useState(null)
  // const [privatekey,setprivatekey] = useState(null)
  // const [initflag,setinitflag] = useState(false);
  const [filelist,setfilelist] = useState([])
  const [Key,setKey] = useState("")
  const [Value,setValue] = useState("")
  // const [IPFSHash,setIPFSHash] = useState("QmVKRJ4jxxzqchoB3K4pLwmtJzBawN3GQdR4ZzwYYMJxPa");
  const [IPFSHash,setIPFSHash] = useState("");
  const [address,setAddr] = useState("");
  const [C_IPFSorDownload,setC_IPFSorDownload] = useState(true);
  const [V_IPFSorDownload,setV_IPFSorDownload] = useState(true);
  const [pubkey,setpubKey] = useState("")

  const [result,setresult] = useState("")
  
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
            "0xfa3A50fd35D10160626080614376d314592054Be" // pedersen commitment with ZKP contract
          );
          
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
  async function UploadtoChain(VerifyIsIPFS){// without encryption'
    
      if(uploadfile && contract){
          try{
          const fileData = JSON.stringify(uploadfile);
          const blob = new Blob([fileData], {type: "text/plain"});
          let cid =await window["ipfsadd"](blob,true)
          // console.log(cid.toString())
          setIPFSHash(cid.toString())
          GenVerifyJson(cid.toString(),VerifyIsIPFS)
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
  function generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0,length);
  }

  async function AddColumn(){
    // console.log("ADD")
    if(!Key||!Value){
        alert("欄位不能為空值")
        return
    }
    let tempV = Value
    if(typeof Value != 'number'){
      //  alert("value will be hashed")
       tempV ="0x"+ CryptoJS.SHA256(Key+":"+Value).toString();
    }
    // console.log(tempV)
    
    let random ="0x"+ generateHexString(58)
    // console.log(random)
    let commitment = await GenPDCommitment(tempV,random);
    // setfilelist(filelist.push(r))
    // await VerifyCommitment(Value,"38843084404664773737811034719809089006355033921160053724844404266166110833973");
    var r = new row(Key,Value,random,commitment,typeof Value);
    setfilelist( arr => [...arr, r]);
    setKey("")
    setValue("")
  }

  async function GenPDCommitment(C_value,C_random){
      try{
        let result = await contract.methods.createCommitment(C_value,C_random).call();
        // console.log(result)
        return result
      }
      catch(e){
          console.log(e);
      }
     
  }

  async function GenSigneture(){
    // global certificate part
    if(!address){
      alert("please fill in the receiver address")
      return
    }
    let SignatureMap = {}
    filelist.forEach(element => {
      let key = "0x"+ CryptoJS.SHA256(element.key).toString()
      SignatureMap[key] = element.Commitment
    });
    let signDate = (new Date()).getTime()
    let SignObj = {
      Certificate:SignatureMap,
      SignDate:signDate,
      Issuer_address:accounts[0],
      Receiver_address:address
    }
    let j = JSON.stringify(SignObj)
    // console.log(j)// 可以看看要不要hash??
    web3.eth.personal.sign(web3.utils.fromUtf8(j), accounts[0], (err,sig)=>{
          // console.log(sig)
          let writeObj = {
            Certificate:SignatureMap,
            SignDate:signDate,
            Issuer_address:accounts[0],
            Receiver_address:address,
            Issuer_signature:sig
          }
          setuploadfile(writeObj)
    }); 
  }
  function Download(){
    const fileData = JSON.stringify(uploadfile);
    const blob = new Blob([fileData], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'Certificate.json';
    link.href = url;
    link.click();
  }

  async function GenVerifyJson(IPFS,VerifyIsIPFS){
      // 
      if(!pubkey){
        alert("please insert public key first!")
        return
      }
      // Verify List
      let VerifyList = []
      filelist.forEach(element => {
        let item = {
          key:element.key,
          value:element.value,
          random:element.random
        }
        VerifyList.push(item)
      });
      let writeObj = {
        IPFSHash:IPFS,
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
      if(VerifyIsIPFS){
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

  function OnchangeInput(e){
    setAddr(e.target.value)
    // console.log(props.privatekey)
  }
  async function encryptJWEFile(payload,key){
    let enc = didJWT.xc20pDirEncrypter(key);
    let w = await J.prepareCleartext(payload)
    let jwt = await didJWT.createJWE(w,[enc])
    return jwt
  }

  async function GenCertificate(){
    // console.log(C_IPFSorDownload)
    // console.log(V_IPFSorDownload)
    
    // Verify
    if(V_IPFSorDownload){//IPFS
      // Certificate
      if(C_IPFSorDownload){//IPFS
          UploadtoChain(true)
          // UPload Verifiy to chain
      }
      else{//Local
        Download();
        // 這個Gen 應該要
        GenVerifyJson("None",false)
      }
    }
    else{//Local
      // Certificate
      if(C_IPFSorDownload){//IPFS
        UploadtoChain(false) 
      }
      else{//Local
        Download();
        GenVerifyJson("None",false)
      }
    }

  }

  ////////////////////////////
  // cheat button
  async function AddColumn_auto(k,v){
    let tempV = v
    if(typeof v != 'number'){
      //  alert("value will be hashed")
       tempV ="0x"+ CryptoJS.SHA256(k+":"+v).toString();
    }
    // console.log(tempV)
    
    let random ="0x"+ generateHexString(58)
    // console.log(random)
    let commitment = await GenPDCommitment(tempV,random);
    // setfilelist(filelist.push(r))
    // await VerifyCommitment(Value,"38843084404664773737811034719809089006355033921160053724844404266166110833973");
    var r = new row(k,v,random,commitment,typeof v);
    setfilelist( arr => [...arr, r]);
  }
  async function ID_CheatButton(){
    setfilelist([])
    await AddColumn_auto("idNum","V123456789");
    await AddColumn_auto("nationality","R.O.C");
    await AddColumn_auto("name","Demo Voter");
    await AddColumn_auto("birthdate","1000/1/1");
  }
  async function School_CheatButton(){
    setfilelist([])
    await AddColumn_auto("schoolName","XXX university");
    await AddColumn_auto("department","ISA");
    await AddColumn_auto("graduated","not");
    await AddColumn_auto("average score","C");
    await AddColumn_auto("name","Demo Voter");
  }
  async function Company_CheatButton(){
    setfilelist([])
    await AddColumn_auto("CompanyName","SCK tech");
    await AddColumn_auto("position","clean bathroom");
    await AddColumn_auto("MonthlySalary","100K");
    await AddColumn_auto("name","Demo Voter");
  }

  async function Receiver_CheatButton(){
    // A student config
    setpubKey("04e18dedaf2a099359f558b7b33c2016a374cd03ed2cf82ab46c4ec469ed920eaee86b92d44fdff6244e38204b8df27143eb5a6df671aa96d7bea1d3c9839534a8")
    setAddr("0x21E6fe722e6FdF6fFb907A0cA873dDef779E997F")
  }
  ////////////////////////////

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }
    return (
      <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* <Header></Header> */}
        <Row>
          <Col sm={9}>
          <div className="App">
            <br/>
                  <h2>Certificate creation</h2>
                  {/* <h3 style={{color:"red"}}>
                    School Mode
                  </h3> */}
            <br/>
            <h4>add Certificate Column</h4>
            <Form>
                <Form.Row>
                    <Col></Col>
                    <Col xs={2}>
                    <Form.Control className="mr-sm-2"  value={Key} onChange={e => setKey(e.target.value)} placeholder="Key" />
                    </Col>
                    <Col xs={2}>
                    <Form.Control  value={Value} onChange={e => setValue(e.target.value)} placeholder="Value" />
                    </Col>
                    <Col xs={1}>
                      <Button variant="secondary" content='Upload' onClick = {AddColumn}><i className="fas fa-plus"></i></Button>
                      &nbsp;
                      <Button variant="secondary" content='Upload' onClick = {()=>{setfilelist([])}}><i className="fas fa-trash"></i></Button>
                    </Col>
                    <Col xs={2}>
                      <Button variant="secondary" content='Upload' onClick = {GenSigneture}>Gen Signature</Button>
                    </Col>
                    <Col></Col>
                </Form.Row>
                
                <Form.Row>&nbsp;</Form.Row>
                <Form.Row>
                    <Col></Col>
                    <Col xs={2}>
                    <Button variant="secondary" content='Upload' onClick = {ID_CheatButton}>ID-CheatButton</Button>
                    </Col>
                    <Col xs={2}>
                    <Button variant="secondary" content='Upload' onClick = {School_CheatButton}>School-CheatButton</Button>
                    </Col>
                    <Col xs={2}>
                    <Button variant="secondary" content='Upload' onClick = {Company_CheatButton}>Company-CheatButton</Button>
                    </Col>
                    <Col xs={2}>
                    <Button variant="secondary" content='Upload' onClick = {Receiver_CheatButton}>Receiver-CheatButton</Button>
                    </Col>
                    <Col></Col>
                </Form.Row>
            </Form>
            <DriveTable files={filelist} />
          </div>
          </Col>
          <Col xs lg="2">
            <PrivateKeyForm Title={"Receiver publicKey Key"} privatekey={pubkey} setprivatekey={setpubKey} style={{ marginRight: 4 }}/>
            <form className="Uploadform">
              <label className="password">Receiver Address</label>
              <Form.Control type="text" value={address} onChange={(e)=>{OnchangeInput(e)}}  placeholder="0x....."></Form.Control>
            </form>
            <form className="Uploadform">
              <Container>
                  <Row>
                    <Col>
                        <label className="password">Certificate Publish to IPFS(On)</label>
                        <BootstrapSwitchButton checked={C_IPFSorDownload} onChange={()=>{setC_IPFSorDownload(!C_IPFSorDownload)}} onstyle="info" onlabel="IPFS" offlabel="Local" width="100"/>
                        <br/>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                        <label className="password">Verify Publish to IPFS(On)</label>
                        <BootstrapSwitchButton checked={V_IPFSorDownload} onChange={()=>{setV_IPFSorDownload(!V_IPFSorDownload)}} onstyle="info" onlabel="IPFS" offlabel="Local" width="100"/>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <br/>
                      <Button variant="secondary" content='Upload' onClick = {GenCertificate}>Get Verifiable Credentials</Button>
                      {(result)?"Verify JWE IPFS : "+result:""}
                    </Col>
                  
                    {/* <Col>
                    <label className="password"> &nbsp;&nbsp;&nbsp;upload&nbsp;&nbsp;</label>
                    <a className="middle"><Button variant="secondary" content='Upload' onClick = {UploadtoChain}>Upload to IPFS</Button></a>
                    </Col>
                    <Col>
                    <label className="password"> &nbsp;&nbsp;&nbsp;Download&nbsp;&nbsp;</label>
                    <a className="middle"><Button variant="secondary" content='Upload' onClick = {Download}>DownLoad to Local</Button></a>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col>
                      {(IPFSHash)?<a href={"https://ipfs.io/ipfs/"+IPFSHash} target="_blank" rel="noreferrer">View Raw Certificate</a>:""}
                    </Col>
                  </Row>
              </Container>
            </form>
            {/* <form className="Uploadform">
              <label className="password">Upload file</label>
              <input type="file" onChange={captureFile} style={{ marginBottom: 4 }}/>
            </form> */}
          </Col>
        </Row>
      </Container>
      
      
      </>
      );
}

export default CreateCert;
