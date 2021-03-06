'use strict';

var fs = require('fs');
var os = require('os');
// jshint maxstatements: 20

/**
 * Gets the filesize in bytes,
 * @param {string} filename Path to the file.
 * @returns {number}
 */
function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

module.exports.getFilesizeInBytes = getFilesizeInBytes;

/**
 * Create the upload directory if it doesn't exist.
 */
function setupDir(directory) {
  // if directory doesn't exist, create it
  if (!fs.existsSync(directory)) {
    /* istanbul ignore next */
    // bug: coverage error
    fs.mkdirSync(directory);
  }
}

module.exports.setupDir = setupDir;

function createSampleFile(fileName, data = 'HELLO') {
  var tmpFile = os.tmpDir() + '/' + fileName;
  fs.writeFileSync(tmpFile, data);
  return tmpFile;
}

module.exports.createSampleFile = createSampleFile;

/**
 * Gets the time since a date object in a human readable form.
 * @param {date} date Date object.
 * @returns {string} Human readable time diff.
 */
function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) { return interval + ' years'; }
  interval = Math.floor(seconds / 2592000);

  if (interval > 1) { return interval + ' months'; }
  interval = Math.floor(seconds / 86400);

  if (interval > 1) { return interval + ' days'; }
  interval = Math.floor(seconds / 3600);

  if (interval > 1) { return interval + ' hours'; }
  interval = Math.floor(seconds / 60);

  if (interval > 1) { return interval + ' minutes'; }
  return Math.floor(seconds) + ' seconds';
}

/**
 * Gets the time since an object id  in a human readable form.
 * @param {objectId} objectId Mongo object id.
 * @returns {string} Human readable time diff.
 */
function objectIdAgo(objectId) {

  var dateFromObjectId = function(objectId) {
    return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
  };

  var dateObj = dateFromObjectId(objectId);
  return timeSince(dateObj) + ' ago';
}

/**
 * Returns of list of images with the time since they were created added.
 * @param {mongoose.model} imageList List of images.
 * @returns {list} List of images with `ago` field.
 */
function addTimeAgo(imageList) {
  for (var image in imageList) {
    var timeAgo = objectIdAgo(imageList[image].imageId.toString());
    imageList[image].ago = timeAgo;
  }

  return imageList;
}

module.exports.addTimeAgo = addTimeAgo;
