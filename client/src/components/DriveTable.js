import React from "react";
import {Table} from 'react-bootstrap'

function DriveTable(props){
    return(
        <Table striped bordered hover size="sm" style = {{width :'85%',margin:"auto",marginTop : "1%"}}>
          <thead>
            <tr>
              <th>#</th>
              <th>key</th>
              <th>value</th>
              <th>random</th>
            </tr>
          </thead>
          <tbody >
          {props.files.map((self,index) => <tr key={index}>
              <td width="3%">{index}</td>
              {/* name */}
              <td>{self.key}</td>
              {/* type */}
              <td>{self.value}</td>
              {/* hash */}
              <td width="35%">{self.random}</td>
              
            </tr>)}
          </tbody>
        </Table>
    )
}

export default DriveTable