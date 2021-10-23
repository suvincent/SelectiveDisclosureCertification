import React, { useState, useEffect } from "react";
// import getWeb3 from "../getWeb3";
import EthCrypto from 'eth-crypto';

import { Button, Container, Row, Col, Form, Table, Badge, Modal } from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ValidateContract from "../contracts/validate.json";
import PDContract from "../contracts/PedersenCommitment.json";
import row from "../model/row"
import zkpClass from '../model/zkp'
import testAdd from '../test/ipfs'
import PrivateKeyForm from '../components/privatekey'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import bs58 from 'bs58'

const didJWT = require('did-jwt')
const crypto = require('crypto');
const J = require('dag-jose-utils')
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
function Validate(props) {
  const [web3,] = useState(props.web3)
  const [accounts, setaccount] = useState(null)
  const [contract, setcontract] = useState(null)
  const [vcontract, setvcontract] = useState(null)
  const [Certificate, setCert] = useState(null)
  const [Verify, setVerify] = useState(null)
  const [filelist, setfilelist] = useState([])
  const [rules, setrules] = useState([])
  const [ValidList, setValidList] = useState([])
  const [VerifyCount, setVerifyCount] = useState(0)
  const [CertCount, setCertCount] = useState(0)
  const [type, setType] = useState(0)
  const [show, setShow] = useState(false)
  // const [modalType,setModal] = useState(0)
  const [prikey, setpriKey] = useState("")
  const [pubkey, setpubKey] = useState("")
  const [V_IPFSorDownload, setV_IPFSorDownload] = useState(true);
  const [V_IPFSorUPload, setV_IPFSorUPload] = useState(false);
  const [V_IPFSHash, setV_IPFSHash] = useState("");
  // const [readObj,setReadObj] = useState(null)
  const [result, setresult] = useState("")
  const [zkp, setzkp] = useState(null)


  // type : 0 => IPFS
  // type : 1 => Upload Certificate Manually
  // modalType : 0 => Re Verify Each Row
  // modalType : 1 => View Raw Verification
  // modalType : 2 => View Raw Certification

  useEffect(() => {
    async function fetchData() {
      try {
        // Get network provider and web3 instance.
        //const web3 = await getWeb3();
        if (!window.ipfs) await window["INITIPFS"](true)
        //setweb3(web3)
        // Use web3 to get the user's accounts.
        if (!accounts) setaccount(await web3.eth.getAccounts());
        // Get the contract instance.
        // const networkId = await web3.eth.net.getId();
        if (!contract) {
          let i = new web3.eth.Contract(
            PDContract.abi,
            // deployedNetwork && deployedNetwork.address,
            "0xfa3A50fd35D10160626080614376d314592054Be"
          );// 0x4CF247a90956185559EE5fb2A9A7E8dDd8A8E985 Drive address

          setcontract(i)
        }

        if (!vcontract) {
          let i = new web3.eth.Contract(
            ValidateContract.abi,
            // deployedNetwork && deployedNetwork.address,
            "0x1570518984b9e5977FD23f36A4fC64747C4ba21f"
          );// 0x4CF247a90956185559EE5fb2A9A7E8dDd8A8E985 Drive address

          setvcontract(i)
        } else {
          getRuleList()
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
  }, [vcontract]);

  /////////////////////////
  // function for validate

  async function allValidUsers(){
    try{
      setValidList([])
      let list = await vcontract.methods.viewValidList().call()
      setValidList(ValidList =>[...ValidList, list])
    }catch(e){
      console.log(e.message)
    }
  }
  async function getRuleList() {
    setrules([])
    let list = await vcontract.methods.viewRuleKeyList().call()
    list.forEach(async (item) => {
      let c = await vcontract.methods.viewRuleCommitment(item).call();
      // let aa = await vcontract.methods.viewRuleAA(item).call();
      let r = await vcontract.methods.viewRuleR(item).call();
      r = "0x000000"+r.substring(2,60);
      let unit = {
        keyhash: item,
        Commitment: c,
        random: r
      }
      setrules(rules => [...rules, unit])
    })
  }

  async function setRule() {
    // department ISA
    let k = '0x2ad29f65743a0524d916bfb3e24f5034c970b8daa7749699a88bd7096129fa09'
    let r = "0x644c34d5409c4cab8f5147f638709c15bcd106690d26455edb3e72176d"
    let v = ['0xb26c324746dc8c34ebe66a329470d292c3afafa9673c2967204f4c74e22f1516', '0xb3e7d82ac54c35efb0964a6a218e36c0732a8aa22ecf7f57a679ada829e61383']
    try {
      await vcontract.methods.setValidateRule(k, v, "0x097F783e11482f5d05753c9619424171E8E8B3f6", r).send({ from: accounts[0] });
    }
    catch (e) {
      console.log(e.message)
    }

  }

  function containsRule(keyhash) {
    let flag = false;
    rules.forEach((item) => {
      if (item.keyhash == keyhash && !flag) {
        flag = true;
      }
    })
    return flag
  }

  function findRule(keyhash) {
    let flag = undefined;
    rules.forEach((item) => {
      if (item.keyhash == keyhash && !flag) {
        flag = item;
      }
    })
    return flag
  }


  function generateHexString(length) {
    var ret = "";
    while (ret.length < length) {
      ret += Math.random().toString(16).substring(2);
    }
    return ret.substring(0, length);
  }

  async function GenZKP(c2) {
    let c1 = findRule("0x" + CryptoJS.SHA256(c2.key).toString());
    let r3 = "0x" + generateHexString(58)
    let r4 = "0x" + generateHexString(58)
    let r5 = "0x" + generateHexString(58)
    let m = "0x" + CryptoJS.SHA256(c2.key + ":" + c2.value).toString();
    let c2_random_tobyte32 = "0x000000"+c2.random.substring(2,60)
    try {
      let c3 = await contract.methods.createCommitment(r3, r4).call();
      let c4 = await contract.methods.createCommitment(r3, r5).call();
      let c  = await contract.methods.hashall(c1.Commitment, c2.Commitment, c3, c4).call();
      let z1 = await contract.methods.createZ(c, m, r3).call();
      let z2 = await contract.methods.createZ(c, c1.random, r4).call();
      let z3 = await contract.methods.createZ(c, c2_random_tobyte32, r5).call();
      let zkp = new zkpClass(c1.Commitment, c2.Commitment, c3, c4, c, z1, z2, z3, m,"0x" + CryptoJS.SHA256(c2.key).toString())
      setzkp(zkp);
      setShow(true)

    } catch (e) {
      console.log(e.message)
    }
  }

  async function CheckZKP(){
    
    let result1 = await contract.methods.checkSame(zkp.c1,zkp.c3,zkp.c,zkp.z1,zkp.z2).call();
    let result2 = await contract.methods.checkSame(zkp.c2,zkp.c4,zkp.c,zkp.z1,zkp.z3).call();
    if(result1 && result2){
      return true
    }
    else
      return false
  }

  async function uploadZKP(){
    let check = await CheckZKP();
    if(!check){
      alert("ZKP fail, please generate again")
      return
    }
    if(Certificate.Receiver_address != accounts[0]){
      alert("the account address is not equal to receiver")
      return
    }
    try{
      // bytes32 keyhash,uint[2] memory c2,uint[2] memory c3,uint[2] memory c4,uint z1,uint z2,uint z3,bytes32 vc
      let vc = "0x"+bs58.decode(Verify.IPFSHash).slice(2).toString('hex')
      console.log(vc)
      await vcontract.methods.validateOneAttribute(zkp.keyhash,zkp.c2,zkp.c3,zkp.c4,zkp.z1,zkp.z2,zkp.z3,vc).send({ from: accounts[0] })
    }catch(e){
      console.log(e.message)
    }
  }
  /////////////////////////
  // function OK
  function captureCertFile(event) {
    event.stopPropagation()
    event.preventDefault()
    var reader = new FileReader();
    reader.onload = function (event) {
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

  function captureVerifyFile(event) {
    event.stopPropagation()
    event.preventDefault()
    var reader = new FileReader();
    reader.onload = async function (event) {
      try {
        var obj = JSON.parse(event.target.result);
        // setReadObj(obj)
        ////////////////////////
        // decode the JWT's key
        const rkey = await EthCrypto.decryptWithPrivateKey(
          prikey, // privateKey
          {
            ciphertext: obj.decodeMessage.ciphertext,
            ephemPublicKey: obj.decodeMessage.ephemPublicKey,
            iv: obj.decodeMessage.iv,
            mac: obj.decodeMessage.mac
          }
        );
        // decode JWT
        let Vlist = await decryptJWEFILE(obj.jwt, rkey);
        ////////////////////////
        setVerify(Vlist)
        setVerifyCount(Object.keys(Vlist.VerifyList).length)
        if (Vlist.IPFSHash === "None") {
          setType(1)
        }
        else {
          setType(0)
          // get file from ipfs
          GetfileFromIPFS(Vlist.IPFSHash)
        }
      } catch (e) {
        alert(e.message)
      }
    };
    reader.readAsText(event.target.files[0]);
    // setuploadfile(event.target.files[0])
    // console.log(CryptoJS)
  }

  async function GetVfileFromIPFS() {
    let download = await window["ipfsget"](V_IPFSHash, true)
    var blob = new Blob(download[0], { type: "text/plain" });

    var reader = new FileReader();
    reader.onload = async (event) => {
      try {
        var obj = JSON.parse(event.target.result);
        // setReadObj(obj)
        ////////////////////////
        // decode the JWT's key
        const rkey = await EthCrypto.decryptWithPrivateKey(
          prikey, // privateKey
          {
            ciphertext: obj.decodeMessage.ciphertext,
            ephemPublicKey: obj.decodeMessage.ephemPublicKey,
            iv: obj.decodeMessage.iv,
            mac: obj.decodeMessage.mac
          }
        );
        // decode JWT
        let Vlist = await decryptJWEFILE(obj.jwt, rkey);
        ////////////////////////
        setVerify(Vlist)
        setVerifyCount(Object.keys(Vlist.VerifyList).length)
        if (Vlist.IPFSHash === "None") {
          setType(1)
        }
        else {
          setType(0)
          // get file from ipfs
          GetfileFromIPFS(Vlist.IPFSHash)
        }
      } catch (e) {
        alert(e.message)
      }
    };
    reader.readAsBinaryString(blob);

  }

  async function doVerification() {
    if (!Certificate || !Verify) {
      alert("please upload file first")
      return;
    }
    setfilelist([])
    let mapping = Certificate.Certificate
    let flag = true;
    Verify.VerifyList.forEach(async element => {
      // console.log(element)
      let key = "0x" + CryptoJS.SHA256(element.key).toString()
      // console.log(mapping[key])
      console.log(element)
      let result = await VerifyCommitment(mapping[key], "0x" + CryptoJS.SHA256(element.key + ":" + element.value).toString(), element.random)
      console.log(result)
      if (result) {
        let share = containsRule(key) ? true : false;
        var r = new row(element.key, element.value, element.random, mapping[key], typeof element.value, share);
        setfilelist(arr => [...arr, r]);
      }
      else {
        flag = false
      }
    });
    if (flag)
      alert("Verification Success")
    else {
      alert("Verification fail")
      setfilelist([])
    }
  }
  async function VerifyCommitment(Commitment, C_value, C_random) {
    try {
      let v = await contract.methods.openCommitment(Commitment, C_value, C_random).call();
      return v
    }
    catch (e) {
      console.log(e)
      return false
    }
  }

  function handleCheckBox(position) {
    // console.log(position)
    if (position > -1) {
      // let obj = filelist.indexOf(position)
      // obj.share = !obj.share
      const Updatelist = filelist.map((item, index) => {
        if (index === position) {
          let newrow = new row(item.key, item.value, item.random, item.Commitment, item.type, !item.share)
          return newrow
        }
        else {
          return item
        }
      }
      );
      setfilelist(Updatelist)
      // console.log(filelist)
    }
  }

  async function GetfileFromIPFS(ipfsHash) {
    let download = await window["ipfsget"](ipfsHash, true)
    var blob = new Blob(download[0], { type: "text/plain" });

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

  function openRawVerifyfile() {
    var newwin = window.open("/raw");
    newwin.document.write("<html><title>raw file</title><body>" + JSON.stringify(Verify) + "</body></html>")
  }

  async function decryptJWEFILE(jweObj, key) {
    let dec = didJWT.xc20pDirDecrypter(Buffer.from(key, 'hex'))
    let decoded = await didJWT.decryptJWE(jweObj, dec)
    return J.decodeCleartext(decoded)
  }

  async function encryptJWEFile(payload, key) {
    let enc = didJWT.xc20pDirEncrypter(key);
    let w = await J.prepareCleartext(payload)
    let jwt = await didJWT.createJWE(w, [enc])
    return jwt
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* <Header></Header> */}

        <Modal show={show} onHide={() => { setShow(false) }} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Let's Encrypted for your sharing target</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {
              (zkp) ?
                  Object.keys(zkp).map((key) => {
                    if(key != "c1" &&key != "c2"&&key != "c3"&&key != "c4")
                      return <div>{key} : {zkp[key]}</div>
                    else
                      return (<>
                        <div>{key} : {zkp[key][0]},</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{zkp[key][1]}</div>
                      </>)
                  })
                : ""
            }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" content='Upload' onClick={uploadZKP}>upload ZKP to smart contract</Button>
          </Modal.Footer>
        </Modal>
        <Row>
          <Col sm={9}>
            <div className="App">
              <br />
              <h2>Validate Voters</h2>
              <br />
              <h4>Verify Keys : TotalKeys = {VerifyCount} : {CertCount}</h4>
              <Form>
                <Form.Row>
                  <Col></Col>
                  <Col xs={3}>
                    <Button variant="secondary" content='Upload' onClick={doVerification}>find valid attribute</Button>
                  </Col>
                  {/* <Col xs={3}>
                    <Button variant="secondary" content='Upload' onClick={() => { setShow(true) }}>Generate Selective Disclosure</Button>
                  </Col> */}
                  <Col xs={2}>
                    <Button variant="secondary" content='Upload' onClick={setRule}>Set Rule</Button>
                  </Col>
                  <Col xs={3}>
                    <Button variant="secondary" content='Upload' onClick={() => { setpriKey("b1d134dbf0c9b98bed1a8c9ebe00e6af0e941d930b246d5948ac90a3075a143b") }}>secret key cheat button</Button>
                  </Col>
                  <Col></Col>
                </Form.Row>
                &nbsp;
                <Form.Row>
                  <Col></Col>
                  <Col xs={4}>
                    {(result) ? "Shared Verify JWE IPFS : " + result : ""}
                  </Col>
                  <Col></Col>
                </Form.Row>
              </Form>
              <h2>Announced Attributes</h2>
              <Table responsive={"md"} striped bordered hover size="sm" style={{ width: '95%', margin: "auto", marginTop: "1%", wordBreak: 'break-all' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>keyhash</th>
                    <th>commitment</th>
                    <th>random</th>
                  </tr>
                </thead>
                <tbody >
                  {rules.map((self, index) => <tr key={index}>
                    <td width="3%">{index}</td>
                    {/* name */}
                    <td width="24%">{self.keyhash}</td>
                    {/* type */}
                    <td width="58%"><div>{self.Commitment[0]},</div><div>{self.Commitment[1]}</div></td>
                    {/* hash */}
                    <td width="16%">
                      {self.random}
                    </td>
                  </tr>)}
                </tbody>
              </Table>
              <br/>
              <h2>Voters Verifiable Credentials</h2>
              <Table striped bordered hover size="sm" style={{ width: '95%', margin: "auto", marginTop: "1%" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>keyhash</th>
                    <th>value</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody >
                  {filelist.map((self, index) => <tr key={index}>
                    <td width="3%">{index}</td>
                    {/* name */}
                    <td>{"0x" + CryptoJS.SHA256(self.key).toString()}</td>
                    {/* type */}
                    <td>{self.key}:{self.value}</td>
                    {/* hash */}
                    <td width="35%">
                      {/* {console.log(index)} */}
                      <Form.Check type="checkbox" disabled checked={self.share} label="match rule" onChange={() => { handleCheckBox(index) }} />
                      {(self.share) ? <Button variant="secondary" content='Upload' onClick={() => { GenZKP(self) }}>Gen zkp</Button> : ""}
                    </td>
                  </tr>)}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col xs lg="2">
            <PrivateKeyForm Title={"Opener private Key"} privatekey={prikey} setprivatekey={setpriKey} style={{ marginRight: 4 }} />

            <form className="Uploadform">
              <label className="password">Upload Verify file or IPFSHash</label>
              <BootstrapSwitchButton checked={V_IPFSorUPload} onChange={() => { setV_IPFSorUPload(!V_IPFSorUPload) }} onstyle="info" onlabel="IPFS" offlabel="Upload" width="100" />

              {(V_IPFSorUPload) ?
                <>
                  &nbsp;&nbsp;&nbsp;
                  <Button variant="dark" content='Upload' onClick={GetVfileFromIPFS}>Get Verifiy file!</Button>
                  <label className="password">Verification IPFS Hash</label>
                  <input type={type} className="password__input" value={V_IPFSHash} onChange={(e) => { setV_IPFSHash(e.target.value) }} />
                </> :
                <>
                  <label className="password">Upload Verify file</label>
                  <input type="file" onChange={captureVerifyFile} style={{ marginBottom: 4 }} />
                </>
              }
            </form>
            {(type === 0) ? <></> :
              <form className="Uploadform">
                <Container>
                  <Row>
                    <label className="password">Upload Certificate file</label>
                    <input type="file" onChange={captureCertFile} style={{ marginBottom: 4 }} />
                  </Row>
                  <Row>
                    <label className="password">Certificate Issuer : </label>
                    <span>{(Certificate) ? Certificate.Issuer_address : ""}</span>
                    <br />
                  </Row>
                </Container>
              </form>
            }

            <form className="Uploadform">
              <label className="password">File Status</label>
              Certificate:&nbsp;{(Certificate) ? <Badge variant="success">Load Success</Badge> : <Badge variant="danger">No file</Badge>}
              &nbsp;{(Verify) ? <a href={"https://ipfs.io/ipfs/" + Verify.IPFSHash} target="_blank" rel="noreferrer" >View Raw</a> : ""}
              <br />
              Verification:&nbsp;{(Verify) ? <Badge variant="success">Load Success</Badge> : <Badge variant="danger">No file</Badge>}
              &nbsp;{(Verify) ? <a href="javascript:void(0)" onClick={openRawVerifyfile}>View Raw</a> : ""}
              <br />
              &nbsp;{(Verify) ? <a href={"https://ipfs.io/ipfs/" + V_IPFSHash} target="_blank" rel="noreferrer" >View Raw JWT</a> : ""}
            </form>
            {/* <form className="Uploadform">
              <label className="password">Functions</label>
              <Row>
                {(Certificate) ? <Button variant="dark" content='Upload' onClick={CheckSignature}>Check Certificate Issuer's Signature</Button> : ""}
              </Row>
              <Row>
                &nbsp;
              </Row>
              <Row>
                {(Certificate) ? <Button variant="dark" content='Upload' onClick={ProveIsReceiver}>Prove I'm the receiver</Button> : ""}
              </Row>
              <Row>
                &nbsp;
              </Row>
            </form> */}
          </Col>

        </Row>
      </Container>


    </>
  );
}

export default Validate;
