import React, { useState, useEffect} from "react";
import getWeb3 from "../getWeb3";
import {Button,Container,Row,Col} from 'react-bootstrap'
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import PDContract from "../contracts/PedersenCommitment.json";
import Header from '../components/Header'
// import CryptoJS from "cryptojs"
const CryptoJS = require("crypto-js")
const privateKeyToPublicKey = require('ethereum-private-key-to-public-key')
function Home (props) {
  

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
            <h4>refresh file</h4>
           
          </div>
          </Col>
         
           
        </Row>
      </Container>
      
      
      </>
      );
}

export default Home;
