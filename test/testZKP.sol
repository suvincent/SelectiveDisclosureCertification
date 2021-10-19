// SPDX-License-Identifier: GPL-3.0
// test in remix please

pragma solidity >=0.5.3 <0.7.0;
// import "remix_tests.sol"; // this import is automatically injected by Remix.
import "../contracts/PedersenCommitment.sol";

contract BallotTest {
   
    bytes32  public m = keccak256(abi.encodePacked("QAQ"));
    uint  public r1 = uint(keccak256(abi.encodePacked("1")));
    uint  public r2 = uint(keccak256(abi.encodePacked("2")));
    uint  public r3 = uint(keccak256(abi.encodePacked("3")));
    uint  public r4 = uint(keccak256(abi.encodePacked("4")));
    uint  public r5 = uint(keccak256(abi.encodePacked("5")));
    // uint  public r1 = 1;
    // uint  public r2 = 2;
    // uint  public r3 = 3;
    // uint  public r4 = 4;
    // uint  public r5 = 5;
    uint  public z1;
    uint  public z2;
    uint  public z3;
    uint[2]  public pd1;
    uint[2]  public pd2;
    uint[2]  public pd3;
    uint[2]  public pd4;
    
    uint[2]  public checkpd1;
    uint[2]  public checkpd2;
    uint[2]  public checkpd3;
    uint[2]  public checkpd4;
    
    bytes32 public c;
   
    bool public zkp_result;
    PedersenCommitment ToTest;
    constructor () public {
        ToTest = new PedersenCommitment();
    // }
    // function genPd () public {
        pd1 = ToTest.createCommitment(uint(m),r1);
        pd2 = ToTest.createCommitment(uint(m),r2);
        pd3 = ToTest.createCommitment(r3,r4);
        pd4 = ToTest.createCommitment(r3,r5);
    // }
    // function genProof () public {
        c = ToTest.hashall(pd1,pd2,pd3,pd4);
        z1 = ToTest.createZ(c,m,r3);
        z2 = ToTest.createZ(c,bytes32(r1),r4);
        z3 = ToTest.createZ(c,bytes32(r2),r5);
    }
    
    function QAQ()public view returns(bool){
        // return ToTest.createCheckFromCommitment(pd1,pd3,uint(c));
        return ToTest.checkSame(pd1,pd3,uint(c),z1,z2);
    }
    
    function QAQ2()public view returns(bool){
        // return ToTest.createCheckFromCommitment(pd2,pd4,uint(c));
        return ToTest.checkSame(pd2,pd4,uint(c),z1,z3);
    }
    
    
    function checkright () public payable returns(bool){
        zkp_result =  ToTest.CommitmentEqualityProof(pd1,pd2,pd3,pd4,z1,z2,z3);
    }
    
}
