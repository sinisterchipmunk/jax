/*
 * Test glMatrix using qunit.js/qunit.css.
 */

var glMatrix_runtests = function() {

  module("Test glMatrix routines");

  test("vec3",function () {

    var v1 = vec3.create();

    ok(v1,"vec3.create()");
    equals(v1[0],0,"first component 0");
    equals(v1[1],0,"second component 0");
    equals(v1[2],0,"third component 0");

    var v2 = vec3.create([1,2,3]);
    equals(v2[0],1,"set first component in vec3.create");
    equals(v2[1],2,"set second component in vec3.create");
    equals(v2[2],3,"set third component in vec3.create");

    vec3.set([4,5,6],v2);
    equals(v2[0],4,"set first component");
    equals(v2[1],5,"set second component");
    equals(v2[2],6,"set third component");


  });

  test("mat3",function () {

  });

  test("mat4",function () {

    var i,j;

    var m1 = mat4.create();

    var ident = mat4.identity(m1);
    ok(ident,"identity matrix");

    function testIdentity(m) {
      for (i = 0 ; i < 4 ; i++) {
        for (j = 0 ; j < 4 ; j++) {
          if (m[i + 4*j] !=(i==j ? 1.0 : 0.0) )
            return false;
        }
        return true;
    }
      
      
    }

    ok(testIdentity(ident),"identity matrix");

    try {
      mat4.lookAt([0,0,0],[0,0,0],[0,1,0],m1)
    } catch (e) {
      ok(false, "we shouldn't have died here");
    }});


  test("quat4",function () {

  });
}



       


