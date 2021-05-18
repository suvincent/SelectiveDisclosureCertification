const IPFS = require('ipfs-core')
export async function init (flag) {
    if(!flag)return
    const ipfs = await IPFS.create()
    console.log("initailzing")
    window["ipfs"] =  ipfs
}

export async function testAdd (file,flag) {
    if(!flag)return
    const ipfs = window["ipfs"]
    const { cid } = await ipfs.add(file)
    // console.info(cid)
    // console.log("QAQ")
    return cid.toString()
    // QmXXY5ZxbtuYj6DnfApLiGstzPN7fvSyigrRee3hDWPCaf
}
export async function testGet(cid,flag){
    if(!flag)return
    const ipfs = window["ipfs"]
    var returnContent = [];
    for await (const file of ipfs.get(cid)) {
    console.log(file.type, file.path)
    if (!file.content) continue;
    const content = []
    for await (const chunk of file.content) {
        content.push(chunk)
    }
    console.log(content)
    // console.log(content.toString())
    returnContent.push(content)
    }
    
    console.log("finish")
    return returnContent
}

// export {testAdd, testGet};
window["ipfsadd"] = testAdd
window["ipfsget"] = testGet
window["INITIPFS"] = init
// console.log('QAQ')