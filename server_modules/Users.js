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

    DButilsAzure.execQuery("insert into Users values ('"+username+"', '"+ password+"', '"+firstName+ "', '"
    + lastName+"', '"+city+"', '"+country+"', '"+ email+"', '"+passwordRecoveryAnswer+"')" )
    .then(function (result) {
        res.send(result)
    }).catch(function (err) {
        console.log(err)
    })
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

//Favorites
//removePointFromFavorite request--works
router.delete('/removePointFromFavorite', function (req,res) {
    var pointName = req.body.pointName;
    var userName=req.body.userName;
    console.log(userName);
    console.log(pointName);
    let sql = "DELETE from UserFavorites WHERE pointOfInterest = '"+pointName+"' AND userName = '" + userName+ "'";
    DButilsAzure.execQuery(sql)
    .then(function (result) {
        res.send(result);
    }).catch(function(err){ res.status(400).send(err);});
});

//showFavoritePoint request-works
router.get('/favorites/:userName', function (req,res) {
    var userName = req.params.userName;
    console.log(userName);
    DButilsAzure.execQuery("Select pointName, picture, viewCount, description,PointsOfInterest.category,rate,lastReviewOne,lastReviewTwo From UserFavorites INNER JOIN PointsOfInterest ON UserFavorites.pointOfInterest = PointsOfInterest.pointName AND UserFavorites.userName = '" + userName+ "'")
        .then(function (result) {
            res.send(result);
        }).catch(function(err){ res.send(err);})
        //to sort by order num
});

//manualSortFavorites request--works
router.post('/favorites/manualSortFavorites', function (req,res) {
    var userName = req.body.userName;
    var pointsName = req.body.pointsName;
    for(var i=0;i<pointsName.length;i++)
    {
        let orderNumber=i+1;
        DButilsAzure.execQuery("UPDATE UserFavorites SET orderNumber='" + orderNumber + "' WHERE pointOfInterest='" + pointsName[i] + "' AND userName = '" + userName + "'" ).then(function(result){
            res.sendStatus(200);
        }).catch(function(err){
            res.send(err);
        })
    }
});

//saveFavoriteInServer request--works
router.post('/favorites/saveFavoriteInServer', function (req, res) {
    var name = req.body.userName;
    var points = req.body.pointsInterest;
    let maxNumberTime=1;
    let maxOrderNum=1;
    DButilsAzure.execQuery("Select Max(numberTime) AS mnt from UserFavorites Where userName='" + name + "'").then(function (result1) {
        if(result1.length>0)
        {
            maxNumberTime=result1[0].mnt+1;

        }
        else
        {
            maxNumberTime=1;
        }
        DButilsAzure.execQuery("Select Max(orderNumber) AS mon from UserFavorites Where userName='" + name + "'").then(function (result2) {
            if(result1.length==0)
            {
                maxOrderNum=1;
            }
            else
                maxOrderNum=result2[0].mon+1;
            for(var i=0;i<points.length;i++)
            {
                DButilsAzure.execQuery("INSERT INTO UserFavorites VALUES ('"+name+"', '"+points[i].name+"', '"+maxNumberTime+"', '"+maxOrderNum+"')").then(function (result3) {

            });
            maxNumberTime++;  
            maxOrderNum++;
            } 
        }).catch(function (err) { res.status(400).send(err); });
        res.sendStatus(200);
    }).catch(function (err) { res.status(400).send(err); });

});


module.exports=router;