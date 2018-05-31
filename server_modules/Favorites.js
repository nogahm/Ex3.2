var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

const secret = "secret";

//Favorites
//removePointFromFavorite request--works
router.delete('/removePointFromFavorite', function (req, res) {
    var pointName = req.body.pointName;
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    //var userName=req.body.userName;
    console.log(userName);
    console.log(pointName);
    //let sql = "DELETE from UserFavorites WHERE pointOfInterest = '"+pointName+"' AND userName = '" + userName+ "'";
    DButilsAzure.execQuery("DELETE from UserFavorites WHERE pointOfInterest='" + pointName + "' AND userName='" + userName + "'")
        .then(function (result) {
            res.sendStatus(200);
        }).catch(function (err) { res.status(400).send(err); });
});

//showFavoritePoint request-works
router.get('/showFavoritePoints', function (req, res) {
    var token = req.params.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    console.log(userName);
    DButilsAzure.execQuery("Select pointName, picture, viewCount, description,PointsOfInterest.category,rate,lastReviewOne,lastReviewTwo From UserFavorites INNER JOIN PointsOfInterest ON UserFavorites.pointOfInterest = PointsOfInterest.pointName AND UserFavorites.userName = '" + userName + "'")
        .then(function (result) {
            res.send(result);
        }).catch(function (err) { res.send(err); })
    //to sort by order num
});

//manualSortFavorites request--works
router.post('/manualSortFavorites', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    var pointsName = req.body.pointsName;
    for (var i = 0; i < pointsName.length; i++) {
        let orderNumber = i + 1;
        DButilsAzure.execQuery("UPDATE UserFavorites SET orderNumber='" + orderNumber + "' WHERE pointOfInterest='" + pointsName[i] + "' AND userName = '" + userName + "'").then(function (result) {
            res.sendStatus(200);
        }).catch(function (err) {
            res.send(err);
        })
    }
});

//saveFavoriteInServer request--works
router.post('/saveFavoriteInServer', function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    var points = req.body.pointsInterest;
    let maxNumberTime = 1;
    let maxOrderNum = 1;


    DButilsAzure.execQuery("Select Max(numberTime) AS mnt from UserFavorites Where userName='" + userName + "'").then(function (result1) {
        if (result1.length > 0) {
            maxNumberTime = result1[0].mnt + 1;

        }
        else {
            maxNumberTime = 1;
        }
        DButilsAzure.execQuery("Select Max(orderNumber) AS mon from UserFavorites Where userName='" + userName + "'").then(function (result2) {
            if (result1.length == 0) {
                maxOrderNum = 1;
            }
            else
                maxOrderNum = result2[0].mon + 1;
            for (var i = 0; i < points.length; i++) {
                DButilsAzure.execQuery("Select * from UserFavorites Where userName='" + userName + "' AND pointOfInterest='" + points[i] + "'").then(function (result4) {
                    if (result4.length == 0) {

                        DButilsAzure.execQuery("INSERT INTO UserFavorites VALUES ('" + userName + "', '" + points[i] + "', '" + maxNumberTime + "', '" + maxOrderNum + "')").then(function (result3) {
                        });
                        maxNumberTime++;
                        maxOrderNum++;
                    }

                    
                });
              
                res.sendStatus(200);

            }
        }).catch(function (err) { res.status(400).send(err); });

    }).catch(function (err) { res.status(400).send(err); });

});

//costumPopularPoints request--workes
router.get('/costumPopularPoints', function (req, res) {
    var token = req.params.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    var ans = [];
    DButilsAzure.execQuery("Select TOP 2 category from CategoryUsers where userName='" + userName + "'").then(function (result) {
        category1 = result[0].category;
        category2 = result[1].category;
        DButilsAzure.execQuery("Select * from PointsOfInterest where category='" + category1 + "' order by rate desc").then(function (result2) {
            ans[0] = result2[0];
            DButilsAzure.execQuery("Select * from PointsOfInterest where category='" + category2 + "' order by rate desc").then(function (result3) {
                ans[1] = result3[0];
                res.send(ans);
            }).catch(function (err) { res.status(400).send(err); });
        }).catch(function (err) { res.status(400).send(err); });
    }).catch(function (err) { res.status(400).send(err); });
});


//lastSaved request--works
router.get('/lastSavedPoints', function (req, res) {
    var token = req.params.token || req.query.token || req.headers['x-access-token'];
    var decoded = jwt.decode(token, { complete: true });
    req.decoded = decoded;
    var userName = decoded.payload.userName;
    var ans = [];
    DButilsAzure.execQuery("SELECT p.pointName, p.picture, p.description ,p.viewCount,p.lastReviewOne,p.lastReviewTwo FROM (SELECT TOP 2 * FROM UserFavorites Where userName='" + userName + "' order by orderNumber DESC) a JOIN PointsOfInterest p ON a.pointOfInterest=p.pointName").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//addRate request--works
router.post('/addRate', function (req,res) {
    var pointName = req.body.pointName;
    var rate = req.body.rate;
    DButilsAzure.execQuery("Select rate, numberOfRates from PointsOfInterest Where pointName = '" + pointName + "'")
    .then(function (result) {
        if(result.length>0)
        {
            let oldrate=result[0].rate;
            let numberOfRates=result[0].numberOfRates;
            let newRate=((Number(oldrate)*numberOfRates)+Number(rate))/(numberOfRates+1);
            numberOfRates=numberOfRates+1;
            DButilsAzure.execQuery("UPDATE PointsOfInterest SET rate='" + newRate + "', numberOfRates='" + numberOfRates + "' WHERE pointName='" + pointName + "'" ).then(function(result){
                res.sendStatus(200);
            }).catch(function(err){
                res.send(err);
            })
        }
        
    }).catch(function (err) { res.status(400).send(err); });
   
});

//addReview request--works
router.post('/addReview', function (req,res) {
    var pointName = req.body.pointName;
    var review = req.body.review;
    var oldRev2;
    DButilsAzure.execQuery("Select lastReviewTwo from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldRev2=result[0].lastReviewTwo; 
        DButilsAzure.execQuery("UPDATE PointsOfInterest SET lastReviewOne='" + oldRev2 + "', lastReviewTwo='" + review + "' WHERE pointName = '" + pointName + "'" ).then(function(result){
            res.sendStatus(200);
        }).catch(function(err){
            res.send(err);
        })
    }).catch(function (err) { res.status(400).send(err); });
});

module.exports = router;