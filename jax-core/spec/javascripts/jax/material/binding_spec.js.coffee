describe 'Jax.Material.Binding', ->
  beforeEach ->
    @mesh    = new Jax.Mesh.Quad
    @model   = new Jax.Model mesh: @mesh
    @binding = new Jax.Material.Binding @context, @model, @mesh

  it 'should set a guid', -> expect(@binding.guid).toBeDefined()

  it 'should handle null meshes', ->
    # it's quite frequent to add a model to the world which has no mesh,
    # so bindings need to be able to handle this scenario. In reality null
    # meshes don't get rendered, but bindings may still occasionally be
    # created for them.
    expect(=> @binding = new Jax.Material.Binding @context, @model, null).
      not.toThrow()

  describe 'setting a numeric value', ->
    beforeEach -> @binding.set 'a', 1

    it 'should set expected value', ->
      expect(@binding.get().a).toEqual 1

  describe 'setting an array value', ->
    beforeEach -> @binding.set 'a', @arr = [1]

    it 'should set expected value', ->
      expect(@binding.get().a).toEqualVector [1]

    it 'should not set the array by reference', ->
      expect(@binding.get().a).not.toBe @arr

  describe 'setting an object value', ->
    beforeEach -> @binding.set 'a', @obj = { v: 1 }

    it 'should set value by reference', ->
      expect(@binding.get().a).toBe @obj

  describe 'setting an undefined value', ->
    # attributes have to be disabled when set to undefined, so it must be
    # possible to set them to undefined.
    beforeEach -> @binding.set 'a', undefined

    it 'should set value to undefined', ->
      expect(@binding.get().a).toBe undefined

  describe 'listening for an event', ->
    beforeEach ->
      @binding.listen @model.camera, 'event', => @fired = true

    it 'should not call the callback immediately', ->
      expect(@fired).not.toBe true

    describe 'calling `prepare` for the first time', ->
      beforeEach -> @binding.prepare()

      it 'should fire the callback', -> expect(@fired).toBe true

    describe 'after preparing', ->
      beforeEach ->
        @binding.prepare()
        @fired = false

      describe 'and then firing the event', ->
        beforeEach -> @model.camera.trigger 'event'

        it 'should not call the callback yet', ->
          expect(@fired).not.toBe true

        describe 'and then preparing again', ->
          beforeEach -> @binding.prepare()

          it 'should call the callback', ->
            expect(@fired).toBe true
