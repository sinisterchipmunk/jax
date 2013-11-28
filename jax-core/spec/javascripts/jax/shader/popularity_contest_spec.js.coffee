describe 'Jax.Shader.PopularityContest', ->
  beforeEach ->
    Jax.Shader.PopularityContest.reset()
    @contest = new Jax.Shader.PopularityContest

  describe 'sorting names with no popularity', ->
    beforeEach -> @sorted = @contest.sort ['one', 'two', 'three']

    it 'should sort alphabetically', ->
      expect(@sorted).toEqual [ 'one', 'three', 'two' ]

  describe 'sorting names with equal popularity', ->
    beforeEach ->
      @contest.popularize [ 'one', 'two', 'three' ]
      @sorted = @contest.sort [ 'one', 'two', 'three' ]

    it 'should sort alphabetically', ->
      expect(@sorted).toEqual [ 'one', 'three', 'two' ]

  describe 'when one is very popular', ->
    beforeEach -> @contest.popularize [ 'one', 'one', 'one' ]

    describe 'but also disliked', ->
      beforeEach -> @contest.dislike 'one'

      it 'should place one at the back of the line', ->
        @sorted = @contest.sort [ 'one', 'two', 'three' ]
        expect(@sorted).toEqual [ 'three', 'two', 'one' ]


  describe 'when one has been disliked', ->
    beforeEach -> @contest.dislike 'one'

    describe 'and others have no popularity', ->
      beforeEach -> @sorted = @contest.sort [ 'one', 'two', 'three' ]

      it 'should sort alphabetically with disliked at the end', ->
        expect(@sorted).toEqual [ 'three', 'two', 'one' ]

    describe 'and others have equal popularity', ->
      beforeEach ->
        @contest.popularize [ 'one', 'two', 'three' ]
        @sorted = @contest.sort [ 'one', 'two', 'three' ]

      it 'should sort alphabetically with disliked at the end', ->
        expect(@sorted).toEqual [ 'three', 'two', 'one' ]
    
    describe 'and others have inequal popularity', ->
      beforeEach ->
        @contest.popularize [ 'three' ]
        @contest.popularize [ 'two', 'two' ]
        @sorted = @contest.sort [ 'one', 'two', 'three' ]

      it 'should sort by popularity with disliked at the end', ->
        expect(@sorted).toEqual [ 'two', 'three', 'one' ]
    