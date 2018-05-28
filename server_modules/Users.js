var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

const secret="secret";
//register post request

router.post('/register', function (req, res) {
    var username = req.body.userName;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var city = req.body.city;
    var country = req.body.country;
    var email = req.body.email;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;

   
    DButilsAzure.execQuery("insert into users values ('" + req.body.userName+"', '"+ req.body.password+"', '"+ req.body.firstName+ "', '"
    + req.body.lastName+"', '"+req.body.city+"', '"+req.body.country+"', '"+ req.body.email+"', '"+req.body.passwordRecoveryAnswer+"')" )
    .then(function (result) {
        res.send(result)
    }).catch(function (err) {
        console.log(err)
    })

    //return boolean feedback to user
});

//login post request
router.post('/Users/login', function (req, res) {
    var nameUser = req.body.userName;
    var password = req.body.password;
    DButilsAzure.execQuery("Select * from Users Where userName='" + nameUser + "' AND password='" + password + "'  ")
    .then(function (result) {
        if (result[0].length > 0) {
            //return Token
            var payload={
                userName:nameUser,
                password:password
            }

            var token=jwt.sign(payload,'secret',{expiresIn:"2d"});

            res.json({
                success:true,
                message:'login succeed',
                token:token
            });

        } else {
            res.send("connection failed");
        }
    }).catch(function (err) { res.status(400).send(err); });

    //res.send("done");
})

//password recovery request
router.post('/Users/passwordRecovery', function (req, res, next) {
    var name = req.body.userName;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;
    DButilsAzure.execQuery("Select [password] from Users Where userName = '" + name + "' AND passwordRecoveryAnswer = '" + passwordRecoveryAnswer + "'")
        .then(function (result) {
            if (result[0] == string.empty())
                res.status(400).send();
            else
                res.send(result[0].password);
        }).catch(function (err) { res.status(400).send(err); });
});

module.exports=router;