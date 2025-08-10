
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors(
//   {
//   origin: [
//     'http://localhost:5173',
//      'https://my-assignment-11-server-rouge.vercel.app'
//   ],
//   credentials: true
// }
))

// use logger......

const logger = (req, res, next) => {
  console.log('inside the logger midel where')
  next()
}
// veryfie tooken ......
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  //console.log('cookie in the midelwere', req.cookies)
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  // veryfie.....here
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    console.log(decoded)
    req.decoded = decoded;
    next();
  });
}








// JWT token verification

// const verifyToken = (req, res, next) => {
//   const token = req.cookies?.token;
//   if (!token) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
//   jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: "unauthorized member" });
//     }
//     req.tokenOwner = decoded;
//     next();
//   });
// };

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jobportal.22lev66.mongodb.net/?retryWrites=true&w=majority&appName=jobportal`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();

    const publicAssignmets = client.db('publicAssignmets').collection('assignmets');
    const allAssignmets = client.db('publicAssignmets').collection('assignmentmark');
    // const userCollection = client.db('publicAssignmets').collection('users'); // added



    


    // jwt post ........

    app.post("/jwt", async (req, res) => {
      const userData = req.body;
      //const {email} = req.body;
      const token = jwt.sign(userData, process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: "1d"
        });
     
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          // secure: false
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict" 
        })
        res.send({ success: true });
    });
    
    // all pubilc assignment .....



    app.get('/assignmets',async(req, res) => {
      // const assignment =req.body
      // const email = req.query.email
      // if (email!==req.decoded.email){
      //   return res.status(403).send({message:'forbiden access'})
      // }
      // console.log('inside...',req.cookies)
      // const query ={
      //   applicant:email
      // }
      const result = await publicAssignmets.find().toArray();
      res.send(result);
    });

    app.get('/assignmets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await publicAssignmets.findOne(query);
      res.send(result);
    });
    app.post('/assignmets',  async (req, res) => {
      const newfree = req.body;
      const result = await publicAssignmets.insertOne(newfree);
      res.send(result);
    });
    app.put('/assignmets/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const update = req.body;

        if (!update || Object.keys(update).length === 0) {
          return res.status(400).json({ error: 'No data provided to update.' });
        }

        const updatedDoc = { $set: update };
        const result = await publicAssignmets.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {
        res.status(500).json({ error: 'Failed to update document.' });
      }
    });

    // deleate methhoed

    app.delete('/assignmets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await publicAssignmets.deleteOne(query);
      res.send(result);
    });

    // get all assignment mark data

    // app.get('/assignmentmark', async (req, res) => {
      
    //   const result = await allAssignmets.find().toArray();
    //   res.send(result);
    // });


    app.get('/assignmentmark', async (req, res) => {
       console.log('inside...',req.cookies)
      
      const result = await allAssignmets.find().toArray();
      res.send(result);
    });


    //get specfic assignment mark


    app.get('/assignmentmark/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignmets.findOne(query);
      res.send(result);
    });

    // Create-assignment-data

    app.post('/assignmentmark', async (req, res) => {
      const newfree = req.body;
      // nod
      const result = await allAssignmets.insertOne(newfree);
      res.send(result);
    });

    // mark updeded by techer...
    app.put('/assignmentmark/:id', async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const update = req.body;

      const updatedDoc = {
        $set: {
          status: update.phendingvalue,
          obtainedmark: update.obtainedmark,
          techer: update.techer,
          date: update.date
        }
      };

      const result = await allAssignmets.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete('/free/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await freeCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const profile = req.body;
      const result = await userCollection.insertOne(profile);
      res.send(result);
    });

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch('/users', async (req, res) => {
      const { email, lastSignInTime } = req.body;
      const filter = { email: email };

      const updatedDoc = {
        $set: { lastSignInTime: lastSignInTime }
      };

      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

  } finally {
    // await client.close(); // left commented in case you want to persist connection
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World with assignments');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});







