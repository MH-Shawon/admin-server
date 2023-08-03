const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors')
require("dotenv").config();
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3yzrgbx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    const userCollection= client.db('intern_layout').collection('users')

    app.put('/user/:email', async(req,res)=>{
      const email= req.params.email;
      const user = req.body;
      const filter ={email: email};
      const options = { upsert: true };
      const updateDoc = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, updateDoc, options)
      res.send(result);
    })
    
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/users', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })