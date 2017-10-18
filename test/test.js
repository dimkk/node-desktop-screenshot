/*eslint-env mocha*/
'use strict'

var screenshot = require('../module')
var assert = require('assert')

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1, 2, 3].indexOf(4))
    })
  })
})

screenshot('fullscreen.png')
  .then(function() {console.log('fullscreen succesful')})
  .catch(function(){console.error('fullscreen failed!')})