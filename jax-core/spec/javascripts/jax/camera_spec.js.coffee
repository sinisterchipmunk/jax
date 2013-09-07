describe 'Jax.Camera', ->
  beforeEach ->
    @out = vec3.create()
    @camera = new Jax.Camera

  describe 'by default', ->
    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [0, 0, 0]).toEqualVector [0, 0, 0]
      expect(@camera.transformWorld3 @out, [0, 0,-1]).toEqualVector [0, 0,-1]
      expect(@camera.transformWorld3 @out, [0, 1, 0]).toEqualVector [0, 1, 0]
      expect(@camera.transformWorld3 @out, [1, 0, 0]).toEqualVector [1, 0, 0]

    it 'transformWorld4', ->
      @out = vec4.create()
      expect(@camera.transformWorld4 @out, [0, 0, 0, 1]).toEqualVector [0, 0, 0, 1]
      expect(@camera.transformWorld4 @out, [0, 0,-1, 1]).toEqualVector [0, 0,-1, 1]
      expect(@camera.transformWorld4 @out, [0, 1, 0, 1]).toEqualVector [0, 1, 0, 1]
      expect(@camera.transformWorld4 @out, [1, 0, 0, 1]).toEqualVector [1, 0, 0, 1]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [0, 0, 0]
      expect(@camera.transformEye3 @out, [0, 0,-1]).toEqualVector [0, 0,-1]
      expect(@camera.transformEye3 @out, [0, 1, 0]).toEqualVector [0, 1, 0]
      expect(@camera.transformEye3 @out, [1, 0, 0]).toEqualVector [1, 0, 0]

    it 'transformEye4', ->
      @out = vec4.create()
      expect(@camera.transformEye4 @out, [0, 0, 0, 1]).toEqualVector [0, 0, 0, 1]
      expect(@camera.transformEye4 @out, [0, 0,-1, 1]).toEqualVector [0, 0,-1, 1]
      expect(@camera.transformEye4 @out, [0, 1, 0, 1]).toEqualVector [0, 1, 0, 1]
      expect(@camera.transformEye4 @out, [1, 0, 0, 1]).toEqualVector [1, 0, 0, 1]

  describe 'lookAt', ->
    beforeEach -> @camera.lookAt [5, 5, 5], [5, 5, 6], [0, -1, 0]

    it 'rotateEye3', ->
      expect(@camera.rotateEye3 @out, [0, 0, 1]).toEqualVector [0, 0, -1]

    it 'rotateWorld3', ->
      expect(@camera.rotateEye3 @out, [0, 0, -1]).toEqualVector [0, 0, 1]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [5, 5, 5]

    it 'orientation', ->
      expect(@camera.get('position')).toEqualVector [5, 5, 5]
      expect(@camera.get('direction')).toEqualVector [0, 0, 1]
      expect(@camera.get('up')).toEqualVector [0, -1, 0]
      expect(@camera.get('right')).toEqualVector [1, 0, 0]

  describe 'setDirection', ->
    beforeEach ->
      @camera.setDirection [1, 0, 0]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, -1]).toEqualVector [1, 0, 0]
      expect(@camera.transformEye3 @out, [0, 1,  0]).toEqualVector [0, 1, 0]
      expect(@camera.transformEye3 @out, [1, 0,  0]).toEqualVector [0, 0, 1]

  describe 'setPosition', ->
    beforeEach ->
      @camera.yaw Math.deg2rad 90
      @camera.setPosition [10, 10, 10]

    it 'should set position in world space regardless of eye direction', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [10, 10, 10]

  describe 'moving 10 units', ->
    beforeEach -> @camera.move 10

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [0, 0, -10]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [0, 0, -10]).toEqualVector [0, 0, 0]

  describe 'strafing 10 units', ->
    beforeEach -> @camera.strafe 10

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [10, 0, 0]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [10, 0, 0]).toEqualVector [0, 0, 0]

  describe 'translating', ->
    beforeEach -> @camera.translate [10, 11, 12]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [10, 11, 12]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [10, 11, 12]).toEqualVector [0, 0, 0]

  describe 'arbitrary rotation in eye space', ->
    beforeEach ->
      @camera.yaw Math.deg2rad(90)
      @camera.rotate Math.deg2rad(90), [0, 0, -1]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 1, 0]).toEqualVector [0, 0, -1]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [0, 0, -1]).toEqualVector [0, 1, 0]

  describe 'arbitrary rotation in world space', ->
    beforeEach ->
      @camera.yaw Math.deg2rad(90)
      @camera.rotateWorld Math.deg2rad(90), [0, 0, -1]

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 1, 0]).toEqualVector [1, 0, 0]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [1, 0, 0]).toEqualVector [0, 1, 0]

  describe 'rolling 90 degrees', ->
    beforeEach -> @camera.roll Math.deg2rad 90

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 1, 0]).toEqualVector [-1, 0, 0]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [-1, 0, 0]).toEqualVector [0, 1, 0]

  describe 'pitching 90 degrees', ->
    beforeEach -> @camera.pitch Math.deg2rad 90

    it 'transformEye3', ->
      expect(@camera.transformEye3 @out, [0, 1, 0]).toEqualVector [0, 0, 1]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [0, 0, 1]).toEqualVector [0, 1, 0]

  describe 'yawing 90 degrees', ->
    beforeEach -> @camera.yaw Math.deg2rad(90)

    it 'should face along the negative world X', ->
      expect(@camera.transformEye3 @out, [0, 0, -1]).toEqualVector [-1, 0, 0]

    it 'transformWorld3', ->
      expect(@camera.transformWorld3 @out, [-1, 0, 0]).toEqualVector [0, 0, -1]

    describe 'moving 10 units', ->
      beforeEach -> @camera.move 10

      it 'transformEye3', ->
        expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [-10, 0, 0]

      it 'transformWorld3', ->
        expect(@camera.transformWorld3 @out, [-10, 0, 0]).toEqualVector [0, 0, 0]

    describe 'strafing 10 units', ->
      beforeEach -> @camera.strafe 10

      it 'transformEye3', ->
        expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [0, 0, -10]

      it 'transformWorld3', ->
        expect(@camera.transformWorld3 @out, [0, 0, -10]).toEqualVector [0, 0, 0]

    describe 'translating', ->
      beforeEach -> @camera.translate [10, 11, -12]

      it 'transformEye3', ->
        expect(@camera.transformEye3 @out, [0, 0, 0]).toEqualVector [-12, 11, -10]

      it 'transformWorld3', ->
        expect(@camera.transformWorld3 @out, [-12, 11, -10]).toEqualVector [0, 0, 0]
