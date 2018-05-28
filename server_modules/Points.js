var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

const secret="secret";

//new explore request----------------------------------------------------------------------------------------------------------
router.get('/Points/newExplore/:minRate', function (req, res) {
    var minRate = req.params.minRate;
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest Where rate >=" + minRate).then(function (result) {
        if (result[0] == string.empty())
            res.status(400).send();
        else {
            var size = result.size;
            if(size<=3)
            {
                res.send(result);
            }
            var rand1 = Math.floor((Math.random() * size));
            var rand2 = Math.floor((Math.random() * size));
            while (rand2 == rand1) {
                var rand2 = Math.floor((Math.random() * size));
            }
            var rand3 = Math.floor((Math.random() * size));
            while (rand3 == rand1 || rand3 == rand2) {
                var rand3 = Math.floor((Math.random() * size));
            }
            var ans = {};
            ans[0] = result[rand1];
            ans[1] = result[rand2];
            ans[2] = result[rand3];
            res.send(ans);
        }
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//costumPopularPoints request--workes
router.get('/costumPopularPoints/:userName', function (req, res) {
    var userName=req.params.userName;
    DButilsAzure.execQuery("Select TOP 2 pointName, picture, viewCount, description,PointsOfInterest.category,rate,lastReviewOne,lastReviewTwo From CategoryUsers INNER JOIN PointsOfInterest ON CategoryUsers.category = PointsOfInterest.category WHERE CategoryUsers.userName = '" + userName + "'" )
    .then(function (result) {
        res.send(result);
    }).catch(function(err){ res.status(400).send(err);});
});

//getAllPoints request--works
router.get('/getAllPoints', function (req, res) {
    DButilsAzure.execQuery("Select * from PointsOfInterest")
    .then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//filterByCategory request--works
router.get('/filterByCategory/:category', function (req, res) {
    var category = req.params.category;
    DButilsAzure.execQuery("Select * from PointsOfInterest Where category = '" + category + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//showPoint request--works
router.get('/showPoint/:pointName', function (req, res) {
    var pointName = req.params.pointName;
    DButilsAzure.execQuery("Select * from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});


//addView--works
router.put('/addView/:pointName', function (req, res) {
    var pointName = req.params.pointName;
    DButilsAzure.execQuery("Select * from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) 
    {
        var count=result[0].viewCount+1;
        DButilsAzure.execQuery("UPDATE PointsOfInterest SET viewCount='" + count + "' WHERE pointName = '" + pointName + "'");
    }).catch(function (err) { res.status(400).send(err); });
});

//addRate request
router.post('/addRate', function (req,res) {
    var pointName = req.body.pointName;
    var rate = req.body.rate;
    var newRate;
    var oldrate;
    var numberOfRates;
    DButilsAzure.execQuery("Select [rate][numberOfRates] from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldrate=result[0].rate;
        numberOfRates=result[0].numberOfRates;
    }).catch(function (err) { res.status(400).send(err); });
    newRate=((oldrate*numberOfRates)+rate)/(numberOfRates+1);
    numberOfRates++;
    DButilsAzure.execQuery("UPDATE PointsOfInterest SET rate='" + newRate + "' AND numberOfRates='" + numberOfRates + "' WHERE pointName = '" + pointName + "'" );
});

//addReview request
router.post('/addReview', function (req,res) {
    var pointName = req.body.pointName;
    var review = req.body.review;
    var oldRev2;
    DButilsAzure.execQuery("Select lastReviewTwo from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldRev2=result[0]; 
    }).catch(function (err) { res.status(400).send(err); });
    DButilsAzure.execQuery("UPDATE PointsOfInterest SET lastReviewOne='" + oldRev2 + "' AND lastReviewTwo='" + review + "' WHERE pointName = '" + pointName + "'" );
});

//getAllCategories request
router.get('/categories', function (req, res) {
    DButilsAzure.execQuery("SELECT * from Categories").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});
module.exports=router;