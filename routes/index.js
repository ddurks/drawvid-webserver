var express = require('express');
var pg = require('pg');
var constants = require('../constants');
var conString = "postgres://" + constants.dbConfig.user + ":" + constants.dbConfig.password + "@localhost:" + constants.dbConfig.port + "/" + constants.dbConfig.database;

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

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'drawvid.com: about' });
});

/* GET archives page. */
router.get('/archives', function(req, res, next) {
  res.render('archives', { title: 'drawvid.com: archives' });
});

/* GET gallery page. */
router.get('/gallery', function(req, res, next) {
  res.render('gallery', { title: 'drawvid.com: gallery' });
});

router.get('/fetchpost', function(req, res, next){
  var post = 'latest';
  if (req.query.post) {
    post = req.query.post
  }
  client.query('SELECT * FROM posts ORDER BY id DESC')
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
      case 'all':
        res.status(200).send(data.rows);
        return;
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
