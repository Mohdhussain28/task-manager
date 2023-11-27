const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authorization = require("../middlewares/auth")
const Firestore = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

const generateAccessToken = (uid) => {
    return jwt.sign({ uid }, "asdfghjkl", { expiresIn: '15m' });
};

const generateRefreshToken = (uid) => {
    return jwt.sign({ uid }, "asdfghjkm", { expiresIn: '7d' });
};

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        res.status(404).json({
            message: "please fill the required field"
        })
    }
    const userSnapshot = await admin.firestore().collection('users').where('username', '==', username).get();

    if (!userSnapshot.empty) {
        return res.status(409).send('User already registered');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const userRecord = await admin.auth().createUser({
            email: `${username}@gmail.com`,
            password: hashedPassword,
        });

        await Firestore.collection('users').doc(userRecord.uid).set({
            username,
            password: hashedPassword,
            usedId: userRecord.uid,
            email: `${username}@gmail.com`
        });

        res.status(200).send(`${username} is registered successfully`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Registration failed');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userSnapshot = await admin.firestore().collection('users').where('username', '==', username).get();

        if (userSnapshot.empty) {
            res.status(401).send('Login failed');
            return;
        }

        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        const uid = userDoc.id;
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            res.status(401).send('Login failed');
            return;
        }

        const accessToken = generateAccessToken(uid);
        const refreshToken = generateRefreshToken(uid);
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(401).send('Login failed');
    }
});


app.post('/refresh-token', async (req, res) => {
    const refreshToken = req.body.refreshToken;

    try {
        const decoded = jwt.verify(refreshToken, "asdfghjkm");
        const uid = decoded.uid;

        const newAccessToken = generateAccessToken(uid);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(401).send('Token refresh failed');
    }
});
app.use(authorization)
app.use(require("./task/index"))

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send(err.message || "Unexpected error!");
});

module.exports = functions.https.onRequest(app);
