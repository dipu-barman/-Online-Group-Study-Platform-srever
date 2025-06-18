const express = require('express')
const cors = require('cors')
require('dotenv').config()


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()

const port = process.env.PORT || 3000

// midlewere
app.use(cors())
app.use(express.json())



// console.log(process.env.DB_USER)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jobportal.22lev66.mongodb.net/?retryWrites=true&w=majority&appName=jobportal`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    
    const publicAssignmets = client.db('publicAssignmets').collection('assignmets');
     const allAssignmets = client.db('publicAssignmets').collection('assignmentmark');

    // show all asignmets 
    app.get('/assignmets', async (req, res) => {
      // const cursor = coffeesCollection.find()
      const result = await publicAssignmets.find().toArray();
      res.send(result)
    });


    app.get('/assignmets/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await publicAssignmets.findOne(query)
      res.send(result)
    })


    
    /// all public assigmets post 
    app.post('/assignmets', async (req, res) => {
      const newfree = req.body
      console.log(newfree)
      const result = await publicAssignmets.insertOne(newfree);
      res.send(result);
    });

    
    // app.put('/assignmets/:id', async (req, res) => {
    //   const id = req.params.id
    //   console.log(id)
    //   const filter = { _id: new ObjectId(id) }
    //   // const options ={upsert :true}
    //   const update = req.body

    //   console.log(update)

    //   const updatedDoc = {
    //     $set: update
    //   }
            
    //   // const updatedDoc ={
    //   //         $set :{
    //   //            status: update.phendingvalue,
    //   //           // obtainedmark,,feedback,date,status

    //   //           obtainedmark :update.obtainedmark,
    //   //            techer: update.techer,
    //   //            date:update.date
    //   //         }
    //   //       }
    //   const result = await publicAssignmets.updateOne(filter,updatedDoc)
    //   console.log(result)
    //   res.send(result)
    // })
    


    app.put('/assignmets/:id', async (req, res) => {
      try {
        const id      = req.params.id;
        const filter  = { _id: new ObjectId(id) };

        // ✅ use req.body (NOT res.body)
        const update  = req.body;     // <- e.g. { name: "Alice", email: "a@b.com" }

        // Optional: guard against empty body
        if (!update || Object.keys(update).length === 0) {
          return res.status(400).json({ error: 'No data provided to update.' });
        }

        const updatedDoc = { $set: update };

        const result = await publicAssignmets.updateOne(filter, updatedDoc);
        console.log(result);

        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update document.' });
      }
    });







    
    app.delete('/assignmets/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await publicAssignmets.deleteOne(query)
      res.send(result)
    })



    // ..allll student mark

     app.get('/assignmentmark', async (req, res) => {
      // const cursor = coffeesCollection.find()
      const result = await allAssignmets.find().toArray();
      res.send(result)
    });


    app.get('/assignmentmark/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await allAssignmets.findOne(query)
      res.send(result)
    })



     app.post('/assignmentmark', async (req, res) => {
      const newfree = req.body
      console.log(newfree)
      const result = await allAssignmets.insertOne(newfree);
      res.send(result);
    });



     app.put('/assignmentmark/:id', async (req, res) => {
      const id = req.params.id
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      // const options ={upsert :true}
      const update = req.body

      console.log(update)

      // const updatedDoc = {
      //   $set: update
      // }
            
      const updatedDoc ={
              $set :{
                 status: update.phendingvalue,
                // obtainedmark,,feedback,date,status

                obtainedmark :update.obtainedmark,
                 techer: update.techer,
                 date:update.date
              }
            }
      const result = await allAssignmets.updateOne(filter,updatedDoc)
      console.log(result)
      res.send(result)
    })



    // app.get('/free/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }
    //   const result = await freeCollection.findOne(query)
    //   res.send(result)
    // })



    // app.post('/free', async (req, res) => {
    //   const newfree = req.body
    //   console.log(newfree)
    //   const result = await freeCollection.insertOne(newfree);
    //   res.send(result)
    // })

    


    

    app.delete('/free/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await freeCollection.deleteOne(query)
      res.send(result)
    })


   

    // for public or front page or all assignmet api ;
    // app.post('/')





















    app.post('/users', async (req, res) => {
      const profile = req.body
      console.log(profile)
      const result = await userCollection.insertOne(profile);
      res.send(result)
    })


    app.get('/users', async (req, res) => {
      // const cursor = coffeesCollection.find()

      const result = await userCollection.find().toArray()
      res.send(result)
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })


    app.patch('/users', async (req, res) => {

      //    console.log(id)
      //  const filter = {_id:new ObjectId(id)}
      // const options ={upsert :true}
      const { email, lastSignInTime } = req.body
      const filter = { email: email }

      //   console.log(update)

      const updatedDoc = {
        $set: { lastSignInTime: lastSignInTime }
      }

      const result = await userCollection.updateOne(filter, updatedDoc)
      console.log(result)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})