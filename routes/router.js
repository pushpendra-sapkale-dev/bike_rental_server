const express = require('express'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    connection = require('../db/connection'),
    router = express.Router();

router.get('/', (req, res) => {
    res.send('<h1>Testing Is Working<h1/>')
})

router.post('/book-bike', (req, res) => {
    const bookObj = req.body;
    const q = `INSERT INTO bike_booking(user_id, bike_name, start_date, end_date, licence, national_id) VALUES (?)`;
    const insertBookingObj = [
        bookObj.user_id,
        bookObj.bike_name,
        bookObj.start_date,
        bookObj.end_date,
        bookObj.licence,
        bookObj.national_id
    ]
    connection.query(q, [insertBookingObj], function (err, results, fields) {
        // console.log(err);
        // console.log(results);
        // console.log(fields);
        if (err) {
            res.status(200).json({ status: 'Error in bike booking' });
        }
        else {
            res.status(200).json({ status: 'Bike booked successfully' });
        }
    })
});

router.post('/send-feedback', async (req, res) => {
    const feedbackDetails = req.body;
    const q = 'INSERT INTO feedback(name, email, feedback) VALUES (?)';
    const insertFeedback = [
        feedbackDetails.name,
        feedbackDetails.email,
        feedbackDetails.feedback
    ]
    connection.query(
        q, [insertFeedback],
        function (err, results, fields) {
            // console.log(err);
            // console.log(results);
            // console.log(fields);
            if (err) {
                res.status(200).json({ status: 'Error in sending feedback' });
            }
            else {
                res.status(200).json({ status: 'Feedback successfully submitted' });
            }
        }
    );
});


router.post('/register', async (req, res) => {
    const userDetails = req.body;
    let hashedPassword = await bcrypt.hash(req.body.password, 8);
    userDetails.password = hashedPassword;
    delete userDetails['confirmpassword'];

    const insertQ = 'INSERT INTO user_details(name, lastname, mobileno, email, gender, password, date) VALUES (?)';
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
        `SELECT * FROM user_details WHERE email = "${userDetails.email}"`,
        function (err, results, fields) {
            if (!err) {
                if (results.length == 0) {
                    connection.query(
                        insertQ, [insertV],
                        function (err, results, fields) {
                            // console.log(err);
                            // console.log(results);
                            // console.log(fields);
                            if (err) {
                                res.status(200).json({ status: 'Error in inserting new user' });
                            }
                            else {
                                jwt.sign(userDetails, process.env.JWT_KEY, { expiresIn: '2h' }, (err, token) => {
                                    if (err) {
                                        res.status(200).json({ status: 'Error in generating JWT Token' });
                                    }
                                    else {
                                        res.status(200).json({ status: 'User created successfully', auth: token, user_id: results.insertId });
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
        `SELECT * FROM user_details WHERE email = "${userDetails.email}"`,
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
                    const user = results[0];
                    if (verify) {
                        jwt.sign(user, process.env.JWT_KEY, { expiresIn: '2h' }, (err, token) => {
                            if (err) {
                                res.status(200).json({ status: 'Error in generating JWT Token' });
                            }
                            else {
                                res.status(200).json({ status: 'successfully logged in', auth: token, user_id: user.id });
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


router.get('/get-booking-details', (req, res) => {
    const user_id = req.query.user_id;
    const q = `SELECT * FROM bike_booking WHERE user_id = ${user_id}`;
    connection.query(q, function (err, results, fields) {
        if (err) {
            console.log('Error in getting booking data', err);
        }
        else {
            // console.log(results);
            res.status(200).json({ data: results });
        }
    });
});

router.delete('/cancle-booking', (req, res) => {
    // console.log(req.body);
    const booking_id = Number(req.body.id);
    const q = `DELETE FROM bike_booking WHERE id = ${booking_id}`;
    connection.query(q, function (err, results, fields) {
        if (err) {
            res.status(200).json({ status: 'Error' });
        }
        else {
            res.status(200).json({ status: 'Successfully cancled booking' });
        }
    });
});

module.exports = router;