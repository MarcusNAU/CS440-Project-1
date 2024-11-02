import UserProfile from '../models/userProfile.js';

export const getLogin = (req, res) => {
    res.render('login.ejs');
};

export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserProfile.findOne({ username });
        if (user && user.password === password) {
            req.session.user = user;
            return res.redirect('/');
        } else {
            req.flash('error', 'Invalid username or password.');
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
};

export const getRegister = (req, res) => {
    res.render('register.ejs');
};

export const postRegister = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await UserProfile.findOne({ username });
        if (existingUser) {
            req.flash('error', 'Username already exists.');
            return res.redirect('/register');
        }
        const newUser = new UserProfile({ username, password });
        await newUser.save();
        req.session.user = newUser;
        res.redirect('/');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
};