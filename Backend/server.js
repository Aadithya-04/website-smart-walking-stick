const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json());

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
