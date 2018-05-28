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

//manualSortFavorites request----------------------------------------------------------------------------------------------------------------------------------------------------------
router.get('/favorites/manualSortFavorites', function (req,res) {
    var userName = req.params.userName;
    var pointsName = req.params.pointsName;
    for(var i=0;i<pointsName.size;i++)
    {
        DButilsAzure.execQuery("UPDATE UserFavorites SET orderNumber='" + i + "' WHERE pointName = '" + pointsName[i] + "' AND userName = '" + userName + "'" );
    }
});

//saveFavoriteInServer request----------------------------------------------------------------------------------------------------------------------------------------------------------
router.post('/favorites/saveFavoriteInServer', function (req, res) {
    var name = req.body.userName;
    var points = req.body.pointsInterest;
    var maxNumberTime;
    var maxOrderNum;
    DButilsAzure.execQuery("Select Max(numberTime) from UserFavorites Where userName = '" + name + "'").then(function (result) {
        maxNumberTime=result[0]+1;
    }).catch(function (err) { res.status(400).send(err); });
    DButilsAzure.execQuery("Select Max(orderNumber) from UserFavorites Where userName = '" + name + "'").then(function (result) {
        maxOrderNum=result[0]+1; 
    }).catch(function (err) { res.status(400).send(err); });
    for(var i=0;i<points.length;i++)
    {
        DButilsAzure.execQuery("INSERT INTO UserFavorites VALUES ('"+name,points[i]+"','"+maxNumberTime+"','"+maxOrderNum+"')").then(function (result) {
            maxNumberTime++;  
            maxOrderNum++;
    });
}
});


module.exports=router;