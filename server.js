//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//complete your code here

//login post request
app.post('/login', function (req, res) {
    var nameUser = req.body.userName;
    var password = req.body.password;
    DButilsAzure.Select("Select * from Users Where userName='" + nameUser + "' AND password='" + password + "'  ").then(function (result) {
        if (result.length > 0) {
            res.send(true);

        } else {
            res.send(false);
        }
    }).catch(function (err) { res.status(400).send(err); });

    res.send("done");

})

//register post request
app.post('/register', function (req, res) {
    var username = req.body[0].userName;
    var password = req.body[0].password;
    var firstName = req.body[0].firstName;
    var lastName = req.body[0].lastName;
    var city = req.body[0].city;
    var country = req.body[0].country;
    var email = req.body[0].email;
    var passwordRecoveryAnswer = req.body[0].passwordRecoveryAnswer;

    DButilsAzure.execQuery("INSERT INTO [Users] ( [userName], [password],[firstName],[lastName],[city],[country],[email],[passwordRecoveryAnswer]) VALUES (username,password,firstName,lastName,city,country,email,passwordRecoveryAnswer)").then(function (result) {
        res.send(result)
    }).catch(function (err) {
        console.log(err)
    })

    //to return boolean feedback to user
});

//password recovery request
app.post('/passwordRecovery', function (req, res, next) {
    var name = req.body.userName;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;
    DButilsAzure.Select("Select [password] from Users Where userName = '" + name + "' AND passwordRecoveryAnswer = '" + passwordRecoveryAnswer + "'")
        .then(function (result) {
            if (result[0] == string.empty())
                res.status(400).send();
            else
                res.send(result[0]);
        }).catch(function (err) { res.status(400).send(err); });
});

//new explore request
app.get('/newExplore', function (req, res, next) {
    var minRate = req.body.minRate;
    DButilsAzure.Select("SELECT * FROM PointsOfInterest Where rate>='" + minRate + "'").then(function (result) {
        if (result[0] == string.empty())
            res.status(400).send();
        else {
            var size = result.size;
            var rand1 = Math.floor((Math.random() * size) + 1) + 1;
            var rand2 = Math.floor((Math.random() * size) + 1) + 1;
            while (rand2 == rand1) {
                var rand2 = Math.floor((Math.random() * size) + 1) + 1;
            }
            var rand3 = Math.floor((Math.random() * size) + 1) + 1;
            while (rand3 == rand1 || rand3 == rand2) {
                var rand3 = Math.floor((Math.random() * size) + 1) + 1;
            }
            var ans = {};
            ans[0] = result[rand1];
            ans[1] = result[rand2];
            ans[2] = result[rand3];
            res.send(ans);
        }
    }).catch(function (err) { res.status(400).send(err); });
});

//costumPopularPoints request
app.get('/getAllPoints', function (req, res, next) {
    var userName=req.userName;
    DButilsAzure.Select("Select TOP 2 [pointName][picture][viewCount][description][category][rate][lastReviewOne][lastReviewTwo] From CategoryUsers INNER JOIN PointsOfInterest ON CategoryUsers.category = PointsOfInterest.category WHERE CategoryUsers.userName = '" + userName + "'" )
    .then(function (result) {
        res.send(result);
    }).catch(function(err){ res.status(400).send(err);});
});


//getAllPoints request
app.get('/getAllPoints', function (req, res, next) {
    DButilsAzure.Select("Select * from PointsOfInterest").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//filterByCategory request
app.get('/filterByCategory', function (req, res) {
    var category = req.body.category;
    DButilsAzure.Select("Select * from PointsOfInterest Where category = '" + category + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//showPoint request
app.get('/showPoint', function (req, res) {
    var pointName = req.body.pointName;
    DButilsAzure.Select("Select * from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});


//addView
app.put('/addView', function (req, res) {
    var pointName = req.body.pointName;
    DButilsAzure.Select("Select [viewCount] from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) 
    {
        var viewCount=result[0]+1;
        DButilsAzure.UPDATE("UPDATE PointsOfInterest SET viewCount='" + viewCount + "' WHERE pointName = '" + pointName + "'" );
    }).catch(function (err) { res.status(400).send(err); });

});


//removePointFromFavorite request
app.delete('/removePointFromFavorite', function (req,res) {
    var pointName = req.body.pointName;
    var userName=req.body.userName;
    DButilsAzure.Delete("DELETE from [UserFavorites] WHERE [pointOfInterest] = '" + pointName + " ' AND [userName] = '" + userName+ "'").then(function (result) {
        res.status(200).send('Delete succeeded');
    }).catch(function(err){ res.status(400).send(err);});
});

//showFavoritePoint request
app.get('/showFavoritePoint', function (req,res) {
    var userName = req.body.userName;
    DButilsAzure.Select("Select [pointName][picture][viewCount][description][category][rate][lastReviewOne][lastReviewTwo] From UserFavorites INNER JOIN PointsOfInterest ON UserFavorites.userName = PointsOfInterest.userName")
        .then(function (result) {
            res.send(result);
        }).catch(function(err){ res.status(400).send(err);});
        //to sort by order num
});

//manualSortFavorites request
app.get('/manualSortFavorites', function (req,res) {
    var userName = req.body.userName;
    var pointsName = req.body.pointsName;
    for(var i=0;i<pointsName.size;i++)
    {
        DButilsAzure.UPDATE("UPDATE UserFavorites SET orderNumber='" + i + "' WHERE pointName = '" + pointsName[i] + "' AND userName = '" + userName + "'" );

    }
});

//saveFavoriteInServer request
app.post('/saveFavoriteInServer', function (req, res, next) {
    var name = req.body.userName;
    var points = req.body.pointsInterest;
    var maxNumberTime;
    var maxOrderNum;
    DButilsAzure.Select("Select Max(numberTime) from UserFavorites Where userName = '" + name + "'").then(function (result) {
        maxNumberTime=result[0]+1;
    }).catch(function (err) { res.status(400).send(err); });
    DButilsAzure.Select("Select Max(orderNumber) from UserFavorites Where userName = '" + name + "'").then(function (result) {
        maxOrderNum=result[0]+1; 
    }).catch(function (err) { res.status(400).send(err); });
    for(var i=0;i<points.size;i++)
    {
        DButilsAzure.execQuery("INSERT INTO [UserFavorites] ( [userName], [pointOfInterest],[numberTime],[orderNumber]) VALUES (name,points[i],maxNumberTime,maxOrderNum)").then(function (result) {
            maxNumberTime++;  
            maxOrderNum++;
    });
}

});

//addRate request
app.post('/addRate', function (req,res) {
    var pointName = req.body.pointName;
    var rate = req.body.rate;
    var newRate;
    var oldrate;
    var numberOfRates;
    DButilsAzure.Select("Select [rate][numberOfRates] from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldrate=result[0].rate;
        numberOfRates=result[0].numberOfRates;
    }).catch(function (err) { res.status(400).send(err); });
    newRate=((oldrate*numberOfRates)+rate)/(numberOfRates+1);
    numberOfRates++;
    DButilsAzure.UPDATE("UPDATE PointsOfInterest SET rate='" + newRate + "' AND numberOfRates='" + numberOfRates + "' WHERE pointName = '" + pointName + "'" );
});

//addReview request
app.post('/addReview', function (req,res) {
    var pointName = req.body.pointName;
    var review = req.body.review;
    var oldRev2;
    DButilsAzure.Select("Select lastReviewTwo from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldRev2=result[0]; 
    }).catch(function (err) { res.status(400).send(err); });
    DButilsAzure.UPDATE("UPDATE PointsOfInterest SET lastReviewOne='" + oldRev2 + "' AND lastReviewTwo='" + review + "' WHERE pointName = '" + pointName + "'" );
});

//getAllCategories request
app.get('/categories', function (req, res) {
    DButilsAzure.execQuery("Select * from Categories").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});


var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


