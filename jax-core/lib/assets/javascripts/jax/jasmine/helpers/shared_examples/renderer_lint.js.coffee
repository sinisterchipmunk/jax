sharedExamplesFor "a renderer", ->
  respondTo = (fn) ->
    it "should respond to #{fn}", ->
      expect(@renderer).toHaveFunction fn

  respondTo 'initialize'
  respondTo 'createFramebuffer'
  respondTo 'bindFramebuffer'
  respondTo 'createRenderbuffer'
  respondTo 'bindRenderbuffer'
  respondTo 'renderbufferStorage'
  respondTo 'framebufferRenderbuffer'
  respondTo 'framebufferTexture2D'
  respondTo 'checkFramebufferStatus'
  respondTo 'clear'
  respondTo 'prepare'
  respondTo 'viewport'
  respondTo 'createTexture'
  respondTo 'deleteTexture'
  respondTo 'texParameteri'
  respondTo 'bindTexture'
  respondTo 'pixelStorei'
  respondTo 'hint'
  respondTo 'generateMipmap'
  respondTo 'texImage2D'
