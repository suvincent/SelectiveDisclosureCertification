const Drive = artifacts.require("./Drive.sol");

contract("Drive", accounts => {

  it("testItUpload",  async () => {
    const simpleDriveInstance = await Drive.deployed();

    await simpleDriveInstance.Upload("a","b","c", { from: accounts[0] });

    let expected = [ 'a', 'b', 'c', false, '', 0 ]
    console.log(expected)

    let addlength = (await simpleDriveInstance.ViewFiles()).length;

    let result1 = await simpleDriveInstance.fileArray(addlength-1)
    result1 = [result1[0],result1[1],result1[2],result1[3],result1[4],result1[5].toNumber()]
    let result2 = await simpleDriveInstance.files("a");
    result2 = [result2[0],result2[1],result2[2],result2[3],result2[4],result2[5].toNumber()]

    for(let i = 0 ;i < expected.length ;i++){
        assert.equal(result1[i], expected[i], "It should be same in array");
        assert.equal(result2[i], expected[i], "It should be same in mapping");
    }
  });

  it("testItUploadEncrypt",  async () => {
    const simpleDriveInstance = await Drive.deployed();

    await simpleDriveInstance.UploadEncrypt("Q","b","c","d","e","f","g","h", { from: accounts[0] });

    let expected = ["Q","b","c",true,"d",0];
    let expectedkey = ["e","f","g","h"]

    let addlength = (await simpleDriveInstance.ViewFiles()).length;

    let result1 = await simpleDriveInstance.fileArray(addlength-1)
    result1 = [result1[0],result1[1],result1[2],result1[3],result1[4],result1[5].toNumber()]
    let result2 = await simpleDriveInstance.files("Q");
    result2 = [result2[0],result2[1],result2[2],result2[3],result2[4],result2[5].toNumber()]
    let result3 = await simpleDriveInstance.keyArray(result1[5]);
    result3 = [result3[0],result3[1],result3[2],result3[3]];
    console.log(result3)
    
    for(let i = 0 ;i < expected.length ;i++){
        assert.equal(result1[i], expected[i], "It should be same in array,answer"+i.toString()+"is"+result1[i].toString());
        assert.equal(result2[i], expected[i], "It should be same in mapping");
    }

    for(let i = 0 ;i < expectedkey.length ;i++){
        assert.equal(result3[i], expectedkey[i], "It should be same in array,answer"+i.toString()+"is"+result1[i].toString());
    }


  });

  
});
