

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser'); // fixed typo

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cookieParser());
app.use(express.json());

const jwt = require('jsonwebtoken');

// app.use(
//   cors({
//     origin: [
//       'https://assignment-11-41e71.web.app',
//       'https://assignment-11-41e71.firebaseapp.com',
//       'http://localhost:5173'
//     ],
//     credentials: true,
//   })
// );


const allowedOrigins = [
  'https://assignment-11-41e71.web.app',
  'https://assignment-11-41e71.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5173/pending'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests or same-origin
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin); // echo back the requesting origin if allowed
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));




// JWT token verification
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized member" });
    }
    req.tokenOwner = decoded;
    next();
  });
};

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
    await client.connect();

    const publicAssignmets = client.db('publicAssignmets').collection('assignmets');
    const allAssignmets = client.db('publicAssignmets').collection('assignmentmark');
    const userCollection = client.db('publicAssignmets').collection('users'); // added
    const freeCollection = client.db('publicAssignmets').collection('free');   // added

    app.get('/assignmets', async (req, res) => {
      const result = await publicAssignmets.find().toArray();
      res.send(result);
    });

    // jwt........
    
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        expiresIn: "1d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" 
      })
        .send({ success: true, token });    
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ successfully_logOut: true });
    });

    // all pubilc assignment .....

    app.get('/assignmets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await publicAssignmets.findOne(query);
      res.send(result);
    });

    app.post('/assignmets', verifyToken, async (req, res) => {
      const newfree = req.body;
      console.log('token is ', req.cookies);
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

    app.get('/assignmentmark', async (req, res) => {
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

    app.post('/assignmentmark', verifyToken, async (req, res) => {
      const newfree = req.body;
      console.log('token  is ', req.cookies)
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
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});







