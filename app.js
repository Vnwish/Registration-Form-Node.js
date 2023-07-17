const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {  
    res.sendFile(path.join(__dirname, 'public', 'views', 'index.html'));
});     

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'signup.html'));
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;

        const errors = [];

        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phone }]
        });

        if (existingUser) {
            errors.push('Username, email, or phone already exists');
        }

        if (errors.length > 0) {   
            res.status(400).json({ errors });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ username, email, phone, password: hashedPassword });
        await user.save({ writeConcern: { w: 'majority' } });

        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                res.redirect('/profile');     
                return;
            }
        }

        res.send('Invalid email or password');
    } catch (error) {
        res.send('Error logging in');
    }
});


app.get('/profile', async (req, res) => {
    try {    
        const user = await User.findOne({ /* your authentication condition here */ });
        if (!user) {
            res.send('User not authenticated');
            return;   
        }

        res.sendFile(path.join(__dirname, 'public', 'views', 'profile.html'));
    } catch (error) {
        res.send('Error retrieving profile');
    }
}); 


app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'forgot-password.html'));
});

app.post('/forgot-password', async (req, res) => {
    try {
      const { email, newPassword, confirmNewPassword } = req.body;
  
      if (newPassword !== confirmNewPassword) {
        res.send('New passwords do not match');
        return;  
      } 
  
      const user = await User.findOne({ email });
  
      if (!user) {
        res.send('User not found');
        return;
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.redirect('/login');
    } catch (error) {
      res.send('Error resetting password');
    }
  });
  

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'views', 'reset-password.html'));     
});     

app.post('/reset-password', async (req, res) => {
    try {
      const { email, currentPassword, newPassword, confirmNewPassword } = req.body;
  
      if (newPassword !== confirmNewPassword) {
        res.send('New passwords do not match');
        return;
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        res.send('User not found');
        return;
      }
  
      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        res.send('Invalid current password');
        return;
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.redirect('/profile');
    } catch (error) {
      res.send('Error resetting password');
    }
  });
  

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
