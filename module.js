'use strict'

var path = require('path')
var jimp = require('jimp')
var fs = require('fs')
var capture = require('./capture')

function Screenshot(args) {

  var config = this.parseArgs(args)
  var self = this

  return new Promise(function(resolve, reject) {

    if (capture[process.platform]){
      capture[process.platform](config.options, function(error, options) {
        // TODO add option for string, rather than file
        if (error){
          return reject(error)
        }

        if (!options.output){
          return reject(new Error('No image taken.'))
        }

        self.processImage(options.output, options.output, options, function(error, success) {
          if (error){
            return reject(error)
          }

          resolve(success)
        })
      })
    } else {
      reject(new Error('Unsupported platform ' + process.platform))
    }
  })
    .then(function(success){
      if (config.callback) {
        config.callback(null, success)
      }

      return success
    })
    .catch(function(e) {
      if (config.callback) {
        return config.callback(e)
      }

      throw e
    })
}

Screenshot.prototype.processImage = function(input, output, options, callback) {
  if (!input){
    return callback(new Error('No image to process.'))
  }
  if (typeof options.width !== 'number' && typeof  options.height !== 'number' && typeof options.quality !== 'number') // no processing required
    callback(null)
  else {
    new jimp(input, function (err, image) {

      if (err){
        return callback(err)
      }
      if (!image){
        return callback(new Error('No image received from jimp.'))
      }

      if (typeof options.width === 'number')
        var resWidth = Math.floor(options.width)
      if (typeof options.height === 'number')
        var resHeight = Math.floor(options.height)

      if (typeof resWidth === 'number' && typeof resHeight !== 'number') // resize to width, maintain aspect ratio
        var resHeight = Math.floor(image.bitmap.height * (resWidth / image.bitmap.width))
      else if (typeof resHeight === 'number' && typeof resWidth !== 'number') // resize to height, maintain aspect ratio
        var resWidth = Math.floor(image.bitmap.width * (resHeight / image.bitmap.height))

      try {
        image.resize(resWidth, resHeight)

        if (typeof options.quality === 'number' && options.quality >= 0 && options.quality <= 100)
          image.quality(Math.floor(options.quality)) // only works with JPEGs

        if (options.buffered){
          image.getBuffer(jimp.AUTO, function(error, buffer) {

            if (error) {
              return callback(error)
            }

            fs.unlink(input, function(errorUnlink) {
              callback(errorUnlink, buffer)
            })
          })
        } else {
          image.write(output, callback)
        }
      }
      catch (error) {
        callback(error)
      }
    })
  }
}

Screenshot.prototype.parseArgs = function(args) {
  var config = {options: {}}

  for (var property in args) {
    if (args.hasOwnProperty(property)) {
      switch (typeof args[property]) {
      case 'string':
        var file = args[property]
        break
      case 'function':
        config.callback = args[property]
        break
      case 'object':
        if (args[property] !== null)
          config.options = args[property]
        break
      }
    }
  }

  if (typeof file === 'string'){
    config.options.output = path.normalize(file)
  }

  return config
}

exports = module.exports = Screenshot