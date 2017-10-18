module.exports = function(options, callback) {

  var childProcess = require('child_process')
  var path = require('path')

  var scrot = childProcess.spawn(path.join(__dirname, 'bin', process.arch !== 'arm' ? 'scrot' : 'arm', 'scrot'), [options.output])
  scrot.on('close', function(code) {
    if (code !== 0) {
      return callback('scrot failed', null)
    }

    return callback(null, options) // callback with options, in case options added
  })
}