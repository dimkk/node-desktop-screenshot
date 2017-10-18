module.exports = function(options, callback) {
  var path = require('path')
  var childProcess = require('child_process')

  // due to bug in jpgjs processing OSX jpg images https://github.com/notmasteryet/jpgjs/issues/34
  // when requesting JPG capture as PNG, so JIMP can read it
  /* the previuos error seems already corrected */
  capture(options.output, callbackReturn) // when jpegjs bug fixed, only need this line

  function callbackReturn(error) {
    // called from capture
    // callback with options, in case options added
    callback(error, options)
  }

  function capture(output, callback) {
    var cmd = 'screencapture'
    var args = [
      // will create PNG by default
      '-t',
      path.extname(output).toLowerCase().substring(1),
      '-x',
      output
    ]

    if (!options.multi) {
      args.pop('-m')
    }

    var captureChild = childProcess.spawn(cmd, args)

    captureChild.on('close', function(error) {
      if (error)
        callback(error.toString())
      else
        callback()
    })

    captureChild.stderr.on('data', function(data) {
      callback(data.toString())
    })
  }
}