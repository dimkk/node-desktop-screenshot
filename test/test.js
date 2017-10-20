/*eslint-env mocha*/
'use strict'

var screenshot = require('../module')
var del = require('del')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
var fs = require('fs')

chai.should()
chai.use(chaiAsPromised)

var tempfile = __dirname + 'buffered.png'

function checkFile(file) {
  return function() {
    return new Promise(function(resolve, reject) {
      fs.stat(file, function(err, stats) {
        if (err) {
          return reject(err)
        }

        return resolve(stats)
      })
    })
  }
}

describe('Screenshot()', function() {
  describe('check args', function() {
    it('should throw an exeception when the output is not present', function() {
      return screenshot({}).should.be.rejectedWith(Error, 'there is not configured output')
    })
    it('should throw an exeception when the output format is incorrect', function() {
      return screenshot({output: 'somepath.tiff'}).should.be.rejectedWith(Error, 'The library only support png, jpeg and bpm output formats')
    })
    it('should throw an exeception when the width is not a number', function() {
      return screenshot({output: tempfile, buffered: true, width:'something'}).should.be.rejectedWith(Error, 'the width must be a number or nothing')
    })
    it('should throw an exeception when the height is not a number', function() {
      return screenshot({output: tempfile, buffered: true, height:'something'}).should.be.rejectedWith(Error, 'the height must be a number or nothing')
    })
    it('should throw an exeception when the quality is not a number', function() {
      return screenshot({output: tempfile, buffered: true, quality:'something'}).should.be.rejectedWith(Error, 'the quality must be a number beetween 0 to 100 or nothing')
    })
    it('should throw an exeception when the quality less than 0', function() {
      return screenshot({output: tempfile, buffered: true, quality:-1}).should.be.rejectedWith(Error, 'the quality must be a number beetween 0 to 100 or nothing')
    })
    it('should throw an exeception when the quality greater than 100', function() {
      return screenshot({output: tempfile, buffered: true, quality:101}).should.be.rejectedWith(Error, 'the quality must be a number beetween 0 to 100 or nothing')
    })
  })

  describe('buffered', function() {
    it('get a buffer', function() {
      return screenshot({output: tempfile, buffered: true})
        .should.eventually.be.instanceof(Buffer)
    })
    it('get a buffer of BMP', function() {
      return screenshot({output: tempfile + '.bmp', buffered: true})
        .should.eventually.be.instanceof(Buffer)
    })
    it('get buffer but not file', function() {
      return screenshot({output: tempfile, buffered: true})
        .then(checkFile(tempfile)).should.be.rejectedWith(Error, 'ENOENT: no such file or directory')
    })
  })

  describe('takesnapshot', function() {
    it('get full screen snapshot PNG', function() {
      var file = __dirname + '/fullscreen.png'
      return screenshot({output: file})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    it('get full screen snapshot JPG', function() {
      var file = __dirname + '/fullscreen.jpg'
      return screenshot({output: file})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    it('get full screen snapshot BMP', function() {
      var file = __dirname + '/fullscreen.bmp'
      return screenshot({output: file})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    it('get full screen snapshot PNG 240X320', function() {
      var file = __dirname + '/fullscreen240X320.png'
      return screenshot({output: file, width:320, height: 240})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    it('get full screen snapshot BMP 240X320', function() {
      var file = __dirname + '/fullscreen240X320.jpg'
      return screenshot({output: file, width:320, height: 240})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    if (process.platform !== 'darwin') {
      it('get full screen snapshot BMP 240X320', function() {
        var file = __dirname + '/fullscreen240X320.bmp'
        return screenshot({output: file, width:320, height: 240})
          .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
      })
    }
  })
})

if (process.platform !== 'darwin') {
  describe('darwin', function() {
    // due to bug in jpgjs processing OSX jpg images https://github.com/notmasteryet/jpgjs/issues/34
    // when requesting JPG capture as PNG, so JIMP can read it
    /* the previuos error seems already corrected */
    it('get full screen snapshot in JPG format over darwin', function() {
      var file = __dirname + '/fullscreen.jpg'
      return screenshot({output: file})
        .then(checkFile(file)).should.eventually.be.instanceof(fs.Stats)
    })
    //it('get snapshot BMP with rezise process throw an error - bmp top-down and none-alpha', function() {
    //  var file = __dirname + '/fullscreen240X320.bmp'
    //  return screenshot({output: file, width:320, height: 240})
    //    .should.be.rejectedWith(Error, 'bit decode error:RangeError: "size" argument must not be larger than 2147483647')
    //})
  })
}

after(function() {
  return del([__dirname + '/' + '*', '!' + __dirname + '/' + 'test.js']/*, {dryRun: true}*/)
})