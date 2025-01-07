const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const app = express();

app.use(bodyParser.json());

// Firebase Admin Initialization
const serviceAccount = require('./website-smart-walking-stick-firebase-adminsdk-se9pk-46abb99a7d.json');

 // Download from Firebase Console
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://website-smart-walking-stick-default-rtdb.firebaseio.com"
});

// Mock Database
const users = [];
const admins = [{ username: 'admin', password: bcrypt.hashSync('password', 10) }];
const gpsData = {};

// Admin Login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const admin = admins.find(a => a.username === username);
    if (admin && bcrypt.compareSync(password, admin.password)) {
        const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// User OTP Verification
app.post('/user/verifyOtp', async (req, res) => {
    const { idToken } = req.body;

    try {
        // Verify the ID token sent by the client
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const phoneNumber = decodedToken.phone_number;

        // Check if user exists in your database, else create a new user
        let user = users.find(u => u.phoneNumber === phoneNumber);
        if (!user) {
            user = { phoneNumber, createdAt: new Date() };
            users.push(user);
        }

        res.json({ message: 'OTP verified successfully', user });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid OTP' });
    }
});

// Add GPS Data
app.post('/admin/addStick', (req, res) => {
    const { stickId, gpsCoordinates } = req.body;
    gpsData[stickId] = gpsCoordinates;
    res.json({ message: 'Stick data saved successfully' });
});

// Fetch GPS Data
app.get('/user/location/:stickId', (req, res) => {
    const { stickId } = req.params;
    if (gpsData[stickId]) {
        res.json({ location: gpsData[stickId] });
    } else {
        res.status(404).json({ message: 'Stick not found' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
