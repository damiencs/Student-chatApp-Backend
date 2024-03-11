import { time } from "console";
import express, { Application, Request, Response } from "express";
const app: Application = express();
const port: number = 3000;
var cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("../../student-app-86f45-firebase-adminsdk-k6kov-e3bb5e1890");
app.use(cors());
app.use(express.json());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://student-app-86f45-default-rtdb.firebaseio.com",
});

interface User {
  name: string;
  age: string;
  email: string;
  password: string;
}

const db = admin.database();
module.exports = db;

const timestamp = new Date().getTime();
const newMessage = {
  senderId: "user1",
  text: "Hello",
  timestamp: timestamp,
};

app.get("/sendMessage", (req: Request, res: Response) => {
  db.ref("Direct_messages/user1_user2/messages")
    .push(newMessage)
    .then((snapshot: any) => {
      console.log("New message added with ID: " + snapshot.key);
    })
    .catch((error: any) => {
      console.error("Error adding new message: ", error);
    });
});

// Example of reading data from Firebase Realtime Database
app.get("/read", (req: Request, res: Response) => {
  db.ref("user")
    .once("value")
    .then((snapshot: any) => {
      const data = snapshot.val();
      res.send(data);
    })
    .catch((error: any) => {
      console.log("Error reading data from Firebase:", error);
      res.status(500).send("Error reading data from Firebase.");
    });
});

const loginUser = (req: Request, res: Response) => {
  // Reference to the users node in your Realtime Database
  const usersRef = admin.database().ref("users");

  // Query the database for a user with the provided email
  usersRef
    .orderByChild("email")
    .equalTo(req.body.email)
    .once("value", (snapshot: any) => {
      if (snapshot.exists()) {
        // User found, now check the password
        const userData = snapshot.val();
        const user = Object.values(userData)[0] as User;

        // Compare the provided password with the stored password
        // Note: You should never store passwords in plain text. Always hash and salt passwords.
        if (user.password === req.body.password) {
          // Password is correct, user is authenticated
          res.status(200).json({ message: "User authenticated successfully" });
        } else {
          // Password is incorrect
          res.status(401).json({ message: "Incorrect password" });
        }
      } else {
        // User not found
        res.status(404).json({ message: "User not found" });
      }
    });
};

app.post("/login", (req, res) => {
  loginUser(req, res);
});

const createUserDocument = (
  name: string,
  age: number,
  email: string,
  password: string
) => {
  // Create a unique ID for the new user
  const userId = admin.database().ref().child("users").push().key;

  // Create a new user document in the Realtime Database
  const userRef = admin.database().ref("users/" + userId);
  userRef
    .set({
      name: name,
      age: age,
      email: email,
      password: password,
    })
    .then(() => {
      console.log("User document created successfully");
    })
    .catch((error: any) => {
      console.error("Error creating user document:", error);
    });
};

app.post("/signup", async (req, res) => {
  const { name, age, email, password } = req.body;
  createUserDocument(name, age, email, password);
  res.json({ message: "User created successfully" });
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
