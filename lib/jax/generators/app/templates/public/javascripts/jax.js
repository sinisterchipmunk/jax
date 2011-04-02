var Jax = { };

/*
 * glMatrix.js - High performance matrix and vector operations for WebGL
 * version 0.9.5
 */

/*
 * Copyright (c) 2010 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

if(typeof Float32Array != 'undefined') {
	glMatrixArrayType = Float32Array;
} else if(typeof WebGLFloatArray != 'undefined') {
	glMatrixArrayType = WebGLFloatArray; // This is officially deprecated and should dissapear in future revisions.
} else {
	glMatrixArrayType = Array;
}

/*
 * vec3 - 3 Dimensional Vector
 */
var vec3 = {};

/*
 * vec3.create
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array containing at least 3 numeric elements can serve as a vec3
 *
 * Params:
 * vec - Optional, vec3 containing values to initialize with
 *
 * Returns:
 * New vec3
 */
vec3.create = function(vec) {
	var dest = new glMatrixArrayType(3);

	if(vec) {
		dest[0] = vec[0];
		dest[1] = vec[1];
		dest[2] = vec[2];
	}

	return dest;
};

/*
 * vec3.set
 * Copies the values of one vec3 to another
 *
 * Params:
 * vec - vec3 containing values to copy
 * dest - vec3 receiving copied values
 *
 * Returns:
 * dest
 */
vec3.set = function(vec, dest) {
	dest[0] = vec[0];
	dest[1] = vec[1];
	dest[2] = vec[2];

	return dest;
};

/*
 * vec3.add
 * Performs a vector addition
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.add = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] += vec2[0];
		vec[1] += vec2[1];
		vec[2] += vec2[2];
		return vec;
	}

	dest[0] = vec[0] + vec2[0];
	dest[1] = vec[1] + vec2[1];
	dest[2] = vec[2] + vec2[2];
	return dest;
};

/*
 * vec3.subtract
 * Performs a vector subtraction
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.subtract = function(vec, vec2, dest) {
	if(!dest || vec == dest) {
		vec[0] -= vec2[0];
		vec[1] -= vec2[1];
		vec[2] -= vec2[2];
		return vec;
	}

	dest[0] = vec[0] - vec2[0];
	dest[1] = vec[1] - vec2[1];
	dest[2] = vec[2] - vec2[2];
	return dest;
};

/*
 * vec3.negate
 * Negates the components of a vec3
 *
 * Params:
 * vec - vec3 to negate
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.negate = function(vec, dest) {
	if(!dest) { dest = vec; }

	dest[0] = -vec[0];
	dest[1] = -vec[1];
	dest[2] = -vec[2];
	return dest;
};

/*
 * vec3.scale
 * Multiplies the components of a vec3 by a scalar value
 *
 * Params:
 * vec - vec3 to scale
 * val - Numeric value to scale by
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.scale = function(vec, val, dest) {
	if(!dest || vec == dest) {
		vec[0] *= val;
		vec[1] *= val;
		vec[2] *= val;
		return vec;
	}

	dest[0] = vec[0]*val;
	dest[1] = vec[1]*val;
	dest[2] = vec[2]*val;
	return dest;
};

/*
 * vec3.normalize
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * Params:
 * vec - vec3 to normalize
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.normalize = function(vec, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var len = Math.sqrt(x*x + y*y + z*z);

	if (!len) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		return dest;
	} else if (len == 1) {
		dest[0] = x;
		dest[1] = y;
		dest[2] = z;
		return dest;
	}

	len = 1 / len;
	dest[0] = x*len;
	dest[1] = y*len;
	dest[2] = z*len;
	return dest;
};

/*
 * vec3.cross
 * Generates the cross product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.cross = function(vec, vec2, dest){
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

	dest[0] = y*z2 - z*y2;
	dest[1] = z*x2 - x*z2;
	dest[2] = x*y2 - y*x2;
	return dest;
};

/*
 * vec3.length
 * Caclulates the length of a vec3
 *
 * Params:
 * vec - vec3 to calculate length of
 *
 * Returns:
 * Length of vec
 */
vec3.length = function(vec){
	var x = vec[0], y = vec[1], z = vec[2];
	return Math.sqrt(x*x + y*y + z*z);
};

/*
 * vec3.dot
 * Caclulates the dot product of two vec3s
 *
 * Params:
 * vec - vec3, first operand
 * vec2 - vec3, second operand
 *
 * Returns:
 * Dot product of vec and vec2
 */
vec3.dot = function(vec, vec2){
	return vec[0]*vec2[0] + vec[1]*vec2[1] + vec[2]*vec2[2];
};

/*
 * vec3.direction
 * Generates a unit vector pointing from one vector to another
 *
 * Params:
 * vec - origin vec3
 * vec2 - vec3 to point to
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.direction = function(vec, vec2, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0] - vec2[0];
	var y = vec[1] - vec2[1];
	var z = vec[2] - vec2[2];

	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		return dest;
	}

	len = 1 / len;
	dest[0] = x * len;
	dest[1] = y * len;
	dest[2] = z * len;
	return dest;
};

/*
 * vec3.lerp
 * Performs a linear interpolation between two vec3
 *
 * Params:
 * vec - vec3, first vector
 * vec2 - vec3, second vector
 * lerp - interpolation amount between the two inputs
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
vec3.lerp = function(vec, vec2, lerp, dest){
    if(!dest) { dest = vec; }

    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

    return dest;
}

/*
 * vec3.str
 * Returns a string representation of a vector
 *
 * Params:
 * vec - vec3 to represent as a string
 *
 * Returns:
 * string representation of vec
 */
vec3.str = function(vec) {
	return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
};

/*
 * mat3 - 3x3 Matrix
 */
var mat3 = {};

/*
 * mat3.create
 * Creates a new instance of a mat3 using the default array type
 * Any javascript array containing at least 9 numeric elements can serve as a mat3
 *
 * Params:
 * mat - Optional, mat3 containing values to initialize with
 *
 * Returns:
 * New mat3
 */
mat3.create = function(mat) {
	var dest = new glMatrixArrayType(9);

	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
	}

	return dest;
};

/*
 * mat3.set
 * Copies the values of one mat3 to another
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - mat3 receiving copied values
 *
 * Returns:
 * dest
 */
mat3.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.identity
 * Sets a mat3 to an identity matrix
 *
 * Params:
 * dest - mat3 to set
 *
 * Returns:
 * dest
 */
mat3.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 1;
	dest[5] = 0;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat3 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat3 to transpose
 * dest - Optional, mat3 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat3.transpose = function(mat, dest) {
	if(!dest || mat == dest) {
		var a01 = mat[1], a02 = mat[2];
		var a12 = mat[5];

        mat[1] = mat[3];
        mat[2] = mat[6];
        mat[3] = a01;
        mat[5] = mat[7];
        mat[6] = a02;
        mat[7] = a12;
		return mat;
	}

	dest[0] = mat[0];
	dest[1] = mat[3];
	dest[2] = mat[6];
	dest[3] = mat[1];
	dest[4] = mat[4];
	dest[5] = mat[7];
	dest[6] = mat[2];
	dest[7] = mat[5];
	dest[8] = mat[8];
	return dest;
};

/*
 * mat3.toMat4
 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
 *
 * Params:
 * mat - mat3 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat3.toMat4 = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = 0;

	dest[4] = mat[3];
	dest[5] = mat[4];
	dest[6] = mat[5];
	dest[7] = 0;

	dest[8] = mat[6];
	dest[9] = mat[7];
	dest[10] = mat[8];
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
}

/*
 * mat3.str
 * Returns a string representation of a mat3
 *
 * Params:
 * mat - mat3 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat3.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
		', ' + mat[3] + ', '+ mat[4] + ', ' + mat[5] +
		', ' + mat[6] + ', ' + mat[7] + ', '+ mat[8] + ']';
};

/*
 * mat4 - 4x4 Matrix
 */
var mat4 = {};

/*
 * mat4.create
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array containing at least 16 numeric elements can serve as a mat4
 *
 * Params:
 * mat - Optional, mat4 containing values to initialize with
 *
 * Returns:
 * New mat4
 */
mat4.create = function(mat) {
	var dest = new glMatrixArrayType(16);

	if(mat) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	return dest;
};

/*
 * mat4.set
 * Copies the values of one mat4 to another
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - mat4 receiving copied values
 *
 * Returns:
 * dest
 */
mat4.set = function(mat, dest) {
	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.identity
 * Sets a mat4 to an identity matrix
 *
 * Params:
 * dest - mat4 to set
 *
 * Returns:
 * dest
 */
mat4.identity = function(dest) {
	dest[0] = 1;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 1;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = 1;
	dest[11] = 0;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.transpose
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * Params:
 * mat - mat4 to transpose
 * dest - Optional, mat4 receiving transposed values. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.transpose = function(mat, dest) {
	if(!dest || mat == dest) {
		var a01 = mat[1], a02 = mat[2], a03 = mat[3];
		var a12 = mat[6], a13 = mat[7];
		var a23 = mat[11];

		mat[1] = mat[4];
		mat[2] = mat[8];
		mat[3] = mat[12];
		mat[4] = a01;
		mat[6] = mat[9];
		mat[7] = mat[13];
		mat[8] = a02;
		mat[9] = a12;
		mat[11] = mat[14];
		mat[12] = a03;
		mat[13] = a13;
		mat[14] = a23;
		return mat;
	}

	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];
	dest[3] = mat[12];
	dest[4] = mat[1];
	dest[5] = mat[5];
	dest[6] = mat[9];
	dest[7] = mat[13];
	dest[8] = mat[2];
	dest[9] = mat[6];
	dest[10] = mat[10];
	dest[11] = mat[14];
	dest[12] = mat[3];
	dest[13] = mat[7];
	dest[14] = mat[11];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.determinant
 * Calculates the determinant of a mat4
 *
 * Params:
 * mat - mat4 to calculate determinant of
 *
 * Returns:
 * determinant of mat
 */
mat4.determinant = function(mat) {
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	return	a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
};

/*
 * mat4.inverse
 * Calculates the inverse matrix of a mat4
 *
 * Params:
 * mat - mat4 to calculate inverse of
 * dest - Optional, mat4 receiving inverse matrix. If not specified result is written to mat
 *
 * Returns:
 * dest is specified, mat otherwise
 */
mat4.inverse = function(mat, dest) {
	if(!dest) { dest = mat; }

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	var b00 = a00*a11 - a01*a10;
	var b01 = a00*a12 - a02*a10;
	var b02 = a00*a13 - a03*a10;
	var b03 = a01*a12 - a02*a11;
	var b04 = a01*a13 - a03*a11;
	var b05 = a02*a13 - a03*a12;
	var b06 = a20*a31 - a21*a30;
	var b07 = a20*a32 - a22*a30;
	var b08 = a20*a33 - a23*a30;
	var b09 = a21*a32 - a22*a31;
	var b10 = a21*a33 - a23*a31;
	var b11 = a22*a33 - a23*a32;

	var invDet = 1/(b00*b11 - b01*b10 + b02*b09 + b03*b08 - b04*b07 + b05*b06);

	dest[0] = (a11*b11 - a12*b10 + a13*b09)*invDet;
	dest[1] = (-a01*b11 + a02*b10 - a03*b09)*invDet;
	dest[2] = (a31*b05 - a32*b04 + a33*b03)*invDet;
	dest[3] = (-a21*b05 + a22*b04 - a23*b03)*invDet;
	dest[4] = (-a10*b11 + a12*b08 - a13*b07)*invDet;
	dest[5] = (a00*b11 - a02*b08 + a03*b07)*invDet;
	dest[6] = (-a30*b05 + a32*b02 - a33*b01)*invDet;
	dest[7] = (a20*b05 - a22*b02 + a23*b01)*invDet;
	dest[8] = (a10*b10 - a11*b08 + a13*b06)*invDet;
	dest[9] = (-a00*b10 + a01*b08 - a03*b06)*invDet;
	dest[10] = (a30*b04 - a31*b02 + a33*b00)*invDet;
	dest[11] = (-a20*b04 + a21*b02 - a23*b00)*invDet;
	dest[12] = (-a10*b09 + a11*b07 - a12*b06)*invDet;
	dest[13] = (a00*b09 - a01*b07 + a02*b06)*invDet;
	dest[14] = (-a30*b03 + a31*b01 - a32*b00)*invDet;
	dest[15] = (a20*b03 - a21*b01 + a22*b00)*invDet;

	return dest;
};

/*
 * mat4.toRotationMat
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat4 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat4 otherwise
 */
mat4.toRotationMat = function(mat, dest) {
	if(!dest) { dest = mat4.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[3];
	dest[4] = mat[4];
	dest[5] = mat[5];
	dest[6] = mat[6];
	dest[7] = mat[7];
	dest[8] = mat[8];
	dest[9] = mat[9];
	dest[10] = mat[10];
	dest[11] = mat[11];
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
};

/*
 * mat4.toMat3
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * Params:
 * mat - mat4 containing values to copy
 * dest - Optional, mat3 receiving copied values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toMat3 = function(mat, dest) {
	if(!dest) { dest = mat3.create(); }

	dest[0] = mat[0];
	dest[1] = mat[1];
	dest[2] = mat[2];
	dest[3] = mat[4];
	dest[4] = mat[5];
	dest[5] = mat[6];
	dest[6] = mat[8];
	dest[7] = mat[9];
	dest[8] = mat[10];

	return dest;
};

/*
 * mat4.toInverseMat3
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Params:
 * mat - mat4 containing values to invert and copy
 * dest - Optional, mat3 receiving values
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 */
mat4.toInverseMat3 = function(mat, dest) {
	var a00 = mat[0], a01 = mat[1], a02 = mat[2];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10];

	var b01 = a22*a11-a12*a21;
	var b11 = -a22*a10+a12*a20;
	var b21 = a21*a10-a11*a20;

	var d = a00*b01 + a01*b11 + a02*b21;
	if (!d) { return null; }
	var id = 1/d;

	if(!dest) { dest = mat3.create(); }

	dest[0] = b01*id;
	dest[1] = (-a22*a01 + a02*a21)*id;
	dest[2] = (a12*a01 - a02*a11)*id;
	dest[3] = b11*id;
	dest[4] = (a22*a00 - a02*a20)*id;
	dest[5] = (-a12*a00 + a02*a10)*id;
	dest[6] = b21*id;
	dest[7] = (-a21*a00 + a01*a20)*id;
	dest[8] = (a11*a00 - a01*a10)*id;

	return dest;
};

/*
 * mat4.multiply
 * Performs a matrix multiplication
 *
 * Params:
 * mat - mat4, first operand
 * mat2 - mat4, second operand
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.multiply = function(mat, mat2, dest) {
	if(!dest) { dest = mat }

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];

	dest[0] = b00*a00 + b01*a10 + b02*a20 + b03*a30;
	dest[1] = b00*a01 + b01*a11 + b02*a21 + b03*a31;
	dest[2] = b00*a02 + b01*a12 + b02*a22 + b03*a32;
	dest[3] = b00*a03 + b01*a13 + b02*a23 + b03*a33;
	dest[4] = b10*a00 + b11*a10 + b12*a20 + b13*a30;
	dest[5] = b10*a01 + b11*a11 + b12*a21 + b13*a31;
	dest[6] = b10*a02 + b11*a12 + b12*a22 + b13*a32;
	dest[7] = b10*a03 + b11*a13 + b12*a23 + b13*a33;
	dest[8] = b20*a00 + b21*a10 + b22*a20 + b23*a30;
	dest[9] = b20*a01 + b21*a11 + b22*a21 + b23*a31;
	dest[10] = b20*a02 + b21*a12 + b22*a22 + b23*a32;
	dest[11] = b20*a03 + b21*a13 + b22*a23 + b23*a33;
	dest[12] = b30*a00 + b31*a10 + b32*a20 + b33*a30;
	dest[13] = b30*a01 + b31*a11 + b32*a21 + b33*a31;
	dest[14] = b30*a02 + b31*a12 + b32*a22 + b33*a32;
	dest[15] = b30*a03 + b31*a13 + b32*a23 + b33*a33;

	return dest;
};

/*
 * mat4.multiplyVec3
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }

	var x = vec[0], y = vec[1], z = vec[2];

	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];

	return dest;
};

/*
 * mat4.multiplyVec4
 * Transforms a vec4 with the given matrix
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec4 to transform
 * dest - Optional, vec4 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.multiplyVec4 = function(mat, vec, dest) {
	if(!dest) { dest = vec }

	var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12]*w;
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13]*w;
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
	dest[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;

	return dest;
};

/*
 * mat4.translate
 * Translates a matrix by the given vector
 *
 * Params:
 * mat - mat4 to translate
 * vec - vec3 specifying the translation
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.translate = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];

	if(!dest || mat == dest) {
		mat[12] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
		mat[13] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
		mat[14] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
		mat[15] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15];
		return mat;
	}

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	dest[0] = a00;
	dest[1] = a01;
	dest[2] = a02;
	dest[3] = a03;
	dest[4] = a10;
	dest[5] = a11;
	dest[6] = a12;
	dest[7] = a13;
	dest[8] = a20;
	dest[9] = a21;
	dest[10] = a22;
	dest[11] = a23;

	dest[12] = a00*x + a10*y + a20*z + mat[12];
	dest[13] = a01*x + a11*y + a21*z + mat[13];
	dest[14] = a02*x + a12*y + a22*z + mat[14];
	dest[15] = a03*x + a13*y + a23*z + mat[15];
	return dest;
};

/*
 * mat4.scale
 * Scales a matrix by the given vector
 *
 * Params:
 * mat - mat4 to scale
 * vec - vec3 specifying the scale for each axis
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.scale = function(mat, vec, dest) {
	var x = vec[0], y = vec[1], z = vec[2];

	if(!dest || mat == dest) {
		mat[0] *= x;
		mat[1] *= x;
		mat[2] *= x;
		mat[3] *= x;
		mat[4] *= y;
		mat[5] *= y;
		mat[6] *= y;
		mat[7] *= y;
		mat[8] *= z;
		mat[9] *= z;
		mat[10] *= z;
		mat[11] *= z;
		return mat;
	}

	dest[0] = mat[0]*x;
	dest[1] = mat[1]*x;
	dest[2] = mat[2]*x;
	dest[3] = mat[3]*x;
	dest[4] = mat[4]*y;
	dest[5] = mat[5]*y;
	dest[6] = mat[6]*y;
	dest[7] = mat[7]*y;
	dest[8] = mat[8]*z;
	dest[9] = mat[9]*z;
	dest[10] = mat[10]*z;
	dest[11] = mat[11]*z;
	dest[12] = mat[12];
	dest[13] = mat[13];
	dest[14] = mat[14];
	dest[15] = mat[15];
	return dest;
};

/*
 * mat4.rotate
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * axis - vec3 representing the axis to rotate around
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotate = function(mat, angle, axis, dest) {
	var x = axis[0], y = axis[1], z = axis[2];
	var len = Math.sqrt(x*x + y*y + z*z);
	if (!len) { return null; }
	if (len != 1) {
		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;
	}

	var s = Math.sin(angle);
	var c = Math.cos(angle);
	var t = 1-c;

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	var b00 = x*x*t + c, b01 = y*x*t + z*s, b02 = z*x*t - y*s;
	var b10 = x*y*t - z*s, b11 = y*y*t + c, b12 = z*y*t + x*s;
	var b20 = x*z*t + y*s, b21 = y*z*t - x*s, b22 = z*z*t + c;

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*b00 + a10*b01 + a20*b02;
	dest[1] = a01*b00 + a11*b01 + a21*b02;
	dest[2] = a02*b00 + a12*b01 + a22*b02;
	dest[3] = a03*b00 + a13*b01 + a23*b02;

	dest[4] = a00*b10 + a10*b11 + a20*b12;
	dest[5] = a01*b10 + a11*b11 + a21*b12;
	dest[6] = a02*b10 + a12*b11 + a22*b12;
	dest[7] = a03*b10 + a13*b11 + a23*b12;

	dest[8] = a00*b20 + a10*b21 + a20*b22;
	dest[9] = a01*b20 + a11*b21 + a21*b22;
	dest[10] = a02*b20 + a12*b21 + a22*b22;
	dest[11] = a03*b20 + a13*b21 + a23*b22;
	return dest;
};

/*
 * mat4.rotateX
 * Rotates a matrix by the given angle around the X axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateX = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2] = mat[2];
		dest[3] = mat[3];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[4] = a10*c + a20*s;
	dest[5] = a11*c + a21*s;
	dest[6] = a12*c + a22*s;
	dest[7] = a13*c + a23*s;

	dest[8] = a10*-s + a20*c;
	dest[9] = a11*-s + a21*c;
	dest[10] = a12*-s + a22*c;
	dest[11] = a13*-s + a23*c;
	return dest;
};

/*
 * mat4.rotateY
 * Rotates a matrix by the given angle around the Y axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateY = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged rows
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6] = mat[6];
		dest[7] = mat[7];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*c + a20*-s;
	dest[1] = a01*c + a21*-s;
	dest[2] = a02*c + a22*-s;
	dest[3] = a03*c + a23*-s;

	dest[8] = a00*s + a20*c;
	dest[9] = a01*s + a21*c;
	dest[10] = a02*s + a22*c;
	dest[11] = a03*s + a23*c;
	return dest;
};

/*
 * mat4.rotateZ
 * Rotates a matrix by the given angle around the Z axis
 *
 * Params:
 * mat - mat4 to rotate
 * angle - angle (in radians) to rotate
 * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
 *
 * Returns:
 * dest if specified, mat otherwise
 */
mat4.rotateZ = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);

	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];

	if(!dest) {
		dest = mat
	} else if(mat != dest) { // If the source and destination differ, copy the unchanged last row
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];

		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
	}

	dest[0] = a00*c + a10*s;
	dest[1] = a01*c + a11*s;
	dest[2] = a02*c + a12*s;
	dest[3] = a03*c + a13*s;

	dest[4] = a00*-s + a10*c;
	dest[5] = a01*-s + a11*c;
	dest[6] = a02*-s + a12*c;
	dest[7] = a03*-s + a13*c;

	return dest;
};

/*
 * mat4.frustum
 * Generates a frustum matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.frustum = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = (near*2) / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = (near*2) / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = (right + left) / rl;
	dest[9] = (top + bottom) / tb;
	dest[10] = -(far + near) / fn;
	dest[11] = -1;
	dest[12] = 0;
	dest[13] = 0;
	dest[14] = -(far*near*2) / fn;
	dest[15] = 0;
	return dest;
};

/*
 * mat4.perspective
 * Generates a perspective projection matrix with the given bounds
 *
 * Params:
 * fovy - scalar, vertical field of view
 * aspect - scalar, aspect ratio. typically viewport width/height
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.perspective = function(fovy, aspect, near, far, dest) {
	var top = near*Math.tan(fovy*Math.PI / 360.0);
	var right = top*aspect;
	return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/*
 * mat4.ortho
 * Generates a orthogonal projection matrix with the given bounds
 *
 * Params:
 * left, right - scalar, left and right bounds of the frustum
 * bottom, top - scalar, bottom and top bounds of the frustum
 * near, far - scalar, near and far bounds of the frustum
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.ortho = function(left, right, bottom, top, near, far, dest) {
	if(!dest) { dest = mat4.create(); }
	var rl = (right - left);
	var tb = (top - bottom);
	var fn = (far - near);
	dest[0] = 2 / rl;
	dest[1] = 0;
	dest[2] = 0;
	dest[3] = 0;
	dest[4] = 0;
	dest[5] = 2 / tb;
	dest[6] = 0;
	dest[7] = 0;
	dest[8] = 0;
	dest[9] = 0;
	dest[10] = -2 / fn;
	dest[11] = 0;
	dest[12] = -(left + right) / rl;
	dest[13] = -(top + bottom) / tb;
	dest[14] = -(far + near) / fn;
	dest[15] = 1;
	return dest;
};

/*
 * mat4.ortho
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * Params:
 * eye - vec3, position of the viewer
 * center - vec3, point the viewer is looking at
 * up - vec3 pointing "up"
 * dest - Optional, mat4 frustum matrix will be written into
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
mat4.lookAt = function(eye, center, up, dest) {
	if(!dest) { dest = mat4.create(); }

	var eyex = eye[0],
		eyey = eye[1],
		eyez = eye[2],
		upx = up[0],
		upy = up[1],
		upz = up[2],
		centerx = center[0],
		centery = center[1],
		centerz = center[2];

	if (eyex == centerx && eyey == centery && eyez == centerz) {
		return mat4.identity(dest);
	}

	var z0,z1,z2,x0,x1,x2,y0,y1,y2,len;

	z0 = eyex - center[0];
	z1 = eyey - center[1];
	z2 = eyez - center[2];

	len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy*z2 - upz*z1;
	x1 = upz*z0 - upx*z2;
	x2 = upx*z1 - upy*z0;
	len = Math.sqrt(x0*x0 + x1*x1 + x2*x2);
	if (!len) {
		x0 = 0;
		x1 = 0;
		x2 = 0;
	} else {
		len = 1/len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	};

	y0 = z1*x2 - z2*x1;
	y1 = z2*x0 - z0*x2;
	y2 = z0*x1 - z1*x0;

	len = Math.sqrt(y0*y0 + y1*y1 + y2*y2);
	if (!len) {
		y0 = 0;
		y1 = 0;
		y2 = 0;
	} else {
		len = 1/len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	dest[0] = x0;
	dest[1] = y0;
	dest[2] = z0;
	dest[3] = 0;
	dest[4] = x1;
	dest[5] = y1;
	dest[6] = z1;
	dest[7] = 0;
	dest[8] = x2;
	dest[9] = y2;
	dest[10] = z2;
	dest[11] = 0;
	dest[12] = -(x0*eyex + x1*eyey + x2*eyez);
	dest[13] = -(y0*eyex + y1*eyey + y2*eyez);
	dest[14] = -(z0*eyex + z1*eyey + z2*eyez);
	dest[15] = 1;

	return dest;
};

/*
 * mat4.str
 * Returns a string representation of a mat4
 *
 * Params:
 * mat - mat4 to represent as a string
 *
 * Returns:
 * string representation of mat
 */
mat4.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
		', '+ mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
		', '+ mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
		', '+ mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
};

/*
 * quat4 - Quaternions
 */
quat4 = {};

/*
 * quat4.create
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * Params:
 * quat - Optional, quat4 containing values to initialize with
 *
 * Returns:
 * New quat4
 */
quat4.create = function(quat) {
	var dest = new glMatrixArrayType(4);

	if(quat) {
		dest[0] = quat[0];
		dest[1] = quat[1];
		dest[2] = quat[2];
		dest[3] = quat[3];
	}

	return dest;
};

/*
 * quat4.set
 * Copies the values of one quat4 to another
 *
 * Params:
 * quat - quat4 containing values to copy
 * dest - quat4 receiving copied values
 *
 * Returns:
 * dest
 */
quat4.set = function(quat, dest) {
	dest[0] = quat[0];
	dest[1] = quat[1];
	dest[2] = quat[2];
	dest[3] = quat[3];

	return dest;
};

/*
 * quat4.calculateW
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * Params:
 * quat - quat4 to calculate W component of
 * dest - Optional, quat4 receiving calculated values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.calculateW = function(quat, dest) {
	var x = quat[0], y = quat[1], z = quat[2];

	if(!dest || quat == dest) {
		quat[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
		return quat;
	}
	dest[0] = x;
	dest[1] = y;
	dest[2] = z;
	dest[3] = -Math.sqrt(Math.abs(1.0 - x*x - y*y - z*z));
	return dest;
}

/*
 * quat4.inverse
 * Calculates the inverse of a quat4
 *
 * Params:
 * quat - quat4 to calculate inverse of
 * dest - Optional, quat4 receiving inverse values. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.inverse = function(quat, dest) {
	if(!dest || quat == dest) {
		quat[0] *= 1;
		quat[1] *= 1;
		quat[2] *= 1;
		return quat;
	}
	dest[0] = -quat[0];
	dest[1] = -quat[1];
	dest[2] = -quat[2];
	dest[3] = quat[3];
	return dest;
}

/*
 * quat4.length
 * Calculates the length of a quat4
 *
 * Params:
 * quat - quat4 to calculate length of
 *
 * Returns:
 * Length of quat
 */
quat4.length = function(quat) {
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	return Math.sqrt(x*x + y*y + z*z + w*w);
}

/*
 * quat4.normalize
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * Params:
 * quat - quat4 to normalize
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.normalize = function(quat, dest) {
	if(!dest) { dest = quat; }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	var len = Math.sqrt(x*x + y*y + z*z + w*w);
	if(len == 0) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		dest[3] = 0;
		return dest;
	}
	len = 1/len;
	dest[0] = x * len;
	dest[1] = y * len;
	dest[2] = z * len;
	dest[3] = w * len;

	return dest;
}

/*
 * quat4.multiply
 * Performs a quaternion multiplication
 *
 * Params:
 * quat - quat4, first operand
 * quat2 - quat4, second operand
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.multiply = function(quat, quat2, dest) {
	if(!dest) { dest = quat; }

	var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3];
	var qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

	dest[0] = qax*qbw + qaw*qbx + qay*qbz - qaz*qby;
	dest[1] = qay*qbw + qaw*qby + qaz*qbx - qax*qbz;
	dest[2] = qaz*qbw + qaw*qbz + qax*qby - qay*qbx;
	dest[3] = qaw*qbw - qax*qbx - qay*qby - qaz*qbz;

	return dest;
}

/*
 * quat4.multiplyVec3
 * Transforms a vec3 with the given quaternion
 *
 * Params:
 * quat - quat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
quat4.multiplyVec3 = function(quat, vec, dest) {
	if(!dest) { dest = vec; }

	var x = vec[0], y = vec[1], z = vec[2];
	var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

	var ix = qw*x + qy*z - qz*y;
	var iy = qw*y + qz*x - qx*z;
	var iz = qw*z + qx*y - qy*x;
	var iw = -qx*x - qy*y - qz*z;

	dest[0] = ix*qw + iw*-qx + iy*-qz - iz*-qy;
	dest[1] = iy*qw + iw*-qy + iz*-qx - ix*-qz;
	dest[2] = iz*qw + iw*-qz + ix*-qy - iy*-qx;

	return dest;
}

/*
 * quat4.toMat3
 * Calculates a 3x3 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat3 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat3 otherwise
 */
quat4.toMat3 = function(quat, dest) {
	if(!dest) { dest = mat3.create(); }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;

	dest[3] = xy + wz;
	dest[4] = 1 - (xx + zz);
	dest[5] = yz - wx;

	dest[6] = xz - wy;
	dest[7] = yz + wx;
	dest[8] = 1 - (xx + yy);

	return dest;
}

/*
 * quat4.toMat4
 * Calculates a 4x4 matrix from the given quat4
 *
 * Params:
 * quat - quat4 to create matrix from
 * dest - Optional, mat4 receiving operation result
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 */
quat4.toMat4 = function(quat, dest) {
	if(!dest) { dest = mat4.create(); }

	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];

	var x2 = x + x;
	var y2 = y + y;
	var z2 = z + z;

	var xx = x*x2;
	var xy = x*y2;
	var xz = x*z2;

	var yy = y*y2;
	var yz = y*z2;
	var zz = z*z2;

	var wx = w*x2;
	var wy = w*y2;
	var wz = w*z2;

	dest[0] = 1 - (yy + zz);
	dest[1] = xy - wz;
	dest[2] = xz + wy;
	dest[3] = 0;

	dest[4] = xy + wz;
	dest[5] = 1 - (xx + zz);
	dest[6] = yz - wx;
	dest[7] = 0;

	dest[8] = xz - wy;
	dest[9] = yz + wx;
	dest[10] = 1 - (xx + yy);
	dest[11] = 0;

	dest[12] = 0;
	dest[13] = 0;
	dest[14] = 0;
	dest[15] = 1;

	return dest;
}

/*
 * quat4.slerp
 * Performs a spherical linear interpolation between two quat4
 *
 * Params:
 * quat - quat4, first quaternion
 * quat2 - quat4, second quaternion
 * lerp - interpolation amount between the two inputs
 * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
 *
 * Returns:
 * dest if specified, quat otherwise
 */
quat4.slerp = function(quat, quat2, lerp, dest) {
    if(!dest) { dest = quat; }

    var eps_lerp = lerp;

    var dot = quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
    if (dot < 0.0) {
        eps_lerp = -1.0 * lerp;
    }

    dest[0] = 1.0 - lerp * quat[0] + eps_lerp * quat2[0];
    dest[1] = 1.0 - lerp * quat[1] + eps_lerp * quat2[1];
    dest[2] = 1.0 - lerp * quat[2] + eps_lerp * quat2[2];
    dest[3] = 1.0 - lerp * quat[3] + eps_lerp * quat2[3];

    return dest;
}

/*
 * quat4.str
 * Returns a string representation of a quaternion
 *
 * Params:
 * quat - quat4 to represent as a string
 *
 * Returns:
 * string representation of quat
 */
quat4.str = function(quat) {
	return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
}

/*
  Core functions borrowed from Prototype. I don't think these are stepping on anyone's (e.g. jQuery's) toes,
  but if I find out otherwise I'll have to tweak it. The goal here is to be totally compatible with other libraries
  wherever possible.
*/

Jax.$A = function(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
};

/* TODO find a way to avoid polluting Object. */
Object.isFunction = function(arg) { return Object.prototype.toString.call(arg) === '[object Function]'; };
Object.isUndefined = function(object) { return typeof object === "undefined"; };
Object.isArray = function(object) { return Object.prototype.toString.call(object) === '[object Array]'; };
Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  };
})());

Jax.Class = (function() {
  var emptyFunction = function() { };

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = Jax.$A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Jax.Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
Math.EPSILON = Math.EPSILON || 0.00001;


Math.radToDeg = Math.radToDeg || function(rad) {
  return rad * 180.0 / Math.PI;
};

Math.degToRad = Math.degToRad || function(deg) {
  return deg * Math.PI / 180.0;
};
Jax.Util = {
  merge: function(src, dst) {
    if (!src) return;
    var i;

    function doComparison(i) {
      if (src[i] == null) dst[i] = null;
      else if (Object.isArray(src[i]))     Jax.Util.merge(src[i], dst[i] = dst[i] || []);
      else if (typeof(src[i]) == "object") Jax.Util.merge(src[i], dst[i] = dst[i] || {});
      else dst[i] = src[i];
    }

    if (Object.isArray(src)) for (i = 0; i < src.length; i++) doComparison(i);
    else for (i in src) doComparison(i);

    return dst;
  },

  normalizeOptions: function(incoming, defaults) {
    var result = {};
    Jax.Util.merge(defaults, result);
    Jax.Util.merge(incoming, result);
    return result;
  },

  sizeofFormat: function(glEnum) {
    switch(glEnum) {
      case GL_ALPHA: return 1;           // alpha component only
      case GL_LUMINANCE: return 1;       // luminance component only
      case GL_RGB: return 3;             // RGB triplet
      case GL_RGBA: return 4;            // all 4 components
      case GL_LUMINANCE_ALPHA: return 2; // luminance/alpha pair
    }
    throw new Error("Unrecognized format: "+Jax.Util.enumName(glEnum));
  },

  enumName: function(glEnum) {
    for (var i in window) {
      if (i.indexOf("GL_") == 0 && window[i] == glEnum)
        return i;
    }
    return "(unrecognized enum: "+glEnum+" [0x"+parseInt(glEnum).toString(16)+"])";
  }
};

Jax.IDENTITY_MATRIX = mat4.identity(mat4.create());

Jax.MatrixStack = (function() {
  var MODEL = 1, VIEW = 2, PROJECTION = 3;

  function updateMVP(self) {
    mat4.multiply(self.getProjectionMatrix(), self.getModelViewMatrix(), self.getModelViewProjectionMatrix());
  }

  function updateModelView(self) {
    mat4.multiply(self.getInverseViewMatrix(), self.getModelMatrix(), self.getModelViewMatrix());
    mat4.inverse(self.getModelViewMatrix(), self.getInverseModelViewMatrix());
    updateMVP(self);
  }

  function updateNormal(self) {
    mat4.toMat3(self.getInverseModelViewMatrix(), self.getNormalMatrix());
    mat3.transpose(self.getNormalMatrix());
  }

  function mMatrixUpdated(self) {
    mat4.inverse(self.getModelMatrix(), self.getInverseModelMatrix());
    updateModelView(self);
    updateNormal(self);
  }

  function vMatrixUpdated(self) {
    mat4.inverse(self.getViewMatrix(), self.getInverseViewMatrix());
    updateModelView(self);
    updateNormal(self);
  }

  function pMatrixUpdated(self) {
    mat4.inverse(self.getProjectionMatrix(), self.getInverseProjectionMatrix());
    updateMVP(self);
  }

  function loadMatrix(self, which, values) {
    switch(which) {
      case MODEL:
        mat4.set(values, self.getModelMatrix());
        mMatrixUpdated(self);
        break;
      case VIEW:
        mat4.set(values, self.getViewMatrix());
        vMatrixUpdated(self);
        break;
      case PROJECTION:
        mat4.set(values, self.getProjectionMatrix());
        pMatrixUpdated(self);
        break;
      default: throw new Error("programming error: matrix ID not understood: "+which);
    }
  }

  function multMatrix(self, which, values) {
    switch(which) {
      case MODEL:
        mat4.multiply(self.getModelMatrix(), values, self.getModelMatrix());
        mMatrixUpdated(self);
        break;
      case VIEW:
        mat4.multiply(self.getViewMatrix(), values, self.getViewMatrix());
        vMatrixUpdated(self);
        break;
      case PROJECTION:
        mat4.multiply(self.getProjectionMatrix(), values, self.getProjectionMatrix());
        pMatrixUpdated(self);
        break;
      default: throw new Error("programming error: matrix ID not understood: "+which);
    }
  }

  /*
    iterates through each matrix stack in self.matrices and pushes a new matrix onto the stack.
    If the new matrix level already has a matrix, it is used; otherwise, a new one is allocated.
    Then, the current level's matrix values are copied into the next level's matrix.
   */
  function pushMatrix(self) {
    var current;
    var stack;
    var current_depth = self.depth;
    var type;

    self.depth++;
    for (var i in self.matrices) {
      stack = self.matrices[i];
      current = stack[current_depth];
      type = (current.length == 9 ? mat3 : mat4);
      stack[self.depth] = stack[self.depth] || type.create();
      type.set(current, stack[self.depth]);
    }
  }

  return Jax.Class.create({
    push: function() { pushMatrix(this); },

    pop: function() { this.depth--; },

    reset: function() { this.depth = 0; },

    loadModelMatrix: function(values) { loadMatrix(this, MODEL, values); return this; },

    loadViewMatrix: function(values) { loadMatrix(this, VIEW, values); return this; },

    loadProjectionMatrix: function(values) { loadMatrix(this, PROJECTION, values); return this; },

    multModelMatrix: function(values) { multMatrix(this, MODEL, values); return this; },

    multViewMatrix: function(values) { multMatrix(this, VIEW, values); return this; },

    multProjectionMatrix: function(values) { multMatrix(this, PROJECTION, values); return this; },

    getModelMatrix: function() { return this.matrices.model[this.depth]; },

    getInverseModelMatrix: function() { return this.matrices.inverse_model[this.depth]; },

    getNormalMatrix: function() { return this.matrices.normal[this.depth]; },

    getViewMatrix: function() { return this.matrices.view[this.depth]; },

    getInverseViewMatrix: function() { return this.matrices.inverse_view[this.depth]; },

    getModelViewMatrix: function() { return this.matrices.modelview[this.depth]; },

    getInverseModelViewMatrix: function() { return this.matrices.inverse_modelview[this.depth]; },

    getProjectionMatrix: function() { return this.matrices.projection[this.depth]; },

    getModelViewProjectionMatrix: function() { return this.matrices.modelview_projection[this.depth]; },

    getInverseProjectionMatrix: function() { return this.matrices.inverse_projection[this.depth]; },

    initialize: function() {
      this.depth = 0;

      this.matrices = {
        /* matrix depth, essentially the array index representing the current level in the stack. */
        model: [mat4.create()],
        inverse_model: [mat4.create()],
        normal: [mat3.create()],
        view: [mat4.create()],
        inverse_view: [mat4.create()],
        modelview: [mat4.create()],
        inverse_modelview: [mat4.create()],
        projection: [mat4.create()],
        inverse_projection: [mat4.create()],
        modelview_projection: [mat4.create()]
      };

      this.loadModelMatrix(Jax.IDENTITY_MATRIX);
      this.loadViewMatrix(Jax.IDENTITY_MATRIX);
      this.loadProjectionMatrix(Jax.IDENTITY_MATRIX); // there's no known data about the viewport at this time.
    }
  });
})();

window.debugAssert = function(expr, msg) {
  if (Jax.environment != "production" && !expr)
  {
    var error = new Error(msg || "debugAssert failed");
    if (error.stack) error = new Error((msg || "debugAssert failed")+"\n\n"+error.stack);
    throw error;
  }
};

if (glMatrixArrayType.prototype.toString != Array.prototype.toString) {
  glMatrixArrayType.prototype.toString = function() {
    var s = "["+glMatrixArrayType.name+": ";
    var d = false;
    for (var i in this) {
      if (parseInt(i) == i) {
        if (d) s += ",";
        s += this[i];
        d = true;
      }
    }
    s += "]";
    return s;
  }
}
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/*
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();


/* My own custom extensions to Prototype */


(function() {
  /*
    Prototype doesn't seem to have a way to add instance methods to all classes (a generic base object would have
    been nice) so we have to hack it in by aliasing ::create and then replacing it.
  */
  Jax.Class.InstanceMethods = {
    isKindOf: function(klass) {
      return(this instanceof klass);
    }
  };

  var original_create = Jax.Class.create;
  Jax.Class.create = function() {
    var klass = original_create.apply(Jax.Class, arguments);
    klass.addMethods(Jax.Class.InstanceMethods);
    return klass;
  };

  /* for adding class methods only */
})();
Jax.ViewHelper = {
  create: function(methods) {
    Jax.View.addMethods(methods);
    return methods;
  }
};
(function() {
  function initProperties(self, data) {
    var attribute;

    if (data) {
      for (attribute in data) {
        switch(attribute) {
          case 'position':    self.camera.setPosition(data[attribute]); break;
          case 'direction':   self.camera.orient(data[attribute]); break;
          case 'mesh':
            if (data[attribute].isKindOf(Jax.Mesh)) self.mesh = data[attribute];
            else throw new Error("Unexpected value for mesh:\n\n"+JSON.stringify(data[attribute]));
            break;
          default:
            self[attribute] = data[attribute];
        }
      }
    }
  }

  Jax.Model = (function() {
    return Jax.Class.create({
      initialize: function(data) {
        this.camera = new Jax.Camera();

        this.shadow_caster = true;
        if (this._klass && this._klass.resources)
          initProperties(this, this._klass.resources['default']);
        initProperties(this, data);

        if (this.after_initialize) this.after_initialize();
      },

      isShadowCaster: function() { return this.shadow_caster; },

      render: function(context, options) {
        if (this.mesh)
        {
          var self = this;
          context.pushMatrix(function() {
            context.multMatrix(self.camera.getModelViewMatrix());
            self.mesh.render(context, options);
          });
        }
      },

      getBoundingCube: function() {
        if (!this.mesh.built) this.mesh.rebuild();
        return this.mesh.bounds;
      },

      getBoundingSphereRadius: function() {
        var b = this.getBoundingCube();
        return Math.max(b.width, Math.max(b.height, b.depth));
      },

      dispose: function() {
        if (this.mesh)
          this.mesh.dispose();
      },

      inspect: function() {
        result = {};
        for (var i in this)
          if (!Object.isFunction(this[i]) && i != "_klass")
            result[i] = this[i];
        return JSON.stringify(result);
      }
    });
  })();

  var model_class_methods = {
    find: function(id) {
      for (var resource_id in this.resources) {
        if (id == resource_id)
          return new this(this.resources[id]);
      }
      throw new Error("Resource '"+id+"' not found!");
    },

    addResources: function(resources) {
      this.resources = this.resources || {};
      for (var id in resources)
        if (this.resources[id]) throw new Error("Duplicate resource ID: "+id);
        else this.resources[id] = resources[id];
    }
  };

  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Jax.Class.create(superclass, inner);
    else       klass = Jax.Class.create(Jax.Model, superclass);

    klass.addMethods({_klass:klass});

    Object.extend(klass, model_class_methods);
    return klass;
  };
})();
(function() {
  var protected_instance_method_names = [
    'initialize', 'toString', 'getControllerName', 'constructor', 'isKindOf', 'fireAction',
    'eraseResult'
  ];

  function is_protected(method_name) {
    for (var i = 0; i < protected_instance_method_names.length; i++)
      if (protected_instance_method_names[i] == method_name)
        return true;
    return false;
  }

  Jax.Controller = (function() {
    function setViewKey(self) {
      self.view_key = self.getControllerName()+"/"+self.action_name;
      self.rendered_or_redirected = true;
    }

    return Jax.Class.create({
      fireAction: function(action_name) {
        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");

        if (!this.rendered_or_redirected)
          setViewKey(this);
      },

      eraseResult: function() {
        this.rendered_or_redirected = false;
        this.view_key = null;
      }
    });
  })();

  var controller_class_methods = {
    invoke: function(action_name, context) {
      var instance = new this();
      instance.context = context;
      instance.world = context && context.world;
      instance.player = context && context.player;
      instance.fireAction(action_name);
      return instance;
    }
  };

  Jax.Controller.create = function(controller_name, superclass, inner) {
    if (typeof(controller_name) != "string")
    {
      inner = superclass;
      superclass = controller_name;
      controller_name = "generic";
    }

    var klass;
    if (inner) klass = Jax.Class.create(superclass,     inner);
    else       klass = Jax.Class.create(Jax.Controller, superclass);

    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name; } });
    klass.addMethods({getControllerName: function() { return controller_name; } });

    for (var method_name in klass.prototype)
    {
      if (!is_protected(method_name)) {
        Jax.routes.map(controller_name+"/"+method_name, klass, method_name);
      }
    }

    return klass;
  };
})();
Jax.ViewManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.views = {};
    },

    push: function(path, view) {
      this.views[path] = view;
    },

    get: function(path) {
      if (this.views[path])
        return new Jax.View(this.views[path]);
      else throw new Error("Could not find view at '"+path+"'!");
    },

    find: function(path) { return this.get(path); }
  });
})();
Jax.RouteSet = (function() {
  function set_route(self, path, route_descriptor) {
    return self._map[path] = route_descriptor;
  }

  function find_route(self, path) {
    return self._map[path] || null;
  }

  return Jax.Class.create({
    initialize: function() {
      this.clear();
    },

    clear: function() {
      this._map = {};
    },

    root: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, "/", this.getRouteDescriptor.apply(this, args));
    },

    map: function(path) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, path, this.getRouteDescriptor.apply(this, args));
    },

    getRouteDescriptor: function() {
      var route_descriptor;
      switch(arguments.length) {
        case 1:
          if (typeof(arguments[0]) == "object")
          {
            route_descriptor = arguments[0];
            if (!route_descriptor.action) route_descriptor.action = "index";
            return arguments[0];
          }
          else return { controller: arguments[0], action: "index" };
        case 2: return { controller: arguments[0], action: arguments[1] };
        case 3:
          route_descriptor = arguments[3];
          route_descriptor.controller = arguments[0];
          route_descriptor.action = arguments[1];
          return route_descriptor;
        default: throw new Error("Invalid arguments");
      };
    },

    recognize_route: function(path) {
      var route = find_route(this, path);
      if (!route) throw new Error("Route not recognized: '"+path+"'");
      return route;
    },

    isRouted: function(path) {
      return !!find_route(this, path);
    },

    dispatch: function(path, context) {
      var route = this.recognize_route(path);

      return route.controller.invoke(route.action, context);
    }
  });
})();
Jax.View = (function() {
  return Jax.Class.create({
    initialize: function(view_func) {
      this.view_func = view_func;
    },

    render: function() {
      this.view_func();
    }
  });
})();
/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */


window['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
window['WEBGL_CONTEXT_OPTIONS'] = {stencil:true};
window['GL_METHODS'] = {};

(function() {
  var canvas = document.createElement("canvas");
  canvas.setAttribute("id", "temporary-internal-use");
  canvas.style.display = "block";

  var body = document.getElementsByTagName("body")[0], temporaryBody = false;
  if (!body)
  {
    temporaryBody = true;
    body = document.createElement("body");
    document.getElementsByTagName("html")[0].appendChild(body);
  }
  body.appendChild(canvas);

  var gl = canvas.getContext(WEBGL_CONTEXT_NAME);

  if (gl) {
    for (var method_name in gl)
    {
      if (typeof(gl[method_name]) == "function")
      {
        var camelized_method_name = method_name.substring(1, method_name.length);
        camelized_method_name = "gl" + method_name.substring(0, 1).toUpperCase() + camelized_method_name;

        /* we'll add a layer here to check for render errors */
        var func = "(function "+camelized_method_name+"() {"
                 + "  var result;"
                 + "  try { "
                 + "    result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + ((method_name != "getError") ? "    this.checkForRenderErrors();" : "")
                 + "  } catch(e) { "
                 + "    var args = [], i;"
                 + "    for (i = 0; i < arguments.length; i++) args.push(arguments[i]);"
                 + "    try { args = JSON.stringify(args); } catch(jsonErr) { args = args.toString(); }"
                 + "    if (!e.stack) e = new Error(e.toString());"
                 + (Jax.environment == "production" ? "" : "    alert(e+\"\\n\\n\"+e.stack);")
                 + "    this.handleRenderError('"+method_name+"', args, e);"
                 + "  }"
                 + "  return result;"
                 + "})";

        GL_METHODS[camelized_method_name] = eval("("+func+")");
      }
      else
      {
        /* define the GL enums globally so we don't need a context to reference them */
        if (!/[a-z]/.test(method_name)) // no lowercase letters
          window[('GL_'+method_name)] = gl[method_name];
      }
    }

    /* define some extra globals that the above didn't generate */
    window['GL_MAX_VERTEX_ATTRIBS'] = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    window['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    window['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) window['GL_TEXTURES'][i] = gl["TEXTURE"+i];
  }

  /* clean up after ourselves */
  if (temporaryBody)
    body.parentNode.removeChild(body);
})();

/* import other webgl files */

Jax.Shader = (function() {
  function getNormalizedAttribute(self, name) {
    if (!self.attributes) throw new Error("Attributes are undefined!");
    if (!self.attributes[name]) throw new Error("Attribute '"+name+"' is not registered!");

    switch(typeof(self.attributes[name])) {
      case 'object':
        break;
      default:
        self.attributes[name] = { value: self.attributes[name] };
    }
    self.attributes[name].name = self.attributes[name].name || name;
    self.attributes[name].locations = self.attributes[name].locations || {};

    return self.attributes[name];
  }

  function getNormalizedUniform(self, name) {
    if (!self.uniforms) throw new Error("Uniforms are undefined!");
    if (!self.uniforms[name]) throw new Error("Uniform '"+name+"' is not registered!");

    switch(typeof(self.uniforms[name])) {
      case 'object':
        break;
      default:
        self.uniforms[name] = { value: self.uniforms[name] };
    }
    self.uniforms[name].name = self.uniforms[name].name || name;
    self.uniforms[name].locations = self.uniforms[name].locations || {};

    return self.uniforms[name];
  }

  function getUniformLocation(self, context, uniform) {
    if (typeof(uniform.locations[context.id]) != "undefined") return uniform.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetUniformLocation(program, uniform.name);
    if (location == -1 || location == null)
      return null;
    return uniform.locations[context.id] = location;
  }

  function getAttributeLocation(self, context, attribute) {
    if (typeof(attribute.locations[context.id]) != "undefined") return attribute.locations[context.id];
    var program = self.compiled_program[context.id];
    if (!program) throw new Error("Shader program is not compiled!");
    var location = context.glGetAttribLocation(program, attribute.name);
    if (location == -1 || location == null) throw new Error("Attribute location for attribute '"+attribute.name+"' could not be found!");
    return attribute.locations[context.id] = location;
  }

  function compile(self, context) {
    var shaderType = self.options.shaderType;

    var builder = Jax.shader_program_builders[self.options.shaderType];
    if (!builder) throw new Error("Could not find shader builder: "+shaderType);
    var sources = builder(self.options);
    if (!sources.vertex_source)   throw new Error("Shader builder '"+shaderType+"' did not return a 'vertex_source' property");
    if (!sources.fragment_source) throw new Error("Shader builder '"+shaderType+"' did not return a 'fragment_source' property");

    if (sources.vertex_source.join)   sources.vertex_source   = sources.vertex_source.join("\n");
    if (sources.fragment_source.join) sources.fragment_source = sources.fragment_source.join("\n");

    sources.fragment_source = "#ifdef GL_ES\nprecision highp float;\n#endif\n" + sources.fragment_source;

    self.supports_shadows = sources.supports_shadows;
    self.uniforms   = sources.uniforms;
    self.attributes = sources.attributes;

    function doCompile(type, source) {
      var shader = context.glCreateShader(type);
      context.glShaderSource(shader, source);
      context.glCompileShader(shader);
      if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
        throw new Error(context.glGetShaderInfoLog(shader));
      return shader;
    }

    var fragmentShader = doCompile(GL_FRAGMENT_SHADER, sources.fragment_source);
    var vertexShader   = doCompile(GL_VERTEX_SHADER,   sources.vertex_source);
    var program = context.glCreateProgram();

    if (vertexShader)   context.glAttachShader(program, vertexShader);
    if (fragmentShader) context.glAttachShader(program, fragmentShader);
    context.glLinkProgram(program);

    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!");

    self.compiled_program[context.id] = program;
    self.valid[context.id] = true;
  }

  function doRenderPass(self, context, mesh, options) {
    var id;

    for (id in self.attributes) self.setAttribute(context, mesh, getNormalizedAttribute(self, id));
    for (id in self.uniforms)   self.setUniform(  context, mesh, getNormalizedUniform(self, id));

    var buffer;
    if (buffer = mesh.getIndexBuffer()) {
      buffer.bind(context);
      context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
    }
    else if (buffer = mesh.getVertexBuffer())
      context.glDrawArrays(options.draw_mode, 0, buffer.length);
  }

  return Jax.Class.create({
    initialize: function() {
      this.compiled_program = {};
      this.valid = {};
    },

    update: function(options) {
      this.options = options;
      for (var i in this.valid) this.valid[i] = false; // invalidate all contexts
    },

    render: function(context, mesh, options) {
      if (!this.options) throw new Error("Can't compile shader without shader options");
      if (!this.isCompiledFor(context))
        compile(this, context);

      context.glUseProgram(this.compiled_program[context.id]);
      if (this.supports_shadows && context.world.lighting.isEnabled()) {

        doRenderPass(this, context, mesh, options);
      } else {
        doRenderPass(this, context, mesh, options);
      }
    },

    setAttribute: function(context, mesh, attribute) {
      var value = attribute.value;
      if (typeof(value) == "function") value = value(context, mesh);
      if (value == null || typeof(value) == "undefined") return this.disableAttribute(context, attribute);
      var location = getAttributeLocation(this, context, attribute);

      value.bind(context);
      context.glEnableVertexAttribArray(location);
      context.glVertexAttribPointer(location, value.itemSize, attribute.type || value.type || GL_FLOAT, false, 0, 0);
    },

    setUniform: function(context, mesh, uniform) {
      var value = uniform.value;
      if (typeof(value) == "function") value = value.call(uniform, context, mesh);

      var location = getUniformLocation(this, context, uniform);
      if (!location) return;

      /* TODO perhaps we should only do this matching in development mode. Can it happen in prod? */
      var match;
      if (Object.isArray(value) && (match = /([0-9]+)fv$/.exec(uniform.type)) && (match = match[1]))
      {
        if (match != (value.itemSize ? value.length / value.itemSize : value.length))
          throw new Error("Value "+JSON.stringify(value)+" has "+value.length+" elements (expected "+match+")");
      }

      if (value == null || typeof(value) == "undefined")
        throw new Error("Value is undefined or null for uniform '"+uniform.name+"'!");

      if (!context[uniform.type]) throw new Error("Invalid uniform type: "+uniform.type);
      try {
        if (uniform.type.indexOf("glUniformMatrix") != -1) context[uniform.type](location, false, value);
        else                                               context[uniform.type](location,        value);
      } catch(e) {
        if (Jax.environment == "production") throw(e);
        else alert("Could not set uniform "+uniform.name+" with value:\n\n"+value);
      }
    },

    disableAttribute: function(context, attribute) {
      context.glDisableVertexAttribArray(getAttributeLocation(this, context, attribute));
    },

    isCompiledFor: function(context) {
      return this.valid[context.id] && !!this.compiled_program[context.id];
    }
  });
})();

Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {};
    self.previous.shininess   = self.shininess;
    self.previous.shaderType  = self.shaderType;
    self.previous.diffuse     = self.diffuse;
    self.previous.ambient     = self.ambient;
    self.previous.specular    = self.specular;
    self.previous.emissive    = self.emissive;
    self.previous.light_count = self.light_count;
    self.previous.lights      = self.lights;
  }

  function compile(self, context) {
    self.shader = new Jax.Shader();
    self.shader.update(self);
    updatePrevious(self);
  }

  return Jax.Class.create({
    initialize: function(options) {
      options = options || {};

      this.diffuse = options.diffuse  || [0.8, 0.8, 0.8, 1.0];
      this.ambient = options.ambient  || [0.02, 0.02, 0.02, 1.0];
      this.specular = options.specular || [1.0, 1.0, 1.0, 1.0];
      this.emissive = options.emissive || [0.0, 0.0, 0.0, 1.0];
      this.shininess = typeof(options.shininess) == "undefined" ?   10    : options.shininess;
      this.shaderType = typeof(options.shaderType) == "undefined" ? "blinn-phong" : options.shaderType;
    },

    render: function(context, mesh, options) {
      this.lights = context.world.lighting._lights;
      this.light_count = context.world.lighting._lights.length;

      if (this.isChanged())
        compile(this, context);

      this.shader.render(context, mesh, options);
    },

    isChanged: function() {
      if (!this.previous) return true;
      var i;
      for (i = 0; i < 3; i++) {
        if (this.diffuse[i]  != this.previous.diffuse[i])  return true;
        if (this.ambient[i]  != this.previous.ambient[i])  return true;
        if (this.specular[i] != this.previous.specular[i]) return true;
        if (this.emissive[i] != this.previous.emissive[i]) return true;
      }

      if (this.shininess  != this.previous.shininess)   return true;
      if (this.shaderType != this.previous.shaderType) return true;

      if (this.lights && this.lights.length != this.previous.light_count) return true;
      if (!this.lights && this.previous.light_count)   return true;

      return false;
    }
  });
})();

Jax.Material.instances = {};

Jax.Material.find = function(name) {
  var result;
  if (result = Jax.Material.instances[name])
    return result;
  if (Jax.shader_program_builders[name])
    return Jax.Material.create(name, {shaderType:name});
  throw new Error("Material not found: '"+name+"'!");
};

Jax.Material.create = function(name, options) {
  return Jax.Material.instances[name] = new Jax.Material(options);
};

Jax.Material.create('failsafe', {shaderType: 'failsafe'});
Jax.Material.create('default' , {shaderType: 'blinn-phong'});
Jax.Core = {};

Jax.Core.Face = Jax.Class.create({
  initialize: function(vertexIndices) {
    if (arguments.length > 1)
      this.vertexIndices = vec3.create(arguments);
    else if (vertexIndices)
      this.vertexIndices = vec3.create(vertexIndices);
  }
});
Jax.Core.Edge = Jax.Class.create({
  initialize: function() {
    this.faceIndices = [];
    this.vertexIndices = [];
  }
});
Jax.Buffer = (function() {
  function each_gl_buffer(self, func)
  {
    for (var id in self.gl)
      func(self.gl[id].context, self.gl[id].buffer);
  }

  return Jax.Class.create({
    initialize: function(bufferType, classType, drawType, jsarr, itemSize) {
      if (jsarr.length == 0) throw new Error("No elements in array to be buffered!");
      if (!itemSize) throw new Error("Expected an itemSize - how many JS array elements represent a single buffered element?");
      this.classType = classType;
      this.itemSize = itemSize;
      this.js = jsarr;
      this.gl = {};
      this.numItems = this.length = jsarr.length / itemSize;
      this.bufferType = bufferType;
      this.drawType = drawType;
    },

    refresh: function() {
      var self = this;
      if (self.classTypeInstance)
        for (var i = 0; i < self.js.length; i++)
          self.classTypeInstance[i] = self.js[i];
      else
        self.classTypeInstance = new self.classType(self.js);

      self.numItems = self.length = self.js.length / self.itemSize;
      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
        buffer.numItems = buffer.length = self.js.length;
        context.glBindBuffer(self.bufferType, buffer);
        context.glBufferData(self.bufferType, self.classTypeInstance, self.drawType);
      });
    },

    dispose: function() {
      var self = this;
      each_gl_buffer(this, function(context, buffer) {
        context.glDeleteBuffer(buffer);
        self.gl[context.id] = null;
      });
      self.gl = {};
    },

    isDisposed: function() { return !this.gl; },

    bind: function(context) { context.glBindBuffer(this.bufferType, this.getGLBuffer(context)); },

    getGLBuffer: function(context)
    {
      if (!context || typeof(context.id) == "undefined")
        throw new Error("Cannot build a buffer without a context!");

      if (!this.gl[context.id])
      {
        var buffer = context.glCreateBuffer();
        buffer.itemSize = this.itemSize;
        this.gl[context.id] = {context:context,buffer:buffer};
        this.refresh();
      }
      return this.gl[context.id].buffer;
    }
  });
})();

Jax.ElementArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr) {
    $super(GL_ELEMENT_ARRAY_BUFFER, Uint16Array, GL_STREAM_DRAW, jsarr, 1);
  }
});

Jax.FloatArrayBuffer = Jax.Class.create(Jax.Buffer, {
  initialize: function($super, jsarr, itemSize) {
    $super(GL_ARRAY_BUFFER, Float32Array, GL_STATIC_DRAW, jsarr, itemSize);
  }
});

Jax.VertexBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});

Jax.ColorBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 4); }
});

Jax.TextureCoordsBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 2); }
});

Jax.NormalBuffer = Jax.Class.create(Jax.FloatArrayBuffer, {
  initialize: function($super, jsarr) { $super(jsarr, 3); }
});
Jax.Framebuffer = (function() {
  function build(context, self) {
    var handle = context.glCreateFramebuffer();
    var width = self.options.width, height = self.options.height;

    self.setHandle(context, handle);
    context.glBindFramebuffer(GL_FRAMEBUFFER, handle);

    if (self.options.depth && self.options.stencil) {
      handle.depthstencilbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.depthstencilbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_STENCIL, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.depthstencilbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }

    if (self.options.depth && !self.options.stencil) {
      handle.depthbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.depthbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, handle.depthbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }

    if (self.options.stencil && !self.options.depth) {
      handle.stencilbuffer = context.glCreateRenderbuffer();
      context.glBindRenderbuffer(GL_RENDERBUFFER, handle.stencilbuffer);
      context.glRenderbufferStorage(GL_RENDERBUFFER, GL_STENCIL_INDEX8, width, height);
      context.glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.stencilbuffer);
      context.glBindRenderbuffer(GL_RENDERBUFFER, null);
    }

    handle.textures = [];
    var attachment = GL_COLOR_ATTACHMENT0;
    for (var i = 0; i < self.options.colors.length; i++) {
      var format = self.options.colors[i];
      handle.textures[i] = context.glCreateTexture();
      context.glBindTexture(GL_TEXTURE_2D, handle.textures[i]);
      try {
        context.glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, null);
      } catch (e) {
        var tex = new Uint8Array(width*height*Jax.Util.sizeofFormat(format));
        context.glTexImage2D(GL_TEXTURE_2D, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, tex);
      }

      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
      context.glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);


      context.glBindTexture(GL_TEXTURE_2D, null);
      context.glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, handle.textures[i], 0);
      attachment++;
    }

    checkStatus(context, self);
  }

  function checkStatus(context, self) {
    var status = context.glCheckFramebufferStatus(GL_FRAMEBUFFER);
    self.unbind(context);
    switch(status) {
      case GL_FRAMEBUFFER_COMPLETE:
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        throw new Error("Jax.Framebuffer: one or more attachments is incomplete. (GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        throw new Error("Jax.Framebuffer: there are no images attached to the framebuffer. (GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        throw new Error("Jax.Framebuffer: all attachments must have the same dimensions. (GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS)");
      case GL_FRAMEBUFFER_UNSUPPORTED:
        throw new Error("Jax.Framebuffer: the requested framebuffer layout is unsupported on this hardware. (GL_FRAMEBUFFER_UNSUPPORTED)");
      case (window['GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER'] || 0x8cdb):
        throw new Error("Jax.Framebuffer: make sure the framebuffer has at least 1 texture attachment. (GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER)");
      default:
        var which;
        for (which in context.gl)
          if (context.gl[which] == status)
            throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+" - "+which+")");
        throw new Error("Jax.Framebuffer: an unknown error occurred. ("+status+")");
    }
  }

  return Jax.Class.create({
    initialize: function(options) {
      var defaults = {
        depth: false,
        stencil: false,
        width:512,
        height:512
      };
      if (!(options && (options.color || options.colors))) defaults.colors = [GL_RGBA];

      this.handles = {};
      this.options = options = Jax.Util.normalizeOptions(options, defaults);
      if (options.color != undefined) {
        if (options.colors != undefined) options.colors.push(options.color);
        else options.colors = [options.color];
        delete options.color;
      }
    },

    bind: function(context, callback) {
      if (!this.getHandle(context)) build(context, this);
      context.glBindFramebuffer(GL_FRAMEBUFFER, this.getHandle(context));
      context.glViewport(0,0,this.options.width,this.options.height);

      if (callback) {
        callback.call(this);
        this.unbind(context);
      }
    },

    unbind: function(context) {
      context.glBindFramebuffer(GL_FRAMEBUFFER, null);
      context.glViewport(0, 0, context.canvas.width, context.canvas.height);
    },

    getTextureBuffer: function(context, index) { return this.getHandle(context).textures[index]; },

    getHandle: function(context) { return this.handles[context.id]; },
    setHandle: function(context, handle) { this.handles[context.id] = handle; }
  });
})();

Jax.Mesh = (function() {
  function setColorCoords(self, count, color, coords) {
    var i, j;
    for (i = 0; i < count; i++)
      for (j = 0; j < color.length; j++)
        coords.push(color[j]);
  }

  function findMaterial(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
      return name_or_instance;

    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  }

  function normalizeRenderOptions(self, options) {
    var result = {};
    options = options || result;
    result.material = findMaterial(options.material || self.material);
    result.draw_mode = options.draw_mode || self.draw_mode || GL_TRIANGLES;

    return result;
  }

  function calculateBounds(self, vertices) {
    self.bounds = {left:null,right:null,top:null,bottom:null,front:null,back:null,width:null,height:null,depth:null};
    var i, v;

    for (i = 0; i < vertices.length; i++)
    {
      v = vertices[i];
      if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
      if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;

      v = vertices[++i];
      if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
      if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;

      v = vertices[++i];
      if (self.bounds.front == null || v < self.bounds.front)  self.bounds.front  = v;
      if (self.bounds.back  == null || v > self.bounds.back)   self.bounds.back   = v;
    }

    self.bounds.width = self.bounds.right - self.bounds.left;
    self.bounds.height= self.bounds.top   - self.bounds.bottom;
    self.bounds.depth = self.bounds.front - self.bounds.back;
  }

  function ensureBuilt(self) {
    if (!self.isValid()) self.rebuild();
  }

  return Jax.Class.create({
    initialize: function(options) {
      this.buffers = {};

      this.material = "default";

      for (var i in options)
        this[i] = options[i];

      if (!this.draw_mode)
        this.draw_mode = GL_TRIANGLES;
    },

    dispose: function() {
      while (this.faces && this.faces.length) this.faces.pop();
      while (this.edges && this.edges.length) this.edges.pop();
      for (var i in this.buffers) {
        this.buffers[i].dispose();
        delete this.buffers[i];
      }
      this.built = false;
    },

    getFaceVertices: function(face) {
      return [
                [this.getVertexBuffer().js[face.vertexIndices[0]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[0]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[0]*3+2]
                ],
                [this.getVertexBuffer().js[face.vertexIndices[1]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[1]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[1]*3+2]
                ],
                [this.getVertexBuffer().js[face.vertexIndices[2]*3+0],
                 this.getVertexBuffer().js[face.vertexIndices[2]*3+1],
                 this.getVertexBuffer().js[face.vertexIndices[2]*3+2]
                ]
             ];
    },

    getEdgeVertices: function(edge) {
      return [
                [this.getVertexBuffer().js[edge.vertexIndices[0]*3+0],
                 this.getVertexBuffer().js[edge.vertexIndices[0]*3+1],
                 this.getVertexBuffer().js[edge.vertexIndices[0]*3+2]
                ],
                [this.getVertexBuffer().js[edge.vertexIndices[1]*3+0],
                 this.getVertexBuffer().js[edge.vertexIndices[1]*3+1],
                 this.getVertexBuffer().js[edge.vertexIndices[1]*3+2]
                ]
             ];
    },

    render: function(context, options) {
      if (!this.isValid()) this.rebuild();
      options = normalizeRenderOptions(this, options);
      options.material.render(context, this, options);
    },

    getVertexBuffer: function() { ensureBuilt(this); return this.buffers.vertex_buffer; },
    getColorBuffer:  function() { ensureBuilt(this); return this.buffers.color_buffer;  },
    getIndexBuffer:  function() { ensureBuilt(this); return this.buffers.index_buffer;  },
    getNormalBuffer: function() { ensureBuilt(this); return this.buffers.normal_buffer; },
    getTextureCoordsBuffer: function() { ensureBuilt(this); return this.buffers.texture_coords; },

    isValid: function() { return !!this.built; },

    rebuild: function() {
      this.dispose();

      var vertices = [], colors = [], textureCoords = [], normals = [], indices = [];
      if (this.init)
        this.init(vertices, colors, textureCoords, normals, indices);

      if (this.color)
        setColorCoords(this, vertices.length / 3, this.color, colors);

      if (colors.length == 0) // still no colors?? default to white
        setColorCoords(this, vertices.length / 3, [1,1,1,1], colors);

      if (vertices.length > 0)
      {
        this.buffers.vertex_buffer = new Jax.VertexBuffer(vertices);
        calculateBounds(this, vertices);
      }

      if (colors.length > 0) this.buffers.color_buffer = new Jax.ColorBuffer(colors);
      if (indices.length> 0) this.buffers.index_buffer = new Jax.ElementArrayBuffer(indices);
      if (normals.length> 0) this.buffers.normal_buffer= new Jax.NormalBuffer(normals);
      if (textureCoords.length > 0) this.buffers.texture_coords = new Jax.TextureCoordsBuffer(textureCoords);

      this.built = true;

      if (this.after_initialize) this.after_initialize();
    }
  });
})();
Jax.Events = (function() {
  return {
    Methods: {
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || [];
      },

      addEventListener: function(name, callback) {
        this.getEventListeners(name).push(callback);
      },

      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        for (var i = 0; i < listeners.length; i++)
          listeners[i].call(this, event_object);
      }
    }
  };
})();
Jax.Scene = {};

/* used by some shaders to determine what kind of shading is to be done.
 * This is stored in context.world.current_pass.
 */
Jax.Scene.ILLUMINATION_PASS = 1;
Jax.Scene.AMBIENT_PASS = 2;

Jax.Geometry = {};

Jax.Geometry.Plane = (function() {
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  return Jax.Class.create({
    initialize: function(points) {
      if (points) this.set.apply(this, arguments);
    },

    set: function(points) {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];

      this.normal = vec3.create();
      var vec = vec3.create();
      vec3.subtract(points[1], points[0], this.normal);
      vec3.subtract(points[2], points[0], vec);
      vec3.cross(this.normal, vec, this.normal);
      vec3.normalize(this.normal);

      this.point = points[1];
      this.d = -innerProduct(this.normal, this.point[0], this.point[1], this.point[2]);
    },

    setCoefficients: function(a, b, c, d) {
      var len = Math.sqrt(a*a+b*b+c*c);
      this.normal[0] = a/len;
      this.normal[1] = b/len;
      this.normal[2] = c/len;
      this.d = d/len;
    },

    distance: function(point)
    {
      var x, y, z;
      if (arguments.length == 3) { x = arguments[0]; y = arguments[1]; z = arguments[2]; }
      else { x = point[0]; y = point[1]; z = point[2]; }
      return this.d + innerProduct(this.normal, x, y, z);
    },

    whereis: function(point)
    {
      if (arguments.length == 3) points = [arguments[0], arguments[1], arguments[2]];
      var d = this.distance(point);
      if (d > 0) return Jax.Geometry.Plane.FRONT;
      if (d < 0) return Jax.Geometry.Plane.BACK;
      return Jax.Geometry.Plane.INTERSECT;
    }
  });
})();

Jax.Geometry.Plane.FRONT     = 1;
Jax.Geometry.Plane.BACK      = 2;
Jax.Geometry.Plane.INTERSECT = 3;

Jax.Scene.Frustum = (function() {
  var RIGHT = 0, LEFT = 1, BOTTOM = 2, TOP = 3, FAR = 4, NEAR = 5;
  var OUTSIDE = Jax.Geometry.Plane.BACK, INTERSECT = Jax.Geometry.Plane.INTERSECT, INSIDE = Jax.Geometry.Plane.FRONT;

  function extents(self)
  {
    /* TODO see how this can be combined with Camera#unproject */
    function extent(x, y, z)
    {
      var inf = [];
      var mm = self.mv, pm = self.p;

      var m = mat4.set(mm, mat4.create());

      mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
      mat4.multiply(pm, m, m);
      mat4.inverse(m, m);

      inf[0]=x;//*2.0-1.0;    /* x*2-1 translates x from 0..1 to -1..1 */
      inf[1]=y;//*2.0-1.0;
      inf[2]=z;//*2.0-1.0;
      inf[3]=1.0;

      var out = mat4.multiplyVec4(m, inf);
      if(out[3]==0.0)
         return [0,0,0];//null;

      out[3]=1.0/out[3];
      return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
    }

    var ntl = extent(-1,1,-1), ntr = extent(1,1,-1), nbl = extent(-1,-1,-1), nbr = extent(1,-1,-1),
        ftl = extent(-1,1,1), ftr = extent(1,1,1), fbl = extent(-1,-1,1), fbr = extent(1,-1,1);

    return {ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};
  }

  function varcube(self, position, w, h, d)
  {
    if (!self.mv || !self.p) return INSIDE;
    var p, c, c2 = 0, plane;

    w = w / 2.0;
    h = h / 2.0;
    d = d / 2.0;

    var xp = position[0]+w, xm=position[0]-w, yp=position[1]+h, ym=position[1]-h, zp=position[2]+d, zm=position[2]-d;

    for (p in self.planes)
    {
      plane = self.planes[p];
      c = 0;
      if (plane.distance(xp, yp, zp) > 0) c++;
      if (plane.distance(xm, yp, zp) > 0) c++;
      if (plane.distance(xp, ym, zp) > 0) c++;
      if (plane.distance(xm, ym, zp) > 0) c++;
      if (plane.distance(xp, yp, zm) > 0) c++;
      if (plane.distance(xm, yp, zm) > 0) c++;
      if (plane.distance(xp, ym, zm) > 0) c++;
      if (plane.distance(xm, ym, zm) > 0) c++;
      if (c == 0) return OUTSIDE;
      if (c == 8) c2++;
    }

    return (c2 == 6) ? INSIDE : INTERSECT;
  }

  function extractFrustum(self)
  {
    var frustum = self.planes;
    var e = extents(self);

    frustum[TOP].set(e.ntr, e.ntl, e.ftl);
    frustum[BOTTOM].set(e.nbl,e.nbr,e.fbr);
    frustum[LEFT].set(e.ntl,e.nbl,e.fbl);
    frustum[RIGHT].set(e.nbr,e.ntr,e.fbr);
    frustum[NEAR].set(e.ntl,e.ntr,e.nbr);
    frustum[FAR].set(e.ftr,e.ftl,e.fbl);
  }

  var klass = Jax.Class.create({
    initialize: function(modelview, projection) {
      this.listeners = {update:[]};
      this.callbacks = this.listeners;
      this.planes = {};
      for (var i = 0; i < 6; i++) this.planes[i] = new Jax.Geometry.Plane();
      this.setMatrices(modelview, projection);
    },

    update: function() { if (this.mv && this.p) { extractFrustum(this); this.fireListeners('update'); } },
    setModelviewMatrix: function(mv) { this.setMatrices(mv, this.p); },
    setProjectionMatrix: function(p) { this.setMatrices(this.mv, p); },

    setMatrices: function(mv, p) {
      this.mv = mv;
      this.p  = p;
      this.update();
    },

    point: function(point) {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 3) point = [arguments[0], arguments[1], arguments[2]];

      for(var i=0; i < 6; i++)
      {
        if (this.planes[i].distance(point) < 0)
          return OUTSIDE;
      }
      return INSIDE;
    },

    sphere: function(center, radius)
    {
      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length == 4) { center = [arguments[0], arguments[1], arguments[2]]; radius = arguments[3]; }

      var result = INSIDE, distance;
      for (var i = 0; i < 6; i++)
      {
        distance = this.planes[i].distance(center);
        if (distance < -radius) return OUTSIDE;
        else if (distance < radius) result = INTERSECT;
      }
      return result;
    },

    /* Arguments can either be an array of indices, or a position array [x,y,z] followed by width, height and depth.
        Examples:
          var cube = new Cube(...);
          frustum.cube(cube.getCorners());
          frustub.cube(cube.orientation.getPosition(), 1);
          frustub.cube(cube.orientation.getPosition(), 1, 2, 3);
     */
    cube: function(corners)
    {
      if (arguments.length == 2) { return varcube(this, arguments[0], arguments[1], arguments[1], arguments[1]); }
      if (arguments.length == 4) { return varcube(this, arguments[0], arguments[1], arguments[2], arguments[3]); }

      if (!this.mv || !this.p) return INSIDE;
      if (arguments.length > 1) { corners = arguments; }
      var p, c, c2 = 0, i, num_corners = corners.length, plane;
      for (p in this.planes)
      {
        plane = this.planes[p];
        c = 0;
        for (i = 0; i < num_corners; i++)
          if (plane.distance(corners[i]) > 0)
            c++;
        if (c == 0) return OUTSIDE;
        if (c == num_corners) c2++;
      }

      return (c2 == 6) ? INSIDE : INTERSECT;
    },

    addUpdateListener: function(callback) { this.listeners.update.push(callback); },
    sphereVisible: function(center, radius) { return this.sphere.apply(this, arguments) != OUTSIDE; },
    pointVisible:  function(center)         { return this.point.apply(this, arguments)  != OUTSIDE; },
    cubeVisible:   function(corners)        { return this.cube.apply(this, arguments)   != OUTSIDE; },

    fireListeners: function(name) {
      for (var i = 0; i < this.listeners[name].length; i++)
        this.listeners[name][i]();
    },

    isValid: function() { return this.p && this.mv; },

    getRenderable: function()
    {
      if (this.renderable) return this.renderable;

      var renderable = this.renderable = new Jax.Model({mesh: new Jax.Mesh()});
      renderable.upToDate = false;
      var frustum = this;

      function addVertices(e, vertices)
      {
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);

        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);

        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);

        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);

        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);

        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);

        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
      }

      renderable.mesh.init = function(vertices, colors) {
        this.draw_mode = GL_LINES;

        for (var i = 0; i < 24; i++)
        {
          vertices.push(0,0,0);
          colors.push(1,1,0,1);
        }
      };

      renderable.update = null;

      frustum.addUpdateListener(function() {
        if (!frustum.isValid()) { return; }

        renderable.upToDate = true;
        var buf = renderable.mesh.getVertexBuffer();
        if (!buf) return;
        var vertices = buf.js;
        vertices.clear();
        var e = extents(frustum);//{ntl:ntl, ntr:ntr, nbl:nbl, nbr:nbr, ftl:ftl, ftr:ftr, fbl:fbl, fbr:fbr};

        addVertices(e, vertices);

        buf.refresh();
      });

      return renderable;
    }
  });

  klass.INSIDE = INSIDE;
  klass.OUTSIDE = OUTSIDE;
  klass.INTERSECT = INTERSECT;

  return klass;
})();
Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

Jax.Scene.LightSource = (function() {
  return Jax.Model.create({
    initialize: function($super, data) {
      data = data || {};
      data.attenuation = data.attenuation || {};
      data.color = data.color || {};

      function default_field(name, value, obj) {
        obj = obj || data;
        if (typeof(obj[name]) == "undefined")
          obj[name] = value;
      }

      default_field('enabled', true);
      default_field('type', Jax.POINT_LIGHT);
      default_field('ambient', [0,0,0,1], data.color);
      default_field('diffuse', [1,1,1,1], data.color);
      default_field('specular', [1,1,1,1],data.color);
      default_field('position', [0,0,0]);
      default_field('direction', [-1,-1,-1]);
      default_field('angle', Math.PI/6);
      default_field('spotExponent', 0);
      default_field('constant', 0, data.attenuation);
      default_field('linear', 0.02, data.attenuation);
      default_field('quadratic', 0, data.attenuation);
      default_field('shadowcaster', true);

      $super(data);

      this.shadowMatrix = mat4.create();
    },

    getPosition: function() { return this.camera.getPosition(); },
    getDirection: function() { return this.camera.getViewVector(); },

    isEnabled: function() { return this.enabled; },
    getType: function() { return this.type; },

    getDiffuseColor: function() { return this.color.diffuse; },
    getAmbientColor: function() { return this.color.ambient; },
    getSpecularColor: function() { return this.color.specular; },
    getConstantAttenuation: function() { return this.attenuation.constant; },
    getQuadraticAttenuation: function() { return this.attenuation.quadratic; },
    getLinearAttenuation: function() { return this.attenuation.linear; },
    getAngle: function() { return this.angle; },
    getSpotExponent: function() { return this.spotExponent; },
    getSpotCosCutoff: function() { return Math.cos(this.angle); },

    getShadowMapTexture: function(context) {
      if (this.framebuffer) return this.framebuffer.getTextureBuffer(context, 0);
      return null;
    },

    isShadowMapEnabled: function() {
      return !!(this.framebuffer && this.isShadowcaster());
    },

    getShadowMatrix: function() {
      return this.shadowMatrix;
    },

    isShadowcaster: function() { return this.shadowcaster; },

    updateShadowMap: function(context, sceneBoundingRadius, objects) {
      if (this.type == Jax.DIRECTIONAL_LIGHT) {
        this.camera.ortho({left:-sceneBoundingRadius,right:sceneBoundingRadius,
                           top:sceneBoundingRadius,bottom:-sceneBoundingRadius,
                           near:-sceneBoundingRadius,far:sceneBoundingRadius
        });
        this.camera.setPosition(0,0,0);
      } else {
        var lightToSceneDistance = vec3.length(this.camera.getPosition());
        var nearPlane = lightToSceneDistance - sceneBoundingRadius;
        if (nearPlane < 0.01) nearPlane = 0.01;
        var fieldOfView = Math.radToDeg(2.0 * Math.atan(sceneBoundingRadius / lightToSceneDistance));

        this.camera.perspective({near:nearPlane,far:nearPlane+(2.0*sceneBoundingRadius),fov:fieldOfView,width:2048,height:2048});
        if (this.type == Jax.POINT_LIGHT) {
          this.camera.lookAt([0,0,0],[0,1,0]);
        }
      }

      var self = this;
      var sm = this.shadowMatrix, tmpm = mat4.create();
      mat4.identity(sm);
      sm[0] = sm[5] = sm[10] = sm[12] = sm[13] = sm[14] = 0.5;

      if (!this.framebuffer)
        this.framebuffer = new Jax.Framebuffer({width:2048,height:2048,depth:true,color:GL_RGBA});

      this.framebuffer.bind(context, function() {
        context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.pushMatrix(function() {
          context.matrix_stack.loadProjectionMatrix(self.camera.getProjectionMatrix());
          context.matrix_stack.loadViewMatrix(self.camera.getModelViewMatrix());
          mat4.multiply(sm, context.getModelViewProjectionMatrix());


          context.glEnable(GL_CULL_FACE);
          context.glCullFace(GL_FRONT);
          context.glDisable(GL_BLEND);
          context.glEnable(GL_POLYGON_OFFSET_FILL);
          context.glPolygonOffset(2.0, 2.0);
          for (var i = 0; i < objects.length; i++) {
            objects[i].render(context, {material:'depthmap'});
          }
          context.glDisable(GL_POLYGON_OFFSET_FILL);
          context.glEnable(GL_BLEND);
          context.glCullFace(GL_BACK);
          context.glDisable(GL_CULL_FACE);
        });
      });
    }
  });
})();

Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context = context;
      this._lights = [];
    },

    add: function(light) {
      if (this._lights.length == Jax.max_lights)
        throw new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first.");
      this._lights.push(light);
    },

    enable: function() { this.enabled = true; },

    disable: function() { this.enabled = false; },

    isEnabled: function() {
      if (arguments.length == 1) {
        if (this._lights.length > arguments[0])
          return this._lights[arguments[0]].isEnabled();
        return false;
      }

      if (this.enabled != undefined)
        return this.enabled;
      return this._lights.length > 0;
    },

    count: function() { return this._lights.length; },

    remove: function(index) {
      var result = this._lights.splice(index, 1);
      if (this._lights.length == 0) delete this.enabled;
      return result;
    },

    illuminate: function(context, objects) {
      for (var i = 0; i < this._lights.length; i++) {
        this._current_light = i;
        for (var j = 0; j < objects.length; j++) {
          /* TODO optimization: see if objects[j] is even affected by this._lights[i] */
          objects[j].render(context);
        }
      }
      delete this._current_light;
    },

    updateShadowMaps: function(context, objects) {
      var boundingRadius = null;
      var i, j;
      for (i = 0; i < objects.length; i++) {
        j = vec3.length(objects[i].camera.getPosition()) + objects[i].getBoundingSphereRadius();
        if (boundingRadius == null || boundingRadius < j)
          boundingRadius = j;
      }
      boundingRadius = boundingRadius || 0;

      for (i = 0; i < this._lights.length; i++) {
        this._lights[i].updateShadowMap(context, boundingRadius, objects);
      }
    },

    getDirection: function(index) { return this.getLight(index).getDirection(); },

    getPosition: function(index) { return this.getLight(index).getPosition(); },

    getLight: function(index) {
      if (index == undefined)
        if (this._current_light != undefined) return this._lights[this._current_light];
        else return (this.default_light = this.default_light || new Jax.Scene.LightSource());
      return this._lights[index];
    },

    getType: function(index) { return this.getLight(index).getType(); },

    getDiffuseColor: function(index) { return this.getLight(index).getDiffuseColor(); },

    getSpecularColor: function(index) { return this.getLight(index).getSpecularColor(); },

    getAmbientColor: function(index) { return this.getLight(index).getAmbientColor(); },

    getConstantAttenuation: function(index) { return this.getLight(index).getConstantAttenuation(); },

    getLinearAttenuation: function(index) { return this.getLight(index).getLinearAttenuation(); },

    getQuadraticAttenuation: function(index) { return this.getLight(index).getQuadraticAttenuation(); },

    getSpotCosCutoff: function(index) { return this.getLight(index).getSpotCosCutoff(); },

    getSpotExponent: function(index) { return this.getLight(index).getSpotExponent(); }
  });
})();

Jax.Camera = (function() {
  var POSITION = 0, VIEW = 1, RIGHT = 2, UP = 3, FORWARD = 4, SIDE = 5;

  /*
    handles storing data in the private _vecbuf, which is used solely to prevent
    unnecessary allocation of temporary vectors. Note that _vecbuf is used for many
    operations and data persistence not guaranteed (read: improbable).
   */
  function store(self, buftype) {
    if (arguments.length == 2) {
      return storeVecBuf(self, buftype);
    }
    var buf = self._tmp[buftype];
    buf[0] = arguments[2];
    buf[1] = arguments[3];
    buf[2] = arguments[4];
    return buf;
  }

  function storeVecBuf(self, buftype) {
    var world = self.matrices.mv;

    var position = (self._tmp[POSITION]);
    var result   = (self._tmp[buftype]);

    position[0] = position[1] = position[2] = 0;
    mat4.multiplyVec3(world, position, position);

    switch(buftype) {
      case POSITION:
        return position;
        break;
      case VIEW:
        result[0] = result[1] = 0; result[2] = -1;
        mat4.multiplyVec3(world, result, result);
        vec3.direction(result, position, result);
        break;
      case RIGHT:
        result[0] = 1; result[1] = result[2] = 0;
        mat4.multiplyVec3(world, result, result);
        vec3.direction(result, position, result);
        break;
      case UP:
        result[1] = 1; result[0] = result[2] = 0;
        mat4.multiplyVec3(world, result, result);
        vec3.direction(result, position, result);
        break;
      default:
        throw new Error("Unexpected buftype: "+buftype);
    }
    return result;
  }

  function matrixUpdated(self) {
    self.normal_matrix_up_to_date = false;
    self.frustum_up_to_date       = false;
  }

  return Jax.Class.create({
    initialize: function() {
      /* used for temporary storage, just to avoid repeatedly allocating temporary vectors */
      this._tmp = [ vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create() ];

      this.matrices = { mv: mat4.identity(mat4.create()), p : mat4.identity(mat4.create()), n : mat3.create() };
      this.frustum = new Jax.Scene.Frustum(this.matrices.mv, this.matrices.p);

      this.addEventListener('matrixUpdated', function() { matrixUpdated(this); });
      this.reset();
    },

    getFrustum: function() {
      if (!this.frustum_up_to_date) this.frustum.update();
      this.frustum_up_to_date = true;
      return this.frustum;
    },

    getPosition:   function() { return vec3.create(storeVecBuf(this, POSITION)); },

    getViewVector: function() { return vec3.create(storeVecBuf(this, VIEW)); },

    getUpVector:   function() { return vec3.create(storeVecBuf(this, UP)); },

    getRightVector:function() { return vec3.create(storeVecBuf(this, RIGHT)); },

    ortho: function(options) {
      if (typeof(options.left)   == "undefined") options.left   = -1;
      if (typeof(options.right)  == "undefined") options.right  =  1;
      if (typeof(options.top)    == "undefined") options.top    =  1;
      if (typeof(options.bottom) == "undefined") options.bottom = -1;
      if (typeof(options.far)    == "undefined") options.far    = 2000;
      options.near = options.near || 0.01;

      mat4.ortho(options.left, options.right, options.bottom, options.top, options.near, options.far, this.matrices.p);
      this.matrices.p.width = options.right - options.left;
      this.matrices.p.height= options.top - options.bottom;
      this.fireEvent('matrixUpdated');
    },

    setPosition: function() {
      var vec = vec3.create();
      switch(arguments.length) {
        case 1: vec3.set(arguments[0], vec); break;
        case 3: vec3.set(arguments,    vec); break;
        default: throw new Error("Invalid arguments for Camera#setPosition");
      }

      this.orient(this.getViewVector(), this.getUpVector(), vec);

      return this;
    },

    orient: function(view, up) {
      var pos;

      switch(arguments.length) {
        case 1:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = store(this,       UP);
          pos  = store(this, POSITION);
          break;
        case 2:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = store(this,       UP,   up[0],   up[1],   up[2]);
          pos  = store(this, POSITION);
          break;
        case 3:
          if (typeof(arguments[0]) == "number") {
            view = store(this,     VIEW,    arguments[0],    arguments[1],    arguments[2]);
            up   = store(this,       UP);
            pos  = store(this, POSITION);
          } else {
            view = store(this,     VIEW,         view[0],         view[1],         view[2]);
            up   = store(this,       UP,           up[0],           up[1],           up[2]);
            pos  = store(this, POSITION, arguments[2][0], arguments[2][1], arguments[2][2]);
          }
          break;
        case 6:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          pos  = store(this, POSITION);
          break;
        case 9:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          pos  = store(this, POSITION, arguments[6], arguments[7], arguments[8]);
          break;
        default:
          throw new Error("Unexpected arguments for Camera#orient");
      }

      vec3.add(pos,view,view);
      this.lookAt(view, up, pos);
    },

    lookAt: function(point, up, pos) {
      up  = up  || store(this, UP);
      pos = pos || store(this, POSITION);

      /*
        I can't seem to get mat4.lookAt() to work as expected. I suspect that the forward vector is not
        calculated properly, as it seems to reverse the operands. Dunno if this is a bug or a misunderstanding
        in expectations, but either way I've decided not to use it, and adapted this code from:
          GLH at http://www.opengl.org/wiki/GluLookAt_code
       */
      var forward = this._tmp[FORWARD], side = this._tmp[SIDE];
      var matrix2 = this.matrices.mv;

      vec3.subtract(point, pos, forward);

      var dot = vec3.dot(forward, up);
      if (!isNaN(dot) && Math.abs(dot) > (1 - Math.EPSILON))
        vec3.cross(store(this, RIGHT), forward, up);

      vec3.normalize(forward);
      vec3.cross(forward, up, side);
      vec3.normalize(side);
      vec3.cross(side, forward, up);
      matrix2[0] = side[0];
      matrix2[4] = side[1];
      matrix2[8] = side[2];
      matrix2[12]= 0;
      matrix2[1] = up[0];
      matrix2[5] = up[1];
      matrix2[9] = up[2];
      matrix2[13]= 0;
      matrix2[2] = -forward[0];
      matrix2[6] = -forward[1];
      matrix2[10]= -forward[2];
      matrix2[14]= 0.0;
      matrix2[3] = matrix2[7] = matrix2[11] = 0;
      matrix2[15] = 1;
      mat4.translate(matrix2, vec3.negate(pos));
      mat4.inverse(matrix2);

      this.fireEvent('matrixUpdated');
    },

    perspective: function(options) {
      options = options || {};
      if (!options.width) throw new Error("Expected a screen width in Jax.Camera#perspective");
      if (!options.height)throw new Error("Expected a screen height in Jax.Camera#perspective");
      options.fov  = options.fov  || 45;
      options.near = options.near || 0.01;
      options.far  = options.far  || 2000;

      var aspect_ratio = options.width / options.height;
      mat4.perspective(options.fov, aspect_ratio, options.near, options.far, this.matrices.p);
      this.matrices.p.width = options.width;
      this.matrices.p.height = options.height;
      this.fireEvent('matrixUpdated');
    },

    getModelViewMatrix: function() { return this.matrices.mv; },

    getProjectionMatrix: function() { return this.matrices.p; },

    getNormalMatrix: function() {
      if (!this.normal_matrix_up_to_date) {
        mat4.toInverseMat3(this.getModelViewMatrix(), this.matrices.n);
        mat3.transpose(this.matrices.n);
      }
      this.normal_matrix_up_to_date = true;
      return this.matrices.n;
    },

    unproject: function(winx, winy, winz) {
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);

        var inf = [];
        var mm = this.matrices.mv, pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];

        var m = mat4.set(mm, mat4.create());

        mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
        mat4.multiply(pm, m, m);
        mat4.inverse(m, m);

        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;

        var out = vec3.create();
        mat4.multiplyVec4(m, inf, out);
        if(out[3]==0.0)
           return null;

        out[3]=1.0/out[3];
        return [out[0]*out[3], out[1]*out[3], out[2]*out[3]];
      }
      else
        return [this.unproject(winx, winy, 0), this.unproject(winx, winy, 1)];
    },

    rotate: function() {
      var amount = arguments[0];
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = this._tmp[0]; vec[0] = arguments[1]; vec[1] = arguments[2]; vec[2] = arguments[3];  break;
        default: throw new Error("Invalid arguments");
      }

      if      (vec[1] == 0 && vec[2] == 0) mat4.rotateX(this.matrices.mv, amount*vec[0], this.matrices.mv);
      else if (vec[0] == 0 && vec[2] == 0) mat4.rotateY(this.matrices.mv, amount*vec[1], this.matrices.mv);
      else if (vec[0] == 0 && vec[1] == 0) mat4.rotateZ(this.matrices.mv, amount*vec[2], this.matrices.mv);
      else                                 mat4.rotate (this.matrices.mv, amount,   vec, this.matrices.mv);

      this.fireEvent('matrixUpdated');
      return this;
    },

    strafe: function(distance) {
      mat4.translate(this.matrices.mv, vec3.scale(storeVecBuf(this, RIGHT), distance), this.matrices.mv);
      this.fireEvent('matrixUpdated');
      return this;
    },

    move: function(distance, direction) {
      direction = direction || storeVecBuf(this, VIEW);
      mat4.translate(this.matrices.mv, vec3.scale(direction, distance), this.matrices.mv);
      this.fireEvent('matrixUpdated');
      return this;
    },

    reset: function() { this.lookAt([0,0,-1], [0,1,0], [0,0,0]); }
  });
})();

Jax.Camera.addMethods(Jax.Events.Methods);

Jax.World = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager(context);
      this.objects  = [];
      this.object_cache = [];
    },

    addLightSource: function(light)   { this.lighting.add(light); },

    addObject: function(object) { this.objects.push(object); return object; },

    getObject: function(index) { return this.objects[index]; },

    render: function() {
      var i;

      while (this.object_cache.length > 0) this.object_cache.pop();
      for (i = 0; i < this.objects.length; i++) {
        if (this.objects[i].isShadowCaster()) {
          this.object_cache.push(this.objects[i]);
        }
      }

      /* this.current_pass is used by the material */
      this.context.current_pass = Jax.Scene.AMBIENT_PASS;

      if (this.lighting.isEnabled()) {
        /* ambient pass */
        this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        for (i = 0; i < this.objects.length; i++)
          this.objects[i].render(this.context);

        /* illumination pass */
        this.context.current_pass = Jax.Scene.ILLUMINATION_PASS;
        this.lighting.updateShadowMaps(this.context, this.object_cache);
        this.context.glBlendFunc(GL_ONE, GL_ONE);
        this.lighting.illuminate(this.context, this.objects);
      } else {
        for (i = 0; i < this.objects.length; i++)
          this.objects[i].render(this.context);
      }
    },

    update: function(timechange) {
      for (var i = this.objects.length-1; i >= 0; i--)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
    },

    dispose: function() {
      var i, o;

      for (i = this.objects.length-1; i >= 0; i--)
      /*
        actually, we may not want to dispose the objects just yet. What if the user has a handle to them?
        Maybe better to let JS GC take care of this one.
      */
        (o = this.objects.pop());// && o.dispose();

      this.lighting = new Jax.Scene.LightManager(this.context);
    }
  });
})();
Jax.Texture = (function() {
  function imageLoaded(self, isImageArray) {
    var onload = self.options.onload || self.onload;

    if (!isImageArray) {
      if (onload) onload.call(self, self.image);
      self.loaded = true;
    } else {
      self.images.load_count++;
      if (self.images.load_count == self.images.length) {
        /* all done */
        if (onload) onload.call(self, self.image);
        self.loaded = true;
      }
    }
  }

  function build(self, context) {
    self.handles[context.id] = context.glCreateTexture();
  }

  function generateTexture(context, self) {
    var data_type = self.options.data_type, format = self.options.format, target = self.options.target;
    if (self.image) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, GL_RGBA, data_type, self.image);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, GL_RGBA, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, GL_RGBA, data_type, self.image);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else if (self.images) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, GL_RGBA, data_type, self.images[0]);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_X] || self.images[0]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] || self.images[1]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] || self.images[2]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] || self.images[3]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] || self.images[4]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, GL_RGBA, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] || self.images[5]);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    }
  }

  /* pushLevel/popLevel are used for automatic management of glActiveTexture's.
    The general concept is that you can do something like:

      tex1.bind(context, function() {
        tex2.bind(context, function() {

          tex3.bind(context, 5, function() {
          });
        });
      });
   */
  function pushLevel(self, level, context) {
    if (level == null) level = Jax.Texture._level++;
    self.textureLevel = level;
    context.glActiveTexture(GL_TEXTURES[level]);
  }

  function popLevel(self, context) {
    Jax.Texture._level = self.textureLevel - 1;
    delete self.textureLevel;
  }

  return Jax.Class.create({
    initialize: function(path_or_array, options) {
      var self = this;
      this.options = Jax.Util.normalizeOptions(options, {
        min_filter: GL_NEAREST,
        mag_filter: GL_NEAREST,
        generate_mipmap: true,
        mipmap_hint: GL_DONT_CARE,
        format: GL_RGBA,
        target: GL_TEXTURE_2D,
        data_type: GL_UNSIGNED_BYTE,
        wrap_s: GL_REPEAT,
        wrap_t: GL_REPEAT,
        flip_y: false,
        premultiply_alpha: false,
        colorspace_conversion: true,
        onload: null
      });

      if (typeof(path_or_array) == "string") {
        this.image = new Image();
        this.image.onload = function() { imageLoaded(self, false); };
        this.image.src = path_or_array;
      } else {
        var onload = function() { imageLoaded(self, true); };
        this.images = [];
        this.images.load_count = 0;
        for (var i = 0; i < path_or_array.length; i++) {
          this.images[i] = new Image();
          this.images[i].onload = onload;
          this.images[i].src = path_or_array[i];
        }
      }
      this.handles = {};
      this.loaded = false;
      this.valid = [];
    },

    refresh: function(context) {
      if (!this.loaded) return;

      context.glBindTexture(this.options.target, this.getHandle(context));
      generateTexture(context, this);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MAG_FILTER, this.options.mag_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MIN_FILTER, this.options.min_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_S, this.options.wrap_s);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_T, this.options.wrap_t);
      context.glPixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.options.flip_y);
      context.glPixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.options.premultiply_alpha);
      context.glPixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, this.options.colorspace_conversion ? GL_BROWSER_DEFAULT_WEBGL : GL_NONE);

      if (this.generate_mipmap) {
        this.generateMipmap(context);
      }

      this.valid[context.id] = true;
    },

    generateMipmap: function(context) {
      context.glHint(this.options.mipmap_hint);
      context.glGenerateMipmap(this.options.target);
    },

    invalidate: function() { this.valid.clear(); },

    dispose: function(context) {
      context.glDeleteTexture(getHandle(context));
      delete this.handles[context.id];
    },

    getHandle: function(context) {
      if (!this.handles[context.id]) build(this, context);
      return this.handles[context.id];
    },

    isValid: function(context) {
      return !!this.valid[context.id];
    },

    bind: function(context, level, callback) {
      if (!this.loaded) return; // no texture to display, yet... but not worth crashing over.
      if (!this.isValid(context)) this.refresh(context);

      if (typeof(level) == "number")
        pushLevel(this, level, context);
      else if (typeof(level) == "function") { callback = level; pushLevel(this, null, context); }

      context.glBindTexture(this.options.target, this.getHandle(context));
      if (callback)
      {
        callback.call(this, this.textureLevel);
        this.unbind(context);
      }
    },

    unbind: function(context) {
      if (this.textureLevel != undefined) context.glActiveTexture(GL_TEXTURES[this.textureLevel]);
      context.glBindTexture(this.options.target, null);
      popLevel(this, context);
    },

    ready: function() {
      return this.loaded;
    }
  });
})();

Jax.Texture._level = 0;
Jax.EVENT_METHODS = (function() {
  function getCumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);

    var result = [valueL, valueT];
    result.left = valueL;
    result.top = valueT;
    return result;
  }

  function buildKeyEvent(self, evt) {
    var keyboard = self.keyboard;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    keyboard.last = evt;

    /*
    TODO track all keypresses and whatnot via @keyboard, so all keys can be queried at any given time
     */

    return evt;
  }

  function buildMouseEvent(self, evt) {
    var mouse = self.mouse;

    evt = evt || window.event || {};
    evt.context = self;
    evt.canvas = self.canvas;
    evt.offsetx = mouse.x;
    evt.offsety = mouse.y;
    evt.mouse = mouse;

    mouse.offsetx = evt.offsetx || 0;
    mouse.offsety = evt.offsety || 0;

    var cumulativeOffset = getCumulativeOffset(self.canvas);
    mouse.x = evt.clientX - cumulativeOffset[0];
    mouse.y = evt.clientY - cumulativeOffset[1];
    mouse.y = self.canvas.height - mouse.y; // invert y

    if (window.pageXOffset) {
      mouse.x += window.pageXOffset;
      mouse.y += window.pageYOffset;
    } else {
      mouse.x += document.body.scrollLeft;
      mouse.y += document.body.scrollTop;
    }

    mouse.diffx = mouse.x - mouse.offsetx;
    mouse.diffy = mouse.y - mouse.offsety;

    if (evt.type == "mousedown" || evt.type == "onmousedown") {
      mouse.down = mouse.down || {count:0};
      mouse.down["button"+evt.which] = {at:[mouse.x,mouse.y]};
    } else if (evt.type == "mouseup" || evt.type == "onmouseup") {
      if (mouse.down)
      {
        mouse.down.count--;
        if (mouse.down.count <= 0) mouse.down = null;
      }
    }

    return evt;
  }

  function dispatchEvent(self, evt) {
    var type = evt.type.toString();
    if (type.indexOf("on") == 0) type = type.substring(2, type.length);
    type = type.toLowerCase();
    var target;
    switch(type) {
      case "click":     target = "mouse_clicked"; break;
      case "mousemove":
        if (evt.move_type == 'mousemove') target = "mouse_moved";
        else                              target = "mouse_dragged";
        break;
      case "mousedown": target = "mouse_pressed"; break;
      case "mouseout":  target = "mouse_exited";  break;
      case "mouseover": target = "mouse_entered"; break;
      case "mouseup":   target = "mouse_released";break;
      case "keydown":   target = "key_down";      break;
      case "keypress":  target = "key_pressed";   break;
      case "keyup":     target = "key_released";  break;
      default: return true; // don't dispatch this event to the controller
    }
    if (self.current_controller[target])
    {
      var result = self.current_controller[target](evt);
      if (typeof(result) != "undefined") return result;
    }
    return true;
  }

  return {
    setupEventListeners: function() {
      this.keyboard = {};
      this.mouse = {};

      var canvas = this.canvas;
      var self = this;

      var mousefunc     = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        return dispatchEvent(self, evt);
      };
      var mousemovefunc = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        if (self.mouse && self.mouse.down == null) // mouse is not being dragged
          evt.move_type = "mousemove";
        else
          evt.move_type = "mousedrag";
        return dispatchEvent(self, evt);
      };
      var keyfunc       = function(evt) {
        if (!self.current_controller) return;
        evt = buildKeyEvent(self, evt);
        return dispatchEvent(self, evt);
      };

      if (canvas.addEventListener) {
        /* W3 */
        canvas.addEventListener('click',     mousefunc,     false);
        canvas.addEventListener('mousedown', mousefunc,     false);
        canvas.addEventListener('mousemove', mousemovefunc, false);
        canvas.addEventListener('mouseout',  mousefunc,     false);
        canvas.addEventListener('mouseover', mousefunc,     false);
        canvas.addEventListener('mouseup',   mousefunc,     false);
        canvas.addEventListener('keydown',   keyfunc,       false);
        canvas.addEventListener('keypress',  keyfunc,       false);
        canvas.addEventListener('keyup',     keyfunc,       false);
      } else {
        /* IE */
        canvas.attachEvent('onclick',     mousefunc    );
        canvas.attachEvent('onmousedown', mousefunc    );
        canvas.attachEvent('onmousemove', mousemovefunc);
        canvas.attachEvent('onmouseout',  mousefunc    );
        canvas.attachEvent('onmouseover', mousefunc    );
        canvas.attachEvent('onmouseup',   mousefunc    );
        canvas.attachEvent('onkeydown',   keyfunc      );
        canvas.attachEvent('onkeypress',  keyfunc      );
        canvas.attachEvent('onkeyup',     keyfunc      );
      }
    }
  };
})();

Jax.Context = (function() {
  function setupContext(self) {
    try { self.gl = self.canvas.getContext(WEBGL_CONTEXT_NAME, WEBGL_CONTEXT_OPTIONS); } catch(e) { }
    if (!self.gl) throw new Error("WebGL could not be initialized!");
  }

  function startRendering(self) {
    function render() {
      if (self.current_view) {
        reloadMatrices(self);
        self.glViewport(0, 0, self.canvas.width, self.canvas.height);
        self.current_view.render();
        self.render_interval = requestAnimFrame(render, self.canvas);
      }
      else {
        clearTimeout(self.render_interval);
        self.render_interval = null;
      }
    }

    self.render_interval = setTimeout(render, Jax.render_speed);
  }

  function stopRendering(self) {
    clearTimeout(self.render_interval);
  }

  function startUpdating(self) {
    function updateFunc() {
      if (!self.lastUpdate) self.lastUpdate = new Date();
      var now = new Date();
      var timechange = (now - self.lastUpdate) / 1000.0;
      self.lastUpdate = now;

      self.update(timechange);
      self.update_interval = setTimeout(updateFunc, Jax.update_speed);
    }
    updateFunc();
  }

  function stopUpdating(self) {
    clearTimeout(self.update_interval);
  }

  function setupView(self, view) {
    view.context = self;
    view.world = self.world;
    view.player = self.player;
    for (var i in self) {
      if (i.indexOf("gl") == 0) {
        /* it's a WebGL method */
        view[i] = eval("(function() { return this.context."+i+".apply(this.context, arguments); })");
      }
    }
    /* TODO we should set up helpers, etc. here too */
  }

  function reloadMatrices(self) {
    self.matrix_stack.reset(); // reset depth
    self.matrix_stack.loadModelMatrix(Jax.IDENTITY_MATRIX);
    self.matrix_stack.loadViewMatrix(self.player.camera.getModelViewMatrix());
    self.matrix_stack.loadProjectionMatrix(self.player.camera.getProjectionMatrix());
  }

  return Jax.Class.create({
    initialize: function(canvas) {
      if (typeof(canvas) == "string") canvas = document.getElementById(canvas);
      if (!canvas) throw new Error("Can't initialize a WebGL context without a canvas!");
      this.id = ++Jax.Context.identifier;
      this.canvas = canvas;
      setupContext(this);
      this.setupEventListeners();
      this.render_interval = null;
      this.glClearColor(0.0, 0.0, 0.0, 1.0);
      this.glClearDepth(1.0);
      this.glEnable(GL_DEPTH_TEST);
      this.glDepthFunc(GL_LEQUAL);
      this.glEnable(GL_BLEND);
      this.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      this.checkForRenderErrors();
      this.world = new Jax.World(this);
      this.player = {camera: new Jax.Camera()};
      this.player.camera.perspective({width:canvas.width, height:canvas.height});
      this.matrix_stack = new Jax.MatrixStack();

      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");

      startUpdating(this);
    },

    hasStencil: function() {
      return !!this.gl.stencil;
    },

    redirectTo: function(path) {
      stopRendering(this);
      this.world.dispose();
      this.player.camera.reset();
      this.current_controller = Jax.routes.dispatch(path, this);
      if (!this.current_controller.view_key)
        throw new Error("Controller '"+this.current_controller.getControllerName()+"' did not produce a renderable result");
      this.current_view = Jax.views.find(this.current_controller.view_key);
      setupView(this, this.current_view);
      if (!this.isRendering()) startRendering(this);

      return this.current_controller;
    },

    update: function(timechange) {
      if (this.current_controller && this.current_controller.update)
        this.current_controller.update(timechange);
      this.world.update(timechange);
    },

    isRendering: function() {
      return this.render_interval != null;
    },

    dispose: function() {
      this.disposed = true;
      stopRendering(this);
      stopUpdating(this);
    },

    isDisposed: function() {
      return !!this.disposed;
    },

    pushMatrix: function(yield_to) {
      this.matrix_stack.push();
      yield_to();
      this.matrix_stack.pop();
    },

    multMatrix: function(matr) { return this.matrix_stack.multModelMatrix(matr); },

    getViewMatrix: function() { return this.matrix_stack.getViewMatrix(); },

    getInverseViewMatrix: function() { return this.matrix_stack.getInverseViewMatrix(); },

    getFrustum: function() { return this.player.camera.frustum; },

    getModelViewMatrix: function() { return this.matrix_stack.getModelViewMatrix(); },

    getInverseModelViewMatrix: function() { return this.matrix_stack.getInverseModelViewMatrix(); },

    getModelViewProjectionMatrix: function() { return this.matrix_stack.getModelViewProjectionMatrix(); },
    getModelMatrix: function() { return this.matrix_stack.getModelMatrix(); },

    getProjectionMatrix: function() { return this.matrix_stack.getProjectionMatrix(); },

    getNormalMatrix: function() {return this.matrix_stack.getNormalMatrix(); },

    checkForRenderErrors: function() {
      /* Error checking is slow, so don't do it in production mode */
      if (Jax.environment == "production") return; /* TODO expose Jax.environment to application */

      var error = this.glGetError();
      if (error != GL_NO_ERROR)
      {
        var str = "GL error in "+this.canvas.id+": "+error;
        error = new Error(str);
        var message = error;
        if (error.stack)
        {
          var stack = error.stack.split("\n");
          stack.shift();
          message += "\n\n"+stack.join("\n");
        }

        throw error;
      }
    },

    handleRenderError: function(method_name, args, err) {
      throw err;
    }
  });
})();

Jax.Context.identifier = 0;
Jax.Context.addMethods(GL_METHODS);
Jax.Context.addMethods(Jax.EVENT_METHODS);

Jax.shader_program_builders = {};

Jax.views = new Jax.ViewManager();

Jax.routes = new Jax.RouteSet();

Jax.loaded = true;

Jax.render_speed = 15;

Jax.update_speed = 15;

Jax.max_lights = 32;

/* shader builders */
/*
  Failsafe shader - useful for debugging. Renders an object using vertex data only. The object's
  color is hard-coded to pure red.
 */
Jax.shader_program_builders['failsafe'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",

            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",

            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "}"]
  }

  function buildFragmentSource(options) {
    return ["void main(void) {",
            "  gl_FragColor = vec4(1,0,0,1);",
            "}"]
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); }
      }
    };
  }
})();
Jax.shader_program_builders['color_without_texture'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec3 vertexPosition;",
            "attribute vec4 vertexColor;",

            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",

            "varying vec4 vColor;",

            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vec4(vertexPosition, 1.0);",
            "  vColor = vertexColor;",
            "}"]
  }

  function buildFragmentSource(options) {
    return ["varying vec4 vColor;",

            "void main(void) {",
            "  gl_FragColor = vColor;",
            "}"]
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); },
        vertexColor   : function(context, mesh) { return mesh.getColorBuffer();  }
      }
    };
  }
})();
Jax.shader_program_builders['blinn-phong'] = (function() {
  function defs(options) {
    return [
      /* matrix uniforms */
      'uniform mat4 mMatrix, ivMatrix, mvMatrix, pMatrix, mvInvMatrix;',
      'uniform mat3 ivnMatrix, nMatrix;',

      /* material uniforms */
      'uniform vec4 materialDiffuse, materialAmbient, materialSpecular;',
      'uniform float materialShininess;',

      'uniform int PASS_TYPE;',

      /* light uniforms */
      'uniform vec3 LIGHT_DIRECTION, LIGHT_POSITION;',
      'uniform vec4 LIGHT_SPECULAR, LIGHT_AMBIENT, LIGHT_DIFFUSE;',
      'uniform bool LIGHT_ENABLED;',
      'uniform int LIGHT_TYPE;',
      'uniform float SPOTLIGHT_COS_CUTOFF, SPOTLIGHT_EXPONENT, LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR,',
                    'LIGHT_ATTENUATION_QUADRATIC;',

      /* shadow map uniforms */
      'uniform bool SHADOWMAP_ENABLED;',
      'uniform sampler2D SHADOWMAP;',
      'uniform mat4 SHADOWMAP_MATRIX;',
      'uniform bool SHADOWMAP_PCF_ENABLED;',

      'varying vec2 vTexCoords;',
      'varying vec3 vNormal, vLightDir, vSpotlightDirection;',
      'varying vec4 vBaseColor, vShadowCoord;',
      'varying float vDist;',

      ''
    ].join("\n");
  }

  function buildVertexSource(options) {
    var s = [
      defs(options),

      /* attributes */
      'attribute vec2 VERTEX_TEXCOORDS;',
      'attribute vec4 VERTEX_POSITION, VERTEX_COLOR;',
      'attribute vec3 VERTEX_NORMAL;',

      'void main() {',
        'vBaseColor = VERTEX_COLOR;',
        'vNormal = nMatrix * VERTEX_NORMAL;',
        'vTexCoords = VERTEX_TEXCOORDS;',

        'if (SHADOWMAP_ENABLED) {',
          'vec4 shadow = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;',
          'vShadowCoord = shadow;',
        '}',

        /* if it's an ambient pass, then we don't even care about light information */
        'if (PASS_TYPE != '+Jax.Scene.AMBIENT_PASS+') {',
          'if (LIGHT_TYPE == '+Jax.DIRECTIONAL_LIGHT+') {',
            'vLightDir = normalize(ivnMatrix * -LIGHT_DIRECTION);',
          '} else {',
            'vec3 vec = (ivMatrix * vec4(LIGHT_POSITION, 1)).xyz - (mvMatrix * VERTEX_POSITION).xyz;',
            'vLightDir = normalize(vec);',
            'vDist = length(vec);',
          '}',

          /* if it's a spotlight, calculate spotlightDirection */
          'if (LIGHT_TYPE == '+Jax.SPOT_LIGHT+') {',
            'vSpotlightDirection = normalize(ivnMatrix * -LIGHT_DIRECTION);',
          '}',
        '}',

        'gl_Position = pMatrix * mvMatrix * vec4(VERTEX_POSITION.xyz, 1);',
      '}'
    ];
    return s;
  }

  function buildFragmentSource(options) {
    var s = [
      defs(options),

      'float unpack_depth(const in vec4 rgba_depth)',
      '{',
        'const vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);',
        'float depth = dot(rgba_depth, bit_shift);',
        'return depth;',
      '}',

      'float pcf_lookup(float s, vec2 offset) {',
        /*
          s is the projected depth of the current vShadowCoord relative to the shadow's camera. This represents
          a *potentially* shadowed surface about to be drawn.

          d is the actual depth stored within the SHADOWMAP texture (representing the visible surface).

          if the surface to be drawn is further back than the light-visible surface, then the surface is
          shadowed because it has a greater depth. Less-or-equal depth means it's either in front of, or it *is*
          the light-visible surface.
        */
        'float d = unpack_depth(texture2D(SHADOWMAP, (vShadowCoord.xy/vShadowCoord.w)+offset));',
        'return (d > s) ? 1.0 : 0.0;',
      '}',

      'void main() {',
        'vec4 final_color = vec4(0,0,0,0);',
        'float spotEffect, att = 1.0, visibility = 1.0;',

        'if (PASS_TYPE != '+Jax.Scene.AMBIENT_PASS+') {',
          'if (LIGHT_ENABLED) {',
            'if (SHADOWMAP_ENABLED) {',
              'float s = vShadowCoord.z / vShadowCoord.w;',
              'if (!SHADOWMAP_PCF_ENABLED) {',
                'visibility = pcf_lookup(s, vec2(0.0,0.0));',
              '} else {',
                /* do PCF filtering */
                'float dx, dy;',
                'visibility = 0.0;',
                'for (float dx = -1.5; dx <= 1.5; dx += 1.0) {',
                  'for (float dy = -1.5; dy <= 1.5; dy += 1.0) {',
                    'visibility += pcf_lookup(s, vec2(dx/2048.0, dy/2048.0));',
                  '}',
                '}',
                'visibility /= 16.0;',
              '}',
            '}',

            'vec3 nLightDir = normalize(vLightDir), nNormal = normalize(vNormal);',
            'vec3 halfVector = normalize(nLightDir + vec3(0.0,0.0,1.0));',
            'float NdotL = max(dot(nNormal, nLightDir), 0.0);',

            'if (LIGHT_TYPE != '+Jax.SPOT_LIGHT+' || ',
              '(spotEffect = dot(normalize(vSpotlightDirection), nLightDir)) > SPOTLIGHT_COS_CUTOFF',
            ') {',
              'if (LIGHT_TYPE != '+Jax.DIRECTIONAL_LIGHT+') {',
                'if (LIGHT_TYPE == '+Jax.SPOT_LIGHT+') { att = pow(spotEffect, SPOTLIGHT_EXPONENT); }',

                'att = att / (LIGHT_ATTENUATION_CONSTANT ',
                           '+ LIGHT_ATTENUATION_LINEAR    * vDist',
                           '+ LIGHT_ATTENUATION_QUADRATIC * vDist * vDist);',
              '}',

              'final_color += visibility * att * LIGHT_AMBIENT;',
              'if (NdotL > 0.0) {',
                'float NdotHV = max(dot(nNormal, halfVector), 0.0);',
                'final_color += visibility * att * NdotL * materialDiffuse * LIGHT_DIFFUSE;', /* diffuse */
                'final_color += visibility * att * materialSpecular * LIGHT_SPECULAR * pow(NdotHV, materialShininess);', /* specular */
              '}',
            '}',
          '}',
        '} else {',
          'final_color += materialAmbient * vBaseColor;',
        '}',
        'gl_FragColor = final_color;',
      '}'
    ];
    return s;
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      attributes: {
        VERTEX_POSITION: function(context, mesh) { return mesh.getVertexBuffer(); },
        VERTEX_COLOR   : function(context, mesh) { return mesh.getColorBuffer();  },
        VERTEX_NORMAL  : function(context, mesh) { return mesh.getNormalBuffer(); },
        VERTEX_TEXCOORDS:function(context, mesh) { return mesh.getTextureCoordsBuffer(); }
      },
      uniforms: {
        mMatrix: { type:"glUniformMatrix4fv", value: function(c) { return c.getModelMatrix(); } },
        ivnMatrix: { type:"glUniformMatrix3fv", value: function(c) { return mat3.transpose(mat4.toMat3(c.getViewMatrix())); }},
        mvInvMatrix: { type:"glUniformMatrix4fv", value: function(c) { return c.getInverseModelViewMatrix(); }},
        ivMatrix: { type: "glUniformMatrix4fv", value: function(c) { return c.getInverseViewMatrix(); }},
        mvMatrix: { type: "glUniformMatrix4fv", value: function(context) { return context.getModelViewMatrix();  } },
        pMatrix:  { type: "glUniformMatrix4fv", value: function(context) { return context.getProjectionMatrix(); } },
        nMatrix:  { type: "glUniformMatrix3fv", value: function(context) { return context.getNormalMatrix();     } },

        materialAmbient: { type: "glUniform4fv", value: function(context) { return options.ambient || [0.2,0.2,0.2,1]; } },
        materialDiffuse: { type: "glUniform4fv", value: function(context) { return options.diffuse || [1,1,1,1]; } },
        materialSpecular: { type: "glUniform4fv", value: function(context) { return options.specular || [1,1,1,1]; } },
        materialShininess: { type: "glUniform1f", value: function(context) { return options.shininess || 0; } },

        PASS_TYPE: {type:"glUniform1i",value:function(c,m){return c.current_pass||Jax.Scene.AMBIENT_PASS;}},

        LIGHT_ENABLED: {type:"glUniform1i",value:function(c,m){return c.world.lighting.getLight().isEnabled();}},
        LIGHT_DIRECTION: {type:"glUniform3fv", value:function(c,m){return c.world.lighting.getDirection();}},
        LIGHT_POSITION:  {type:"glUniform3fv", value:function(c,m){return c.world.lighting.getPosition();}},
        LIGHT_TYPE: {type:"glUniform1i",value:function(c,m){return c.world.lighting.getType();}},
        LIGHT_SPECULAR:{type:"glUniform4fv",value:function(c,m){return c.world.lighting.getSpecularColor(); } },
        LIGHT_AMBIENT: {type:"glUniform4fv",value:function(c,m){return c.world.lighting.getAmbientColor(); } },
        LIGHT_DIFFUSE: {type:"glUniform4fv",value:function(c,m){return c.world.lighting.getDiffuseColor(); } },
        SPOTLIGHT_COS_CUTOFF: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getSpotCosCutoff(); } },
        SPOTLIGHT_EXPONENT: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getSpotExponent(); } },
        LIGHT_ATTENUATION_CONSTANT: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getConstantAttenuation();}},
        LIGHT_ATTENUATION_LINEAR: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getLinearAttenuation();}},
        LIGHT_ATTENUATION_QUADRATIC: {type:"glUniform1f",value:function(c,m){return c.world.lighting.getQuadraticAttenuation();}},

        SHADOWMAP_PCF_ENABLED: { type:"glUniform1i", value:function(c) { return true; }},
        SHADOWMAP_MATRIX:{type:"glUniformMatrix4fv",value:function(c,m){return c.world.lighting.getLight().getShadowMatrix();}},
        SHADOWMAP_ENABLED: {type:"glUniform1i",value:function(c,m){return c.world.lighting.getLight().isShadowMapEnabled();}},
        SHADOWMAP: {type:"glUniform1i",value:function(c,m){
          c.glActiveTexture(GL_TEXTURE0);
          c.glBindTexture(GL_TEXTURE_2D, c.world.lighting.getLight().getShadowMapTexture(c));
          return 0;
        }}
      }
    };
  }
})();
/*
  Depthmap shader - used by light sources to generate shadow maps.
 */
Jax.shader_program_builders['depthmap'] = (function() {
  function buildVertexSource(options) {
    return ["attribute vec4 vertexPosition;",

            "uniform mat4 mvMatrix;",
            "uniform mat4 pMatrix;",

            "void main(void) {",
            "  gl_Position = pMatrix * mvMatrix * vertexPosition;",
            "}"]
  }

  function buildFragmentSource(options) {
    return [
            "uniform mat4 pMatrix;",

            'vec4 pack_depth(const in float depth)',
            '{',
              'const vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);',
              'const vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);',
              'vec4 res = fract(depth * bit_shift);',
              'res -= res.xxyz * bit_mask;',
              'return res;',
            '}',

            'float linearize(in float z) {',
              'float A = pMatrix[2].z, B = pMatrix[3].z;',
              'float n = - B / (1.0 - A);', // camera z near
              'float f =   B / (1.0 + A);', // camera z far
              'return (2.0 * n) / (f + n - z * (f - n));',
            '}',

            'void main(void) {',
              'gl_FragColor = pack_depth(gl_FragCoord.z);',
            '}']
  }

  return function(options) {
    return {
      vertex_source: buildVertexSource(options),
      fragment_source: buildFragmentSource(options),
      uniforms: {
        mvMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getModelViewMatrix(); }
        },
        pMatrix: {
          type: "glUniformMatrix4fv",
          value: function(context, mesh) { return context.getProjectionMatrix(); }
        }
      },
      attributes: {
        vertexPosition: function(context, mesh) { return mesh.getVertexBuffer(); }
      }
    };
  }
})();

/* meshes */
Jax.Mesh.Quad = (function() {
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      if (typeof(options) == "number") { options = {width:options, height:options}; }
      this.draw_mode = GL_TRIANGLE_STRIP;
      $super(options);

      this.setSize(options && options.width || options.size || 1, options && options.height || options.size || 1)
    },

    setWidth: function(width) { this.setSize(width, this.height); },

    setHeight:function(height){ this.setHeight(this.width, height); },

    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.rebuild();
    },

    init: function(verts, colors, textureCoords, normals) {
      var width = this.width/2, height = this.height/2;

      verts.push(-width,  height, 0);
      verts.push(-width, -height, 0);
      verts.push( width,  height, 0);
      verts.push( width, -height, 0);

      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);
      colors.push(1,1,1,1);

      textureCoords.push(0, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 1);
      textureCoords.push(1, 0);

      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
      normals.push(0,0,1);
    }
  });
})();
Jax.Mesh.Torus = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    options = options || {};
    this.inner_radius = typeof(options.inner_radius) == "undefined" ? 0.6 : options.inner_radius;
    this.outer_radius = typeof(options.outer_radius) == "undefined" ? 1.8 : options.inner_radius;
    this.sides        = typeof(options.sides       ) == "undefined" ? 128 : options.inner_radius;
    this.rings        = typeof(options.rings       ) == "undefined" ? 256 : options.inner_radius;
    this.draw_mode = GL_TRIANGLE_STRIP;
    $super(options);
  },

  init: function(vertices, colors, texes, normals) {
    var tube_radius = this.inner_radius, radius = this.outer_radius, sides = this.sides, rings = this.rings;

    var i, j, theta, phi, theta1, costheta, sintheta, costheta1, sintheta1, ringdelta, sidedelta, cosphi, sinphi,
        dist;

    sidedelta = 2 * Math.PI / sides;
    ringdelta = 2 * Math.PI / rings;
    theta = 0;
    costheta = 1.0;
    sintheta = 0;

    for (i = rings - 1; i >= 0; i--) {
      theta1 = theta + ringdelta;
      costheta1 = Math.cos(theta1);
      sintheta1 = Math.sin(theta1);
      phi = 0;
      for (j = sides; j >= 0; j--) {
        phi = phi + sidedelta;
        cosphi = Math.cos(phi);
        sinphi = Math.sin(phi);
        dist = radius + (tube_radius * cosphi);

        normals.push(costheta1 * cosphi, -sintheta1 * cosphi, sinphi);
        vertices.push(costheta1 * dist, -sintheta1 * dist, tube_radius * sinphi);

        normals.push(costheta * cosphi, -sintheta * cosphi, sinphi);
        vertices.push(costheta * dist, -sintheta * dist, tube_radius * sinphi);
      }
      theta = theta1;
      costheta = costheta1;
      sintheta = sintheta1;
    }
  }
});
Jax.Mesh.Plane = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    options = options || {};
    this.width = options.width || options.size || 500;
    this.depth = options.depth || options.size || 500;
    this.x_segments = options.x_segments || options.segments || 20;
    this.z_segments = options.z_segments || options.segments || 20;
    this.draw_mode = GL_TRIANGLE_STRIP;
    $super(options);
  },

  init: function(verts, colors, texes, norms) {
    var w = this.width, d = this.depth, x_seg = this.x_segments, z_seg = this.z_segments;

    var x_unit = w / x_seg, z_unit = d / z_seg;
    var x, z, vx, vz;

    for (x = 1; x < x_seg; x++) {
      for (z = 0; z < z_seg; z++) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx,        0, vz);
          verts.push(vx-x_unit, 0, vz);
          norms.push(0,1,0,  0,1,0);
      }

      for (z = z_seg-1; z >= 0; z--) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx-x_unit, 0, vz);
          verts.push(vx, 0, vz);
          norms.push(0,1,0,  0,1,0);
      }
    }
  }
});
Jax.Mesh.Sphere = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    options = options || {};
    this.slices = options.slices || 30;
    this.stacks = options.stacks || 30;
    this.radius = options.radius || 1;
    $super(options);
  },

  init: function(vertices, colors, textureCoords, normals, indices) {
    var slices = this.slices, stacks = this.stacks;
    var radius = this.radius;
    var slice, stack;
    for (slice = 0; slice <= slices; slice++) {
      var theta = slice * Math.PI / slices;
      var sinth = Math.sin(theta);
      var costh = Math.cos(theta);

      for (stack = 0; stack <= stacks; stack++) {
        var phi = stack * 2 * Math.PI / stacks;
        var sinph = Math.sin(phi);
        var cosph = Math.cos(phi);

        var x = cosph * sinth;
        var y = costh;
        var z = sinph * sinth;
        var u = 1 - (stack / stacks);
        var v = 1 - (slice / slices);

        normals.push(x, y, z);
        textureCoords.push(u, v);
        vertices.push(radius * x, radius * y, radius * z);
        colors.push(1, 1, 1, 1);
      }
    }

    for (slice = 0; slice < slices; slice++) {
      for (stack = 0; stack < stacks; stack++) {
        var first = (slice * (stacks + 1)) + stack;
        var second = first + stacks + 1;
        indices.push(first, second, first+1);
        indices.push(second, second+1, first+1);
      }
    }
  }
});
Jax.Mesh.Teapot = (function() {
  var teapot = {
      "vertices" : [5.929688,4.125,0,5.387188,4.125,2.7475,5.2971,4.494141,2.70917,5.832031,4.494141,0,5.401602,4.617188,2.753633,5.945313,4.617188,0,5.614209,4.494141,2.844092,6.175781,4.494141,0,5.848437,4.125,2.94375,6.429688,4.125,0,3.899688,4.125,4.97,3.830352,4.494141,4.900664,3.910782,4.617188,4.981094,4.074414,4.494141,5.144727,4.254687,4.125,5.325,1.677188,4.125,6.4575,1.638858,4.494141,6.367412,1.68332,4.617188,6.471914,1.77378,4.494141,6.684522,1.873438,4.125,6.91875,-1.070312,4.125,7,-1.070312,4.494141,6.902344,-1.070312,4.617188,7.015625,-1.070312,4.494141,7.246094,-1.070312,4.125,7.5,-1.070312,4.125,7,-4.007656,4.125,6.4575,-3.859572,4.494141,6.367412,-1.070312,4.494141,6.902344,-3.847676,4.617188,6.471914,-1.070312,4.617188,7.015625,-3.917371,4.494141,6.684522,-1.070312,4.494141,7.246094,-4.014062,4.125,6.91875,-1.070312,4.125,7.5,-6.209063,4.125,4.97,-6.042168,4.494141,4.900664,-6.0725,4.617188,4.981094,-6.217675,4.494141,5.144727,-6.395312,4.125,5.325,-7.591093,4.125,2.7475,-7.464421,4.494141,2.70917,-7.550137,4.617188,2.753633,-7.755822,4.494141,2.844092,-7.989062,4.125,2.94375,-8.070313,4.125,0,-7.972656,4.494141,0,-8.085938,4.617188,0,-8.316406,4.494141,0,-8.570313,4.125,0,-8.070313,4.125,0,-7.527812,4.125,-2.7475,-7.437724,4.494141,-2.70917,-7.972656,4.494141,0,-7.542227,4.617188,-2.753633,-8.085938,4.617188,0,-7.754834,4.494141,-2.844092,-8.316406,4.494141,0,-7.989062,4.125,-2.94375,-8.570313,4.125,0,-6.040312,4.125,-4.97,-5.970977,4.494141,-4.900664,-6.051406,4.617188,-4.981094,-6.215039,4.494141,-5.144727,-6.395312,4.125,-5.325,-3.817812,4.125,-6.4575,-3.779482,4.494141,-6.367412,-3.823945,4.617188,-6.471914,-3.914404,4.494141,-6.684522,-4.014062,4.125,-6.91875,-1.070312,4.125,-7,-1.070312,4.494141,-6.902344,-1.070312,4.617188,-7.015625,-1.070312,4.494141,-7.246094,-1.070312,4.125,-7.5,-1.070312,4.125,-7,1.677188,4.125,-6.4575,1.638858,4.494141,-6.367412,-1.070312,4.494141,-6.902344,1.68332,4.617188,-6.471914,-1.070312,4.617188,-7.015625,1.77378,4.494141,-6.684522,-1.070312,4.494141,-7.246094,1.873438,4.125,-6.91875,-1.070312,4.125,-7.5,3.899688,4.125,-4.97,3.830352,4.494141,-4.900664,3.910782,4.617188,-4.981094,4.074414,4.494141,-5.144727,4.254687,4.125,-5.325,5.387188,4.125,-2.7475,5.2971,4.494141,-2.70917,5.401602,4.617188,-2.753633,5.614209,4.494141,-2.844092,5.848437,4.125,-2.94375,5.929688,4.125,0,5.832031,4.494141,0,5.945313,4.617188,0,6.175781,4.494141,0,6.429688,4.125,0,6.429688,4.125,0,5.848437,4.125,2.94375,6.695264,2.162109,3.304053,7.347656,2.162109,0,7.433985,0.234375,3.61836,8.148438,0.234375,0,7.956494,-1.623047,3.840674,8.714844,-1.623047,0,8.154688,-3.375,3.925,8.929688,-3.375,0,4.254687,4.125,5.325,4.906446,2.162109,5.976758,5.475,0.234375,6.545312,5.877149,-1.623047,6.947461,6.029688,-3.375,7.1,1.873438,4.125,6.91875,2.23374,2.162109,7.765576,2.548047,0.234375,8.504297,2.770362,-1.623047,9.026807,2.854688,-3.375,9.225,-1.070312,4.125,7.5,-1.070312,2.162109,8.417969,-1.070312,0.234375,9.21875,-1.070312,-1.623047,9.785156,-1.070312,-3.375,10,-1.070312,4.125,7.5,-4.014062,4.125,6.91875,-4.374365,2.162109,7.765576,-1.070312,2.162109,8.417969,-4.688672,0.234375,8.504297,-1.070312,0.234375,9.21875,-4.910986,-1.623047,9.026807,-1.070312,-1.623047,9.785156,-4.995313,-3.375,9.225,-1.070312,-3.375,10,-6.395312,4.125,5.325,-7.047071,2.162109,5.976758,-7.615624,0.234375,6.545312,-8.017773,-1.623047,6.947461,-8.170312,-3.375,7.1,-7.989062,4.125,2.94375,-8.835889,2.162109,3.304053,-9.57461,0.234375,3.61836,-10.097119,-1.623047,3.840674,-10.295313,-3.375,3.925,-8.570313,4.125,0,-9.488281,2.162109,0,-10.289063,0.234375,0,-10.855469,-1.623047,0,-11.070313,-3.375,0,-8.570313,4.125,0,-7.989062,4.125,-2.94375,-8.835889,2.162109,-3.304053,-9.488281,2.162109,0,-9.57461,0.234375,-3.61836,-10.289063,0.234375,0,-10.097119,-1.623047,-3.840674,-10.855469,-1.623047,0,-10.295313,-3.375,-3.925,-11.070313,-3.375,0,-6.395312,4.125,-5.325,-7.047071,2.162109,-5.976758,-7.615624,0.234375,-6.545312,-8.017773,-1.623047,-6.947461,-8.170312,-3.375,-7.1,-4.014062,4.125,-6.91875,-4.374365,2.162109,-7.765576,-4.688672,0.234375,-8.504297,-4.910986,-1.623047,-9.026807,-4.995313,-3.375,-9.225,-1.070312,4.125,-7.5,-1.070312,2.162109,-8.417969,-1.070312,0.234375,-9.21875,-1.070312,-1.623047,-9.785156,-1.070312,-3.375,-10,-1.070312,4.125,-7.5,1.873438,4.125,-6.91875,2.23374,2.162109,-7.765576,-1.070312,2.162109,-8.417969,2.548047,0.234375,-8.504297,-1.070312,0.234375,-9.21875,2.770362,-1.623047,-9.026807,-1.070312,-1.623047,-9.785156,2.854688,-3.375,-9.225,-1.070312,-3.375,-10,4.254687,4.125,-5.325,4.906446,2.162109,-5.976758,5.475,0.234375,-6.545312,5.877149,-1.623047,-6.947461,6.029688,-3.375,-7.1,5.848437,4.125,-2.94375,6.695264,2.162109,-3.304053,7.433985,0.234375,-3.61836,7.956494,-1.623047,-3.840674,8.154688,-3.375,-3.925,6.429688,4.125,0,7.347656,2.162109,0,8.148438,0.234375,0,8.714844,-1.623047,0,8.929688,-3.375,0,8.929688,-3.375,0,8.154688,-3.375,3.925,7.794336,-4.857422,3.77168,8.539063,-4.857422,0,7.001562,-5.953125,3.434375,7.679688,-5.953125,0,6.208789,-6.697266,3.09707,6.820313,-6.697266,0,5.848437,-7.125,2.94375,6.429688,-7.125,0,6.029688,-3.375,7.1,5.752343,-4.857422,6.822656,5.142187,-5.953125,6.2125,4.532031,-6.697266,5.602344,4.254687,-7.125,5.325,2.854688,-3.375,9.225,2.701367,-4.857422,8.864649,2.364063,-5.953125,8.071875,2.026758,-6.697266,7.279101,1.873438,-7.125,6.91875,-1.070312,-3.375,10,-1.070312,-4.857422,9.609375,-1.070312,-5.953125,8.75,-1.070312,-6.697266,7.890625,-1.070312,-7.125,7.5,-1.070312,-3.375,10,-4.995313,-3.375,9.225,-4.841992,-4.857422,8.864649,-1.070312,-4.857422,9.609375,-4.504687,-5.953125,8.071875,-1.070312,-5.953125,8.75,-4.167383,-6.697266,7.279101,-1.070312,-6.697266,7.890625,-4.014062,-7.125,6.91875,-1.070312,-7.125,7.5,-8.170312,-3.375,7.1,-7.892968,-4.857422,6.822656,-7.282812,-5.953125,6.2125,-6.672656,-6.697266,5.602344,-6.395312,-7.125,5.325,-10.295313,-3.375,3.925,-9.934961,-4.857422,3.77168,-9.142187,-5.953125,3.434375,-8.349414,-6.697266,3.09707,-7.989062,-7.125,2.94375,-11.070313,-3.375,0,-10.679688,-4.857422,0,-9.820313,-5.953125,0,-8.960938,-6.697266,0,-8.570313,-7.125,0,-11.070313,-3.375,0,-10.295313,-3.375,-3.925,-9.934961,-4.857422,-3.77168,-10.679688,-4.857422,0,-9.142187,-5.953125,-3.434375,-9.820313,-5.953125,0,-8.349414,-6.697266,-3.09707,-8.960938,-6.697266,0,-7.989062,-7.125,-2.94375,-8.570313,-7.125,0,-8.170312,-3.375,-7.1,-7.892968,-4.857422,-6.822656,-7.282812,-5.953125,-6.2125,-6.672656,-6.697266,-5.602344,-6.395312,-7.125,-5.325,-4.995313,-3.375,-9.225,-4.841992,-4.857422,-8.864649,-4.504687,-5.953125,-8.071875,-4.167383,-6.697266,-7.279101,-4.014062,-7.125,-6.91875,-1.070312,-3.375,-10,-1.070312,-4.857422,-9.609375,-1.070312,-5.953125,-8.75,-1.070312,-6.697266,-7.890625,-1.070312,-7.125,-7.5,-1.070312,-3.375,-10,2.854688,-3.375,-9.225,2.701367,-4.857422,-8.864649,-1.070312,-4.857422,-9.609375,2.364063,-5.953125,-8.071875,-1.070312,-5.953125,-8.75,2.026758,-6.697266,-7.279101,-1.070312,-6.697266,-7.890625,1.873438,-7.125,-6.91875,-1.070312,-7.125,-7.5,6.029688,-3.375,-7.1,5.752343,-4.857422,-6.822656,5.142187,-5.953125,-6.2125,4.532031,-6.697266,-5.602344,4.254687,-7.125,-5.325,8.154688,-3.375,-3.925,7.794336,-4.857422,-3.77168,7.001562,-5.953125,-3.434375,6.208789,-6.697266,-3.09707,5.848437,-7.125,-2.94375,8.929688,-3.375,0,8.539063,-4.857422,0,7.679688,-5.953125,0,6.820313,-6.697266,0,6.429688,-7.125,0,6.429688,-7.125,0,5.848437,-7.125,2.94375,5.691685,-7.400391,2.877056,6.259766,-7.400391,0,4.853868,-7.640625,2.520586,5.351563,-7.640625,0,2.783648,-7.810547,1.639761,3.107422,-7.810547,0,-1.070312,-7.875,0,4.254687,-7.125,5.325,4.134043,-7.400391,5.204355,3.489219,-7.640625,4.559531,1.895879,-7.810547,2.966191,-1.070312,-7.875,0,1.873438,-7.125,6.91875,1.806743,-7.400391,6.761997,1.450274,-7.640625,5.92418,0.569448,-7.810547,3.85396,-1.070312,-7.875,0,-1.070312,-7.125,7.5,-1.070312,-7.400391,7.330078,-1.070312,-7.640625,6.421875,-1.070312,-7.810547,4.177734,-1.070312,-7.875,0,-1.070312,-7.125,7.5,-4.014062,-7.125,6.91875,-3.947368,-7.400391,6.761997,-1.070312,-7.400391,7.330078,-3.590898,-7.640625,5.92418,-1.070312,-7.640625,6.421875,-2.710073,-7.810547,3.85396,-1.070312,-7.810547,4.177734,-1.070312,-7.875,0,-6.395312,-7.125,5.325,-6.274668,-7.400391,5.204355,-5.629844,-7.640625,4.559531,-4.036504,-7.810547,2.966191,-1.070312,-7.875,0,-7.989062,-7.125,2.94375,-7.832309,-7.400391,2.877056,-6.994492,-7.640625,2.520586,-4.924272,-7.810547,1.639761,-1.070312,-7.875,0,-8.570313,-7.125,0,-8.400391,-7.400391,0,-7.492188,-7.640625,0,-5.248047,-7.810547,0,-1.070312,-7.875,0,-8.570313,-7.125,0,-7.989062,-7.125,-2.94375,-7.832309,-7.400391,-2.877056,-8.400391,-7.400391,0,-6.994492,-7.640625,-2.520586,-7.492188,-7.640625,0,-4.924272,-7.810547,-1.639761,-5.248047,-7.810547,0,-1.070312,-7.875,0,-6.395312,-7.125,-5.325,-6.274668,-7.400391,-5.204355,-5.629844,-7.640625,-4.559531,-4.036504,-7.810547,-2.966191,-1.070312,-7.875,0,-4.014062,-7.125,-6.91875,-3.947368,-7.400391,-6.761997,-3.590898,-7.640625,-5.92418,-2.710073,-7.810547,-3.85396,-1.070312,-7.875,0,-1.070312,-7.125,-7.5,-1.070312,-7.400391,-7.330078,-1.070312,-7.640625,-6.421875,-1.070312,-7.810547,-4.177734,-1.070312,-7.875,0,-1.070312,-7.125,-7.5,1.873438,-7.125,-6.91875,1.806743,-7.400391,-6.761997,-1.070312,-7.400391,-7.330078,1.450274,-7.640625,-5.92418,-1.070312,-7.640625,-6.421875,0.569448,-7.810547,-3.85396,-1.070312,-7.810547,-4.177734,-1.070312,-7.875,0,4.254687,-7.125,-5.325,4.134043,-7.400391,-5.204355,3.489219,-7.640625,-4.559531,1.895879,-7.810547,-2.966191,-1.070312,-7.875,0,5.848437,-7.125,-2.94375,5.691685,-7.400391,-2.877056,4.853868,-7.640625,-2.520586,2.783648,-7.810547,-1.639761,-1.070312,-7.875,0,6.429688,-7.125,0,6.259766,-7.400391,0,5.351563,-7.640625,0,3.107422,-7.810547,0,-1.070312,-7.875,0,-9.070313,2.25,0,-8.992188,2.425781,0.84375,-11.47583,2.405457,0.84375,-11.40625,2.232422,0,-13.298828,2.263184,0.84375,-13.132813,2.109375,0,-14.421631,1.877014,0.84375,-14.203125,1.775391,0,-14.804688,1.125,0.84375,-14.570313,1.125,0,-8.820313,2.8125,1.125,-11.628906,2.786134,1.125,-13.664063,2.601563,1.125,-14.902344,2.100586,1.125,-15.320313,1.125,1.125,-8.648438,3.199219,0.84375,-11.781982,3.166809,0.84375,-14.029297,2.939941,0.84375,-15.383057,2.324158,0.84375,-15.835938,1.125,0.84375,-8.570313,3.375,0,-11.851563,3.339844,0,-14.195313,3.09375,0,-15.601563,2.425781,0,-16.070313,1.125,0,-8.570313,3.375,0,-8.648438,3.199219,-0.84375,-11.781982,3.166809,-0.84375,-11.851563,3.339844,0,-14.029297,2.939941,-0.84375,-14.195313,3.09375,0,-15.383057,2.324158,-0.84375,-15.601563,2.425781,0,-15.835938,1.125,-0.84375,-16.070313,1.125,0,-8.820313,2.8125,-1.125,-11.628906,2.786134,-1.125,-13.664063,2.601563,-1.125,-14.902344,2.100586,-1.125,-15.320313,1.125,-1.125,-8.992188,2.425781,-0.84375,-11.47583,2.405457,-0.84375,-13.298828,2.263184,-0.84375,-14.421631,1.877014,-0.84375,-14.804688,1.125,-0.84375,-9.070313,2.25,0,-11.40625,2.232422,0,-13.132813,2.109375,0,-14.203125,1.775391,0,-14.570313,1.125,0,-14.570313,1.125,0,-14.804688,1.125,0.84375,-14.588013,0.00705,0.84375,-14.375,0.105469,0,-13.90918,-1.275146,0.84375,-13.757813,-1.125,0,-12.724976,-2.540863,0.84375,-12.671875,-2.355469,0,-10.992188,-3.609375,0.84375,-11.070313,-3.375,0,-15.320313,1.125,1.125,-15.056641,-0.209473,1.125,-14.242188,-1.605469,1.125,-12.841797,-2.94873,1.125,-10.820313,-4.125,1.125,-15.835938,1.125,0.84375,-15.525269,-0.425995,0.84375,-14.575195,-1.935791,0.84375,-12.958618,-3.356598,0.84375,-10.648438,-4.640625,0.84375,-16.070313,1.125,0,-15.738281,-0.524414,0,-14.726563,-2.085938,0,-13.011719,-3.541992,0,-10.570313,-4.875,0,-16.070313,1.125,0,-15.835938,1.125,-0.84375,-15.525269,-0.425995,-0.84375,-15.738281,-0.524414,0,-14.575195,-1.935791,-0.84375,-14.726563,-2.085938,0,-12.958618,-3.356598,-0.84375,-13.011719,-3.541992,0,-10.648438,-4.640625,-0.84375,-10.570313,-4.875,0,-15.320313,1.125,-1.125,-15.056641,-0.209473,-1.125,-14.242188,-1.605469,-1.125,-12.841797,-2.94873,-1.125,-10.820313,-4.125,-1.125,-14.804688,1.125,-0.84375,-14.588013,0.00705,-0.84375,-13.90918,-1.275146,-0.84375,-12.724976,-2.540863,-0.84375,-10.992188,-3.609375,-0.84375,-14.570313,1.125,0,-14.375,0.105469,0,-13.757813,-1.125,0,-12.671875,-2.355469,0,-11.070313,-3.375,0,7.429688,-0.75,0,7.429688,-1.394531,1.85625,10.01123,-0.677124,1.676074,9.828125,-0.199219,0,11.101563,0.84668,1.279688,10.867188,1.125,0,11.723145,2.629761,0.883301,11.4375,2.730469,0,12.898438,4.125,0.703125,12.429688,4.125,0,7.429688,-2.8125,2.475,10.414063,-1.728516,2.234766,11.617188,0.234375,1.70625,12.351563,2.408203,1.177734,13.929688,4.125,0.9375,7.429688,-4.230469,1.85625,10.816895,-2.779907,1.676074,12.132813,-0.37793,1.279688,12.97998,2.186646,0.883301,14.960938,4.125,0.703125,7.429688,-4.875,0,11,-3.257813,0,12.367188,-0.65625,0,13.265625,2.085938,0,15.429688,4.125,0,7.429688,-4.875,0,7.429688,-4.230469,-1.85625,10.816895,-2.779907,-1.676074,11,-3.257813,0,12.132813,-0.37793,-1.279688,12.367188,-0.65625,0,12.97998,2.186646,-0.883301,13.265625,2.085938,0,14.960938,4.125,-0.703125,15.429688,4.125,0,7.429688,-2.8125,-2.475,10.414063,-1.728516,-2.234766,11.617188,0.234375,-1.70625,12.351563,2.408203,-1.177734,13.929688,4.125,-0.9375,7.429688,-1.394531,-1.85625,10.01123,-0.677124,-1.676074,11.101563,0.84668,-1.279688,11.723145,2.629761,-0.883301,12.898438,4.125,-0.703125,7.429688,-0.75,0,9.828125,-0.199219,0,10.867188,1.125,0,11.4375,2.730469,0,12.429688,4.125,0,12.429688,4.125,0,12.898438,4.125,0.703125,13.291077,4.346237,0.65918,12.789063,4.335938,0,13.525879,4.422729,0.5625,13.054688,4.40625,0,13.532898,4.350357,0.46582,13.132813,4.335938,0,13.242188,4.125,0.421875,12.929688,4.125,0,13.929688,4.125,0.9375,14.395508,4.368896,0.878906,14.5625,4.458984,0.75,14.413086,4.38208,0.621094,13.929688,4.125,0.5625,14.960938,4.125,0.703125,15.499939,4.391556,0.65918,15.599121,4.495239,0.5625,15.293274,4.413804,0.46582,14.617188,4.125,0.421875,15.429688,4.125,0,16.001953,4.401855,0,16.070313,4.511719,0,15.693359,4.428224,0,14.929688,4.125,0,15.429688,4.125,0,14.960938,4.125,-0.703125,15.499939,4.391556,-0.65918,16.001953,4.401855,0,15.599121,4.495239,-0.5625,16.070313,4.511719,0,15.293274,4.413804,-0.46582,15.693359,4.428224,0,14.617188,4.125,-0.421875,14.929688,4.125,0,13.929688,4.125,-0.9375,14.395508,4.368896,-0.878906,14.5625,4.458984,-0.75,14.413086,4.38208,-0.621094,13.929688,4.125,-0.5625,12.898438,4.125,-0.703125,13.291077,4.346237,-0.65918,13.525879,4.422729,-0.5625,13.532898,4.350357,-0.46582,13.242188,4.125,-0.421875,12.429688,4.125,0,12.789063,4.335938,0,13.054688,4.40625,0,13.132813,4.335938,0,12.929688,4.125,0,0.501414,7.628906,0.670256,0.632813,7.628906,0,-1.070312,7.875,0,0.429278,7.03125,0.639395,0.554688,7.03125,0,-0.162029,6.292969,0.38696,-0.085937,6.292969,0,-0.147812,5.625,0.3925,-0.070312,5.625,0,0.140489,7.628906,1.210801,-1.070312,7.875,0,0.084844,7.03125,1.155156,-0.370879,6.292969,0.699434,-0.360312,5.625,0.71,-0.400056,7.628906,1.571726,-1.070312,7.875,0,-0.430918,7.03125,1.49959,-0.683352,6.292969,0.908284,-0.677812,5.625,0.9225,-1.070312,7.628906,1.703125,-1.070312,7.875,0,-1.070312,7.03125,1.625,-1.070312,6.292969,0.984375,-1.070312,5.625,1,-1.740569,7.628906,1.571726,-1.070312,7.628906,1.703125,-1.070312,7.875,0,-1.709707,7.03125,1.49959,-1.070312,7.03125,1.625,-1.457273,6.292969,0.908284,-1.070312,6.292969,0.984375,-1.462812,5.625,0.9225,-1.070312,5.625,1,-2.281113,7.628906,1.210801,-1.070312,7.875,0,-2.225469,7.03125,1.155156,-1.769746,6.292969,0.699434,-1.780312,5.625,0.71,-2.642038,7.628906,0.670256,-1.070312,7.875,0,-2.569902,7.03125,0.639395,-1.978596,6.292969,0.38696,-1.992812,5.625,0.3925,-2.773438,7.628906,0,-1.070312,7.875,0,-2.695313,7.03125,0,-2.054687,6.292969,0,-2.070312,5.625,0,-2.642038,7.628906,-0.670256,-2.773438,7.628906,0,-1.070312,7.875,0,-2.569902,7.03125,-0.639395,-2.695313,7.03125,0,-1.978596,6.292969,-0.38696,-2.054687,6.292969,0,-1.992812,5.625,-0.3925,-2.070312,5.625,0,-2.281113,7.628906,-1.210801,-1.070312,7.875,0,-2.225469,7.03125,-1.155156,-1.769746,6.292969,-0.699434,-1.780312,5.625,-0.71,-1.740569,7.628906,-1.571726,-1.070312,7.875,0,-1.709707,7.03125,-1.49959,-1.457273,6.292969,-0.908284,-1.462812,5.625,-0.9225,-1.070312,7.628906,-1.703125,-1.070312,7.875,0,-1.070312,7.03125,-1.625,-1.070312,6.292969,-0.984375,-1.070312,5.625,-1,-0.400056,7.628906,-1.571726,-1.070312,7.628906,-1.703125,-1.070312,7.875,0,-0.430918,7.03125,-1.49959,-1.070312,7.03125,-1.625,-0.683352,6.292969,-0.908284,-1.070312,6.292969,-0.984375,-0.677812,5.625,-0.9225,-1.070312,5.625,-1,0.140489,7.628906,-1.210801,-1.070312,7.875,0,0.084844,7.03125,-1.155156,-0.370879,6.292969,-0.699434,-0.360312,5.625,-0.71,0.501414,7.628906,-0.670256,-1.070312,7.875,0,0.429278,7.03125,-0.639395,-0.162029,6.292969,-0.38696,-0.147812,5.625,-0.3925,0.632813,7.628906,0,-1.070312,7.875,0,0.554688,7.03125,0,-0.085937,6.292969,0,-0.070312,5.625,0,-0.070312,5.625,0,-0.147812,5.625,0.3925,1.034141,5.179688,0.895391,1.210938,5.179688,0,2.735,4.875,1.619062,3.054688,4.875,0,4.262891,4.570313,2.26914,4.710938,4.570313,0,4.925938,4.125,2.55125,5.429688,4.125,0,-0.360312,5.625,0.71,0.549375,5.179688,1.619688,1.858438,4.875,2.92875,3.034375,4.570313,4.104687,3.544688,4.125,4.615,-0.677812,5.625,0.9225,-0.174922,5.179688,2.104453,0.54875,4.875,3.805313,1.198828,4.570313,5.333203,1.480938,4.125,5.99625,-1.070312,5.625,1,-1.070312,5.179688,2.28125,-1.070312,4.875,4.125,-1.070312,4.570313,5.78125,-1.070312,4.125,6.5,-1.070312,5.625,1,-1.462812,5.625,0.9225,-1.965703,5.179688,2.104453,-1.070312,5.179688,2.28125,-2.689375,4.875,3.805313,-1.070312,4.875,4.125,-3.339453,4.570313,5.333203,-1.070312,4.570313,5.78125,-3.621562,4.125,5.99625,-1.070312,4.125,6.5,-1.780312,5.625,0.71,-2.69,5.179688,1.619688,-3.999062,4.875,2.92875,-5.174999,4.570313,4.104687,-5.685312,4.125,4.615,-1.992812,5.625,0.3925,-3.174765,5.179688,0.895391,-4.875625,4.875,1.619062,-6.403516,4.570313,2.26914,-7.066563,4.125,2.55125,-2.070312,5.625,0,-3.351562,5.179688,0,-5.195313,4.875,0,-6.851563,4.570313,0,-7.570313,4.125,0,-2.070312,5.625,0,-1.992812,5.625,-0.3925,-3.174765,5.179688,-0.895391,-3.351562,5.179688,0,-4.875625,4.875,-1.619062,-5.195313,4.875,0,-6.403516,4.570313,-2.26914,-6.851563,4.570313,0,-7.066563,4.125,-2.55125,-7.570313,4.125,0,-1.780312,5.625,-0.71,-2.69,5.179688,-1.619688,-3.999062,4.875,-2.92875,-5.174999,4.570313,-4.104687,-5.685312,4.125,-4.615,-1.462812,5.625,-0.9225,-1.965703,5.179688,-2.104453,-2.689375,4.875,-3.805313,-3.339453,4.570313,-5.333203,-3.621562,4.125,-5.99625,-1.070312,5.625,-1,-1.070312,5.179688,-2.28125,-1.070312,4.875,-4.125,-1.070312,4.570313,-5.78125,-1.070312,4.125,-6.5,-1.070312,5.625,-1,-0.677812,5.625,-0.9225,-0.174922,5.179688,-2.104453,-1.070312,5.179688,-2.28125,0.54875,4.875,-3.805313,-1.070312,4.875,-4.125,1.198828,4.570313,-5.333203,-1.070312,4.570313,-5.78125,1.480938,4.125,-5.99625,-1.070312,4.125,-6.5,-0.360312,5.625,-0.71,0.549375,5.179688,-1.619688,1.858438,4.875,-2.92875,3.034375,4.570313,-4.104687,3.544688,4.125,-4.615,-0.147812,5.625,-0.3925,1.034141,5.179688,-0.895391,2.735,4.875,-1.619062,4.262891,4.570313,-2.26914,4.925938,4.125,-2.55125,-0.070312,5.625,0,1.210938,5.179688,0,3.054688,4.875,0,4.710938,4.570313,0,5.429688,4.125,0],
      "normals" : [-0.966742,-0.255752,0,-0.893014,-0.256345,-0.369882,-0.893437,0.255996,-0.369102,-0.966824,0.255443,0,-0.083877,0.995843,-0.035507,-0.092052,0.995754,0,0.629724,0.73186,0.260439,0.68205,0.731305,0,0.803725,0.49337,0.332584,0.870301,0.492521,0,-0.683407,-0.256728,-0.683407,-0.683531,0.256068,-0.683531,-0.064925,0.995776,-0.064925,0.481399,0.732469,0.481399,0.614804,0.493997,0.614804,-0.369882,-0.256345,-0.893014,-0.369102,0.255996,-0.893437,-0.035507,0.995843,-0.083877,0.260439,0.73186,0.629724,0.332584,0.493369,0.803725,-0.002848,-0.257863,-0.966177,-0.001923,0.254736,-0.967009,-0.000266,0.995734,-0.09227,0.000024,0.731295,0.682061,0,0.492521,0.870301,-0.002848,-0.257863,-0.966177,0.379058,-0.3593,-0.852771,0.37711,0.149085,-0.914091,-0.001923,0.254736,-0.967009,0.027502,0.992081,-0.122552,-0.000266,0.995734,-0.09227,-0.26101,0.726762,0.635367,0.000024,0.731295,0.682061,-0.332485,0.492546,0.804271,0,0.492521,0.870301,0.663548,-0.41079,-0.625264,0.712664,0.073722,-0.697621,0.099726,0.987509,-0.121983,-0.48732,0.723754,0.488569,-0.615242,0.492602,0.615484,0.880028,-0.332906,-0.338709,0.917276,0.167113,-0.361493,0.113584,0.992365,-0.04807,-0.63415,0.727508,0.261889,-0.804126,0.492634,0.332705,0.96669,-0.255738,0.010454,0.967442,0.252962,0.008103,0.093436,0.995624,0.001281,-0.682167,0.731196,-0.000343,-0.870322,0.492483,-0.000054,0.96669,-0.255738,0.010454,0.893014,-0.256345,0.369882,0.893437,0.255996,0.369102,0.967442,0.252962,0.008103,0.083877,0.995843,0.035507,0.093436,0.995624,0.001281,-0.629724,0.73186,-0.260439,-0.682167,0.731196,-0.000343,-0.803725,0.49337,-0.332584,-0.870322,0.492483,-0.000054,0.683407,-0.256728,0.683407,0.683531,0.256068,0.683531,0.064925,0.995776,0.064925,-0.481399,0.732469,-0.481399,-0.614804,0.493997,-0.614804,0.369882,-0.256345,0.893014,0.369102,0.255996,0.893437,0.035507,0.995843,0.083877,-0.260439,0.73186,-0.629724,-0.332584,0.493369,-0.803725,0,-0.255752,0.966742,0,0.255443,0.966824,0,0.995754,0.092052,0,0.731305,-0.68205,0,0.492521,-0.870301,0,-0.255752,0.966742,-0.369882,-0.256345,0.893014,-0.369102,0.255996,0.893437,0,0.255443,0.966824,-0.035507,0.995843,0.083877,0,0.995754,0.092052,0.260439,0.73186,-0.629724,0,0.731305,-0.68205,0.332584,0.49337,-0.803725,0,0.492521,-0.870301,-0.683407,-0.256728,0.683407,-0.683531,0.256068,0.683531,-0.064925,0.995776,0.064925,0.481399,0.732469,-0.481399,0.614804,0.493997,-0.614804,-0.893014,-0.256345,0.369882,-0.893437,0.255996,0.369102,-0.083877,0.995843,0.035507,0.629724,0.73186,-0.260439,0.803725,0.493369,-0.332584,-0.966742,-0.255752,0,-0.966824,0.255443,0,-0.092052,0.995754,0,0.68205,0.731305,0,0.870301,0.492521,0,0.870301,0.492521,0,0.803725,0.49337,0.332584,0.845438,0.403546,0.349835,0.915321,0.402725,0,0.869996,0.336859,0.360047,0.941808,0.336151,0,0.904193,0.205791,0.37428,0.97869,0.205342,0,0.921879,-0.06637,0.381752,0.997804,-0.06624,0,0.614804,0.493997,0.614804,0.646802,0.404096,0.646802,0.665655,0.337351,0.665655,0.691923,0.20612,0.691923,0.705543,-0.06648,0.705542,0.332584,0.493369,0.803725,0.349835,0.403546,0.845438,0.360047,0.336859,0.869996,0.37428,0.205791,0.904193,0.381752,-0.066369,0.921879,0,0.492521,0.870301,0,0.402725,0.915321,0,0.336151,0.941808,0,0.205342,0.97869,0,-0.06624,0.997804,0,0.492521,0.870301,-0.332485,0.492546,0.804271,-0.349835,0.403546,0.845438,0,0.402725,0.915321,-0.360047,0.336859,0.869996,0,0.336151,0.941808,-0.37428,0.205791,0.904193,0,0.205342,0.97869,-0.381752,-0.06637,0.921879,0,-0.06624,0.997804,-0.615242,0.492602,0.615484,-0.646802,0.404096,0.646802,-0.665655,0.337351,0.665655,-0.691923,0.20612,0.691923,-0.705542,-0.06648,0.705543,-0.804126,0.492634,0.332705,-0.845438,0.403546,0.349835,-0.869996,0.336859,0.360047,-0.904193,0.205791,0.37428,-0.921879,-0.066369,0.381752,-0.870322,0.492483,-0.000054,-0.915321,0.402725,0,-0.941808,0.336151,0,-0.97869,0.205342,0,-0.997804,-0.06624,0,-0.870322,0.492483,-0.000054,-0.803725,0.49337,-0.332584,-0.845438,0.403546,-0.349835,-0.915321,0.402725,0,-0.869996,0.336859,-0.360047,-0.941808,0.336151,0,-0.904193,0.205791,-0.37428,-0.97869,0.205342,0,-0.921879,-0.06637,-0.381752,-0.997804,-0.06624,0,-0.614804,0.493997,-0.614804,-0.646802,0.404096,-0.646802,-0.665655,0.337351,-0.665655,-0.691923,0.20612,-0.691923,-0.705543,-0.06648,-0.705542,-0.332584,0.493369,-0.803725,-0.349835,0.403546,-0.845438,-0.360047,0.336859,-0.869996,-0.37428,0.205791,-0.904193,-0.381752,-0.066369,-0.921879,0,0.492521,-0.870301,0,0.402725,-0.915321,0,0.336151,-0.941808,0,0.205342,-0.97869,0,-0.06624,-0.997804,0,0.492521,-0.870301,0.332584,0.49337,-0.803725,0.349835,0.403546,-0.845438,0,0.402725,-0.915321,0.360047,0.336859,-0.869996,0,0.336151,-0.941808,0.37428,0.205791,-0.904193,0,0.205342,-0.97869,0.381752,-0.06637,-0.921879,0,-0.06624,-0.997804,0.614804,0.493997,-0.614804,0.646802,0.404096,-0.646802,0.665655,0.337351,-0.665655,0.691923,0.20612,-0.691923,0.705542,-0.06648,-0.705543,0.803725,0.493369,-0.332584,0.845438,0.403546,-0.349835,0.869996,0.336859,-0.360047,0.904193,0.205791,-0.37428,0.921879,-0.066369,-0.381752,0.870301,0.492521,0,0.915321,0.402725,0,0.941808,0.336151,0,0.97869,0.205342,0,0.997804,-0.06624,0,0.997804,-0.06624,0,0.921879,-0.06637,0.381752,0.831437,-0.43618,0.344179,0.900182,-0.435513,0,0.673512,-0.684666,0.278594,0.729611,-0.683863,0,0.640399,-0.720924,0.264874,0.693951,-0.720022,0,0.732949,-0.608995,0.303167,0.79395,-0.607983,0,0.705543,-0.06648,0.705542,0.636092,-0.436778,0.636092,0.514965,-0.68529,0.514965,0.489651,-0.721446,0.489651,0.560555,-0.609554,0.560555,0.381752,-0.066369,0.921879,0.344179,-0.43618,0.831437,0.278595,-0.684666,0.673512,0.264874,-0.720924,0.640399,0.303167,-0.608995,0.732949,0,-0.06624,0.997804,0,-0.435513,0.900182,0,-0.683863,0.729611,0,-0.720022,0.693951,0,-0.607983,0.79395,0,-0.06624,0.997804,-0.381752,-0.06637,0.921879,-0.344179,-0.43618,0.831437,0,-0.435513,0.900182,-0.278594,-0.684666,0.673512,0,-0.683863,0.729611,-0.264874,-0.720924,0.640399,0,-0.720022,0.693951,-0.303167,-0.608995,0.732949,0,-0.607983,0.79395,-0.705542,-0.06648,0.705543,-0.636092,-0.436778,0.636092,-0.514965,-0.68529,0.514965,-0.489651,-0.721446,0.489651,-0.560555,-0.609554,0.560555,-0.921879,-0.066369,0.381752,-0.831437,-0.43618,0.344179,-0.673512,-0.684666,0.278595,-0.640399,-0.720924,0.264874,-0.732949,-0.608995,0.303167,-0.997804,-0.06624,0,-0.900182,-0.435513,0,-0.729611,-0.683863,0,-0.693951,-0.720022,0,-0.79395,-0.607983,0,-0.997804,-0.06624,0,-0.921879,-0.06637,-0.381752,-0.831437,-0.43618,-0.344179,-0.900182,-0.435513,0,-0.673512,-0.684666,-0.278594,-0.729611,-0.683863,0,-0.640399,-0.720924,-0.264874,-0.693951,-0.720022,0,-0.732949,-0.608995,-0.303167,-0.79395,-0.607983,0,-0.705543,-0.06648,-0.705542,-0.636092,-0.436778,-0.636092,-0.514965,-0.68529,-0.514965,-0.489651,-0.721446,-0.489651,-0.560555,-0.609554,-0.560555,-0.381752,-0.066369,-0.921879,-0.344179,-0.43618,-0.831437,-0.278595,-0.684666,-0.673512,-0.264874,-0.720924,-0.640399,-0.303167,-0.608995,-0.732949,0,-0.06624,-0.997804,0,-0.435513,-0.900182,0,-0.683863,-0.729611,0,-0.720022,-0.693951,0,-0.607983,-0.79395,0,-0.06624,-0.997804,0.381752,-0.06637,-0.921879,0.344179,-0.43618,-0.831437,0,-0.435513,-0.900182,0.278594,-0.684666,-0.673512,0,-0.683863,-0.729611,0.264874,-0.720924,-0.640399,0,-0.720022,-0.693951,0.303167,-0.608995,-0.732949,0,-0.607983,-0.79395,0.705542,-0.06648,-0.705543,0.636092,-0.436778,-0.636092,0.514965,-0.68529,-0.514965,0.489651,-0.721446,-0.489651,0.560555,-0.609554,-0.560555,0.921879,-0.066369,-0.381752,0.831437,-0.43618,-0.344179,0.673512,-0.684666,-0.278595,0.640399,-0.720924,-0.264874,0.732949,-0.608995,-0.303167,0.997804,-0.06624,0,0.900182,-0.435513,0,0.729611,-0.683863,0,0.693951,-0.720022,0,0.79395,-0.607983,0,0.79395,-0.607983,0,0.732949,-0.608995,0.303167,0.57623,-0.781801,0.238217,0.62386,-0.781536,0,0.163628,-0.984208,0.067527,0.177291,-0.984159,0,0.045422,-0.998792,0.018736,0.049207,-0.998789,0,0,-1,0,0.560555,-0.609554,0.560555,0.440416,-0.782348,0.440416,0.124903,-0.984276,0.124903,0.034662,-0.998798,0.034662,0,-1,0,0.303167,-0.608995,0.732949,0.238217,-0.781801,0.57623,0.067527,-0.984208,0.163628,0.018736,-0.998792,0.045422,0,-1,0,0,-0.607983,0.79395,0,-0.781536,0.62386,0,-0.984159,0.177291,0,-0.998789,0.049207,0,-1,0,0,-0.607983,0.79395,-0.303167,-0.608995,0.732949,-0.238217,-0.781801,0.57623,0,-0.781536,0.62386,-0.067527,-0.984208,0.163628,0,-0.984159,0.177291,-0.018736,-0.998792,0.045422,0,-0.998789,0.049207,0,-1,0,-0.560555,-0.609554,0.560555,-0.440416,-0.782348,0.440416,-0.124903,-0.984276,0.124903,-0.034662,-0.998798,0.034662,0,-1,0,-0.732949,-0.608995,0.303167,-0.57623,-0.781801,0.238217,-0.163628,-0.984208,0.067527,-0.045422,-0.998792,0.018736,0,-1,0,-0.79395,-0.607983,0,-0.62386,-0.781536,0,-0.177291,-0.984159,0,-0.049207,-0.998789,0,0,-1,0,-0.79395,-0.607983,0,-0.732949,-0.608995,-0.303167,-0.57623,-0.781801,-0.238217,-0.62386,-0.781536,0,-0.163628,-0.984208,-0.067527,-0.177291,-0.984159,0,-0.045422,-0.998792,-0.018736,-0.049207,-0.998789,0,0,-1,0,-0.560555,-0.609554,-0.560555,-0.440416,-0.782348,-0.440416,-0.124903,-0.984276,-0.124903,-0.034662,-0.998798,-0.034662,0,-1,0,-0.303167,-0.608995,-0.732949,-0.238217,-0.781801,-0.57623,-0.067527,-0.984208,-0.163628,-0.018736,-0.998792,-0.045422,0,-1,0,0,-0.607983,-0.79395,0,-0.781536,-0.62386,0,-0.984159,-0.177291,0,-0.998789,-0.049207,0,-1,0,0,-0.607983,-0.79395,0.303167,-0.608995,-0.732949,0.238217,-0.781801,-0.57623,0,-0.781536,-0.62386,0.067527,-0.984208,-0.163628,0,-0.984159,-0.177291,0.018736,-0.998792,-0.045422,0,-0.998789,-0.049207,0,-1,0,0.560555,-0.609554,-0.560555,0.440416,-0.782348,-0.440416,0.124903,-0.984276,-0.124903,0.034662,-0.998798,-0.034662,0,-1,0,0.732949,-0.608995,-0.303167,0.57623,-0.781801,-0.238217,0.163628,-0.984208,-0.067527,0.045422,-0.998792,-0.018736,0,-1,0,0.79395,-0.607983,0,0.62386,-0.781536,0,0.177291,-0.984159,0,0.049207,-0.998789,0,0,-1,0,0.007786,-0.99997,-0.000216,0.007039,-0.812495,0.582926,0.036127,-0.837257,0.545614,0.039138,-0.999233,-0.000989,0.161846,-0.810421,0.563048,0.179512,-0.983746,-0.004369,0.482365,-0.595148,0.642746,0.612299,-0.790557,-0.01046,0.73872,-0.114594,0.664199,0.986152,-0.165708,-0.00667,-0.001909,0.162121,0.986769,0.002762,0.017107,0.99985,0.010533,0.073398,0.997247,-0.066041,0.13007,0.989303,-0.094427,0.016594,0.995393,-0.009203,0.871509,0.490293,-0.048606,0.840609,0.539457,-0.223298,0.80288,0.552739,-0.596365,0.559971,0.575135,-0.803337,0.068236,0.591603,-0.010561,0.999944,0.000103,-0.058798,0.99827,0.00071,-0.28071,0.959787,0.003269,-0.749723,0.661738,0.004268,-0.997351,0.072714,0.002059,-0.010561,0.999944,0.000103,-0.008792,0.871493,-0.49033,-0.046494,0.841178,-0.538756,-0.058798,0.99827,0.00071,-0.217909,0.806807,-0.549161,-0.28071,0.959787,0.003269,-0.597291,0.560026,-0.574121,-0.749723,0.661738,0.004268,-0.804,0.062913,-0.591292,-0.997351,0.072714,0.002059,-0.001806,0.161691,-0.98684,0.002031,0.014555,-0.999892,0.009215,0.060069,-0.998152,-0.059334,0.113865,-0.991723,-0.086899,0.01229,-0.996141,0.006418,-0.812379,-0.583095,0.033783,-0.837512,-0.545373,0.157113,-0.811947,-0.56219,0.484406,-0.589366,-0.646528,0.73887,-0.10132,-0.666187,0.007786,-0.99997,-0.000216,0.039138,-0.999233,-0.000989,0.179512,-0.983746,-0.004369,0.612299,-0.790557,-0.01046,0.986152,-0.165708,-0.00667,0.986152,-0.165708,-0.00667,0.73872,-0.114594,0.664199,0.725608,0.259351,0.637361,0.946512,0.32265,-0.003357,0.645945,0.461988,0.607719,0.82583,0.56387,-0.007452,0.531615,0.63666,0.558614,0.650011,0.759893,-0.006937,0.424964,0.681717,0.59554,0.532429,0.846459,-0.005245,-0.094427,0.016594,0.995393,-0.049562,-0.019755,0.998576,-0.037816,-0.035624,0.99865,-0.037914,-0.036512,0.998614,-0.168854,-0.297945,0.93953,-0.803337,0.068236,0.591603,-0.742342,-0.299166,0.599523,-0.619602,-0.529406,0.579502,-0.483708,-0.68576,0.543837,-0.445293,-0.794355,0.413177,-0.997351,0.072714,0.002059,-0.926513,-0.376258,0.001996,-0.75392,-0.656952,0.004317,-0.566224,-0.824244,0.003461,-0.481804,-0.876277,0.00185,-0.997351,0.072714,0.002059,-0.804,0.062913,-0.591292,-0.744675,-0.294425,-0.598977,-0.926513,-0.376258,0.001996,-0.621949,-0.528114,-0.578165,-0.75392,-0.656952,0.004317,-0.481171,-0.68834,-0.542828,-0.566224,-0.824244,0.003461,-0.438055,-0.797035,-0.415744,-0.481804,-0.876277,0.00185,-0.086899,0.01229,-0.996141,-0.044337,-0.017056,-0.998871,-0.026176,-0.028166,-0.99926,-0.025294,-0.028332,-0.999278,-0.157482,-0.289392,-0.944167,0.73887,-0.10132,-0.666187,0.728244,0.25241,-0.637142,0.647055,0.459725,-0.608254,0.522994,0.640657,-0.56217,0.409978,0.682857,-0.604669,0.986152,-0.165708,-0.00667,0.946512,0.32265,-0.003357,0.82583,0.56387,-0.007452,0.650011,0.759893,-0.006937,0.532429,0.846459,-0.005245,-0.230787,0.972982,-0.006523,-0.152877,0.687211,0.71019,-0.316721,0.63775,0.702113,-0.548936,0.835863,-0.001511,-0.601067,0.471452,0.64533,-0.875671,0.482806,0.009893,-0.635889,0.44609,0.629801,-0.877554,0.479097,0.019092,-0.435746,0.601008,0.670011,-0.69619,0.717439,0.024497,0.111113,-0.08507,0.99016,0.22331,0.00654,0.974726,0.190097,0.154964,0.969458,0.005271,0.189482,0.98187,-0.011752,0.246688,0.969024,0.343906,-0.722796,0.599412,0.572489,-0.567656,0.591627,0.787436,-0.256459,0.560512,0.647097,-0.306374,0.698141,0.427528,-0.499343,0.753576,0.410926,-0.911668,0.001284,0.67152,-0.740986,-0.000899,0.922026,-0.38706,-0.007253,0.84691,-0.531556,-0.013854,0.535924,-0.844201,-0.010505,0.410926,-0.911668,0.001284,0.341188,-0.722823,-0.600931,0.578664,-0.561139,-0.591838,0.67152,-0.740986,-0.000899,0.784869,-0.25102,-0.566542,0.922026,-0.38706,-0.007253,0.642681,-0.302257,-0.70399,0.84691,-0.531556,-0.013854,0.418589,-0.500042,-0.758117,0.535924,-0.844201,-0.010505,0.115806,-0.079139,-0.990114,0.232811,0.012565,-0.972441,0.206662,0.153601,-0.96628,0.0245,0.161443,-0.986578,0.003382,0.211115,-0.977455,-0.134912,0.687491,-0.713551,-0.31954,0.633073,-0.705063,-0.603902,0.461442,-0.649903,-0.631815,0.437169,-0.640072,-0.424306,0.612706,-0.66675,-0.230787,0.972982,-0.006523,-0.548936,0.835863,-0.001511,-0.875671,0.482806,0.009893,-0.877554,0.479097,0.019092,-0.69619,0.717439,0.024497,-0.69619,0.717439,0.024497,-0.435746,0.601008,0.670011,-0.259858,0.791937,0.552548,-0.425801,0.904753,0.010805,0.009539,0.99972,-0.021674,0.022046,0.999756,0.001623,0.410157,0.332912,-0.849082,0.999598,0.025875,0.011556,0.541523,-0.548619,-0.637001,0.709587,-0.704552,0.009672,-0.011752,0.246688,0.969024,0.046311,0.455223,0.889172,-0.010688,0.988794,0.1489,-0.044376,0.682946,-0.72912,0.122824,0.009233,-0.992385,0.427528,-0.499343,0.753576,0.481839,-0.18044,0.85748,0.455272,0.736752,0.499925,-0.220542,0.907193,-0.358277,-0.235919,0.65725,-0.715797,0.535924,-0.844201,-0.010505,0.728094,-0.6853,-0.015585,0.888738,0.458112,-0.016679,-0.260098,0.965582,0.0008,-0.371611,0.928378,-0.004418,0.535924,-0.844201,-0.010505,0.418589,-0.500042,-0.758117,0.480165,-0.178362,-0.858853,0.728094,-0.6853,-0.015585,0.488102,0.716802,-0.497947,0.888738,0.458112,-0.016679,-0.222004,0.905399,0.361892,-0.260098,0.965582,0.0008,-0.235405,0.66318,0.710477,-0.371611,0.928378,-0.004418,0.003382,0.211115,-0.977455,0.05872,0.437702,-0.8972,0.001326,0.986459,-0.164002,-0.04419,0.681675,0.730319,0.138801,-0.034188,0.98973,-0.424306,0.612706,-0.66675,-0.25889,0.797206,-0.54538,0.01227,0.999739,0.019287,0.398632,0.35489,0.845663,0.537564,-0.581398,0.610738,-0.69619,0.717439,0.024497,-0.425801,0.904753,0.010805,0.022046,0.999756,0.001623,0.999598,0.025875,0.011556,0.709587,-0.704552,0.009672,0.76264,0.565035,0.314825,0.82454,0.565804,0.000017,0,1,0,0.847982,-0.397998,0.350034,0.917701,-0.397272,0.000034,0.864141,-0.355261,0.356441,0.935269,-0.353939,0.000113,0.720992,0.625625,0.297933,0.780712,0.62489,0.000075,0.583357,0.565165,0.583338,0,1,0,0.648485,-0.398726,0.648448,0.660872,-0.355894,0.660748,0.551862,0.62529,0.55178,0.314824,0.565051,0.762629,0,1,0,0.350045,-0.397976,0.847988,0.356474,-0.355199,0.864153,0.297983,0.625515,0.721067,-0.000017,0.565804,0.82454,0,1,0,-0.000034,-0.397272,0.917701,-0.000113,-0.353939,0.935269,-0.000075,0.62489,0.780712,-0.314825,0.565035,0.76264,-0.000017,0.565804,0.82454,0,1,0,-0.350034,-0.397998,0.847982,-0.000034,-0.397272,0.917701,-0.356441,-0.355261,0.864141,-0.000113,-0.353939,0.935269,-0.297933,0.625625,0.720992,-0.000075,0.62489,0.780712,-0.583338,0.565165,0.583357,0,1,0,-0.648448,-0.398726,0.648485,-0.660748,-0.355894,0.660872,-0.55178,0.62529,0.551862,-0.762629,0.565051,0.314824,0,1,0,-0.847988,-0.397976,0.350045,-0.864153,-0.355199,0.356474,-0.721067,0.625515,0.297983,-0.82454,0.565804,-0.000017,0,1,0,-0.917701,-0.397272,-0.000034,-0.935269,-0.353939,-0.000113,-0.780712,0.62489,-0.000075,-0.76264,0.565035,-0.314825,-0.82454,0.565804,-0.000017,0,1,0,-0.847982,-0.397998,-0.350034,-0.917701,-0.397272,-0.000034,-0.864141,-0.355261,-0.356441,-0.935269,-0.353939,-0.000113,-0.720992,0.625625,-0.297933,-0.780712,0.62489,-0.000075,-0.583357,0.565165,-0.583338,0,1,0,-0.648485,-0.398726,-0.648448,-0.660872,-0.355894,-0.660748,-0.551862,0.62529,-0.55178,-0.314824,0.565051,-0.762629,0,1,0,-0.350045,-0.397976,-0.847988,-0.356474,-0.355199,-0.864153,-0.297983,0.625515,-0.721067,0.000017,0.565804,-0.82454,0,1,0,0.000034,-0.397272,-0.917701,0.000113,-0.353939,-0.935269,0.000075,0.62489,-0.780712,0.314825,0.565035,-0.76264,0.000017,0.565804,-0.82454,0,1,0,0.350034,-0.397998,-0.847982,0.000034,-0.397272,-0.917701,0.356441,-0.355261,-0.864141,0.000113,-0.353939,-0.935269,0.297933,0.625625,-0.720992,0.000075,0.62489,-0.780712,0.583338,0.565165,-0.583357,0,1,0,0.648448,-0.398726,-0.648485,0.660748,-0.355894,-0.660872,0.55178,0.62529,-0.551862,0.762629,0.565051,-0.314824,0,1,0,0.847988,-0.397976,-0.350045,0.864153,-0.355199,-0.356474,0.721067,0.625515,-0.297983,0.82454,0.565804,0.000017,0,1,0,0.917701,-0.397272,0.000034,0.935269,-0.353939,0.000113,0.780712,0.62489,0.000075,0.780712,0.62489,0.000075,0.720992,0.625625,0.297933,0.217978,0.971775,0.090216,0.236583,0.971611,0,0.159589,0.984977,0.065961,0.173084,0.984907,0,0.350498,0.925311,0.14474,0.379703,0.925108,0,0.48559,0.850653,0.201474,0.526673,0.850068,0,0.551862,0.62529,0.55178,0.166631,0.971838,0.166631,0.121908,0.985026,0.121908,0.267668,0.925585,0.267668,0.371315,0.851029,0.371315,0.297983,0.625515,0.721067,0.090216,0.971775,0.217978,0.065961,0.984977,0.159589,0.14474,0.925311,0.350498,0.201475,0.850653,0.48559,-0.000075,0.62489,0.780712,0,0.971611,0.236583,0,0.984907,0.173084,0,0.925108,0.379703,0,0.850068,0.526673,-0.000075,0.62489,0.780712,-0.297933,0.625625,0.720992,-0.090216,0.971775,0.217978,0,0.971611,0.236583,-0.065961,0.984977,0.159589,0,0.984907,0.173084,-0.14474,0.925311,0.350498,0,0.925108,0.379703,-0.201474,0.850653,0.48559,0,0.850068,0.526673,-0.55178,0.62529,0.551862,-0.166631,0.971838,0.166631,-0.121908,0.985026,0.121908,-0.267668,0.925585,0.267668,-0.371315,0.851029,0.371315,-0.721067,0.625515,0.297983,-0.217978,0.971775,0.090216,-0.159589,0.984977,0.065961,-0.350498,0.925311,0.14474,-0.48559,0.850653,0.201475,-0.780712,0.62489,-0.000075,-0.236583,0.971611,0,-0.173084,0.984907,0,-0.379703,0.925108,0,-0.526673,0.850068,0,-0.780712,0.62489,-0.000075,-0.720992,0.625625,-0.297933,-0.217978,0.971775,-0.090216,-0.236583,0.971611,0,-0.159589,0.984977,-0.065961,-0.173084,0.984907,0,-0.350498,0.925311,-0.14474,-0.379703,0.925108,0,-0.48559,0.850653,-0.201474,-0.526673,0.850068,0,-0.551862,0.62529,-0.55178,-0.166631,0.971838,-0.166631,-0.121908,0.985026,-0.121908,-0.267668,0.925585,-0.267668,-0.371315,0.851029,-0.371315,-0.297983,0.625515,-0.721067,-0.090216,0.971775,-0.217978,-0.065961,0.984977,-0.159589,-0.14474,0.925311,-0.350498,-0.201475,0.850653,-0.48559,0.000075,0.62489,-0.780712,0,0.971611,-0.236583,0,0.984907,-0.173084,0,0.925108,-0.379703,0,0.850068,-0.526673,0.000075,0.62489,-0.780712,0.297933,0.625625,-0.720992,0.090216,0.971775,-0.217978,0,0.971611,-0.236583,0.065961,0.984977,-0.159589,0,0.984907,-0.173084,0.14474,0.925311,-0.350498,0,0.925108,-0.379703,0.201474,0.850653,-0.48559,0,0.850068,-0.526673,0.55178,0.62529,-0.551862,0.166631,0.971838,-0.166631,0.121908,0.985026,-0.121908,0.267668,0.925585,-0.267668,0.371315,0.851029,-0.371315,0.721067,0.625515,-0.297983,0.217978,0.971775,-0.090216,0.159589,0.984977,-0.065961,0.350498,0.925311,-0.14474,0.48559,0.850653,-0.201475,0.780712,0.62489,0.000075,0.236583,0.971611,0,0.173084,0.984907,0,0.379703,0.925108,0,0.526673,0.850068,0],
      "textureCoords" : [2,2,1.75,2,1.75,1.975,2,1.975,1.75,1.95,2,1.95,1.75,1.925,2,1.925,1.75,1.9,2,1.9,1.5,2,1.5,1.975,1.5,1.95,1.5,1.925,1.5,1.9,1.25,2,1.25,1.975,1.25,1.95,1.25,1.925,1.25,1.9,1,2,1,1.975,1,1.95,1,1.925,1,1.9,1,2,0.75,2,0.75,1.975,1,1.975,0.75,1.95,1,1.95,0.75,1.925,1,1.925,0.75,1.9,1,1.9,0.5,2,0.5,1.975,0.5,1.95,0.5,1.925,0.5,1.9,0.25,2,0.25,1.975,0.25,1.95,0.25,1.925,0.25,1.9,0,2,0,1.975,0,1.95,0,1.925,0,1.9,2,2,1.75,2,1.75,1.975,2,1.975,1.75,1.95,2,1.95,1.75,1.925,2,1.925,1.75,1.9,2,1.9,1.5,2,1.5,1.975,1.5,1.95,1.5,1.925,1.5,1.9,1.25,2,1.25,1.975,1.25,1.95,1.25,1.925,1.25,1.9,1,2,1,1.975,1,1.95,1,1.925,1,1.9,1,2,0.75,2,0.75,1.975,1,1.975,0.75,1.95,1,1.95,0.75,1.925,1,1.925,0.75,1.9,1,1.9,0.5,2,0.5,1.975,0.5,1.95,0.5,1.925,0.5,1.9,0.25,2,0.25,1.975,0.25,1.95,0.25,1.925,0.25,1.9,0,2,0,1.975,0,1.95,0,1.925,0,1.9,2,1.9,1.75,1.9,1.75,1.675,2,1.675,1.75,1.45,2,1.45,1.75,1.225,2,1.225,1.75,1,2,1,1.5,1.9,1.5,1.675,1.5,1.45,1.5,1.225,1.5,1,1.25,1.9,1.25,1.675,1.25,1.45,1.25,1.225,1.25,1,1,1.9,1,1.675,1,1.45,1,1.225,1,1,1,1.9,0.75,1.9,0.75,1.675,1,1.675,0.75,1.45,1,1.45,0.75,1.225,1,1.225,0.75,1,1,1,0.5,1.9,0.5,1.675,0.5,1.45,0.5,1.225,0.5,1,0.25,1.9,0.25,1.675,0.25,1.45,0.25,1.225,0.25,1,0,1.9,0,1.675,0,1.45,0,1.225,0,1,2,1.9,1.75,1.9,1.75,1.675,2,1.675,1.75,1.45,2,1.45,1.75,1.225,2,1.225,1.75,1,2,1,1.5,1.9,1.5,1.675,1.5,1.45,1.5,1.225,1.5,1,1.25,1.9,1.25,1.675,1.25,1.45,1.25,1.225,1.25,1,1,1.9,1,1.675,1,1.45,1,1.225,1,1,1,1.9,0.75,1.9,0.75,1.675,1,1.675,0.75,1.45,1,1.45,0.75,1.225,1,1.225,0.75,1,1,1,0.5,1.9,0.5,1.675,0.5,1.45,0.5,1.225,0.5,1,0.25,1.9,0.25,1.675,0.25,1.45,0.25,1.225,0.25,1,0,1.9,0,1.675,0,1.45,0,1.225,0,1,2,1,1.75,1,1.75,0.85,2,0.85,1.75,0.7,2,0.7,1.75,0.55,2,0.55,1.75,0.4,2,0.4,1.5,1,1.5,0.85,1.5,0.7,1.5,0.55,1.5,0.4,1.25,1,1.25,0.85,1.25,0.7,1.25,0.55,1.25,0.4,1,1,1,0.85,1,0.7,1,0.55,1,0.4,1,1,0.75,1,0.75,0.85,1,0.85,0.75,0.7,1,0.7,0.75,0.55,1,0.55,0.75,0.4,1,0.4,0.5,1,0.5,0.85,0.5,0.7,0.5,0.55,0.5,0.4,0.25,1,0.25,0.85,0.25,0.7,0.25,0.55,0.25,0.4,0,1,0,0.85,0,0.7,0,0.55,0,0.4,2,1,1.75,1,1.75,0.85,2,0.85,1.75,0.7,2,0.7,1.75,0.55,2,0.55,1.75,0.4,2,0.4,1.5,1,1.5,0.85,1.5,0.7,1.5,0.55,1.5,0.4,1.25,1,1.25,0.85,1.25,0.7,1.25,0.55,1.25,0.4,1,1,1,0.85,1,0.7,1,0.55,1,0.4,1,1,0.75,1,0.75,0.85,1,0.85,0.75,0.7,1,0.7,0.75,0.55,1,0.55,0.75,0.4,1,0.4,0.5,1,0.5,0.85,0.5,0.7,0.5,0.55,0.5,0.4,0.25,1,0.25,0.85,0.25,0.7,0.25,0.55,0.25,0.4,0,1,0,0.85,0,0.7,0,0.55,0,0.4,2,0.4,1.75,0.4,1.75,0.3,2,0.3,1.75,0.2,2,0.2,1.75,0.1,2,0.1,1.75,0,1.5,0.4,1.5,0.3,1.5,0.2,1.5,0.1,1.5,0,1.25,0.4,1.25,0.3,1.25,0.2,1.25,0.1,1.25,0,1,0.4,1,0.3,1,0.2,1,0.1,1,0,1,0.4,0.75,0.4,0.75,0.3,1,0.3,0.75,0.2,1,0.2,0.75,0.1,1,0.1,0.75,0,0.5,0.4,0.5,0.3,0.5,0.2,0.5,0.1,0.5,0,0.25,0.4,0.25,0.3,0.25,0.2,0.25,0.1,0.25,0,0,0.4,0,0.3,0,0.2,0,0.1,0,0,2,0.4,1.75,0.4,1.75,0.3,2,0.3,1.75,0.2,2,0.2,1.75,0.1,2,0.1,1.75,0,1.5,0.4,1.5,0.3,1.5,0.2,1.5,0.1,1.5,0,1.25,0.4,1.25,0.3,1.25,0.2,1.25,0.1,1.25,0,1,0.4,1,0.3,1,0.2,1,0.1,1,0,1,0.4,0.75,0.4,0.75,0.3,1,0.3,0.75,0.2,1,0.2,0.75,0.1,1,0.1,0.75,0,0.5,0.4,0.5,0.3,0.5,0.2,0.5,0.1,0.5,0,0.25,0.4,0.25,0.3,0.25,0.2,0.25,0.1,0.25,0,0,0.4,0,0.3,0,0.2,0,0.1,0,0,1,1,0.875,1,0.875,0.875,1,0.875,0.875,0.75,1,0.75,0.875,0.625,1,0.625,0.875,0.5,1,0.5,0.75,1,0.75,0.875,0.75,0.75,0.75,0.625,0.75,0.5,0.625,1,0.625,0.875,0.625,0.75,0.625,0.625,0.625,0.5,0.5,1,0.5,0.875,0.5,0.75,0.5,0.625,0.5,0.5,0.5,1,0.375,1,0.375,0.875,0.5,0.875,0.375,0.75,0.5,0.75,0.375,0.625,0.5,0.625,0.375,0.5,0.5,0.5,0.25,1,0.25,0.875,0.25,0.75,0.25,0.625,0.25,0.5,0.125,1,0.125,0.875,0.125,0.75,0.125,0.625,0.125,0.5,0,1,0,0.875,0,0.75,0,0.625,0,0.5,1,0.5,0.875,0.5,0.875,0.375,1,0.375,0.875,0.25,1,0.25,0.875,0.125,1,0.125,0.875,0,1,0,0.75,0.5,0.75,0.375,0.75,0.25,0.75,0.125,0.75,0,0.625,0.5,0.625,0.375,0.625,0.25,0.625,0.125,0.625,0,0.5,0.5,0.5,0.375,0.5,0.25,0.5,0.125,0.5,0,0.5,0.5,0.375,0.5,0.375,0.375,0.5,0.375,0.375,0.25,0.5,0.25,0.375,0.125,0.5,0.125,0.375,0,0.5,0,0.25,0.5,0.25,0.375,0.25,0.25,0.25,0.125,0.25,0,0.125,0.5,0.125,0.375,0.125,0.25,0.125,0.125,0.125,0,0,0.5,0,0.375,0,0.25,0,0.125,0,0,0.5,0,0.625,0,0.625,0.225,0.5,0.225,0.625,0.45,0.5,0.45,0.625,0.675,0.5,0.675,0.625,0.9,0.5,0.9,0.75,0,0.75,0.225,0.75,0.45,0.75,0.675,0.75,0.9,0.875,0,0.875,0.225,0.875,0.45,0.875,0.675,0.875,0.9,1,0,1,0.225,1,0.45,1,0.675,1,0.9,0,0,0.125,0,0.125,0.225,0,0.225,0.125,0.45,0,0.45,0.125,0.675,0,0.675,0.125,0.9,0,0.9,0.25,0,0.25,0.225,0.25,0.45,0.25,0.675,0.25,0.9,0.375,0,0.375,0.225,0.375,0.45,0.375,0.675,0.375,0.9,0.5,0,0.5,0.225,0.5,0.45,0.5,0.675,0.5,0.9,0.5,0.9,0.625,0.9,0.625,0.925,0.5,0.925,0.625,0.95,0.5,0.95,0.625,0.975,0.5,0.975,0.625,1,0.5,1,0.75,0.9,0.75,0.925,0.75,0.95,0.75,0.975,0.75,1,0.875,0.9,0.875,0.925,0.875,0.95,0.875,0.975,0.875,1,1,0.9,1,0.925,1,0.95,1,0.975,1,1,0,0.9,0.125,0.9,0.125,0.925,0,0.925,0.125,0.95,0,0.95,0.125,0.975,0,0.975,0.125,1,0,1,0.25,0.9,0.25,0.925,0.25,0.95,0.25,0.975,0.25,1,0.375,0.9,0.375,0.925,0.375,0.95,0.375,0.975,0.375,1,0.5,0.9,0.5,0.925,0.5,0.95,0.5,0.975,0.5,1,0.875,0.75,1,0.75,1,1,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,0.75,0.875,1,0.75,0.5,0.75,0.25,0.75,0,0.625,0.75,0.75,1,0.625,0.5,0.625,0.25,0.625,0,0.5,0.75,0.625,1,0.5,0.5,0.5,0.25,0.5,0,0.375,0.75,0.5,0.75,0.5,1,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,0.75,0.375,1,0.25,0.5,0.25,0.25,0.25,0,0.125,0.75,0.25,1,0.125,0.5,0.125,0.25,0.125,0,0,0.75,0.125,1,0,0.5,0,0.25,0,0,0.875,0.75,1,0.75,1,1,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,0.75,0.875,1,0.75,0.5,0.75,0.25,0.75,0,0.625,0.75,0.75,1,0.625,0.5,0.625,0.25,0.625,0,0.5,0.75,0.625,1,0.5,0.5,0.5,0.25,0.5,0,0.375,0.75,0.5,0.75,0.5,1,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,0.75,0.375,1,0.25,0.5,0.25,0.25,0.25,0,0.125,0.75,0.25,1,0.125,0.5,0.125,0.25,0.125,0,0,0.75,0.125,1,0,0.5,0,0.25,0,0,1,1,0.875,1,0.875,0.75,1,0.75,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,1,0.75,0.75,0.75,0.5,0.75,0.25,0.75,0,0.625,1,0.625,0.75,0.625,0.5,0.625,0.25,0.625,0,0.5,1,0.5,0.75,0.5,0.5,0.5,0.25,0.5,0,0.5,1,0.375,1,0.375,0.75,0.5,0.75,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,1,0.25,0.75,0.25,0.5,0.25,0.25,0.25,0,0.125,1,0.125,0.75,0.125,0.5,0.125,0.25,0.125,0,0,1,0,0.75,0,0.5,0,0.25,0,0,1,1,0.875,1,0.875,0.75,1,0.75,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,1,0.75,0.75,0.75,0.5,0.75,0.25,0.75,0,0.625,1,0.625,0.75,0.625,0.5,0.625,0.25,0.625,0,0.5,1,0.5,0.75,0.5,0.5,0.5,0.25,0.5,0,0.5,1,0.375,1,0.375,0.75,0.5,0.75,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,1,0.25,0.75,0.25,0.5,0.25,0.25,0.25,0,0.125,1,0.125,0.75,0.125,0.5,0.125,0.25,0.125,0,0,1,0,0.75,0,0.5,0,0.25,0,0],
      "indices" : [0,1,2,2,3,0,3,2,4,4,5,3,5,4,6,6,7,5,7,6,8,8,9,7,1,10,11,11,2,1,2,11,12,12,4,2,4,12,13,13,6,4,6,13,14,14,8,6,10,15,16,16,11,10,11,16,17,17,12,11,12,17,18,18,13,12,13,18,19,19,14,13,15,20,21,21,16,15,16,21,22,22,17,16,17,22,23,23,18,17,18,23,24,24,19,18,25,26,27,27,28,25,28,27,29,29,30,28,30,29,31,31,32,30,32,31,33,33,34,32,26,35,36,36,27,26,27,36,37,37,29,27,29,37,38,38,31,29,31,38,39,39,33,31,35,40,41,41,36,35,36,41,42,42,37,36,37,42,43,43,38,37,38,43,44,44,39,38,40,45,46,46,41,40,41,46,47,47,42,41,42,47,48,48,43,42,43,48,49,49,44,43,50,51,52,52,53,50,53,52,54,54,55,53,55,54,56,56,57,55,57,56,58,58,59,57,51,60,61,61,52,51,52,61,62,62,54,52,54,62,63,63,56,54,56,63,64,64,58,56,60,65,66,66,61,60,61,66,67,67,62,61,62,67,68,68,63,62,63,68,69,69,64,63,65,70,71,71,66,65,66,71,72,72,67,66,67,72,73,73,68,67,68,73,74,74,69,68,75,76,77,77,78,75,78,77,79,79,80,78,80,79,81,81,82,80,82,81,83,83,84,82,76,85,86,86,77,76,77,86,87,87,79,77,79,87,88,88,81,79,81,88,89,89,83,81,85,90,91,91,86,85,86,91,92,92,87,86,87,92,93,93,88,87,88,93,94,94,89,88,90,95,96,96,91,90,91,96,97,97,92,91,92,97,98,98,93,92,93,98,99,99,94,93,100,101,102,102,103,100,103,102,104,104,105,103,105,104,106,106,107,105,107,106,108,108,109,107,101,110,111,111,102,101,102,111,112,112,104,102,104,112,113,113,106,104,106,113,114,114,108,106,110,115,116,116,111,110,111,116,117,117,112,111,112,117,118,118,113,112,113,118,119,119,114,113,115,120,121,121,116,115,116,121,122,122,117,116,117,122,123,123,118,117,118,123,124,124,119,118,125,126,127,127,128,125,128,127,129,129,130,128,130,129,131,131,132,130,132,131,133,133,134,132,126,135,136,136,127,126,127,136,137,137,129,127,129,137,138,138,131,129,131,138,139,139,133,131,135,140,141,141,136,135,136,141,142,142,137,136,137,142,143,143,138,137,138,143,144,144,139,138,140,145,146,146,141,140,141,146,147,147,142,141,142,147,148,148,143,142,143,148,149,149,144,143,150,151,152,152,153,150,153,152,154,154,155,153,155,154,156,156,157,155,157,156,158,158,159,157,151,160,161,161,152,151,152,161,162,162,154,152,154,162,163,163,156,154,156,163,164,164,158,156,160,165,166,166,161,160,161,166,167,167,162,161,162,167,168,168,163,162,163,168,169,169,164,163,165,170,171,171,166,165,166,171,172,172,167,166,167,172,173,173,168,167,168,173,174,174,169,168,175,176,177,177,178,175,178,177,179,179,180,178,180,179,181,181,182,180,182,181,183,183,184,182,176,185,186,186,177,176,177,186,187,187,179,177,179,187,188,188,181,179,181,188,189,189,183,181,185,190,191,191,186,185,186,191,192,192,187,186,187,192,193,193,188,187,188,193,194,194,189,188,190,195,196,196,191,190,191,196,197,197,192,191,192,197,198,198,193,192,193,198,199,199,194,193,200,201,202,202,203,200,203,202,204,204,205,203,205,204,206,206,207,205,207,206,208,208,209,207,201,210,211,211,202,201,202,211,212,212,204,202,204,212,213,213,206,204,206,213,214,214,208,206,210,215,216,216,211,210,211,216,217,217,212,211,212,217,218,218,213,212,213,218,219,219,214,213,215,220,221,221,216,215,216,221,222,222,217,216,217,222,223,223,218,217,218,223,224,224,219,218,225,226,227,227,228,225,228,227,229,229,230,228,230,229,231,231,232,230,232,231,233,233,234,232,226,235,236,236,227,226,227,236,237,237,229,227,229,237,238,238,231,229,231,238,239,239,233,231,235,240,241,241,236,235,236,241,242,242,237,236,237,242,243,243,238,237,238,243,244,244,239,238,240,245,246,246,241,240,241,246,247,247,242,241,242,247,248,248,243,242,243,248,249,249,244,243,250,251,252,252,253,250,253,252,254,254,255,253,255,254,256,256,257,255,257,256,258,258,259,257,251,260,261,261,252,251,252,261,262,262,254,252,254,262,263,263,256,254,256,263,264,264,258,256,260,265,266,266,261,260,261,266,267,267,262,261,262,267,268,268,263,262,263,268,269,269,264,263,265,270,271,271,266,265,266,271,272,272,267,266,267,272,273,273,268,267,268,273,274,274,269,268,275,276,277,277,278,275,278,277,279,279,280,278,280,279,281,281,282,280,282,281,283,283,284,282,276,285,286,286,277,276,277,286,287,287,279,277,279,287,288,288,281,279,281,288,289,289,283,281,285,290,291,291,286,285,286,291,292,292,287,286,287,292,293,293,288,287,288,293,294,294,289,288,290,295,296,296,291,290,291,296,297,297,292,291,292,297,298,298,293,292,293,298,299,299,294,293,300,301,302,302,303,300,303,302,304,304,305,303,305,304,306,306,307,305,307,306,308,301,309,310,310,302,301,302,310,311,311,304,302,304,311,312,312,306,304,306,312,313,309,314,315,315,310,309,310,315,316,316,311,310,311,316,317,317,312,311,312,317,318,314,319,320,320,315,314,315,320,321,321,316,315,316,321,322,322,317,316,317,322,323,324,325,326,326,327,324,327,326,328,328,329,327,329,328,330,330,331,329,331,330,332,325,333,334,334,326,325,326,334,335,335,328,326,328,335,336,336,330,328,330,336,337,333,338,339,339,334,333,334,339,340,340,335,334,335,340,341,341,336,335,336,341,342,338,343,344,344,339,338,339,344,345,345,340,339,340,345,346,346,341,340,341,346,347,348,349,350,350,351,348,351,350,352,352,353,351,353,352,354,354,355,353,355,354,356,349,357,358,358,350,349,350,358,359,359,352,350,352,359,360,360,354,352,354,360,361,357,362,363,363,358,357,358,363,364,364,359,358,359,364,365,365,360,359,360,365,366,362,367,368,368,363,362,363,368,369,369,364,363,364,369,370,370,365,364,365,370,371,372,373,374,374,375,372,375,374,376,376,377,375,377,376,378,378,379,377,379,378,380,373,381,382,382,374,373,374,382,383,383,376,374,376,383,384,384,378,376,378,384,385,381,386,387,387,382,381,382,387,388,388,383,382,383,388,389,389,384,383,384,389,390,386,391,392,392,387,386,387,392,393,393,388,387,388,393,394,394,389,388,389,394,395,396,397,398,398,399,396,399,398,400,400,401,399,401,400,402,402,403,401,403,402,404,404,405,403,397,406,407,407,398,397,398,407,408,408,400,398,400,408,409,409,402,400,402,409,410,410,404,402,406,411,412,412,407,406,407,412,413,413,408,407,408,413,414,414,409,408,409,414,415,415,410,409,411,416,417,417,412,411,412,417,418,418,413,412,413,418,419,419,414,413,414,419,420,420,415,414,421,422,423,423,424,421,424,423,425,425,426,424,426,425,427,427,428,426,428,427,429,429,430,428,422,431,432,432,423,422,423,432,433,433,425,423,425,433,434,434,427,425,427,434,435,435,429,427,431,436,437,437,432,431,432,437,438,438,433,432,433,438,439,439,434,433,434,439,440,440,435,434,436,441,442,442,437,436,437,442,443,443,438,437,438,443,444,444,439,438,439,444,445,445,440,439,446,447,448,448,449,446,449,448,450,450,451,449,451,450,452,452,453,451,453,452,454,454,455,453,447,456,457,457,448,447,448,457,458,458,450,448,450,458,459,459,452,450,452,459,460,460,454,452,456,461,462,462,457,456,457,462,463,463,458,457,458,463,464,464,459,458,459,464,465,465,460,459,461,466,467,467,462,461,462,467,468,468,463,462,463,468,469,469,464,463,464,469,470,470,465,464,471,472,473,473,474,471,474,473,475,475,476,474,476,475,477,477,478,476,478,477,479,479,480,478,472,481,482,482,473,472,473,482,483,483,475,473,475,483,484,484,477,475,477,484,485,485,479,477,481,486,487,487,482,481,482,487,488,488,483,482,483,488,489,489,484,483,484,489,490,490,485,484,486,491,492,492,487,486,487,492,493,493,488,487,488,493,494,494,489,488,489,494,495,495,490,489,496,497,498,498,499,496,499,498,500,500,501,499,501,500,502,502,503,501,503,502,504,504,505,503,497,506,507,507,498,497,498,507,508,508,500,498,500,508,509,509,502,500,502,509,510,510,504,502,506,511,512,512,507,506,507,512,513,513,508,507,508,513,514,514,509,508,509,514,515,515,510,509,511,516,517,517,512,511,512,517,518,518,513,512,513,518,519,519,514,513,514,519,520,520,515,514,521,522,523,523,524,521,524,523,525,525,526,524,526,525,527,527,528,526,528,527,529,529,530,528,522,531,532,532,523,522,523,532,533,533,525,523,525,533,534,534,527,525,527,534,535,535,529,527,531,536,537,537,532,531,532,537,538,538,533,532,533,538,539,539,534,533,534,539,540,540,535,534,536,541,542,542,537,536,537,542,543,543,538,537,538,543,544,544,539,538,539,544,545,545,540,539,546,547,548,548,549,546,549,548,550,550,551,549,551,550,552,552,553,551,553,552,554,554,555,553,547,556,557,557,548,547,548,557,558,558,550,548,550,558,559,559,552,550,552,559,560,560,554,552,556,561,562,562,557,556,557,562,563,563,558,557,558,563,564,564,559,558,559,564,565,565,560,559,561,566,567,567,562,561,562,567,568,568,563,562,563,568,569,569,564,563,564,569,570,570,565,564,571,572,573,573,574,571,574,573,575,575,576,574,576,575,577,577,578,576,578,577,579,579,580,578,572,581,582,582,573,572,573,582,583,583,575,573,575,583,584,584,577,575,577,584,585,585,579,577,581,586,587,587,582,581,582,587,588,588,583,582,583,588,589,589,584,583,584,589,590,590,585,584,586,591,592,592,587,586,587,592,593,593,588,587,588,593,594,594,589,588,589,594,595,595,590,589,596,597,598,597,596,599,599,600,597,600,599,601,601,602,600,602,601,603,603,604,602,605,596,606,596,605,607,607,599,596,599,607,608,608,601,599,601,608,609,609,603,601,610,605,611,605,610,612,612,607,605,607,612,613,613,608,607,608,613,614,614,609,608,615,610,616,610,615,617,617,612,610,612,617,618,618,613,612,613,618,619,619,614,613,620,621,622,621,620,623,623,624,621,624,623,625,625,626,624,626,625,627,627,628,626,629,620,630,620,629,631,631,623,620,623,631,632,632,625,623,625,632,633,633,627,625,634,629,635,629,634,636,636,631,629,631,636,637,637,632,631,632,637,638,638,633,632,639,634,640,634,639,641,641,636,634,636,641,642,642,637,636,637,642,643,643,638,637,644,645,646,645,644,647,647,648,645,648,647,649,649,650,648,650,649,651,651,652,650,653,644,654,644,653,655,655,647,644,647,655,656,656,649,647,649,656,657,657,651,649,658,653,659,653,658,660,660,655,653,655,660,661,661,656,655,656,661,662,662,657,656,663,658,664,658,663,665,665,660,658,660,665,666,666,661,660,661,666,667,667,662,661,668,669,670,669,668,671,671,672,669,672,671,673,673,674,672,674,673,675,675,676,674,677,668,678,668,677,679,679,671,668,671,679,680,680,673,671,673,680,681,681,675,673,682,677,683,677,682,684,684,679,677,679,684,685,685,680,679,680,685,686,686,681,680,687,682,688,682,687,689,689,684,682,684,689,690,690,685,684,685,690,691,691,686,685,692,693,694,694,695,692,695,694,696,696,697,695,697,696,698,698,699,697,699,698,700,700,701,699,693,702,703,703,694,693,694,703,704,704,696,694,696,704,705,705,698,696,698,705,706,706,700,698,702,707,708,708,703,702,703,708,709,709,704,703,704,709,710,710,705,704,705,710,711,711,706,705,707,712,713,713,708,707,708,713,714,714,709,708,709,714,715,715,710,709,710,715,716,716,711,710,717,718,719,719,720,717,720,719,721,721,722,720,722,721,723,723,724,722,724,723,725,725,726,724,718,727,728,728,719,718,719,728,729,729,721,719,721,729,730,730,723,721,723,730,731,731,725,723,727,732,733,733,728,727,728,733,734,734,729,728,729,734,735,735,730,729,730,735,736,736,731,730,732,737,738,738,733,732,733,738,739,739,734,733,734,739,740,740,735,734,735,740,741,741,736,735,742,743,744,744,745,742,745,744,746,746,747,745,747,746,748,748,749,747,749,748,750,750,751,749,743,752,753,753,744,743,744,753,754,754,746,744,746,754,755,755,748,746,748,755,756,756,750,748,752,757,758,758,753,752,753,758,759,759,754,753,754,759,760,760,755,754,755,760,761,761,756,755,757,762,763,763,758,757,758,763,764,764,759,758,759,764,765,765,760,759,760,765,766,766,761,760,767,768,769,769,770,767,770,769,771,771,772,770,772,771,773,773,774,772,774,773,775,775,776,774,768,777,778,778,769,768,769,778,779,779,771,769,771,779,780,780,773,771,773,780,781,781,775,773,777,782,783,783,778,777,778,783,784,784,779,778,779,784,785,785,780,779,780,785,786,786,781,780,782,787,788,788,783,782,783,788,789,789,784,783,784,789,790,790,785,784,785,790,791,791,786,785]
  };

  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      this.size = options.size || 1;
      $super(options);
    },

    init: function(verts, colors, texes, norms, indices) {
      var i, scaleFactor, max = null;

      for (i = 0; i < teapot.vertices.length; i++)
        if (max == null || teapot.vertices[i] > max)
          max = teapot.vertices[i];

      scaleFactor = this.size / max;

      for (i = 0; i < teapot.vertices.length; i++)
        verts.push(teapot.vertices[i] * scaleFactor);

      for (i = 0; i < teapot.normals.length; i++)
        norms.push(teapot.normals[i]);

      for (i = 0; i < teapot.textureCoords.length; i++)
        texes.push(teapot.textureCoords[i]);

      for (i = 0; i < teapot.indices.length; i++)
        indices.push(teapot.indices[i]);
    }
  });
})();

