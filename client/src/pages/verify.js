import React, { useState, useEffect} from "react";
import getWeb3 from "../getWeb3";
import {Button,Container,Row,Col,Form,Table,Badge} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import PDContract from "../contracts/PedersenCommitment.json";
import row from "../model/row"
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
function Verify (props) {
  const [web3,setweb3] = useState(props.web3)
  const [accounts,setaccount] = useState(null)
  const [contract,setcontract] = useState(null)
  const [Certificate,setCert] = useState(null)
  const [Verify,setVerify] = useState(null)
  const [filelist,setfilelist] = useState([])
  const [VerifyCount,setVerifyCount] = useState(0)
  const [CertCount,setCertCount] = useState(0)
  const [type,setType] = useState(0)
  // type : 0 => IPFS
  // type : 1 => Upload Certificate Manually

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
        const networkId = await web3.eth.net.getId();
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
    reader.onload = function (event){
      console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      console.log(obj)
      setVerify(obj)
      setVerifyCount(Object.keys(obj.VerifyList).length)
      if(obj.IPFSHash == "None"){
        setType(1)
      }
      else{
        setType(0)
        // get file from ipfs
        GetfileFromIPFS(obj.IPFSHash)
      }
    };
    reader.readAsText(event.target.files[0]);
    // setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
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
        console.log(element)
        let key = "0x"+ CryptoJS.SHA256(element.key+element.random).toString()
        console.log(mapping[key])
        let result = await VerifyCommitment(mapping[key],"0x"+ CryptoJS.SHA256(element.value).toString(),element.random)
        console.log(result)
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
    let VerStr = JSON.stringify(Certificate.Certificate)
    web3.eth.personal.ecRecover(VerStr,Certificate.Issuer_signature)
    .then((addr)=>{
      console.log(addr)
      console.log(Certificate.Issuer_address)
      if(addr === Certificate.Issuer_address.toLowerCase()){
        console.log(Certificate.Issuer_address)
        alert('Certificate Issuer : '+Certificate.Issuer_address +"\n"
             +'Certificate Signature : '+Certificate.Issuer_signature +"\n"
             +'Status : Pass')
        //  history.push('/Upload')
        
      }
    })
  }

  function handleCheckBox(position){
    console.log(position)
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
    console.log(filelist)
    }
  }

  function GenSelectiveVerification(){
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
      const fileData2 = JSON.stringify(VerifyList);
      const blob2 = new Blob([fileData2], {type: "text/plain"});
      const url2 = URL.createObjectURL(blob2);
      const link2 = document.createElement('a');
      link2.download = 'Verify.json';
      link2.href = url2;
      link2.click();
    }
    else{
      alert("Nothing can share")
    }
  }
  async function GetfileFromIPFS(ipfsHash){
    let download = await window["ipfsget"](ipfsHash,true)
    var blob = new Blob(download[0], {type: "text/plain"});
    
    var reader = new FileReader();
    reader.onload = (event) => {
      console.log(event.target.result);
      var obj = JSON.parse(event.target.result);
      console.log(obj)
      setCert(obj)
      setCertCount(Object.keys(obj.Certificate).length)
    };
    reader.readAsBinaryString(blob);
    
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
                  <h2>Verify</h2>
            <br/>
            <h4>Verify Keys : TotalKays = {VerifyCount} : {CertCount}</h4>
            <Form>
                <Form.Row>
                    <Col></Col>
                    <Col xs={1}>
                      <Button variant="secondary" content='Upload' onClick = {doVerification}>Verification</Button>
                    </Col>
                    <Col xs={3}>
                      <Button variant="secondary" content='Upload' onClick = {GenSelectiveVerification}>Generate Selective Verification</Button>
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
                  {console.log(index)}
                  <Form.Check type="checkbox" checked={self.share} label="Allow to Share" onChange={()=>{handleCheckBox(index)}} /></td>
              </tr>)}
            </tbody>
          </Table>
          </div>
          </Col>
          <Col xs lg="2">
            
            <form className="Uploadform">
              <label className="password">Upload Verify file</label>
              <input type="file" onChange={captureVerifyFile} style={{ marginBottom: 4 }}/>
            </form>
            {(type == 0)?<></>:
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
              <Row>
                <Button variant="dark" content='Upload' onClick = {CheckSignature}>Check Certificate Issuer's Signature</Button>
              </Row>
            </Container>
            </form>
            }

            <form className="Uploadform">
              <label className="password">File Status</label>
              Certificate:&nbsp;{(Certificate)? <Badge variant="success">Load Success</Badge>:""}
              <br/>
              Verification:&nbsp;{(Verify)?<Badge variant="success">Load Success</Badge>:""}
            </form>
          </Col>
           
        </Row>
      </Container>
      
      
      </>
      );
}

export default Verify;
