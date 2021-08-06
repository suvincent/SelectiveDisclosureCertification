import React, { useState, useEffect} from "react";
// import getWeb3 from "../getWeb3";
import {Button,Container,Row,Col,Table,Form} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import testAdd from '../test/ipfs'

import bs58 from 'bs58'
// import CryptoJS from "cryptojs"
var Wallet = require('ethereumjs-wallet');
var EthUtil = require('ethereumjs-util');
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
const DidRegistryContract = require('ethr-did-registry')
function Home (props) {
    const [web3,] = useState(props.web3)
    const [accounts,setaccount] = useState(null)
    const [contract,setcontract] = useState(null)
    const [attibuteList,setAttr] = useState([])
    const [Akey,setkey] = useState("")
    const [Avalue,setvalue] = useState("")
    const [prikey,setpriKey] = useState("")
    const [pubkey,setpubkey] = useState("")
    const [Addr,setaddr] = useState("")

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
              DidRegistryContract.abi,
              // deployedNetwork && deployedNetwork.address,
              "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b"
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

    async function testReg(){
      // let result = await contract.methods.identityOwner(accounts[0]).call()
      // console.log(contract)
      const history = []
      let previousChange = await contract.methods.changed(accounts[0]).call()
      
      while (previousChange) {
        if(previousChange === 0)break
          await contract.getPastEvents('DIDAttributeChanged', {
            filter: {id: [accounts[0]]},  
            fromBlock: previousChange,
            toBlock: previousChange
          }, (error, events) => { 
      
            if (!error){
              var obj=JSON.parse(JSON.stringify(events));
              var array = Object.keys(obj)
              for(let index in array){
                let event = obj[array[index]].returnValues
                history.unshift(event)
                previousChange = event.previousChange
              }
            }
            else {
              console.log(error)
            }})
      }
      setAttr(attibuteList => history)
      // console.log(history)
    }

    async function TurnRawtoReadable(){
      if(attibuteList.length === 0){
        alert("please get raw history first!")
      }
      let newList = []
      attibuteList.forEach(async(row) => {
        // console.log(row.value)
        let cut = CutTailZero(row.name)
        let nv = row.value;
        try{
          // 如果長度 == hash => 轉hash to IPFS hash
          if(nv.length === "0x3b0326dd6d55bc8100afc3e7f2e8b8626e917dc0ccbf96b7016785b42b9ce29e".length)
            nv = getIpfsHashFromBytes32(row.value);
          else // 轉乘ascii
            nv=CutTailZero(row.value)
        }
        catch(err){
          console.log(err.message)
        }
        // console.log(nv)
        let newrow = {
          name: cut,
          value:nv,
          previousChange:row.previousChange
        }
        newList.push(newrow);
      
      setAttr(attibuteList => newList)
      })
    }

    async function SetAttributes(){
      try{
        let name = web3.utils.asciiToHex(Akey)//string to byte32
        // console.log(web3.utils.hexToAscii(name))
        let value =await getBytes32FromIpfsHash(Avalue)
        // console.log(getIpfsHashFromBytes32(value))
        // console.log(name,value)
        await contract.methods.setAttribute(accounts[0], name, value, "9999999").send({ from: accounts[0] });
      }
      catch(err){
        console.log(err.message)
        alert(err.message)
      }
    }

    async function SetRaw(){
      try{
        let name = web3.utils.asciiToHex(Akey)//string to byte32
        // console.log(web3.utils.hexToAscii(name))
        let value =web3.utils.asciiToHex(Avalue)
        // console.log(getIpfsHashFromBytes32(value))
        // console.log(name,value)
        await contract.methods.setAttribute(accounts[0], name, value, "9999999").send({ from: accounts[0] });
      }
      catch(err){
        console.log(err.message)
        alert(err.message)
      }
    }

    async function getBytes32FromIpfsHash(ipfsListing) {
      return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
    }

    function getIpfsHashFromBytes32(bytes32Hex) {
      // Add our default ipfs values for first 2 bytes:
      // function:0x12=sha2, size:0x20=256 bits
      // and cut off leading "0x"
      const hashHex = "1220" + bytes32Hex.slice(2)
      const hashBytes = Buffer.from(hashHex, 'hex');
      const hashStr = bs58.encode(hashBytes)
      return hashStr
    }

    function CutTailZero(hex) {
      var str = "";
      var i = 0, l = hex.length;
      if (hex.substring(0, 2) === '0x') {
        i = 2;
      }
      for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if(code !== 0) {
          str += String.fromCharCode(code);
        }
      }
    
      return str;
    }

    function OnchangeKey(e){
      setkey(e.target.value)
    }

    function OnchangeValue(e){
      setvalue(e.target.value)
    }

    function GenPkandAddr(){
      // Get a wallet instance from a private key
      const privateKeyBuffer = EthUtil.toBuffer('0x'+prikey);
      const wallet = Wallet.default.fromPrivateKey(privateKeyBuffer);

      // Get a public key
      let p = wallet.getPublicKeyString();                         
      const publicKey = privateKeyToPublicKey(prikey).toString('hex')
      setpubkey(publicKey)
      // validate
      // 看看hash後的後20個buffer是否跟address一樣
      var addr = EthUtil.keccakFromHexString(p);
      addr = '0x'+ addr.toString('hex',12,32);
      setaddr(addr)
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
                  <h2>Home</h2>
            <br/>
            <h4>uPort Registry</h4>
            <br/>
            <Button variant="secondary" content='Upload' onClick = {testReg}>Get raw Attributes</Button>
            &nbsp;
            <Button variant="secondary" content='Upload' onClick = {TurnRawtoReadable}>Get Readable Attributes</Button>
            
            <Table striped bordered hover size="sm" style = {{width :'85%',margin:"auto",marginTop : "1%"}}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>key</th>
                  <th>value</th>
                  <th>previousChange</th>
                </tr>
              </thead>
              <tbody >
              {attibuteList.map((self,index) => <tr key={index}>
                  <td width="3%">{index}</td>
                  {/* name */}
                  <td>{self.name}</td>
                  {/* type */}
                  <td>{self.value}</td>
                  {/* hash */}
                  <td>{self.previousChange}</td>
                </tr>)}
              </tbody>
            </Table>
          </div>
          </Col>
          <Col xs lg="2">
            
            <form className="Uploadform">
              <label className="password">PedersenCommitment Source Code</label>
              <a href="https://ropsten.etherscan.io/address/0xf07AceA1dB989df2236339D616338bEcB84a0600#code" target="_blank" rel="noreferrer">Source Code</a>
            </form>
            <form className="Uploadform">
              <label className="password">SetAttributes</label>
              <Form.Control type="text" onChange={OnchangeKey}  placeholder="insert Key"></Form.Control>
              <br/>
              <Form.Control type="text" onChange={OnchangeValue}  placeholder="insert Value"></Form.Control>
              <br/>
              <Button variant="secondary" content='Upload' onClick = {SetAttributes}>Set IPFSHash to Attributes</Button>
              <br/>
              <br/>
              <Button variant="secondary" content='Upload' onClick = {SetRaw}>Set raw value to Attributes</Button>
            </form>
            <form className="Uploadform">
              <label className="password">private Key
              <input type="text" className="password__input" value={prikey} onChange={(e)=>{setpriKey(e.target.value)}} />
              <span className="password__show" onClick={GenPkandAddr}>Gen!</span>
              </label>
              <label className="password">Public key</label>
              <span>{pubkey}</span>
              <label className="password">Address</label>
              <span>{Addr}</span>
            </form>
          </Col>
           
        </Row>
      </Container>
      
      
      </>
      );
}

export default Home;
