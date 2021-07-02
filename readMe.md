# Task: A DApp on Web


## contract address for PD commitment
0xf07AceA1dB989df2236339D616338bEcB84a0600

## public url 
https://suvincent.github.io/SelectiveDisclosureCertification/

## Test for contract and web app
* contract 
```
truffle develop
truffle migrate 
truffle test
```
* website
Test upload and download file type : txt, pdf, png is currently OK

## DEV steps
### install
```
git clone https://github.com/suvincent/simpleIPFSDrive.git
npm init
npm install
```
### run web
```
cd client
npm start
```
### contract deploy
* in ganache
```
truffle develop
truffle migrate
```
* in ropsten
```
truffle develop
truffle migrate --network ropsten
```

# web deploy
```
cd client
npm run deploy
```

### If web want to change httpprovider

#### use on ganachecli
* in getWeb3.js
```
const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"// for development
);
```


#### use on Ropsten
* in getWeb3.js
```
const provider = new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/9f86490b4b644532bfb6e4f26a7ab590"//for testnet
);
```
