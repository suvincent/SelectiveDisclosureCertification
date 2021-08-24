import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
// You can also use ES7 async/await syntax
const ethrDidResolver = getResolver({infuraProjectId:'9f86490b4b644532bfb6e4f26a7ab590'})
const didResolver = new Resolver(ethrDidResolver)
export default async function getDidDoc(did){//ex. 'did:ethr:0x3:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74'
// const ethrDidResolver = getResolver(networks)

// didResolver.resolve('did:ethr:0xf3beac30c498d9e26865f34fcaa57dbb935b0d74').then((doc) => console.log(doc))
const doc = (await didResolver.resolve(did)).didDocument
// console.log(doc)
return doc
}
