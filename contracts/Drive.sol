// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.6;
pragma experimental ABIEncoderV2;

contract Drive{
    struct file {
        string IPFSHash;
        string fileName;
        string filetype;
        bool encrypted;
        string iv;
        uint decryptkey;
    }
    
    struct key{
        string iv ;
        string ephemPublicKey;
        string ciphertext;
        string mac;
    }
    mapping(string => file) public files;
    file[] public fileArray;
    key[] public keyArray;
    constructor()public{
        
    }
    function UploadEncrypt(string memory fhash, string memory fname,string memory ftype,string memory iv,
                    string memory kiv,string memory ephemPublicKey,string memory ciphertext,string memory mac)public {
        files[fhash].IPFSHash = fhash;
        files[fhash].fileName = fname;
        files[fhash].filetype = ftype;
        files[fhash].encrypted = true;
        files[fhash].iv = iv;
        files[fhash].decryptkey = keyArray.length;
        fileArray.push(files[fhash]);
        key memory temp = key(kiv,ephemPublicKey,ciphertext,mac);
        keyArray.push(temp);
    }
    
    function Upload(string memory fhash, string memory fname,string memory ftype)public{
        files[fhash].IPFSHash = fhash;
        files[fhash].fileName = fname;
        files[fhash].filetype = ftype;
        files[fhash].encrypted = false;
        files[fhash].iv = "";
        files[fhash].decryptkey = 0;
        fileArray.push(files[fhash]);
    }
    
    function ViewFiles()public view returns(file[] memory return_files){
        file[] memory temp = new file[](fileArray.length);
        for(uint i = 0;i<fileArray.length;i++){
            temp[i] = fileArray[i];
        }
        return temp;
    }
}