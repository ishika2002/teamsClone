const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
// const nodemailer = require('nodemailer');

// const transporterCreds = require('../mailCreds');
// const transporter = nodemailer.createTransport(transporterCreds);

exports.login = (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/chat');
    } else {
        let msg = req.params.msg;
        res.render('auth/login', { pageTitle: 'LogIn', msg: msg });
    }
};

exports.doLogin = (req, res) => {
    const username = req.body.username;
    const pass = req.body.pass;
    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                return res.redirect('/login/Username Does not Exist');
            }
            bcrypt
                .compare(pass, user.password)
                .then(result => {
                    if (result) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/chat');
                        });
                    }
                    res.redirect('/login/Password Incorrect');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login/Some Error Occured');
                });
        });
};

exports.signup = (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/chat');
    } else {
        let msg = req.params.msg;
        res.render('auth/signup', { pageTitle: 'SignUp', msg: msg });
    }
};

exports.doSignup = (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    const name = req.body.name;
    const username = req.body.username;
    User.findOne({ username: username })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect('/signup/Username Exists');
            }
            return bcrypt
                .hash(pass, 12)
                .then(hashedPass => {
                    const user = new User({
                        email: email,
                        password: hashedPass,
                        name: name,
                        username: username,
                        rooms: {
                            support: "Support"
                        }
                    });
                    return user.save();
                });
        })
        .then(result => {
            if (result) {
                res.redirect('/login/Account Created, Login to Continue');
            }
        })
        .catch(err => {
            console.log(err);
        });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
};

exports.forgot = (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect('/chat');
    } else {
        let msg = req.params.msg;
        res.render('auth/forgot', { pageTitle: "Recover Password", msg: msg });
    }
};

exports.doForgot = (req, res) => {
    res.redirect('/forgot/Mailing service not initialized');
    // const email = req.body.email;
    // var userI;
    // crypto.randomBytes(32, (err, buffer) => {
    //     if (err) {
    //         console.log(err);
    //         res.redirect('/forgot/Token Gen Failed');
    //     }
    //     const token = buffer.toString('hex');
    //     User.findOne({ email: email })
    //         .then(user => {
    //             if (!user) {
    //                 return res.redirect('/forgot/Email Does not Exist');
    //             }
    //             userI = user;
    //             user.resetToken = token;
    //             user.resetTokenExpiration = Date.now() + 3600000;
    //             return user.save();
    //         })
    //         .then(result => {
    //             let url = 'http://' + req.headers.host + '/reset/' + token;
    //             transporter.sendMail({
    //                 to: email,
    //                 from: "harshit.gla_ccv17@gla.ac.in",
    //                 subject: "Password Reset",
    //                 html: `<h1>Password Reset Requested</h1>
    //             <p>Hi ${userI.name},</p>                    
    //             <p>Click on this Reset link or copy paste the url in browser </p>
    //             <p><a href="$(url)">${url}</a></p>
    //             <p>The Link will expire in ten minutes if not used.</p>
    //             <p>If you have not made this request, please contact our customer support immediately.</p>
    //             <p><br>Thank You,</p>`
    //             }, (err, info) => {
    //                 if (err) {
    //                     console.log(err);
    //                     res.redirect('/forgot/Mailing Error');
    //                 } else {
    //                     res.redirect('/login/Reset Link sent to mail!');
    //                 }
    //             });
    //         });
    // });
};

exports.newPassword = (req, res) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (user) {
                res.render('auth/new-password', { pageTitle: "Update Password", userId: user._id.toString(), token: token });
            } else {
                res.redirect('/login/Token Invalid or Expired');
            }
        })
        .catch(err => {
            console.log(err);
        });
};

exports.doNewPassword = (req, res) => {
    const pass = req.body.pass;
    const userId = req.body.userId;
    const token = req.body.token;
    let resetUser;

    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    }).then(user => {
        resetUser = user;
        return bcrypt.hash(pass, 12);
    }).then(hashed => {
        resetUser.password = hashed;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login/Password Changed!');
    }).catch(err => {
        console.log(err);
    });
};
