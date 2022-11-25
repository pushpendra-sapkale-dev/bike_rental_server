const express = require('express'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    connection = require('../db/connection'),
    router = express.Router();



router.post('/register', async (req, res) => {
    const userDetails = req.body;
    let hashedPassword = await bcrypt.hash(req.body.password, 8);
    console.log(hashedPassword);
    userDetails.password = hashedPassword;
    delete userDetails['confirmpassword'];

    const insertQ = 'INSERT INTO sign_up(name, lastname, mobileno, email, gender, password, date) VALUES (?)';
    const insertV =
        [
            userDetails.name,
            userDetails.lastname,
            userDetails.mobileno,
            userDetails.email,
            userDetails.gender,
            userDetails.password,
            userDetails.date
        ]

    connection.query(
        `SELECT * FROM sign_up WHERE email = "${userDetails.email}"`,
        function (err, results, fields) {
            if (!err) {
                if (results.length == 0) {
                    connection.query(
                        insertQ, [insertV],
                        function (err, results, fields) {
                            console.log(err);
                            console.log(results);
                            console.log(fields);
                            if (err) {
                                res.status(200).json({ status: 'Error in inserting new user' });
                            }
                            else {
                                jwt.sign(userDetails, process.env.JWT_KEY, { expiresIn: '2h' }, (err, token) => {
                                    if (err) {
                                        res.status(200).json({ status: 'Error in generating JWT Token' });
                                    }
                                    else {
                                        res.status(200).json({ status: 'User created successfully', auth: token });
                                    }
                                });
                            }
                        }
                    );
                }
                else {
                    res.json({ status: 'Email already exist !!' });
                }
            }
        }
    );

});

router.post('/login', (req, res) => {
    const userDetails = req.body;
    connection.query(
        `SELECT * FROM sign_up WHERE email = "${userDetails.email}"`,
        function (err, results, fields) {
            if (err) {
                console.log(err);
            }
            else {
                if (results.length == 0) {
                    res.json({ status: 'Email is not exists' });
                }
                else {
                    const verify = bcrypt.compareSync(userDetails.password, results[0]["password"]);
                    console.log(verify);
                    const user = results[0];
                    console.log(user);
                    if (verify) {
                        jwt.sign(user, process.env.JWT_KEY, { expiresIn: '2h' }, (err, token) => {
                            if (err) {
                                res.status(200).json({ status: 'Error in generating JWT Token' });
                            }
                            else {
                                res.status(200).json({ status: 'successfully logged in', auth: token });
                            }
                        });
                    }
                    else {
                        res.status(200).json({ status: 'Password is incorrect !!' })
                    }
                }
            }
        })
});

module.exports = router;