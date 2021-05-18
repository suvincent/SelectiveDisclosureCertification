# Drive
## set httpprovider

### use on ganachecli
* in getWeb3.js
```
const provider = new Web3.providers.HttpProvider(
    "http://127.0.0.1:8545"// for development
);
```
* when migrate
```
truffle develop
truffle migrate
```

### use on Ropsten
* in getWeb3.js
```
const provider = new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/9f86490b4b644532bfb6e4f26a7ab590"//for testnet
);
```
* when migrate
```
truffle develop
truffle migrate --network ropsten
```