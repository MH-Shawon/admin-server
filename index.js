const { MongoClient, ServerApiVersion, Admin } = require( 'mongodb' );
const express = require( 'express' );
const cors = require( 'cors' )
const jwt = require( 'jsonwebtoken' );
require( "dotenv" ).config();
const app = express()
const port = process.env.PORT || 5000;

app.use( cors() )
app.use( express() );

const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASS }@cluster0.q2k499v.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient( uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 } );

function verifyToken ( req, res, next )
{
  const authHeader = req.headers.authorization;
  if ( !authHeader )
  {
    return res.status( 401 ).send( { message: 'UnAuthorized Access' } )
  }
  const token = authHeader.split( ' ' )[ 1 ];
  jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, function ( err, decoded )
  {
    if ( err )
    {
      return res.status( 403 ).send( { message: 'Forbidden Access' } )
    }
    req.decoded = decoded;
    next()
  } )
}

async function run ()
{
  try
  {
    await client.connect();
    const userCollection = client.db( "Intern_User" ).collection( "users" );
    console.log( 'DB connected' )

    app.get( '/users', verifyToken, async ( req, res ) =>
    {
      const users = await userCollection.find().toArray();
      res.send( users )
    } )

    app.put( '/user/:email', async ( req, res ) =>
    {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };

      const optoins = { upsert: true };

      const updateDoc = {
        $set: {
           user
        },
      };

      const result = await userCollection.updateOne( filter, updateDoc, optoins );
      const token = jwt.sign( { email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' } );


      res.send( { result, token } )
    } )

    // make an admin
    app.put( '/user/admin/:email', verifyToken, async ( req, res ) =>
    {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email : requester});
      if(requesterAccount === 'admin'){
        const filter = { email: email };
      const updateDoc = {
        $set:
          { role: 'Admin' }
        ,
      };
      const result = await userCollection.updateOne( filter, updateDoc );
      res.send( result )

      }
      else{
        res.status(403).send({message:'Forbidden'});
      }

      // admin check 

      app.get ('/admin/:email', async(req,res)=>{
        const email = req.params.email;
        const user = await userCollection.findOne({email: email})
        const isAdmin = user.role === 'admin'
        res.send({Admin: isAdmin});
      })
      
      
    } )






  } finally
  {


  }
}
run().catch( console.dir );




app.get( '/', ( req, res ) =>
{
  res.send( 'Hellow Interny' )
} )



app.listen( port, () =>
{
  console.log( 'port is listening to 5000' )
} )