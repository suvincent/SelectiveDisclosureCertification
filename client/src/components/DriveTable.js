import React from "react";
import {Button,Table} from 'react-bootstrap'

function DriveTable(props){
  async function Getfile(fhash,fname,ftype){// without encryption
    let download = await window["ipfsget"](fhash,true)
    console.log(download)
    var blob = new Blob(download[0], {type: ftype});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fname;
    link.click();
  }
    return(
        <Table striped bordered hover size="sm" style = {{width :'85%',margin:"auto",marginTop : "1%"}}>
          <thead>
            <tr>
              <th>#</th>
              <th>file name</th>
              <th>file type</th>
              <th>file hash</th>
              <th>others</th>
            </tr>
          </thead>
          <tbody >
          {props.files.map((self,index) => <tr key={index}>
              <td width="3%">{index}</td>
              {/* name */}
              <td>{self[1]}</td>
              {/* type */}
              <td>{(self[3])?"Encrypted": "public"}<br/>{self[2]}</td>
              {/* hash */}
              <td width="35%">{self[0]}</td>
              <td width="18%">
              {(self[3])?
                <>
                <Button variant="info" content='Upload' onClick = {()=>{props.DecryptFile(self[5],self[4],self[0],self[1],self[2])}}>Decrypt it</Button>
                &nbsp; &nbsp;
                <Button variant="warning" content='Upload' onClick = {()=>{Getfile(self[0],self[1],self[2])}}>Get Raw</Button>
                </>
                :
                <Button variant="info" content='Upload' onClick = {()=>{Getfile(self[0],self[1],self[2])}}>Get file</Button>
              }
              </td>
            </tr>)}
          </tbody>
        </Table>
    )
}

export default DriveTable