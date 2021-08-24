const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express')

const app = express()
const port = 4000


const corsOptions = {
    origin: [
      'http://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var onlineList = {};
var count = 0;
var ChatData = [];

app.post('/online',(req,res)=>{
    // console.log(req.body);
    if(!onlineList[req.body.address]){
        onlineList[req.body.address] = req.body.publicKey
        count = (Object.keys(onlineList).length);
    }
    // console.log(onlineList)
    res.send({
        address:req.body.address,
        publicKey:onlineList[req.body.address]
    })
});

app.post('/send',(req,res)=>{
    // console.log(req.body);
    ChatData.push({
        sender:req.body.sender,
        receiver:req.body.receiver,
        type:req.body.type,
        content:req.body.content
    })
    app.emit('message',{
        sender:req.body.sender,
        receiver:req.body.receiver,
        type:req.body.type,
        content:req.body.content
    })
    
    // res.send(true)
});

app.get('/',(req,res) =>{
    var result = Object.keys(onlineList).map((key) => [key, onlineList[key]]);
    res.send(result);
})

app.get('/chat',(req,res) =>{
    // var result = Object.keys(onlineList).map((key) => [key, onlineList[key]]);
    res.send(JSON.stringify(ChatData));
})

app.get('/clear',(req,res)=>{
    ChatData = [];
    res.send(true)
})

app.get('/events', async function(req, res) {
    // console.log('Got /events');
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    // res.flushHeaders();

    // Tell the client to retry every 10 seconds if connectivity is lost
    // res.write('retry: 10000\n\n');
    // let c = 0;
    // let lastChange = onlineList;
    // while (true) {
    //   await new Promise(resolve => setTimeout(resolve, 1000));
    //   // 偵測上線變化
    // //   if(c != count){
    // //     console.log('Emit',c,count);
    // //     res.write(`data: ${count}\n\n`);
    // //     c = count
    // //   }

    //   // 偵測聊天變化
    //     if(c != ChatData.length){
    //         console.log('Emit',c,ChatData.length);
    //         console.log(ChatData[c])
    //         res.write(`data: ${ChatData[c]}\n\n`);
    //         c++;
    //     }
    // }
    app.on('message', data => {
        console.log("emit")
		// res.write(`event: message\n`);
		res.write(`data: ${JSON.stringify(data)}\n\n`);
	});
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})