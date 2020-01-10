var express = require('express');
var router = express.Router();
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'drawvid.com' });
});

router.get('/fetchpost', function(req, res, next) {
  var post = 'latest';
  if (req.query.post) {
    post = req.query.post
  }
  var params = {    
    TableName: 'drawvid-posts'
  };

  new Promise((resolve, reject) => {
    ddb.scan(params, (error, data) => {
      if (error) {
        console.log(`ERROR=${error.stack}`);
        resolve(null);
  
      } else {
        //console.log(`data=${JSON.stringify(data)}`);
        resolve(data.Items.length);
      }
    });
  }).then(function(totalPosts) {
    if (totalPosts) {
      var index;
      switch(post) {
        case 'latest':
          index = totalPosts - 1;
          break;
        case 'random':
          index = getRandomInt(totalPosts - 1);
          break;
        default:
          index = post
      }
      params = {
        TableName: 'drawvid-posts',
        ExpressionAttributeValues: {
          ':num': {N: index.toString()},
        },
        KeyConditionExpression: 'num = :num'
      }
      return new Promise((resolve, reject) => {
        ddb.query(params, (error, data) => {
          if (error) {
            console.log(`ERROR=${error.stack}`);
            res.send({ drawing: null });
          } else {
            console.log(`POST=${JSON.stringify(data)}`);
            var drawing = data.Items[0];
            res.send({ drawing: drawing})
          }
        });
      })
    }
  });
})

module.exports = router;
