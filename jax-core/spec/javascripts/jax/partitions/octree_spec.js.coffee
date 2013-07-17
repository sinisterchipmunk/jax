describe "Jax.Octree", ->
  octree = obj1 = obj2 = null
  formerNode1 = formerNode2 = null
  beforeEach ->
    octree = new Jax.Octree 2, 1
  
  it "should have depth 0", -> expect(octree.depth).toEqual 0
  
  it "should not be a parent", -> expect(octree.isParent()).toBeFalse()
  
  describe "with size 1", ->
    beforeEach -> octree.size = 1
    
    it "should not recurse forever given N objects with same position and no radius", ->
      # where N = splitting threshold
      obj1 = new Jax.Model
      obj2 = new Jax.Model
      octree.add obj1
      octree.add obj2
    
    describe "adding an object to a merged child", ->
      beforeEach ->
        octree.subdivide()
        child = octree.getChildInQuadrant [-1,-1,-1]
        octree.merge()
        obj1 = new Jax.Model position: [-1,-1,-1], mesh: new Jax.Mesh.Sphere(radius: 0.1)
        child.add obj1

      it "should be added to the parent instead", ->
        expect(octree.find obj1).toBe octree

    describe "with a single object several nodes deep", ->
      level1 = level2 = null
      beforeEach ->
        obj1 = new Jax.Model position: [-1,-1,-1], mesh: new Jax.Mesh.Sphere(radius: 0.1)
        octree.subdivide()
        level1 = octree.getChildInQuadrant([-1,-1,-1]) # 0.5
        level1.subdivide()
        level2 = level1.getChildInQuadrant([-1,-1,-1]) # 0.25
        level2.add(obj1)
        
      describe "that has been moved beyond nodes of either level", ->
        beforeEach ->
          obj1.position = [0,0,0]
          octree.update obj1
      
        it "should not be left in an inaccessible node", ->
          # objects are winding up in nodes that have been merged, so we
          # need to make sure that traversing this tree still yields the
          # object.
          found = false
          octree.traverse [0,0,0], (node) ->
            found = true if node.objects[obj1.__unique_id]
            true
          expect(found).toBeTrue()
    
    it "updating one object should not remove others the tree", ->
      obj1 = new Jax.Model position: [0.5,0.5,0.5], mesh: new Jax.Mesh.Sphere(radius: 0.4)
      obj2 = new Jax.Model position: [0.5,0.5,0.5], mesh: new Jax.Mesh.Sphere(radius: 0.4)
      octree.add obj1
      octree.add obj2
      obj2.position = [4,0,4]
      octree.update obj2
      expect(octree.find obj1).not.toBeNull()
    
    describe "with 3 objects, and then 2 of them moved beyond octree range", ->
      obj3 = null
      orig1 = orig2 = orig3 = null
      beforeEach ->
        obj1 = new Jax.Model position: [0.5,0.5,0.5], mesh: new Jax.Mesh.Sphere(radius: 0.4)
        obj2 = new Jax.Model position: [0.5,0.5,0.5], mesh: new Jax.Mesh.Sphere(radius: 0.4)
        obj3 = new Jax.Model position: [0.5,0.5,0.5], mesh: new Jax.Mesh.Sphere(radius: 0.4)
        octree.add obj1
        octree.add obj2
        octree.add obj3
        orig1 = octree.find obj1
        orig2 = octree.find obj2
        orig3 = octree.find obj3
        obj1.position = [4,0,4]
        obj2.position = [4,0,4]
        octree.update obj1
        octree.update obj2
        
      it "should put them both at the same depth", ->
        # because they're in the same spot and fill the same area
        expect(octree.find(obj1).depth).toEqual octree.find(obj2).depth
        
      it "should have them in root nested objects", ->
        expect(octree.nestedObjectCount).toEqual 3
        
      it "should put neither object in root", ->
        # because there's still enough in [4,x,4] to trigger subdivision
        expect(octree.find obj1).not.toBe octree
        expect(octree.find obj2).not.toBe octree
        
      describe "moving them back", ->
        beforeEach ->
          obj1.position = [0.5, 0.5, 0.5]
          obj2.position = [0.5, 0.5, 0.5]
          octree.update obj1
          octree.update obj2
          
        # should it? should we care?
        # it "should move them back to their original nodes", ->
        #   expect(octree.find obj1).toBe orig1
        #   expect(octree.find obj2).toBe orig2
          
          
    describe "after subdivision", ->
      beforeEach -> octree.subdivide()
      
      it "should set appropriate positions for children", ->
        expect(octree.getChildInQuadrant([-1,-1,-1]).position).toEqualVector [-0.5,-0.5,-0.5]
        expect(octree.getChildInQuadrant([ 1,-1,-1]).position).toEqualVector [ 0.5,-0.5,-0.5]
        expect(octree.getChildInQuadrant([-1, 1,-1]).position).toEqualVector [-0.5, 0.5,-0.5]
        expect(octree.getChildInQuadrant([ 1, 1,-1]).position).toEqualVector [ 0.5, 0.5,-0.5]
        expect(octree.getChildInQuadrant([-1,-1, 1]).position).toEqualVector [-0.5,-0.5, 0.5]
        expect(octree.getChildInQuadrant([ 1,-1, 1]).position).toEqualVector [ 0.5,-0.5, 0.5]
        expect(octree.getChildInQuadrant([-1, 1, 1]).position).toEqualVector [-0.5, 0.5, 0.5]
        expect(octree.getChildInQuadrant([ 1, 1, 1]).position).toEqualVector [ 0.5, 0.5, 0.5]
        
      describe "enlarged after instantiating children", ->
        beforeEach ->
          octree.getChildInQuadrant [-1,-1,-1]
          octree.getChildInQuadrant [ 1,-1,-1]
          octree.getChildInQuadrant [-1, 1,-1]
          octree.getChildInQuadrant [ 1, 1,-1]
          octree.getChildInQuadrant [-1,-1, 1]
          octree.getChildInQuadrant [ 1,-1, 1]
          octree.getChildInQuadrant [-1, 1, 1]
          octree.getChildInQuadrant [ 1, 1, 1]
          octree.enlarge()
          
        it "should reposition each child as appropriate", ->
          # size is now 2 so the half-way point in each direction is 1.0
          expect(octree.getChildInQuadrant([-1,-1,-1]).position).toEqualVector [-1,-1,-1]
          expect(octree.getChildInQuadrant([ 1,-1,-1]).position).toEqualVector [ 1,-1,-1]
          expect(octree.getChildInQuadrant([-1, 1,-1]).position).toEqualVector [-1, 1,-1]
          expect(octree.getChildInQuadrant([ 1, 1,-1]).position).toEqualVector [ 1, 1,-1]
          expect(octree.getChildInQuadrant([-1,-1, 1]).position).toEqualVector [-1,-1, 1]
          expect(octree.getChildInQuadrant([ 1,-1, 1]).position).toEqualVector [ 1,-1, 1]
          expect(octree.getChildInQuadrant([-1, 1, 1]).position).toEqualVector [-1, 1, 1]
          expect(octree.getChildInQuadrant([ 1, 1, 1]).position).toEqualVector [ 1, 1, 1]
          
      
      describe "adding an object to a child, too large for the child", ->
        beforeEach ->
          obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 2.25)
          octree.getChildInQuadrant([1,1,1]).add obj1
          
        it "should place the object in the child's parent", ->
          expect(octree.objectCount).toEqual 1
          
        it "should not place the object in the child", ->
          expect(octree.getChildInQuadrant([1,1,1]).objectCount).toEqual 0
    
    describe "adding a smaller object and then a larger one", ->
      beforeEach ->
        obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 0.4)
        obj2 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 2.25)
        octree.add obj1
        octree.add obj2
      
      # the 2nd addition should trigger splitting, even if it doesn't fit
        
      it "should place the larger object in the root", ->
        expect(octree.find obj2).toBe octree
        
      it "should place the smaller one in a child", ->
        expect(octree.find obj1).toBeInstanceOf Jax.Octree
        expect(octree.find obj1).not.toBe octree
    
    describe "adding an object that is larger than the octree", ->
      beforeEach ->
        obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 2.25)
        octree.add obj1
      
      it "should enlarge the octree", ->
        expect(octree.size).toBeGreaterThan 1
        
      it "should not reposition the tree", ->
        expect(octree.position).toEqualVector [0,0,0]
        
      it "should place the object at the root", ->
        expect(octree.find(obj1)).toBe octree
    
    describe "after adding two objects at its origin with a radius of 0.6", ->
      beforeEach ->
        obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 0.6)
        obj2 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 0.6)
        octree.add obj1
        octree.add obj2
        
      it "should contain 2 objects", ->
        # because objects are too large to fit in children
        expect(octree.objectCount).toEqual 2
        
      it "should not be a parent", ->
        expect(octree.isParent()).toBeFalse()
        
    
    describe "after adding an object at its origin with a radius of 0.25", ->
      beforeEach ->
        obj1 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 0.25)
        octree.add obj1
        
      it "should have 1 object", -> expect(octree.objectCount).toEqual 1
      
      it "should have 1 nested object", -> expect(octree.nestedObjectCount).toEqual 1
      
      describe "adding it again", ->
        beforeEach -> octree.add obj1
        
        it "should have no effect on object count", ->
          expect(octree.objectCount).toEqual 1
          
        it "should have no effect on nested object count", ->
          expect(octree.nestedObjectCount).toEqual 1
      
      it "should not be a parent", ->
        expect(octree.isParent()).toBeFalse()
        
      it "should contain the object", ->
        expect(octree.find(obj1)).toBe octree
        
      describe "after adding a second identical object", ->
        beforeEach ->
          obj2 = new Jax.Model mesh: new Jax.Mesh.Sphere(radius: 0.25)
          octree.add obj2
          
        describe "and then enlarging the octree", ->
          beforeEach ->
            formerNode1 = octree.find obj1
            formerNode2 = octree.find obj2
            octree.enlarge()
          
          it "should re-evaluate the children and distribute them one level deeper", ->
            # because a child that was previously too small has doubled in size and should
            # now be large enough to hold the objects
            expect(octree.find(obj1).parent).toBe formerNode1
            expect(octree.find(obj2).parent).toBe formerNode2
          
        describe "moving the object a long distance and then updating the octree", ->
          beforeEach ->
            formerNode1 = octree.find obj1
            formerNode2 = octree.find obj2
            obj2.position = [4, 4, 4]
            octree.update obj2
            
          it "should have been moved to a different node", ->
            expect(octree.find obj2).not.toBe formerNode2
            
        # because subdivide threshold is 2...
        it "should become a parent", -> 
          expect(octree.isParent()).toBeTrue()
          
        it "should have 2 nested objects", ->
          expect(octree.nestedObjectCount).toEqual 2
          
        it "should have no objects", ->
          expect(octree.objectCount).toEqual 0
        
        it "should not keep the object references", ->
          expect(octree.objects[obj1.__unique_id]).toBeUndefined()
          expect(octree.objects[obj2.__unique_id]).toBeUndefined()
        
        it "should keep nested object references", ->
          expect(octree.nestedObjects[obj1.__unique_id]).toBeDefined()
          expect(octree.nestedObjects[obj2.__unique_id]).toBeDefined()
          
        it "should return a node other than root for both objects via #find", ->
          expect(octree.find obj1).not.toBe octree
          expect(octree.find obj2).not.toBe octree
          
        it "should return an instance of Octree for both objects via #find", ->
          expect(octree.find obj1).toBeInstanceOf Jax.Octree
          expect(octree.find obj2).toBeInstanceOf Jax.Octree
        
        describe "removing one of the objects from its current node", ->
          beforeEach -> octree.find(obj2).remove(obj2)
          
          # merge threshold is 1...
          
          it "should move obj1 into octree root node", ->
            expect(octree.objectCount).toEqual 1
            
          it "should make the octree root not a parent", ->
            expect(octree.isParent()).toBeFalse
          
          it "should remove the object from parent's nested objects", ->
            expect(octree.nestedObjects[obj2.__unique_id]).toBeUndefined()
            expect(octree.nestedObjectCount).toEqual 1
            
          it "should still be a parent", ->
            expect(octree.isParent()).toBeTrue()
            
          it "should not be subdivided", ->
            expect(octree.isSubdivided()).toBeFalse()
            
    
    describe "subdivided once", ->
      beforeEach -> octree.subdivide()
      
      it "should have children whose size is smaller than that of the parent", ->
        expect(octree.getChildInQuadrant([1,1,1]).size).toBeLessThan octree.size
        
      it "should position its children at the center of each of its quadrants", ->
        expect(octree.getChildInQuadrant([-1,-1,-1]).position).toEqualVector [-0.5,-0.5,-0.5]
        expect(octree.getChildInQuadrant([ 1,-1,-1]).position).toEqualVector [ 0.5,-0.5,-0.5]
        expect(octree.getChildInQuadrant([-1, 1,-1]).position).toEqualVector [-0.5, 0.5,-0.5]
        expect(octree.getChildInQuadrant([ 1, 1,-1]).position).toEqualVector [ 0.5, 0.5,-0.5]
        expect(octree.getChildInQuadrant([-1,-1, 1]).position).toEqualVector [-0.5,-0.5, 0.5]
        expect(octree.getChildInQuadrant([ 1,-1, 1]).position).toEqualVector [ 0.5,-0.5, 0.5]
        expect(octree.getChildInQuadrant([-1, 1, 1]).position).toEqualVector [-0.5, 0.5, 0.5]
        expect(octree.getChildInQuadrant([ 1, 1, 1]).position).toEqualVector [ 0.5, 0.5, 0.5]
        
      it "should not reinstantiate existing children", ->
        child = octree.getChildInQuadrant([1,1,1])
        octree.subdivide()
        expect(octree.getChildInQuadrant([1,1,1])).toBe child
      
      it "should not be a parent", -> expect(octree.isParent()).toBeFalse()
      
      it "should be subdivided", -> expect(octree.isSubdivided()).toBeTrue()

    
    describe "enlarged once", ->
      beforeEach -> octree.enlarge()
      
      it "should double in size", -> expect(octree.size).toEqual 2
      
      it "should not be a parent", -> expect(octree.isParent()).toBeFalse()
      
      it "should be subdivided", -> expect(octree.isSubdivided()).toBeTrue()

      it "should have children whose size is less than that of the parent", ->
        expect(octree.getChildInQuadrant([1,1,1]).size).toBeLessThan octree.size
        
      it "should not reinstantiate existing children", ->
        child = octree.getChildInQuadrant([1,1,1])
        octree.enlarge()
        expect(octree.getChildInQuadrant([1,1,1])).toBe child
      
      describe "enlarged again", ->
        beforeEach -> octree.enlarge()
        
        it "should enlarge its children", ->
          expect(octree.getChildInQuadrant([1,1,1]).size).toEqual 2
