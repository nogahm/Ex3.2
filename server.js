//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var jwt=require('jsonwebtoken');
app.use(cors());
var DButilsAzure = require('./DButils');
//var Users = require('./server_modules/Users'); // get our users model
//var poi = require('./server_modules/POI');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//complete your code here

//users module
//login post request
app.post('/Users/login', function (req, res) {
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

//register post request
app.post('/Users/register', function (req, res) {
    var username = req.body.userName;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var city = req.body.city;
    var country = req.body.country;
    var email = req.body.email;
    var passwordRecoveryAnswer = req.body.passwordRecoveryAnswer;

    
DButilsAzure.execQuery("INSERT INTO Users (userName,password,firstName,lastName,city,country,email,passwordRecoveryAnswer) VALUES ('"+req.body.userName+"', '"+req.body.password+"','"+req.body.firstName+"', '"+req.body.lastName+"', '"+req.body.city+"', '"+req.body.country+"','"+req.body.email+"', '"+req.body.passwordRecoveryAnswer+"')").then(function (result) {
        res.send(result)
    }).catch(function (err) {
        console.log(err)
    })

    //return boolean feedback to user
});

//password recovery request
app.post('/Users/passwordRecovery', function (req, res, next) {
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

//Points module
//new explore request
app.get('/Points/newExplore/:minRate', function (req, res) {
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

//costumPopularPoints request
app.get('/Points/costumPopularPoints/:userName', function (req, res) {
    var userName=req.params.userName;
    DButilsAzure.execQuery("Select TOP 2 pointName, picture, viewCount, description,PointsOfInterest.category,rate,lastReviewOne,lastReviewTwo From CategoryUsers INNER JOIN PointsOfInterest ON CategoryUsers.category = PointsOfInterest.category WHERE CategoryUsers.userName = '" + userName + "'" )
    .then(function (result) {
        res.send(result);
    }).catch(function(err){ res.status(400).send(err);});
});


//getAllPoints request
app.get('/Points', function (req, res) {
    DButilsAzure.execQuery("Select * from PointsOfInterest")
    .then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//filterByCategory request
app.get('/Points/filterByCategory/:category', function (req, res) {
    var category = req.params.category;
    DButilsAzure.execQuery("Select * from PointsOfInterest Where category = '" + category + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

//showPoint request
app.get('/Points/showPoint/:pointName', function (req, res) {
    var pointName = req.params.pointName;
    DButilsAzure.execQuery("Select * from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});


//addView
app.put('/Points/addView', function (req, res) {
    var pointName = req.body.pointName;
    DButilsAzure.execQuery("Select [viewCount] from PointsOfInterest Where pointName = '" + pointName + "'").then(function (result) 
    {
        var viewCount=result[0]+1;
        DButilsAzure.execQuery("UPDATE PointsOfInterest SET viewCount='" + viewCount + "' WHERE pointName = '" + pointName + "'" );
    }).catch(function (err) { res.status(400).send(err); });

});

//Favorites
//removePointFromFavorite request
app.delete('/Favorites/removePointFromFavorite', function (req,res) {
    var pointName = req.body.pointName;
    var userName=req.body.userName;
    DButilsAzure.execQuery("DELETE from [UserFavorites] WHERE [pointOfInterest] = '" + pointName + " ' AND [userName] = '" + userName+ "'").then(function (result) {
        res.status(200).send('Delete succeeded');
    }).catch(function(err){ res.status(400).send(err);});
});

//showFavoritePoint request
app.get('/Favorites/:userName', function (req,res) {
    var userName = req.params.userName;
    console.log(userName);
    DButilsAzure.execQuery("Select pointName, picture, viewCount, description,PointsOfInterest.category,rate,lastReviewOne,lastReviewTwo From UserFavorites INNER JOIN PointsOfInterest ON UserFavorites.pointOfInterest = PointsOfInterest.pointName AND UserFavorites.userName = '" + userName+ "'")
        .then(function (result) {
            res.send(result);
        }).catch(function(err){ res.send(err);})
        //to sort by order num
});

//manualSortFavorites request
app.get('/Favorites/manualSortFavorites', function (req,res) {
    var userName = req.params.userName;
    var pointsName = req.params.pointsName;
    for(var i=0;i<pointsName.size;i++)
    {
        DButilsAzure.execQuery("UPDATE UserFavorites SET orderNumber='" + i + "' WHERE pointName = '" + pointsName[i] + "' AND userName = '" + userName + "'" );
    }
});

//saveFavoriteInServer request
app.post('/Favorites/saveFavoriteInServer', function (req, res, next) {
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
    DButilsAzure.execQuery("Select [rate][numberOfRates] from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldrate=result[0].rate;
        numberOfRates=result[0].numberOfRates;
    }).catch(function (err) { res.status(400).send(err); });
    newRate=((oldrate*numberOfRates)+rate)/(numberOfRates+1);
    numberOfRates++;
    DButilsAzure.execQuery("UPDATE PointsOfInterest SET rate='" + newRate + "' AND numberOfRates='" + numberOfRates + "' WHERE pointName = '" + pointName + "'" );
});

//addReview request
app.post('/addReview', function (req,res) {
    var pointName = req.body.pointName;
    var review = req.body.review;
    var oldRev2;
    DButilsAzure.execQuery("Select lastReviewTwo from pointOfInterest Where pointName = '" + pointName + "'").then(function (result) {
        oldRev2=result[0]; 
    }).catch(function (err) { res.status(400).send(err); });
    DButilsAzure.execQuery("UPDATE PointsOfInterest SET lastReviewOne='" + oldRev2 + "' AND lastReviewTwo='" + review + "' WHERE pointName = '" + pointName + "'" );
});

//getAllCategories request
app.get('/categories', function (req, res) {
    DButilsAzure.execQuery("SELECT * from Categories").then(function (result) {
        res.send(result);
    }).catch(function (err) { res.status(400).send(err); });
});

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});
//-------------------------------------------------------------------------------------------------------------------


