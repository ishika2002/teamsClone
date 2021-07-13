const User = require('../models/user');

exports.getDashboard = (req, res) => {
    res.render('dashboard', {
        pageTitle: 'Dashboard',
        name: req.session.user.name,
        email: req.session.user.email
    });
};