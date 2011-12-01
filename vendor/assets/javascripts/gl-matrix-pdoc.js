/**
 * vec3
 * 3 Dimensional Vector
 **/
;

/**
 * vec3.create([vec]) -> vec3
 * - vec (vec3): optional vec3 containing values to initialize with
 *
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array containing at least 3 numeric elements can serve as a vec3
 *
 * Returns:
 * New vec3
 **/
;

/**
 * vec3.set(vec, dest) -> vec3
 * - vec (vec3) : vec3 containing values to copy
 * - dest (vec3) : vec3 receiving copied values
 *
 * Copies the values of one vec3 to another
 *
 * Returns:
 * dest
 **/
;

/**
 * vec3.add(vec, vec2[, dest]) -> vec3
 * - vec (vec3) : first operand
 * - vec2 (vec3) : second operand
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Performs a vector addition
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.subtract(vec, vec2[, dest]) -> vec3
 * - vec (vec3) : first operand
 * - vec2 (vec3) : second operand
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Performs a vector subtraction
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.negate(vec[, dest]) -> vec3
 * - vec (vec3) : vec3 to negate
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Negates the components of a vec3
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.scale(vec, val[, dest]) -> vec3
 * - vec (vec3) : vec3 to scale
 * - val (Number) : numeric value to scale by
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Multiplies the components of a vec3 by a scalar value
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.normalize(vec[, dest]) -> vec3
 * - vec (vec3) : vec3 to normalize
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.cross(vec, vec2[, dest]) -> vec3
 * - vec (vec3) : first operand
 * - vec2 (vec3) : second operand
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 * 
 * Generates the cross product of two vec3s
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.length(vec) -> Number
 * - vec (vec3) : vec3 to calculate length of
 *
 * Caclulates the length of a vec3
 *
 * Returns:
 * Length of vec
 **/
;

/**
 * vec3.dot(vec, vec2) -> Number
 * - vec (vec3) : first operand
 * - vec2 (vec3) : second operand
 *
 * Caclulates the dot product of two vec3s
 *
 * Returns:
 * Dot product of vec and vec2
 **/
;

/**
 * vec3.direction(vec, vec2[, dest]) -> vec3
 * - vec (vec3) : origin vec3
 * - vec2 (vec3) : vec3 to point to
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Generates a unit vector pointing from one vector to another
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.lerp(vec, vec2, lerp[, dest]) -> vec3
 * - vec (vec3) : first vector
 * - vec2 (vec3) : second vector
 * - lerp (Number) : interpolation amount between the two inputs
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Performs a linear interpolation between two vec3
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * vec3.str(vec) -> String
 * - vec (vec3) : vec3 to represent as a string
 *
 * Returns a string representation of a vector
 *
 * Returns:
 * string representation of vec
 **/
;

/**
 * mat3
 * 3x3 Matrix
 **/
;

/**
 * mat3.create([mat]) -> mat3
 * - mat (mat3) : optional mat3 containing values to initialize with
 *
 * Creates a new instance of a mat3 using the default array type
 * Any javascript array containing at least 9 numeric elements can serve as a mat3
 *
 * Returns:
 * New mat3
 **/
;

/**
 * mat3.set(mat, dest) -> mat3
 * - mat (mat3) : mat3 containing values to copy
 * - dest (mat3) : mat3 receiving copied values
 *
 * Copies the values of one mat3 to another
 *
 * Returns:
 * dest
 **/
;

/**
 * mat3.identity(dest) -> mat3
 * - dest (mat3) : mat3 to set
 *
 * Sets a mat3 to an identity matrix
 *
 * Returns:
 * dest
 **/
;

/**
 * mat3.transpose(mat[, dest]) -> mat3
 * - mat (mat3) : mat3 to transpose
 * - dest (mat3) : optional mat3 receiving operation result. If not specified, result is written to +mat+.
 *
 * Transposes a mat3 (flips the values over the diagonal)
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat3.toMat4(mat[, dest]) -> mat4
 * - mat (mat3) : mat3 containing values to copy
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to a new mat4.
 *
 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * mat3.str(mat) -> String
 * - mat (mat3) : mat3 to represent as a string
 *
 * Returns a string representation of a mat3
 *
 * Returns:
 * string representation of mat
 **/
;

/**
 * mat4
 * 4x4 Matrix
 **/
;

/**
 * mat4.create([mat]) -> mat4
 * - mat (mat4) : optional mat4 containing values to initialize with
 *
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array containing at least 16 numeric elements can serve as a mat4
 *
 * Returns:
 * New mat4
 **/
;

/**
 * mat4.set(mat, dest) -> mat4
 * - mat (mat4) : mat4 containing values to copy
 * - dest (mat4) : mat4 receiving copied values
 *
 * Copies the values of one mat4 to another
 *
 * Returns:
 * dest
 **/
;

/**
 * mat4.identity(dest) -> mat4
 * - dest (mat4) : mat4 to set
 *
 * Sets a mat4 to an identity matrix
 *
 * Returns:
 * dest
 **/
;

/**
 * mat4.transpose(mat[, dest]) -> mat4
 * - mat (mat4) : mat4 to transpose
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * Returns:
 * dest is specified, mat otherwise
 **/
;

/**
 * mat4.determinant(mat) -> mat4
 * - mat (mat4) : mat4 to calculate determinant of
 *
 * Calculates the determinant of a mat4
 *
 * Returns:
 * determinant of mat
 **/
;

/**
 * mat4.inverse(mat[, dest]) -> mat4
 * - mat (mat4) : mat4 to calculate inverse of
 * - dest (mat4) : optional mat4 receiving inverse matrix. If not specified, result is written to +mat+.
 *
 * Calculates the inverse matrix of a mat4
 *
 * Returns:
 * dest is specified, mat otherwise
 **/
;

/**
 * mat4.toRotationMat(mat[, dest]) -> mat4
 * - mat (mat4) : mat4 containing values to copy
 * - dest (mat4) : optional mat4 receiving copied values. If not specified, result is written to +mat+.
 *
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * Returns:
 * dest is specified, a new mat4 otherwise
 **/
;

/**
 * mat4.toMat3(mat[, dest]) -> mat3
 * - mat (mat4) : mat4 containing values to copy
 * - dest (mat3) : optional mat3 receiving copied values. If not specified, a new mat3 is created.
 *
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 **/
;

/**
 * mat4.toInverseMat3(mat[, dest]) -> mat3
 * - mat (mat4) : mat4 containing values to invert and copy
 * - dest (mat3) : optional mat3 receiving values
 *
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Returns:
 * dest is specified, a new mat3 otherwise
 **/
;

/**
 * mat4.multiply(mat, mat2[, dest]) -> mat4
 * - mat (mat4) : first operand
 * - mat2 (mat4) : second operand
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Performs a matrix multiplication
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.multiplyVec3(mat, vec[, dest]) -> vec3
 * - mat (mat4) : mat4 to transform the vector with
 * - vec (vec3) : vec3 to transform
 * - dest (vec3) : optional vec3 receiving operation result. If not specified, result is written to +vec+.
 *
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * Returns:
 * dest if specified, vec3 otherwise
 **/
;

/**
 * mat4.multiplyVec4(mat, vec[, dest]) -> vec4
 * - mat (mat4) : mat4 to transform the vector with
 * - vec (vec4) : vec4 to transform
 * - dest (vec4) : optional vec4 receiving operation result. If not specified, result is written to +vec+.
 *
 * Transforms a vec4 with the given matrix
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * mat4.translate(mat, vec[, dest]) -> mat4
 * - mat (mat4) : mat4 to translate
 * - vec (vec3) : vec3 specifying the translation
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Translates a matrix by the given vector
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.scale(mat, vec[, dest]) -> mat4
 * - mat (mat4) : mat4 to scale
 * - vec (vec3) : vec3 specifying the scale for each axis
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Scales a matrix by the given vector
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.rotate(mat, angle, axis[, dest]) -> mat4
 * - mat (mat4) : mat4 to rotate
 * - angle (Number) : angle (in radians) to rotate
 * - axis (vec3) : vec3 representing the axis to rotate around
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.rotateX(mat, angle[, dest]) -> mat4
 * - mat (mat4) : mat4 to rotate
 * - angle (Number) : angle (in radians) to rotate
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Rotates a matrix by the given angle around the X axis
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.rotateY(mat, angle[, dest]) -> mat4
 * - mat (mat4) : mat4 to rotate
 * - angle (Number) : angle (in radians) to rotate
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Rotates a matrix by the given angle around the Y axis
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.rotateZ(mat, angle[, dest]) -> mat4
 * - mat (mat4) : mat4 to rotate
 * - angle (Number) : angle (in radians) to rotate
 * - dest (mat4) : optional mat4 receiving operation result. If not specified, result is written to +mat+.
 *
 * Rotates a matrix by the given angle around the Z axis
 *
 * Returns:
 * dest if specified, mat otherwise
 **/
;

/**
 * mat4.frustum(left, right, bottom, top, near, far[, dest]) -> mat4
 * - left (Number) : scalar, left bounds of the frustum
 * - right (Number) : scalar, right bounds of the frustum
 * - bottom (Number) : scalar, bottom bounds of the frustum
 * - top (Number) : scalar, top bounds of the frustum
 * - near (Number) : scalar, near bounds of the frustum
 * - far (Number) : scalar, far bounds of the frustum
 * - dest (mat4) : optional mat4 frustum matrix will be written into. If not specified, a new mat4 is created.
 *
 * Generates a frustum matrix with the given bounds
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * mat4.perspective(fovy, aspect, near, far[, dest]) -> mat4
 * - fovy (Number) : scalar, vertical field of view
 * - aspect (Number) : scalar, aspect ratio. Typically viewport width/height
 * - near (Number) : scalar, near bounds of the frustum
 * - far (Number) : scalar, far bounds of the frustum
 * - dest (mat4) : optional mat4 the frustum matrix will be written into. If not specified, a new mat4 is created.
 *
 * Generates a perspective projection matrix with the given bounds
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * mat4.ortho(left, right, bottom, top, near, far[, dest]) -> mat4
 * - left (Number) : scalar, left bounds of the frustum
 * - right (Number) : scalar, right bounds of the frustum
 * - bottom (Number) : scalar, bottom bounds of the frustum
 * - top (Number) : scalar, top bounds of the frustum
 * - near (Number) : scalar, near bounds of the frustum
 * - far (Number) : scalar, far bounds of the frustum
 * - dest (mat4) : optional mat4 the frustum matrix will be written into. If not specified, a new mat4 is created.
 *
 * Generates a orthogonal projection matrix with the given bounds
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * mat4.lookAt(eye, center, up[, dest]) -> mat4
 * - eye (vec3) : position of the viewer
 * - center (vec3) : the point the viewer is looking at
 * - up (vec3) : vec3 pointing "up"
 * - dest (mat4) : optional mat4 the frustum matrix will be written into. If not specified, a new mat4 is created.
 *
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * mat4.str(mat) -> String
 * - mat (mat4) : mat4 to represent as a string
 *
 * Returns a string representation of a mat4
 *
 * Returns:
 * string representation of mat
 **/
;

/**
 * quat4
 * Quaternions 
 **/
;

/**
 * quat4.create([quat]) -> quat4
 * - quat (quat4) : optional quat4 containing values to initialize with
 *
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * Returns:
 * New quat4
 **/
;

/**
 * quat4.set(quat, dest) -> quat4
 * - quat (quat4) : quat4 containing values to copy
 * - dest (quat4) : quat4 receiving copied values
 *
 * Copies the values of one quat4 to another
 *
 * Returns:
 * dest
 **/
;

/**
 * quat4.calculateW(quat[, dest]) -> quat4
 * - quat (quat4) : quat4 to calculate W component of
 * - dest (quat4) : optional quat4 receiving calculated values. If not specified, result is written to quat.
 *
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length. 
 * Any existing W component will be ignored. 
 *
 * Returns:
 * dest if specified, quat otherwise
 **/
;

/**
 * quat4.inverse(quat[, dest]) -> quat4
 * - quat (quat4) : quat4 to calculate inverse of
 * - dest (quat4) : optional quat4 receiving calculated values. If not specified, result is written to quat.
 *
 * Calculates the inverse of a quat4
 *
 * Returns:
 * dest if specified, quat otherwise
 **/
;

/**
 * quat4.length(quat) -> quat4
 * - quat (quat4) : quat4 to calculate length of
 *
 * Calculates the length of a quat4
 *
 * Returns:
 * Length of quat
 **/
;

/**
 * quat4.normalize(quat[, dest]) -> quat4
 * - quat (quat4) : quat4 to normalize
 * - dest (quat4) : optional quat4 receiving calculated values. If not specified, result is written to quat.
 *
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * Returns:
 * dest if specified, quat otherwise
 **/
;

/**
 * quat4.multiply(quat, quat2[, dest]) -> quat4
 * - quat (quat4) : first operand
 * - quat2 (quat4) : second operand
 * - dest (quat4) : optional quat4 receiving calculated values. If not specified, result is written to quat.
 *
 * Performs a quaternion multiplication
 *
 * Returns:
 * dest if specified, quat otherwise
 **/
;

/**
 * quat4.multiplyVec3(quat, vec[, dest]) -> vec3
 * - quat (quat4) : quat4 to transform the vector with
 * - vec (vec3) : vec3 to transform
 * - dest (vec3) : optional vec3 receiving calculated values. If not specified, result is written to +vec+.
 *
 * Transforms a vec3 with the given quaternion
 *
 * Returns:
 * dest if specified, vec otherwise
 **/
;

/**
 * quat4.toMat3(quat[, dest]) -> mat3
 * - quat (quat4) : quat4 to create matrix from
 * - dest (mat3) : optional mat3 receiving operation result. If not specified, a new mat3 is created.
 *
 * Calculates a 3x3 matrix from the given quat4
 *
 * Returns:
 * dest if specified, a new mat3 otherwise
 **/
;

/**
 * quat4.toMat4(quat[, dest]) -> mat4
 * - quat (quat4) : quat4 to create matrix from
 * - dest (mat4) : optional mat4 receiving calculated values. If not specified, a new mat4 is created.
 *
 * Calculates a 4x4 matrix from the given quat4
 *
 * Returns:
 * dest if specified, a new mat4 otherwise
 **/
;

/**
 * quat4.slerp(quat, quat2, lerp[, dest]) -> quat4
 * - quat (quat4) : first quarternion
 * - quat2 (quat4) : second quaternion
 * - lerp (Number) : interpolation amount between the two inputs
 * - dest (quat4) : optional quat4 receiving calculated values. If not specified, result is written to +quat+.
 *
 * Performs a spherical linear interpolation between two quat4
 *
 * Returns:
 * dest if specified, quat otherwise
 **/
;

/**
 * quat4.str(quat) -> String
 * - quat (quat4) : quat4 to represent as a string
 *
 * Returns a string representation of a quaternion
 *
 * Returns:
 * string representation of quat
 **/
;
