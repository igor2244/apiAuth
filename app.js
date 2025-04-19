// Importing necessary libraries and modules
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); 
const Customers = require('./models/customer');
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('cors');
require('dotenv').config();
const saltRounds = 5;
const secretKey = process.env.SECRET_KEY;

// Creating an instance of the Express application
const app = express();
app.use(express.json())

// Middleware to parse JSON requests
app.use("*home", bodyParser.json());
// Middleware to handle URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'mysecetkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
// app.use('api/v1/auth', auth);

// Setting the port nulber for the server
const port = process.env.PORT || 3000

// MongoDB connection URI and database name
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { 'dbName': 'apiAuthDB'});


// Endpoint for user login
app.post('/api/login',  async (req, res) => {
    const { user_name, password } = req.body;

    try {
        // Check if the user exists with the provided credentials
        const user = await Customers.findOne({ user_name });
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(400).json({ message: 'Invalid credendials' });
        }
        // Generate JWT token and store in session
        const token = jwt.sign({ userId: user._id, username: user.user_name }, secretKey, { expiresIn: '1h' });
        req.session.token = token;
        // Respond with a success message
        res.status(200).json({ messsage: 'User has logged in' });
    } catch (error) {
        // console.error(error);
        // Handle server Errors
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// POST endpoint for user register
app.post('/api/register', async (req, res) => {
    const { user_name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await Customers.findOne({ $or: [{ user_name}, { email } ]});
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        // bcrypt hashing password
        const hashedpwd = await bcrypt.hash(password, saltRounds);
        // Create a save a new user
        const newUser = new Customers({ 
            "user_name": user_name, 
            "email": email, 
            "password": hashedpwd });
        await newUser.save();
        // Generate JWT token and store in session
        const token = jwt.sign({ userId: newUser._id, username: newUser.user_name }, secretKey, { expiresIn: '1h' });
        req.session.token = token;
        res.status(200).json({ message: 'The user has been added' });
    } catch (error) {
        // console.error(error)
        // Handle server errors 
        res.status(500).json({ message: 'Internal Server Error' })
    }

});

// Endpoit for protected routes if auth
app.get('/api/protected', authenticateToken, async (req, res) => {
    res.json({ message: `Bienvenue ${req.user.username}!`, user: req.user })
})
// Get endpoint for logout user
app.get('/api/logout', async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            res.status(400).json({ message: 'Une erreur est survene'});
            // console.log(err);
        } else {
            res.cookie('username', '', { expires: new Date(0) });
            res.status(200).json({ message: 'Logout successfully' })
        }
    });
});


// Function to authenticate jwt token
function authenticateToken (req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, secretKey, (err, user) => {
        if(err) {
            res.sendStatus(403);
            return;
        }
        req.user = user;
        next();
    });
}
// authenticateToken(req, res, next);





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})