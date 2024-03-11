"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
var cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("../../student-app-86f45-firebase-adminsdk-k6kov-e3bb5e1890");
app.use(cors());
app.use(express_1.default.json());
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://student-app-86f45-default-rtdb.firebaseio.com",
});
const db = admin.database();
module.exports = db;
const timestamp = new Date().getTime();
const newMessage = {
    senderId: "user1",
    text: "Hello",
    timestamp: timestamp,
};
app.get("/sendMessage", (req, res) => {
    db.ref("Direct_messages/user1_user2/messages")
        .push(newMessage)
        .then((snapshot) => {
        console.log("New message added with ID: " + snapshot.key);
    })
        .catch((error) => {
        console.error("Error adding new message: ", error);
    });
});
// Example of reading data from Firebase Realtime Database
app.get("/read", (req, res) => {
    db.ref("user")
        .once("value")
        .then((snapshot) => {
        const data = snapshot.val();
        res.send(data);
    })
        .catch((error) => {
        console.log("Error reading data from Firebase:", error);
        res.status(500).send("Error reading data from Firebase.");
    });
});
const loginUser = (req, res) => {
    // Reference to the users node in your Realtime Database
    const usersRef = admin.database().ref("users");
    // Query the database for a user with the provided email
    usersRef
        .orderByChild("email")
        .equalTo(req.body.email)
        .once("value", (snapshot) => {
        if (snapshot.exists()) {
            // User found, now check the password
            const userData = snapshot.val();
            const user = Object.values(userData)[0];
            // Compare the provided password with the stored password
            // Note: You should never store passwords in plain text. Always hash and salt passwords.
            if (user.password === req.body.password) {
                // Password is correct, user is authenticated
                res.status(200).json({ message: "User authenticated successfully" });
            }
            else {
                // Password is incorrect
                res.status(401).json({ message: "Incorrect password" });
            }
        }
        else {
            // User not found
            res.status(404).json({ message: "User not found" });
        }
    });
};
app.post("/login", (req, res) => {
    loginUser(req, res);
});
const createUserDocument = (name, age, email, password) => {
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
        .catch((error) => {
        console.error("Error creating user document:", error);
    });
};
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, age, email, password } = req.body;
    createUserDocument(name, age, email, password);
    res.json({ message: "User created successfully" });
}));
app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
});
