var fs = require('fs');
var pg = require('pg');
var conString = "postgres://drawvid:drawvid1@localhost:5432/postgres";
var client = new pg.Client(conString);
client.connect();

var directoryPath = process.argv[2];
if (directoryPath == null) {
  directoryPath = "../posts/"
}
var itemsProcessed = 0;

var files = fs.readdirSync(directoryPath);
files = files.map(function (fileName) {
  return {
    name: fileName,
    time: fs.statSync(directoryPath + fileName).birthtime.getTime()
  };
})
.sort(function (a, b) {
  return a.time - b.time; })
.map(function (v) {
  return v.name; });

function loadDB(num, file, stats) {
  const text = 'INSERT INTO posts(id, image_name, created_date) VALUES($1, $2, to_timestamp($3 / 1000.0)) RETURNING *'
  const values = [num, file, stats.birthtime.getTime()];
  client.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
      itemsProcessed++;
      if(itemsProcessed === files.length) {
        client.end();
      }
    }
  });
}

var index = 0;
files.forEach(function(file) {
  if (!file.startsWith(".",0)) {
    if (fs.lstatSync(directoryPath + file).isFile()) {
      fileContents = fs.readFileSync(directoryPath + file);
      stats = fs.statSync(directoryPath + file);
      //console.log(index, file, stats.birthtime.getTime());
      loadDB(index, file, stats);
      index++;
    }
  }
});
