module.exports = function(options, callback) {

  var childProcess = require('child_process')
  var path = require('path')

  var nircmd = childProcess.spawn(path.join(__dirname, 'bin', 'nircmd.exe'), ['savescreenshot', options.output])

  nircmd.on('close', function(code) {
    if (code !== 0) {
      return callback('nircmd failed', null)
    }

    return callback(null, options) // callback with options, in case options added
  })
}