var express = require('express');
var app = express();

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mongoose = require('mongoose');


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

function getFilesizeInBytes(filename) {
 var stats = fs.statSync(filename)
 var fileSizeInBytes = stats["size"]
 return fileSizeInBytes
}

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files
  // in a single request
  form.multiples = true;

  // generate a unique bucket id
  var bucketId = mongoose.Types.ObjectId();

  // store all uploads in the /uploads/bucket_id directory
  bucketDir = '/uploads/' + bucketId;
  form.uploadDir = path.join(__dirname, bucketDir);

  // if /uploads/bucket_id directory doesn't exist, create it
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir)
  }

  var totalFileSize = 0;

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    totalFileSize += getFilesizeInBytes(file.path);
  });


  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end(JSON.stringify({
      bucketId: bucketId,
      totalFileSize: totalFileSize})
    );
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

app.use('/uploads', express.static('./uploads'));

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});

app.get('/bucket/:bucketId', function(req, res){
  bucketId = req.params.bucketId
  console.log(bucketId)

  var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

  };

  result = _getAllFilesFromFolder(__dirname + "\\uploads\\" + bucketId);
  console.log(result)

  res.sendFile(path.join(__dirname, 'views/bucket.html'));
});
