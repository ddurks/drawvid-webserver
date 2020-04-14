var fs = require('fs');
var pg = require('pg');
var SftpUpload = require('sftp-upload');
var constants = require('../constants');
var conString = "postgres://" + constants.dbConfig.user + ":" + constants.dbConfig.password + "@" + constants.dbConfig.host + ":" + constants.dbConfig.port + "/" + constants.dbConfig.database;
var client = new pg.Client(conString);
client.connect();

var sftp = new SftpUpload(constants.sftpConfig);

sftp.on('error', function(err) {
  console.log(err);
})
.on('uploading', function(progress) {
  console.log('Uploading', progress.file);
  console.log(progress.percent+'% completed');
})
  .on('completed', function() {
  console.log('Upload Completed');
}).upload();

var directoryPath = process.argv[2];
if (directoryPath == null) {
  directoryPath = "/Users/dldurks/Desktop/drawings/pngs/"
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
  var itemsUploaded = 0;
  client.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      itemsUploaded++;
      console.log(res.rows[0])
    }
    itemsProcessed++;
    if(itemsProcessed >= files.length) {
      console.log('processed ' + itemsProcessed + ' files');
      console.log('uploaded ' + itemsUploaded + ' new posts to the DB');
      client.end();
    }
  });
}

var index = 110;
files.forEach(function(file) {
  if (!file.startsWith(".",0)) {
    if (fs.lstatSync(directoryPath + file).isFile()) {
      fileContents = fs.readFileSync(directoryPath + file);
      stats = fs.statSync(directoryPath + file);
      console.log(index, file, stats.birthtime.getTime());
      loadDB(index, file, stats);
      index++;
    }
  }
});
