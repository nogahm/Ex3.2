var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

const secret="secret";

//register post request--works
router.post('/register', function (req, res) {
    var username = req.body.userName;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var city = req.body.city;
    var country = req.body.country;
    var email = req.body.email;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;
    var categories=req.body.categories;
    //insert to Users
    DButilsAzure.execQuery("insert into Users values ('"+username+"', '"+ password+"', '"+firstName+ "', '"
    + lastName+"', '"+city+"', '"+country+"', '"+ email+"', '"+passwordRecoveryAnswer+"')" )
    .then(function (result) {
        //res.send(true)
    }).catch(function (err) {
        console.log(err)
        //res.send(false);
    })

    //insert to user category
    for(var i=0;i<categories.length;i++)
    {
        DButilsAzure.execQuery("insert into CategoryUsers values ('"+username+"', '"+categories[i]+"')").then(function(result)
    {
        res.send(true)
    })
    }
    //return boolean feedback to user
});

//login post request--works
router.post('/login', function (req, res) {
    var nameUser = req.body.userName;
    var password = req.body.password;
    DButilsAzure.execQuery("Select * from Users Where userName='" + nameUser + "' AND password='" + password + "'  ")
    .then(function (result) {
        if (result.length > 0) {
            //return Token
            var payload={
                userName:nameUser,
                password:password
            }

            var token=jwt.sign(payload,secret,{expiresIn:"2d"});

            res.json({
                success:true,
                message:'enjoy your token!',
                token:token
            });

        } else {
            res.send("connection failed");
        }
    }).catch(function (err) { res.status(400).send(err); });

    //res.send("done");
})

//password recovery request--works
router.post('/passwordRecovery', function (req, res) {
    var name = req.body.userName;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;
    
    DButilsAzure.execQuery("Select password from Users Where userName = '" + name + "' AND passwordRecoveryAnswer = '" + passwordRecoveryAnswer + "' ")
        .then(function (result) {
            if (result.length>0)
            {
                 //pass=result[0].password;
                 res.send(result[0].password);
            }
            else
            {
                  res.status(400).send();
            }
                
        }).catch(function (err) { res.status(400).send(err); });
})






module.exports=router;