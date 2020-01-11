var express = require('express');
var pg = require('pg');
var conString = "postgres://" + dbConfig.user + ":" + dbConfig.password + "@localhost:" + dbConfig.port + "/" + dbConfig.database;

var client = new pg.Client(conString);
client.connect();

var router = express.Router();

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'drawvid.com' });
});

router.get('/fetchpost', function(req, res, next){
  var post = 'latest';
  if (req.query.post) {
    post = req.query.post
  }
  client.query('SELECT * FROM posts ORDER BY id DESC LIMIT 1')
  .then(data => {
    var drawing = data.rows[0];
    var index = drawing.id;
    switch(post) {
      case 'latest':
        res.status(200).send(drawing);
        return;
      case 'random':
        index = getRandomIndex(drawing.id);
        break;
      default:
        index = post;
    }
    console.log("SELECT * FROM POSTS WHERE id='" + index + "'");
    client.query("SELECT * FROM POSTS WHERE id='" + index + "'")
    .then(data => res.status(200).send(data.rows[0]))
    .catch(e => console.error(e.stack));
  })
  .catch(e => console.error(e.stack));
});

module.exports = router;
