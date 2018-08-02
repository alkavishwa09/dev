const express = require('express')
const app = express()
const bodyparser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');


const nodeAddress = uuid().split('-').join('');


const mediblock = new Blockchain();


/*
app.get('/', function (req, res) {
  res.send('Hello World')
})
 
app.listen(3000)

*/
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));


app.get('/blockchain', function (req, res) {

  res.send(mediblock);
    

  });

  app.post('/transaction', function (req, res) {
    //res.send('It works!!!');
    //console.log(req.body);
    //res.send('the disease information is ' + req.body.disease + ' mediblock.');
    const blockIndex = mediblock.createNewTransaction(req.body.disease, req.body.doctor, req.body.patient);
    res.json({note: 'Transaction will be added in block ' + blockIndex });
  });

  


  app.get('/mine', function (req, res) {
    const lastBlock = mediblock.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    currentBlockData = {
      informations: mediblock.pendingTransactions,
      index: lastBlock['index'] + 1

    };

    const nonce = mediblock.proofOfWork(previousBlockHash,currentBlockData);

    const blockHash = mediblock.hashBlock(previousBlockHash,currentBlockData,nonce);

    mediblock.createNewTransaction(12.5,"00",nodeAddress);

    const newBlock = mediblock.createNewBlock(nonce, previousBlockHash, blockHash);
    
    res.json({
      note: "new block mined sucessfully",
      block: newBlock
    });
    });
    
    //register a node and broadcast it to the network
    app.post('/register-and-broadcast-node', function(req, res){
      const newNodeUrl = req.body.newNodeUrl;
      if (mediblock.networkNodes.indexOf(newNodeUrl) == -1) mediblock.networkNodes.push(newNodeUrl);
    
      const regNodesPromises = [];
      mediblock.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
          uri: networkNodeUrl + '/register-node',
          method: 'POST',
          body: { newNodeUrl: newNodeUrl },
          json: true
        };
        regNodesPromises.push(rp(requestOptions));
      });

      Promise.all(regNodesPromises)
      .then(data => {
        const bulkRegisterOptions = {
          uri: newNodeUrl + '/register-nodes-bulk',
          method: 'POST',
          body: { allNetworkNodes: [ ...mediblock.networkNodes, mediblock.currentNodeUrl]},
          json: true
        };
        return rp(bulkRegisterOptions);
        //use the data
      })
      .then(data => {
        res.json({ note: 'New node registered with network successfully.'});
      });
    });


    //register a node with the network
    app.post('/register-node', function(req, res){
        const newNodeUrl = req.body.newNodeUrl;
        
        const nodeNotAlreadyPresent = mediblock.networkNodes.indexOf(newNodeUrl) == -1;
       

        const notCurrentNode = mediblock.currentNodeUrl !== newNodeUrl;
        if (nodeNotAlreadyPresent && notCurrentNode) mediblock.networkNodes.push(newNodeUrl);
        res.json({ note: 'New node registered successfully.'});

    });

    //registe multiple nodes at once
    app.post('/register-nodes-bulk', function(req, res){
        const allNetworkNodes = req.body.allNetworkNodes;
        
        allNetworkNodes.forEach(networkNodeUrl => {
          const nodeNotAlreadyPresent = mediblock.networkNodes.indexOf(networkNodeUrl) == -1;
          const notCurrentNode = mediblock.currentNodeUrl !== networkNodeUrl;
          if (nodeNotAlreadyPresent && notCurrentNode) mediblock.networkNodes.push(networkNodeUrl);
        });
        res.json({ note: 'Bulk regisration successful.'});

    });


   
  app.listen(port, function(){
        console.log('Listening on port ' + port);

  });
  
