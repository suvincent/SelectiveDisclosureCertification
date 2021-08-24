import React, { useState, useEffect} from "react";
// import getWeb3 from "../getWeb3";
import { encodeURLSafe,decodeURLSafe } from "@stablelib/base64";

import {Button,Container,Row,Col,Table,Form,FormControl} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import testAdd from '../test/ipfs'
import ecdh from 'crypto-ecdh'

import bs58 from 'bs58'
// import CryptoJS from "cryptojs"
import getDidDoc from "../components/Did-Document";
const DidRegistryContract = require('ethr-did-registry')
// Utilities and constants
const encoder = new TextEncoder();
const encode = encoder.encode.bind(encoder);
const padReg = /=+$/;
const { stringify } = JSON;

// var sse = new EventSource('http://localhost:4000/events');
        
    

function Contact (props) {
    const [web3,] = useState(props.web3)
    const [accounts,setaccount] = useState(null)
    const [contract,setcontract] = useState(null)
    const [client, setClient] = useState(null)
    const [onlineList, setonlinelist] = useState([])
    const [channel, setChannel] = useState(null)
    const [textinput,setinput] = useState("")
    const [status,setStatus] = useState("")
    const [flag,setflag] = useState(false)
    const [connectTarget,setTarget] = useState("")
    
    

    useEffect(()=>{
        // let s = new EventSource('http://localhost:4000/events');
        
        
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
        //   console.log(!client)
          if(!flag && accounts){
             await checkIn()
             await getOnlineList()
             initSSE()
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
    //   return () => {
    //     sse.close();
    //   };
    //   initSSE()
    },[flag,accounts]);

    function initSSE(){
        // if(sse){
        //     sse.close()
        // }
        try{
            const sse = new EventSource('http://localhost:4000/events');
            
            sse.onmessage = e => getRealtimeData(JSON.parse(e.data));
            sse.onerror = () => {
                // error log here 
                
                sse.close();
            }
            alert("init successfully")
        }
        catch(err){
            alert("something wrong")
        }
        // window.sse = sse
    }

    
    async function checkIn(){
        var c = ecdh();
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey: c.public , address : accounts[0]})
        };
        // console.log(requestOptions)
        fetch('http://localhost:4000/online', requestOptions)
        .then(response => {
            let result = response.json()
            console.log(result.publicKey)
            setClient(result.publicKey);
            // console.log(client)
        })
    }
    async function getOnlineList(){
        fetch('http://localhost:4000')
        .then(async data =>{
            let result = await data.json();
            setonlinelist(onlineList => result)
            setflag(true)
        })

    }

    function getDid(addr){
        return 'did:ethr:0x3:'+ addr
    }

    async function getALLChatData(){
        // process the data here,
        // then pass it to state to be rendered
        // console.log(data)
        fetch('http://localhost:4000/chat')
        .then(async(d)=>{
            const allData =await d.json()
            console.log(allData)
            var allDataconverted = []
            await Promise.all(allData.map(async (data,index) => {
                if(data.type == "JWS"){
                    console.log(index)
                    let p = data.content.split('.')[1]
                    // console.log(p)
                    let payload = JSON.parse(atob(p))
                    let verifyresult = await verifyToken(data.content,data.sender)
                    if(verifyresult){
                        
                        allDataconverted[index]=`from ${data.sender} to ${data.receiver}\n JWT verification pass \n payload  is ${JSON.stringify(payload)}\n------------------------------------------------------------------------------------\n`
                        // const copy = result.slice()
                        // console.log(result)
                        // setStatus(copy)
                    }
                    else{
                        allDataconverted[index]=`${status}\n verification fail\n------------------------------------------------------------------------------------\n`
                    }
                    
                    console.log(status)
                }
                else if (data.type == "text"){
                    allDataconverted[index]=`from ${data.sender} to ${data.receiver}\n data  is ${(data.content)}\n------------------------------------------------------------------------------------\n`
                    // setStatus( status.concat(result.slice()))
                }
              }));
            setStatus(allDataconverted.join())
        })
        
        
    }

    async function getRealtimeData(data) {
        console.log(data)
        if((data.sender == accounts[0]) || (data.receiver == accounts[0])){
            getALLChatData()
        }
    }

    async function sendMessage(){
        if(!textinput){
            alert("please enter some text first")
        }
        if(!connectTarget){
            alert("please connect a target first")
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sender:accounts[0],
                receiver:connectTarget,
                type:"text",
                content:textinput
            })
          };
        //   console.log(requestOptions)
          fetch('http://localhost:4000/send', requestOptions)
          .then(response => {
              let result = response.json()
              console.log(result)
            //   setClient(result.publicKey);
              // console.log(client)
          })
    }

    async function testJWT(target){
        let nonce = Math.floor(Math.random() * 1000000)
        let t = await createToken({},{iss:accounts[0],challenge:nonce})
        setTarget(target)
        setStatus("")
        // console.log(t)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sender:accounts[0],
                receiver:target,
                type:"JWS",
                content:t.token
            })
          };
        //   console.log(requestOptions)
          fetch('http://localhost:4000/send', requestOptions)
          .then(response => {
              let result = response.json()
              console.log(result)
            //   setClient(result.publicKey);
              // console.log(client)
          })
        // verifyToken(t.token,accounts[0])
    }

    async function createToken(
        header,
        claims
      ) {
        if (!claims.iss && !header.kid)
          throw new Error("InputError: must include kid header and/or iss claim");
        header = { typ: "JWT", alg: "EdDSA", ...header };
        // Default subject to the issuer
        claims.sub = claims.sub ?? claims.iss ?? header.kid;
        // UNIX origin time for current time
        const iat = ~~(Date.now() / 1000);
        const exp = iat + 60 * 10; // Default to ~10 minutes
        const payload = {
          nbf: iat - 10,
          iat,
          exp,
          ...claims,
        };
        // Optional: https://www.npmjs.com/package/canonicalize
        const encodedHeader = encodeURLSafe(encode(stringify(header))).replace(
          padReg,
          ""
        );
        const encodedPayload = encodeURLSafe(encode(stringify(payload))).replace(
          padReg,
          ""
        );
        const message = web3.utils.fromUtf8(`${encodedHeader}.${encodedPayload}`);
        // console.log(message)
        var signature = await web3.eth.personal.sign(message, accounts[0]);
        // console.log(signature)
        // signature = signature.substring(2)
        // console.log(signature)
        // console.log(encodeURLSafe(signature))
        const encodedSignature = encodeURLSafe(encode(stringify(signature))).replace(
            padReg,
            ""
          );
        const jws = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
        return { token: jws, claims: payload, header };
    }
    async function verifyToken(token,Signeraddr){
        let [h, p, s] = token.split(".");
        let message = `${h}.${p}`;
        console.log(s)
        // let signature_byte =decodeURLSafe(s);
        let signature = JSON.parse( atob(s))
        console.log(signature)
        let address = await web3.eth.personal.ecRecover(web3.utils.fromUtf8(message),signature);
        // console.log(address,message)
        let didAuthAddr = ((await getDidDoc(getDid(Signeraddr))).authentication[0]).split('#')[0]
        console.log(didAuthAddr)
        console.log(getDid(address))
        if(getDid(address) == didAuthAddr.toLowerCase())
        {
            console.log("pass")
            return true
        }
        else{
            console.log('JWT verification fail')
            return false
        }
    }

    async function openRawVerifyfile(addr){
        var newwin = window.open("/raw");
        let doc = await getDidDoc(getDid(addr));
        newwin.document.write("<html><title>raw file</title><body><textarea rows='30' cols='100'>"+(JSON.stringify(doc,undefined, 4))+"</textarea></body></html>")
      }
    
    async function clearHistory(){
        fetch('http://localhost:4000/clear')
        .then(()=>{
            alert("chat data has been cleared!")
        })
    }
      
    
    return (
      <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* <Header></Header> */}
        <Row>
        <Col sm={4}>
          <div className="App">
            <br/>
                  <h2>Online identities</h2>
            <br/>
            <h4>current account : {(accounts)?accounts[0]:""}</h4>
            <Button onClick={()=>{getOnlineList();}}>refresh list</Button>
            &nbsp;
            <Button onClick={()=>{clearHistory();getOnlineList();}}>clear</Button>
            <Table striped bordered hover size="sm" style = {{width :'85%',margin:"auto",marginTop : "1%"}}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>address</th>
                  <th>connect</th>
                </tr>
              </thead>
              <tbody >
              {(onlineList.length > 0)?onlineList.map((self,index) => <tr key={index}>
                  <td width="3%">{index}</td>
                  {/* address */}
                  <td><a href="javascript:void(0)" onClick={()=>{openRawVerifyfile(self[0])}}>{self[0]}</a></td>
                  {/* button */}
                  <td><Button onClick={()=>{testJWT(self[0])}}>connect</Button></td>
                  {/* public key */}
                  {/* <td>{self[1]}</td> */}
                </tr>):<></>}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col sm={7}>
        <div className="App">
            <br/>
                  <h2>Status</h2>
                  <div>connecting to {connectTarget}</div>
            <br/>
            <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                {/* <Form.Label>Root CA certificate</Form.Label> */}
                <Form.Control as="textarea" rows={18} value={status} readOnly />
            </Form.Group>
                <Row>
                <Col xs={3}>
                <FormControl as="input" value={textinput}  onChange={(e)=>{setinput(e.target.value)}}/>
                </Col>
                <Button variant="secondary" onClick={()=>{sendMessage()}}>Send</Button>
                &nbsp;
                </Row>
            </Form>
        </div>
        </Col>
           
        </Row>
      </Container>
      
      
      </>
      );
}

export default Contact;
