"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
const admin = require("firebase-admin");
const serviceAccount = require("../../student-app-86f45-firebase-adminsdk-k6kov-e3bb5e1890");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://student-app-86f45-default-rtdb.firebaseio.com",
});
const db = admin.database();
module.exports = db;
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
app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
});
