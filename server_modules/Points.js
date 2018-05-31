var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var DButilsAzure = require('../DButils');

const secret="secret";

//new explore request--works
router.get('/newExplore/:minRate', function (req, res) {
    var minRate = req.params.minRate;
    DButilsAzure.execQuery("SELECT * FROM PointsOfInterest Where rate >=" + minRate).then(function (result) {
        if (result.length==0)
            res.status(400).send();
        else {
            var size = result.length;
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


//getAllCategories request--works
router.get('/categories', function (req, res) {
    DButilsAzure.execQuery("SELECT * from Categories").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});
module.exports=router;