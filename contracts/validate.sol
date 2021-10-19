// SPDX-License-Identifier: QQ
pragma solidity >=0.5.3 <0.7.0;
pragma experimental ABIEncoderV2;

import "./PedersenCommitment.sol";

contract validate {
    address owner;
    struct Rule{
        bytes32 keyhash;
        uint[2] commitment;
    }
    struct Proof {
        uint[2] c2;
        uint[2] c3;
        uint[2] c4;
        uint z1;
        uint z2;
        uint z3;
    }
    struct Result {
        bool result;
        bytes32 verifiableCredential;
    }
    bytes32[] rulekeys;
    mapping(bytes32 => uint[2]) rules;
    // user -> key hash -> result;
    mapping(address => mapping(bytes32 => Result)) result;
    mapping(address => bool) pass;
    address[] validUser;
    constructor()public{
        owner = msg.sender;
    }
    
    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }
    
    function setValidateRule(bytes32 keyhash, uint[2]memory c1)isOwner public payable{
        require(rules[keyhash][0]==0 && rules[keyhash][1]==0);
        rulekeys.push(keyhash);
        rules[keyhash] = c1;
    }
    
    function checkAllPass(address user) public view returns(bool){
        for (uint i = 0;i < rulekeys.length;i++){
            bytes32 keyhash = rulekeys[i];
            if(result[user][keyhash].result != true){
                return false;
            }
        }
        return true;
    }
    
    function validateOneAttribute(bytes32 keyhash,uint[2] memory c2,uint[2] memory c3,uint[2] memory c4,uint z1,uint z2,uint z3,bytes32 vc)public payable returns(bool){
        PedersenCommitment Check = PedersenCommitment(0xF944e6B6164a331134375b8dBAe6D33ACcfCfcc1);
        bool r = Check.CommitmentEqualityProof(rules[keyhash],c2,c3,c4,z1,z2,z3);
        require(r,"not pass");
        Result memory temp;
        temp.result = r;
        temp.verifiableCredential = vc;
        result[msg.sender][keyhash] = temp;
        
        if(checkAllPass(msg.sender)){
            pass[msg.sender] = true;
            validUser.push(msg.sender);
        }
    }
    
    function validUserLength()public view returns(uint){
        return validUser.length;
    }
    
    function viewValidList(uint startPos,uint querynum)public view returns(address[] memory returnList){
        require(startPos >= 0);
        require(startPos+querynum<=validUser.length);
        for (uint i = startPos;i < validUser.length;i++){
            returnList[i] = validUser[i];
        }
    }
    
    function viewRuleList()public view returns(Rule[] memory returnList){
        for (uint i = 0;i < rulekeys.length;i++){
            Rule memory temp;
            temp.keyhash = rulekeys[i];
            temp.commitment = rules[temp.keyhash];
            returnList[i] = temp;
        }
    }
    
}