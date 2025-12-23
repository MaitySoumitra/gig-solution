const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
// Load environment variables
dotenv.config();


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads')); 
app.use(cookieParser()); // for parsing cookies
// Example EJS route
app.get('/ejs-example', (req, res) => {
    res.render('example', { title: 'EJS Example', message: 'Hello from EJS!' });
});
// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your frontend URL
  credentials: true, // Allow cookies to be sent
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Route handling
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/boards', require('./routes/boardRoute'))
app.use('/api/column', require('./routes/columnRoute'))
app.use('/api/tasks', require('./routes/taskRoutes'))


// Default route
app.get('/', (req, res) => {
 
  res.render('layout', { title: 'SageUp'});
});

app.get('/register', (req, res) => {
  res.render('user/register', { title: 'Register Page' });
});
app.get('/edit-profile', (req, res) => {
  res.render('profile/edit-profile', { title: 'Profile Page' });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

