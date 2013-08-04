(function(){
    

var rsplit = function(string, regex) {
	var result = regex.exec(string),retArr = new Array(), first_idx, last_idx, first_bit;
	while (result != null)
	{
		first_idx = result.index; last_idx = regex.lastIndex;
		if ((first_idx) != 0)
		{
			first_bit = string.substring(0,first_idx);
			retArr.push(string.substring(0,first_idx));
			string = string.slice(first_idx);
		}		
		retArr.push(result[0]);
		string = string.slice(result[0].length);
		result = regex.exec(string);	
	}
	if (! string == '')
	{
		retArr.push(string);
	}
	return retArr;
},
chop =  function(string){
    return string.substr(0, string.length - 1);
},
extend = function(d, s){
    for(var n in s){
        if(s.hasOwnProperty(n))  d[n] = s[n]
    }
}


EJS = function( options ){
	options = typeof options == "string" ? {view: options} : options
    this.set_options(options);
	if(options.precompiled){
		this.template = {};
		this.template.process = options.precompiled;
		EJS.update(this.name, this);
		return;
	}
    if(options.element)
	{
		if(typeof options.element == 'string'){
			var name = options.element
			options.element = document.getElementById(  options.element )
			if(options.element == null) throw name+'does not exist!'
		}
		if(options.element.value){
			this.text = options.element.value
		}else{
			this.text = options.element.innerHTML
		}
		this.name = options.element.id
		this.type = '['
	}else if(options.url){
        options.url = EJS.endExt(options.url, this.extMatch);
		this.name = this.name ? this.name : options.url;
        var url = options.url
        //options.view = options.absolute_url || options.view || options.;
		var template = EJS.get(this.name /*url*/, this.cache);
		if (template) return template;
	    if (template == EJS.INVALID_PATH) return null;
        try{
            this.text = EJS.request( url+(this.cache ? '' : '?'+Math.random() ));
        }catch(e){}

		if(this.text == null){
            throw( {type: 'EJS', message: 'There is no template at '+url}  );
		}
		//this.name = url;
	}
	var template = new EJS.Compiler(this.text, this.type);

	template.compile(options, this.name);

	
	EJS.update(this.name, this);
	this.template = template;
};
/* @Prototype*/
EJS.prototype = {
	/**
	 * Renders an object with extra view helpers attached to the view.
	 * @param {Object} object data to be rendered
	 * @param {Object} extra_helpers an object with additonal view helpers
	 * @return {String} returns the result of the string
	 */
    render : function(object, extra_helpers){
        object = object || {};
        this._extra_helpers = extra_helpers;
		var v = new EJS.Helpers(object, extra_helpers || {});
		return this.template.process.call(object, object,v);
	},
    update : function(element, options){
        if(typeof element == 'string'){
			element = document.getElementById(element)
		}
		if(options == null){
			_template = this;
			return function(object){
				EJS.prototype.update.call(_template, element, object)
			}
		}
		if(typeof options == 'string'){
			params = {}
			params.url = options
			_template = this;
			params.onComplete = function(request){
				var object = eval( request.responseText )
				EJS.prototype.update.call(_template, element, object)
			}
			EJS.ajax_request(params)
		}else
		{
			element.innerHTML = this.render(options)
		}
    },
	out : function(){
		return this.template.out;
	},
    /**
     * Sets options on this view to be rendered with.
     * @param {Object} options
     */
	set_options : function(options){
        this.type = options.type || EJS.type;
		this.cache = options.cache != null ? options.cache : EJS.cache;
		this.text = options.text || null;
		this.name =  options.name || null;
		this.ext = options.ext || EJS.ext;
		this.extMatch = new RegExp(this.ext.replace(/\./, '\.'));
	}
};
EJS.endExt = function(path, match){
	if(!path) return null;
	match.lastIndex = 0
	return path+ (match.test(path) ? '' : this.ext )
}




/* @Static*/
EJS.Scanner = function(source, left, right) {
	
    extend(this,
        {left_delimiter: 	left +'%',
         right_delimiter: 	'%'+right,
         double_left: 		left+'%%',
         double_right:  	'%%'+right,
         left_equal: 		left+'%=',
         left_comment: 	left+'%#'})

	this.SplitRegexp = left=='[' ? /(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/ : new RegExp('('+this.double_left+')|(%%'+this.double_right+')|('+this.left_equal+')|('+this.left_comment+')|('+this.left_delimiter+')|('+this.right_delimiter+'\n)|('+this.right_delimiter+')|(\n)') ;
	
	this.source = source;
	this.stag = null;
	this.lines = 0;
};

EJS.Scanner.to_text = function(input){
	if(input == null || input === undefined)
        return '';
    if(input instanceof Date)
		return input.toDateString();
	if(input.toString) 
        return input.toString();
	return '';
};

EJS.Scanner.prototype = {
  scan: function(block) {
     scanline = this.scanline;
	 regex = this.SplitRegexp;
	 if (! this.source == '')
	 {
	 	 var source_split = rsplit(this.source, /\n/);
	 	 for(var i=0; i<source_split.length; i++) {
		 	 var item = source_split[i];
			 this.scanline(item, regex, block);
		 }
	 }
  },
  scanline: function(line, regex, block) {
	 this.lines++;
	 var line_split = rsplit(line, regex);
 	 for(var i=0; i<line_split.length; i++) {
	   var token = line_split[i];
       if (token != null) {
		   	try{
	         	block(token, this);
		 	}catch(e){
				throw {type: 'EJS.Scanner', line: this.lines};
			}
       }
	 }
  }
};


EJS.Buffer = function(pre_cmd, post_cmd) {
	this.line = new Array();
	this.script = "";
	this.pre_cmd = pre_cmd;
	this.post_cmd = post_cmd;
	for (var i=0; i<this.pre_cmd.length; i++)
	{
		this.push(pre_cmd[i]);
	}
};
EJS.Buffer.prototype = {
	
  push: function(cmd) {
	this.line.push(cmd);
  },

  cr: function() {
	this.script = this.script + this.line.join('; ');
	this.line = new Array();
	this.script = this.script + "\n";
  },

  close: function() {
	if (this.line.length > 0)
	{
		for (var i=0; i<this.post_cmd.length; i++){
			this.push(pre_cmd[i]);
		}
		this.script = this.script + this.line.join('; ');
		line = null;
	}
  }
 	
};


EJS.Compiler = function(source, left) {
    this.pre_cmd = ['var ___ViewO = [];'];
	this.post_cmd = new Array();
	this.source = ' ';	
	if (source != null)
	{
		if (typeof source == 'string')
		{
		    source = source.replace(/\r\n/g, "\n");
            source = source.replace(/\r/g,   "\n");
			this.source = source;
		}else if (source.innerHTML){
			this.source = source.innerHTML;
		} 
		if (typeof this.source != 'string'){
			this.source = "";
		}
	}
	left = left || '<';
	var right = '>';
	switch(left) {
		case '[':
			right = ']';
			break;
		case '<':
			break;
		default:
			throw left+' is not a supported deliminator';
			break;
	}
	this.scanner = new EJS.Scanner(this.source, left, right);
	this.out = '';
};
EJS.Compiler.prototype = {
  compile: function(options, name) {
  	options = options || {};
	this.out = '';
	var put_cmd = "___ViewO.push(";
	var insert_cmd = put_cmd;
	var buff = new EJS.Buffer(this.pre_cmd, this.post_cmd);		
	var content = '';
	var clean = function(content)
	{
	    content = content.replace(/\\/g, '\\\\');
        content = content.replace(/\n/g, '\\n');
        content = content.replace(/"/g,  '\\"');
        return content;
	};
	this.scanner.scan(function(token, scanner) {
		if (scanner.stag == null)
		{
			switch(token) {
				case '\n':
					content = content + "\n";
					buff.push(put_cmd + '"' + clean(content) + '");');
					buff.cr();
					content = '';
					break;
				case scanner.left_delimiter:
				case scanner.left_equal:
				case scanner.left_comment:
					scanner.stag = token;
					if (content.length > 0)
					{
						buff.push(put_cmd + '"' + clean(content) + '")');
					}
					content = '';
					break;
				case scanner.double_left:
					content = content + scanner.left_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
		else {
			switch(token) {
				case scanner.right_delimiter:
					switch(scanner.stag) {
						case scanner.left_delimiter:
							if (content[content.length - 1] == '\n')
							{
								content = chop(content);
								buff.push(content);
								buff.cr();
							}
							else {
								buff.push(content);
							}
							break;
						case scanner.left_equal:
							buff.push(insert_cmd + "(EJS.Scanner.to_text(" + content + ")))");
							break;
					}
					scanner.stag = null;
					content = '';
					break;
				case scanner.double_right:
					content = content + scanner.right_delimiter;
					break;
				default:
					content = content + token;
					break;
			}
		}
	});
	if (content.length > 0)
	{
		// Chould be content.dump in Ruby
		buff.push(put_cmd + '"' + clean(content) + '")');
	}
	buff.close();
	this.out = buff.script + ";";
	var to_be_evaled = '/*'+name+'*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {'+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";
	
	try{
		eval(to_be_evaled);
	}catch(e){
		if(typeof JSLINT != 'undefined'){
			JSLINT(this.out);
			for(var i = 0; i < JSLINT.errors.length; i++){
				var error = JSLINT.errors[i];
				if(error.reason != "Unnecessary semicolon."){
					error.line++;
					var e = new Error();
					e.lineNumber = error.line;
					e.message = error.reason;
					if(options.view)
						e.fileName = options.view;
					throw e;
				}
			}
		}else{
			throw e;
		}
	}
  }
};


//type, cache, folder
/**
 * Sets default options for all views
 * @param {Object} options Set view with the following options
 * <table class="options">
				<tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
				<tr>
					<td>type</td>
					<td>'<'</td>
					<td>type of magic tags.  Options are '&lt;' or '['
					</td>
				</tr>
				<tr>
					<td>cache</td>
					<td>true in production mode, false in other modes</td>
					<td>true to cache template.
					</td>
				</tr>
	</tbody></table>
 * 
 */
EJS.config = function(options){
	EJS.cache = options.cache != null ? options.cache : EJS.cache;
	EJS.type = options.type != null ? options.type : EJS.type;
	EJS.ext = options.ext != null ? options.ext : EJS.ext;
	
	var templates_directory = EJS.templates_directory || {}; //nice and private container
	EJS.templates_directory = templates_directory;
	EJS.get = function(path, cache){
		if(cache == false) return null;
		if(templates_directory[path]) return templates_directory[path];
  		return null;
	};
	
	EJS.update = function(path, template) { 
		if(path == null) return;
		templates_directory[path] = template ;
	};
	
	EJS.INVALID_PATH =  -1;
};
EJS.config( {cache: true, type: '<', ext: '.ejs' } );



/**
 * @constructor
 * By adding functions to EJS.Helpers.prototype, those functions will be available in the 
 * views.
 * @init Creates a view helper.  This function is called internally.  You should never call it.
 * @param {Object} data The data passed to the view.  Helpers have access to it through this._data
 */
EJS.Helpers = function(data, extras){
	this._data = data;
    this._extras = extras;
    extend(this, extras );
};
/* @prototype*/
EJS.Helpers.prototype = {
    /**
     * Renders a new view.  If data is passed in, uses that to render the view.
     * @param {Object} options standard options passed to a new view.
     * @param {optional:Object} data
     * @return {String}
     */
	view: function(options, data, helpers){
        if(!helpers) helpers = this._extras
		if(!data) data = this._data;
		return new EJS(options).render(data, helpers);
	},
    /**
     * For a given value, tries to create a human representation.
     * @param {Object} input the value being converted.
     * @param {Object} null_text what text should be present if input == null or undefined, defaults to ''
     * @return {String} 
     */
	to_text: function(input, null_text) {
	    if(input == null || input === undefined) return null_text || '';
	    if(input instanceof Date) return input.toDateString();
		if(input.toString) return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
		return '';
	}
};
    EJS.newRequest = function(){
	   var factories = [function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	   for(var i = 0; i < factories.length; i++) {
	        try {
	            var request = factories[i]();
	            if (request != null)  return request;
	        }
	        catch(e) { continue;}
	   }
	}
	
	EJS.request = function(path){
	   var request = new EJS.newRequest()
	   request.open("GET", path, false);
	   
	   try{request.send(null);}
	   catch(e){return null;}
	   
	   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
	   
	   return request.responseText
	}
	EJS.ajax_request = function(params){
		params.method = ( params.method ? params.method : 'GET')
		
		var request = new EJS.newRequest();
		request.onreadystatechange = function(){
			if(request.readyState == 4){
				if(request.status == 200){
					params.onComplete(request)
				}else
				{
					params.onComplete(request)
				}
			}
		}
		request.open(params.method, params.url)
		request.send(null)
	}


})();
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.2.0
 */

/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */



(function(_global) {
  "use strict";

  var shim = {};
  if (typeof(exports) === 'undefined') {
    if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
      shim.exports = {};
      define(function() {
        return shim.exports;
      });
    } else {
      // gl-matrix lives in a browser, define its namespaces in global
      shim.exports = typeof(window) !== 'undefined' ? window : _global;
    }
  }
  else {
    // gl-matrix lives in commonjs, define its namespaces in exports
    shim.exports = exports;
  }

  (function(exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


if(!GLMAT_EPSILON) {
    var GLMAT_EPSILON = 0.000001;
}

if(!GLMAT_ARRAY_TYPE) {
    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
}

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

/**
 * Sets the type of array used when creating new vectors and matricies
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    GLMAT_ARRAY_TYPE = type;
}

if(typeof(exports) !== 'undefined') {
    exports.glMatrix = glMatrix;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */

var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new GLMAT_ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec2 = vec2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */

var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function(x, y, z) {
    var out = new GLMAT_ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
    return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = (function() {
    var vec = vec3.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function (a) {
    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec3 = vec3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */

var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
        out[3] = a[3] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.vec4 = vec4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x2 Matrix
 * @name mat2
 */

var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a1 * b2;
    out[1] = a0 * b1 + a1 * b3;
    out[2] = a2 * b0 + a3 * b2;
    out[3] = a2 * b1 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a1 * s;
    out[1] = a0 * -s + a1 * c;
    out[2] = a2 *  c + a3 * s;
    out[3] = a2 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v1;
    out[2] = a2 * v0;
    out[3] = a3 * v1;
    return out;
};

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2 = mat2;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, b,
 *  c, d,
 *  tx,ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, b, 0
 *  c, d, 0
 *  tx,ty,1]
 * </pre>
 * The last column is ignored so the array is shorter and operations are faster.
 */

var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5],
        ba = b[0], bb = b[1], bc = b[2], bd = b[3],
        btx = b[4], bty = b[5];

    out[0] = aa*ba + ab*bc;
    out[1] = aa*bb + ab*bd;
    out[2] = ac*ba + ad*bc;
    out[3] = ac*bb + ad*bd;
    out[4] = ba*atx + bc*aty + btx;
    out[5] = bb*atx + bd*aty + bty;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;


/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var aa = a[0],
        ab = a[1],
        ac = a[2],
        ad = a[3],
        atx = a[4],
        aty = a[5],
        st = Math.sin(rad),
        ct = Math.cos(rad);

    out[0] = aa*ct + ab*st;
    out[1] = -aa*st + ab*ct;
    out[2] = ac*ct + ad*st;
    out[3] = -ac*st + ct*ad;
    out[4] = ct*atx + st*aty;
    out[5] = ct*aty - st*atx;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var vx = v[0], vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
};

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat2d = mat2d;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 3x3 Matrix
 * @name mat3
 */

var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }
    
    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[3] = xy + wz;
    out[6] = xz - wy;

    out[1] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[7] = yz + wx;

    out[2] = xz + wy;
    out[5] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat3 = mat3;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class 4x4 Matrix
 * @name mat4
 */

var mat4 = {};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function() {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function(a) {
    var out = new GLMAT_ARRAY_TYPE(16);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
};

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
};

/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
};

/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
    return out;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
};

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = function (out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scale = function(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
};

/**
 * Rotates a mat4 by the given angle
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (Math.abs(len) < GLMAT_EPSILON) { return null; }
    
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];

    if (a !== out) { // If the source and destination differ, copy the unchanged rows
        out[4]  = a[4];
        out[5]  = a[5];
        out[6]  = a[6];
        out[7]  = a[7];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = function (out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];

    if (a !== out) { // If the source and destination differ, copy the unchanged last row
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function (out, q, v) {
    // Quaternion math
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    
    return out;
};

/**
* Calculates a 4x4 matrix from the given quaternion
*
* @param {mat4} out mat4 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat4} out
*/
mat4.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function (out, left, right, bottom, top, near, far) {
    var rl = 1 / (right - left),
        tb = 1 / (top - bottom),
        nf = 1 / (near - far);
    out[0] = (near * 2) * rl;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = (near * 2) * tb;
    out[6] = 0;
    out[7] = 0;
    out[8] = (right + left) * rl;
    out[9] = (top + bottom) * tb;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (far * near * 2) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function (out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function (out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function (out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (Math.abs(eyex - centerx) < GLMAT_EPSILON &&
        Math.abs(eyey - centery) < GLMAT_EPSILON &&
        Math.abs(eyez - centerz) < GLMAT_EPSILON) {
        return mat4.identity(out);
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;

    return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function (a) {
    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' + 
                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.mat4 = mat4;
}
;
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation 
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

/**
 * @class Quaternion
 * @name quat
 */

var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new GLMAT_ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3 = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = view[0];
        matr[5] = view[1];
        matr[8] = view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5; 

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;
    
    return out;
};

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = (function() {
    // benchmarks:
    //    http://jsperf.com/typed-array-access-speed
    //    http://jsperf.com/conversion-of-3x3-matrix-to-quaternion

    var s_iNext = (typeof(Int8Array) !== 'undefined' ? new Int8Array([1,2,0]) : [1,2,0]);

    return function(out, m) {
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quaternion Calculus and Fast Animation".
        var fTrace = m[0] + m[4] + m[8];
        var fRoot;

        if ( fTrace > 0.0 ) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0);  // 2w
            out[3] = 0.5 * fRoot;
            fRoot = 0.5/fRoot;  // 1/(4w)
            out[0] = (m[7]-m[5])*fRoot;
            out[1] = (m[2]-m[6])*fRoot;
            out[2] = (m[3]-m[1])*fRoot;
        } else {
            // |w| <= 1/2
            var i = 0;
            if ( m[4] > m[0] )
              i = 1;
            if ( m[8] > m[i*3+i] )
              i = 2;
            var j = s_iNext[i];
            var k = s_iNext[j];
            
            fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
            out[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            out[3] = (m[k*3+j] - m[j*3+k]) * fRoot;
            out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
            out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
        }
        
        return out;
    };
})();

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

if(typeof(exports) !== 'undefined') {
    exports.quat = quat;
}
;













  })(shim.exports);
})(this);
(function() {
  vec2.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON;
  };

  vec3.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON && Math.abs(a[2] - b[2]) < Math.EPSILON;
  };

  vec4.equalish = mat2.equalish = quat.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON && Math.abs(a[2] - b[2]) < Math.EPSILON && Math.abs(a[3] - b[3]) < Math.EPSILON;
  };

  mat2d.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON && Math.abs(a[2] - b[2]) < Math.EPSILON && Math.abs(a[3] - b[3]) < Math.EPSILON && Math.abs(a[4] - b[4]) < Math.EPSILON && Math.abs(a[5] - b[5]) < Math.EPSILON;
  };

  mat3.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON && Math.abs(a[2] - b[2]) < Math.EPSILON && Math.abs(a[3] - b[3]) < Math.EPSILON && Math.abs(a[4] - b[4]) < Math.EPSILON && Math.abs(a[5] - b[5]) < Math.EPSILON && Math.abs(a[6] - b[6]) < Math.EPSILON && Math.abs(a[7] - b[7]) < Math.EPSILON && Math.abs(a[8] - b[8]) < Math.EPSILON;
  };

  mat4.equalish = function(a, b) {
    return Math.abs(a[0] - b[0]) < Math.EPSILON && Math.abs(a[1] - b[1]) < Math.EPSILON && Math.abs(a[2] - b[2]) < Math.EPSILON && Math.abs(a[3] - b[3]) < Math.EPSILON && Math.abs(a[4] - b[4]) < Math.EPSILON && Math.abs(a[5] - b[5]) < Math.EPSILON && Math.abs(a[6] - b[6]) < Math.EPSILON && Math.abs(a[7] - b[7]) < Math.EPSILON && Math.abs(a[8] - b[8]) < Math.EPSILON && Math.abs(a[9] - b[9]) < Math.EPSILON && Math.abs(a[10] - b[10]) < Math.EPSILON && Math.abs(a[11] - b[11]) < Math.EPSILON && Math.abs(a[12] - b[12]) < Math.EPSILON && Math.abs(a[13] - b[13]) < Math.EPSILON && Math.abs(a[14] - b[14]) < Math.EPSILON && Math.abs(a[15] - b[15]) < Math.EPSILON;
  };

  /*
  mat4.IDENTITY -> mat4
  
  Represents a 4x4 Identity matrix.
  
  (Note: this is a Jax-specific extension. It does not appear by default
  in the glMatrix library.)
  */


  mat4.IDENTITY = mat4.identity(mat4.create());

  /*
  quat4.IDENTITY -> quat4
  
  Represents the Identity quaternion.
  
  (Note: this is a Jax-specific extension. It does not appear by default
  in the glMatrix library.)
  */


  quat.IDENTITY = quat.identity(quat.create());

  /*
  vec3.UNIT_X -> vec3
  
  Represents a unit vector along the positive X axis
  
  (Note: this is a Jax-specific extension. It does not appear by default
  in the glMatrix library.)
  */


  vec3.UNIT_X = vec3.fromValues(1, 0, 0);

  /*
  vec3.UNIT_Y -> vec3
  
  Represents a unit vector along the positive Y axis
  
  (Note: this is a Jax-specific extension. It does not appear by default
  in the glMatrix library.)
  */


  vec3.UNIT_Y = vec3.fromValues(0, 1, 0);

  /*
  vec3.UNIT_Z -> vec3
  
  Represents a unit vector along the positive Z axis
  
  (Note: this is a Jax-specific extension. It does not appear by default
  in the glMatrix library.)
  */


  vec3.UNIT_Z = vec3.fromValues(0, 0, 1);

}).call(this);
(function() {


}).call(this);









/**
 * Jax
 * Root namespace containing all Jax data
 **/

var Jax = {
  PRODUCTION: 1,
  
  webgl_not_supported_path: null,
  
  /**
   * Global
   * Objects and functions defined here are available in the global scope.
   **/
  getGlobal: function() {
    var g;
    if (typeof(global) != 'undefined') g = global;
    else g = window;

    Jax.getGlobal = function() { return g; };
    return Jax.getGlobal();
  },
  
  /**
   * Jax.reraise(old_error, new_error) -> error
   * - old_error (Error): the original exception that was raised
   * - new_error (Error): the error to be raised in its place
   *
   * Copies the backtrace from the old error into the new error, if available.
   * Since some browsers do not support assignment to the +stack+ attribute
   * of an error, this is stored in the +_stack+ attribute instead.
   *
   * After the copy has been performed, the new error is thrown
   **/
  reraise: function(original_error, new_error) {
    if (original_error._stack) new_error._stack = original_error._stack;
    else if (original_error.stack) new_error._stack = original_error.stack;
    throw new_error;
  },
  
  /**
   * Jax.click_speed = 0.2
   *
   * Think of an input button. The 'mouse_clicked' event fires after the button has been
   * depressed, regardless of how long the button has been held down. However, in
   * terms of UI events, a "mouse clicked" event generally corresponds to a mouse
   * button press followed by a mouse button release within a relatively short
   * timeframe.
   *
   * In order to prevent 'mouse_clicked' events from interfering with other button-related
   * events, such as 'mouse_dragged', Jax imposes a UI-like click speed. If the
   * 'mouse_clicked' event is not received within this number of seconds from the
   * previous 'mouse_pressed' event, it will be ignored.
   *
   * To revert to HTML-style, button-like clicking, simply set this number to +null+.
   *
   **/
  click_speed: 0.2,
};

(function() {
  var guid = 0;
  Jax.guid = function() { return guid++; };
})();

/* FIXME I'm not even sure whether this is used any more. */
Jax.default_shader = "basic";

Jax.shaders = {};
Jax._shader_data = {};

Jax.import_shader_code = function(shader_name, shader_type) {
  return Jax.shader_data(shader_name)[shader_type];
};

// Finds or creates the named shader descriptor in +Jax.shaders+. This is used by
// `Jax::Shader` in Ruby.
Jax.shader_data = function(name) {
  Jax._shader_data[name] = Jax._shader_data[name] || {"name":name};
  return Jax._shader_data[name];
};

/**
 * Jax.loaded -> Boolean
 * True after Jax has been loaded.
 **/
Jax.loaded = true;

/**
 * Jax.update_speed -> Number
 * Target number of milliseconds to wait between updates.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 *
 * Defaults to 33, for a target rate of 30 updates per second.
 **/
Jax.update_speed = 33;


/**
 * Jax.max_lights -> Number
 *
 * If set, Jax will raise an error whenever more than this number of light sources
 * are activated at one time.
 *
 * By default, there is no limit to the number of lights Jax can support. (This
 * property is undefined by default.)
 **/
Jax.max_lights = undefined;

/**
 * Jax.uptime -> Number
 *
 * The amount of time the Jax subsystem has been running, in seconds. This is updated
 * whether any contexts are active or not. It is used for tracking update intervals
 * and framerates, so that individual Jax contexts are not constantly spawning new
 * Date() instances (which then have to be garbage collected).
 **/
Jax.uptime = 0.0;
Jax.VERSION = "3.0.0.rc3"

;
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


/**
 * Jax.Class
 **/

Jax.Class = (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
      __slice = Array.prototype.slice;
  
  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 })
      if (p === 'toString') return false;
    return true;
  })();
  
  function addMethods(source, ancestor) {
    var ancestor   = ancestor && ancestor.prototype,
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
          return function() {
            if (m === 'initialize' && !ancestor[m])
              return ancestor.constructor.apply(this, arguments);
            else {
              if (!ancestor[m]) throw new Error("ancestor has no method "+m);
              return ancestor[m].apply(this, arguments);
            }
          };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    Methods: {
      addMethods: addMethods
    },
    
    create: function() {
      var parent, properties;
      if (arguments.length > 1) {
        parent = arguments[0];
        properties = arguments[1];
      } else {
        parent = null;
        properties = arguments[0];
      }
      
      return (function(_super) {
        if (_super)
          __extends(Klass, _super);
        
        function Klass() {
          Jax.Util.addRequestedHelpers(this);
          if (this.initialize)
            this.initialize.apply(this, arguments);
        }
        
        Object.extend(Klass, Jax.Class.Methods);
        Klass.addMethods(properties, _super);
        
        return Klass;
      })(parent);
    }
  };
})();

(function() {
  /*
    Delegator is instantiated by the class method #delegate with _this_ and _arguments_ as arguments.
    It is effectively responsible for copying a set of methods into the destination object.
    
    @see Jax.Class.Methods#delegate
   */
  var Delegator = Jax.Class.create({
    initialize: function(target, methods) {
      throw new Error("Delegator has been phased out, please don't call it (with "+JSON.stringify(target)+", "+JSON.stringify(methods)+")");
      this.methods = methods;
      this.target = target;
    },
    
    into: function(destination, dest_klass) {
      /*
        yes, we're using eval in here. But as this method is only called during setup, it's probably OK for the most
        part. Note the caveat that if dest_klass is omitted and the dev is using regular expressions to match method
        names, we have no choice but to put an eval into the alias chain for this.target#initialize. Not ideal but I
        couldn't think of a better way to make it work.
       */
      var methods = {};
      var method_name;
      var alias_chain_regexps = [];
      
      for (var i = 0; i < this.methods.length; i++) {
        if (typeof(this.methods[i]) == "string") {
          /* it's not a regexp so this case is pretty straightforward */
          method_name = this.methods[i];
          methods[method_name] =
            eval("(function() { return this."+destination+"."+method_name+".apply(this."+destination+", arguments); })");
        } else if (this.methods[i].test) {
          var method_regexp = this.methods[i];
          /*
            regexp -- this is harder because we don't know what klass _destination_ points to.
            we have two choices: require an explicit klass argument, or assume the dev is prepared
            to pay the overhead price of testing regexps and calling #eval within #initialize.
            
            let's do both: if explicit klass was given, use it. Else, set up an alias chain for #initialize.
           */
          
          if (dest_klass) {
            for (method_name in dest_klass.prototype) {
              if (method_regexp.test(method_name)) {
                methods[method_name] =
                        eval("(function() { return this."+destination+"."+method_name+".apply(this."+destination+", arguments); })");
              }
            }
          } else {
            alias_chain_regexps.push(method_regexp);
          }
        }
      }

      /* add known methods */
      this.target.addMethods(methods);
      
      if (alias_chain_regexps.length > 0) {
        if (!this.target.alias_chain_regexps)
        {
          /* alias chain doesn't yet exist -- create it */
          this.target.alias_chain_regexps = {};
          var original_initialize_method = this.target.prototype.initialize;
          var fn = "(function(){" +
                     "if (original_initialize_method) original_initialize_method.apply(this, arguments);" +
                     "var i, j, method_name, destination, method_regexp, self = this;" +
                  
                     "destination = this."+destination+";" +
                     "for (i = 0; i < this.klass.alias_chain_regexps['"+destination+"'].length; i++) {" +
                       "method_regexp = this.klass.alias_chain_regexps['"+destination+"'][i];" +
                       "for (j in destination) {" +
                         "method_name = j;" +
                         "if (method_regexp.test(method_name)) " +
                           "this[method_name] = eval('(function(){return self."+destination+".'+method_name+" +
                                                    "'.apply(self."+destination+", arguments);})');" +
                       "}" +
                     "}" +
                  "})";
          
          this.target.prototype.initialize = eval(fn);
        }
        /* else, alias chain exists; we only have to add method regexps */
        
        this.target.alias_chain_regexps[destination] = this.target.alias_chain_regexps[destination] || [];
        for (i = 0; i < alias_chain_regexps.length; i++) {
          this.target.alias_chain_regexps[destination].push(alias_chain_regexps[i]);
        }
      }
    }
  });
    
  /*
    Prototype doesn't seem to have a way to add instance methods to all classes (a generic base object would have
    been nice) so we have to hack it in by aliasing ::create and then replacing it.
  */
  Jax.Class.InstanceMethods = {
    isKindOf: function() { throw new Error("isKindOf is deprecated; please use instanceof instead."); }
  };

  var original_create = Jax.Class.create;
  Jax.Class.create = function() {
    var klass = original_create.apply(Jax.Class, arguments);
    klass.prototype.klass = klass;
    klass.addMethods(Jax.Class.InstanceMethods);

    return klass;
  };
  
  /**
   * Jax.Class.delegate() -> undefined
   *
   * This is a class method of all Jax classes.
   *
   * Delegates one or more methods into properties of the class. For instance,
   * the following:
   * 
   *     MyClass.delegate("sayHello").into("person");
   *
   * will create a +sayHello+ method in the +MyClass+ class that internally calls
   * 
   *     this.person.sayHello(...)
   *
   * and returns the results.
   *
   * There are several other variants:
   *
   *     klass.delegate(/regular expression/).into("property_name");
   *       // delegates any method name in +property_name+ that matches the expression
   * 
   *     klass.delegate("one", "two").into("property_name");
   *       // delegates both 'one' and 'two' methods into +property_name+
   *
   *
   **/
  Jax.Class.Methods.delegate = function() {
    return new Delegator(this, arguments);
  };
})();
(function() {
  var lastTime, vendor, vendors, _i, _len;

  lastTime = 0;

  vendors = ['ms', 'moz', 'webkit', 'o'];

  this.cancelAnimationFrame || (this.cancelAnimationFrame = this.cancelRequestAnimationFrame);

  if (!this.requestAnimationFrame) {
    for (_i = 0, _len = vendors.length; _i < _len; _i++) {
      vendor = vendors[_i];
      this.requestAnimationFrame || (this.requestAnimationFrame = this[vendor + 'RequestAnimationFrame']);
      this.cancelAnimationFrame = this.cancelRequestAnimationFrame || (this.cancelRequestAnimationFrame = this[vendor + 'CancelRequestAnimationFrame']);
    }
  }

  if (!this.requestAnimationFrame) {
    this.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall;

      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = this.setTimeout((function() {
        return callback(currTime + timeToCall);
      }), timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!this.cancelAnimationFrame) {
    this.cancelAnimationFrame = this.cancelRequestAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }

}).call(this);
/**
 * class Jax.Buffer
 *
 * Root class of all WebGL buffer objects.
 *
 * Wrapper to manage JS and GL buffer (array) types. Automates context
 * juggling by requiring the context to generate the buffer for as an
 * argument to #bind. If the context doesn't have a corresponding GL
 * buffer for this data, it will be created. Calling #refresh will
 * regenerate the buffer data for all contexts.
 *
 **/

Jax.Buffer = (function() {
  function each_gl_buffer(self, func)
  {
    for (var id in self.gl)
      func(self.gl[id].context, self.gl[id].buffer);
  }

  return Jax.Class.create({
    /**
     * new Jax.Buffer(bufferType, classType, drawType, jsarr, itemSize)
     * - bufferType (GLenum): A WebGL enumeration specifying what type
     *                        of buffer this represents, such as GL_ELEMENT_ARRAY_BUFFER or
     *                        GL_ARRAY_BUFFER.
     * - classType (TypedArray): a typed array to implement this buffer
     * with, such as +Uint6Array+ or +Float32Array+.
     * - drawType (GLenum): GL_STREAM_DRAW, GL_STATIC_DRAW, or GL_DYNAMIC_DRAW.
     * - jsarr (Array): a JavaScript Array containing the actual raw
     * data. This should be a flat array (that is, no nested arrays).
     * - itemSize (Number): the number of items in a single element
     * of the buffer. The length of the buffer must be divisible by
     * this number.
     *
     **/
    initialize: function(bufferType, deprecated, drawType, jsarr, itemSize, dataType) {
      // if (jsarr.length == 0) throw new Error("No elements in array to be buffered!");
      if (!itemSize) throw new Error("Expected an itemSize - how many JS array elements represent a single buffered element?");
      this.itemSize = itemSize;
      this.js = jsarr;
      this.gl = {};
      this.numItems = this.length = jsarr.length / itemSize;
      this.bufferType = bufferType;
      this.drawType = drawType;
      if (dataType) this.dataType = dataType;
      else
        if (jsarr instanceof Float32Array) this.dataType = GL_FLOAT;
        if (jsarr instanceof Uint8Array)   this.dataType = GL_UNSIGNED_BYTE;
        if (jsarr instanceof Uint16Array)  this.dataType = GL_UNSIGNED_SHORT;
        if (jsarr instanceof Uint32Array)  this.dataType = GL_UNSIGNED_INT;
      if (!this.dataType) throw new Error("Couldn't detect dataType");
    },

    /**
     * Jax.Buffer#refresh() -> Jax.Buffer
     *
     * Causes Jax to immediately refresh the buffer data on the graphics card
     * for all WebGL contexts the buffer is bound to. This should be done any
     * time you change the data within the buffer's underlying JavaScript array.
     **/
    refresh: function() {
      var self = this;
      var instance = this.refreshTypedArray();
      if (!self.gl) return;

      each_gl_buffer(self, function(context, buffer) {
        context.gl.bindBuffer(self.bufferType, buffer);
        context.gl.bufferData(self.bufferType, instance, self.drawType);
      });
      
      return this;
    },
    
    /**
     * Jax.Buffer#refreshTypedArray() -> TypedArray
     *
     * Refreshes the contents of the buffer's typed array and then returns
     * the typed array itself. This does not cause the corresponding GL
     * buffers to be refreshed.
     **/
    refreshTypedArray: function() {
      var self = this;
      var instance = this.js;//getTypedArray();
      // instance.set(self.js);

      self.numItems = self.length = self.js.length / self.itemSize;
      return instance;
    },
    
    /**
     * Jax.Buffer#getTypedArray([defaultValues]) -> TypedArray
     *
     * Returns the typed array instance corresponding for this buffer.
     **/
    // getTypedArray: function() {
    //   return this.classTypeInstance = this.classTypeInstance || new this.classType(this.js);
    // },

    /**
     * Jax.Buffer#dispose() -> Jax.Buffer
     *
     * Dispose of this buffer's WebGL counterparts. This is applied to all contexts
     * the buffer is associated with.
     *
     * Note that calling Jax.Buffer#bind will rebuild this buffer, effectively
     * cancelling this method out, so take care not to use the buffer after
     * disposing it unless this is the functionality you want (e.g. to clean up
     * some Jax contexts, but not all of them).
     **/
    dispose: function() {
      var self = this;
      each_gl_buffer(this, function(context, buffer) {
        context.gl.deleteBuffer(buffer);
        self.gl[context.id] = null;
      });
      self.gl = {};
      return self;
    },

    /**
     * Jax.Buffer#isDisposed() -> Boolean
     * 
     * Returns true if this buffer is in an uninitialized state.
     **/
    isDisposed: function() { return !this.gl; },

    /**
     * Jax.Buffer#bind(context) -> Jax.Buffer
     * - context (Jax.Context): the context to bind the buffer to.
     *
     * Binds this buffer to the specified context, then returns the buffer.
     * If this buffer is in an uninitialized or disposed state, it will be
     * built (or rebuilt) prior to binding.
     **/
    bind: function(context) { context.gl.bindBuffer(this.bufferType, this.getGLBuffer(context)); return this; },

    /**
     * Jax.Buffer#getGLBuffer(context) -> WebGLBuffer
     * - context (Jax.Context): the context to get the buffer for.
     * 
     * Returns the underlying WebGLBuffer instance representing this buffer's data
     * for the specified context. Note that this is different for each context.
     * If the buffer has not yet been defined for the given context, it will be.
     **/
    getGLBuffer: function(context)
    {
      if (!context || typeof(context.id) == "undefined")
        throw new Error("Cannot build a buffer without a context!");

      if (!this.gl[context.id])
      {
        var buffer = context.gl.createBuffer();
        buffer.itemSize = this.itemSize;
        this.gl[context.id] = {context:context,buffer:buffer};
        this.refresh();
      }
      return this.gl[context.id].buffer;
    }
  });
})();
(function() {
  var __slice = [].slice;

  Function.prototype.define = function(prop, desc) {
    return Object.defineProperty(this.prototype, prop, desc);
  };

  Function.prototype.setter = function(prop, setter) {
    return Object.defineProperty(this.prototype, prop, {
      set: setter
    });
  };

  Function.prototype.getter = function(prop, getter) {
    return Object.defineProperty(this.prototype, prop, {
      get: getter
    });
  };

  Function.prototype.accessor = function(prop, setter, getter) {
    return Object.defineProperty(this.prototype, prop, {
      get: getter,
      set: setter
    });
  };

  Function.prototype.extend = function() {
    var method, mixin, mixins, name, _i, _len, _results;

    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = mixins.length; _i < _len; _i++) {
      mixin = mixins[_i];
      _results.push((function() {
        var _results1;

        _results1 = [];
        for (name in mixin) {
          method = mixin[name];
          if (!this.hasOwnProperty(name)) {
            _results1.push(this[name] = method);
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Function.prototype.include = function() {
    var mixins;

    mixins = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return Function.prototype.extend.apply(this.prototype, mixins);
  };

}).call(this);
/* Defines constants, functions, etc. that may exist in one browser but not in another */

/* KeyEvent in Firefox contains various keyCode constants, but they are missing in Chrome. */

if (typeof(KeyEvent) == "undefined") {
  /**
   * Global.KeyEvent
   *
   * By default, Firefox defines a global +KeyEvent+ namespace containing character codes
   * for use with keyboard events. These are very useful for comparison with +event.keyCode+,
   * but are not supported by other browsers.
   *
   * In the event that a browser other than Firefox is used, Jax defines a fake +KeyEvent+
   * namespace to be used in its place. The constants contained within are taken from
   * Firefox 3.6, with the addition of the boolean +fake+, which is always true unless
   * the client is using Firefox.
   *
   * The individual values of the following constants may be different from one client to another:
   *
   *     KeyEvent.DOM_VK_CANCEL
   *     KeyEvent.DOM_VK_HELP
   *     KeyEvent.DOM_VK_BACK_SPACE
   *     KeyEvent.DOM_VK_TAB
   *     KeyEvent.DOM_VK_CLEAR
   *     KeyEvent.DOM_VK_RETURN
   *     KeyEvent.DOM_VK_ENTER
   *     KeyEvent.DOM_VK_SHIFT
   *     KeyEvent.DOM_VK_CONTROL
   *     KeyEvent.DOM_VK_ALT
   *     KeyEvent.DOM_VK_PAUSE
   *     KeyEvent.DOM_VK_CAPS_LOCK
   *     KeyEvent.DOM_VK_ESCAPE
   *     KeyEvent.DOM_VK_SPACE
   *     KeyEvent.DOM_VK_PAGE_UP
   *     KeyEvent.DOM_VK_PAGE_DOWN
   *     KeyEvent.DOM_VK_END
   *     KeyEvent.DOM_VK_HOME
   *     KeyEvent.DOM_VK_LEFT
   *     KeyEvent.DOM_VK_UP
   *     KeyEvent.DOM_VK_RIGHT
   *     KeyEvent.DOM_VK_DOWN
   *     KeyEvent.DOM_VK_PRINTSCREEN
   *     KeyEvent.DOM_VK_INSERT
   *     KeyEvent.DOM_VK_DELETE
   *     KeyEvent.DOM_VK_0
   *     KeyEvent.DOM_VK_1
   *     KeyEvent.DOM_VK_2
   *     KeyEvent.DOM_VK_3
   *     KeyEvent.DOM_VK_4
   *     KeyEvent.DOM_VK_5
   *     KeyEvent.DOM_VK_6
   *     KeyEvent.DOM_VK_7
   *     KeyEvent.DOM_VK_8
   *     KeyEvent.DOM_VK_9
   *     KeyEvent.DOM_VK_SEMICOLON
   *     KeyEvent.DOM_VK_EQUALS
   *     KeyEvent.DOM_VK_A
   *     KeyEvent.DOM_VK_B
   *     KeyEvent.DOM_VK_C
   *     KeyEvent.DOM_VK_D
   *     KeyEvent.DOM_VK_E
   *     KeyEvent.DOM_VK_F
   *     KeyEvent.DOM_VK_G
   *     KeyEvent.DOM_VK_H
   *     KeyEvent.DOM_VK_I
   *     KeyEvent.DOM_VK_J
   *     KeyEvent.DOM_VK_K
   *     KeyEvent.DOM_VK_L
   *     KeyEvent.DOM_VK_M
   *     KeyEvent.DOM_VK_N
   *     KeyEvent.DOM_VK_O
   *     KeyEvent.DOM_VK_P
   *     KeyEvent.DOM_VK_Q
   *     KeyEvent.DOM_VK_R
   *     KeyEvent.DOM_VK_S
   *     KeyEvent.DOM_VK_T
   *     KeyEvent.DOM_VK_U
   *     KeyEvent.DOM_VK_V
   *     KeyEvent.DOM_VK_W
   *     KeyEvent.DOM_VK_X
   *     KeyEvent.DOM_VK_Y
   *     KeyEvent.DOM_VK_Z
   *     KeyEvent.DOM_VK_CONTEXT_MENU
   *     KeyEvent.DOM_VK_NUMPAD0
   *     KeyEvent.DOM_VK_NUMPAD1
   *     KeyEvent.DOM_VK_NUMPAD2
   *     KeyEvent.DOM_VK_NUMPAD3
   *     KeyEvent.DOM_VK_NUMPAD4
   *     KeyEvent.DOM_VK_NUMPAD5
   *     KeyEvent.DOM_VK_NUMPAD6
   *     KeyEvent.DOM_VK_NUMPAD7
   *     KeyEvent.DOM_VK_NUMPAD8
   *     KeyEvent.DOM_VK_NUMPAD9
   *     KeyEvent.DOM_VK_MULTIPLY
   *     KeyEvent.DOM_VK_ADD
   *     KeyEvent.DOM_VK_SEPARATOR
   *     KeyEvent.DOM_VK_SUBTRACT
   *     KeyEvent.DOM_VK_DECIMAL
   *     KeyEvent.DOM_VK_DIVIDE
   *     KeyEvent.DOM_VK_F1
   *     KeyEvent.DOM_VK_F2
   *     KeyEvent.DOM_VK_F3
   *     KeyEvent.DOM_VK_F4
   *     KeyEvent.DOM_VK_F5
   *     KeyEvent.DOM_VK_F6
   *     KeyEvent.DOM_VK_F7
   *     KeyEvent.DOM_VK_F8
   *     KeyEvent.DOM_VK_F9
   *     KeyEvent.DOM_VK_F10
   *     KeyEvent.DOM_VK_F11
   *     KeyEvent.DOM_VK_F12
   *     KeyEvent.DOM_VK_F13
   *     KeyEvent.DOM_VK_F14
   *     KeyEvent.DOM_VK_F15
   *     KeyEvent.DOM_VK_F16
   *     KeyEvent.DOM_VK_F17
   *     KeyEvent.DOM_VK_F18
   *     KeyEvent.DOM_VK_F19
   *     KeyEvent.DOM_VK_F20
   *     KeyEvent.DOM_VK_F21
   *     KeyEvent.DOM_VK_F22
   *     KeyEvent.DOM_VK_F23
   *     KeyEvent.DOM_VK_F24
   *     KeyEvent.DOM_VK_NUM_LOCK
   *     KeyEvent.DOM_VK_SCROLL_LOCK
   *     KeyEvent.DOM_VK_COMMA
   *     KeyEvent.DOM_VK_PERIOD
   *     KeyEvent.DOM_VK_SLASH
   *     KeyEvent.DOM_VK_BACK_QUOTE
   *     KeyEvent.DOM_VK_OPEN_BRACKET
   *     KeyEvent.DOM_VK_BACK_SLASH
   *     KeyEvent.DOM_VK_CLOSE_BRACKET
   *     KeyEvent.DOM_VK_QUOTE
   *     KeyEvent.DOM_VK_META
   *
   **/
  KeyEvent = {
    fake: true,
    DOM_VK_CANCEL : 3,
    DOM_VK_HELP : 6,
    DOM_VK_BACK_SPACE : 8,
    DOM_VK_TAB : 9,
    DOM_VK_CLEAR : 12,
    DOM_VK_RETURN : 13,
    DOM_VK_ENTER : 14,
    DOM_VK_SHIFT : 16,
    DOM_VK_CONTROL : 17,
    DOM_VK_ALT : 18,
    DOM_VK_PAUSE : 19,
    DOM_VK_CAPS_LOCK : 20,
    DOM_VK_ESCAPE : 27,
    DOM_VK_SPACE : 32,
    DOM_VK_PAGE_UP : 33,
    DOM_VK_PAGE_DOWN : 34,
    DOM_VK_END : 35,
    DOM_VK_HOME : 36,
    DOM_VK_LEFT : 37,
    DOM_VK_UP : 38,
    DOM_VK_RIGHT : 39,
    DOM_VK_DOWN : 40,
    DOM_VK_PRINTSCREEN : 44,
    DOM_VK_INSERT : 45,
    DOM_VK_DELETE : 46,
    DOM_VK_0 : 48,
    DOM_VK_1 : 49,
    DOM_VK_2 : 50,
    DOM_VK_3 : 51,
    DOM_VK_4 : 52,
    DOM_VK_5 : 53,
    DOM_VK_6 : 54,
    DOM_VK_7 : 55,
    DOM_VK_8 : 56,
    DOM_VK_9 : 57,
    DOM_VK_SEMICOLON : 59,
    DOM_VK_EQUALS : 61,
    DOM_VK_A : 65,
    DOM_VK_B : 66,
    DOM_VK_C : 67,
    DOM_VK_D : 68,
    DOM_VK_E : 69,
    DOM_VK_F : 70,
    DOM_VK_G : 71,
    DOM_VK_H : 72,
    DOM_VK_I : 73,
    DOM_VK_J : 74,
    DOM_VK_K : 75,
    DOM_VK_L : 76,
    DOM_VK_M : 77,
    DOM_VK_N : 78,
    DOM_VK_O : 79,
    DOM_VK_P : 80,
    DOM_VK_Q : 81,
    DOM_VK_R : 82,
    DOM_VK_S : 83,
    DOM_VK_T : 84,
    DOM_VK_U : 85,
    DOM_VK_V : 86,
    DOM_VK_W : 87,
    DOM_VK_X : 88,
    DOM_VK_Y : 89,
    DOM_VK_Z : 90,
    DOM_VK_CONTEXT_MENU : 93,
    DOM_VK_NUMPAD0 : 96,
    DOM_VK_NUMPAD1 : 97,
    DOM_VK_NUMPAD2 : 98,
    DOM_VK_NUMPAD3 : 99,
    DOM_VK_NUMPAD4 : 100,
    DOM_VK_NUMPAD5 : 101,
    DOM_VK_NUMPAD6 : 102,
    DOM_VK_NUMPAD7 : 103,
    DOM_VK_NUMPAD8 : 104,
    DOM_VK_NUMPAD9 : 105,
    DOM_VK_MULTIPLY : 106,
    DOM_VK_ADD : 107,
    DOM_VK_SEPARATOR : 108,
    DOM_VK_SUBTRACT : 109,
    DOM_VK_DECIMAL : 110,
    DOM_VK_DIVIDE : 111,
    DOM_VK_F1 : 112,
    DOM_VK_F2 : 113,
    DOM_VK_F3 : 114,
    DOM_VK_F4 : 115,
    DOM_VK_F5 : 116,
    DOM_VK_F6 : 117,
    DOM_VK_F7 : 118,
    DOM_VK_F8 : 119,
    DOM_VK_F9 : 120,
    DOM_VK_F10 : 121,
    DOM_VK_F11 : 122,
    DOM_VK_F12 : 123,
    DOM_VK_F13 : 124,
    DOM_VK_F14 : 125,
    DOM_VK_F15 : 126,
    DOM_VK_F16 : 127,
    DOM_VK_F17 : 128,
    DOM_VK_F18 : 129,
    DOM_VK_F19 : 130,
    DOM_VK_F20 : 131,
    DOM_VK_F21 : 132,
    DOM_VK_F22 : 133,
    DOM_VK_F23 : 134,
    DOM_VK_F24 : 135,
    DOM_VK_NUM_LOCK : 144,
    DOM_VK_SCROLL_LOCK : 145,
    DOM_VK_COMMA : 188,
    DOM_VK_PERIOD : 190,
    DOM_VK_SLASH : 191,
    DOM_VK_BACK_QUOTE : 192,
    DOM_VK_OPEN_BRACKET : 219,
    DOM_VK_BACK_SLASH : 220,
    DOM_VK_CLOSE_BRACKET : 221,
    DOM_VK_QUOTE : 222,
    DOM_VK_META: 224
  };
  
  /* TODO handle special cases -- see http://www.javascripter.net/faq/keycodes.htm */
}
;
(function() {
  var JaxError,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  JaxError = (function(_super) {
    __extends(JaxError, _super);

    function JaxError() {
      var err;

      err = new Error();
      this.name = err.name = this.__proto__.constructor.name;
      if (err.stack) {
        this.stack = err.stack;
      }
    }

    return JaxError;

  })(Error);

  Jax.Error = JaxError;

}).call(this);
/**
 * mixin Jax.EventEmitter
 * 
 * Methods which can be added to potential event emitters.
 **/

Jax.EventEmitter = {
  /**
   * Jax.EventEmitter#getEventListeners(type) -> Array
   * - type (String): the type of event to retrieve listeners for.
   *
   * Returns an array containing all event listeners associated with the specified
   * event type.
   **/
  getEventListeners: function(name) {
    this.event_listeners || (this.event_listeners = {});
    return this.event_listeners[name] || (this.event_listeners[name] = []);
  },
  
  /**
   * Jax.EventEmitter#addEventListener(type, callback) -> Number
   * - type (String): the type of event to listen for.
   * - callback (Function): the callback function to receive the event
   *
   * Adds the specified callback to the list of event listeners to be called
   * when the given event type is fired.
   *
   * Returns the listener itself.
   **/
  addEventListener: function(name, callback) {
    var ary = this.getEventListeners(name);
    ary.push(callback);
    return callback;
  },
  
  /**
   * Jax.EventEmitter#removeEventListener(type, index) -> Function | undefined
   * - type (String): the type of event to remove the listener from.
   * - index (Number): the numeric index of the callback to be removed.
   *
   * Removes the callback represented by the index (as returned by
   * Jax.EventEmitter#addEventListener) from the event listener of
   * the specified type. Other event types are unaffected, even if they
   * contain the exact same callback function.
   *
   * Returns the original callback function, or undefined if it was not found.
   **/
  removeEventListener: function(name, index) {
    if (!name || index == undefined) throw new Error("both event type and listener index are required");
    var ary = this.getEventListeners(name);
    if (index instanceof Function) {
      var i = ary.indexOf(index);
      if (i != -1)
        ary.splice(i, 1);
      return index;
    } else {
      var result = ary[index];
      ary.splice(index, 1);
      return result;
    }
  },

  removeAllEventListeners: function() {
    var listeners = this.event_listeners;
    if (listeners) {
      for (var name in listeners) {
        var ary = listeners[name];
        ary.splice(0, ary.length);
      }
    }
  },
  
  /**
   * Jax.EventEmitter#fireEvent(type[, event]) -> undefined
   * - type (String): the type of event to fire
   * - event (Object): an optional object to be passed as an argument
   * to the event listeners.
   *
   * Fires an event. All listeners monitoring the specified event type
   * will receive the event object as an argument. If specified, the
   * event object's +type+ property is automatically assigned to the
   * specified type unless the object already has a +type+ property.
   * Examples:
   *
   *     this.addEventListener('loaded', function(obj) { alert(obj.type); });
   *     this.fireEvent('loaded', { });
   *     // "loaded"
   *
   *     this.addEventListener('loaded', function(obj) { alert(obj.type); });
   *     this.fireEvent('loaded', {type:'none'});
   *     // "none"
   *
   **/
  fireEvent: function(name, event_object) {
    var listeners = this.getEventListeners(name);
    if (event_object && event_object.type === undefined)
      event_object.type = name;
    for (var i in listeners)
      listeners[i].call(this, event_object);
  },

  /* aliases that will soon deprecate the older names */
  on: function(name, callback) {
    return this.addEventListener(name, callback);
  },

  trigger: function(name, event) {
    return this.fireEvent(name, event);
  }
};
/**
 * class Jax.Framebuffer
 *
 * Used for rendering images off-screen and capturing the result.
 **/

Jax.Framebuffer = (function() {
  function build(context, self) {
    var handle = context.gl.createFramebuffer();
    var width = self.options.width, height = self.options.height;

    self.setHandle(context, handle);
    context.gl.bindFramebuffer(GL_FRAMEBUFFER, handle);
    
    /*
    Depth textures are better handled in Jax.Texture, and have the benefit
    of being able to be used as color components in Jax.Framebuffer. In either
    case, they don't belong here, because the code below will attempt to use
    a depth texture in place of a depth buffer, which is a misunderstanding
    of what a depth texture actually is.

    I'm leaving the code below in place as a comment for future reference,
    for when depth textures are properly implemented as e.g. Jax.DepthTexture.
    This will probably happen circa Jax v3.1.

    if (self.extension = context.gl.getExtension('WEBKIT_WEBGL_depth_texture') ||
                         context.gl.getExtension('MOZ_WEBGL_depth_texture') ||
                         context.gl.getExtension('WEBGL_depth_texture')) {
      if (self.options.depth) {
        self.depthTexture = context.gl.createTexture();
        context.gl.bindTexture(GL_TEXTURE_2D, self.depthTexture);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        context.gl.texImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, self.options.width, self.options.height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, null);
      }
      if (self.options.stencil) {
        self.stencilTexture = context.gl.createTexture();
        context.gl.bindTexture(GL_TEXTURE_2D, self.stencilTexture);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        context.gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        context.gl.texImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, self.options.width, self.options.height, 0, GL_DEPTH_COMPONENT, GL_UNSIGNED_SHORT, null);
      }
    } else {
    */
      // depth and stencil attachment
      if (self.options.depth && self.options.stencil) {
        handle.depthstencilbuffer = context.gl.createRenderbuffer();
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, handle.depthstencilbuffer);
        context.gl.renderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_STENCIL, width, height);
        context.gl.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.depthstencilbuffer);
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    
      // depth attachment
      if (self.options.depth && !self.options.stencil) {
        handle.depthbuffer = context.gl.createRenderbuffer();
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, handle.depthbuffer);
        context.gl.renderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
        context.gl.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, handle.depthbuffer);
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    
      // stencil attachment
      if (self.options.stencil && !self.options.depth) {
        handle.stencilbuffer = context.gl.createRenderbuffer();
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, handle.stencilbuffer);
        context.gl.renderbufferStorage(GL_RENDERBUFFER, GL_STENCIL_INDEX8, width, height);
        context.gl.framebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, handle.stencilbuffer);
        context.gl.bindRenderbuffer(GL_RENDERBUFFER, null);
      }
    // }
    
    // texture attachments
    handle.textures = [];
    var attachment = GL_COLOR_ATTACHMENT0;
    for (var i = 0; i < self.options.colors.length; i++) {
      var format = self.options.colors[i];
      if (self.options.colors[i] instanceof Jax.Texture) {
        handle.textures[i] = self.options.colors[i];
      } else {
        var texture_options = {
          format:GL_RGBA,
          width:width,
          height:height,
          min_filter:self.options.min_filter,
          mag_filter:self.options.mag_filter,
          wrap_s:self.options.wrap_s,
          wrap_t:self.options.wrap_t,
          generate_mipmap:self.options.generate_mipmap,
          data_type: self.options.data_type
        };
        if (typeof(format) != "number") {
          texture_options = Jax.Util.merge(format, texture_options);
        }
        else { texture_options.format = format; }
        handle.textures[i] = new Jax.Texture(texture_options);
      }
      
      if (handle.textures[i].getTarget() == GL_TEXTURE_2D)
        context.gl.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, handle.textures[i].getHandle(context), 0);
      else
        context.gl.framebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_CUBE_MAP_POSITIVE_X,
                handle.textures[i].getHandle(context), 0);
      
      attachment++;
    }
    
    try {
      checkStatus(context, self);
    } catch(e) {
      // build failed, release all objects so user can (maybe) change options and try again
      self.dispose(context);
      throw e;
    }
  }
  
  function checkStatus(context, self) {
    var status = context.gl.checkFramebufferStatus(GL_FRAMEBUFFER);
    self.unbind(context);
    switch(status) {
      case GL_FRAMEBUFFER_COMPLETE:
        // success!
        break;
      case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        throw new Error("Jax.Framebuffer: one or more attachments is incomplete. (GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        throw new Error("Jax.Framebuffer: there are no images attached to the framebuffer. (GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)");
      case GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        throw new Error("Jax.Framebuffer: all attachments must have the same dimensions. (GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS)");
      case GL_FRAMEBUFFER_UNSUPPORTED:
        throw new Error("Jax.Framebuffer: the requested framebuffer layout is unsupported on this hardware. (GL_FRAMEBUFFER_UNSUPPORTED)");
      case (Jax.getGlobal()['GL_FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER'] || 0x8cdb):
        // a cryptic error that is not in the WebGL spec. Took me way too long to figure this out and I'm still not
        // sure why it happens...
        // but it seems to crop up primarily when no textures are attached.
        // from opengl (not webgl) spec: The value of FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE_EXT must not be NONE for any
        // color attachment point(s) named by DRAW_BUFFER.
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
    dispose: function(context) {
      if (!this.handles) return;
      
      var handle = this.getHandle(context);
      if (!handle) return;
      
      // handle.stencilbuffer, handle.depthbuffer, handle.depthstencilbuffer
      if (handle.stencilbuffer) {
        context.gl.deleteRenderbuffer(handle.stencilbuffer);
        delete handle.stencilbuffer;
      }
      if (handle.depthbuffer) {
        context.gl.deleteRenderbuffer(handle.depthbuffer);
        delete handle.depthbuffer;
      }
      if (handle.depthstencilbuffer) {
        context.gl.deleteRenderbuffer(handle.depthstencilbuffer);
        delete handle.depthstencilbuffer;
      }
      
      // texture attachments
      if (handle.textures) {
        while (handle.textures.length > 0) {
          handle.textures[0].dispose(context);
          handle.textures.splice(0, 1);
        }
        delete handle.textures;
      }
      
      // finally, delete the framebuffer itself
      context.gl.deleteFramebuffer(handle);
      this.setHandle(context, null);
    },
    
    /**
     * new Jax.Framebuffer([options])
     * - options (Object): a generic object containing the following optional properties:
     * 
     *   * colors: an array of color formats such as GL_RGBA, GL_RGB, etc. The _colors_ array may
     *             be empty if no color attachments are needed. Defaults to [GL_RGBA] unless _color_
     *             is specified.
     *             
     *             Alternatively, an options object can be used. This object will be passed into
     *             Jax.Texture(). Or, the object may be an actual instance of Jax.Texture, which
     *             will be used directly.
     *             
     *   * color: optionally, in place of a colors array, a single color format as above. If both
     *            _color_ and _colors_ are specified, _color_ is simply added to the _colors_ array.
     *   * depth: true if a depth attachment is required, false otherwise. Defaults to false.
     *   * stencil: true if a stencil attachment is required, false otherwise. Defaults to false.
     *   * width: the width of the render and color buffers. All render and color buffers for a given
     *            framebuffer must have the same width. Defaults to 512.
     *   * height: the height of the render and color buffers. All render and color buffers for a given
     *             framebuffer must have the same height. Defaults to 512.
     *
     * The following options may also be present. If they are, they will be passed into Jax.Texture:
     * 
     *   * data_type: defaults to GL_UNSIGNED_BYTE
     *   * min_filter: defaults to GL_LINEAR
     *   * mag_filter: defaults to GL_LINEAR
     *   * wrap_s: defaults to GL_CLAMP_TO_EDGE
     *   * wrap_t: defaults to GL_CLAMP_TO_EDGE
     *   * generate_mipmap: defaults to false
     *     
     **/
    initialize: function(options) {
      var defaults = {
        depth: false,
        stencil: false,
        width:512,
        height:512,
        data_type: GL_UNSIGNED_BYTE,
        min_filter: GL_LINEAR,
        mag_filter: GL_LINEAR,
        wrap_s: GL_CLAMP_TO_EDGE,
        wrap_t: GL_CLAMP_TO_EDGE,
        generate_mipmap: false
      };
      if (!(options && (options.color || options.colors))) defaults.colors = [GL_RGBA];
      
      this.handles = {};
      this.options = options = Jax.Util.merge(options, defaults);
      if (options.color != undefined) {
        if (options.colors != undefined) options.colors.push(options.color);
        else options.colors = [options.color];
        delete options.color;
      }
    },

    /**
     * Jax.Framebuffer#bindCubeFace(context, texIndex, faceEnum[, callback]) -> Jax.Framebuffer
     * - context (Jax.Context): a Jax context
     * - texIndex (number): the index of the cube map texture
     * - faceEnum (enum): the cube map face to bind
     * - callback (function): an optional callback. If given, the framebuffer will be automatically unbound
     *                        after the callback returns. Otherwise, the framebuffer will remain bound.
     *                        
     * For cube map framebuffers only, this will bind the specified cube map face to its color buffer position.
     * The faceEnum can be any of the following face enums:
     * 
     *     0 or GL_TEXTURE_CUBE_MAP_POSITIVE_X
     *     1 or GL_TEXTURE_CUBE_MAP_NEGATIVE_X
     *     2 or GL_TEXTURE_CUBE_MAP_POSITIVE_Y
     *     3 or GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
     *     4 or GL_TEXTURE_CUBE_MAP_POSITIVE_Z
     *     5 or GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
     * 
     * Example:
     * 
     *     fb.bindCubeFace(context, 0, GL_TEXTURE_CUBE_MAP_POSITIVE_X, function() {
     *       // render to +X cube face
     *     });
     *     fb.bindCubeFace(context, 0, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, function() {
     *       // render to -Z cube face
     *     });
     **/
    bindCubeFace: function(context, texIndex, faceEnum, callback) {
      var texture = this.getTexture(context, texIndex);
      if (texture.options.target != GL_TEXTURE_CUBE_MAP)
        throw new Error("Texture at index "+texIndex+" is not a cube map!");
      
      this.bind(context);
      context.gl.framebufferTexture2D(GL_FRAMEBUFFER, window['GL_COLOR_ATTACHMENT'+texIndex],
              faceEnum, texture.getHandle(context), 0);
      
      if (callback) {
        callback();
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Framebuffer#bind(context[, callback]) -> Jax.Framebuffer
     * - context (Jax.Context): the context to bind this framebuffer to
     * - callback (Function): an optional callback. If given, the framebuffer will
     *                        be automatically unbound after the function returns.
     *
     * If a callback is not specified, the framebuffer will be bound and then returned.
     * Otherwise, the framebuffer will be bound; the callback will be called; then the
     * framebuffer will be automatically unbound prior to returning the framebuffer
     * itself.
     *
     **/
    bind: function(context, callback) {
      this.validate(context);
      context.gl.bindFramebuffer(GL_FRAMEBUFFER, this.getHandle(context));
      
      if (callback) {
        callback.call(this);
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Framebuffer#validate(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to validate this framebuffer for
     * 
     * If this framebuffer's underlying WebGL counterpart has not yet been
     * created, this method will do so. This method may raise errors per the
     * WebGL specification if the framebuffer is not complete or compatible
     * with the client hardware.
     *
     * After successful construction, or if the framebuffer has already been
     * built, this framebuffer is returned.
     **/
    validate: function(context) {
      if (!this.getHandle(context)) build(context, this);
      return this;
    },
    
    /**
     * Jax.Framebuffer#countTextures(context) -> Jax.Framebuffer
     * - context (Jax.Context): a WebGL context
     *
     * Returns the number of textures associated with this framebuffer.
     **/
    countTextures: function(context) {
      return this.validate().getHandle(context).textures.length;
    },
    
    /**
     * Jax.Framebuffer#unbind(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to bind this framebuffer to
     *
     * Unbinds this framebuffer from the specified context. Note that this is
     * unnecessary if Jax.Framebuffer#bind() was called with a callback.
     **/
    unbind: function(context) {            
      context.gl.bindFramebuffer(GL_FRAMEBUFFER, null);
      return this;
    },
    
    /**
     * Jax.Framebuffer#viewport(context) -> Jax.Framebuffer
     * - context (Jax.Context): the context to set the viewport for
     *
     * Sets the viewport up for this framebuffer within the specified context
     * according to the +width+ and +height+ options given for this framebuffer.
     *
     **/
    viewport: function(context) {
      context.gl.viewport(0,0,this.options.width,this.options.height);
      return this;
    },
    
    getDepthTexture: function(context) {
      this.validate(context);
      return this.depthTexture;
    },
    
    getStencilTexture: function(context) {
      this.validate(context);
      return self.stencilTexture;
    },
    
    /**
     * Jax.Framebuffer#getTexture(context[, index]) -> Jax.Texture
     * - context (Jax.Context): the context to retrieve the texture for
     * - index (Number): the numeric index of the texture to retrieve.
     *                   Defaults to 0.
     *
     * Returns the specified instance of Jax.Texture associated with this
     * framebuffer and the specified context. If index is not given, the
     * first texture available is returned.
     **/
    getTexture: function(context, index) {
      this.validate(context);
      return this.getHandle(context).textures[index || 0];
    },
    
    /**
     * Jax.Framebuffer#getTextureHandle(context[, index]) -> WebGLTexture
     * - context (Jax.Context): the context to retrieve the texture handle for
     * - index (Number): the numeric index of the texture handle to retrieve.
     *                   Defaults to 0.
     *
     * Returns the WebGL texture handle associated with this
     * framebuffer and the specified context. If index is not given, the
     * first texture available is returned.
     *
     * This is equivalent to:
     * 
     *     framebuffer.getTexture(context, index).getHandle(context);
     *
     **/
    getTextureHandle: function(context, index) {
      return this.getTexture(context, index).getHandle(context);
    },
    
    /**
     * Jax.Framebuffer#getHandle(context) -> WebGLFramebuffer | undefined
     * - context (Jax.Context): the context the requested framebuffer handle is associated with
     * 
     * Returns the WebGLFramebuffer handle associated with the specified context.
     **/
    getHandle: function(context) { return this.handles[context.id]; },
    
    /**
     * Jax.Framebuffer#getHandle(context, handle) -> Jax.Framebuffer
     * - context (Jax.Context): the context the requested framebuffer handle is associated with
     * - handle (WebGLFramebuffer): the WebGL framebuffer handle to use for the specified context
     * 
     * Assigns the specified handle to be used for the given context. This is a permanent
     * assignment unless this method is called again.
     *
     * Returns this instance of Jax.Framebuffer.
     **/
    setHandle: function(context, handle) {
      if (handle)
        this.handles[context.id] = handle;
      else if (this.handles[context.id])
        delete this.handles[context.id];
      return this;
    }
  });
})();
(function() {
  var _global;

  _global = Jax.getGlobal();

  _global.GL_DEPTH_BUFFER_BIT = 0x00000100;

  _global.GL_STENCIL_BUFFER_BIT = 0x00000400;

  _global.GL_COLOR_BUFFER_BIT = 0x00004000;

  _global.GL_POINTS = 0x0000;

  _global.GL_LINES = 0x0001;

  _global.GL_LINE_LOOP = 0x0002;

  _global.GL_LINE_STRIP = 0x0003;

  _global.GL_TRIANGLES = 0x0004;

  _global.GL_TRIANGLE_STRIP = 0x0005;

  _global.GL_TRIANGLE_FAN = 0x0006;

  _global.GL_ZERO = 0;

  _global.GL_ONE = 1;

  _global.GL_SRC_COLOR = 0x0300;

  _global.GL_ONE_MINUS_SRC_COLOR = 0x0301;

  _global.GL_SRC_ALPHA = 0x0302;

  _global.GL_ONE_MINUS_SRC_ALPHA = 0x0303;

  _global.GL_DST_ALPHA = 0x0304;

  _global.GL_ONE_MINUS_DST_ALPHA = 0x0305;

  _global.GL_DST_COLOR = 0x0306;

  _global.GL_ONE_MINUS_DST_COLOR = 0x0307;

  _global.GL_SRC_ALPHA_SATURATE = 0x0308;

  _global.GL_FUNC_ADD = 0x8006;

  _global.GL_BLEND_EQUATION = 0x8009;

  _global.GL_BLEND_EQUATION_RGB = 0x8009;

  _global.GL_BLEND_EQUATION_ALPHA = 0x883D;

  _global.GL_FUNC_SUBTRACT = 0x800A;

  _global.GL_FUNC_REVERSE_SUBTRACT = 0x800B;

  _global.GL_BLEND_DST_RGB = 0x80C8;

  _global.GL_BLEND_SRC_RGB = 0x80C9;

  _global.GL_BLEND_DST_ALPHA = 0x80CA;

  _global.GL_BLEND_SRC_ALPHA = 0x80CB;

  _global.GL_CONSTANT_COLOR = 0x8001;

  _global.GL_ONE_MINUS_CONSTANT_COLOR = 0x8002;

  _global.GL_CONSTANT_ALPHA = 0x8003;

  _global.GL_ONE_MINUS_CONSTANT_ALPHA = 0x8004;

  _global.GL_BLEND_COLOR = 0x8005;

  _global.GL_ARRAY_BUFFER = 0x8892;

  _global.GL_ELEMENT_ARRAY_BUFFER = 0x8893;

  _global.GL_ARRAY_BUFFER_BINDING = 0x8894;

  _global.GL_ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;

  _global.GL_STREAM_DRAW = 0x88E0;

  _global.GL_STATIC_DRAW = 0x88E4;

  _global.GL_DYNAMIC_DRAW = 0x88E8;

  _global.GL_BUFFER_SIZE = 0x8764;

  _global.GL_BUFFER_USAGE = 0x8765;

  _global.GL_CURRENT_VERTEX_ATTRIB = 0x8626;

  _global.GL_FRONT = 0x0404;

  _global.GL_BACK = 0x0405;

  _global.GL_FRONT_AND_BACK = 0x0408;

  _global.GL_CULL_FACE = 0x0B44;

  _global.GL_BLEND = 0x0BE2;

  _global.GL_DITHER = 0x0BD0;

  _global.GL_STENCIL_TEST = 0x0B90;

  _global.GL_DEPTH_TEST = 0x0B71;

  _global.GL_SCISSOR_TEST = 0x0C11;

  _global.GL_POLYGON_OFFSET_FILL = 0x8037;

  _global.GL_SAMPLE_ALPHA_TO_COVERAGE = 0x809E;

  _global.GL_SAMPLE_COVERAGE = 0x80A0;

  _global.GL_NO_ERROR = 0;

  _global.GL_INVALID_ENUM = 0x0500;

  _global.GL_INVALID_VALUE = 0x0501;

  _global.GL_INVALID_OPERATION = 0x0502;

  _global.GL_OUT_OF_MEMORY = 0x0505;

  _global.GL_CW = 0x0900;

  _global.GL_CCW = 0x0901;

  _global.GL_LINE_WIDTH = 0x0B21;

  _global.GL_ALIASED_POINT_SIZE_RANGE = 0x846D;

  _global.GL_ALIASED_LINE_WIDTH_RANGE = 0x846E;

  _global.GL_CULL_FACE_MODE = 0x0B45;

  _global.GL_FRONT_FACE = 0x0B46;

  _global.GL_DEPTH_RANGE = 0x0B70;

  _global.GL_DEPTH_WRITEMASK = 0x0B72;

  _global.GL_DEPTH_CLEAR_VALUE = 0x0B73;

  _global.GL_DEPTH_FUNC = 0x0B74;

  _global.GL_STENCIL_CLEAR_VALUE = 0x0B91;

  _global.GL_STENCIL_FUNC = 0x0B92;

  _global.GL_STENCIL_FAIL = 0x0B94;

  _global.GL_STENCIL_PASS_DEPTH_FAIL = 0x0B95;

  _global.GL_STENCIL_PASS_DEPTH_PASS = 0x0B96;

  _global.GL_STENCIL_REF = 0x0B97;

  _global.GL_STENCIL_VALUE_MASK = 0x0B93;

  _global.GL_STENCIL_WRITEMASK = 0x0B98;

  _global.GL_STENCIL_BACK_FUNC = 0x8800;

  _global.GL_STENCIL_BACK_FAIL = 0x8801;

  _global.GL_STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;

  _global.GL_STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;

  _global.GL_STENCIL_BACK_REF = 0x8CA3;

  _global.GL_STENCIL_BACK_VALUE_MASK = 0x8CA4;

  _global.GL_STENCIL_BACK_WRITEMASK = 0x8CA5;

  _global.GL_VIEWPORT = 0x0BA2;

  _global.GL_SCISSOR_BOX = 0x0C10;

  _global.GL_COLOR_CLEAR_VALUE = 0x0C22;

  _global.GL_COLOR_WRITEMASK = 0x0C23;

  _global.GL_UNPACK_ALIGNMENT = 0x0CF5;

  _global.GL_PACK_ALIGNMENT = 0x0D05;

  _global.GL_MAX_TEXTURE_SIZE = 0x0D33;

  _global.GL_MAX_VIEWPORT_DIMS = 0x0D3A;

  _global.GL_SUBPIXEL_BITS = 0x0D50;

  _global.GL_RED_BITS = 0x0D52;

  _global.GL_GREEN_BITS = 0x0D53;

  _global.GL_BLUE_BITS = 0x0D54;

  _global.GL_ALPHA_BITS = 0x0D55;

  _global.GL_DEPTH_BITS = 0x0D56;

  _global.GL_STENCIL_BITS = 0x0D57;

  _global.GL_POLYGON_OFFSET_UNITS = 0x2A00;

  _global.GL_POLYGON_OFFSET_FACTOR = 0x8038;

  _global.GL_TEXTURE_BINDING_2D = 0x8069;

  _global.GL_SAMPLE_BUFFERS = 0x80A8;

  _global.GL_SAMPLES = 0x80A9;

  _global.GL_SAMPLE_COVERAGE_VALUE = 0x80AA;

  _global.GL_SAMPLE_COVERAGE_INVERT = 0x80AB;

  _global.GL_COMPRESSED_TEXTURE_FORMATS = 0x86A3;

  _global.GL_DONT_CARE = 0x1100;

  _global.GL_FASTEST = 0x1101;

  _global.GL_NICEST = 0x1102;

  _global.GL_GENERATE_MIPMAP_HINT = 0x8192;

  _global.GL_BYTE = 0x1400;

  _global.GL_UNSIGNED_BYTE = 0x1401;

  _global.GL_SHORT = 0x1402;

  _global.GL_UNSIGNED_SHORT = 0x1403;

  _global.GL_INT = 0x1404;

  _global.GL_UNSIGNED_INT = 0x1405;

  _global.GL_FLOAT = 0x1406;

  _global.GL_DEPTH_COMPONENT = 0x1902;

  _global.GL_ALPHA = 0x1906;

  _global.GL_RGB = 0x1907;

  _global.GL_RGBA = 0x1908;

  _global.GL_LUMINANCE = 0x1909;

  _global.GL_LUMINANCE_ALPHA = 0x190A;

  _global.GL_UNSIGNED_SHORT_4_4_4_4 = 0x8033;

  _global.GL_UNSIGNED_SHORT_5_5_5_1 = 0x8034;

  _global.GL_UNSIGNED_SHORT_5_6_5 = 0x8363;

  _global.GL_FRAGMENT_SHADER = 0x8B30;

  _global.GL_VERTEX_SHADER = 0x8B31;

  _global.GL_MAX_VERTEX_ATTRIBS = 0x8869;

  _global.GL_MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;

  _global.GL_MAX_VARYING_VECTORS = 0x8DFC;

  _global.GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;

  _global.GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;

  _global.GL_MAX_TEXTURE_IMAGE_UNITS = 0x8872;

  _global.GL_MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;

  _global.GL_SHADER_TYPE = 0x8B4F;

  _global.GL_DELETE_STATUS = 0x8B80;

  _global.GL_LINK_STATUS = 0x8B82;

  _global.GL_VALIDATE_STATUS = 0x8B83;

  _global.GL_ATTACHED_SHADERS = 0x8B85;

  _global.GL_ACTIVE_UNIFORMS = 0x8B86;

  _global.GL_ACTIVE_ATTRIBUTES = 0x8B89;

  _global.GL_SHADING_LANGUAGE_VERSION = 0x8B8C;

  _global.GL_CURRENT_PROGRAM = 0x8B8D;

  _global.GL_NEVER = 0x0200;

  _global.GL_LESS = 0x0201;

  _global.GL_EQUAL = 0x0202;

  _global.GL_LEQUAL = 0x0203;

  _global.GL_GREATER = 0x0204;

  _global.GL_NOTEQUAL = 0x0205;

  _global.GL_GEQUAL = 0x0206;

  _global.GL_ALWAYS = 0x0207;

  _global.GL_KEEP = 0x1E00;

  _global.GL_REPLACE = 0x1E01;

  _global.GL_INCR = 0x1E02;

  _global.GL_DECR = 0x1E03;

  _global.GL_INVERT = 0x150A;

  _global.GL_INCR_WRAP = 0x8507;

  _global.GL_DECR_WRAP = 0x8508;

  _global.GL_VENDOR = 0x1F00;

  _global.GL_RENDERER = 0x1F01;

  _global.GL_VERSION = 0x1F02;

  _global.GL_NEAREST = 0x2600;

  _global.GL_LINEAR = 0x2601;

  _global.GL_NEAREST_MIPMAP_NEAREST = 0x2700;

  _global.GL_LINEAR_MIPMAP_NEAREST = 0x2701;

  _global.GL_NEAREST_MIPMAP_LINEAR = 0x2702;

  _global.GL_LINEAR_MIPMAP_LINEAR = 0x2703;

  _global.GL_TEXTURE_MAG_FILTER = 0x2800;

  _global.GL_TEXTURE_MIN_FILTER = 0x2801;

  _global.GL_TEXTURE_WRAP_S = 0x2802;

  _global.GL_TEXTURE_WRAP_T = 0x2803;

  _global.GL_TEXTURE_2D = 0x0DE1;

  _global.GL_TEXTURE = 0x1702;

  _global.GL_TEXTURE_CUBE_MAP = 0x8513;

  _global.GL_TEXTURE_BINDING_CUBE_MAP = 0x8514;

  _global.GL_TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;

  _global.GL_TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;

  _global.GL_TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;

  _global.GL_TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;

  _global.GL_TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;

  _global.GL_TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;

  _global.GL_MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;

  _global.GL_TEXTURE0 = 0x84C0;

  _global.GL_TEXTURE1 = 0x84C1;

  _global.GL_TEXTURE2 = 0x84C2;

  _global.GL_TEXTURE3 = 0x84C3;

  _global.GL_TEXTURE4 = 0x84C4;

  _global.GL_TEXTURE5 = 0x84C5;

  _global.GL_TEXTURE6 = 0x84C6;

  _global.GL_TEXTURE7 = 0x84C7;

  _global.GL_TEXTURE8 = 0x84C8;

  _global.GL_TEXTURE9 = 0x84C9;

  _global.GL_TEXTURE10 = 0x84CA;

  _global.GL_TEXTURE11 = 0x84CB;

  _global.GL_TEXTURE12 = 0x84CC;

  _global.GL_TEXTURE13 = 0x84CD;

  _global.GL_TEXTURE14 = 0x84CE;

  _global.GL_TEXTURE15 = 0x84CF;

  _global.GL_TEXTURE16 = 0x84D0;

  _global.GL_TEXTURE17 = 0x84D1;

  _global.GL_TEXTURE18 = 0x84D2;

  _global.GL_TEXTURE19 = 0x84D3;

  _global.GL_TEXTURE20 = 0x84D4;

  _global.GL_TEXTURE21 = 0x84D5;

  _global.GL_TEXTURE22 = 0x84D6;

  _global.GL_TEXTURE23 = 0x84D7;

  _global.GL_TEXTURE24 = 0x84D8;

  _global.GL_TEXTURE25 = 0x84D9;

  _global.GL_TEXTURE26 = 0x84DA;

  _global.GL_TEXTURE27 = 0x84DB;

  _global.GL_TEXTURE28 = 0x84DC;

  _global.GL_TEXTURE29 = 0x84DD;

  _global.GL_TEXTURE30 = 0x84DE;

  _global.GL_TEXTURE31 = 0x84DF;

  _global.GL_ACTIVE_TEXTURE = 0x84E0;

  _global.GL_REPEAT = 0x2901;

  _global.GL_CLAMP_TO_EDGE = 0x812F;

  _global.GL_MIRRORED_REPEAT = 0x8370;

  _global.GL_FLOAT_VEC2 = 0x8B50;

  _global.GL_FLOAT_VEC3 = 0x8B51;

  _global.GL_FLOAT_VEC4 = 0x8B52;

  _global.GL_INT_VEC2 = 0x8B53;

  _global.GL_INT_VEC3 = 0x8B54;

  _global.GL_INT_VEC4 = 0x8B55;

  _global.GL_BOOL = 0x8B56;

  _global.GL_BOOL_VEC2 = 0x8B57;

  _global.GL_BOOL_VEC3 = 0x8B58;

  _global.GL_BOOL_VEC4 = 0x8B59;

  _global.GL_FLOAT_MAT2 = 0x8B5A;

  _global.GL_FLOAT_MAT3 = 0x8B5B;

  _global.GL_FLOAT_MAT4 = 0x8B5C;

  _global.GL_SAMPLER_2D = 0x8B5E;

  _global.GL_SAMPLER_CUBE = 0x8B60;

  _global.GL_VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;

  _global.GL_VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;

  _global.GL_VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;

  _global.GL_VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;

  _global.GL_VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;

  _global.GL_VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;

  _global.GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

  _global.GL_COMPILE_STATUS = 0x8B81;

  _global.GL_LOW_FLOAT = 0x8DF0;

  _global.GL_MEDIUM_FLOAT = 0x8DF1;

  _global.GL_HIGH_FLOAT = 0x8DF2;

  _global.GL_LOW_INT = 0x8DF3;

  _global.GL_MEDIUM_INT = 0x8DF4;

  _global.GL_HIGH_INT = 0x8DF5;

  _global.GL_FRAMEBUFFER = 0x8D40;

  _global.GL_RENDERBUFFER = 0x8D41;

  _global.GL_RGBA4 = 0x8056;

  _global.GL_RGB5_A1 = 0x8057;

  _global.GL_RGB565 = 0x8D62;

  _global.GL_DEPTH_COMPONENT16 = 0x81A5;

  _global.GL_STENCIL_INDEX = 0x1901;

  _global.GL_STENCIL_INDEX8 = 0x8D48;

  _global.GL_DEPTH_STENCIL = 0x84F9;

  _global.GL_RENDERBUFFER_WIDTH = 0x8D42;

  _global.GL_RENDERBUFFER_HEIGHT = 0x8D43;

  _global.GL_RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;

  _global.GL_RENDERBUFFER_RED_SIZE = 0x8D50;

  _global.GL_RENDERBUFFER_GREEN_SIZE = 0x8D51;

  _global.GL_RENDERBUFFER_BLUE_SIZE = 0x8D52;

  _global.GL_RENDERBUFFER_ALPHA_SIZE = 0x8D53;

  _global.GL_RENDERBUFFER_DEPTH_SIZE = 0x8D54;

  _global.GL_RENDERBUFFER_STENCIL_SIZE = 0x8D55;

  _global.GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;

  _global.GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;

  _global.GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;

  _global.GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

  _global.GL_COLOR_ATTACHMENT0 = 0x8CE0;

  _global.GL_DEPTH_ATTACHMENT = 0x8D00;

  _global.GL_STENCIL_ATTACHMENT = 0x8D20;

  _global.GL_DEPTH_STENCIL_ATTACHMENT = 0x821A;

  _global.GL_NONE = 0;

  _global.GL_FRAMEBUFFER_COMPLETE = 0x8CD5;

  _global.GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;

  _global.GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;

  _global.GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;

  _global.GL_FRAMEBUFFER_UNSUPPORTED = 0x8CDD;

  _global.GL_FRAMEBUFFER_BINDING = 0x8CA6;

  _global.GL_RENDERBUFFER_BINDING = 0x8CA7;

  _global.GL_MAX_RENDERBUFFER_SIZE = 0x84E8;

  _global.GL_INVALID_FRAMEBUFFER_OPERATION = 0x0506;

  _global.GL_UNPACK_FLIP_Y_WEBGL = 0x9240;

  _global.GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;

  _global.GL_CONTEXT_LOST_WEBGL = 0x9242;

  _global.GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;

  _global.GL_BROWSER_DEFAULT_WEBGL = 0x9244;

}).call(this);
/**
 * class Jax.Helper
 *
 * Jax Helpers are glorified mixins. They contain a set of methods which can then be
 * included into any Jax class.
 *
 * Defining a helper is easy, and looks a bit like this:
 *
 *     var HelloHelper = Jax.Helper.create({
 *       sayHi: function(name) { alert("Hello, "+name+"!"); }
 *     });
 *
 * Once defined, using helpers is particularly simple. In any Jax class, simply define
 * a +helpers+ function that returns an array of helpers:
 *
 *     var Liaison = Jax.Class.create({
 *       helpers: function() { return [HelloHelper]; }
 *     });
 *
 * Now the +Liaison+ class will include the +sayHi+ method which can be called just like
 * any other method:
 *
 *     var l = new Liaison();
 *     l.sayHi("World");
 *     //=> Hello, World!
 *
 *
 * As of Jax v1.1.0, you may also set the array of helpers directly on the +helpers+ property
 * of a class, instead of defining a function. The following example is functionally
 * equivalent to the above:
 *
 *     var Liaison = Jax.Class.create({
 *       helpers: [HelloHelper]
 *     });
 *
 **/

Jax.Helper = {
  instances: [],

  create: function(methods) {
    Jax.Helper.instances.push(methods);
    return methods;
  }
};
/**
 * Math.EPSILON = 0.00001
 * This is a very small number, used for testing fuzzy equality with floats due to
 * floating point imprecision.
 **/

Math.EPSILON = Math.EPSILON || 0.00001;

/**
 * Math.TAU = 6.283185307179586
 * The (approximated) circumference of a circle of radius 1
 * PI is WRONG -- http://tauday.com
 * PI = TAU / 2
 *
 * @type {Number}
 */
Math.TAU = Math.TAU || 6.283185307179586;

/**
 * Math
 * Defines math-related helper functions.
 **/

/**
 * Math.radToDeg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.radToDeg = Math.radToDeg || function(rad) {
  return rad * 360.0 / Math.TAU;
};

/** alias of: Math.radToDeg
 * Math.rad2deg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.rad2deg = Math.rad2deg || Math.radToDeg;

/**
 * Math.degToRad(deg) -> Number
 * Helper to convert degrees to radians.
 **/
Math.degToRad = Math.degToRad || function(deg) {
  return deg * Math.TAU / 360.0;
};

/** alias of: Math.degToRad
 * Math.deg2rad(deg) -> Number
 * Helper to convert degrees to radians.
 **/
Math.deg2rad = Math.deg2rad || Math.degToRad;

/**
 * Math.equalish(a, b) -> Boolean
 * Arguments can be either scalar or vector, but must be of the same type.
 * Returns true if the arguments are "equal enough" after accounting for floating-point
 * precision loss. Returns false otherwise.
 *
 * Also returns false if any element of either vector is undefined.
 **/
Math.equalish = Math.equalish || function(a, b) {
  var ta = typeof(a), tb = typeof(b);
  if (ta === 'number' && tb === 'number')
    return Math.abs(a - b) <= Math.EPSILON;

  if (ta !== tb) return false;
  if (ta.length !== tb.length) return false;
  
  for (var i = 0; i < a.length; i++)
    if (a[i] === undefined || b[i] === undefined ||
        isNaN(a[i]) !== isNaN(b[i]) ||
        isFinite(a[i]) !== isFinite(b[i]) ||
        Math.abs(a[i] - b[i]) > Math.EPSILON)
      return false;
  return true;
};

/**
 * Math.sign(x) -> -1, 0 or 1
 * Returns x normalized in ℝ
 * todo: work with epsilon, using a second parameter +tolerance+, defaulted to true
 * @param {Number} x
 * @return {-1|0|1}
 */
Math.sign = Math.sign || function (x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};
/*
A matrix stack, obviously. Every Jax.Context allocates its own matrix stack,
so you probably shouldn't have to instantiate this directly.

Note that for performance reasons, whenever you call get[Some]Matrix(), the
matrix instance itself is returned instead of a copy of the instance.
Although this gives you the technical power to make changes directly to the
returned matrix, that would be a Bad Idea (TM) because matrices that depend
upon the one you just modified will be unaware of the changes, and this will
make the other matrices inaccurate.

For example, it would be very easy to use mat4.multiply() to change the Model
matrix. In doing so, the ModelView matrix would no longer be accurate. This
could lead to very difficult-to-debug situations.

It is _strongly_ recommended to use the various matrix methods found in
Jax.MatrixStack to modify the matrices here. This will keep all related
matrices up-to-date, and it doesn't cost anything in terms of performance
because the corresponding calculations are performed lazily, rather than
eagerly.
*/


(function() {
  Jax.MatrixStack = (function() {
    var TYPES;

    TYPES = ['model', 'view', 'projection', 'inverseModel', 'inverseView', 'inverseProjection', 'normal', 'viewNormal', 'modelNormal', 'inverseViewNormal', 'modelView', 'modelViewProjection', 'inverseModelView'];

    function MatrixStack() {
      this.maxDepth = 0;
      this.valid = {
        inverseModel: [true],
        normal: [true],
        inverseView: [true],
        viewNormal: [true],
        modelNormal: [true],
        inverseViewNormal: [true],
        modelView: [true],
        inverseModelView: [true],
        inverseProjection: [true],
        modelViewProjection: [true]
      };
      this.matrices = {
        model: [mat4.identity(mat4.create())],
        inverseModel: [mat4.identity(mat4.create())],
        normal: [mat3.identity(mat3.create())],
        modelNormal: [mat3.identity(mat3.create())],
        view: [mat4.identity(mat4.create())],
        inverseView: [mat4.identity(mat4.create())],
        viewNormal: [mat3.identity(mat3.create())],
        inverseViewNormal: [mat3.identity(mat3.create())],
        modelView: [mat4.identity(mat4.create())],
        inverseModelView: [mat4.identity(mat4.create())],
        projection: [mat4.identity(mat4.create())],
        inverseProjection: [mat4.identity(mat4.create())],
        modelViewProjection: [mat4.identity(mat4.create())]
      };
      this.reset();
    }

    /*
    Resets the stack depth to zero, effectively undoing all calls to #push().
    */


    MatrixStack.prototype.reset = function() {
      return this.depth = 0;
    };

    /*
    Saves the state of all current matrices, so that further operations won't affect them directly.
    If another set of matrices already exist, they are used; otherwise, a new set is allocated.
    After a set of matrices has been secured, all current values are copied into the set.
    
    See also Jax.MatrixStack#pop()
    */


    MatrixStack.prototype.push = function() {
      var stack, type, _ref, _ref1;

      this.depth++;
      if (this.depth > this.maxDepth) {
        _ref = this.matrices;
        for (type in _ref) {
          stack = _ref[type];
          while (stack.length <= this.depth) {
            stack.push(new Float32Array(stack[stack.length - 1]));
          }
        }
        _ref1 = this.valid;
        for (type in _ref1) {
          stack = _ref1[type];
          while (stack.length <= this.depth) {
            stack.push(stack[stack.length - 1]);
          }
        }
        this.maxDepth = this.depth;
      }
      this.loadModelMatrix(this.matrices.model[this.depth - 1]);
      this.loadViewMatrix(this.matrices.view[this.depth - 1]);
      this.loadProjectionMatrix(this.matrices.projection[this.depth - 1]);
      return true;
    };

    /*
    Reverts back to an earlier matrix stack, effectively undoing any changes that have been made
    since the most recent call to Jax.MatrixStack#push().
    *
    See also Jax.MatrixStack#push()
    */


    MatrixStack.prototype.pop = function() {
      if (this.depth > 0) {
        return this.depth--;
      }
    };

    /*
    Replaces the current model matrix with the specified one.
    Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the
    normal matrix.
    */


    MatrixStack.prototype.loadModelMatrix = function(other) {
      this.valid.inverseModel[this.depth] = false;
      this.valid.normal[this.depth] = false;
      this.valid.modelNormal[this.depth] = false;
      this.valid.modelView[this.depth] = false;
      this.valid.inverseModelView[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.copy(this.getModelMatrix(), other);
    };

    /*
    Replaces the current view matrix with the specified one.
    Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the
    normal matrix.
    */


    MatrixStack.prototype.loadViewMatrix = function(other) {
      this.valid.inverseView[this.depth] = false;
      this.valid.viewNormal[this.depth] = false;
      this.valid.inverseViewNormal[this.depth] = false;
      this.valid.modelView[this.depth] = false;
      this.valid.inverseModelView[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.copy(this.getViewMatrix(), other);
    };

    /*
    Replaces the current projection matrix with the specified one.
    Updates the inverse projection matrix.
    */


    MatrixStack.prototype.loadProjectionMatrix = function(other) {
      this.valid.inverseProjection[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.copy(this.getProjectionMatrix(), other);
    };

    /*
    Multiplies the current model matrix with the specified one.
    Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the
    normal matrix.
    */


    MatrixStack.prototype.multModelMatrix = function(other) {
      this.valid.inverseModel[this.depth] = false;
      this.valid.normal[this.depth] = false;
      this.valid.modelNormal[this.depth] = false;
      this.valid.modelView[this.depth] = false;
      this.valid.inverseModelView[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.multiply(this.getModelMatrix(), this.getModelMatrix(), other);
    };

    /*
    Multiplies the current view matrix with the specified one.
    Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the
    normal matrix.
    */


    MatrixStack.prototype.multViewMatrix = function(other) {
      this.valid.inverseView[this.depth] = false;
      this.valid.viewNormal[this.depth] = false;
      this.valid.inverseViewNormal[this.depth] = false;
      this.valid.modelView[this.depth] = false;
      this.valid.inverseModelView[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.multiply(this.getViewMatrix(), this.getViewMatrix(), other);
    };

    /*
    Multiplies the current projection matrix with the specified one.
    Updates the inverse projection matrix.
    */


    MatrixStack.prototype.multProjectionMatrix = function(other) {
      this.valid.inverseProjection[this.depth] = false;
      this.valid.modelViewProjection[this.depth] = false;
      return mat4.multiply(this.getProjectionMatrix(), this.getProjectionMatrix(), other);
    };

    /*
    The local model transformation matrix. Most models will manipulate this matrix.
    Multiplying an object-space coordinate by this matrix will result in a world-space coordinate.
    */


    MatrixStack.prototype.getModelMatrix = function() {
      return this.matrices.model[this.depth];
    };

    /*
    AKA the camera matrix. Multiplying a point in world space against the view matrix
    results in a point in eye space (e.g. relative to the eye, with the eye at the origin).
    */


    MatrixStack.prototype.getViewMatrix = function() {
      return this.matrices.view[this.depth];
    };

    /*
    AKA the screen matrix. Multiplying a point in eye space against the projection matrix results in a 4D
    vector in clip space. Dividing clip coordinates (XYZ) by the 4th component (W) yields a 3D vector in
    normalized device coordinates, where all components are in the range [-1,1]. These points are ultimately
    multiplied by screen dimensions to find a pixel position.
    */


    MatrixStack.prototype.getProjectionMatrix = function() {
      return this.matrices.projection[this.depth];
    };

    /*
    A combination of both model and view
    matrices, equivalent to mat4.multiply(view, model).
    
    Multiplying a point in object space by this matrix will effectively skip the world space transformation,
    resulting in a coordinate placed directly into eye space. This has the obvious advantage of being faster
    than performing the operation in two steps (model and then view).
    */


    MatrixStack.prototype.getModelViewMatrix = function() {
      if (this.valid.modelView[this.depth]) {
        return this.matrices.modelView[this.depth];
      } else {
        this.valid.modelView[this.depth] = true;
        return mat4.multiply(this.matrices.modelView[this.depth], this.getViewMatrix(), this.getModelMatrix());
      }
    };

    /*
    The opposite of the modelview matrix. Multiplying an eye-space coordinate by this matrix results in an
    object-space coordinate.
    */


    MatrixStack.prototype.getInverseModelViewMatrix = function() {
      if (this.valid.inverseModelView[this.depth]) {
        return this.matrices.inverseModelView[this.depth];
      } else {
        this.valid.inverseModelView[this.depth] = true;
        return mat4.invert(this.matrices.inverseModelView[this.depth], this.getModelViewMatrix());
      }
    };

    /*
    Returns the model, view and projection matrices combined into one. Multiplying a point in
    object space by this matrix results in a point in clip space. This is the fastest way to
    produce 3D graphics and is the best candidate if you don't care about the intermediate spaces.
    */


    MatrixStack.prototype.getModelViewProjectionMatrix = function() {
      if (this.valid.modelViewProjection[this.depth]) {
        return this.matrices.modelViewProjection[this.depth];
      } else {
        this.valid.modelViewProjection[this.depth] = true;
        return mat4.multiply(this.matrices.modelViewProjection[this.depth], this.getProjectionMatrix(), this.getModelViewMatrix());
      }
    };

    /*
    The inverse transpose of the modelview matrix. See
      http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
    for a good writeup of where and how this matrix is useful. Multiplying a 3D
    _directional_ (not _positional_) vector against this matrix will result in a
    3D _directional_ vector in eye space.
    */


    MatrixStack.prototype.getNormalMatrix = function() {
      if (this.valid.normal[this.depth]) {
        return this.matrices.normal[this.depth];
      } else {
        this.valid.normal[this.depth] = true;
        return mat3.normalFromMat4(this.matrices.normal[this.depth], this.getModelViewMatrix());
      }
    };

    /*
    A 3x3 normal matrix. When a directional vector in world space is multiplied by
    this matrix, the result is a directional vector in eye (camera) space.
    */


    MatrixStack.prototype.getViewNormalMatrix = function() {
      if (this.valid.viewNormal[this.depth]) {
        return this.matrices.viewNormal[this.depth];
      } else {
        this.valid.viewNormal[this.depth] = true;
        return mat3.normalFromMat4(this.matrices.viewNormal[this.depth], this.getViewMatrix());
      }
    };

    /*
    The opposite of the view matrix. Multiplying a point in eye space against this matrix
    will result in a point in world space.
    */


    MatrixStack.prototype.getInverseViewNormalMatrix = function() {
      if (this.valid.inverseViewNormal[this.depth]) {
        return this.matrices.inverseViewNormal[this.depth];
      } else {
        this.valid.inverseViewNormal[this.depth] = true;
        return mat3.normalFromMat4(this.matrices.inverseViewNormal[this.depth], this.getInverseViewMatrix());
      }
    };

    /*
    A 3x3 normal matrix. When a directional vector in object space is multiplied
    by this matrix, the result is a directional vector in world space.
    */


    MatrixStack.prototype.getModelNormalMatrix = function() {
      if (this.valid.modelNormal[this.depth]) {
        return this.matrices.modelNormal[this.depth];
      } else {
        this.valid.modelNormal[this.depth] = true;
        return mat3.normalFromMat4(this.matrices.modelNormal[this.depth], this.getModelMatrix());
      }
    };

    /*
    The opposite of the local model transformation matrix. Multiplying a point
    in world space against this matrix will result in an object relative to the
    current object space.
    */


    MatrixStack.prototype.getInverseModelMatrix = function() {
      if (this.valid.inverseModel[this.depth]) {
        return this.matrices.inverseModel[this.depth];
      } else {
        this.valid.inverseModel[this.depth] = true;
        return mat4.invert(this.matrices.inverseModel[this.depth], this.getModelMatrix());
      }
    };

    /*
    The opposite of the view matrix. Multiplying a point in eye space by this
    matrix will result in a point in world space.
    */


    MatrixStack.prototype.getInverseViewMatrix = function() {
      if (this.valid.inverseView[this.depth]) {
        return this.matrices.inverseView[this.depth];
      } else {
        this.valid.inverseView[this.depth] = true;
        return mat4.invert(this.matrices.inverseView[this.depth], this.getViewMatrix());
      }
    };

    /*
    The opposite of the projection matrix. Multiplying a 4D vector in normalized device coordinates by
    its 4th component will result in clip space coordinates. Multiplying these clip space coordinates by the
    inverse projection matrix will result in a point in eye space, relative to the camera.
    */


    MatrixStack.prototype.getInverseProjectionMatrix = function() {
      if (this.valid.inverseProjection[this.depth]) {
        return this.matrices.inverseProjection[this.depth];
      } else {
        this.valid.inverseProjection[this.depth] = true;
        return mat4.invert(this.matrices.inverseProjection[this.depth], this.getProjectionMatrix());
      }
    };

    return MatrixStack;

  })();

}).call(this);
Jax.NORMAL_MAP = 1;

/**
 * class Jax.Texture
 * Creates a managed WebGL texture.
 **/
Jax.Texture = (function() {
  var _canvas = document.createElement('canvas');

  function imageFailed(self, image) {
    throw new Error("Texture image '"+self.image.src+"' failed to load!");
  }
  
  function isPoT(s) {
    return s && (s & -s) == s;
  }
  
  function imageLoaded(self, isImageArray, img) {
    var onload = self.options.onload || self.onload;
    
    if (!isPoT(img.width) || !isPoT(img.height)) {
      self.options.mag_filter = GL_LINEAR;
      self.options.min_filter = GL_LINEAR;
      self.options.wrap_s = GL_CLAMP_TO_EDGE;
      self.options.wrap_t = GL_CLAMP_TO_EDGE;
      self.options.generate_mipmap = false;
    }

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
    self.handles[context.id] = context.gl.createTexture();
  }
  
  function generateTexture(context, self) {
    var data_type = self.options.data_type, format = self.options.format, target = self.options.target;
    if (self.image) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.gl.texImage2D(target, 0, format, format, data_type, self.image);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.image);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.image);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else if (self.images) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.gl.texImage2D(target, 0, format, format, data_type, self.images[0]);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_X] || self.images[0]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] || self.images[1]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] || self.images[2]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] || self.images[3]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] || self.images[4]);
          context.gl.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] || self.images[5]);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else {
      // no images at all -- load the texture with empty data; it's probably for a framebuffer
      var width = self.options.width, height = self.options.height;
      if (!width || !height) throw new Error("Can't build an empty texture without at least a width and height");
      
      function ti2d(glEnum) {
        try {
          context.gl.texImage2D(glEnum, 0, format, width, height, 0, format, data_type, null);
        } catch (e) {
          var tex = new Uint8Array(width*height*Jax.Util.sizeofFormat(format));
          context.gl.texImage2D(glEnum, 0, format, width, height, 0, format, data_type, tex);
        }
      }
      
      switch(target) {
        case GL_TEXTURE_2D:
          ti2d(GL_TEXTURE_2D);
          break;
        case GL_TEXTURE_CUBE_MAP:
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_X);
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_Y);
          ti2d(GL_TEXTURE_CUBE_MAP_POSITIVE_Z);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_X);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y);
          ti2d(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    }
  }
  
  /* pushLevel/popLevel are used for automatic management of gl.activeTexture's.
    The general concept is that you can do something like:
    
      tex1.bind(context, function() {
        tex2.bind(context, function() {
          // render stuff.
          // tex1 => GL_TEXTURE0, tex1.textureLevel => 0
          // tex2 => GL_TEXTURE1, tex2.textureLevel => 1
          
          tex3.bind(context, 5, function() {
            // tex3 => GL_TEXTURE5, tex3.textureLevel => 5
          });
        });
      });
   */
  function pushLevel(self, level, context) {
    if (level == null) level = Jax.Texture._level++;
    self.textureLevel = level;
    self.SLOT = context.gl['TEXTURE'+level];
    context.gl.activeTexture(self.SLOT);
  }
  
  function popLevel(self, context) {
    Jax.Texture._level = self.textureLevel - 1;
    if (Jax.Texture._level < 0) Jax.Texture._level = 0;
    delete self.textureLevel;
    self.SLOT = null;
  }
  
  return Jax.Class.create({
    /**
     * new Jax.Texture(url[, options])
     * - url (String): the URL or relative path to the image to be loaded.
     * - options (Object): a generic object optionally consisting of the following properties:
     * new Jax.Texture(urls[, options])
     * - urls (Array): an array of URLs or relative paths to the images to be loaded. This is intended
     *                 for use with cube maps. If used with a cube map, 6 paths must be provided.
     *                 If used with a standard 2D texture, only the first path in the array will be used.
     * - options (Object): a generic object optionally consisting of the following properties:
     * new Jax.Texture(options)
     * - options (Object): a generic object optionally consisting of the following properties, plus a mandatory
     *                     _width_ and _height_ in pixels:
     * 
     *   * min_filter: GL_NEAREST
     *   * mag_filter: GL_NEARETS
     *   * generate_mipmap: true
     *   * mipmap_hint: GL_DONT_CARE
     *   * format: GL_RGBA
     *   * target: GL_TEXTURE_2D
     *   * data_type: GL_UNSIGNED_BYTE
     *   * wrap_s: GL_REPEAT
     *   * wrap_t: GL_REPEAT
     *   * flip_y: false
     *   * premultiply_alpha: false
     *   * colorspace_conversion: true
     *   * onload: null - a function to be called after the image has been loaded. This function
     *                    will not be called if the image fails to load.
     *                     
     * Note that WebGL support for non-power-of-two textures is very limited. If you create a WebGL
     * texture out of an image whose dimensions are not power-of-two (128, 256, 512, etc.), Jax will
     * automatically assume the following options:
     *
     *   * min_filter: GL_LINEAR
     *   * mag_filter: GL_LINEAR
     *   * wrap_s: GL_CLAMP_TO_EDGE
     *   * wrap_t: GL_CLAMP_TO_EDGE
     *   * generate_mipmap: false 
     *
     * If you replace these options with other values after initialization, WebGL will probably throw
     * an exception.
     **/
    initialize: function(path_or_array, options) {
      this.handles = {};
      this.loaded = false;
      this.valid = {};
      
      if (!options && typeof(path_or_array) == "object" && path_or_array.length == undefined) {
        options = path_or_array;
        path_or_array = options.path || null;
        delete options.path;
      }
      
      var self = this;
      this.options = options = options || {};
      options.min_filter = options.min_filter || GL_NEAREST;
      options.mag_filter = options.mag_filter || GL_NEAREST;
      options.generate_mipmap = options.generate_mipmap === undefined ? true : options.generate_mipmap;
      options.mipmap_hint = options.mipmap_hint || GL_DONT_CARE;
      options.format = options.format || GL_RGBA;
      options.target = options.target || null;
      options.data_type = options.data_type || GL_UNSIGNED_BYTE;
      options.wrap_s = options.wrap_s || GL_REPEAT;
      options.wrap_t = options.wrap_t || GL_REPEAT;
      options.flip_y = options.flip_y === undefined ? false : options.flip_y;
      options.premultiply_alpha = options.premultiply_alpha === undefined ? false : options.premultiply_alpha;
      options.colorspace_conversion = options.colorspace_conversion === undefined ? true : options.colorspace_conversion;
      options.onload = options.onload || null;
      
      var i;
      var enums = ['min_filter', 'mag_filter', 'mipmap_hint', 'format', 'target', 'data_type', 'wrap_s', 'wrap_t'];
      var global = Jax.getGlobal();
      for (i = 0; i < enums.length; i++)
        if (typeof(this.options[enums[i]]) == "string")
          this.options[enums[i]] = global[this.options[enums[i]]];

      if (path_or_array) {
        if (typeof(path_or_array) == "string") {
          this.options.target = this.options.target || GL_TEXTURE_2D;
          this.image = new Image();
          this.image.onload = function() { imageLoaded(self, false, this); };
          this.image.onerror = this.image.onabort = function() { imageFailed(self, this); };
          this.image.src = path_or_array;
        } else {
          var onload = function() { imageLoaded(self, true, this); };
          this.options.target = this.options.target || GL_TEXTURE_CUBE_MAP;
          this.images = [];
          this.images.load_count = 0;
          for (i = 0; i < path_or_array.length; i++) {
            this.images[i] = new Image();
            this.images[i].onload = onload;
            this.images[i].onerror = this.images[i].onabort = function() { imageFailed(self, this); };
            this.images[i].src = path_or_array[i];
          }
        }
      }
      else {
        // nothing to load
        this.options.target = this.options.target || GL_TEXTURE_2D;
        this.options.generate_mipmap = !!(options && options.generate_mipmap);
        this.loaded = true;
      }
    },

    getData: function() {
      if (!this.ready()) return null;
      if (this.dataBuffer) return this.dataBuffer;
      var canvas = _canvas;
      canvas.width = this.image.width;
      canvas.height = this.image.height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(this.image, 0, 0);
      return this.dataBuffer = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    },
    
    /**
     * Jax.Texture#getTarget() -> GLenum
     * 
     * Returns the render target for this texture, which defaults to GL_TEXTURE_2D.
     **/
    getTarget: function() { return this.options.target; },

    /**
     * Jax.Texture#getMinFilter() -> GLenum
     * 
     * Returns the +min_filter+ for this texture, which defaults to GL_NEAREST.
     **/
    getMinFilter: function() { return this.options.min_filter; },

    /**
     * Jax.Texture#getMagFilter() -> GLenum
     * 
     * Returns the +mag_filter+ for this texture, which defaults to GL_NEAREST.
     **/
    getMagFilter: function() { return this.options.mag_filter; },

    /**
     * Jax.Texture#getGeneratesMipmaps() -> Boolean
     * 
     * Returns the +generate_mipmap+ option for this texture, which defaults to +true+.
     **/
    getGeneratesMipmaps: function() { return this.options.generate_mipmap; },

    /**
     * Jax.Texture#getMipmapHint() -> GLenum
     * 
     * Returns the +mipmap_hint+ option for this texture, which defaults to GL_DONT_CARE.
     **/
    getMipmapHint: function() { return this.options.mipmap_hint; },

    /**
     * Jax.Texture#getFormat() -> GLenum
     * 
     * Returns the +format+ option for this texture, which defaults to GL_RGBA.
     **/
    getFormat: function() { return this.options.format; },

    /**
     * Jax.Texture#getDataType() -> GLenum
     * 
     * Returns the +data_type+ option for this texture, which defaults to GL_UNSIGNED_BYTE.
     **/
    getDataType: function() { return this.options.data_type; },

    /**
     * Jax.Texture#getWrapS() -> GLenum
     * 
     * Returns the +wrap_s+ option for this texture, which defaults to GL_REPEAT.
     **/
    getWrapS: function() { return this.options.wrap_s; },

    /**
     * Jax.Texture#getWrapT() -> GLenum
     * 
     * Returns the +wrap_t+ option for this texture, which defaults to GL_REPEAT.
     **/
    getWrapT: function() { return this.options.wrap_t; },

    /**
     * Jax.Texture#getFlipY() -> Boolean
     * 
     * Returns the +flip_y+ option for this texture, which defaults to +false+.
     **/
    getFlipY: function() { return this.options.flip_y; },

    /**
     * Jax.Texture#getPremultipliesAlpha() -> Boolean
     * 
     * Returns the +premultiply_alpha+ option for this texture, which defaults to +false+.
     **/
    getPremultipliesAlpha: function() { return this.options.premultiply_alpha; },

    /**
     * Jax.Texture#getDoesColorspaceConversion() -> Boolean
     * 
     * Returns the +colorspace_conversion+ option for this texture, which defaults to +true+.
     **/
    getDoesColorspaceConversion: function() { return this.options.colorspace_conversion; },
    
    /**
     * Jax.Texture#getOnloadFunc() -> Function | null
     *
     * Returns the callback function to be called when the texture image finishes loading.
     **/
    getOnloadFunc: function() { return this.options.onload; },
    
    /**
     * Jax.Texture#refresh(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to prepare a texture handle for
     * 
     * Prepares this texture for use with the specified context. If any data has changed,
     * it will be refreshed. All options are applied at this time. Mipmaps are generated
     * if the +generate_mipmaps+ option is true.
     *
     * Call this method whenever you alter the texture data or the +Image+ associated with it.
     **/
    refresh: function(context) {
      if (!this.ready()) return;
      
      context.gl.bindTexture(this.options.target, this.getHandle(context));
      generateTexture(context, this);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_MAG_FILTER, this.options.mag_filter);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_MIN_FILTER, this.options.min_filter);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_WRAP_S, this.options.wrap_s);
      context.gl.texParameteri(this.options.target, GL_TEXTURE_WRAP_T, this.options.wrap_t);
      context.gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.options.flip_y);
      context.gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.options.premultiply_alpha);
      context.gl.pixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, this.options.colorspace_conversion ? GL_BROWSER_DEFAULT_WEBGL : GL_NONE);
      delete this.dataBuffer;
      
      if (this.options.generate_mipmap) {
        this.generateMipmap(context);
      }
      
      context.gl.bindTexture(this.options.target, null);
      this.valid[context.id] = true;
      return this;
    },

    renderTo: function(context, options, callback) {
      if (!callback) { callback = options; options = null; }
      if (!(callback instanceof Function)) {
        alert(callback);
        throw new Error("Callback must be a function");
      }
      
      if (!this._framebuffer) {
        if (!options) options = {};
        options.colors = options.colors || [];
        options.colors.push(this);
        this._framebuffer = new Jax.Framebuffer(options);
      }
      
      this._framebuffer.bind(context);
      this._framebuffer.viewport(context);
      callback(this._framebuffer);
      this._framebuffer.unbind(context);
      context.renderer.viewport();
    },
    
    /**
     * Jax.Texture#generateMipmap(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to generate the mipmap for
     *
     * Applies the mipmap hint, if necessary, and then forcibly generates mipmaps
     * (regardless of the value of the +generate_mipmap+ option) for the given context.
     **/
    generateMipmap: function(context) {
      // FIXME why does this raise 1280 invalid enum?
      // context.gl.hint(GL_GENERATE_MIPMAP_HINT, this.options.mipmap_hint);
      context.gl.generateMipmap(this.options.target);
      return this;
    },
    
    /**
     * Jax.Texture#invalidate() -> Jax.Texture
     *
     * Invalidates this texture, which means it will be automatically refreshed (per
     * the Jax.Texture#refresh() method) the next time it is bound to any context.
     **/
    invalidate: function() { this.valid.clear(); return this; },
    
    /**
     * Jax.Texture#dispose(context) -> Jax.Texture
     * - context (Jax.Context): the Jax context to dispose of the texture for
     *
     * Disposes of the WebGL handle for the given context. Note that
     * calling Jax.Texture#bind() after disposing of it will cause the
     * texture to be regenerated, so take care not to use the texture
     * after disposing of it unless this is the intended result (e.g.
     * to dispose the texture for all contexts except for one).
     **/
    dispose: function(context) {
      delete this.dataBuffer;
      context.gl.deleteTexture(this.getHandle(context));
      delete this.handles[context.id];
    },
    
    /**
     * Jax.Texture#getHandle(context) -> WebGLTexture
     * - context (Jax.Context): the Jax context to return a handle for
     *
     * Returns the WebGL texture handle (an instance of +WebGLTexture+)
     * for the specified Jax context. If one does not exist, it will be
     * automatically allocated and returned.
     **/
    getHandle: function(context) {
      if (!this.handles[context.id]) {
        build(this, context);
        this.refresh(context);
      }
      return this.handles[context.id];
    },
    
    /**
     * Jax.Texture#isValid(context) -> Boolean
     * - context (Jax.Context): the Jax context to check validity for
     *
     * Returns true if this texture is ready for use with the specified
     * context, false otherwise. If false, the texture will be prepared
     * (per Jax.Texture#refresh()) the next time it is bound.
     **/
    isValid: function(context) {
      return !!this.valid[context.id];
    },
    
    /**
     * Jax.Texture#bind(context[, callback]) -> Jax.Texture
     * Jax.Texture#bind(context[, level, callback]) -> Jax.Texture
     * - context (Jax.Context): the Jax context to bind this texture to
     * - level (Number): the numeric level representing the nesting of this
     *                   texture within other textures. Usually, this is
     *                   managed automatically for you by Jax.Texture itself.
     * - callback (Function): an optional callback function.
     *
     * If a callback is specified, it will be called and the texture will
     * be unbound after the call has completed. Otherwise, the texture will
     * remain bound when Jax.Texture#bind returns.
     *
     * If the texture is bound within a function which contains another bound
     * texture, the +level+ will automatically be incremented. This allows Jax
     * to manage which texture slot a given texture is bound to. 
     * 
     * For example, Jax will automatically bind tex1 to GL_TEXTURE0 and tex2 to
     * GL_TEXTURE1 in the following example:
     *
     *     var tex1 = new Jax.Texture("/images/tex1.png");
     *     var tex2 = new Jax.Texture("/images/tex2.png");
     *     
     *     tex1.bind(context, function() {
     *       tex2.bind(context, function() {
     *         // context.gl.activeTexture has already been called with
     *         // the appropriate values.
     *         
     *         // you can get the active texture enums easily:
     *         // tex1.SLOT == GL_TEXTURE0
     *         // tex2.SLOT == GL_TEXTURE1
     *       });
     *     });
     *
     **/
    bind: function(context, level, callback) {
      if (!this.ready()) return; // no texture to display, yet... but not worth crashing over.
      if (!this.isValid(context)) this.refresh(context);
      
      if (typeof(level) == "number")
        pushLevel(this, level, context);
      else if (typeof(level) == "function") { callback = level; pushLevel(this, null, context); }
      
      context.gl.bindTexture(this.options.target, this.getHandle(context));
      if (callback)
      {
        callback.call(this, this.textureLevel);
        this.unbind(context);
      }
      
      return this;
    },
    
    /**
     * Jax.Texture#unbind(context) -> Jax.Texture
     * context (Jax.Context): the context to unbind this texture from
     *
     * Unbinds this texture form the specified context. Note that you don't need to do this
     * if you called Jax.Texture#bind() with a callback function.
     **/
    unbind: function(context) {
      if (this.textureLevel != undefined) context.gl.activeTexture(this.SLOT);
      context.gl.bindTexture(this.options.target, null);
      popLevel(this, context);
      return this;
    },
    
    /**
     * Jax.Texture#ready() -> Boolean
     * 
     * Returns true if the corresponding Image for this texture has finished loading.
     * If this texture does not have an underlying Image (e.g. it is a dynamically-generated
     * texture), then this will always return +true+.
     **/
    ready: function() {
      return this.loaded;
    }
  });
})();

Jax.Texture._level = 0;
/**
 * class Array
 * A standard JavaScript array.
 **/

/**
 * Jax.Util
 * Contains general-purpose utility and helper functions
 **/

Jax.Util = {
  findMaterial: function(name_or_instance) {
    if (typeof(name_or_instance) == "string")
      return Jax.Material.find(name_or_instance);
    else if (name_or_instance instanceof Jax.Material)
      return name_or_instance;

    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
  },
  
  // Produces a hash code for the given input string.
  hash: function(str) {
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },
  
  scan: function(str, end, incr, decr, startIndex, singleLineComment, multiLineCommentStart, multiLineCommentEnd) {
    end = end || ')';
    incr = incr || '(';
    decr = decr || end;
    singleLineComment = singleLineComment || "//";
    multiLineCommentStart = multiLineCommentStart || "/*";
    multiLineCommentEnd   = multiLineCommentEnd   || "*/";
    
    startIndex = startIndex || 0;
    var depth = 0;
    var result = "";
    var inComment = 0;
    for (var i = startIndex; i < str.length; i++) {
      var ch = str[i];
      switch(ch) {
        case incr: if (!inComment) depth++; break;
        case decr: if (!inComment) depth--; break;
      }
      if (depth < 0) break;
      result += ch;
      
      if (result.length >= singleLineComment.length &&
          result.substring(result.length - singleLineComment.length, result.length) === singleLineComment)
        inComment = 1;
      if (inComment === 1 && ch === "\n")
        inComment = 0;
      if (!inComment && result.length >= multiLineCommentStart.length &&
          result.substring(result.length - multiLineCommentStart.length, result.length) === multiLineCommentStart)
        inComment = 2;
      if (inComment === 2 && result.length >= multiLineCommentEnd.length &&
          result.substring(result.length - multiLineCommentEnd.length, result.length) === multiLineCommentEnd)
        inComment = 0;
    }
    return result;
  },
  
  /**
   * Jax.Util.underscore(word) -> String
   * word (String): a String to be converted to underscore.
   *
   * Takes a String, which may be in CamelCase format, and returns
   * the same string converted to underscored_format. Examples:
   *
   *     "HelloWorld" => "hello_world"
   *     "Hello_World" => "hello_world"
   *     "Hello" => "hello"
   *
   **/
  underscore: function(word) {
    word = word.replace(/::/g, "\/");
    word = word.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
    word = word.replace(/([a-z\d])([A-Z])/g, '$1_$2');
    word = word.replace(/-/g, '_');
    return word.toLowerCase();
  },
  
  /**
   * Jax.Util.decodePickingColor(red, green, blue, alpha) -> Number
   * 
   * Performs the reverse of the 'picking' shader by restoring a number
   * that was previously encoded into the four color channels.
   **/
  decodePickingColor: function(red, green, blue, alpha) {
    /* blue is a key. It is always max. So if it's 1, we're dealing with floats; else, bytes. */
    if (blue == 1.0) {
      red *= 255;
      green *= 255;
    }
    return red * 256 + green;
  },

  /**
   * Jax.Util.vectorize(object) -> vec3
   * - object (Object): any Object
   *
   * Analyzes the input object and returns a vec3 based on its contents. Input can be any of the following:
   *   * a vec3
   *   * an array
   *   * an object with {x, y, z} properties
   *   * an object with {0, 1, 2} properties
   *   * a string delimited with any combination of commas, spaces and/or tab characters. Examples:
   *     "x,y,z"
   *     "x y z"
   *     "x, y, z"
   *     "x\ty\tz"
   *     "x, \ty, \tz"
   **/
  vectorize: function(data) {
    if (data) {
      var res = [];//vec3.create();
      if (typeof(data) == "string") {
        var components = data.split(/[,\s]+/);
        if (components.length >= 2) {
          for (var i = 0; i < components.length; i++)
            res[i] = parseFloat(components[i]);
        }
        return res;
      }
      if (data.length && data.length >= 3) return vec3.copy(res, data);
      else if (data.length == 2) return [data[0], data[1]];
      if ((res[0] = data.x) != undefined && (res[1] = data.y) != undefined) {
        if (data.z != undefined) res[2] = data.z;
        return res;
      }
      if ((res[0] = data[0]) != undefined && (res[1] = data[1]) != undefined) {
        if (data[2] != undefined) res[2] = data[2];
        return res;
      }
    }
    throw new Error("Input argument for Jax.Util.vectorize not recognized: "+JSON.stringify(data));
  },

  /**
   * Jax.Util.colorize(object) -> vec4
   * - object (Object): any Object
   *
   * Analyzes the input object and returns a 4-component color vector based on its contents. Input can be any of the
   * following:
   *   * an array
   *   * an object with {r, g, b, a} properties
   *   * an object with {0, 1, 2, 3} properties
   *   * a string delimited with any combination of commas, spaces and/or tab characters. Examples:
   *     "r,g,b,a"
   *     "r g b a" 
   *     "r, g, b, a"
   *     "r\tg\tb\ta"
   *     "r, \tg, \tb, \ta"
   *     
   * In all cases, if the alpha component is omitted, it defaults to 1.0.
   **/
  colorize: function(data) {
    if (data) {
      var res = vec4.create();

      if (typeof(data) == "string") {
        var components = data.split(/[,\s]+/);
        if (components.length >= 3) {
          for (var i = 0; i < 4; i++)
            if (components.length <= i)
              res[i] = 1.0;
            else
              res[i] = parseFloat(components[i]);
        }
        return res;
      }
      if (data.length && data.length >= 3) {
        res[0] = data[0];
        res[1] = data[1];
        res[2] = data[2];
        if ((res[3] = data[3]) == undefined) res[3] = 1.0;
        else res[3] = 1.0;
        return res;
      }
      if ((res[0] = data.r) != undefined && (res[1] = data.g) != undefined && (res[2] = data.b) != undefined) {
        if ((res[3] = data.a) == undefined) res[3] = 1.0;
        return res;
      }
      if ((res[0] = data.red) != undefined && (res[1] = data.green) != undefined && (res[2] = data.blue) != undefined) {
        if ((res[3] = data.alpha) == undefined) res[3] = 1.0;
        return res;
      }
      if ((res[0] = data[0]) != undefined && (res[1] = data[1]) != undefined && (res[2] = data[2]) != undefined) {
        if ((res[3] = data[3]) == undefined) res[3] = 1.0;
        return res;
      }
    }
    throw new Error("Input argument for Jax.Util.colorize not recognized: "+JSON.stringify(data));
  },
  
  /**
   * Jax.Util.properties(object) -> Array
   * - object (Object): any Object
   * 
   * Returns an array containing the names of all properties in the specified object.
   **/
  properties: function(object) {
    var arr = [];
    for (var i in object)
      arr.push(i);
    return arr;
  },
  
  /**
   * Jax.Util.merge(incoming, outgoing) -> outgoing
   * Merges the two objects by copying all properties from _incoming_ into _outgoing_, replacing
   * any properties that already exist. _outgoing_ will retain any properties that do not exist
   * in _incoming_.
   **/
  merge: function(src, dst) {
    if (!src) return dst;
    var i, j, n;

    function doComparison(i) {
      if (src[i] == null) dst[i] = null;
      else if (src[i].klass)           dst[i] = src[i];
      else if (Object.isArray(src[i])) Jax.Util.merge(src[i], dst[i] = dst[i] || []);
      else if (typeof(src[i]) == "object") {
        if (Object.isArray(dst[i])) {
          n = {};
          for (j = 0; j < dst[i].length; j++) n[j] = dst[i][j];
          dst[i] = n;
        }
        Jax.Util.merge(src[i], dst[i] = dst[i] || new (function MergedObject() { })());
      }
      else dst[i] = src[i];
    }
    
    if (Object.isArray(src)) for (i = 0; i < src.length; i++) doComparison(i);
    else for (i in src) doComparison(i);

    return dst;
  },

  /**
   * Jax.Util.trim_duplicates(array) -> trimmed_array
   * Returns an array containing the elements of passed array, but without any duplicates
   * todo : add "dest" param (vec3 style)
   *
   * @param {Array} array with duplicates
   * @return {Array}
   */
  trimDuplicates: function(array) {
    var contains, item, results, i, len;
    results = [];
    contains = function(haystack, needle) {
      var match, straw, value, i, j, hLen, nLen;
      for (i = 0, hLen = haystack.length; i < hLen; i++) {
        straw = haystack[i];
        match = true;
        for (j = 0, nLen = needle.length; j < nLen; j++) {
          value = needle[j];
          if (straw[j] !== value) {
            match = false;
          }
        }
        if (match) {
          return true;
        }
      }
      return false;
    };

    for (i = 0, len = array.length; i < len; i++) {
      item = array[i];
      if (!contains(results, item)) {
        results.push(item);
      }
    }

    return results;
  },
  
  /**
   * Jax.Util.normalizeOptions(incoming, defaults) -> Object
   * Receives incoming and formats it into a generic Object with a structure representing the given defaults.
   * The returned object is always a brand-new object, to avoid polluting original incoming object.
   * If the object contains a Jax.Class instance, that actual object is copied over. All other objects
   * are cloned into brand-new objects.
   **/
  normalizeOptions: function(incoming, defaults) {
    // throw new Error("Jax.Util.normalizeOptions is being phased out of core (with "+JSON.stringify(incoming)+" and "+JSON.stringify(defaults)+")");
    var result = new (function NormalizedObject() { })();
    Jax.Util.merge(defaults, result);
    Jax.Util.merge(incoming, result);
    return result;
  },

  /**
   * Jax.Util.sizeofFormat(glEnum) -> Number
   * 
   * Returns the byte size of an array consisting of this type of element.
   * 
   * Example:
   * 
   *     Jax.Util.sizeofFormat(GL_RGB)
   *     //=> 3
   *
   * If this isn't a recognized format, it is passed off to Jax.Util.enumName and an error is thrown. 
   **/
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

  /**
   * Jax.Util.enumName(glEnum) -> String
   * - glEnum (GLenum): a WebGL enumeration, presumably numeric.
   * 
   * Returns the name of the enumeration prefixed with "GL_" that shares a value with the passed-in enum.
   * 
   * If the enum can't be found (this happens sometimes when an enum crops up that isn't in the WebGL spec),
   * then a string containing both the decimal and hexadecimal form of this enum is returned:
   * 
   *     "(unrecognized enum: 36059 [0x8cdb])"
   * 
   * This is primarily for debugging and error reporting.
   **/
  enumName: function(glEnum) {
    var global = Jax.getGlobal();
    for (var i in global) {
      if (i.indexOf("GL_") == 0 && global[i] == glEnum)
        return i;
    }
    return "(unrecognized enum: "+glEnum+" [0x"+parseInt(glEnum).toString(16)+"])";
  },

  /**
   * Jax.Util.addRequestedHelpers(obj) -> Array
   * - obj (Jax.Class): An instance of a class into which to mix the helpers.
   *
   * First, if +ApplicationHelper+ is defined, it is automatically mixed into the specified class.
   *
   * Then, the object is searched for a #helpers method; if it exists, it is expected to return an array of
   * Helpers (created with +Jax.Helper.create({...})+ ). Each element in the array returned by #helpers is
   * then mixed into the class.
   *
   * An array of all helpers that were just mixed into the target class is returned.
   *
   * As of Jax v1.1.0, you may also set the array of helpers directly on the +helpers+ property
   * of a class, instead of defining a function.
   **/
  addRequestedHelpers: function(obj) {
    var helpers = [], prop;
    if (typeof(ApplicationHelper) != "undefined") {
      helpers.push(ApplicationHelper);
      for (prop in ApplicationHelper)
        if (!obj.hasOwnProperty(prop))
          obj[prop] = ApplicationHelper[prop];
    }
    if (obj.helpers) {
      var helper_array;
      if (typeof(obj.helpers) == "function")
        helper_array = obj.helpers();
      else helper_array = obj.helpers;
      
      for (var i = 0; i < helper_array.length; i++) {
        helpers.push(helper_array[i]);
        for (prop in helper_array[i])
          if (!obj.hasOwnProperty(prop))
            obj[prop] = helper_array[i][prop];
      }
    }
    return helpers;
  }
};
/**
 * class Jax.Controller
 * 
 * Controllers are a major component of the Jax framework, because they are in
 * charge of receiving input from the user, setting up a scene, tearing it down,
 * and deciding when is the right time to transition to a different controller.
 * 
 * Controllers need to be either registered with Jax.routes or invoked using
 * Jax.Controller.invoke(). They are not intended to be instantiated directly,
 * so you should avoid doing this in your code and instead rely on the route set.
 * 
 * Methods added to controllers are called actions. You can name actions whatever
 * you want, but some action names serve special purposes. They are as follows:
 * 
 *   * *index*          - called when the action name is omitted from a route.
 *   * *destroy*        - called when leaving the current controller.
 *   * *mouse_clicked*  - called when the mouse is clicked within the canvas.
 *   * *mouse_entered*  - called when the mouse enters the canvas.
 *   * *mouse_exited*   - called when the mouse exits the canvas.
 *   * *mouse_moved*    - called when the mouse is moved, unless a button is pressed.
 *   * *mouse_dragged*  - called when the mouse is moved while a button is pressed.
 *   * *mouse_scrolled*    - called when the mouse wheel has been scrolled
 *   * *mouse_pressed*  - called when a mouse button has been pressed.
 *   * *mouse_released* - called when a mouse button has been released.
 *   * *mouse_clicked*  - called when a mouse button has been clicked.
 *   * *key_pressed*    - called when a keyboard button has been pressed.
 *   * *key_released*   - called when a keyboard button has been released.
 *   * *key_typed*      - called when a keyboard button has been typed.
 *   * *update*         - called (approximately) 60 times per second for as long
 *   as a controller is active. Time difference in seconds is passed as an arguments.
 *   
 * Example:
 * 
 *     var WelcomeController = Jax.Controller.Create("welcome", ApplicationController, {
 *       index: function() {
 *         // ...
 *       },
 *       
 *       mouse_clicked: function(event) {
 *         // ...
 *       },
 *       
 *       update: function(timechange) {
 *        // it's been [timechange] seconds since last update
 *       }
 *     });
 *
 * With the exception of event actions, which will be fired every time an event occurs,
 * controller actions are only triggered once for a given controller unless they
 * explicitly trigger other actions by calling them directly. They differ from their
 * corresponding views in this way, as a view is rendered many times -- up to a
 * target rate of 60 times per second.
 *
 **/

(function() {
  var protected_instance_method_names = [
    'initialize', 'toString', 'getControllerName', 'constructor', 'fireAction',
    'eraseResult'
  ];
  
  function is_protected(method_name) {
    for (var i = 0; i < protected_instance_method_names.length; i++)
      if (protected_instance_method_names[i] == method_name)
        return true;
    return false;
  }
  
  Jax.Controller = (function() {
    return Jax.Class.create({
      index: function() {
        /* override for scene setup */
      },
      
      /**
       * Jax.Controller#fireAction(action_name, context) -> Jax.Controller
       *
       * Erases the results of the last action, then calls the specified action. If it doesn't exist,
       * an error is raised. Finally, unless the action redirects to a different action or renders
       * a different action directly, the specified action becomes the focus of the current view.
       *
       * Returns this controller.
       **/
      fireAction: function(action_name, context) {
        if (!this.context) {
          this.context = context;
          this.world = context && context.world;
          if (!this.activeCamera)
            this.activeCamera = context.world.cameras[0];
          // TODO remove deprecated `player` from controller
          if (!this.player)
            Object.defineProperty(this, 'player', {get: function() { return context.player; }});
        }

        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");
        
        if (!this.rendered_or_redirected) {
          this.view_key = this.getControllerName()+"/"+this.action_name;
          var newView = Jax.views.find(this.view_key);
          if (newView)
            this.view = newView;
          this.rendered_or_redirected = true;
        }
        return this;
      },

      getControllerName: function() { return null; },
      
      /**
       * Jax.Controller#eraseResults() -> Jax.Controller
       *
       * Erases the results of the most recent render action. That is, whether or not it rendered
       * a different action or caused a redirect to a different action or controller is reset, and
       * the current view is set to +null+, indicating that no view will be rendered.
       *
       * Returns this controller.
       **/
      eraseResult: function() {
        this.rendered_or_redirected = false;
        this.view_key = null;
        return this;
      }
    });
  })();

  var controller_class_methods = {
    /**
     * Jax.Controller.invoke(action_name, context) -> Jax.Controller
     * - action_name (String): The name of the action to fire after initialization
     * - context (Jax.Context): The context to attach to the instantiated controller
     *
     * Creates a new instance of the specified controller, sets up its references to
     * +this.context+, +this.world+, and so on; and finally, fires the action given by
     * +action_name+.
     *
     * Returns the newly-constructed controller.
     **/
    invoke: function(action_name, context) {
      var instance = new this();
      instance.fireAction(action_name, context);
      return instance;
    }
  };

  /**
   * Jax.Controller.create(controllerName, methods) -> Class
   * Jax.Controller.create(controllerName, superclass, methods) -> Class
   * - controllerName (String): the short name of this controller
   * - superclass (Class): a parent class to inherit from
   * - methods (Object): a set of methods to be added to the Class
   * 
   * The controllerName must be the short name of the controller, as represented
   * in Jax.RouteSet. An example controller name for a WelcomeController would be
   * "welcome".
   * 
   * If superclass is not given, Jax.Controller is used as the superclass instead.
   * 
   * The methods object follows the same structure as Prototype.
   * 
   * Example:
   * 
   *     var WelcomeController = Jax.Controller.Create("welcome", ApplicationController, {
   *       index: function() {
   *         // ...
   *       },
   *       
   *       mouse_clicked: function(event) {
   *         // ...
   *       }
   *     });
   **/
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
    
    /**
     * Jax.Controller.getControllerName() -> String
     *
     * Returns the name of the controller in question, as it is represented in +Jax.routes+.
     **/
    Object.extend(klass, controller_class_methods);
    Object.extend(klass, { getControllerName: function() { return controller_name || "generic"; } });
    klass.addMethods({getControllerName: function() { return controller_name || "generic"; } });
    
    if (controller_name)
      Jax.routes.map(controller_name, klass);
      
    return klass;
  };
})();


/**
 * class Jax.Model
 * 
 * Models encapsulate virtually all business logic. If a Monster knows how to attack, the logic
 * that makes it do so is held within the +Monster+ model. If the terrain has trees and other
 * vegetation, the +Terrain+ model is responsible for setting that up.
 *
 * While controllers generally have only high-level code such as initial scene set-up and
 * processing of user input, models handle nearly everything else.
 *
 * Models also contain the actual game data. Jax further splits models into two components: the
 * Model itself and its Resources.
 *
 * Define a model like so:
 *
 *     var Monster = Jax.Model.create({
 *       after_initialize: function() {
 *         // code to be run automatically after a monster is instantiated
 *       },
 * 
 *       update: function(time) {
 *         // code to be run automatically every few milliseconds
 *       },
 *
 *       dealDamageTo: function(otherModel) {
 *         // custom method, called only when you invoke it
 *         otherModel.takeDamage(this.attack_damage);
 *       }
 *     });
 *
 * Once defined, you can add data easily:
 *
 *     Monster.addResources({"ogre": {
 *       hit_points: 100,
 *       attack_damage: 75
 *     }});
 *
 * You can instantiate a model whose resources already exist like so:
 *
 *     var ogre = Monster.find("ogre");
 *
 * Note that subsequent calls to +Model.find+ will return unique objects. For instance, the
 * following code will add 3 separate "ogres" to the world:
 *
 *     world.addObject(Monster.find("ogre"));
 *     world.addObject(Monster.find("ogre"));
 *     world.addObject(Monster.find("ogre"));
 * 
 **/

(function() {
  function initProperties(self, data) {
    // important, to prevent data.mesh from being replaced with an identical clone!
    if (data && data.mesh) {
      self.mesh = data.mesh;
      delete data.mesh;
    }
    
    // to make sure sub-properties of data are standalone objects, so that the original data can't be tainted
    data = Jax.Util.merge(data, {});
    
    var attribute;
        
    if (data) {
      for (attribute in data) {
        switch(attribute) {
          case 'position':    self.camera.position = Jax.Util.vectorize(data[attribute]); break;
          case 'direction':   self.camera.direction = Jax.Util.vectorize(data[attribute]); break;
          default:
            self[attribute] = data[attribute];
        }
      }
    }
  }
  
  Jax.Model = (function() {
    return Jax.Class.create({
      /**
       * new Jax.Model(data)
       * - data: a set of attributes to be assigned to this instance of the model.
       *
       * Anything can be in the data, or you may supply no data at all to instantiate
       * a model with its default attributes.
       *
       * The following attributes have special meanings:
       *
       * * +position+ : sets the position of this model in world coordinates.
       * * +direction+ : sets the direction this model is facing, in world coordinates.
       * * +mesh+: an instance of +Jax.Mesh+
       * * +shadow_caster+ : true or false; specifies whether this model can cast shadows.
       * * +lit+ : true or false; specifies whether this model is affected by nearby lights.
       *
       **/
      initialize: function(data) {
        var self = this;
        this.__unique_id = Jax.guid();
        this.camera = new Jax.Camera();
        this.camera.addEventListener('updated', function() { self.fireEvent('transformed'); });
        
        initProperties(this, Jax.Model.default_properties);
        if (this._klass && this._klass.resources)
          initProperties(this, this._klass.resources['default']);
        initProperties(this, data);
        
        if (this.after_initialize) this.after_initialize();
      },
      
      /**
       * Jax.Model#isShadowCaster() -> Boolean
       *
       * Returns true if this model casts shadows upon other models in the scene. Note that
       * even if true, shadows will only be cast upon models which utilize +Jax.Material+s that support
       * both the +Lighting+ and +ShadowMap+ effects.
       *
       **/
      isShadowCaster: function() { return this.shadow_caster; },

      /** alias of: Jax.Model#isShadowCaster
       * Jax.Model#isShadowcaster() -> Boolean
       *
       * Returns true if this model casts shadows upon other models in the scene. Note that
       * even if true, shadows will only be cast upon models which utilize +Jax.Material+s that support
       * both the +Lighting+ and +ShadowMap+ effects.
       *
       **/
      isShadowcaster: function() { return this.shadow_caster; },
      
      /**
       * Jax.Model#disableShadows() -> Boolean
       *
       * Disables shadows cast by this model. Returns whether or not shadows were previously enabled
       * prior to this method call.
       **/
      disableShadows: function() { var was = this.shadow_caster; this.shadow_caster = false; return was; },

      /**
       * Jax.Model#render(context) -> undefined
       * 
       * Renders this model with the given context. If the model doesn't have a mesh,
       * nothing is rendered.
       **/
      render: function(context, material) {
        if (this.mesh)
        {
          if (!Jax.Model.__instances[this.__unique_id])
            Jax.Model.__instances[this.__unique_id] = this;
          this.pushMatrices(context);
          this.mesh.render(context, this, material);
          this.popMatrices(context);
        }
      },
      
      pushMatrices: function(context) {
        context.matrix_stack.push();
        context.matrix_stack.multModelMatrix(this.camera.getTransformationMatrix());
      },
      
      popMatrices: function(context) {
        context.matrix_stack.pop();
      },
      
      /**
       * Jax.Model#getBoundingCube() -> Object
       *
       * Returns an object describing the cubic dimensions of this model.
       * 
       * Example:
       *
       *     var bounds = new Jax.Model({mesh:new Jax.Mesh.Cube()}).getBoundingCube();
       *     // 'bounds' contains the following:
       *     {
       *       left: -0.5,
       *       right: 0.5,
       *       bottom: -0.5,
       *       top: 0.5,
       *       front: 0.5,
       *       back: -0.5,
       *       width: 1.0,
       *       height: 1.0,
       *       depth: 1.0
       *     }
       * 
       **/
      getBoundingCube: function() {
        if (!this.mesh) return {left:0,right:0,bottom:0,top:0,front:0,back:0,width:0,height:0,depth:0};
        return this.mesh.bounds;
      },
      
      /**
       * Jax.Model#getBoundingSphereRadius() -> Number
       *
       * A sphere can be defined with two values: a position and a radius. A model's
       * position is always known via its camera (see +Jax.Model#camera+).
       *
       * This method returns the radius of its bounding sphere. A bounding sphere is
       * guaranteed to contain the furthest-away point from the model's position. It is less
       * accurate than +Jax.Model#getBoundingCube+, but using it is much faster.
       *
       **/
      getBoundingSphereRadius: function() {
        var b = this.getBoundingCube();
        return Math.max(b.width, Math.max(b.height, b.depth));
      },
      
      /**
       * Jax.Model#dispose() -> undefined
       *
       * Disposes of this model and its mesh.
       *
       * Note that both models and meshes _can_ be reused after disposal; they'll just
       * be silently re-initialized. This means it is safe to dispose of models while
       * they are still being used (although this is slow and not recommended if at all
       * avoidable).
       **/
      dispose: function() {
        if (this.mesh)
          this.mesh.dispose();
        if (Jax.Model.__instances[this.__unique_id])
          delete Jax.Model.__instances[this.__unique_id];
      },
      
      /**
       * Jax.Model#isLit() -> Boolean
       *
       * Returns true if this model can be lit by other light sources. Note that even
       * if this is true, the +Jax.Material+ used by its +Jax.Mesh+ must support the
       * +Lighting+ effect in order to actually perform the lighting effect.
       *
       **/
      isLit: function() {
        return this.lit;
      },

      /**
       * Jax.Mesh#setColor(r, g, b, a) -> Jax.Model
       * Jax.Mesh#setColor(colors) -> Jax.Model
       *
       * Sets the color to the specified RGBA color, or an array containing
       * RGBA colors. This is method simply delegated into `this.mesh`.
       *
       * Returns itself.
       *
       **/
      setColor: function(a, b, c, d) {
        if (arguments.length > 1) this.mesh.setColor(a, b, c, d);
        else this.mesh.setColor(a);
        return this;
      },

      /**
       * Jax.Model#inspect() -> String
       * 
       * Returns the JSON representation of the attributes in this model.
       * Unlike JSON.stringify(), this method will omit function definitions so
       * that only actual data elements are returned in the resulting JSON string.
       * 
       **/
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
    /**
     * Jax.Model.find(id) -> Jax.Model
     * - id (String): the unique identifier of the model to be found
     * 
     * Finds the resource with the specified name, instantiates its model and returns it.
     * 
     * Note that this is a class method of the model in question, and not of Jax.Model itself.
     * 
     * For example, this would be correct:
     * 
     *     Character.find('bad_guy')
     *     
     * while this would be *incorrect*:
     * 
     *     Jax.Model.find('bad_guy')
     *     
     **/
    find: function(id) {
      for (var resource_id in this.resources) {
        if (id == resource_id)
          return new this(this.resources[id]);
      }
      throw new Error("Resource '"+id+"' not found!");
    },

    /**
     * Jax.Model.addResources(resources) -> undefined
     * - resources (Object): the resources to be added
     * 
     * Adds the resources to the specified model. These resources can then be found using
     * Jax.Model.find(id).
     * 
     * Note that this is a class method of the model in question, and not of Jax.Model itself.
     * 
     * For example, this would be correct:
     * 
     *     Character.addResources({'bad_guy': {...}})
     *     
     * while this would be *incorrect*:
     * 
     *     Jax.Model.addResources({'bad_guy': {...}})
     *     
     **/
    addResources: function(resources) {
      this.resources = this.resources || {};
      for (var id in resources)
        if (this.resources[id]) throw new Error("Duplicate resource ID: "+id);
        else this.resources[id] = resources[id];
    },
    
    /**
     * Jax.Model.removeAllResources() -> undefined
     * 
     * Removes all resources from this model. Existing instances won't be
     * affected, but #find() will fail for any resource not re-added using
     * #addResources().
     *
     * Useful for managing test cases, so that they can run in isolation.
     **/
    removeAllResources: function() {
      this.resources = {};
    }
  };
  
  Jax.Model.default_properties = {
    receiveShadow: true,  // can shadows be cast upon this object?
    castShadow: true,     // can this object cast shadows upon others?
    illuminated: true,    // can this object be illuminated by lights?
    cull: true,           // can this object be frustum culled?
  };
  
  Object.defineProperty(Jax.Model.prototype, 'position', {
    get: function() { return this.camera.position; },
    set: function(p) { return this.camera.position = p; }
  });
  
  Object.defineProperty(Jax.Model.prototype, 'direction', {
    get: function() { return this.camera.direction; },
    set: function(p) { return this.camera.direction = p; }
  });
  
  /**
   * Jax.Model.create(inner) -> klass<Jax.Model>
   * - inner (Object): a set of methods the class will contain.
   * Jax.Model.create(superclass, inner) -> klass<Jax.Model>
   * - superclass (Jax.Model): an optional superclass. Defaults to +Jax.Model+.
   * - inner (Object): a set of methods the class will contain.
   * 
   * Creates a new Jax class inheriting from Jax.Model. If a superclass is given,
   * the model will inherit from the given superclass instead. The superclass is,
   * in turn, expected to be a subclass of Jax.Model.
   *
   * Examples:
   *
   *     var Person = Jax.Class.create({ ... });
   *     var Colin = Jax.Class.create(Person, { ... });
   *
   **/
  Jax.Model.create = function(superclass, inner) {
    var klass;
    if (inner) klass = Jax.Class.create(superclass, inner);
    else       klass = Jax.Class.create(Jax.Model, superclass);
    
    klass.addMethods({_klass:klass});
    return klass;
  };
  
  Jax.Model.addMethods(Jax.EventEmitter);
  
  /*
  This is touchy. Jax.World needs to be able to look up models
  that aren't necessarily in the world (using its unique ID).
  However, we want to be careful not to leave references to
  models strewn about; the user may need to garbage-collect
  them. So, we'll track them using this variable; they only
  get added to the variable upon render, and the reference
  gets deleted whenever the model is disposed.
  */
  Jax.Model.__instances = {};
  
  Object.extend(Jax.Model, model_class_methods);
})();
/**
 * class Jax.RouteSet
 * 
 * Manages routing for Jax. All routes are mapped through the route set, and
 * the route set is responsible for recognizing routes and dispatching them
 * to the appropriate destination.
 * 
 * A route is generally represented as a string of the form
 * "controller_name/action_name", where controller_name is the short name of
 * the controller and the action name is the action to be triggered. For
 * example, a route matching the #index action of the WelcomeController
 * would look like:
 * 
 *     "welcome/index"
 *   
 * A special case is the root route, which is always mapped to "/". This is
 * used to give Jax applications a default starting point. If omitted, it
 * will be necessary to invoke the appropriate controller manually. You
 * can do this by calling Jax.RouteSet#dispatch.
 **/

Jax.RouteSet = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.clear();
    },
    
    /**
     * Jax.RouteSet#clear() -> Jax.RouteSet
     *
     * Removes all routes registered with this Jax.RouteSet and then
     * returns this RouteSet.
     **/
    clear: function() {
      this._map = {};
      return this;
    },

    /**
     * Jax.RouteSet#map(path, controller) -> undefined
     * 
     * Sets up routing so that the specified name points to the given controller class.
     * Action names are not looked up until a call to #recognizeRoute is received.
     * This way, actions can be added to the controller's prototype at any time.
     **/
    map: function(path, controller) {
      if (!path) throw new Error("path is required");
      var parts = path.split(/\//);
      var controller_name = Jax.Util.underscore(parts[0]);
      this._map[controller_name] = controller;
    },
    
    /**
     * Jax.RouteSet#getControllerNames() -> Array
     *
     * Returns an array of controller names registered with this route set.
     **/
    getControllerNames: function() {
      return Jax.Util.properties(this._map);
    },
    
    /**
     * Jax.RouteSet#recognizeRoute(path) -> Object
     * - path (String): the route path to be recognized
     * 
     * Recognizes the specified path, returning an object with properties
     * 'controller' and 'action'. If the route cannot be recognized, an
     * error is thrown.
     *
     * The route path can be either the name of the controller, or
     * the format 'controller_name/action_name'. Examples:
     *
     *     'welcome'        => {controller:WelcomeController, action:'index'}
     *     'welcome/index'  => {controller:WelcomeController, action:'index'}
     *     'welcome/about'  => {controller:WelcomeController, action:'about'}
     *
     **/
    recognizeRoute: function(path) {
      var parts = path.split(/\//);
      if (parts.length > 2 || parts.length == 0)
        throw new Error("Invalid path format. String should look like 'controller/action'.");
      var controller_name = Jax.Util.underscore(parts[0]);
      var action_name = parts[1] || "index";
      
      var controller_class = this._map[Jax.Util.underscore(controller_name)];
      if (!controller_class || !controller_class.prototype)
        throw new Error("Route not recognized: '"+path+"' (controller not found)");
        
      if (!controller_class.prototype[action_name])
        throw new Error("Invalid action name '"+action_name+"' for controller '"+controller_name+"'.\n\n"+
                        "Valid action names: "+JSON.stringify(Jax.Util.properties(controller_class.prototype)));
      
      return {
        controller: controller_class,
        action: action_name
      };
    },

    /**
     * Jax.RouteSet#isRouted(path) -> Boolean
     * - path (String): the route path to be recognized
     * 
     * Returns true if the specified path can be routed, false otherwise.
     **/
    isRouted: function(path) {
      return !!self._map[path];
    },

    /**
     * Jax.RouteSet#dispatch(path) -> Jax.Controller
     * - path (String): the route path to be recognized
     * 
     * Recognizes the given path as a route and invokes its controller and action.
     * After the controller has been invoked, the controller instance itself is
     * returned.
     **/
    dispatch: function(path, context) {
      var route = this.recognizeRoute(path);
      
      return route.controller.invoke(route.action, context);
    }
  });
})();
/**
 * class Jax.ViewManager
 * 
 * Maintains a registry of all Jax views and the paths to them.
 **/

Jax.ViewManager = (function() {
  return Jax.Class.create({
    initialize: function() {
      this.views = {};
    },

    /**
     * Jax.ViewManager#push(path, view) -> undefined
     * - path (String): the view path to be stored
     * - view (Function): a function to be called when rendering the view
     * 
     * If the path is already stored, the current one will be replaced.
     **/
    push: function(path, view) {
      this.views[Jax.Util.underscore(path)] = view;
    },
    
    /**
     * Jax.ViewManager#get(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    find: function(path) {
      if (this.views[Jax.Util.underscore(path)])
        return this.views[Jax.Util.underscore(path)];
      return null;
    },
    
    /**
     * Jax.ViewManager#remove(path) -> Object | undefined
     * - path (String): the view path to be removed.
     *
     * Removes the specified view path and, if it existed to begin with, returns it.
     * Otherwise undefined is returned.
     **/
    remove: function(path) {
      var result = this.views[Jax.Util.underscore(path)];
      delete this.views[Jax.Util.underscore(path)];
      return result;
    },
    
    /**
     * Jax.ViewManager#exists(path) -> Boolean
     *
     * Returns true if a view exists for the specified view path, false otherwise.
     **/
    exists: function(path) {
      return !!this.views[Jax.Util.underscore(path)];
    }
  });
})();
/*
Jax.views -> Jax.ViewManager
*/


(function() {
  Jax.views = new Jax.ViewManager();

  /*
  Jax.routes -> Jax.RouteSet
  */


  Jax.routes = new Jax.RouteSet();

}).call(this);
(function() {
  var alphaHex, hex2dec, hexEncode, parseHexColor,
    __slice = [].slice;

  alphaHex = "0123456789abcdef";

  hex2dec = function(hex) {
    var n_, _n;

    n_ = alphaHex.indexOf(hex.slice(0, 1));
    _n = alphaHex.indexOf(hex.slice(1, 2));
    return (n_ * 16 + _n) / 255;
  };

  parseHexColor = function(hex, color) {
    var a, b, g, r, _ref;

    switch (hex.length) {
      case 3:
        return parseHexColor(hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + "ff", color);
      case 4:
        return parseHexColor(hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3], color);
      case 6:
        return parseHexColor(hex + "ff", color);
      case 8:
        hex = hex.toLowerCase();
        _ref = [hex2dec(hex.slice(0, 2)), hex2dec(hex.slice(2, 4)), hex2dec(hex.slice(4, 6)), hex2dec(hex.slice(6, 8))], r = _ref[0], g = _ref[1], b = _ref[2], a = _ref[3];
        return color.set(r, g, b, a);
      default:
        throw new Error("Hex color #" + hex + " is invalid: must be 3, 4, 6, or 8 characters");
    }
  };

  hexEncode = function(flt, precision) {
    var dec, result;

    dec = parseInt(flt * 255);
    return result = (function() {
      switch (precision) {
        case 1:
          return parseInt(dec / 16).toString(16);
        case 2:
          result = dec.toString(16);
          if (result.length === 1) {
            return "0" + result;
          } else {
            return result;
          }
          break;
        default:
          throw new Error("invalid precision");
      }
    })();
  };

  Jax.Color = (function() {
    Color.include(Jax.EventEmitter);

    function Color(r, g, b, a) {
      if (r == null) {
        r = 1;
      }
      if (g == null) {
        g = 1;
      }
      if (b == null) {
        b = 1;
      }
      if (a == null) {
        a = 1;
      }
      this._vec = vec4.clone(arguments);
      this.set(r, g, b, a);
    }

    Color.prototype.toVec4 = function() {
      return this._vec;
    };

    Color.prototype.toString = function(channels) {
      if (channels == null) {
        channels = 8;
      }
      switch (channels) {
        case 3:
          return "#" + (hexEncode(this.red, 1)) + (hexEncode(this.green, 1)) + (hexEncode(this.blue, 1));
        case 4:
          return "#" + (hexEncode(this.red, 1)) + (hexEncode(this.green, 1)) + (hexEncode(this.blue, 1)) + (hexEncode(this.alpha, 1));
        case 6:
          return "#" + (hexEncode(this.red, 2)) + (hexEncode(this.green, 2)) + (hexEncode(this.blue, 2));
        case 8:
          return "#" + (hexEncode(this.red, 2)) + (hexEncode(this.green, 2)) + (hexEncode(this.blue, 2)) + (hexEncode(this.alpha, 2));
        default:
          throw new Error("Channels must be 3, 4, 6, or 8");
      }
    };

    Color.prototype.set = function(_red, _green, _blue, _alpha) {
      var _ref;

      this._red = _red;
      this._green = _green;
      this._blue = _blue;
      this._alpha = _alpha;
      _ref = [this._red, this._green, this._blue, this._alpha], this._vec = 1 <= _ref.length ? __slice.call(_ref, 0) : [];
      this.trigger('change');
      return this;
    };

    Color.define('red', {
      get: function() {
        return this._red;
      },
      set: function(_red) {
        this._red = _red;
        this._vec[0] = this._red;
        return this.trigger('change');
      }
    });

    Color.define('green', {
      get: function() {
        return this._green;
      },
      set: function(_green) {
        this._green = _green;
        this._vec[1] = this._green;
        return this.trigger('change');
      }
    });

    Color.define('blue', {
      get: function() {
        return this._blue;
      },
      set: function(_blue) {
        this._blue = _blue;
        this._vec[2] = this._blue;
        return this.trigger('change');
      }
    });

    Color.define('alpha', {
      get: function() {
        return this._alpha;
      },
      set: function(_alpha) {
        this._alpha = _alpha;
        this._vec[3] = this._alpha;
        return this.trigger('change');
      }
    });

    Color.prototype.parse = function(value) {
      var c, split;

      if (typeof value === 'string' && value[0] === '#') {
        return parseHexColor(value.slice(1), this);
      } else if (typeof value === 'string' && (split = value.split(' ')).length !== 0) {
        return this.set.apply(this, (function() {
          var _i, _len, _results;

          _results = [];
          for (_i = 0, _len = split.length; _i < _len; _i++) {
            c = split[_i];
            _results.push(parseFloat(c));
          }
          return _results;
        })());
      } else if (value != null ? value.toVec4 : void 0) {
        return this.set.apply(this, value.toVec4());
      } else if (value != null ? value.length : void 0) {
        return this.set.apply(this, value);
      } else {
        return this.set.apply(this, Jax.Util.colorize(value));
      }
    };

    Color.parse = function(value) {
      return new Jax.Color().parse(value);
    };

    return Color;

  })();

}).call(this);
(function() {
  var Mesh,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Mesh = (function() {
    var recalcNormal, recalcPosition;

    Mesh.include(Jax.EventEmitter);

    function Mesh(options) {
      var key, value;

      this._valid = false;
      this.data = new Jax.Mesh.Data;
      this._bounds = new Jax.Mesh.Bounds;
      this._color = new Jax.Color;
      this._initialized = false;
      this.draw_mode || (this.draw_mode = GL_POINTS);
      if (options) {
        if (options.init) {
          this.init = options.init;
        }
        if (options.draw_mode) {
          this.draw_mode = options.draw_mode;
        }
        this.material = options.material || Jax.default_material;
        if (options.color) {
          this.color = options.color;
        }
        delete options.init;
        delete options.draw_mode;
        delete options.material;
        delete options.color;
        for (key in options) {
          value = options[key];
          this[key] = value;
        }
      } else {
        this.material = Jax.default_material;
      }
    }

    Mesh.define('material', {
      get: function() {
        if (!this._invalid) {
          this.validate();
        }
        return this._material;
      },
      set: function(material) {
        if (!material) {
          return this._material = null;
        }
        if (material instanceof Jax.Material) {
          this._material = material;
        } else {
          this._material = Jax.Material.find(material);
        }
        return this._material.name;
      }
    });

    Mesh.define('data', {
      get: function() {
        if (!this._valid) {
          this.validate();
        }
        return this._data;
      },
      set: function(d) {
        var _this = this;

        this.invalidate();
        this._initialized = true;
        if (this._data) {
          this._data.dispose();
        }
        this._data = d;
        this._data.addEventListener('colorChanged', function() {
          return _this.fireEvent('colorChanged');
        });
        this._data.addEventListener('shouldRecalculateNormals', function() {
          return _this.recalculateNormals();
        });
        this._data.addEventListener('shouldRecalculateTangents', function() {
          return _this.recalculateTangents();
        });
        return this._data.addEventListener('shouldRecalculateBitangents', function() {
          return _this.recalculateBitangents();
        });
      }
    });

    Mesh.define('color', {
      get: function() {
        return this._color;
      },
      set: function(color) {
        this._color = color;
        this._data.color = this._color;
        return this.fireEvent('colorChanged');
      }
    });

    Mesh.define('vertices', {
      get: function() {
        if (!this._valid) {
          this.validate();
        }
        return this.data.vertexBuffer;
      }
    });

    Mesh.define('indices', {
      get: function() {
        if (!this._valid) {
          this.validate();
        }
        return this.data.indexBuffer;
      }
    });

    Mesh.define('bounds', {
      get: function() {
        if (!this._valid) {
          this.validate();
        }
        return this._bounds;
      }
    });

    Mesh.define('submesh', {
      get: function() {
        if (!this._valid) {
          this.validate();
        }
        return this._submesh;
      },
      set: function(submesh) {
        if (this._submesh) {
          this._submesh.dispose();
        }
        return this._submesh = submesh;
      }
    });

    Mesh.prototype.draw_mode = GL_POINTS;

    Mesh.prototype.toJSON = function() {
      var i;

      return {
        vertices: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.vertexBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        colors: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.colorBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        textureCoords: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.textureCoordsBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        normals: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.normalBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        tangents: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.tangentBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        bitangents: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.bitangentBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(parseFloat(i.toFixed(6)));
          }
          return _results;
        }).call(this),
        indices: (function() {
          var _i, _len, _ref, _results;

          _ref = this.data.indexBuffer;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(i);
          }
          return _results;
        }).call(this)
      };
    };

    /*
    Immediately recalculates this mesh's vertex normals.
    
    This method is meant to be overridden by subclasses. The default implementation just
    builds a vector from the calculated center of the mesh to each vertex and normalizes
    that vector.
    
    Note that if this mesh has more than 65535 vertices, its sub-mesh will not automatically
    have its normals recalculated, so you'll need to call `mesh.submesh.recalculateNormals()`.
    
    Returns true.
    */


    recalcNormal = vec3.create();

    Mesh.prototype.recalculateNormals = function() {
      var center, i, normals, vertices, _i, _ref;

      normals = this.data.normalBuffer;
      vertices = this.data.vertexBuffer;
      center = this.bounds.center;
      for (i = _i = 0, _ref = vertices.length; _i < _ref; i = _i += 3) {
        recalcNormal[0] = vertices[i];
        recalcNormal[1] = vertices[i + 1];
        recalcNormal[2] = vertices[i + 2];
        vec3.subtract(recalcNormal, recalcNormal, center);
        vec3.normalize(recalcNormal, recalcNormal);
        normals[i] = recalcNormal[0];
        normals[i + 1] = recalcNormal[1];
        normals[i + 2] = recalcNormal[2];
      }
      return true;
    };

    Mesh.prototype.recalculateTangents = function() {
      throw new Error("Can't calculate tangents for " + this.__proto__.constructor.name);
    };

    Mesh.prototype.recalculateBitangents = function() {
      throw new Error("Can't calculate bitangents for " + this.__proto__.constructor.name);
    };

    Mesh.prototype.render = function(context, model, material) {
      if (!this._valid) {
        this.validate();
      }
      if (material) {
        if (!(material instanceof Jax.Material)) {
          material = Jax.Material.find(material);
        }
      } else {
        material = this._material;
      }
      return material.render(context, this, model);
    };

    /*
    Returns true if this mesh is ready to be rendered, false otherwise. Note that the simple act of
    rendering it, in addition to a variety of other actions, will cause the mesh to automatically
    validate itself.
    */


    Mesh.prototype.isValid = function() {
      return this._valid;
    };

    /*
    Marks the mesh as "out of date", forcing it to refresh its vertex information based on the current
    state of its internal buffers the next time any of its data is used.
    
    If `forceRebuild` is true, the current mesh will be discarded and rebuilt (by invoking `#init`)
    the next time the mesh is validated. Otherwise, the current mesh will be reused.
    */


    Mesh.prototype.invalidate = function(forceRebuild) {
      if (forceRebuild == null) {
        forceRebuild = false;
      }
      if (forceRebuild) {
        this._initialized = false;
      }
      return this._valid = false;
    };

    /*
    If the mesh has been invalidated, this function will refresh its vertex information and relevant
    WebGL buffers.
    */


    Mesh.prototype.validate = function() {
      if (this._valid) {
        return;
      }
      if (this.__validating) {
        throw new Error("Already validating -- look for recursion errors!");
      }
      this.__validating = true;
      if (!this._initialized) {
        this.rebuild();
      }
      this._material || (this._material = Jax.Material.find("default"));
      this.recalculateBounds();
      if (this._data.indices_buf) {
        this._data.indices_buf.dispose();
      }
      this._data.indices_buf = new Jax.Buffer(GL_ELEMENT_ARRAY_BUFFER, this._data.indexFormat, GL_STATIC_DRAW, this._data.indexBuffer, 1);
      this.__validating = false;
      this._valid = true;
      this.fireEvent('validated');
      return this;
    };

    Mesh.prototype.rebuild = function() {
      var bitangents, colors, indices, normals, tangents, textures, vertices, _ref;

      if (!this.init) {
        return;
      }
      this.dispose();
      if (!this.__validating) {
        return this.validate();
      }
      _ref = [[], [], [], [], [], [], []], vertices = _ref[0], colors = _ref[1], textures = _ref[2], normals = _ref[3], indices = _ref[4], tangents = _ref[5], bitangents = _ref[6];
      this.init(vertices, colors, textures, normals, indices, tangents, bitangents);
      if (vertices.length > 65535 * 3) {
        this.submesh = this.split(vertices, colors, textures, normals, indices, tangents, bitangents);
      }
      this.data = new Jax.Mesh.Data(vertices, colors, textures, normals, indices, tangents, bitangents);
      this._data.color = this._color;
      this.fireEvent('rebuilt');
      this._initialized = true;
      return this;
    };

    /*
    WebGL supports at most 65535 vertices in a single mesh. If the supplied arrays have more
    vertices than that, those vertices will be removed from the supplied arrays and passed into
    a brand-new instance of Jax.Mesh. The new mesh is returned, or `null` is returned if
    the given array has 65535 or fewer vertices.
    
    Note: the return value will be `null` if the `vertices` array has 65535 or fewer vertices,
    even if the other arrays contain more.
    
    Note: Subclasses of Jax.Mesh.Base are expected to override this method because the
    default implementation treats vertices as a point cloud, and may not produce accurate
    results if the draw mode is something other than GL_POINTS.
    */


    Mesh.prototype.split = function(vertices, colors, textures, normals, indices, tangents, bitangents) {
      var i, max, newMesh, _a, _b, _c, _i, _j, _n, _ref, _t, _v;

      max = 65535;
      if (vertices.length <= max * 3) {
        return null;
      }
      _v = _c = _t = _n = null;
      _i = [];
      _v = vertices.splice(max * 3, vertices.length);
      if (colors.length >= max * 4) {
        _c = colors.splice(max * 4, colors.length);
      }
      if (textures.length >= max * 2) {
        _t = textures.splice(max * 2, textures.length);
      }
      if (normals.length >= max * 3) {
        _n = normals.splice(max * 3, normals.length);
      }
      if (tangents.length >= max * 4) {
        _a = tangents.splice(max * 4, tangents.length);
      }
      if (bitangents.length >= max * 3) {
        _b = bitangents.splice(max * 3, bitangents.length);
      }
      for (i = _j = 0, _ref = indices.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
        if (indices[i] > max) {
          _i.push(indices[i]);
          indices.splice(i, 1);
          i--;
        }
      }
      return newMesh = new this.__proto__.constructor({
        init: function(v, c, t, n, i) {
          var __a, __b, __c, __i, __n, __t, __v, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _o, _p, _q, _r, _results;

          for (_k = 0, _len = _v.length; _k < _len; _k++) {
            __v = _v[_k];
            v.push(__v);
          }
          if (_c) {
            for (_l = 0, _len1 = _c.length; _l < _len1; _l++) {
              __c = _c[_l];
              c.push(__c);
            }
          }
          if (_t) {
            for (_m = 0, _len2 = _t.length; _m < _len2; _m++) {
              __t = _t[_m];
              t.push(__t);
            }
          }
          if (_n) {
            for (_o = 0, _len3 = _n.length; _o < _len3; _o++) {
              __n = _n[_o];
              n.push(__n);
            }
          }
          if (_a) {
            for (_p = 0, _len4 = _a.length; _p < _len4; _p++) {
              __a = _a[_p];
              n.push(__a);
            }
          }
          if (_b) {
            for (_q = 0, _len5 = _b.length; _q < _len5; _q++) {
              __b = _b[_q];
              n.push(__b);
            }
          }
          _results = [];
          for (_r = 0, _len6 = _i.length; _r < _len6; _r++) {
            __i = _i[_r];
            _results.push(i.push(__i - 65535));
          }
          return _results;
        }
      });
    };

    recalcPosition = vec3.create();

    Mesh.prototype.recalculateBounds = function() {
      var back, biggest, bottom, center, depth, front, height, i, left, length, position, right, top, width, _i, _ref, _ref1;

      _ref = [this._bounds.left, this._bounds.right, this._bounds.top, this._bounds.bottom, this._bounds.front, this._bounds.back], left = _ref[0], right = _ref[1], top = _ref[2], bottom = _ref[3], front = _ref[4], back = _ref[5];
      center = this._bounds.center;
      length = this._data.vertexBuffer.length;
      position = recalcPosition;
      biggest = 0;
      for (i = _i = 0; _i < length; i = _i += 3) {
        position[0] = this._data.vertexBuffer[i];
        position[1] = this._data.vertexBuffer[i + 1];
        position[2] = this._data.vertexBuffer[i + 2];
        if (i === 0) {
          vec3.copy(left, position);
          vec3.copy(right, position);
          vec3.copy(top, position);
          vec3.copy(bottom, position);
          vec3.copy(front, position);
          vec3.copy(back, position);
        } else {
          if (position[0] < left[0]) {
            vec3.copy(left, position);
          }
          if (position[0] > right[0]) {
            vec3.copy(right, position);
          }
          if (position[1] < bottom[1]) {
            vec3.copy(bottom, position);
          }
          if (position[1] > top[1]) {
            vec3.copy(top, position);
          }
          if (position[2] < back[2]) {
            vec3.copy(back, position);
          }
          if (position[2] > front[2]) {
            vec3.copy(front, position);
          }
        }
      }
      width = right[0] - left[0];
      height = top[1] - bottom[1];
      depth = front[2] - back[2];
      biggest = (width > height && width > depth ? width : height > depth ? height : depth);
      center[0] = left[0] + width * 0.5;
      center[1] = bottom[1] + height * 0.5;
      center[2] = back[2] + depth * 0.5;
      if (width < Math.EPSILON) {
        width = 0.0001;
      }
      if (height < Math.EPSILON) {
        height = 0.0001;
      }
      if (depth < Math.EPSILON) {
        depth = 0.0001;
      }
      _ref1 = [width, height, depth], this._bounds.width = _ref1[0], this._bounds.height = _ref1[1], this._bounds.depth = _ref1[2];
      this._bounds.radius = biggest / 2;
      return this._bounds;
    };

    Mesh.prototype.getIndexBuffer = function() {
      if (!this._valid) {
        this.validate();
      }
      return this.data.indices_buf;
    };

    Mesh.prototype.setColor = function(c) {
      if (arguments.length > 1) {
        return this.color = arguments;
      } else {
        return this.color = c;
      }
    };

    Mesh.prototype.dispose = function() {
      if (this._data) {
        this._data.dispose();
      }
      if (this._submesh) {
        this._submesh.dispose();
      }
      this._initialized = false;
      return this.invalidate();
    };

    return Mesh;

  })();

  Mesh.Deprecated = (function(_super) {
    __extends(Deprecated, _super);

    function Deprecated() {
      var args, deprecation_message;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      deprecation_message = "Using Jax.Mesh directly has been deprecated. Please use Jax.Mesh.Triangles or a similar variant instead.";
      if (typeof console !== 'undefined') {
        console.log(new Error(deprecation_message).stack);
      } else {
        throw new Error(deprecation_message);
      }
      Deprecated.__super__.constructor.apply(this, args);
    }

    return Deprecated;

  })(Mesh);

  Jax.Mesh = Mesh.Deprecated;

  Jax.Mesh.Base = Mesh;

}).call(this);
(function() {
  Jax.Mesh.Bounds = (function() {
    function Bounds() {
      this.left = vec3.create();
      this.right = vec3.create();
      this.top = vec3.create();
      this.bottom = vec3.create();
      this.front = vec3.create();
      this.back = vec3.create();
      this.center = vec3.create();
      this.width = 0;
      this.height = 0;
      this.depth = 0;
    }

    return Bounds;

  })();

}).call(this);
(function() {
  var FloatBuffer;

  FloatBuffer = (function() {
    function FloatBuffer(buffer, itemSize) {
      this.buffer = buffer;
      this.itemSize = itemSize;
      this.offset = buffer.byteOffset;
    }

    FloatBuffer.prototype.bind = function() {};

    return FloatBuffer;

  })();

  Jax.Mesh.Data = (function() {
    var calcByteLength, chooseIndexArrayFormat, tmpvec3;

    Data.include(Jax.EventEmitter);

    /*
    Contains extra data points that will be allocated, and the number
    of elements per vertex that will be allocated.
    
    Example: A property called 'moreVertices' with a value of 3 will,
    for a mesh with 9 vertices, allocate an additional buffer with 27
    components.
    
    Elements allocated in this way are not populated with data because
    Jax.Mesh.Data can't know what data belongs in the endpoint.
    */


    Data.endpoints = {};

    chooseIndexArrayFormat = function(length) {
      if (length < 256) {
        return Uint8Array;
      } else if (length < 65536) {
        return Uint16Array;
      }
      return Uint32Array;
    };

    calcByteLength = function(numVerts, numIndices, indexFormat) {
      var name, size, sizePerVertex, _ref;

      sizePerVertex = 0;
      _ref = Jax.Mesh.Data.endpoints;
      for (name in _ref) {
        size = _ref[name];
        sizePerVertex += size;
      }
      return sizePerVertex * numVerts * Float32Array.BYTES_PER_ELEMENT + numVerts * 9 * Float32Array.BYTES_PER_ELEMENT + numVerts * 2 * Float32Array.BYTES_PER_ELEMENT + numVerts * 8 * Float32Array.BYTES_PER_ELEMENT + numIndices * indexFormat.BYTES_PER_ELEMENT;
    };

    function Data(vertices, colors, textures, normals, indices, tangents, bitangents) {
      var i, _i, _j, _ref, _ref1;

      if (vertices == null) {
        vertices = [];
      }
      if (colors == null) {
        colors = [];
      }
      if (textures == null) {
        textures = [];
      }
      if (normals == null) {
        normals = [];
      }
      if (indices == null) {
        indices = [];
      }
      if (tangents == null) {
        tangents = [];
      }
      if (bitangents == null) {
        bitangents = [];
      }
      if (typeof vertices === 'number') {
        vertices = new Array(vertices);
      }
      if (vertices % 3) {
        throw new Error("Vertex data length must be given in multiples of 3");
      }
      this._offsets = {};
      this._buffers = {};
      this._wrappers = {};
      this.allocateBuffers(vertices.length, indices.length || vertices.length / 3);
      if (indices.length === 0) {
        for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          indices.push(i);
        }
      }
      this.assignVertexData(vertices, colors, textures, normals, tangents, bitangents);
      this.freezeColors();
      for (i = _j = 0, _ref1 = indices.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        this.indexBuffer[i] = indices[i];
      }
      this.usage = GL_STATIC_DRAW;
      this.target = GL_ARRAY_BUFFER;
      this._glBuffers = {};
      this._valid = {};
    }

    Data.define('color', {
      get: function() {
        return this._color;
      },
      set: function(color) {
        var i, _i, _ref, _results;

        this.fireEvent('colorChanged');
        this.invalidate();
        this._color = Jax.Color.parse(color);
        _results = [];
        for (i = _i = 0, _ref = this.colorBuffer.length; _i < _ref; i = _i += 4) {
          this.colorBuffer[i] = this.originalColors[i] * this._color.red;
          this.colorBuffer[i + 1] = this.originalColors[i + 1] * this._color.green;
          this.colorBuffer[i + 2] = this.originalColors[i + 2] * this._color.blue;
          _results.push(this.colorBuffer[i + 3] = this.originalColors[i + 3] * this._color.alpha);
        }
        return _results;
      }
    });

    Data.define('context', {
      set: function(context) {
        this._bound = false;
        return this._context = context;
      }
    });

    Data.getter('tangentBuffer', function() {
      if (this.shouldRecalculateTangents()) {
        this.recalculateTangents();
      }
      return this._tangentBuffer;
    });

    Data.getter('bitangentBuffer', function() {
      if (this.shouldRecalculateBitangents()) {
        this.recalculateBitangents();
      }
      return this._bitangentBuffer;
    });

    Data.getter('normalBuffer', function() {
      if (this.shouldRecalculateNormals()) {
        this.recalculateNormals();
      }
      return this._normalBuffer;
    });

    /*
    Marks the current color data as "original". Changing the color of the
    mesh via `data.color = [...]` will blend the specified color with
    the colors as they are now, regardless of what they were when the mesh
    data was originally constructed.
    */


    Data.prototype.freezeColors = function() {
      var i, _i, _ref, _results;

      this.originalColors || (this.originalColors = new Float32Array(this.colorBuffer.length));
      _results = [];
      for (i = _i = 0, _ref = this.colorBuffer.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.originalColors[i] = this.colorBuffer[i]);
      }
      return _results;
    };

    /*
    Marks the mesh data as having changed. The next time the data is bound
    to a GL context, the corresponding GL buffers will be refreshed.
    */


    Data.prototype.invalidate = function() {
      var id, _results;

      _results = [];
      for (id in this._valid) {
        _results.push(this._valid[id] = false);
      }
      return _results;
    };

    /*
    Deletes all GL buffers. Call this before you delete your handle to this
    data, or risk memory leaks.
    */


    Data.prototype.dispose = function() {
      var descriptor, id, _ref, _results;

      _ref = this._glBuffers;
      _results = [];
      for (id in _ref) {
        descriptor = _ref[id];
        _results.push(delete this._glBuffers.id);
      }
      return _results;
    };

    /*
    Bind the data to the current GL context, or to the specified one if given.
    */


    Data.prototype.bind = function(context) {
      var buffer, gl, id, _ref;

      if (context) {
        this.context = context;
      }
      id = this._context.id;
      gl = this._context.gl;
      if (!(buffer = (_ref = this._glBuffers[id]) != null ? _ref.buffer : void 0)) {
        this._glBuffers[id] = {
          gl: gl,
          buffer: gl.createBuffer()
        };
        gl.bindBuffer(GL_ARRAY_BUFFER, this._glBuffers[id].buffer);
        gl.bufferData(GL_ARRAY_BUFFER, this._array_buffer, GL_STATIC_DRAW);
      } else {
        gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
        if (!this._valid[id]) {
          gl.bufferData(GL_ARRAY_BUFFER, this._array_buffer, GL_STATIC_DRAW);
        }
      }
      this._valid[id] = true;
      return this._bound = true;
    };

    /*
    Sets shader variables to refer to data from this mesh, depending on the
    mapping you give it. The `vars` parameter should be the variable set
    as seen in `Jax.Material.Layer#setVariables`.
    
    Example:
    
    class Jax.Material.SomethingCool extends Jax.Material.Layer
      setVariables: (context, mesh, model, vars, pass) ->
        mesh.data.set vars,
          vertices: 'ShaderVertexAttribute'
          colors:   'ShaderColorAttribute'
          textures: 'ShaderTextureCoordsAttribute'
          normals:  'ShaderNormalAttribute'
      
    Valid keys include:
      * vertices:   3-component vertex position data stored as X, Y, Z.
      * colors:     4-component color data stored as R, G, B, A.
      * textures:   2-component texture coordinate data stored as S, T.
      * normals:    3-component vertex normal data stored as X, Y, Z.
      * tangents:   4-component tangent data stored as X, Y, Z, W.
      * bitangents: 3-component bitangent data stored as X, Y, Z.
      
    Face normals are unit-length vectors which point perpendicular to the
    points of a polygon. Vertex normals are the average of all face normals
    shared by a single vertex.
    
    Tangents are unit-length vectors which are parallel to the surface of
    the face, aligned with the S-component of the texture coordinates. Their
    W component is 1 when the tangent matrix is right-handed, -1 when left-handed.
    
    Bitangents are unit-length vectors which are parallel to the surface of
    the face, aligned with the T-component of the texture coordinates. They
    are sometime erroneously referred to as binormals. They can be calculated
    on the fly with the formula `B = Tw * cross(N, T)` where Tw is the W component
    of the corresponding tangent, N is the vertex normal, and T is the first 3
    components of the tangent.
    */


    Data.prototype.set = function(vars, mapping) {
      var key, target, _results;

      if (!this._context) {
        throw new Error("Jax context for this pass is not set");
      }
      if (mapping === void 0) {
        throw new Error("Expected two arguments, mapping is undefined");
      }
      if (!this._bound) {
        this.bind(this._context);
      }
      _results = [];
      for (key in mapping) {
        target = mapping[key];
        switch (key) {
          case 'vertices':
            _results.push(vars[target] = this.vertexWrapper);
            break;
          case 'colors':
            _results.push(vars[target] = this.colorWrapper);
            break;
          case 'textures':
            _results.push(vars[target] = this.textureCoordsWrapper);
            break;
          case 'normals':
            if (this.shouldRecalculateNormals()) {
              this.recalculateNormals();
            }
            _results.push(vars[target] = this.normalWrapper);
            break;
          case 'tangents':
            if (this.shouldRecalculateTangents()) {
              this.recalculateTangents();
            }
            _results.push(vars[target] = this.tangentWrapper);
            break;
          case 'bitangents':
            if (this.shouldRecalculateBitangents()) {
              this.recalculateBitangents();
            }
            _results.push(vars[target] = this.bitangentWrapper);
            break;
          default:
            if (this._wrappers[key]) {
              _results.push(vars[target] = this._wrappers[key]);
            } else {
              throw new Error("Mapping key must be one of 'vertices', 'colors', " + ("'textures', 'normals', 'tangents', 'bitangents' (got: " + key + ")"));
            }
        }
      }
      return _results;
    };

    /*
    Requests this data set's normals to be recalculated. Note that this does not directly
    perform the recalculation. Instead, it fires a `shouldRecalculateNormals` event, so
    that the object containing this mesh data can control the method in which normals
    are calculated. For example, a point cloud might calculate its normals entirely
    differently from a triangle mesh, and it is not the responsibility of `Jax.Mesh.Data`
    to keep track of which algorithm it should use.
    */


    Data.prototype.recalculateNormals = function() {
      this._shouldRecalculateNormals = false;
      this.fireEvent('shouldRecalculateNormals');
      this.invalidate();
      return true;
    };

    /*
    Requests this data set's tangents to be recalculated. Note that this does not directly
    perform the recalculation. Instead, it fires a `shouldRecalculateTangents` event, so
    that the object containing this mesh data can control the method in which tangents
    are calculated.
    */


    Data.prototype.recalculateTangents = function() {
      this._shouldRecalculateTangents = false;
      this.fireEvent('shouldRecalculateTangents');
      this.invalidate();
      return true;
    };

    /*
    Requests this data set's bitangents to be recalculated. Note that this does not directly
    perform the recalculation. Instead, it fires a `shouldRecalculateBitangents` event, so
    that the object containing this mesh data can control the method in which bitangents
    are calculated.
    */


    Data.prototype.recalculateBitangents = function() {
      this._shouldRecalculateBitangents = false;
      this.fireEvent('shouldRecalculateBitangents');
      this.invalidate();
      return true;
    };

    /*
    Returns true if the mesh data has detected that its normal data should be recalculated.
    */


    Data.prototype.shouldRecalculateNormals = function() {
      return this._shouldRecalculateNormals;
    };

    Data.prototype.shouldRecalculateTangents = function() {
      return this._shouldRecalculateTangents;
    };

    Data.prototype.shouldRecalculateBitangents = function() {
      return this._shouldRecalculateBitangents;
    };

    /*
    Allocate or reallocate the typed array buffer and data views. This is called during
    construction and should not be called explicitly unless you really know what you're
    doing.
    */


    Data.prototype.allocateBuffers = function(numVertices, numIndices) {
      var buffer, byteLength, getterFactory, name, offset, size, wrapper, _ref;

      this.length = numVertices / 3;
      this.indexFormat = chooseIndexArrayFormat(this.length);
      byteLength = calcByteLength(this.length, numIndices, this.indexFormat);
      this._array_buffer = new ArrayBuffer(byteLength);
      this.vertexBufferOffset = 0;
      this.vertexBuffer = new Float32Array(this._array_buffer, this.vertexBufferOffset, this.length * 3);
      this.vertexWrapper = new FloatBuffer(this.vertexBuffer, 3);
      this.textureCoordsBufferOffset = this.vertexBufferOffset + Float32Array.BYTES_PER_ELEMENT * this.vertexBuffer.length;
      this.textureCoordsBuffer = new Float32Array(this._array_buffer, this.textureCoordsBufferOffset, this.length * 2);
      this.textureCoordsWrapper = new FloatBuffer(this.textureCoordsBuffer, 2);
      this.normalBufferOffset = this.textureCoordsBufferOffset + Float32Array.BYTES_PER_ELEMENT * this.textureCoordsBuffer.length;
      this._normalBuffer = new Float32Array(this._array_buffer, this.normalBufferOffset, this.length * 3);
      this.normalWrapper = new FloatBuffer(this._normalBuffer, 3);
      this.colorBufferOffset = this.normalBufferOffset + Float32Array.BYTES_PER_ELEMENT * this._normalBuffer.length;
      this.colorBuffer = new Float32Array(this._array_buffer, this.colorBufferOffset, this.length * 4);
      this.colorWrapper = new FloatBuffer(this.colorBuffer, 4);
      this.tangentBufferOffset = this.colorBufferOffset + Float32Array.BYTES_PER_ELEMENT * this.colorBuffer.length;
      this._tangentBuffer = new Float32Array(this._array_buffer, this.tangentBufferOffset, this.length * 4);
      this.tangentWrapper = new FloatBuffer(this._tangentBuffer, 4);
      this.bitangentBufferOffset = this.tangentBufferOffset + Float32Array.BYTES_PER_ELEMENT * this.tangentBuffer.length;
      this._bitangentBuffer = new Float32Array(this._array_buffer, this.bitangentBufferOffset, this.length * 3);
      this.bitangentWrapper = new FloatBuffer(this._bitangentBuffer, 3);
      offset = this.bitangentBufferOffset + Float32Array.BYTES_PER_ELEMENT * this.bitangentBuffer.length;
      getterFactory = function(name) {
        return function() {
          return this._buffers[name];
        };
      };
      _ref = Jax.Mesh.Data.endpoints;
      for (name in _ref) {
        size = _ref[name];
        buffer = new Float32Array(this._array_buffer, offset, this.length * size);
        wrapper = new FloatBuffer(buffer, size);
        this._offsets[name] = offset;
        this._buffers[name] = buffer;
        this._wrappers[name] = wrapper;
        offset += buffer.length * Float32Array.BYTES_PER_ELEMENT;
        Object.defineProperty(this, name, {
          get: getterFactory(name)
        });
      }
      this.indexBufferOffset = offset;
      return this.indexBuffer = new this.indexFormat(this._array_buffer, this.indexBufferOffset, numIndices);
    };

    tmpvec3 = vec3.create();

    /*
    Assigns vertex data to the mesh. If color data is omitted, the color of
    each vertex will default to white. Normal data will be calculated if omitted,
    but this takes a lot of time and it's recommended to supply normal data if you
    have it. Texture coords will default to 0 if omitted, resulting in a mesh
    that is incapable of displaying textures (but should work fine with non-textured
    materials).
    
    This is called during construction. While you should be able to get away with
    calling it explicitly, beware that doing so was not the original intended design
    of this class so you may not get the results you were expecting. Also, be sure
    not to assign data for more vertices than memory has been allocated for.
    */


    Data.prototype.assignVertexData = function(vertices, colors, textures, normals, tangents, bitangents) {
      var length, ofs, ofs2, ofs3, ofs4, _btan, _cbuf, _i, _nbuf, _ref, _ref1, _results, _tans, _tbuf, _vbuf;

      _ref = [this.vertexBuffer, this._normalBuffer, this.colorBuffer, this.textureCoordsBuffer, this._tangentBuffer, this._bitangentBuffer], _vbuf = _ref[0], _nbuf = _ref[1], _cbuf = _ref[2], _tbuf = _ref[3], _tans = _ref[4], _btan = _ref[5];
      length = this.length;
      this._shouldRecalculateNormals = normals.length === 0;
      this._shouldRecalculateTangents = tangents.length === 0;
      this._shouldRecalculateBitangents = bitangents.length === 0;
      _results = [];
      for (ofs = _i = 0; 0 <= length ? _i < length : _i > length; ofs = 0 <= length ? ++_i : --_i) {
        _ref1 = [ofs * 2, ofs * 3, ofs * 4], ofs2 = _ref1[0], ofs3 = _ref1[1], ofs4 = _ref1[2];
        _vbuf[ofs3] = vertices[ofs3];
        _vbuf[ofs3 + 1] = vertices[ofs3 + 1];
        _vbuf[ofs3 + 2] = vertices[ofs3 + 2];
        _nbuf[ofs3] = normals[ofs3];
        _nbuf[ofs3 + 1] = normals[ofs3 + 1];
        _nbuf[ofs3 + 2] = normals[ofs3 + 2];
        _tans[ofs4] = tangents[ofs4];
        _tans[ofs4 + 1] = tangents[ofs4 + 1];
        _tans[ofs4 + 2] = tangents[ofs4 + 2];
        _tans[ofs4 + 3] = tangents[ofs4 + 3];
        _btan[ofs4] = bitangents[ofs3];
        _btan[ofs4 + 1] = bitangents[ofs3 + 1];
        _btan[ofs4 + 2] = bitangents[ofs3 + 2];
        _tbuf[ofs2] = textures[ofs2] || 0;
        _tbuf[ofs2 + 1] = textures[ofs2 + 1] || 0;
        if (colors.length <= ofs4) {
          _results.push(_cbuf[ofs4] = _cbuf[ofs4 + 1] = _cbuf[ofs4 + 2] = _cbuf[ofs4 + 3] = 1);
        } else {
          _cbuf[ofs4] = colors[ofs4];
          _cbuf[ofs4 + 1] = colors[ofs4 + 1];
          _cbuf[ofs4 + 2] = colors[ofs4 + 2];
          _results.push(_cbuf[ofs4 + 3] = colors[ofs4 + 3]);
        }
      }
      return _results;
    };

    return Data;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Jax.Mesh.Lines = (function(_super) {
    __extends(Lines, _super);

    function Lines() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.draw_mode || (this.draw_mode = GL_LINES);
      Lines.__super__.constructor.apply(this, args);
    }

    return Lines;

  })(Jax.Mesh.Base);

}).call(this);





/**
 * Jax.Geometry
 * Namespace containing geometric classes and functions
 **/

Jax.Geometry = {
  DISJOINT: 0,
  COINCIDE: 1,
  INTERSECT: 2,
};
/**
 * class Jax.Geometry.Line
 *
 **/

Jax.Geometry.Line = (function() {
  var bufs = {};
  
  var Line = Jax.Class.create({
    /**
     * new Jax.Geometry.Line([a[, b]])
     * - a (vec3): point A (optional)
     * - b (vec3): point B (optional)
     *
     * Creates a new line. If point A and B are given, they are
     * passed into #set to initialize the line. If they are not
     * given, all values default to 0.
     **/
    initialize: function(a, b) {
      /**
       * Jax.Geometry.Line#a -> vec3
       *
       * the starting point of this line
       **/

      this.a = vec3.create();

      /**
       * Jax.Geometry.Line#b -> vec3
       *
       * the ending point of this line
       **/
      this.b = vec3.create();

      /**
       * Jax.Geometry.Line#normal -> vec3
       *
       * the normal for this line, pointing from A towards B.
       **/
      this.normal = vec3.create();

      /**
       * Jax.Geometry.Line#length -> Number
       *
       * the length of this line
       **/
      this.length = 0;
      
      if (arguments.length) this.set(a, b);
    },
    
    /**
     * Jax.Geometry.Line#set(a, b) -> Jax.Geometry.Line
     * - a (vec3): point A
     * - b (vec3): point B
     *
     * Sets this line to span from point A to point B.
     * Also recalculates the length and normal for this line.
     **/
    set: function(a, b) {
      vec3.copy(this.a, a);
      vec3.copy(this.b, b);
      
      vec3.subtract(this.normal, b, a);
      this.length = vec3.length(this.normal);
      vec3.normalize(this.normal, this.normal);
      
      return this;
    },
    
    /**
     * Jax.Geometry.Line#contains(point) -> Boolean
     * - point (vec3): a 3D point
     *
     * Tests and returns whether this line contains the specified point.
     **/
    contains: function(point) {
      // check whether the normal from A to B is the same as the normal from A to P,
      // and whether the normal from B to A is the same as the normal from B to P.
      // There's probably a more efficient way to do this...
      
      var ba = vec3.subtract(bufs.ba || (bufs.ba = vec3.create()), this.b, this.a);
      var pa = vec3.subtract(bufs.pa || (bufs.pa = vec3.create()), point,  this.a);
      var ab = vec3.subtract(bufs.ab || (bufs.ab = vec3.create()), this.a, this.b);
      var pb = vec3.subtract(bufs.pb || (bufs.pb = vec3.create()), point,  this.b);
      
      vec3.normalize(ba, ba);
      vec3.normalize(pa, pa);
      vec3.normalize(ab, ab);
      vec3.normalize(pb, pb);
      
      return Math.equalish(ba, pa) && Math.equalish(ab, pb);
    },
    
    /**
     * Jax.Geometry.Line#intersectLineSegment(line[, dest]) -> Boolean
     * - line (Jax.Geometry.Line): the line to test for intersection
     * - dest (Jax.Geometry.Line | vec3): an optional receiver
     *
     * Tests the two lines for intersection. If +dest+ is given, the overlap is stored
     * within it. (If the lines intersect at a single point, but do not overlap, then
     * only the A point in +dest+ will be set.) If +dest+ is
     * omitted, this information is ignored. If +dest+ is a vec3, it will hold the center
     * of the intersection line.
     *
     * If the lines do not interesct, Jax.Geometry.DISJOINT (which is equal to 0) is returned.
     * If they intersect in a single unique point, Jax.Geometry.INTERSECT is returned.
     * If they intersect in a sub-segment, Jax.Geometry.COINCIDE is returned.
     **/
    intersectLineSegment: function(line, dest) {
      var u = vec3.subtract(vec3.create(), this.b, this.a);
      var v = vec3.subtract(vec3.create(), line.b, line.a);
      var w = vec3.subtract(vec3.create(), this.a, line.a);
      var D = (u[0] * v[1] - u[1] * v[0]);
      var isVec3 = dest && !(dest instanceof Jax.Geometry.Line);
      if (Math.abs(D) < Math.EPSILON) { // S1 and S2 are parallel
        if ((u[0] * w[1] - u[1] * w[0]) != 0 || (v[0] * w[1] - v[1] * w[0]) != 0) {
          return Jax.Geometry.DISJOINT; // they are NOT colinear
        }
        // they are colinear or degenerate
        // check if they are degenerate points
        var du = vec3.dot(u, u);
        var dv = vec3.dot(v, v);
        if (du == 0 && dv == 0) { // both segments are points
          if (!Math.equalish(this.a, line.a)) // they are distinct points
            return Jax.Geometry.DISJOINT;
          // they are the same point
          if (dest)
            if (isVec3) vec3.copy(dest, line.a);
            else vec3.copy(dest.a, line.a);
          // vec3.set(line.a, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (du == 0) { // +this+ is a single point
          if (!line.contains(this.a)) // but is not in S2
            return Jax.Geometry.DISJOINT;
          if (dest)
            if (isVec3) vec3.copy(dest, this.a);
            else vec3.copy(dest.a, this.a);
          // vec3.set(this.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (dv == 0) { // +line+ is a single point
          if (!this.contains(line.a)) // but is not in this line
            return Jax.Geometry.DISJOINT;
          if (dest)
            if (isVec3) vec3.set(dest, line.a);
            else vec3.set(dest.a, line.a);
          // vec3.set(line.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        // they are colinear segments - get overlap (or not)
        var t0, t1; // endpoints of +this+ in eqn for +line+
        var w2 = vec3.subtract(vec3.create(), this.a, line.a);
        if (v[0] != 0) {
          t0 = w[0] / v[0];
          t1 = w2[0] / v[0];
        } else {
          t0 = w[1] / v[1];
          t1 = w2[1] / v[1];
        }
        if (t0 > t1) { // must have t0 smaller than t1
          var t = t0; t0 = t1; t1 = t;
        }
        if (t0 > 1 || t1 < 0) // NO overlap
          return Jax.Geometry.DISJOINT;
        t0 = t0 < 0 ? 0 : t0; // clamp to min 0
        t1 = t1 > 1 ? 1 : t1; // clamp to max 1
        if (t0 == t1) {
          // intersect is a point
          if (line) {
            if (dest) {
              var dest_a = isVec3 ? dest : dest.a;
              vec3.add(dest_a, line.a, vec3.scale(dest_a, v, t0));
            }
            return Jax.Geometry.INTERSECT;
          }
        }
          
        // they overlap in a valid subsegment
        if (dest) {
          if (isVec3) {
            var tmp = bufs.tmp || (bufs.tmp = vec3.create());
            vec3.add(dest, line.a, vec3.scale(dest, v, t0));
            vec3.add(tmp,  line.b, vec3.scale(tmp,  v, t1));
            vec3.scale(dest, dest, 0.5);
          } else {
            vec3.add(dest.a, line.a, vec3.scale(dest.a, v, t0));
            vec3.add(dest.b, line.b, vec3.scale(dest.b, v, t1));
          }
        }
        return Jax.Geometry.COINCIDENT;
      }
      
      // the segments are askew and may intersect in a point
      // get the intersect parameter for +this+
      var sI = (v[0] * w[1] - v[1] * w[0]) / D;
      if (sI < 0 || sI > 1) // no intersect with +this+
        return Jax.Geometry.DISJOINT;
      // get the intersect parameter for +line+
      var tI = (u[0] * w[1] - u[1] * w[0]) / D;
      if (tI < 0 || tI > 1) // no intersect with +line+
        return Jax.Geometry.DISJOINT;
        
      if (dest) vec3.add(dest, this.a, vec3.scale(dest, u, sI));
      return Jax.Geometry.INTERSECT;
    },
    
    toString: function() {
      return "[Line a:"+this.a+", b:"+this.b+"]";
    }
  });
  
  // array-style accessors
  Object.defineProperty(Line.prototype, 0, {
    get: function() { return this.a; },
    set: function(v) { return this.a = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Line.prototype, 1, {
    get: function() { return this.b; },
    set: function(v) { return this.b = v; },
    enumerable: false,
    configurable: false
  });
  
  return Line;
})();
/**
 * class Jax.Geometry.Plane
 *
 * Represents a plane in 3 dimensions.
 *
 * Examples:
 *
 *     new Jax.Geometry.Plane([0,0,0], [0,1,0], [1,0,0]);
 *     new Jax.Geometry.Plane([[0,0,0], [0,1,0], [1,0,0]]);
 *     new Jax.Geometry.Plane();
 *
 **/

Jax.Geometry.Plane = (function() {
  var bufs = {};
  
  function innerProduct(a, x, y, z) {
    return (a[0]*x + a[1]*y + a[2]*z);
  }

  var Plane = Jax.Class.create({
    toString: function() {
      return "[Plane normal:"+vec3.str(this.normal)+"; D:"+this.d+"]";
    },
    
    /**
     * Jax.Geometry.Plane#intersectTriangle(t[, line]) -> Boolean
     * - t (Jax.Geometry.Triangle): a triangle
     * - line (Jax.Geometry.Line): optional Line to store the line of intersection
     *
     * Tests the triangle for intersection with this plane. If an intersection is found,
     * it may be stored in +line+. If +line+ is omitted, this data is ignored.
     *
     * Returns the result of the test: true for intersection, false otherwise.
     **/
    intersectTriangle: function(t, line) {
      var ad = this.classifyVec3(t.a), bd = this.classifyVec3(t.b), cd = this.classifyVec3(t.c);
      var sideAB = ad * bd, sideBC = bd * cd;
      if (sideAB > 0.0 && sideBC > 0.0) return false; // all points on same side of plane
      
      // at this point we know there is an intersection. If +line+ is undefined, we can stop.
      if (!line) return true;
      
      // find which point is on opposite side of plane, and which 2 lie on same side
      var otherSide, sameSide1, sameSide2;
      if (sideAB > 0) {
        sameSide1 = t.a;
        sameSide2 = t.b;
        otherSide = t.c;
      } else {
        if (sideBC > 0) {
          otherSide = t.a;
          sameSide1 = t.b;
          sameSide2 = t.c;
        } else {
          sameSide1 = t.a;
          otherSide = t.b;
          sameSide2 = t.c;
        }
      }
      
      var seg1 = bufs.tri_seg1 = bufs.tri_seg1 || new Jax.Geometry.Line();
      var seg2 = bufs.tri_seg2 = bufs.tri_seg2 || new Jax.Geometry.Line();
      seg1.set(otherSide, sameSide1);
      seg2.set(otherSide, sameSide2);
      
      // the result is simply the line from the intersection point of seg1 to the isect of seg2
      var p1 = bufs.tri_p1 = bufs.tri_p1 || vec3.create(),
          p2 = bufs.tri_p2 = bufs.tri_p2 || vec3.create();
      this.intersectLineSegment(seg1, p1);
      this.intersectLineSegment(seg2, p2);
      return line.set(p1, p2);
    },
    
    /**
     * Jax.Geometry.Plane#intersectLineSegment(line[, point]) -> Number
     * - line (Jax.Geometry.Line): a Line to test against
     * - point (vec3): an optional receiving vec3 to store the point of intersection in
     *
     * Returns Jax.Geometry.DISJOINT (which equals 0) if no intersection occurs,
     * Jax.Geometry.COINCIDE if the line segment is contained on this plane,
     * or Jax.Geometry.INTERSECT if the line segment intersects this plane.
     *
     * In the last case, if +point+ is given, the exact point of intersection will be
     * stored. Otherwise, this data is ignored.
     **/
    intersectLineSegment: function(line, point) {
      var u = vec3.subtract((bufs.lineseg_u = bufs.lineseg_u || vec3.create()), line.b, line.a);
      var w = vec3.subtract((bufs.lineseg_w = bufs.lineseg_w || vec3.create()), line.a, this.point);
      var D =  vec3.dot(this.normal, u);
      var N = -vec3.dot(this.normal, w);
      
      if (Math.abs(D) < Math.EPSILON)             // segment is parallel to plane
        if (N == 0) return Jax.Geometry.COINCIDE; // segment lies in plane
        else return Jax.Geometry.DISJOINT;
      
      // they are not parallel
      var sI = N / D;
      if (sI < 0 || sI > 1)
        return Jax.Geometry.DISJOINT;
      
      if (point)
        vec3.add(point, line.a, vec3.scale(point, u, sI));
      
      return Jax.Geometry.INTERSECT;
    },
    
    /**
     * Jax.Geometry.Plane#intersectRay(origin, direction) -> Number | false
     * - origin (vec3): the point at which the ray begins
     * - direction (vec3): the direction the ray extends. This must be
     *                     a unit vector.
     *
     * Returns the distance along the ray at which an intersection with this
     * plane occurs. If the ray is parallel to this plane, returns false.
     * If the ray is pointing away from this plane, a negative number will
     * be returned.
     *
     * The +direction+ argument must be normalized for the result to be accurate.
     **/
    intersectRay: function(origin, direction) {
      var numer = vec3.dot(this.normal, origin) + this.d;
      var denom = vec3.dot(this.normal, direction);
      
      if (denom == 0) // normal is orthogonal to vector, can't intersect
        return false;
        
      var result = -(numer / denom);
      return -(numer / denom);
    },
    
    /**
     * Jax.Geometry.Plane#intersectPlane(p[, line]) -> Number
     * - p (Jax.Geometry.Plane): the plane to test for intersection
     * - line (Jax.Geometry.Line): an optional receiving Line to contain the intersection
     *
     * Tests this plane against the +p+ for intersection. If no intersection is found,
     * the value Jax.Geometry.DISJOINT (which equals 0) is returned.
     *
     * If the planes are the same, the value Jax.Geometry.COINCIDE is returned.
     *
     * Otherwise, the value Jax.Geometry.INTERSECT is returned. If +line+ was given,
     * the exact line of intersection will be stored within it. Otherwise, this data
     * is ignored.
     **/
    intersectPlane: function(p, line) {
      var d1 = this.d, d2 = p.d;
      var p1n = this.normal, p2n = p.normal;
      var u = bufs.u = bufs.u || vec3.create();
      vec3.cross(u, p1n, p2n);
      var ax = (u[0] >= 0 ? u[0] : -u[0]);
      var ay = (u[1] >= 0 ? u[1] : -u[1]);
      var az = (u[2] >= 0 ? u[2] : -u[2]);
      
      // test if the two planes are parallel
      if ((ax+ay+az) < Math.EPSILON) { // planes are near parallel
        // test if disjoint or coincide
        if (Math.equalish(d1, d2)) return Jax.Geometry.COINCIDE;
        else return Jax.Geometry.DISJOINT;
      }
      
      if (line) {
        // both planes intersect a line
        // first determine max abs coordinate of cross product
        var maxc;
        if (ax > ay)
          if (ax > az) maxc = 0;
          else maxc = 2;
        else
          if (ay > az) maxc = 1;
          else maxc = 2;
        
        // next, to get a point on the intersect line
        // zero the max coord, and solve for the other two
        var iP = bufs.iP = bufs.iP || vec3.create(); // intersection point
        switch(maxc) {
          case 0: // intersect with x = 0
            iP[0] = 0;
            iP[1] = (d2 * p1n[2] - d1 * p2n[2]) / u[0];
            iP[2] = (d1 * p2n[1] - d2 * p1n[1]) / u[0];
            break;
          case 1: // intersect with y = 0
            iP[0] = (d1 * p2n[2] - d2 * p1n[2]) / u[1];
            iP[1] = 0;
            iP[2] = (d2 * p1n[0] - d1 * p2n[0]) / u[1];
            break;
          case 2: // intersect with z = 0
            iP[0] = (d2 * p1n[1] - d1 * p2n[1]) / u[2];
            iP[1] = (d1 * p2n[0] - d2 * p1n[0]) / u[2];
            iP[2] = 0;
            break;
        }
        
        vec3.copy(line[0], iP);
        vec3.add(line[1], iP, u);
      }
      
      return Jax.Geometry.INTERSECT;
    },
    
    /**
     * new Jax.Geometry.Plane(v1, v2, v3)
     * new Jax.Geometry.Plane(position, normal)
     * new Jax.Geometry.Plane(array_of_vertices)
     * new Jax.Geometry.Plane()
     * - v1 (vec3): first vertex
     * - v2 (vec3): second vertex
     * - v3 (vec3): third vertex
     * - array_of_vertices (Array): array of vertices in the form +[[x,y,z], [x,y,z], [x,y,z]]+
     * - position (vec3): the position of a point known to be in the plane
     * - normal (vec3): the vector normal to the surface of the plane
     *
     * If initialized with no arguments, the result is undefined until
     * the +set+ method is called. See +Jax.Geometry.Plane#set+
     **/
    initialize: function(points) {
      /**
       * Jax.Geometry.Plane#point -> vec3
       *
       * A point in world space known to coincide with this plane.
       *
       * You can construct a duplicate of this plane with the following code:
       *
       *     var copy = new Plane(plane.point, plane.normal);
       *
       **/
      this.point = vec3.create();
      
      /**
       * Jax.Geometry.Plane#normal -> vec3
       *
       * The normal pointing perpendicular to this plane, assuming the front face is produced
       * by winding the vertices counter-clockwise.
       *
       * If the plane is constructed with no arguments, the normal defaults to the world up
       * direction [0,1,0].
       **/
      this.normal = vec3.clone([0,1,0]);
      
      /**
       * Jax.Geometry.Plane#d -> Number
       *
       * The fourth component in the plane equation.
       **/
      this.d = 0.0;
      
      if (arguments.length)
        this.set.apply(this, arguments);
    },
    
    /**
     * Jax.Geometry.Plane#classifyVec3(O) -> Number
     * - O (vec3): origin
     * 
     * equivalent to vec3.dot(this.normal, O) + this.d;
     **/
    classifyVec3: function(O) {
      if (O.array) return vec3.dot(this.normal, O.array) + this.d;
      else return vec3.dot(this.normal, O) + this.d;
    },
    
    /**
     * Jax.Geometry.Plane#classify(x, y, z) -> Number
     * 
     * equivalent to (but faster than) vec3.dot(this.normal, [x, y, z]) + this.d;
     **/
    classify: function(x, y, z) {
      var n = this.normal;
      return n[0] * x + n[1] * y + n[2] * z + this.d;
    },
    
    /**
     * Jax.Geometry.Plane#set(points) -> Jax.Geometry.Plane
     * Jax.Geometry.Plane#set(point0, point1, point2) -> Jax.Geometry.Plane
     * Jax.Geometry.Plane#set(position, normal) -> Jax.Geometry.Plane
     * - points (Array): an array of 3 vectors.
     * - point0 (vec3): the first of 3 vectors.
     * - point1 (vec3): the second of 3 vectors.
     * - point2 (vec3): the third of 3 vectors.
     * - position (vec3): the position of a point known to be in the plane
     * - normal (vec3): the vector normal to the surface of the plane
     * 
     * Sets this plane's coefficients based off of either a set of three 3D points,
     * or a single known point on the plane and the plane's normal.
     *
     * This plane is returned.
     **/
    set: function() {
      if (arguments.length == 2) {
        vec3.copy(this.normal, arguments[1]);
        this.d = -vec3.dot(arguments[1], arguments[0]);
      } else {
        var tmp1 = this.normal, tmp2 = vec3.create();
        var points = arguments;
        
        if (arguments.length != 3) points = arguments[0];
        if (typeof(points[0]) == 'object' && points[0].array) {
          vec3.subtract(tmp1, points[1].array, points[0].array);
          vec3.subtract(tmp2, points[2].array, points[0].array);
          vec3.normalize(this.normal, vec3.cross(this.normal, tmp1, tmp2));
          this.d = -vec3.dot(this.normal, points[0].array);
        } else {
          vec3.subtract(tmp1, points[1], points[0]);
          vec3.subtract(tmp2, points[2], points[0]);
          vec3.normalize(this.normal, vec3.cross(this.normal, tmp1, tmp2));
          this.d = -vec3.dot(this.normal, points[0]);
        }
      }
      
      vec3.scale(this.point, this.normal, this.d);
      return this;
    },
    
    /**
     * Jax.Geometry.Plane#setCoefficients(a, b, c, d) -> Jax.Geometry.Plane
     *
     * Sets the four coefficients A, B, C, D for this plane.
     *
     * Returns this plane.
     **/
    setCoefficients: function(a, b, c, d) {
      var len = Math.sqrt(a*a+b*b+c*c);
      this.normal[0] = a/len;
      this.normal[1] = b/len;
      this.normal[2] = c/len;
      this.d = d/len;
      return this;
    },
    
    /**
     * Jax.Geometry.Plane#distance(x, y, z) -> Number
     *
     * Given a 3D point, returns the distance from this plane to the point. The point is expected
     * to lie in the same 3D space as this plane.
     **/
     // replaced with alias of #classify
    // distance: function(point)
    // {
    //   // same as ax + by + cz + d
    //   return this.classify(point);
    // },
    
    /**
     * Jax.Geometry.Plane#whereis(point) -> Number
     * - point (vec3): A 3D vector. Can be any type with values for indices [0..2] (e.g. an Array).
     *
     * Given a point in 3D space, returns one of the following values based on the position
     * of the point relative to this plane:
     *
     *     Jax.Geometry.Plane.FRONT
     *     Jax.Geometry.Plane.BACK
     *     Jax.Geometry.Plane.INTERSECT
     *
     * FRONT represents a point lying somewhere in the direction of the plane's normal.
     * BACK represents the opposite, and INTERSECT represents a point lying directly
     * parallel to this plane.
     *
     * The point is expected to lie in the same 3D space as this plane.
     **/
    whereis: function()
    {
      var point;
      if (arguments.length == 3) point = arguments;
      else if (arguments[0].array) point = arguments[0].array;
      else point = arguments[0];
      
      var d = this.distance(point);
      if (d > 0) return Jax.Geometry.Plane.FRONT;
      if (d < 0) return Jax.Geometry.Plane.BACK;
      return Jax.Geometry.Plane.INTERSECT;
    }
  });
  
  Plane.prototype.distance = Plane.prototype.classifyVec3;
  
  return Plane;
})();

Jax.Geometry.Plane.FRONT     = 1;
Jax.Geometry.Plane.BACK      = 2;
Jax.Geometry.Plane.INTERSECT = 3;


/* faster than capturing intersection point when we don't care about it */


/**
 * class Jax.Geometry.Triangle
 *
 * A class for storing and manipulating a group of vertices in the form
 * of a triangle.
 **/

Jax.Geometry.Triangle = (function() {
  var bufs = {
    cwV1: vec3.create(),
    cwV2: vec3.create(),
    cwV3: vec3.create(),
    pitV0: vec3.create(),
    pitV1: vec3.create(),
    pitV2: vec3.create()
  };
  
  // Although slower than 'tri_tri_intersect', this implementation
  // will find and store the exact point of intersection.

  // t1, t2: a triangle
  // dest: a vec3 to contain intersection point
  // If the return value is false, the value of dest will be unknown.
  function slow_tri_tri_intersect(t1, t2, dest)
  {
    var line1 = bufs.slowtri_line1 = bufs.slowtri_line1 || new Jax.Geometry.Line();
    var line2 = bufs.slowtri_line2 = bufs.slowtri_line2 || new Jax.Geometry.Line();
    if (t1.plane.intersectTriangle(t2, line1) && t2.plane.intersectTriangle(t1, line2)) {
      line1.intersectLineSegment(line2, dest);
      return true;
    }
    else return false;
  }
  
  var Triangle = Jax.Class.create({
    /**
     * new Jax.Geometry.Triangle(v1, v2, v3)
     * - v1 (vec3): the first vertex. Optional.
     * - v2 (vec3): the second vertex. Optional.
     * - v3 (vec3): the third vertex. Optional.
     *
     * Constructs a new triangle. Note that the vertices should
     * be wound in a counter-clockwise direction to produce proper
     * normals.
     *
     * Note: all arguments are optional for reasons of flexibility,
     * but constructing a triangle with no vertices will be effectively
     * useless (and its behavior undefined) until you subsequently call 
     * +set(v1, v2, v3)+.
     **/
    initialize: function(a, b, c) {
      this.a = vec3.create();
      this.b = vec3.create();
      this.c = vec3.create();
      this.center = vec3.create();
      this.normal = vec3.create();
    
      if (arguments.length > 0)
        this.set.apply(this, arguments);
      
    },
  
    /**
     * Jax.Geometry.Triangle#set(v1, v2, v3) -> Jax.Geometry.Triangle
     * - v1 (vec3): the first vertex.
     * - v2 (vec3): the second vertex.
     * - v3 (vec3): the third vertex.
     * 
     * Sets or replaces the current vertices with the given ones, then recalculates
     * the value for the center of this triangle as well as its normal.
     *
     * **Note** This is a copy by value, not by reference -- that is, the internal
     * vertex XYZ values are replaced but the vertex objects themselves are not. To
     * perform a copy by reference (thus retaining a reference to the exact arrays
     * passed in as arguments), see +Jax.Geometry.Triangle#assign+.
     **/
    set: function(a, b, c) {
      return this.assign(vec3.clone(a), vec3.clone(b), vec3.clone(c));
    },
    
    /**
     * Jax.Geometry.Triangle#assign(v1, v2, v3) -> Jax.Geometry.Triangle
     * - v1 (vec3): the first vertex.
     * - v2 (vec3): the second vertex.
     * - v3 (vec3): the third vertex.
     * 
     * Sets or replaces the current vertices with the given ones, then recalculates
     * the value for the center of this triangle as well as its normal.
     *
     * **Note** This is a copy by reference, not by value -- that is, the triangle
     * will maintain a handle to each of the vec3 instances passed in as parameters.
     * If you don't know what this means, you probably want +Jax.Geometry.Triangle#set+
     * instead.
     **/
    assign: function(a, b, c) {
      this.a = a;
      this.b = b;
      this.c = c;
    
      this.recalculateCenter();
      this.recalculateNormal();
      this.updateDescription();
      return this;
    },
    
    setComponents: function(ax, ay, az, bx, by, bz, cx, cy, cz) {
      this.a[0] = ax; this.a[1] = ay; this.a[2] = az;
      this.b[0] = bx; this.b[1] = by; this.b[2] = bz;
      this.c[0] = cx; this.c[1] = cy; this.c[2] = cz;
      
      this.recalculateCenter();
      this.recalculateNormal();
      this.updateDescription();
      return this;
    },

    // Returns true if the vertices of this Triangle are
    // clockwise when tranformed into the given coordinate
    // space. If omitted, an identity matrix is used.
    isClockwise: function(xform) {
      var v1 = bufs.cwV1, v2 = bufs.cwV2, v3 = bufs.cwV3;
      var a, b, c;
      if (xform) {
        vec3.transformMat4(v1, this.a, xform);
        vec3.transformMat4(v2, this.b, xform);
        vec3.transformMat4(v3, this.c, xform);
        a = v1;
        b = v2;
        c = v3;
      } else {
        a = this.a;
        b = this.b;
        c = this.c;
      }

      vec3.subtract(v1, b, a);
      vec3.subtract(v2, c, a);
      return v1[0] * v2[1] - v1[1] * v2[0] > 0;
    },

    isCounterClockwise: function(xform) {
      return !this.isClockwise(xform);
    },
    
    recalculateCenter: function() {
      // (a+b+c) / 3
      vec3.add(this.center, this.a, this.b);
      vec3.add(this.center, this.c, this.center);
      vec3.scale(this.center, this.center, 1/3);
      return this.center;
    },
    
    recalculateNormal: function() {
      var tmp = bufs.tmp = bufs.tmp || vec3.create();
      vec3.subtract(this.normal, this.b, this.a);
      vec3.subtract(tmp, this.c, this.a);
      vec3.cross(this.normal, this.normal, tmp);
      vec3.normalize(this.normal, this.normal);
      return this.normal;
    },
    
    /**
     * Jax.Geometry.Triangle#getNormal() -> vec3
     *
     * Returns the normal for this triangle. The normal is the vector
     * pointing perpendicular to the plane this triangle represents,
     * following the triangle's vertices in a counter-clockwise direction.
     *
     **/
    getNormal: function() {
      return this.normal;
    },
    
    toString: function() {
      return "Triangle: "+vec3.str(this.a)+"; "+vec3.str(this.b)+"; "+vec3.str(this.c);
    },
    
    /**
     * Jax.Geometry.Triangle#intersectRay(O, D, cp[, segmax]) -> Boolean
     * - O (vec3): origin
     * - D (vec3): direction
     * - cp (vec4): collision point [xyz] and distance [w] (output)
     * - segmax (Number): the maximum length of the ray; optional
     *
     * Tests for intersection with a ray, given an origin (O) and
     * direction (D). The +cp+ array receives the exact X, Y, Z position of the
     * collision; its W (fourth) element contains the distance from the origin
     * to the point of the collision, relative to the magnitude of D.
     * Allows testing against a finite segment by specifying the maximum length of
     * the ray in +segmax+, also relative to the magnitude of D.
     **/
    intersectRay: function(O, D, cp, segmax) {
      var p = this._p = this._p || new Jax.Geometry.Plane();
      p.set(this.a, this.b, this.c);
      var denom = vec3.dot(p.normal, D);
      if (Math.abs(denom) < Math.EPSILON) return false;
      var t = -(p.d + vec3.dot(p.normal, O)) / denom;
      if (t <= 0) return false;
      if (segmax != undefined && t > segmax) return false;

      // cp = O + t*D
      vec3.copy(cp, D);
      vec3.scale(cp, cp, t);
      vec3.add(cp, O, cp);

      if (this.pointInTri(cp)) {
        cp[3] = t;
        return true;
      }
      return false;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(O, radius, cp) -> Boolean
     * - O (vec3): origin
     * - radius (Number): radius of sphere
     * - cp (vec3): collision point (output)
     *
     * Returns true if a sphere with the given origin and radius
     * intersects this triangle; if true, the exact point of
     * collision will be given in +cp+, unless +cp+ is omitted.
     **/
    intersectSphere: function(O, radius, cp) {
      var p = this._p = this._p || new Jax.Geometry.Plane();
      p.set(this.a, this.b, this.c);
      var dist = p.classify(O);
      if (Math.abs(dist) > radius) return false;

      var point = this._point = this._point || vec3.create();
      vec3.scale(point, p.normal, dist);
      vec3.subtract(point, O, point);
      if (this.pointInTri(point)) {
        if (cp) vec3.copy(cp, point);
        return true;
      }

      // edge intersection detection
      var v = bufs.v = bufs.v || [];
      var u = bufs.u = bufs.u || vec3.create();
      var pa = bufs.pa = bufs.pa || vec3.create();
      var tmp = bufs.tmp = bufs.tmp || vec3.create();
      var radsquared = radius*radius;

      v[0] = this.a; v[1] = this.b; v[2] = this.c; v[3] = this.a;
      for (var i = 0; i < 3; i++) {
        vec3.subtract(u, v[i+1], v[i]);
        vec3.subtract(pa, O, v[i]);
        var s = vec3.dot(u, pa) / vec3.dot(u, u);

        if (s < 0) vec3.copy(tmp, v[i]);
        else if (s > 1) vec3.copy(tmp, v[i+1]);
        else {
          vec3.scale(tmp, u, s);
          vec3.add(tmp, v[i], tmp);
        }
        if (cp) vec3.copy(cp, tmp);

        vec3.subtract(tmp, O, tmp);
        var sq_dist = vec3.dot(tmp, tmp);
        if (sq_dist <= radsquared) return true;
      }

      return false;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(t[, dest]) -> Boolean
     * - t (Jax.Geometry.Triangle): the triangle to test
     * - dest (vec3): optional vec3 to contain the point of intersection.
     *
     * Returns true if the given triangle intersects this one.
     *
     * If no receiving vector is supplied in which to store the point
     * of intersection, this data is ignored.
     *
     **/
    intersectTriangle: function(t, dest) {
      if (dest) return slow_tri_tri_intersect(this, t, dest);
      else return Jax.Geometry.Triangle.tri_tri_intersect(this.a, this.b, this.c, t.a, t.b, t.c);
    },
  
    /**
     * Jax.Geometry.Triangle#updateDescription() -> Jax.Geometry.Triangle
     *
     * Updates this triangle's normal and the indices used for the point
     * intersection test.
     *
     * This method is called automatically by +Jax.Geometry.Triangle#set()+.
     **/
    updateDescription: function() {
      var p = this.plane = this.plane || new Jax.Geometry.Plane(this.a, this.b, this.c);
      var n = p.normal;
      var a = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];

      if (a[0] > a[1])
      {
        if (a[0] > a[2]) { this._i1=1; this._i2=2; }
        else             { this._i1=0; this._i2=1; }
      }
      else
      {
        if (a[1] > a[2]) { this._i1=0; this._i2=2; }
        else             { this._i1=0; this._i2=1; }
      }
      
      return this;
    },
    
    /**
     * Jax.Geometry.Triangle#pointInTri(p) -> Boolean
     * - p (vec3): the point to be tested
     *
     * Returns true if the given point is within this triangle,
     * false otherwise.
     **/
    pointInTri: function(P) {
      var a = this.a, b = this.b, c = this.c;
      var v0 = bufs.pitV0, v1 = bufs.pitV1, v2 = bufs.pitV2;

      // Compute vectors
      vec3.subtract(v0, c, a);
      vec3.subtract(v1, b, a);
      vec3.subtract(v2, P, a);

      // Compute dot products
      var dot00 = vec3.dot(v0, v0),
          dot01 = vec3.dot(v0, v1),
          dot02 = vec3.dot(v0, v2),
          dot11 = vec3.dot(v1, v1),
          dot12 = vec3.dot(v1, v2);

      // Compute barycentric coordinates
      var invDenom = 1 / (dot00 * dot11 - dot01 * dot01),
          u = (dot11 * dot02 - dot01 * dot12) * invDenom,
          v = (dot00 * dot12 - dot01 * dot02) * invDenom;

      // Check if point is in triangle
      return (u >= 0) && (v >= 0) && (u + v < 1);
    }
  });
  
  // array-style accessors
  Object.defineProperty(Triangle.prototype, 0, {
    get: function() { return this.a; },
    set: function(v) { return this.a = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Triangle.prototype, 1, {
    get: function() { return this.b; },
    set: function(v) { return this.b = v; },
    enumerable: false,
    configurable: false
  });
  
  Object.defineProperty(Triangle.prototype, 2, {
    get: function() { return this.c; },
    set: function(v) { return this.c = v; },
    enumerable: false,
    configurable: false
  });
  
  return Triangle;
})();
(function() {
  var bufs;
  if (typeof(bufs) == 'undefined') // in case it was defined elsewhere
    bufs = {};

  

  

  

  /* sort so that a<=b */
  

  


  


  /* this edge to edge test is based on Franlin Antonio's gem:
     "Faster Line Segment Intersection", in Graphics Gems III,
     pp. 199-202 */ 
  

  

  

  function coplanar_tri_tri(N, V0, V1, V2, U0, U1, U2) {
    var A = bufs.tritri_A = bufs.tritri_A || vec3.create();
    var i0, i1;

    /* first project onto an axis-aligned plane, that maximizes the area */
    /* of the triangles, compute indices: i0,i1. */
    A[0] = Math.abs(N[0]);
    A[1] = Math.abs(N[1]);
    A[2] = Math.abs(N[2]);

    if(A[0]>A[1])
    {
      if(A[0]>A[2])  
      {
        i0=1;      /* A[0] is greatest */
        i1=2;
      }
      else
      {
        i0=0;      /* A[2] is greatest */
        i1=1;
      }
    }
    else   /* A[0]<=A[1] */
    {
      if(A[2]>A[1])
      {
        i0=0;      /* A[2] is greatest */
        i1=1;                                           
      }
      else
      {
        i0=0;      /* A[1] is greatest */
        i1=2;
      }
    }               
                
    /* test all edges of triangle 1 against the edges of triangle 2 */
    /* (inline function EDGE_AGAINST_TRI_EDGES) */

    {
      var Ax,Ay,Bx,By,Cx,Cy,e,d,f;
      Ax=V1[i0]-V0[i0];
      Ay=V1[i1]-V0[i1];
      /* test edge U0,U1 against V0,V1 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U0[i0]-U1[i0];
    By=U0[i1]-U1[i1];
    Cx=V0[i0]-U0[i0];
    Cy=V0[i1]-U0[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U1,U2 against V0,V1 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U1[i0]-U2[i0];
    By=U1[i1]-U2[i1];
    Cx=V0[i0]-U1[i0];
    Cy=V0[i1]-U1[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U2,U1 against V0,V1 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U2[i0]-U0[i0];
    By=U2[i1]-U0[i1];
    Cx=V0[i0]-U2[i0];
    Cy=V0[i1]-U2[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
    }
  
    /* (inline function EDGE_AGAINST_TRI_EDGES) */

    {
      var Ax,Ay,Bx,By,Cx,Cy,e,d,f;
      Ax=V2[i0]-V1[i0];
      Ay=V2[i1]-V1[i1];
      /* test edge U0,U1 against V1,V2 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U0[i0]-U1[i0];
    By=U0[i1]-U1[i1];
    Cx=V1[i0]-U0[i0];
    Cy=V1[i1]-U0[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U1,U2 against V1,V2 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U1[i0]-U2[i0];
    By=U1[i1]-U2[i1];
    Cx=V1[i0]-U1[i0];
    Cy=V1[i1]-U1[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U2,U1 against V1,V2 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U2[i0]-U0[i0];
    By=U2[i1]-U0[i1];
    Cx=V1[i0]-U2[i0];
    Cy=V1[i1]-U2[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
    }
  
    /* (inline function EDGE_AGAINST_TRI_EDGES) */

    {
      var Ax,Ay,Bx,By,Cx,Cy,e,d,f;
      Ax=V0[i0]-V2[i0];
      Ay=V0[i1]-V2[i1];
      /* test edge U0,U1 against V2,V0 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U0[i0]-U1[i0];
    By=U0[i1]-U1[i1];
    Cx=V2[i0]-U0[i0];
    Cy=V2[i1]-U0[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U1,U2 against V2,V0 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U1[i0]-U2[i0];
    By=U1[i1]-U2[i1];
    Cx=V2[i0]-U1[i0];
    Cy=V2[i1]-U1[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
      /* test edge U2,U1 against V2,V0 */
      /* (inline function EDGE_EDGE_TEST) */

    Bx=U2[i0]-U0[i0];
    By=U2[i1]-U0[i1];
    Cx=V2[i0]-U2[i0];
    Cy=V2[i1]-U2[i1];
    f=Ay*Bx-Ax*By;
    d=By*Cx-Bx*Cy;
    if((f>0 && d>=0 && d<=f) || (f<0 && d<=0 && d>=f))
    {
      e=Ax*Cy-Ay*Cx;
      if(f>0)
      {
        if(e>=0 && e<=f) return true;
      }
      else
      {
        if(e<=0 && e>=f) return true;
      }
    }                                
  
    }
  
              
    /* finally, test if tri1 is totally contained in tri2 or vice versa */
    /* (inline function POINT_IN_TRI) */

    {
      var a,b,c,d0,d1,d2;
      /* is T1 completly inside T2? */
      /* check if V0 is inside tri(U0,U1,U2) */
      a=U1[i1]-U0[i1];
      b=-(U1[i0]-U0[i0]);
      c=-a*U0[i0]-b*U0[i1];
      d0=a*V0[i0]+b*V0[i1]+c;
      a=U2[i1]-U1[i1];
      b=-(U2[i0]-U1[i0]);
      c=-a*U1[i0]-b*U1[i1];
      d1=a*V0[i0]+b*V0[i1]+c;
      a=U0[i1]-U2[i1];
      b=-(U0[i0]-U2[i0]);
      c=-a*U2[i0]-b*U2[i1];
      d2=a*V0[i0]+b*V0[i1]+c;
      if(d0*d1>0.0)
      {
        if(d0*d2>0.0) return true;
      }
    }
  
    /* (inline function POINT_IN_TRI) */

    {
      var a,b,c,d0,d1,d2;
      /* is T1 completly inside T2? */
      /* check if U0 is inside tri(V0,V1,V2) */
      a=V1[i1]-V0[i1];
      b=-(V1[i0]-V0[i0]);
      c=-a*V0[i0]-b*V0[i1];
      d0=a*U0[i0]+b*U0[i1]+c;
      a=V2[i1]-V1[i1];
      b=-(V2[i0]-V1[i0]);
      c=-a*V1[i0]-b*V1[i1];
      d1=a*U0[i0]+b*U0[i1]+c;
      a=V0[i1]-V2[i1];
      b=-(V0[i0]-V2[i0]);
      c=-a*V2[i0]-b*V2[i1];
      d2=a*U0[i0]+b*U0[i1]+c;
      if(d0*d1>0.0)
      {
        if(d0*d2>0.0) return true;
      }
    }
  

    return false;
  }

  Jax.Geometry.Triangle.tri_tri_intersect = function(V0, V1, V2, U0, U1, U2)
  {
    var E1 = bufs.tritri_E1 = bufs.tritri_E1 || vec3.create(),
        E2 = bufs.tritri_E2 = bufs.tritri_E2 || vec3.create(),
        N1 = bufs.tritri_N1 = bufs.tritri_N1 || vec3.create(),
        N2 = bufs.tritri_N2 = bufs.tritri_N2 || vec3.create(),
        D  = bufs.tritri_D  = bufs.tritri_D  || vec3.create(),
        isect1 = bufs.tritri_isect1 = bufs.tritri_isect1 || vec2.create(),
        isect2 = bufs.tritri_isect2 = bufs.tritri_isect2 || vec2.create();
    var d1, d2;
    var du0,du1,du2,dv0,dv1,dv2;
    var du0du1,du0du2,dv0dv1,dv0dv2;
    var index;
    var vp0,vp1,vp2;
    var up0,up1,up2;
    var b,c,max;

    /* compute plane equation of triangle(V0,V1,V2) */
    vec3.subtract(E1, V1, V0);
    vec3.subtract(E2, V2, V0);
    vec3.cross(N1, E1, E2);
    d1 = -vec3.dot(N1, V0);
    /* plane equation 1: N1.X+d1=0 */

    /* put U0,U1,U2 into plane equation 1 to compute signed distances to the plane*/
    du0 = vec3.dot(N1, U0) + d1;
    du1 = vec3.dot(N1, U1) + d1;
    du2 = vec3.dot(N1, U2) + d1;

    /* coplanarity robustness check */
    if(Math.abs(du0) < Math.EPSILON) du0 = 0.0;
    if(Math.abs(du1) < Math.EPSILON) du1 = 0.0;
    if(Math.abs(du2) < Math.EPSILON) du2 = 0.0;

    du0du1 = du0 * du1;
    du0du2 = du0 * du2;

    if(du0du1 > 0 && du0du2 > 0) /* same sign on all of them + not equal 0 ? */
      return false;              /* no intersection occurs */

    /* compute plane of triangle (U0,U1,U2) */
    vec3.subtract(E1, U1, U0);
    vec3.subtract(E2, U2, U0);
    vec3.cross(N2, E1, E2);
    d2 = -vec3.dot(N2, U0);
    /* plane equation 2: N2.X+d2=0 */

    /* put V0,V1,V2 into plane equation 2 */
    dv0 = vec3.dot(N2, V0) + d2;
    dv1 = vec3.dot(N2, V1) + d2;
    dv2 = vec3.dot(N2, V2) + d2;

    if (Math.abs(dv0) < Math.EPSILON) dv0 = 0;
    if (Math.abs(dv1) < Math.EPSILON) dv1 = 0;
    if (Math.abs(dv2) < Math.EPSILON) dv2 = 0;

    dv0dv1 = dv0 * dv1;
    dv0dv2 = dv0 * dv2;
        
    if(dv0dv1 > 0 && dv0dv2 > 0) /* same sign on all of them + not equal 0 ? */
      return false;              /* no intersection occurs */

    /* compute direction of intersection line */
    vec3.cross(D, N1, N2);

    /* compute and index to the largest component of D */
    max = Math.abs(D[0]);
    index = 0;
    b = Math.abs(D[1]);
    c = Math.abs(D[2]);

    if (b > max) { max = b; index = 1; }
    if (c > max) { max = c; index = 2; }

    /* this is the simplified projection onto L*/
    vp0 = V0[index];
    vp1 = V1[index];
    vp2 = V2[index];

    up0 = U0[index];
    up1 = U1[index];
    up2 = U2[index];

    try {
      /* compute interval for triangle 1 */
      /* (inline function COMPUTE_INTERVALS) */

    if(dv0dv1>0.0)
    {
      /* here we know that dv0dv2<=0.0 */
      /* that is dv0, dv1 are on the same side, dv2 on the other or on the plane */
      /* (inline function ISECT) */

    isect1[0]=vp2+(vp0-vp2)*dv2/(dv2-dv0);
    isect1[1]=vp2+(vp1-vp2)*dv2/(dv2-dv1);
  
    }
    else if(dv0dv2>0.0)
    {
      /* here we know that d0d1<=0.0 */
      /* (inline function ISECT) */

    isect1[0]=vp1+(vp0-vp1)*dv1/(dv1-dv0);
    isect1[1]=vp1+(vp2-vp1)*dv1/(dv1-dv2);
  
    }
    else if(dv1*dv2>0.0 || dv0!=0.0)
    {
      /* here we know that d0d1<=0.0 or that dv0!=0.0 */
      /* (inline function ISECT) */

    isect1[0]=vp0+(vp1-vp0)*dv0/(dv0-dv1);
    isect1[1]=vp0+(vp2-vp0)*dv0/(dv0-dv2);
  
    }
    else if(dv1!=0.0)
    {
      /* (inline function ISECT) */

    isect1[0]=vp1+(vp0-vp1)*dv1/(dv1-dv0);
    isect1[1]=vp1+(vp2-vp1)*dv1/(dv1-dv2);
  
    }
    else if(dv2!=0.0)
    {
      /* (inline function ISECT) */

    isect1[0]=vp2+(vp0-vp2)*dv2/(dv2-dv0);
    isect1[1]=vp2+(vp1-vp2)*dv2/(dv2-dv1);
  
    }
    else
    {
      /* triangles are coplanar */
      return coplanar_tri_tri(N1,V0,V1,V2,U0,U1,U2);
    }
  

      /* compute interval for triangle 2 */
      /* (inline function COMPUTE_INTERVALS) */

    if(du0du1>0.0)
    {
      /* here we know that du0du2<=0.0 */
      /* that is du0, du1 are on the same side, du2 on the other or on the plane */
      /* (inline function ISECT) */

    isect2[0]=up2+(up0-up2)*du2/(du2-du0);
    isect2[1]=up2+(up1-up2)*du2/(du2-du1);
  
    }
    else if(du0du2>0.0)
    {
      /* here we know that d0d1<=0.0 */
      /* (inline function ISECT) */

    isect2[0]=up1+(up0-up1)*du1/(du1-du0);
    isect2[1]=up1+(up2-up1)*du1/(du1-du2);
  
    }
    else if(du1*du2>0.0 || du0!=0.0)
    {
      /* here we know that d0d1<=0.0 or that du0!=0.0 */
      /* (inline function ISECT) */

    isect2[0]=up0+(up1-up0)*du0/(du0-du1);
    isect2[1]=up0+(up2-up0)*du0/(du0-du2);
  
    }
    else if(du1!=0.0)
    {
      /* (inline function ISECT) */

    isect2[0]=up1+(up0-up1)*du1/(du1-du0);
    isect2[1]=up1+(up2-up1)*du1/(du1-du2);
  
    }
    else if(du2!=0.0)
    {
      /* (inline function ISECT) */

    isect2[0]=up2+(up0-up2)*du2/(du2-du0);
    isect2[1]=up2+(up1-up2)*du2/(du2-du1);
  
    }
    else
    {
      /* triangles are coplanar */
      return coplanar_tri_tri(N1,V0,V1,V2,U0,U1,U2);
    }
  
    } catch(e) {
      if (e == 1) return coplanar_tri_tri(N1, V0, V1, V2, U0, U1, U2);
      throw e;
    }

    /* (inline function SORT) */

    if(isect1[0]> isect1[1])
    {
      var c;
      c=isect1[0];
      isect1[0]= isect1[1];
       isect1[1]=c;
    }
  
    /* (inline function SORT) */

    if(isect2[0]> isect1[1])
    {
      var c;
      c=isect2[0];
      isect2[0]= isect1[1];
       isect1[1]=c;
    }
  

    if(isect1[1] < isect2[0] || isect2[1] < isect1[0]) return false;
    return true;
  };
})();
(function() {
  var bufs;

  bufs = {
    vec: vec3.create(),
    tri: new Jax.Geometry.Triangle()
  };

  /*
  Adds methods for calculating normals for triangle-based meshes. The mesh
  is expected to maintain a `triangleOrder` property, which must be an array
  of vertex indices whose length is divisible by 3, with each group of 3
  indices representing a triangle.
  */


  Jax.Mesh.Normals = {
    recalculateNormals: function() {
      var ai, ai3, avx, avy, avz, bi, bi3, bvx, bvy, bvz, ci, ci3, colors, cvx, cvy, cvz, data, i, i3, ni, normal, normals, numTris, recalcVec, recalcVecs, rn, rnlen, textures, tri, triangleOrder, vertices, vx, vy, vz, _i, _j, _k, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;

      recalcVec = bufs.vec;
      tri = bufs.tri;
      recalcVecs = {};
      data = this.data;
      _ref = [data.vertexBuffer, data.colorBuffer, data.textureCoordsBuffer, data.normalBuffer], vertices = _ref[0], colors = _ref[1], textures = _ref[2], normals = _ref[3];
      triangleOrder = this.triangleOrder;
      numTris = triangleOrder.length;
      for (i = _i = 0; _i < numTris; i = _i += 3) {
        _ref1 = [triangleOrder[i], triangleOrder[i + 1], triangleOrder[i + 2]], ai = _ref1[0], bi = _ref1[1], ci = _ref1[2];
        _ref2 = [ai * 3, bi * 3, ci * 3], ai3 = _ref2[0], bi3 = _ref2[1], ci3 = _ref2[2];
        _ref3 = [vertices[ai3], vertices[ai3 + 1], vertices[ai3 + 2]], avx = _ref3[0], avy = _ref3[1], avz = _ref3[2];
        _ref4 = [vertices[bi3], vertices[bi3 + 1], vertices[bi3 + 2]], bvx = _ref4[0], bvy = _ref4[1], bvz = _ref4[2];
        _ref5 = [vertices[ci3], vertices[ci3 + 1], vertices[ci3 + 2]], cvx = _ref5[0], cvy = _ref5[1], cvz = _ref5[2];
        tri.setComponents(avx, avy, avz, bvx, bvy, bvz, cvx, cvy, cvz);
        normal = tri.getNormal();
        rn = recalcVecs[ai] || (recalcVecs[ai] = []);
        rn.push(normal[0], normal[1], normal[2]);
        rn = recalcVecs[bi] || (recalcVecs[bi] = []);
        rn.push(normal[0], normal[1], normal[2]);
        rn = recalcVecs[ci] || (recalcVecs[ci] = []);
        rn.push(normal[0], normal[1], normal[2]);
      }
      _results = [];
      for (i = _j = 0, _ref6 = data.length; 0 <= _ref6 ? _j < _ref6 : _j > _ref6; i = 0 <= _ref6 ? ++_j : --_j) {
        i3 = i * 3;
        _ref7 = [vertices[i3], vertices[i3 + 1], vertices[i3 + 2]], vx = _ref7[0], vy = _ref7[1], vz = _ref7[2];
        recalcVec[0] = recalcVec[1] = recalcVec[2] = 0;
        rn = recalcVecs[i] || (recalcVecs[i] = []);
        rnlen = rn.length;
        for (ni = _k = 0; _k < rnlen; ni = _k += 3) {
          recalcVec[0] += rn[ni];
          recalcVec[1] += rn[ni + 1];
          recalcVec[2] += rn[ni + 2];
        }
        vec3.scale(recalcVec, recalcVec, 3 / rnlen);
        data.normalBuffer[i3] = recalcVec[0];
        data.normalBuffer[i3 + 1] = recalcVec[1];
        _results.push(data.normalBuffer[i3 + 2] = recalcVec[2]);
      }
      return _results;
    }
  };

}).call(this);
(function() {
  var itertri, tangentBufs;

  tangentBufs = {
    v1: vec3.create(),
    v2: vec3.create(),
    v3: vec3.create(),
    w1: vec2.create(),
    w2: vec2.create(),
    w3: vec2.create(),
    sdir: vec3.create(),
    tdir: vec3.create(),
    n: vec3.create(),
    t: vec3.create(),
    tan: vec3.create()
  };

  itertri = new Jax.Geometry.Triangle();

  /*
  Adds methods for calculating tangents for triangle-based meshes. The mesh
  is expected to maintain a `triangleOrder` property, which must be an array
  of vertex indices whose length is divisible by 3, with each group of 3
  indices representing a triangle.
  */


  Jax.Mesh.Tangents = {
    /*
    Iterates through each triangle of this mesh, calling the given callback.
    If the callback explicitly returns `false`, then iteration is aborted.
    Returns the number of triangles processed.
    
    Warning: only a single instance of `Jax.Geometry.Triangle` is used by this
    method. It is NOT safe to maintain an ongoing reference to the yielded
    triangle!
    */

    eachTriangle: function(callback) {
      var a, i1, i1x, i1y, i1z, i2, i2x, i2y, i2z, i3, i3x, i3y, i3z, numTris, triangleOrder, triangleOrderLength, vbuf, _i, _ref;

      vbuf = this.data.vertexBuffer;
      triangleOrder = this.triangleOrder;
      triangleOrderLength = triangleOrder.length;
      numTris = 0;
      for (a = _i = 0; _i < triangleOrderLength; a = _i += 3) {
        numTris += 1;
        _ref = [triangleOrder[a], triangleOrder[a + 1], triangleOrder[a + 2]], i1 = _ref[0], i2 = _ref[1], i3 = _ref[2];
        i1x = i1 * 3;
        i1y = i1x * 3 + 1;
        i1z = i1x * 3 + 2;
        i2x = i2 * 3;
        i2y = i2x * 3 + 1;
        i2z = i2x * 3 + 2;
        i3x = i3 * 3;
        i3y = i3x * 3 + 1;
        i3z = i3x * 3 + 2;
        itertri.setComponents(vbuf[i1x], vbuf[i1y], vbuf[i1z], vbuf[i2x], vbuf[i2y], vbuf[i2z], vbuf[i3x], vbuf[i3y], vbuf[i3z]);
        if (callback(itertri) === false) {
          return numTris;
        }
      }
      return numTris;
    },
    recalculateBitangents: function() {
      var bitangent, bitangents, data, i, i3, i4, len, normal, normals, tangents, _i, _ref, _results;

      data = this.data;
      if (data.shouldRecalculateTangents()) {
        this.recalculateTangents();
      }
      _ref = [data.tangentBuffer, data.bitangentBuffer, data.normalBuffer], tangents = _ref[0], bitangents = _ref[1], normals = _ref[2];
      len = data.length;
      bitangent = tangentBufs.tan;
      normal = tangentBufs.n;
      _results = [];
      for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
        i3 = i * 3;
        i4 = i * 4;
        bitangent[0] = tangents[i4];
        bitangent[1] = tangents[i4 + 1];
        bitangent[2] = tangents[i4 + 2];
        normal[0] = normals[i3];
        normal[1] = normals[i3 + 1];
        normal[2] = normals[i3 + 2];
        vec3.cross(bitangent, normal, bitangent);
        vec3.scale(tangents[i4 + 3], bitangent);
        bitangents[i3] = bitangent[0];
        bitangents[i3 + 1] = bitangent[1];
        _results.push(bitangents[i3 + 2] = bitangent[2]);
      }
      return _results;
    },
    recalculateTangents: function() {
      var a, a3, a4, buf, data, dot, i1, i13, i2, i23, i3, i33, n, normalize, num, numTangents, r, s1, s2, sdir, set, t, t1, t2, tan, tan1, tan2, tdir, triangleOrder, triangleOrderLength, v1, v2, v3, w1, w2, w3, x, x1, x2, y, y1, y2, z, z1, z2, _i, _j, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;

      if (this.data.shouldRecalculateNormals()) {
        this.recalculateNormals();
      }
      data = this.data;
      numTangents = 3 * data.length;
      buf = new ArrayBuffer(numTangents * Float32Array.BYTES_PER_ELEMENT * 2);
      tan1 = new Float32Array(buf, 0, numTangents);
      tan2 = new Float32Array(buf, numTangents * Float32Array.BYTES_PER_ELEMENT, numTangents);
      _ref = [tangentBufs.v1, tangentBufs.v2, tangentBufs.v3], v1 = _ref[0], v2 = _ref[1], v3 = _ref[2];
      _ref1 = [tangentBufs.w1, tangentBufs.w2, tangentBufs.w3], w1 = _ref1[0], w2 = _ref1[1], w3 = _ref1[2];
      _ref2 = [tangentBufs.sdir, tangentBufs.tdir], sdir = _ref2[0], tdir = _ref2[1];
      _ref3 = [tangentBufs.n, tangentBufs.t, tangentBufs.tan], n = _ref3[0], t = _ref3[1], tan = _ref3[2];
      set = function(v, w, i, i3) {
        v[0] = data.vertexBuffer[i3];
        v[1] = data.vertexBuffer[i3 + 1];
        v[2] = data.vertexBuffer[i3 + 2];
        w[0] = data.textureCoordsBuffer[i * 2];
        return w[1] = data.textureCoordsBuffer[i * 2 + 1];
      };
      triangleOrder = this.triangleOrder;
      triangleOrderLength = triangleOrder.length;
      for (a = _i = 0; _i < triangleOrderLength; a = _i += 3) {
        _ref4 = [triangleOrder[a], triangleOrder[a + 1], triangleOrder[a + 2]], i1 = _ref4[0], i2 = _ref4[1], i3 = _ref4[2];
        _ref5 = [i1 * 3, i2 * 3, i3 * 3], i13 = _ref5[0], i23 = _ref5[1], i33 = _ref5[2];
        set(v1, w1, i1, i13);
        set(v2, w2, i2, i23);
        set(v3, w3, i3, i33);
        x1 = v2[0] - v1[0];
        x2 = v3[0] - v1[0];
        y1 = v2[1] - v1[1];
        y2 = v3[1] - v1[1];
        z1 = v2[2] - v1[2];
        z2 = v3[2] - v1[2];
        s1 = w2[0] - w1[0];
        s2 = w3[0] - w1[0];
        t1 = w2[1] - w1[1];
        t2 = w3[1] - w1[1];
        r = 1 / (s1 * t2 - s2 * t1);
        if (r === (1 / 0)) {
          r = 0;
        }
        sdir[0] = (t2 * x1 - t1 * x2) * r;
        sdir[1] = (t2 * y1 - t1 * y2) * r;
        sdir[2] = (t2 * z1 - t1 * z2) * r;
        tdir[0] = (s1 * x2 - s2 * x1) * r;
        tdir[1] = (s1 * y2 - s2 * y1) * r;
        tdir[2] = (s1 * z2 - s2 * z1) * r;
        tan1[i13] += sdir[0];
        tan1[i13 + 1] += sdir[1];
        tan1[i13 + 2] += sdir[2];
        tan1[i23] += sdir[0];
        tan1[i23 + 1] += sdir[1];
        tan1[i23 + 2] += sdir[2];
        tan1[i33] += sdir[0];
        tan1[i33 + 1] += sdir[1];
        tan1[i33 + 2] += sdir[2];
        tan2[i13] += tdir[0];
        tan2[i13 + 1] += tdir[1];
        tan2[i13 + 2] += tdir[2];
        tan2[i23] += tdir[0];
        tan2[i23 + 1] += tdir[1];
        tan2[i23 + 2] += tdir[2];
        tan2[i33] += tdir[0];
        tan2[i33 + 1] += tdir[1];
        tan2[i33 + 2] += tdir[2];
      }
      num = data.tangentBuffer.length / 4;
      _results = [];
      for (a = _j = 0; 0 <= num ? _j < num : _j > num; a = 0 <= num ? ++_j : --_j) {
        a3 = a * 3;
        a4 = a * 4;
        n[0] = data.normalBuffer[a3];
        n[1] = data.normalBuffer[a3 + 1];
        n[2] = data.normalBuffer[a3 + 2];
        t[0] = tan1[a3];
        t[1] = tan1[a3 + 1];
        t[2] = tan1[a3 + 2];
        dot = vec3.dot(n, t);
        x = t[0] - n[0] * dot;
        y = t[1] - n[1] * dot;
        z = t[2] - n[2] * dot;
        normalize = 1.0 / Math.sqrt(x * x + y * y + z * z);
        data.tangentBuffer[a4] = x * normalize;
        data.tangentBuffer[a4 + 1] = y * normalize;
        data.tangentBuffer[a4 + 2] = z * normalize;
        tan[0] = tan2[a3];
        tan[1] = tan2[a3 + 1];
        tan[2] = tan2[a3 + 2];
        _results.push(data.tangentBuffer[a4 + 3] = (vec3.dot(vec3.cross(n, n, t), tan) < 0 ? -1 : 1));
      }
      return _results;
    }
  };

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Jax.Mesh.TriangleFan = (function(_super) {
    __extends(TriangleFan, _super);

    TriangleFan.include(Jax.Mesh.Tangents);

    TriangleFan.include(Jax.Mesh.Normals);

    function TriangleFan() {
      var args,
        _this = this;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.draw_mode || (this.draw_mode = GL_TRIANGLE_FAN);
      TriangleFan.__super__.constructor.apply(this, args);
      this.triangleOrder = [];
      this.addEventListener('validated', function() {
        return _this.updateTriangleOrder();
      });
    }

    TriangleFan.prototype.updateTriangleOrder = function() {
      var i, indices, numIndices, triangleOrder, _i, _results;

      triangleOrder = this.triangleOrder;
      indices = this.data.indexBuffer;
      numIndices = indices.length;
      triangleOrder.splice(0, triangleOrder.length);
      _results = [];
      for (i = _i = 2; 2 <= numIndices ? _i < numIndices : _i > numIndices; i = 2 <= numIndices ? ++_i : --_i) {
        _results.push(triangleOrder.push(indices[0], indices[i - 1], indices[i]));
      }
      return _results;
    };

    return TriangleFan;

  })(Jax.Mesh.Base);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Jax.Mesh.TriangleStrip = (function(_super) {
    __extends(TriangleStrip, _super);

    TriangleStrip.include(Jax.Mesh.Tangents);

    TriangleStrip.include(Jax.Mesh.Normals);

    function TriangleStrip() {
      var args,
        _this = this;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.draw_mode || (this.draw_mode = GL_TRIANGLE_STRIP);
      TriangleStrip.__super__.constructor.apply(this, args);
      this.triangleOrder = [];
      this.addEventListener('validated', function() {
        return _this.updateTriangleOrder();
      });
    }

    TriangleStrip.prototype.updateTriangleOrder = function() {
      var i, indices, numIndices, triangleOrder, _i, _results;

      triangleOrder = this.triangleOrder;
      indices = this.data.indexBuffer;
      numIndices = indices.length;
      triangleOrder.splice(0, triangleOrder.length);
      _results = [];
      for (i = _i = 2; _i < numIndices; i = _i += 2) {
        triangleOrder.push(indices[i - 2], indices[i - 1], indices[i]);
        if (i < numIndices - 1) {
          _results.push(triangleOrder.push(indices[i], indices[i - 1], indices[i + 1]));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return TriangleStrip;

  })(Jax.Mesh.Base);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Jax.Mesh.Triangles = (function(_super) {
    var PRECISION;

    __extends(Triangles, _super);

    Triangles.include(Jax.Mesh.Tangents);

    Triangles.include(Jax.Mesh.Normals);

    PRECISION = 6;

    function Triangles() {
      var args,
        _this = this;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.draw_mode || (this.draw_mode = GL_TRIANGLES);
      Triangles.__super__.constructor.apply(this, args);
      this.triangleOrder = [];
      this.addEventListener('validated', function() {
        return _this.updateTriangleOrder();
      });
    }

    Triangles.prototype.updateTriangleOrder = function() {
      var i, indices, numIndices, triangleOrder, _i, _results;

      triangleOrder = this.triangleOrder;
      indices = this.data.indexBuffer;
      numIndices = indices.length;
      triangleOrder.splice(0, triangleOrder.length);
      _results = [];
      for (i = _i = 0; _i < numIndices; i = _i += 3) {
        _results.push(triangleOrder.push(indices[i], indices[i + 1], indices[i + 2]));
      }
      return _results;
    };

    Triangles.prototype.hash = function(vx, vy, vz, cr, cg, cb, ca, ts, tt, nx, ny, nz, ax, ay, az, aw, bx, bY, bz) {
      if (cr == null) {
        cr = 0;
      }
      if (cg == null) {
        cg = 0;
      }
      if (cb == null) {
        cb = 0;
      }
      if (ca == null) {
        ca = 0;
      }
      if (ts == null) {
        ts = 0;
      }
      if (tt == null) {
        tt = 0;
      }
      if (nx == null) {
        nx = 0;
      }
      if (ny == null) {
        ny = 0;
      }
      if (nz == null) {
        nz = 0;
      }
      if (ax == null) {
        ax = 0;
      }
      if (ay == null) {
        ay = 0;
      }
      if (az == null) {
        az = 0;
      }
      if (aw == null) {
        aw = 0;
      }
      if (bx == null) {
        bx = 0;
      }
      if (bY == null) {
        bY = 0;
      }
      if (bz == null) {
        bz = 0;
      }
      return ("" + (vx.toFixed(PRECISION)) + "," + (vy.toFixed(PRECISION)) + "," + (vz.toFixed(PRECISION)) + ",") + ("" + (cr.toFixed(PRECISION)) + "," + (cg.toFixed(PRECISION)) + "," + (cb.toFixed(PRECISION)) + ",") + ("" + (ca.toFixed(PRECISION)) + "," + (ts.toFixed(PRECISION)) + "," + (tt.toFixed(PRECISION)) + ",") + ("" + (nx.toFixed(PRECISION)) + "," + (ny.toFixed(PRECISION)) + "," + (nz.toFixed(PRECISION)) + ",") + ("" + (ax.toFixed(PRECISION)) + "," + (ay.toFixed(PRECISION)) + "," + (az.toFixed(PRECISION)) + ",") + ("" + (aw.toFixed(PRECISION)) + "," + (bx.toFixed(PRECISION)) + "," + (bY.toFixed(PRECISION)) + ",") + ("" + (bz.toFixed(PRECISION)));
    };

    Triangles.prototype.split = function(vertices, colors, textures, normals, indices, tangents, bitangents) {
      var aw, ax, ay, az, bY, bx, bz, ca, cb, cg, cr, i, i1, i2, i3, max, newMesh, nx, ny, nz, tracker, ts, tt, vx, vy, vz, _a, _b, _c, _h, _i, _j, _n, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _t, _v;

      max = 65535;
      if (vertices.length <= max * 3) {
        return null;
      }
      _c = [];
      _t = [];
      _n = [];
      _v = [];
      _i = [];
      _a = [];
      _b = [];
      tracker = {};
      if (indices.length === 0) {
        indices = (function() {
          var _j, _ref, _results;

          _results = [];
          for (i = _j = 0, _ref = vertices.length; _j < _ref; i = _j += 3) {
            _results.push(i / 3);
          }
          return _results;
        })();
      }
      for (i = _j = 0, _ref = indices.length; _j < _ref; i = _j += 3) {
        i1 = indices[i];
        i2 = indices[i + 1];
        i3 = indices[i + 2];
        if (i1 > max || i2 > max || i3 > max) {
          _ref1 = [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]], vx = _ref1[0], vy = _ref1[1], vz = _ref1[2];
          _ref2 = [normals[i1 * 3], normals[i1 * 3 + 1], normals[i1 * 3 + 2]], nx = _ref2[0], ny = _ref2[1], nz = _ref2[2];
          _ref3 = [textures[i1 * 2], textures[i1 * 2 + 1]], ts = _ref3[0], tt = _ref3[1];
          _ref4 = [colors[i1 * 4], colors[i1 * 4 + 1], colors[i1 * 4 + 2], colors[i1 * 4 + 3]], cr = _ref4[0], cg = _ref4[1], cb = _ref4[2], ca = _ref4[3];
          _ref5 = [tangents[i1 * 4], tangents[i1 * 4 + 1], tangents[i1 * 4 + 2], tangents[i1 * 4 + 3]], ax = _ref5[0], ay = _ref5[1], az = _ref5[2], aw = _ref5[3];
          _ref6 = [bitangents[i1 * 3], bitangents[i1 * 3 + 1], bitangents[i1 * 3 + 2]], bx = _ref6[0], bY = _ref6[1], bz = _ref6[2];
          _h = this.hash(vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz);
          if (tracker[_h]) {
            _i.push(tracker[_h]);
          } else {
            _i.push(tracker[_h] = _v.length / 3);
            _v.push(vx, vy, vz);
            if (colors.length) {
              _c.push(cr, cg, cb, ca);
            }
            if (textures.length) {
              _t.push(ts, tt);
            }
            if (normals.length) {
              _n.push(nx, ny, nz);
            }
            if (tangents.length) {
              _a.push(ax, ay, az, aw);
            }
            if (bitangents.length) {
              _b.push(bx, bY, bz);
            }
          }
          _ref7 = [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]], vx = _ref7[0], vy = _ref7[1], vz = _ref7[2];
          _ref8 = [normals[i2 * 3], normals[i2 * 3 + 1], normals[i2 * 3 + 2]], nx = _ref8[0], ny = _ref8[1], nz = _ref8[2];
          _ref9 = [textures[i2 * 2], textures[i2 * 2 + 1]], ts = _ref9[0], tt = _ref9[1];
          _ref10 = [colors[i2 * 4], colors[i2 * 4 + 1], colors[i2 * 4 + 2], colors[i2 * 4 + 3]], cr = _ref10[0], cg = _ref10[1], cb = _ref10[2], ca = _ref10[3];
          _ref11 = [tangents[i2 * 4], tangents[i2 * 4 + 1], tangents[i2 * 4 + 2], tangents[i2 * 4 + 3]], ax = _ref11[0], ay = _ref11[1], az = _ref11[2], aw = _ref11[3];
          _ref12 = [bitangents[i2 * 3], bitangents[i2 * 3 + 1], bitangents[i2 * 3 + 2]], bx = _ref12[0], bY = _ref12[1], bz = _ref12[2];
          _h = this.hash(vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz);
          if (tracker[_h]) {
            _i.push(tracker[_h]);
          } else {
            _i.push(tracker[_h] = _v.length / 3);
            _v.push(vx, vy, vz);
            if (colors.length) {
              _c.push(cr, cg, cb, ca);
            }
            if (textures.length) {
              _t.push(ts, tt);
            }
            if (normals.length) {
              _n.push(nx, ny, nz);
            }
            if (tangents.length) {
              _a.push(ax, ay, az, aw);
            }
            if (bitangents.length) {
              _b.push(bx, bY, bz);
            }
          }
          _ref13 = [vertices[i3 * 3], vertices[i3 * 3 + 1], vertices[i3 * 3 + 2]], vx = _ref13[0], vy = _ref13[1], vz = _ref13[2];
          _ref14 = [normals[i3 * 3], normals[i3 * 3 + 1], normals[i3 * 3 + 2]], nx = _ref14[0], ny = _ref14[1], nz = _ref14[2];
          _ref15 = [textures[i3 * 2], textures[i3 * 2 + 1]], ts = _ref15[0], tt = _ref15[1];
          _ref16 = [colors[i3 * 4], colors[i3 * 4 + 1], colors[i3 * 4 + 2], colors[i3 * 4 + 3]], cr = _ref16[0], cg = _ref16[1], cb = _ref16[2], ca = _ref16[3];
          _ref17 = [tangents[i3 * 4], tangents[i3 * 4 + 1], tangents[i3 * 4 + 2], tangents[i3 * 4 + 3]], ax = _ref17[0], ay = _ref17[1], az = _ref17[2], aw = _ref17[3];
          _ref18 = [bitangents[i3 * 3], bitangents[i3 * 3 + 1], bitangents[i3 * 3 + 2]], bx = _ref18[0], bY = _ref18[1], bz = _ref18[2];
          _h = this.hash(vx, vy, vz, nx, ny, nz, ts, tt, cr, cg, cb, ca, ax, ay, az, aw, bx, bY, bz);
          if (tracker[_h]) {
            _i.push(tracker[_h]);
          } else {
            _i.push(tracker[_h] = _v.length / 3);
            _v.push(vx, vy, vz);
            if (colors.length) {
              _c.push(cr, cg, cb, ca);
            }
            if (textures.length) {
              _t.push(ts, tt);
            }
            if (normals.length) {
              _n.push(nx, ny, nz);
            }
            if (tangents.length) {
              _a.push(ax, ay, az, aw);
            }
            if (bitangents.length) {
              _b.push(bx, bY, bz);
            }
          }
          indices.splice(i, 3);
          i -= 3;
        }
      }
      vertices.splice(max * 3, vertices.length);
      if (colors.length) {
        colors.splice(max * 4, colors.length);
      }
      if (textures.length) {
        textures.splice(max * 2, textures.length);
      }
      if (normals.length) {
        normals.splice(max * 3, normals.length);
      }
      if (tangents.length) {
        tangents.splice(max * 4, tangents.length);
      }
      if (tangents.length) {
        bitangents.splice(max * 3, tangents.length);
      }
      return newMesh = new this.__proto__.constructor({
        init: function(v, c, t, n, i) {
          var __a, __b, __c, __i, __n, __t, __v, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _o, _p, _q, _r, _results;

          for (_k = 0, _len = _v.length; _k < _len; _k++) {
            __v = _v[_k];
            v.push(__v);
          }
          if (_c) {
            for (_l = 0, _len1 = _c.length; _l < _len1; _l++) {
              __c = _c[_l];
              c.push(__c);
            }
          }
          if (_t) {
            for (_m = 0, _len2 = _t.length; _m < _len2; _m++) {
              __t = _t[_m];
              t.push(__t);
            }
          }
          if (_n) {
            for (_o = 0, _len3 = _n.length; _o < _len3; _o++) {
              __n = _n[_o];
              n.push(__n);
            }
          }
          if (_a) {
            for (_p = 0, _len4 = _a.length; _p < _len4; _p++) {
              __a = _a[_p];
              a.push(__a);
            }
          }
          if (_b) {
            for (_q = 0, _len5 = _b.length; _q < _len5; _q++) {
              __b = _b[_q];
              b.push(__b);
            }
          }
          _results = [];
          for (_r = 0, _len6 = _i.length; _r < _len6; _r++) {
            __i = _i[_r];
            _results.push(i.push(__i));
          }
          return _results;
        }
      });
    };

    return Triangles;

  })(Jax.Mesh.Base);

}).call(this);
(function() {
  Jax.Renderer = (function() {
    function Renderer() {}

    Renderer.registeredOrder = [];

    Renderer.register = function(klass) {
      return this.registeredOrder.push(klass);
    };

    Renderer.attemptThese = function(canvas, renderers, contextOptions) {
      var Renderer, e, name, _i, _len;

      for (_i = 0, _len = renderers.length; _i < _len; _i++) {
        Renderer = renderers[_i];
        name = null;
        try {
          if (Renderer instanceof Function) {
            name = Renderer.name;
          } else {
            name = Renderer;
            Renderer = Jax.Renderer[Renderer];
          }
          if (Renderer) {
            return new Renderer(canvas, contextOptions);
          } else {
            console.log("Warning: renderer '" + name + "' not found!");
          }
        } catch (_error) {
          e = _error;
          console.log("Instantiation of renderer '" + name + "' failed with: " + e);
        }
      }
      throw new Error("Could not find a compatible renderer.");
    };

    return Renderer;

  })();

}).call(this);
(function() {
  Jax.Context = (function() {
    Context.include(Jax.EventEmitter);

    function Context(canvas, options) {
      var _this = this;

      this.canvas = canvas;
      if (this.canvas && arguments.length === 1) {
        if (!(this.canvas instanceof HTMLElement || (typeof this.canvas) === "string")) {
          options = this.canvas;
          this.canvas = options.canvas;
          delete options.canvas;
        }
      }
      if (typeof this.canvas === 'string') {
        canvas = document.getElementById(this.canvas);
        if (!canvas) {
          throw new Error("Could not locate canvas element with ID '" + this.canvas + "'");
        }
        this.canvas = canvas;
      }
      options || (options = {});
      if (!this.canvas && this.canvas !== void 0) {
        throw new Error("Received `" + this.canvas + "` where a canvas was expected! If you meant to initialize Jax without a canvas, don't pass any value at all for one.");
      }
      this.clampTimechange = 0.25;
      this._isDisposed = false;
      this._isRendering = false;
      this._isUpdating = false;
      this._renderHandle = this._updateHandle = null;
      this._framesPerSecond = 0;
      this._renderStartTime = null;
      this._errorFunc = function(error, url, line) {
        var result;

        if (_this.controller && _this.controller.error) {
          result = _this.controller.error(error, url, line);
        } else if (typeof ApplicationController !== 'undefined' && ApplicationController.prototype.error) {
          result = ApplicationController.prototype.error.apply(_this.controller || new ApplicationController(), arguments);
        }
        if (result === true) {
          _this.restart();
          if (typeof error.preventDefault === "function") {
            error.preventDefault();
          }
          return true;
        } else {
          _this.stopRendering();
          _this.stopUpdating();
          return false;
        }
      };
      this._renderFunc = function(time) {
        var renderStartTime, timechange;

        time *= 0.001;
        renderStartTime = _this._renderStartTime || (_this._renderStartTime = time);
        _this._lastUptime = _this.uptime || renderStartTime;
        _this.uptime = time - renderStartTime;
        if (_this._calculateFrameRate) {
          _this.calculateFramerate();
        }
        if (_this.isUpdating()) {
          timechange = _this.getTimePassed();
          _this.update(timechange);
        }
        _this.render();
        if (_this.isRendering()) {
          return _this.requestRenderFrame();
        }
      };
      window.addEventListener('error', this._errorFunc);
      this.id = Jax.guid();
      this.world = new Jax.World(this);
      this.uptime = 0;
      this.matrix_stack = new Jax.MatrixStack();
      this.framerateSampleRatio = 0.9;
      this.setupRenderer(options);
      this.setupCamera();
      this.setupInputDevices(options.focus);
      this.startUpdating();
      if (options.root) {
        this.redirectTo(options.root);
      }
    }

    Context.getter('player', function() {
      console.log(new Error("Jax.Context#player is deprecated; it only contained `camera`, " + "so you should use Jax.Controller#activeCamera instead.").stack);
      return {
        camera: this.activeCamera
      };
    });

    Context.define('activeCamera', {
      set: function(c) {
        var _ref;

        return (_ref = this.controller) != null ? _ref.activeCamera = c : void 0;
      },
      get: function() {
        if (this.controller) {
          return this.controller.activeCamera;
        } else {
          return this.world.cameras[0];
        }
      }
    });

    Context.prototype.isDisposed = function() {
      return this._isDisposed;
    };

    Context.prototype.isRendering = function() {
      return this._isRendering;
    };

    Context.prototype.isUpdating = function() {
      return this._isUpdating;
    };

    /*
    Reloads and resets the matrix stack. Meant to be called
    each frame, prior to rendering the scene. This is called
    by #render automatically. Returns the stack itself.
    */


    Context.prototype.reloadMatrices = function() {
      var camera;

      camera = this.activeCamera;
      this.matrix_stack.reset();
      this.matrix_stack.loadModelMatrix(mat4.IDENTITY);
      this.matrix_stack.loadViewMatrix(camera.getInverseTransformationMatrix());
      this.matrix_stack.loadProjectionMatrix(camera.getProjectionMatrix());
      return this.matrix_stack;
    };

    Context.prototype.update = function(timechange) {
      var _ref;

      if ((_ref = this.controller) != null) {
        if (typeof _ref.update === "function") {
          _ref.update(timechange);
        }
      }
      return this.world.update(timechange);
    };

    /*
    Returns true if the active camera has no projection (e.g. neither
    `perspective` nor `ortho` has been called on it yet), or if the canvas
    size has changed since the last call to `setupCamera`.
    */


    Context.prototype.isViewportStale = function() {
      var camera;

      camera = this.activeCamera;
      if (!camera.projection) {
        return true;
      }
      if (this._realViewportWidth !== this.canvas.clientWidth) {
        return true;
      }
      if (this._realViewportHeight !== this.canvas.clientHeight) {
        return true;
      }
      return false;
    };

    Context.prototype.prepare = function() {
      if (this.isViewportStale()) {
        this.setupCamera();
      }
      this.reloadMatrices();
      return this.renderer.prepare();
    };

    Context.prototype.viewport = function() {
      return this.renderer.viewport();
    };

    Context.prototype.render = function() {
      var _ref;

      this.prepare();
      if ((_ref = this.controller) != null ? _ref.view : void 0) {
        return this.controller.view();
      } else {
        this.renderer.clear();
        return this.world.render();
      }
    };

    Context.prototype.getTimePassed = function() {
      var clampValue, timechange, uptime;

      uptime = this.uptime;
      timechange = uptime - this._lastUptime;
      if (clampValue = this.clampTimechange) {
        return Math.min(timechange, clampValue);
      } else {
        return timechange;
      }
    };

    Context.prototype.calculateFramerate = function() {
      var currentRenderStart, sampleRatio, timeToRenderThisFrame, uptime;

      uptime = this.uptime;
      currentRenderStart = uptime;
      sampleRatio = this.framerateSampleRatio;
      this._lastRenderStart || (this._lastRenderStart = uptime);
      timeToRenderThisFrame = currentRenderStart - this._lastRenderStart;
      this._timeToRender = (this._timeToRender || 0) * sampleRatio + timeToRenderThisFrame * (1 - sampleRatio);
      this._framesPerSecond = 1 / this._timeToRender;
      return this._lastRenderStart = currentRenderStart;
    };

    Context.prototype.startUpdating = function() {
      if (this.isUpdating() || this.isDisposed()) {
        return;
      }
      return this._isUpdating = true;
    };

    Context.prototype.startRendering = function() {
      if (this.isRendering() || this.isDisposed()) {
        return;
      }
      this._isRendering = true;
      return this.requestRenderFrame();
    };

    Context.prototype.stopUpdating = function() {
      if (!this.isUpdating()) {
        return;
      }
      return this._isUpdating = false;
    };

    Context.prototype.stopRendering = function() {
      if (!this.isRendering()) {
        return;
      }
      if (this._renderHandle !== null) {
        this.abortRenderFrame();
      }
      this._renderStartTime = null;
      return this._isRendering = false;
    };

    Context.prototype.restart = function() {
      this.stopRendering();
      this.stopUpdating();
      this.startRendering();
      return this.startUpdating();
    };

    Context.prototype.requestRenderFrame = function() {
      var currTime, timeToCall,
        _this = this;

      if (Jax.useRequestAnimFrame && this.useRequestAnimFrame) {
        this._requestedAnimFrame = true;
        return this._renderHandle = requestAnimationFrame(this._renderFunc, this.canvas);
      } else {
        this._requestedAnimFrame = false;
        currTime = new Date().getTime();
        timeToCall = Math.max(0, 16 - (currTime - (this._requestFrameLastTime || 0)));
        this._renderHandle = setTimeout((function() {
          return _this._renderFunc(currTime + timeToCall);
        }), timeToCall);
        return this._requestFrameLastTime = currTime + timeToCall;
      }
    };

    Context.prototype.abortRenderFrame = function() {
      if (this._requestedAnimFrame) {
        cancelAnimationFrame(this._renderHandle);
      } else {
        clearTimeout(this._renderHandle);
      }
      return this._renderHandle = null;
    };

    /*
    Sets up a rendering context which depends on @canvas. If @canvas was
    not supplied during initialization, nothing happens.
    */


    Context.prototype.setupRenderer = function(options) {
      var renderers;

      if (!this.canvas) {
        return;
      }
      options || (options = {});
      renderers = options.renderers || Jax.Renderer.registeredOrder;
      if (renderers.length) {
        this.renderer = Jax.Renderer.attemptThese(this.canvas, renderers, options);
        return this.gl = this.renderer.context;
      }
    };

    /*
    Initializes input devices such as keyboard and mouse. These are tied
    to the @canvas, so if that is unavailable, nothing happens.
    
    If `focusCanvas` is true, and keyboard input is used, the canvas will be
    given a tab index and programmatically focused. This can be passed as an
    initialization option to `Jax.Context`.
    */


    Context.prototype.setupInputDevices = function(focusCanvas) {
      var _ref, _ref1;

      if (focusCanvas == null) {
        focusCanvas = true;
      }
      if (this.canvas) {
        if ((_ref = Jax.Input) != null ? _ref.Mouse : void 0) {
          this.mouse = new Jax.Input.Mouse(this.canvas);
        }
        if ((_ref1 = Jax.Input) != null ? _ref1.Keyboard : void 0) {
          return this.keyboard = new Jax.Input.Keyboard(this.canvas, {
            focus: focusCanvas
          });
        }
      }
    };

    Context.prototype.redirectTo = function(path) {
      var descriptor;

      this.unregisterListeners();
      this.stopUpdating();
      this.stopRendering();
      if (path instanceof Jax.Controller) {
        this.unloadScene();
        this.controller = path;
        this.controller.fireAction('index', this);
      } else {
        descriptor = Jax.routes.recognizeRoute(path);
        if (descriptor.action !== 'index' && this.controller && this.controller instanceof descriptor.controller) {
          this.controller.fireAction(descriptor.action, this);
        } else {
          this.unloadScene();
          this.controller = Jax.routes.dispatch(path, this);
        }
      }
      this.registerListeners();
      this.startRendering();
      this.startUpdating();
      return this.controller;
    };

    Context.prototype.unloadScene = function() {
      this.world.dispose();
      this.world.cameras = 1;
      this.world.cameras[0].reset();
      this.setupCamera();
      return delete this._player;
    };

    Context.prototype.setupCamera = function() {
      if (this.world && this.canvas) {
        return this.activeCamera.perspective({
          width: this.canvas.clientWidth || this.canvas.width || 320,
          height: this.canvas.clientHeight || this.canvas.height || 200
        });
      }
    };

    Context.prototype.dispose = function() {
      window.removeEventListener('error', this._errorFunc);
      this.stopUpdating();
      this.stopRendering();
      this.world.dispose();
      this.unregisterListeners();
      return this._isDisposed = true;
    };

    Context.prototype.registerListeners = function() {
      var _this = this;

      if (!this.controller) {
        return;
      }
      if (this.mouse) {
        if (this.controller.mouse_pressed) {
          this.mouse.listen('press', function(evt) {
            return _this.controller.mouse_pressed(evt);
          });
        }
        if (this.controller.mouse_released) {
          this.mouse.listen('release', function(evt) {
            return _this.controller.mouse_released(evt);
          });
        }
        if (this.controller.mouse_clicked) {
          this.mouse.listen('click', function(evt) {
            return _this.controller.mouse_clicked(evt);
          });
        }
        if (this.controller.mouse_moved) {
          this.mouse.listen('move', function(evt) {
            return _this.controller.mouse_moved(evt);
          });
        }
        if (this.controller.mouse_entered) {
          this.mouse.listen('enter', function(evt) {
            return _this.controller.mouse_entered(evt);
          });
        }
        if (this.controller.mouse_exited) {
          this.mouse.listen('exit', function(evt) {
            return _this.controller.mouse_exited(evt);
          });
        }
        if (this.controller.mouse_dragged) {
          this.mouse.listen('drag', function(evt) {
            return _this.controller.mouse_dragged(evt);
          });
        }
        if (this.controller.mouse_scrolled) {
          this.mouse.listen('wheel', function(evt) {
            return _this.controller.mouse_scrolled(evt);
          });
        }
        if (this.controller.mouse_over) {
          this.mouse.listen('over', function(evt) {
            return _this.controller.mouse_over(evt);
          });
        }
      }
      if (this.keyboard) {
        if (this.controller.key_pressed) {
          this.keyboard.listen('press', function(evt) {
            return _this.controller.key_pressed(evt);
          });
        }
        if (this.controller.key_released) {
          this.keyboard.listen('release', function(evt) {
            return _this.controller.key_released(evt);
          });
        }
        if (this.controller.key_typed) {
          this.keyboard.listen('type', function(evt) {
            return _this.controller.key_typed(evt);
          });
        }
      }
      return true;
    };

    Context.prototype.unregisterListeners = function() {
      if (this.mouse) {
        this.mouse.stopListening();
      }
      if (this.keyboard) {
        return this.keyboard.stopListening();
      }
    };

    Context.prototype.getFramesPerSecond = function() {
      this._calculateFrameRate = true;
      return this._framesPerSecond;
    };

    Context.prototype.disableFrameSpeedCalculations = function() {
      return this._calculateFrameRate = false;
    };

    return Context;

  })();

}).call(this);
(function() {
  Jax.Renderer.register(Jax.Renderer.WebGL = (function() {
    WebGL.define('clearColor', {
      get: function() {
        return this._clearColor;
      },
      set: function(v) {
        var _ref;

        vec4.copy(this._clearColor, v);
        return (_ref = this.context).clearColor.apply(_ref, this._clearColor);
      }
    });

    function WebGL(canvas, options) {
      if (!canvas.getContext) {
        throw new Error("WebGL not supported!");
      }
      this.context = canvas.getContext('experimental-webgl', options);
      if (!this.context) {
        throw new Error("WebGL not supported!");
      }
      this._clearColor || (this._clearColor = vec4.fromValues(0, 0, 0, 0));
      this.clearColor = [0, 0, 0, 0];
      this.context.clearDepth(1.0);
      this.context.enable(GL_DEPTH_TEST);
      this.context.depthFunc(GL_LESS);
      this.context.enable(GL_BLEND);
      this.context.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      this.context.enable(GL_CULL_FACE);
    }

    WebGL.prototype.clear = function() {
      return this.context.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
    };

    /*
    Prepare to render the scene.
    */


    WebGL.prototype.prepare = function() {
      return this.viewport();
    };

    WebGL.prototype.viewport = function() {
      var canvasHeight, canvasWidth;

      canvasWidth = this.context.canvas.width;
      canvasHeight = this.context.canvas.height;
      return this.context.viewport(0, 0, canvasWidth, canvasHeight);
    };

    return WebGL;

  })());

}).call(this);
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Jax.Input = (function() {
    Input.include(Jax.EventEmitter);

    function Input(receiver, options) {
      var _this = this;

      this.receiver = receiver;
      this.options = options != null ? options : {};
      this._listeners = {};
      this.receiver.getEventListeners = function(type) {
        return _this.getReceiverEventListeners(type);
      };
    }

    Input.prototype.getReceiverEventListeners = function(type) {
      var _base;

      return (_base = this._listeners)[type] || (_base[type] = []);
    };

    Input.prototype.isListening = function(type) {
      return !!this.getReceiverEventListeners(type).length;
    };

    /*
    Subclasses can override this method if they need to maintain themselves
    over time. The default implementation does nothing. Timechange is in 
    seconds.
    */


    Input.prototype.update = function(timechange) {};

    /*
    Manually triggers an event on the underlying receiver. This is mostly
    used for testing. Subclasses must override this method; the default
    implementation just raises an error.
    */


    Input.prototype.trigger = function(type, event) {
      throw new Error("" + this.__proto__.constructor.name + " can't trigger event type " + type + ": not implemented");
    };

    /*
    Explicitly process a given event object. This is normally invoked by
    an event listener added to the underlying receiver.
    */


    Input.prototype.processEvent = function(eventType, evt) {
      var listener, _i, _len, _ref;

      _ref = this.getReceiverEventListeners(eventType);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.call(this, evt);
      }
      return true;
    };

    /*
    Convenience method that just registers the specified event listener with
    the input receiver. Ensures that the specific callback is only ever
    registered once.
    */


    Input.prototype.attach = function(eventType, callback) {
      var listeners,
        _this = this;

      listeners = this.getReceiverEventListeners(eventType);
      if (!listeners["interface"]) {
        listeners["interface"] = function(evt) {
          evt.preventDefault();
          return _this.processEvent(eventType, evt);
        };
        this.receiver.addEventListener(eventType, listeners["interface"]);
      }
      if (__indexOf.call(listeners, callback) < 0) {
        return listeners.push(callback);
      }
    };

    /*
    Removes all event listeners from the input receiver.
    */


    Input.prototype.stopListening = function() {
      var listeners, type;

      for (type in this._listeners) {
        listeners = this.getReceiverEventListeners(type);
        if (listeners["interface"]) {
          this.receiver.removeEventListener(type, listeners["interface"]);
          listeners.length = 0;
          delete listeners["interface"];
        }
      }
      return this.removeAllEventListeners();
    };

    /*
    Starts listening for a specific event type. The callback is optional and
    if specified, will be fired every time this input device fires the specified
    event type.
    */


    Input.prototype.listen = function(type, callback) {
      var domTypes, eventType, _i, _len, _ref, _ref1;

      if (this[type]) {
        if (domTypes = (_ref = this.__proto__.constructor.eventTypes) != null ? _ref[type] : void 0) {
          _ref1 = domTypes.split(/,/);
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            eventType = _ref1[_i];
            this.attach(eventType.trim(), this[type]);
            if (callback) {
              this.addEventListener(type, callback);
            }
          }
          return true;
        } else {
          throw new Error("BUG: Method `" + type + "` exists but no corresponding DOM event type associated");
        }
      } else {
        throw new Error("Invalid " + this.__proto__.constructor.name + " input type: " + type);
      }
    };

    return Input;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Input.Keyboard = (function(_super) {
    __extends(Keyboard, _super);

    Keyboard.eventTypes = {
      press: 'keydown',
      release: 'keyup',
      type: 'keypress'
    };

    function Keyboard(element, options) {
      var shouldFocus;

      if (options == null) {
        options = {};
      }
      Keyboard.__super__.constructor.call(this, element, options);
      shouldFocus = false;
      if (!this.receiver.getAttribute('tabindex')) {
        shouldFocus = true;
        this.receiver.setAttribute('tabindex', '0');
      }
      if (options.focus === void 0 || options.focus) {
        if (shouldFocus) {
          this.receiver.focus();
        }
      }
      this.receiver.addEventListener('mouseover', this._captureFocus = function(e) {
        return this.focus();
      });
    }

    Keyboard.prototype.trigger = function(type, evt) {
      var event;

      if (evt == null) {
        evt = {};
      }
      event = document.createEvent('KeyboardEvent');
      if (event.initKeyboardEvent) {
        event.initKeyboardEvent(type, true, true, null, evt.ctrl, evt.alt, evt.shift, evt.meta, evt.keyCode, evt.charCode);
      } else {
        event.initKeyEvent(type, true, true, null, evt.ctrl, evt.alt, evt.shift, evt.meta, evt.keyCode, evt.charCode);
      }
      return this.receiver.dispatchEvent(event);
    };

    Keyboard.prototype.stopListening = function() {
      this.receiver.removeEventListener('mouseover', this._captureFocus);
      return Keyboard.__super__.stopListening.call(this);
    };

    Keyboard.prototype.press = function(e) {
      return this.fireEvent('press', e);
    };

    Keyboard.prototype.release = function(e) {
      return this.fireEvent('release', e);
    };

    Keyboard.prototype.type = function(e) {
      return this.fireEvent('type', e);
    };

    return Keyboard;

  })(Jax.Input);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Input.Mouse = (function(_super) {
    __extends(Mouse, _super);

    Mouse.eventTypes = {
      press: 'mousedown',
      release: 'mouseup',
      move: 'mousemove',
      over: 'mouseover',
      wheel: 'mousewheel, DOMMouseScroll',
      exit: 'mouseout'
    };

    /*
    Click speed, in seconds. The lower this number, the faster the
    mouse must be pressed and released in order to result in a single click.
    Defaults to 0.25.
    */


    Mouse.define('clickSpeed', {
      get: function() {
        return this._clickSpeed || (this._clickSpeed = 0.25);
      },
      set: function(speed) {
        return this._clickSpeed = speed;
      }
    });

    function Mouse(element) {
      Mouse.__super__.constructor.call(this, element);
      this._pendingClicks = {};
      this._clickCount = {};
      this._buttonState = {};
    }

    /*
    Programmatically triggers an event. Note that because Jax uses
    `addEventListener`, you can't trigger events using jQuery. Instead,
    you have to either trigger events through the DOM methods, or use this 
    method.
    */


    Mouse.prototype.trigger = function(type, evt) {
      var event;

      if (evt == null) {
        evt = {};
      }
      if (type === 'click') {
        this.trigger('mousedown', evt);
        this.trigger('mouseup', evt);
        return;
      }
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(type, true, true, window, 1, evt.screenX, evt.screenY, evt.clientX, evt.clientY, false, false, false, false, evt.button, null);
      return this.receiver.dispatchEvent(event);
    };

    Mouse.prototype.processEvent = function(type, evt) {
      evt = this.normalizeEvent(evt);
      return Mouse.__super__.processEvent.call(this, type, evt);
    };

    /*
    Preprocesses the mouse event, adding the following attributes:
    
    * `x`: the X coordinate of the mouse event, relative to the
           @receiver element, in pixels, scaled from the element's
           actual size to the size of the element's render buffer.
    * `y`: the Y coordinate of the mouse event, relative to the
           @receiver element, in pixels, scaled from the element's
           actual size to the size of the element's render buffer.
    * `diffx`: the change in `x` between the last event and this
    * `diffy`: the change in `y` between the last event and this
    
    Returns the normalized event.
    */


    Mouse.prototype.normalizeEvent = function(evt) {
      var rect, root, _ref, _ref1;

      rect = this.receiver.getBoundingClientRect();
      root = document.documentElement;
      evt = {
        base: evt,
        button: evt.button,
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
        wheelDeltaX: evt.wheelDeltaX || 0,
        wheelDeltaY: evt.wheelDeltaY || -evt.detail,
        wheelDeltaZ: evt.wheelDeltaZ || 0,
        wheelDelta: evt.wheelDelta || 1
      };
      evt.x *= this.receiver.width / rect.width;
      evt.y *= this.receiver.height / rect.height;
      if (this._lastx === void 0) {
        evt.diffx = evt.diffy = 0;
      } else {
        _ref = [evt.x - this._lastx, evt.y - this._lasty], evt.diffx = _ref[0], evt.diffy = _ref[1];
      }
      _ref1 = [evt.x, evt.y], this._lastx = _ref1[0], this._lasty = _ref1[1];
      return evt;
    };

    Mouse.prototype.update = function(timechange) {
      var button;

      for (button in this._pendingClicks) {
        this._pendingClicks[button] += timechange;
        if (this._pendingClicks[button] >= this.clickSpeed) {
          this.clearClick(button);
        }
      }
      return true;
    };

    Mouse.prototype.logClickStart = function(button) {
      this._pendingClicks[button] = 0;
      return this._clickCount[button] = (this._clickCount[button] || 0) + 1;
    };

    Mouse.prototype.clearClick = function(button) {
      delete this._pendingClicks[button];
      return delete this._clickCount[button];
    };

    Mouse.prototype.listen = function(type, callback) {
      switch (type) {
        case 'enter':
          Mouse.__super__.listen.call(this, 'over');
          Mouse.__super__.listen.call(this, 'exit');
          if (callback) {
            return this.addEventListener('enter', callback);
          }
          break;
        case 'move':
        case 'click':
          Mouse.__super__.listen.call(this, 'move');
          Mouse.__super__.listen.call(this, 'press');
          Mouse.__super__.listen.call(this, 'release');
          if (callback) {
            return this.addEventListener(type, callback);
          }
          break;
        case 'drag':
          Mouse.__super__.listen.call(this, 'move');
          Mouse.__super__.listen.call(this, 'press');
          Mouse.__super__.listen.call(this, 'release');
          Mouse.__super__.listen.call(this, 'exit');
          if (callback) {
            return this.addEventListener(type, callback);
          }
          break;
        default:
          return Mouse.__super__.listen.call(this, type, callback);
      }
    };

    Mouse.prototype.press = function(e) {
      this.fireEvent('press', e);
      this.logClickStart(e.button);
      return this._buttonState[e.button] = true;
    };

    Mouse.prototype.release = function(e) {
      this.fireEvent('release', e);
      this._buttonState[e.button] = false;
      if (this._pendingClicks[e.button] !== void 0) {
        e.clickCount = this._clickCount[e.button];
        return this.fireEvent('click', e);
      }
    };

    Mouse.prototype.move = function(e) {
      var button;

      if (this._buttonState[e.button]) {
        for (button in this._pendingClicks) {
          this.clearClick(button);
        }
        return this.fireEvent('drag', e);
      } else {
        return this.fireEvent('move', e);
      }
    };

    Mouse.prototype.over = function(e) {
      this.fireEvent('over', e);
      if (!this._entered) {
        this._entered = true;
        return this.fireEvent('enter', e);
      }
    };

    Mouse.prototype.wheel = function(e) {
      return this.fireEvent('wheel', e);
    };

    Mouse.prototype.exit = function(e) {
      var button;

      this._entered = false;
      for (button in this._buttonState) {
        delete this._buttonState[button];
      }
      return this.fireEvent('exit', e);
    };

    return Mouse;

  })(Jax.Input);

}).call(this);
(function() {
  Jax.Noise = (function() {
    var grad, grad_buf, initGradTexture, perm;

    perm = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

    grad = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]];

    grad_buf = null;

    initGradTexture = function() {
      var gv, i, j, offset, pixels, tex, value, _i, _j;

      tex = new Jax.Texture({
        min_filter: GL_NEAREST,
        mag_filter: GL_NEAREST,
        width: 256,
        height: 256
      });
      if (!grad_buf) {
        pixels = new Array(256 * 256 * 4);
        for (i = _i = 0; _i < 256; i = ++_i) {
          for (j = _j = 0; _j < 256; j = ++_j) {
            offset = (i * 256 + j) * 4;
            value = perm[(j + perm[i]) & 0xFF];
            gv = value & 0x0F;
            pixels[offset] = grad[gv][0] * 64 + 128;
            pixels[offset + 1] = grad[gv][1] * 64 + 128;
            pixels[offset + 2] = grad[gv][2] * 64 + grad[gv][3] * 16 + 128;
            pixels[offset + 3] = value;
          }
        }
        grad_buf = new Uint8Array(pixels);
      }
      return tex;
    };

    Noise.prototype.prepare = function(context) {
      return this.grad.bind(context, function() {
        return context.gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, grad_buf);
      });
    };

    function Noise(context) {
      if (context == null) {
        context = null;
      }
      this.grad = initGradTexture();
      if (context) {
        this.prepare(context);
      }
    }

    Noise.prototype.bind = function(context, uniforms) {
      if (!this.isPrepared(context)) {
        this.prepare(context);
      }
      return uniforms.gradTexture = this.grad;
    };

    Noise.prototype.isPrepared = function(context) {
      return this.grad.isValid(context);
    };

    return Noise;

  })();

  Jax.noise = new Jax.Noise;

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Cone = (function(_super) {
    __extends(Cone, _super);

    function Cone(options) {
      options || (options = {});
      options.sides || (options.sides = 8);
      options.size || (options.size = 1);
      options.radius || (options.radius = options.size / 2);
      options.height || (options.height = options.size);
      Cone.__super__.constructor.call(this, options);
      if (this.sides < 3) {
        throw new Error("Cone requires minimum 3 sides");
      }
    }

    Cone.prototype.init = function(vertices, colors, textures, normals) {
      var delta, side, x, z, _i, _ref, _results;

      vertices.push(0, this.height / 2, 0);
      textures.push(0, 0);
      delta = Math.PI * 2 / this.sides;
      _results = [];
      for (side = _i = 0, _ref = -this.sides; 0 <= _ref ? _i <= _ref : _i >= _ref; side = 0 <= _ref ? ++_i : --_i) {
        x = Math.cos(side * delta);
        z = Math.sin(side * delta);
        vertices.push(x * this.radius, -this.height / 2, z * this.radius);
        _results.push(textures.push(x * 0.5 + 0.5, z * 0.5 + 0.5));
      }
      return _results;
    };

    return Cone;

  })(Jax.Mesh.TriangleFan);

}).call(this);
/*
Constructs a 6-sided Cube mesh.

Options:

* width : the width of the cube in units. Defaults to +size+.
* height : the height of the cube in units. Defaults to +size+.
* depth : the depth of the cube in units. Defaults to +size+.
* size : a value to use for any of the other options if
  they are unspecified. Defaults to 1.0.

Example:

    new Jax.Mesh.Cube();                  //=> 1x1x1
    new Jax.Mesh.Cube({size:2});          //=> 2x2x2
    new Jax.Mesh.Cube({width:2});         //=> 2x1x1
    new Jax.Mesh.Cube({width:2,depth:3}); //=> 2x1x3
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Cube = (function(_super) {
    var SIDES, _tmpvec3;

    __extends(Cube, _super);

    SIDES = ['front', 'back', 'left', 'right', 'top', 'bottom'];

    _tmpvec3 = vec3.create();

    function Cube(options) {
      var d, h, invalidate, size, w, _ref,
        _this = this;

      if (options == null) {
        options = {};
      }
      size = options.size || (options.size = 1);
      options.width || (options.width = options.size);
      options.depth || (options.depth = options.size);
      options.height || (options.height = options.size);
      Cube.__super__.constructor.call(this, options);
      invalidate = function() {
        return _this.invalidate(true);
      };
      _ref = [options.width, options.height, options.depth], w = _ref[0], h = _ref[1], d = _ref[2];
      this.left = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.left.camera.reorient([-1, 0, 0], [-w / 2, 0, 0]);
      this.left.mesh.addEventListener('colorChanged', invalidate);
      this.left.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.left, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
      this.right = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.right.camera.reorient([1, 0, 0], [w / 2, 0, 0]);
      this.right.mesh.addEventListener('colorChanged', invalidate);
      this.right.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.right, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
      this.front = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.front.camera.reorient([0, 0, 1], [0, 0, d / 2]);
      this.front.mesh.addEventListener('colorChanged', invalidate);
      this.front.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.front, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
      this.back = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.back.camera.reorient([0, 0, -1], [0, 0, -d / 2]);
      this.back.mesh.addEventListener('colorChanged', invalidate);
      this.back.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.back, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
      this.top = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.top.camera.reorient([0, 1, 0], [0, h / 2, 0]);
      this.top.mesh.addEventListener('colorChanged', invalidate);
      this.top.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.top, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
      this.bottom = new Jax.Model({
        mesh: new Jax.Mesh.Quad(d, h)
      });
      this.bottom.camera.reorient([0, -1, 0], [0, -h / 2, 0]);
      this.bottom.mesh.addEventListener('colorChanged', invalidate);
      this.bottom.camera.addEventListener('updated', invalidate);
      Object.defineProperty(this.bottom, 'color', {
        get: function() {
          return this.mesh.color;
        },
        set: function(c) {
          return this.mesh.color = c;
        }
      });
    }

    Cube.prototype.init = function(verts, colors, texes, norms) {
      var cofs, j, k, mvmatrix, nmatrix, sdata, side, tofs, vofs, _i, _j, _k, _len, _ref, _ref1;

      for (_i = 0, _len = SIDES.length; _i < _len; _i++) {
        side = SIDES[_i];
        side = this[side];
        sdata = side.mesh.data;
        mvmatrix = side.camera.getTransformationMatrix();
        nmatrix = side.camera.getNormalMatrix();
        for (j = _j = 0, _ref = sdata.length; 0 <= _ref ? _j < _ref : _j > _ref; j = 0 <= _ref ? ++_j : --_j) {
          _ref1 = [j * 3, j * 2, j * 4], vofs = _ref1[0], tofs = _ref1[1], cofs = _ref1[2];
          _tmpvec3[0] = sdata.vertexBuffer[vofs];
          _tmpvec3[1] = sdata.vertexBuffer[vofs + 1];
          _tmpvec3[2] = sdata.vertexBuffer[vofs + 2];
          vec3.transformMat4(_tmpvec3, _tmpvec3, mvmatrix);
          verts.push(-_tmpvec3[0], -_tmpvec3[1], -_tmpvec3[2]);
          _tmpvec3[0] = sdata.normalBuffer[vofs];
          _tmpvec3[1] = sdata.normalBuffer[vofs + 1];
          _tmpvec3[2] = sdata.normalBuffer[vofs + 2];
          vec3.transformMat3(_tmpvec3, _tmpvec3, nmatrix);
          norms.push(_tmpvec3[0], _tmpvec3[1], _tmpvec3[2]);
          for (k = _k = 0; _k < 4; k = ++_k) {
            colors.push(sdata.colorBuffer[cofs + k]);
            if (k < 2) {
              texes.push(sdata.textureCoordsBuffer[tofs + k]);
            }
          }
        }
      }
      return true;
    };

    return Cube;

  })(Jax.Mesh.Triangles);

}).call(this);
/*
A Geodesic Sphere mesh, which is the fractalization of an icosahedron

Options:

* size : the size of the geode in units. Defaults to 1.0.
* subdivisions : the number of times each face is divided into 4 triangles. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphere
    new Jax.Mesh.GeodesicSphere size: 2, subdivisions: 1
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.GeodesicSphere = (function(_super) {
    var g;

    __extends(GeodesicSphere, _super);

    g = (1 + Math.sqrt(5)) / 2;

    GeodesicSphere.prototype.icosahedron = {
      vertices: [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]],
      faces: [[0, 11, 5], [0, 5, 1], [0, 1, 7], [7, 1, 8], [8, 6, 7], [10, 7, 6], [0, 7, 10], [0, 10, 11], [11, 10, 2], [6, 2, 10], [3, 2, 6], [3, 6, 8], [3, 8, 9], [3, 9, 4], [3, 4, 2], [2, 4, 11], [5, 11, 4], [4, 9, 5], [1, 5, 9], [9, 8, 1]],
      uvU: 2 / 11,
      uvV: 1 / 3,
      facesUVs: [[[1, 1], [1 / 2, 0], [0, 1]], [[1, 1], [0, 1], [1 / 2, 2]], [[1, 1], [1 / 2, 2], [3 / 2, 2]], [[3 / 2, 2], [1 / 2, 2], [1, 3]], [[2, 3], [5 / 2, 2], [3 / 2, 2]], [[2, 1], [3 / 2, 2], [5 / 2, 2]], [[1, 1], [3 / 2, 2], [2, 1]], [[1, 1], [2, 1], [3 / 2, 0]], [[5 / 2, 0], [2, 1], [3, 1]], [[5 / 2, 2], [3, 1], [2, 1]], [[7 / 2, 2], [3, 1], [5 / 2, 2]], [[7 / 2, 2], [5 / 2, 2], [3, 3]], [[7 / 2, 2], [4, 3], [9 / 2, 2]], [[7 / 2, 2], [9 / 2, 2], [4, 1]], [[7 / 2, 2], [4, 1], [3, 1]], [[3, 1], [4, 1], [7 / 2, 0]], [[5, 1], [9 / 2, 0], [4, 1]], [[4, 1], [9 / 2, 2], [5, 1]], [[11 / 2, 2], [5, 1], [9 / 2, 2]], [[9 / 2, 2], [5, 3], [11 / 2, 2]]]
    };

    function GeodesicSphere(options) {
      if (options == null) {
        options = {};
      }
      this.size = 1;
      this.subdivisions = 0;
      if (options.subdivisions > 5) {
        console.warn("Geode subdivided > 5 times is NOT supported ATM. Use at your own risk !");
      }
      if (options.icosahedron) {
        options.icosahedron = Jax.Util.merge(options.icosahedron, this.icosahedron);
      }
      GeodesicSphere.__super__.constructor.call(this, options);
    }

    GeodesicSphere.prototype.init = function(vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) {
      var face, faceUVs, recursiveInit, recursiveInitUV, size, u, v, _i, _j, _len, _len1, _ref, _ref1, _vA, _vB, _vC;

      size = this.size;
      _vA = vec3.create();
      _vB = vec3.create();
      _vC = vec3.create();
      recursiveInit = function(vA, vB, vC, detail) {
        var midAB, midBC, midCA;

        if (detail < 1) {
          vec3.normalize(_vA, vA);
          vec3.normalize(_vB, vB);
          vec3.normalize(_vC, vC);
          vertexNormals.push(_vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]);
          vec3.scale(_vA, _vA, size);
          vec3.scale(_vB, _vB, size);
          vec3.scale(_vC, _vC, size);
          vertices.push(_vA[0], _vA[1], _vA[2], _vB[0], _vB[1], _vB[2], _vC[0], _vC[1], _vC[2]);
        } else {
          detail--;
          midAB = vec3.create();
          midBC = vec3.create();
          midCA = vec3.create();
          vec3.scale(midAB, vec3.add(midAB, vA, vB), 1 / 2);
          vec3.scale(midBC, vec3.add(midBC, vB, vC), 1 / 2);
          vec3.scale(midCA, vec3.add(midCA, vC, vA), 1 / 2);
          recursiveInit(vA, midAB, midCA, detail);
          recursiveInit(midAB, vB, midBC, detail);
          recursiveInit(midCA, midBC, vC, detail);
          recursiveInit(midAB, midBC, midCA, detail);
        }
        return true;
      };
      u = this.icosahedron.uvU;
      v = this.icosahedron.uvV;
      recursiveInitUV = function(uvA, uvB, uvC, detail) {
        var midAB, midBC, midCA;

        if (detail < 1) {
          textureCoords.push(uvA[0] * u, uvA[1] * v, uvB[0] * u, uvB[1] * v, uvC[0] * u, uvC[1] * v);
        } else {
          detail--;
          midAB = vec3.create();
          midBC = vec3.create();
          midCA = vec3.create();
          vec3.scale(midAB, vec3.add(midAB, uvA, uvB), 1 / 2);
          vec3.scale(midBC, vec3.add(midBC, uvB, uvC), 1 / 2);
          vec3.scale(midCA, vec3.add(midCA, uvC, uvA), 1 / 2);
          recursiveInitUV(uvA, midAB, midCA, detail);
          recursiveInitUV(midAB, uvB, midBC, detail);
          recursiveInitUV(midCA, midBC, uvC, detail);
          recursiveInitUV(midAB, midBC, midCA, detail);
        }
        return true;
      };
      _ref = this.icosahedron.faces;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        face = _ref[_i];
        recursiveInit(vec3.clone(this.icosahedron.vertices[face[0]]), vec3.clone(this.icosahedron.vertices[face[1]]), vec3.clone(this.icosahedron.vertices[face[2]]), this.subdivisions);
      }
      _ref1 = this.icosahedron.facesUVs;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        faceUVs = _ref1[_j];
        recursiveInitUV(vec2.clone(faceUVs[0]), vec2.clone(faceUVs[1]), vec2.clone(faceUVs[2]), this.subdivisions);
      }
      return true;
    };

    return GeodesicSphere;

  })(Jax.Mesh.Triangles);

}).call(this);
/*
A Geodesic Sphere Dual mesh
Its faces are 12 pentagons and the rest are hexagons.
Of course, these are made of respectively 5 and 6 triangles,
almost equilaterals.

With 0 subdivisions, it's a dodecahedron (12 pentagons, 0 hexagon)
With 1, it looks like a football
With 2, it looks like a golfball
With 3 and more, it looks like a Civilization V map

Don't use it with more than 3 subdivisions

¡ THIS SCALES BADLY ! O(4^n) at least

Options:

* size : the size of the geode in units. Defaults to 1.0.
* subdivisions : the number of times each face is divided into 4 triangles before dualization. Defaults to 0.

Example:

    new Jax.Mesh.GeodesicSphereDual
    new Jax.Mesh.GeodesicSphereDual size: 2, subdivisions: 1

Demos:

* See geodes.js.coffee
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.GeodesicSphereDual = (function(_super) {
    __extends(GeodesicSphereDual, _super);

    function GeodesicSphereDual(options) {
      if (options == null) {
        options = {};
      }
      if (options.subdivisions > 3) {
        console.warn("Dual Geode subdivided > 3 times is not supported");
      }
      this.pentagons = [];
      this.hexagons = [];
      GeodesicSphereDual.__super__.constructor.call(this, options);
    }

    GeodesicSphereDual.prototype.init = function(vertices, colors, textureCoords, vertexNormals, vertexIndices, tangents, bitangents) {
      var a, b, c, centerVertices, closestVertices, currentVertexBufferIndex, geodeColors, geodeTextureCoords, geodeVertexNormals, geodeVertices, getClosestVertices, i, icosahedronVertices, isIn, medianAltitude, n, o, uniqueGeodeVertices, vertex, _i, _j, _k, _l, _len, _m, _n, _ref, _ref1, _ref2, _ref3;

      isIn = function(needleVertex, verticesHaystack) {
        var vertex, _i, _len;

        for (_i = 0, _len = verticesHaystack.length; _i < _len; _i++) {
          vertex = verticesHaystack[_i];
          if (vec3.distance(needleVertex, vertex) < Math.EPSILON) {
            return true;
          }
        }
        return false;
      };
      getClosestVertices = function(vertex, vertices, howMuch) {
        var closestVertices, i, start, _i, _vA, _vB;

        howMuch = Math.min(howMuch, vertices.length);
        vertices.sort(function(vA, vB) {
          if (vA === vertex) {
            return 1;
          }
          if (vB === vertex) {
            return -1;
          }
          return vec3.dot(vertex, vB) - vec3.dot(vertex, vA);
        });
        closestVertices = [];
        for (i = _i = 0; _i < howMuch; i = _i += 1) {
          closestVertices.push(vertices[i]);
        }
        start = vec3.subtract([], closestVertices[0], vertex);
        vec3.normalize(start, start);
        _vA = vec3.create();
        _vB = vec3.create();
        closestVertices.sort(function(vA, vB) {
          var a, b, dA, dB, dotA, dotB;

          dA = vec3.normalize(_vA, vec3.subtract(_vA, vA, vertex));
          dB = vec3.normalize(_vB, vec3.subtract(_vB, vB, vertex));
          a = vec3.dot(start, dA) + 1;
          b = vec3.dot(start, dB) + 1;
          dotA = vec3.dot(vertex, vec3.cross([], start, dA));
          dotB = vec3.dot(vertex, vec3.cross([], start, dB));
          if (dotA < 0) {
            a *= -1;
          }
          if (dotB < 0) {
            b *= -1;
          }
          return b - a;
        });
        return closestVertices;
      };
      _ref = [[], [], [], []], geodeVertices = _ref[0], geodeColors = _ref[1], geodeTextureCoords = _ref[2], geodeVertexNormals = _ref[3];
      GeodesicSphereDual.__super__.init.call(this, geodeVertices, geodeColors, geodeTextureCoords, geodeVertexNormals);
      uniqueGeodeVertices = [];
      centerVertices = [];
      for (i = _i = 0, _ref1 = geodeVertices.length; _i < _ref1; i = _i += 9) {
        a = [geodeVertices[i], geodeVertices[i + 1], geodeVertices[i + 2]];
        b = [geodeVertices[i + 3], geodeVertices[i + 4], geodeVertices[i + 5]];
        c = [geodeVertices[i + 6], geodeVertices[i + 7], geodeVertices[i + 8]];
        o = vec3.scale([], vec3.normalize([], vec3.add([], vec3.add([], a, b), c)), this.size);
        if (!isIn(a, uniqueGeodeVertices)) {
          uniqueGeodeVertices.push(a);
        }
        if (!isIn(b, uniqueGeodeVertices)) {
          uniqueGeodeVertices.push(b);
        }
        if (!isIn(c, uniqueGeodeVertices)) {
          uniqueGeodeVertices.push(c);
        }
        centerVertices.push(o);
      }
      icosahedronVertices = this.icosahedron.vertices.slice(0);
      for (i = _j = 0, _ref2 = icosahedronVertices.length; _j < _ref2; i = _j += 1) {
        vec3.normalize(icosahedronVertices[i], icosahedronVertices[i]);
        vec3.scale(icosahedronVertices[i], icosahedronVertices[i], this.size);
      }
      currentVertexBufferIndex = 0;
      for (_k = 0, _len = uniqueGeodeVertices.length; _k < _len; _k++) {
        vertex = uniqueGeodeVertices[_k];
        if (isIn(vertex, icosahedronVertices)) {
          n = 5;
        } else {
          n = 6;
        }
        closestVertices = getClosestVertices(vertex, centerVertices, n);
        medianAltitude = [0, 0, 0];
        for (i = _l = 0; _l < n; i = _l += 1) {
          vec3.add(medianAltitude, medianAltitude, closestVertices[i]);
        }
        medianAltitude = vec3.length(medianAltitude) / n;
        vec3.normalize(vertex, vertex);
        vec3.scale(vertex, vertex, medianAltitude);
        for (i = _m = 0; _m < n; i = _m += 1) {
          vertices.push(vertex[0], vertex[1], vertex[2]);
          vertices.push(closestVertices[i][0], closestVertices[i][1], closestVertices[i][2]);
          vertices.push(closestVertices[(i + 1) % n][0], closestVertices[(i + 1) % n][1], closestVertices[(i + 1) % n][2]);
        }
        currentVertexBufferIndex += n * 9;
      }
      for (i = _n = 0, _ref3 = vertices.length; _n < _ref3; i = _n += 9) {
        if (i % 2 === 0) {
          textureCoords.push(0, 0, 1, 1, 1, 0);
        } else {
          textureCoords.push(0, 0, 0, 1, 1, 1);
        }
      }
      return true;
    };

    return GeodesicSphereDual;

  })(Jax.Mesh.GeodesicSphere);

}).call(this);
/*
An Icosahedron mesh, which is a regular polyhedron with 20 equilateral triangles as sides

Options:

* size : the size of the icosahedron in units. Defaults to 1.0.

Example:

    new Jax.Mesh.Icosahedron
    new Jax.Mesh.Icosahedron size: 2
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Icosahedron = (function(_super) {
    __extends(Icosahedron, _super);

    function Icosahedron(options) {
      if (options == null) {
        options = {};
      }
      options.subdivisions = 0;
      Icosahedron.__super__.constructor.call(this, options);
    }

    return Icosahedron;

  })(Jax.Mesh.GeodesicSphere);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.LineCube = (function(_super) {
    __extends(LineCube, _super);

    function LineCube(halfSize, offset) {
      this.halfSize = halfSize != null ? halfSize : 0.5;
      this.offset = offset != null ? offset : [0, 0, 0];
      if (typeof this.halfSize !== 'number') {
        LineCube.__super__.constructor.call(this, this.halfSize);
        this.halfSize = this.size / 2;
      } else {
        LineCube.__super__.constructor.call(this);
      }
    }

    LineCube.prototype.init = function(vertices, colors, normals, textures, indices) {
      var halfSize, offset, v;

      halfSize = this.halfSize;
      offset = this.offset;
      v = vec3.create();
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, 1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, 1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [-1, -1, -1], halfSize), offset));
      vertices.push.apply(vertices, vec3.add(v, vec3.scale(v, [1, -1, -1], halfSize), offset));
      return true;
    };

    return LineCube;

  })(Jax.Mesh.Lines);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.OBJ = (function(_super) {
    __extends(OBJ, _super);

    function OBJ(pathOrOpts) {
      var xhr,
        _this = this;

      if (pathOrOpts == null) {
        pathOrOpts = {};
      }
      this.size = 1;
      this.method = 'GET';
      if (typeof pathOrOpts === 'string') {
        pathOrOpts = {
          path: pathOrOpts
        };
      }
      OBJ.__super__.constructor.call(this, pathOrOpts);
      if (!this.parser) {
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
              _this.parser = new Jax.Mesh.OBJ.Parser(xhr.responseText);
              return _this.rebuild();
            } else {
              throw new Error("Request for " + _this.path + " returned status " + xhr.status);
            }
          }
        };
        xhr.open(this.method, this.path);
        xhr.send();
      }
    }

    OBJ.prototype.init = function(vertices, colors, textures, normals, indices) {
      var dist, face, i, len, max, name, obj, v, _i, _j, _k, _len, _len1, _ref, _ref1, _ref2, _ref3;

      if (!this.parser) {
        return;
      }
      dist = vec3.create();
      max = 0;
      _ref = this.parser.objects;
      for (name in _ref) {
        obj = _ref[name];
        _ref1 = obj.faces;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          face = _ref1[_i];
          _ref2 = face.v;
          for (i = _j = 0, _len1 = _ref2.length; _j < _len1; i = ++_j) {
            v = _ref2[i];
            vertices.push.apply(vertices, v);
            textures.push.apply(textures, face.t[i]);
            normals.push.apply(normals, face.n[i]);
            vec3.copy(dist, v);
            len = vec3.length(dist);
            if (max < len) {
              max = len;
            }
          }
        }
      }
      for (v = _k = 0, _ref3 = vertices.length; 0 <= _ref3 ? _k < _ref3 : _k > _ref3; v = 0 <= _ref3 ? ++_k : --_k) {
        vertices[v] = vertices[v] / max * this.size;
      }
      return null;
    };

    return OBJ;

  })(Jax.Mesh.Triangles);

}).call(this);
(function() {
  var __slice = [].slice;

  Jax.Mesh.OBJ.Parser = (function() {
    function Parser(content) {
      var args, cmd, curObj, line, lines, _i, _len, _ref;

      this.objects = {};
      this.vertices = [];
      this.textureCoords = [];
      this.normals = [];
      curObj = null;
      lines = [];
      _ref = content.split(/\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line = line.replace(/\#.*/, '').trim();
        if (line) {
          args = line.split(/\s+/);
          switch (cmd = args.shift()) {
            case 'o':
              curObj = this.objects[args.shift()] = {
                vertices: this.vertices,
                textureCoords: this.textureCoords,
                normals: this.normals,
                faces: [],
                aggregates: {},
                smooth: false
              };
              break;
            case 'v':
              this.addVertex.apply(this, [curObj].concat(__slice.call(args)));
              break;
            case 'vt':
              this.addTexCoords.apply(this, [curObj].concat(__slice.call(args)));
              break;
            case 'vn':
              this.addNormal.apply(this, [curObj].concat(__slice.call(args)));
              break;
            case 'f':
              this.addFace.apply(this, [curObj].concat(__slice.call(args)));
              break;
            case 's':
              this.setSmoothFaces.apply(this, [curObj].concat(__slice.call(args)));
              break;
            default:
              console.warn('OBJ: command not understood:', cmd, args);
          }
        }
      }
      this.finalizeAggregates();
    }

    Parser.prototype.setSmoothFaces = function(obj, b) {
      switch (b) {
        case '1':
        case 'on':
        case 'true':
          return obj.smooth = true;
        default:
          return obj.smooth = false;
      }
    };

    Parser.prototype.finalizeAggregates = function() {
      var n, name, normal, obj, set, vi, _i, _len, _ref, _ref1;

      _ref = this.objects;
      for (name in _ref) {
        obj = _ref[name];
        if (obj.aggregates) {
          _ref1 = obj.aggregates;
          for (vi in _ref1) {
            set = _ref1[vi];
            normal = [0, 0, 0];
            for (_i = 0, _len = set.length; _i < _len; _i++) {
              n = set[_i];
              vec3.add(normal, normal, n);
            }
            if (vec3.length(normal)) {
              vec3.normalize(normal, normal);
            } else {
              normal[1] = 1;
            }
            set.splice(0, set.length);
            set.push.apply(set, normal);
          }
        }
      }
      return true;
    };

    Parser.prototype.aggregate = function(obj, face, vi, ni) {
      var _base;

      if (obj.smooth) {
        (_base = obj.aggregates)[vi] || (_base[vi] = []);
        obj.aggregates[vi].push(obj.normals[ni - 1]);
        return obj.aggregates[vi];
      } else {
        return obj.normals[ni - 1];
      }
    };

    Parser.prototype.parseFace = function(obj, v1, v2, v3) {
      var face, ni, ti, v, vi, _i, _len, _ref, _ref1;

      face = {
        v: [],
        t: [],
        n: []
      };
      _ref = [v1, v2, v3];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _ref1 = __slice.call(v.split(/\//)), vi = _ref1[0], ti = _ref1[1], ni = _ref1[2];
        face.v.push(obj.vertices[vi - 1]);
        face.t.push(obj.textureCoords[ti - 1]);
        face.n.push(this.aggregate(obj, face, vi, ni));
      }
      return face;
    };

    Parser.prototype.addFace = function(obj, v1, v2, v3, v4) {
      if (v4 == null) {
        v4 = null;
      }
      obj.faces.push(this.parseFace(obj, v1, v2, v3));
      if (v4 !== null) {
        return obj.faces.push(this.parseFace(obj, v1, v3, v4));
      }
    };

    Parser.prototype.addVertex = function(obj, x, y, z, w) {
      if (w == null) {
        w = 1;
      }
      return obj.vertices.push([parseFloat(x), parseFloat(y), parseFloat(z)]);
    };

    Parser.prototype.addTexCoords = function(obj, u, v, w) {
      if (w == null) {
        w = 0;
      }
      return obj.textureCoords.push([parseFloat(u), parseFloat(v)]);
    };

    Parser.prototype.addNormal = function(obj, x, y, z) {
      var normal;

      normal = [parseFloat(x), parseFloat(y), parseFloat(z)];
      vec3.normalize(normal, normal);
      return obj.normals.push(normal);
    };

    return Parser;

  })();

}).call(this);
/*
Constructs a multi-polygonal flat plane treating the center of
the plane as the origin.

Options:

  * width: the width of the plane in units. Defaults to `size`.
  * depth: the depth of the plane in units. Defaults to `size`.
  * size: a value to use for any of the other dimensional options
          if they are unspecified. Defaults to 500.
  * xSegments: the number of vertices along the plane's X axis.
          Defaults to `segments`.
  * zSegments: the numebr of segments along the plane's Z axis.
          Defaults to `segments`.
  * segments: a value to use for any of the other segment count
  *       options if they are unspecified. Defaults to 20.
  * fn: a function accepting x and z coordinates, which is expected
          to return a Y coordinate. By default, Y is always 0, producing
          a flat plane.
  
Examples:

    new Jax.Mesh.Plane()
    new Jax.Mesh.Plane size: 2
    new Jax.Mesh.Plane size: 2, segments: 10
    new Jax.Mesh.Plane width: 2, xSegments: 2
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Plane = (function(_super) {
    __extends(Plane, _super);

    function Plane(options) {
      this.fn = function(x, z) {
        return 0;
      };
      this.size = (options != null ? options.size : void 0) || 500;
      this.segments = (options != null ? options.segments : void 0) || 20;
      this.width = this.depth = this.size;
      this.xSegments = this.zSegments = this.segments;
      Plane.__super__.constructor.call(this, options);
    }

    Plane.prototype.init = function(verts, colors, texes, norms, indices) {
      var d, hash, hashes, w, x, xUnit, xs, z, zUnit, zs, _i, _j, _k, _ref, _ref1, _ref2,
        _this = this;

      hashes = {};
      _ref = [this.width, this.depth, this.xSegments, this.zSegments], w = _ref[0], d = _ref[1], xs = _ref[2], zs = _ref[3];
      _ref1 = [w / xs, d / zs], xUnit = _ref1[0], zUnit = _ref1[1];
      hash = function(x, z) {
        var index, key, vx, vy, vz;

        key = "" + x + ";" + z;
        if (hashes[key] !== void 0) {
          return hashes[key];
        } else {
          vx = xUnit * x - w / 2;
          vz = zUnit * z - d / 2;
          vy = _this.fn(x, z);
          index = verts.length / 3;
          verts.push(vx, vz, vy);
          texes.push(x / (xs - 1), z / (zs - 1));
          return hashes[key] = index;
        }
      };
      for (x = _i = 1; _i < xs; x = _i += 2) {
        for (z = _j = 0; 0 <= zs ? _j < zs : _j > zs; z = 0 <= zs ? ++_j : --_j) {
          indices.push(hash(x, z));
          indices.push(hash(x - 1, z));
        }
        x++;
        for (z = _k = _ref2 = zs - 1; _ref2 <= 0 ? _k <= 0 : _k >= 0; z = _ref2 <= 0 ? ++_k : --_k) {
          indices.push(hash(x - 1, z));
          indices.push(hash(x, z));
        }
      }
      return true;
    };

    return Plane;

  })(Jax.Mesh.TriangleStrip);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.PLY = (function(_super) {
    __extends(PLY, _super);

    /*
    Examples:
    
      new Jax.Mesh.PLY "/path/to/model.ply"
      new Jax.Mesh.PLY path: "/path/to/model.ply", method: "POST"
    */


    function PLY(options) {
      var xhr,
        _this = this;

      if (options == null) {
        options = {};
      }
      if (typeof options === 'string') {
        options = {
          path: options
        };
      }
      this.size = 1;
      this.method = "GET";
      PLY.__super__.constructor.call(this, options);
      if (!this.parser) {
        xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.onreadystatechange = function() {
          if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
              _this.parser = new Jax.Mesh.PLY.Parser(xhr.response);
              return _this.rebuild();
            } else {
              throw new Error("Request for " + _this.path + " returned status " + xhr.status);
            }
          }
        };
        xhr.open(this.method, this.path);
        xhr.send();
      }
    }

    PLY.prototype.init = function(vertices, colors, textures, normals, indices) {
      var blue, dist, face, green, index, intensity, len, max, red, v, vertex, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;

      if (!this.parser) {
        return;
      }
      dist = vec3.create();
      max = 0;
      _ref = this.parser.vertex || this.parser.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        vertex = _ref[_i];
        vertices.push(vertex.x, vertex.y, vertex.z);
        _ref1 = [vertex.x, vertex.y, vertex.z], dist[0] = _ref1[0], dist[1] = _ref1[1], dist[2] = _ref1[2];
        len = vec3.length(dist);
        if (max < len) {
          max = len;
        }
        if (vertex.nx !== void 0) {
          normals.push(vertex.nx, vertex.ny, vertex.nz);
        }
        intensity = (vertex.intensity === void 0 ? 1 : vertex.intensity);
        if (vertex.red === void 0) {
          _ref2 = [1, 1, 1], red = _ref2[0], green = _ref2[1], blue = _ref2[2];
        } else {
          _ref3 = [vertex.red, vertex.green, vertex.blue], red = _ref3[0], green = _ref3[1], blue = _ref3[2];
        }
        colors.push(red * intensity, green * intensity, blue * intensity, 1);
      }
      for (v = _j = 0, _ref4 = vertices.length; 0 <= _ref4 ? _j < _ref4 : _j > _ref4; v = 0 <= _ref4 ? ++_j : --_j) {
        vertices[v] = vertices[v] / max * this.size;
      }
      _ref5 = this.parser.face;
      for (_k = 0, _len1 = _ref5.length; _k < _len1; _k++) {
        face = _ref5[_k];
        _ref6 = face.vertex_index || face.vertex_indices;
        for (_l = 0, _len2 = _ref6.length; _l < _len2; _l++) {
          index = _ref6[_l];
          indices.push(index);
          if ((intensity = face.intensity) !== void 0) {
            colors[index * 4 + 0] *= intensity;
            colors[index * 4 + 1] *= intensity;
            colors[index * 4 + 2] *= intensity;
            colors[index * 4 + 3] *= intensity;
          }
        }
      }
      return null;
    };

    return PLY;

  })(Jax.Mesh.Triangles);

}).call(this);
(function() {
  Jax.Mesh.PLY.Parser = (function() {
    var BIG_ENDIAN, LITTLE_ENDIAN, arrayBuffers, arrayViews;

    BIG_ENDIAN = 1;

    LITTLE_ENDIAN = 2;

    Parser.prototype.sizeOf = function(type) {
      switch (type) {
        case 'char':
          return Int8Array.BYTES_PER_ELEMENT;
        case 'uchar':
          return Uint8Array.BYTES_PER_ELEMENT;
        case 'short':
          return Int16Array.BYTES_PER_ELEMENT;
        case 'ushort':
          return Uint16Array.BYTES_PER_ELEMENT;
        case 'int':
          return Int32Array.BYTES_PER_ELEMENT;
        case 'uint':
          return Uint32Array.BYTES_PER_ELEMENT;
        case 'float':
          return Float32Array.BYTES_PER_ELEMENT;
        case 'double':
          return Float64Array.BYTES_PER_ELEMENT;
        default:
          throw new Error("Unexpected data type: " + type);
      }
    };

    Parser.prototype.readType = function(bufferView, type, endianness, byteOffset) {
      if (byteOffset == null) {
        byteOffset = 0;
      }
      switch (type) {
        case 'char':
          return bufferView.getInt8(byteOffset);
        case 'uchar':
          return bufferView.getUint8(byteOffset);
        case 'short':
          return bufferView.getInt16(byteOffset, endianness === LITTLE_ENDIAN);
        case 'ushort':
          return bufferView.getUint16(byteOffset, endianness === LITTLE_ENDIAN);
        case 'int':
          return bufferView.getInt32(byteOffset, endianness === LITTLE_ENDIAN);
        case 'uint':
          return bufferView.getUint32(byteOffset, endianness === LITTLE_ENDIAN);
        case 'float':
          return bufferView.getFloat32(byteOffset, endianness === LITTLE_ENDIAN);
        case 'double':
          return bufferView.getFloat64(byteOffset, endianness === LITTLE_ENDIAN);
        default:
          throw new Error("Unexpected data type: " + type);
      }
    };

    Parser.prototype.stringToBytes = function(str) {
      var i, result, stack, _char, _i, _ref;

      result = [];
      for (i = _i = 0, _ref = str.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _char = str.charCodeAt(i);
        stack = [];
        stack.unshift(_char & 0xff);
        _char = _char >> 8;
        while (_char) {
          stack.unshift(_char & 0xff);
          _char = _char >> 8;
        }
        result = result.concat(stack);
      }
      return result;
    };

    Parser.prototype.bytesToString = function(arr, beginOffset) {
      var i, result, _i, _ref;

      if (beginOffset == null) {
        beginOffset = 0;
      }
      result = "";
      for (i = _i = beginOffset, _ref = arr.length; beginOffset <= _ref ? _i < _ref : _i > _ref; i = beginOffset <= _ref ? ++_i : --_i) {
        result += String.fromCharCode(arr[i]);
      }
      return result;
    };

    function Parser(content) {
      var bytes, elements, header;

      this.comments = [];
      if (typeof content === 'string') {
        bytes = new Uint8Array(this.stringToBytes(content));
      } else {
        bytes = new Uint8Array(content);
      }
      header = this.parseHeader(bytes);
      elements = this.processHeader(header);
      bytes = new Uint8Array(bytes.buffer, header.length);
      switch (this.format) {
        case 'ascii':
          this.processASCII(elements, this.bytesToString(bytes).split(/\n/));
          break;
        case 'binary_big_endian':
          this.processBinary(elements, bytes, BIG_ENDIAN);
          break;
        case 'binary_little_endian':
          this.processBinary(elements, bytes, LITTLE_ENDIAN);
          break;
        default:
          throw new Error("format " + this.format + " (" + this.version + ") is not supported");
      }
    }

    Parser.prototype.parseHeader = function(bytes) {
      var header, _byte, _i, _len;

      header = "";
      for (_i = 0, _len = bytes.length; _i < _len; _i++) {
        _byte = bytes[_i];
        header += String.fromCharCode(_byte);
        if (header.indexOf('end_header\n') !== -1) {
          break;
        }
      }
      return header;
    };

    Parser.prototype.processHeader = function(header) {
      var element, elements, line, tokens, _ref;

      header = header.trim().split(/\n/);
      if (header.shift() !== 'ply') {
        throw new Error("Not a PLY!");
      }
      if (header.pop() !== 'end_header') {
        throw new Error("Could not detect end of header!");
      }
      elements = [];
      while (header.length > 0) {
        line = header.shift();
        tokens = line.split(/\s+/);
        switch (tokens[0]) {
          case 'format':
            _ref = [tokens[1], tokens[2]], this.format = _ref[0], this.version = _ref[1];
            break;
          case 'comment':
            this.comments.push(tokens.slice(1).join(' '));
            break;
          case 'element':
            elements.push(element = {
              name: tokens[1],
              count: parseInt(tokens[2]),
              properties: []
            });
            break;
          case 'property':
            element.properties.push(tokens.slice(1));
        }
        if (line === 'end_header') {
          break;
        }
      }
      return elements;
    };

    arrayBuffers = {};

    arrayViews = {};

    Parser.prototype.readBinaryValue = function(bytes, type, endianness, offset) {
      var byteSize, ofs, _i;

      if (offset == null) {
        offset = 0;
      }
      byteSize = this.sizeOf(type);
      arrayBuffers[byteSize] || (arrayBuffers[byteSize] = new ArrayBuffer(byteSize));
      arrayViews[byteSize] || (arrayViews[byteSize] = new DataView(arrayBuffers[byteSize]));
      for (ofs = _i = 0; 0 <= byteSize ? _i < byteSize : _i > byteSize; ofs = 0 <= byteSize ? ++_i : --_i) {
        arrayViews[byteSize].setUint8(ofs, bytes[offset + ofs]);
      }
      return this.readType(arrayViews[byteSize], type);
    };

    Parser.prototype.processBinary = function(elements, bytes, endianness) {
      var descriptor, element, elementSize, elementType, i, j, listLength, offset, property, value, _i, _j, _k, _l, _len, _len1, _ref, _ref1;

      offset = 0;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        this[element.name] = new Array(element.count);
        for (i = _j = 0, _ref = element.count; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
          this[element.name][i] = descriptor = {};
          _ref1 = element.properties;
          for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
            property = _ref1[_k];
            if (property[0] === 'list') {
              listLength = this.readBinaryValue(bytes, property[1], endianness, offset);
              offset += this.sizeOf(property[1]);
              elementType = property[2];
              elementSize = this.sizeOf(elementType);
              descriptor[property[3]] = new Array(listLength);
              for (j = _l = 0; 0 <= listLength ? _l < listLength : _l > listLength; j = 0 <= listLength ? ++_l : --_l) {
                descriptor[property[3]][j] = this.readBinaryValue(bytes, elementType, endianness, offset);
                offset += elementSize;
              }
            } else {
              value = this.readBinaryValue(bytes, property[0], endianness, offset);
              offset += this.sizeOf(property[0]);
              descriptor[property[1]] = value;
            }
          }
        }
      }
      return offset;
    };

    Parser.prototype.processASCII = function(elements, lines) {
      var descriptor, e, element, i, listElementType, listLength, listLengthType, property, tokens, _i, _j, _k, _len, _len1, _ref, _ref1;

      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        this[element.name] = new Array(element.count);
        for (i = _j = 0, _ref = element.count; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
          tokens = lines.shift().split(/\s+/);
          this[element.name][i] = descriptor = {};
          _ref1 = element.properties;
          for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
            property = _ref1[_k];
            switch (property[0]) {
              case 'float':
                descriptor[property[1]] = parseFloat(tokens.shift());
                break;
              case 'list':
                listLengthType = property[1];
                listElementType = property[2];
                listLength = parseInt(tokens.shift());
                descriptor[property[3]] = (function() {
                  var _l, _results;

                  _results = [];
                  for (e = _l = 0; 0 <= listLength ? _l < listLength : _l > listLength; e = 0 <= listLength ? ++_l : --_l) {
                    _results.push(parseInt(tokens.shift()));
                  }
                  return _results;
                })();
                break;
              default:
                throw new Error("Unrecognized property: " + (JSON.stringify(property)));
            }
          }
        }
      }
      return true;
    };

    return Parser;

  })();

}).call(this);
/*
A simple square or rectangle. You can adjust its width and height, and that's about it.

This mesh is generally used for testing purposes, or for simple, textured objects like smoke particles.

Options:

* width : the width of this quad in units along the X axis. Defaults to +size+.
* height : the height of this quad in units along the Y axis. Defaults to +size+.
* size : a value to use for both width and height. Defaults to 1.0.

Examples:

    var quad = new Jax.Mesh.Quad({width: 2, height: 1});
    var quad = new Jax.Mesh.Quad({size:1.5});
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Quad = (function(_super) {
    __extends(Quad, _super);

    function Quad(options) {
      if (typeof options === "number") {
        options = {
          size: options
        };
      }
      options || (options = {});
      options.width || (options.width = options.size || 1);
      options.height || (options.height = options.size || 1);
      Quad.__super__.constructor.call(this, options);
    }

    Quad.define('width', {
      get: function() {
        return this._width;
      },
      set: function(w) {
        this._width = w;
        return this.invalidate();
      }
    });

    Quad.define('height', {
      get: function() {
        return this._height;
      },
      set: function(h) {
        this._height = h;
        return this.invalidate();
      }
    });

    Quad.prototype.init = function(verts, colors, textureCoords, normals, indices) {
      var height, width;

      width = this._width / 2;
      height = this._height / 2;
      verts.push(-width, height, 0);
      verts.push(-width, -height, 0);
      verts.push(width, height, 0);
      verts.push(width, height, 0);
      verts.push(-width, -height, 0);
      verts.push(width, -height, 0);
      textureCoords.push(0, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 1);
      textureCoords.push(1, 1);
      textureCoords.push(0, 0);
      textureCoords.push(1, 0);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      normals.push(0, 0, 1);
      return normals.push(0, 0, 1);
    };

    return Quad;

  })(Jax.Mesh.Triangles);

}).call(this);
/*
  A spherical mesh.
  
  Takes 3 options:
      radius: the size of this sphere. Defaults to 0.5.
      slices: vertical resolution of the sphere. Defaults to 30.
      stacks: the horizontal resolution of the sphere. Defaults to 30.
      
  In general, you can get away with a lower number of slices and stacks
  for a smaller sphere, without losing too much visual fidelity. Larger
  or closer spheres will require more slices and stacks in order to
  present more spherical shapes.
  
  (Slices and stacks are equivalent to Blender's segments and rings,
  respectively.)
  
  Example:
  
      new Jax.Mesh.Sphere
        radius: 0.25
        slices: 8
        stacks: 8
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Sphere = (function(_super) {
    __extends(Sphere, _super);

    function Sphere(options) {
      this.slices = 30;
      this.stacks = 30;
      this.radius = 0.5;
      Sphere.__super__.constructor.call(this, options);
    }

    Sphere.prototype.init = function(vertices, colors, textureCoords, normals, indices) {
      var cosph, costh, first, phi, radius, second, sinph, sinth, slice, slices, stack, stacks, theta, u, v, x, y, z, _i, _j, _k, _ref, _results, _slices;

      _ref = [this.slices, this.stacks, this.radius], slices = _ref[0], stacks = _ref[1], radius = _ref[2];
      for (stack = _i = 0; 0 <= stacks ? _i <= stacks : _i >= stacks; stack = 0 <= stacks ? ++_i : --_i) {
        for (slice = _j = 0; 0 <= slices ? _j <= slices : _j >= slices; slice = 0 <= slices ? ++_j : --_j) {
          theta = stack * Math.PI / stacks;
          phi = slice * 2 * Math.PI / slices;
          sinth = Math.sin(theta);
          sinph = Math.sin(phi);
          costh = Math.cos(theta);
          cosph = Math.cos(phi);
          x = cosph * sinth;
          y = sinph * sinth;
          z = costh;
          u = 1 - (stack / stacks);
          v = 1 - (slice / slices);
          if (Math.equalish(x, 0)) {
            x = 0;
          }
          if (Math.equalish(y, 0)) {
            y = 0;
          }
          if (Math.equalish(z, 0)) {
            z = 0;
          }
          vertices.push(x * radius, y * radius, z * radius);
          normals.push(x, y, z);
          textureCoords.push(u, v);
        }
      }
      _slices = slices + 1;
      _results = [];
      for (stack = _k = 0; 0 <= stacks ? _k < stacks : _k > stacks; stack = 0 <= stacks ? ++_k : --_k) {
        _results.push((function() {
          var _l, _results1;

          _results1 = [];
          for (slice = _l = 0; 0 <= slices ? _l <= slices : _l >= slices; slice = 0 <= slices ? ++_l : --_l) {
            first = (stack * _slices) + (slice % _slices);
            second = ((stack + 1) * _slices) + (slice % _slices);
            _results1.push(indices.push(first, second));
          }
          return _results1;
        })());
      }
      return _results;
    };

    return Sphere;

  })(Jax.Mesh.TriangleStrip);

}).call(this);
/*

A teapot. Accepts a single `size` attribute, used to scale the mesh,
which defaults to 1.0.

Example:
    new Jax.Mesh.Teapot size: 0.5
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Teapot = (function(_super) {
    var teapot;

    __extends(Teapot, _super);

    teapot = {
      vertices: [5.929688, 4.125, 0, 5.387188, 4.125, 2.7475, 5.2971, 4.494141, 2.70917, 5.832031, 4.494141, 0, 5.401602, 4.617188, 2.753633, 5.945313, 4.617188, 0, 5.614209, 4.494141, 2.844092, 6.175781, 4.494141, 0, 5.848437, 4.125, 2.94375, 6.429688, 4.125, 0, 3.899688, 4.125, 4.97, 3.830352, 4.494141, 4.900664, 3.910782, 4.617188, 4.981094, 4.074414, 4.494141, 5.144727, 4.254687, 4.125, 5.325, 1.677188, 4.125, 6.4575, 1.638858, 4.494141, 6.367412, 1.68332, 4.617188, 6.471914, 1.77378, 4.494141, 6.684522, 1.873438, 4.125, 6.91875, -1.070312, 4.125, 7, -1.070312, 4.494141, 6.902344, -1.070312, 4.617188, 7.015625, -1.070312, 4.494141, 7.246094, -1.070312, 4.125, 7.5, -1.070312, 4.125, 7, -4.007656, 4.125, 6.4575, -3.859572, 4.494141, 6.367412, -1.070312, 4.494141, 6.902344, -3.847676, 4.617188, 6.471914, -1.070312, 4.617188, 7.015625, -3.917371, 4.494141, 6.684522, -1.070312, 4.494141, 7.246094, -4.014062, 4.125, 6.91875, -1.070312, 4.125, 7.5, -6.209063, 4.125, 4.97, -6.042168, 4.494141, 4.900664, -6.0725, 4.617188, 4.981094, -6.217675, 4.494141, 5.144727, -6.395312, 4.125, 5.325, -7.591093, 4.125, 2.7475, -7.464421, 4.494141, 2.70917, -7.550137, 4.617188, 2.753633, -7.755822, 4.494141, 2.844092, -7.989062, 4.125, 2.94375, -8.070313, 4.125, 0, -7.972656, 4.494141, 0, -8.085938, 4.617188, 0, -8.316406, 4.494141, 0, -8.570313, 4.125, 0, -8.070313, 4.125, 0, -7.527812, 4.125, -2.7475, -7.437724, 4.494141, -2.70917, -7.972656, 4.494141, 0, -7.542227, 4.617188, -2.753633, -8.085938, 4.617188, 0, -7.754834, 4.494141, -2.844092, -8.316406, 4.494141, 0, -7.989062, 4.125, -2.94375, -8.570313, 4.125, 0, -6.040312, 4.125, -4.97, -5.970977, 4.494141, -4.900664, -6.051406, 4.617188, -4.981094, -6.215039, 4.494141, -5.144727, -6.395312, 4.125, -5.325, -3.817812, 4.125, -6.4575, -3.779482, 4.494141, -6.367412, -3.823945, 4.617188, -6.471914, -3.914404, 4.494141, -6.684522, -4.014062, 4.125, -6.91875, -1.070312, 4.125, -7, -1.070312, 4.494141, -6.902344, -1.070312, 4.617188, -7.015625, -1.070312, 4.494141, -7.246094, -1.070312, 4.125, -7.5, -1.070312, 4.125, -7, 1.677188, 4.125, -6.4575, 1.638858, 4.494141, -6.367412, -1.070312, 4.494141, -6.902344, 1.68332, 4.617188, -6.471914, -1.070312, 4.617188, -7.015625, 1.77378, 4.494141, -6.684522, -1.070312, 4.494141, -7.246094, 1.873438, 4.125, -6.91875, -1.070312, 4.125, -7.5, 3.899688, 4.125, -4.97, 3.830352, 4.494141, -4.900664, 3.910782, 4.617188, -4.981094, 4.074414, 4.494141, -5.144727, 4.254687, 4.125, -5.325, 5.387188, 4.125, -2.7475, 5.2971, 4.494141, -2.70917, 5.401602, 4.617188, -2.753633, 5.614209, 4.494141, -2.844092, 5.848437, 4.125, -2.94375, 5.929688, 4.125, 0, 5.832031, 4.494141, 0, 5.945313, 4.617188, 0, 6.175781, 4.494141, 0, 6.429688, 4.125, 0, 6.429688, 4.125, 0, 5.848437, 4.125, 2.94375, 6.695264, 2.162109, 3.304053, 7.347656, 2.162109, 0, 7.433985, 0.234375, 3.61836, 8.148438, 0.234375, 0, 7.956494, -1.623047, 3.840674, 8.714844, -1.623047, 0, 8.154688, -3.375, 3.925, 8.929688, -3.375, 0, 4.254687, 4.125, 5.325, 4.906446, 2.162109, 5.976758, 5.475, 0.234375, 6.545312, 5.877149, -1.623047, 6.947461, 6.029688, -3.375, 7.1, 1.873438, 4.125, 6.91875, 2.23374, 2.162109, 7.765576, 2.548047, 0.234375, 8.504297, 2.770362, -1.623047, 9.026807, 2.854688, -3.375, 9.225, -1.070312, 4.125, 7.5, -1.070312, 2.162109, 8.417969, -1.070312, 0.234375, 9.21875, -1.070312, -1.623047, 9.785156, -1.070312, -3.375, 10, -1.070312, 4.125, 7.5, -4.014062, 4.125, 6.91875, -4.374365, 2.162109, 7.765576, -1.070312, 2.162109, 8.417969, -4.688672, 0.234375, 8.504297, -1.070312, 0.234375, 9.21875, -4.910986, -1.623047, 9.026807, -1.070312, -1.623047, 9.785156, -4.995313, -3.375, 9.225, -1.070312, -3.375, 10, -6.395312, 4.125, 5.325, -7.047071, 2.162109, 5.976758, -7.615624, 0.234375, 6.545312, -8.017773, -1.623047, 6.947461, -8.170312, -3.375, 7.1, -7.989062, 4.125, 2.94375, -8.835889, 2.162109, 3.304053, -9.57461, 0.234375, 3.61836, -10.097119, -1.623047, 3.840674, -10.295313, -3.375, 3.925, -8.570313, 4.125, 0, -9.488281, 2.162109, 0, -10.289063, 0.234375, 0, -10.855469, -1.623047, 0, -11.070313, -3.375, 0, -8.570313, 4.125, 0, -7.989062, 4.125, -2.94375, -8.835889, 2.162109, -3.304053, -9.488281, 2.162109, 0, -9.57461, 0.234375, -3.61836, -10.289063, 0.234375, 0, -10.097119, -1.623047, -3.840674, -10.855469, -1.623047, 0, -10.295313, -3.375, -3.925, -11.070313, -3.375, 0, -6.395312, 4.125, -5.325, -7.047071, 2.162109, -5.976758, -7.615624, 0.234375, -6.545312, -8.017773, -1.623047, -6.947461, -8.170312, -3.375, -7.1, -4.014062, 4.125, -6.91875, -4.374365, 2.162109, -7.765576, -4.688672, 0.234375, -8.504297, -4.910986, -1.623047, -9.026807, -4.995313, -3.375, -9.225, -1.070312, 4.125, -7.5, -1.070312, 2.162109, -8.417969, -1.070312, 0.234375, -9.21875, -1.070312, -1.623047, -9.785156, -1.070312, -3.375, -10, -1.070312, 4.125, -7.5, 1.873438, 4.125, -6.91875, 2.23374, 2.162109, -7.765576, -1.070312, 2.162109, -8.417969, 2.548047, 0.234375, -8.504297, -1.070312, 0.234375, -9.21875, 2.770362, -1.623047, -9.026807, -1.070312, -1.623047, -9.785156, 2.854688, -3.375, -9.225, -1.070312, -3.375, -10, 4.254687, 4.125, -5.325, 4.906446, 2.162109, -5.976758, 5.475, 0.234375, -6.545312, 5.877149, -1.623047, -6.947461, 6.029688, -3.375, -7.1, 5.848437, 4.125, -2.94375, 6.695264, 2.162109, -3.304053, 7.433985, 0.234375, -3.61836, 7.956494, -1.623047, -3.840674, 8.154688, -3.375, -3.925, 6.429688, 4.125, 0, 7.347656, 2.162109, 0, 8.148438, 0.234375, 0, 8.714844, -1.623047, 0, 8.929688, -3.375, 0, 8.929688, -3.375, 0, 8.154688, -3.375, 3.925, 7.794336, -4.857422, 3.77168, 8.539063, -4.857422, 0, 7.001562, -5.953125, 3.434375, 7.679688, -5.953125, 0, 6.208789, -6.697266, 3.09707, 6.820313, -6.697266, 0, 5.848437, -7.125, 2.94375, 6.429688, -7.125, 0, 6.029688, -3.375, 7.1, 5.752343, -4.857422, 6.822656, 5.142187, -5.953125, 6.2125, 4.532031, -6.697266, 5.602344, 4.254687, -7.125, 5.325, 2.854688, -3.375, 9.225, 2.701367, -4.857422, 8.864649, 2.364063, -5.953125, 8.071875, 2.026758, -6.697266, 7.279101, 1.873438, -7.125, 6.91875, -1.070312, -3.375, 10, -1.070312, -4.857422, 9.609375, -1.070312, -5.953125, 8.75, -1.070312, -6.697266, 7.890625, -1.070312, -7.125, 7.5, -1.070312, -3.375, 10, -4.995313, -3.375, 9.225, -4.841992, -4.857422, 8.864649, -1.070312, -4.857422, 9.609375, -4.504687, -5.953125, 8.071875, -1.070312, -5.953125, 8.75, -4.167383, -6.697266, 7.279101, -1.070312, -6.697266, 7.890625, -4.014062, -7.125, 6.91875, -1.070312, -7.125, 7.5, -8.170312, -3.375, 7.1, -7.892968, -4.857422, 6.822656, -7.282812, -5.953125, 6.2125, -6.672656, -6.697266, 5.602344, -6.395312, -7.125, 5.325, -10.295313, -3.375, 3.925, -9.934961, -4.857422, 3.77168, -9.142187, -5.953125, 3.434375, -8.349414, -6.697266, 3.09707, -7.989062, -7.125, 2.94375, -11.070313, -3.375, 0, -10.679688, -4.857422, 0, -9.820313, -5.953125, 0, -8.960938, -6.697266, 0, -8.570313, -7.125, 0, -11.070313, -3.375, 0, -10.295313, -3.375, -3.925, -9.934961, -4.857422, -3.77168, -10.679688, -4.857422, 0, -9.142187, -5.953125, -3.434375, -9.820313, -5.953125, 0, -8.349414, -6.697266, -3.09707, -8.960938, -6.697266, 0, -7.989062, -7.125, -2.94375, -8.570313, -7.125, 0, -8.170312, -3.375, -7.1, -7.892968, -4.857422, -6.822656, -7.282812, -5.953125, -6.2125, -6.672656, -6.697266, -5.602344, -6.395312, -7.125, -5.325, -4.995313, -3.375, -9.225, -4.841992, -4.857422, -8.864649, -4.504687, -5.953125, -8.071875, -4.167383, -6.697266, -7.279101, -4.014062, -7.125, -6.91875, -1.070312, -3.375, -10, -1.070312, -4.857422, -9.609375, -1.070312, -5.953125, -8.75, -1.070312, -6.697266, -7.890625, -1.070312, -7.125, -7.5, -1.070312, -3.375, -10, 2.854688, -3.375, -9.225, 2.701367, -4.857422, -8.864649, -1.070312, -4.857422, -9.609375, 2.364063, -5.953125, -8.071875, -1.070312, -5.953125, -8.75, 2.026758, -6.697266, -7.279101, -1.070312, -6.697266, -7.890625, 1.873438, -7.125, -6.91875, -1.070312, -7.125, -7.5, 6.029688, -3.375, -7.1, 5.752343, -4.857422, -6.822656, 5.142187, -5.953125, -6.2125, 4.532031, -6.697266, -5.602344, 4.254687, -7.125, -5.325, 8.154688, -3.375, -3.925, 7.794336, -4.857422, -3.77168, 7.001562, -5.953125, -3.434375, 6.208789, -6.697266, -3.09707, 5.848437, -7.125, -2.94375, 8.929688, -3.375, 0, 8.539063, -4.857422, 0, 7.679688, -5.953125, 0, 6.820313, -6.697266, 0, 6.429688, -7.125, 0, 6.429688, -7.125, 0, 5.848437, -7.125, 2.94375, 5.691685, -7.400391, 2.877056, 6.259766, -7.400391, 0, 4.853868, -7.640625, 2.520586, 5.351563, -7.640625, 0, 2.783648, -7.810547, 1.639761, 3.107422, -7.810547, 0, -1.070312, -7.875, 0, 4.254687, -7.125, 5.325, 4.134043, -7.400391, 5.204355, 3.489219, -7.640625, 4.559531, 1.895879, -7.810547, 2.966191, -1.070312, -7.875, 0, 1.873438, -7.125, 6.91875, 1.806743, -7.400391, 6.761997, 1.450274, -7.640625, 5.92418, 0.569448, -7.810547, 3.85396, -1.070312, -7.875, 0, -1.070312, -7.125, 7.5, -1.070312, -7.400391, 7.330078, -1.070312, -7.640625, 6.421875, -1.070312, -7.810547, 4.177734, -1.070312, -7.875, 0, -1.070312, -7.125, 7.5, -4.014062, -7.125, 6.91875, -3.947368, -7.400391, 6.761997, -1.070312, -7.400391, 7.330078, -3.590898, -7.640625, 5.92418, -1.070312, -7.640625, 6.421875, -2.710073, -7.810547, 3.85396, -1.070312, -7.810547, 4.177734, -1.070312, -7.875, 0, -6.395312, -7.125, 5.325, -6.274668, -7.400391, 5.204355, -5.629844, -7.640625, 4.559531, -4.036504, -7.810547, 2.966191, -1.070312, -7.875, 0, -7.989062, -7.125, 2.94375, -7.832309, -7.400391, 2.877056, -6.994492, -7.640625, 2.520586, -4.924272, -7.810547, 1.639761, -1.070312, -7.875, 0, -8.570313, -7.125, 0, -8.400391, -7.400391, 0, -7.492188, -7.640625, 0, -5.248047, -7.810547, 0, -1.070312, -7.875, 0, -8.570313, -7.125, 0, -7.989062, -7.125, -2.94375, -7.832309, -7.400391, -2.877056, -8.400391, -7.400391, 0, -6.994492, -7.640625, -2.520586, -7.492188, -7.640625, 0, -4.924272, -7.810547, -1.639761, -5.248047, -7.810547, 0, -1.070312, -7.875, 0, -6.395312, -7.125, -5.325, -6.274668, -7.400391, -5.204355, -5.629844, -7.640625, -4.559531, -4.036504, -7.810547, -2.966191, -1.070312, -7.875, 0, -4.014062, -7.125, -6.91875, -3.947368, -7.400391, -6.761997, -3.590898, -7.640625, -5.92418, -2.710073, -7.810547, -3.85396, -1.070312, -7.875, 0, -1.070312, -7.125, -7.5, -1.070312, -7.400391, -7.330078, -1.070312, -7.640625, -6.421875, -1.070312, -7.810547, -4.177734, -1.070312, -7.875, 0, -1.070312, -7.125, -7.5, 1.873438, -7.125, -6.91875, 1.806743, -7.400391, -6.761997, -1.070312, -7.400391, -7.330078, 1.450274, -7.640625, -5.92418, -1.070312, -7.640625, -6.421875, 0.569448, -7.810547, -3.85396, -1.070312, -7.810547, -4.177734, -1.070312, -7.875, 0, 4.254687, -7.125, -5.325, 4.134043, -7.400391, -5.204355, 3.489219, -7.640625, -4.559531, 1.895879, -7.810547, -2.966191, -1.070312, -7.875, 0, 5.848437, -7.125, -2.94375, 5.691685, -7.400391, -2.877056, 4.853868, -7.640625, -2.520586, 2.783648, -7.810547, -1.639761, -1.070312, -7.875, 0, 6.429688, -7.125, 0, 6.259766, -7.400391, 0, 5.351563, -7.640625, 0, 3.107422, -7.810547, 0, -1.070312, -7.875, 0, -9.070313, 2.25, 0, -8.992188, 2.425781, 0.84375, -11.47583, 2.405457, 0.84375, -11.40625, 2.232422, 0, -13.298828, 2.263184, 0.84375, -13.132813, 2.109375, 0, -14.421631, 1.877014, 0.84375, -14.203125, 1.775391, 0, -14.804688, 1.125, 0.84375, -14.570313, 1.125, 0, -8.820313, 2.8125, 1.125, -11.628906, 2.786134, 1.125, -13.664063, 2.601563, 1.125, -14.902344, 2.100586, 1.125, -15.320313, 1.125, 1.125, -8.648438, 3.199219, 0.84375, -11.781982, 3.166809, 0.84375, -14.029297, 2.939941, 0.84375, -15.383057, 2.324158, 0.84375, -15.835938, 1.125, 0.84375, -8.570313, 3.375, 0, -11.851563, 3.339844, 0, -14.195313, 3.09375, 0, -15.601563, 2.425781, 0, -16.070313, 1.125, 0, -8.570313, 3.375, 0, -8.648438, 3.199219, -0.84375, -11.781982, 3.166809, -0.84375, -11.851563, 3.339844, 0, -14.029297, 2.939941, -0.84375, -14.195313, 3.09375, 0, -15.383057, 2.324158, -0.84375, -15.601563, 2.425781, 0, -15.835938, 1.125, -0.84375, -16.070313, 1.125, 0, -8.820313, 2.8125, -1.125, -11.628906, 2.786134, -1.125, -13.664063, 2.601563, -1.125, -14.902344, 2.100586, -1.125, -15.320313, 1.125, -1.125, -8.992188, 2.425781, -0.84375, -11.47583, 2.405457, -0.84375, -13.298828, 2.263184, -0.84375, -14.421631, 1.877014, -0.84375, -14.804688, 1.125, -0.84375, -9.070313, 2.25, 0, -11.40625, 2.232422, 0, -13.132813, 2.109375, 0, -14.203125, 1.775391, 0, -14.570313, 1.125, 0, -14.570313, 1.125, 0, -14.804688, 1.125, 0.84375, -14.588013, 0.00705, 0.84375, -14.375, 0.105469, 0, -13.90918, -1.275146, 0.84375, -13.757813, -1.125, 0, -12.724976, -2.540863, 0.84375, -12.671875, -2.355469, 0, -10.992188, -3.609375, 0.84375, -11.070313, -3.375, 0, -15.320313, 1.125, 1.125, -15.056641, -0.209473, 1.125, -14.242188, -1.605469, 1.125, -12.841797, -2.94873, 1.125, -10.820313, -4.125, 1.125, -15.835938, 1.125, 0.84375, -15.525269, -0.425995, 0.84375, -14.575195, -1.935791, 0.84375, -12.958618, -3.356598, 0.84375, -10.648438, -4.640625, 0.84375, -16.070313, 1.125, 0, -15.738281, -0.524414, 0, -14.726563, -2.085938, 0, -13.011719, -3.541992, 0, -10.570313, -4.875, 0, -16.070313, 1.125, 0, -15.835938, 1.125, -0.84375, -15.525269, -0.425995, -0.84375, -15.738281, -0.524414, 0, -14.575195, -1.935791, -0.84375, -14.726563, -2.085938, 0, -12.958618, -3.356598, -0.84375, -13.011719, -3.541992, 0, -10.648438, -4.640625, -0.84375, -10.570313, -4.875, 0, -15.320313, 1.125, -1.125, -15.056641, -0.209473, -1.125, -14.242188, -1.605469, -1.125, -12.841797, -2.94873, -1.125, -10.820313, -4.125, -1.125, -14.804688, 1.125, -0.84375, -14.588013, 0.00705, -0.84375, -13.90918, -1.275146, -0.84375, -12.724976, -2.540863, -0.84375, -10.992188, -3.609375, -0.84375, -14.570313, 1.125, 0, -14.375, 0.105469, 0, -13.757813, -1.125, 0, -12.671875, -2.355469, 0, -11.070313, -3.375, 0, 7.429688, -0.75, 0, 7.429688, -1.394531, 1.85625, 10.01123, -0.677124, 1.676074, 9.828125, -0.199219, 0, 11.101563, 0.84668, 1.279688, 10.867188, 1.125, 0, 11.723145, 2.629761, 0.883301, 11.4375, 2.730469, 0, 12.898438, 4.125, 0.703125, 12.429688, 4.125, 0, 7.429688, -2.8125, 2.475, 10.414063, -1.728516, 2.234766, 11.617188, 0.234375, 1.70625, 12.351563, 2.408203, 1.177734, 13.929688, 4.125, 0.9375, 7.429688, -4.230469, 1.85625, 10.816895, -2.779907, 1.676074, 12.132813, -0.37793, 1.279688, 12.97998, 2.186646, 0.883301, 14.960938, 4.125, 0.703125, 7.429688, -4.875, 0, 11, -3.257813, 0, 12.367188, -0.65625, 0, 13.265625, 2.085938, 0, 15.429688, 4.125, 0, 7.429688, -4.875, 0, 7.429688, -4.230469, -1.85625, 10.816895, -2.779907, -1.676074, 11, -3.257813, 0, 12.132813, -0.37793, -1.279688, 12.367188, -0.65625, 0, 12.97998, 2.186646, -0.883301, 13.265625, 2.085938, 0, 14.960938, 4.125, -0.703125, 15.429688, 4.125, 0, 7.429688, -2.8125, -2.475, 10.414063, -1.728516, -2.234766, 11.617188, 0.234375, -1.70625, 12.351563, 2.408203, -1.177734, 13.929688, 4.125, -0.9375, 7.429688, -1.394531, -1.85625, 10.01123, -0.677124, -1.676074, 11.101563, 0.84668, -1.279688, 11.723145, 2.629761, -0.883301, 12.898438, 4.125, -0.703125, 7.429688, -0.75, 0, 9.828125, -0.199219, 0, 10.867188, 1.125, 0, 11.4375, 2.730469, 0, 12.429688, 4.125, 0, 12.429688, 4.125, 0, 12.898438, 4.125, 0.703125, 13.291077, 4.346237, 0.65918, 12.789063, 4.335938, 0, 13.525879, 4.422729, 0.5625, 13.054688, 4.40625, 0, 13.532898, 4.350357, 0.46582, 13.132813, 4.335938, 0, 13.242188, 4.125, 0.421875, 12.929688, 4.125, 0, 13.929688, 4.125, 0.9375, 14.395508, 4.368896, 0.878906, 14.5625, 4.458984, 0.75, 14.413086, 4.38208, 0.621094, 13.929688, 4.125, 0.5625, 14.960938, 4.125, 0.703125, 15.499939, 4.391556, 0.65918, 15.599121, 4.495239, 0.5625, 15.293274, 4.413804, 0.46582, 14.617188, 4.125, 0.421875, 15.429688, 4.125, 0, 16.001953, 4.401855, 0, 16.070313, 4.511719, 0, 15.693359, 4.428224, 0, 14.929688, 4.125, 0, 15.429688, 4.125, 0, 14.960938, 4.125, -0.703125, 15.499939, 4.391556, -0.65918, 16.001953, 4.401855, 0, 15.599121, 4.495239, -0.5625, 16.070313, 4.511719, 0, 15.293274, 4.413804, -0.46582, 15.693359, 4.428224, 0, 14.617188, 4.125, -0.421875, 14.929688, 4.125, 0, 13.929688, 4.125, -0.9375, 14.395508, 4.368896, -0.878906, 14.5625, 4.458984, -0.75, 14.413086, 4.38208, -0.621094, 13.929688, 4.125, -0.5625, 12.898438, 4.125, -0.703125, 13.291077, 4.346237, -0.65918, 13.525879, 4.422729, -0.5625, 13.532898, 4.350357, -0.46582, 13.242188, 4.125, -0.421875, 12.429688, 4.125, 0, 12.789063, 4.335938, 0, 13.054688, 4.40625, 0, 13.132813, 4.335938, 0, 12.929688, 4.125, 0, 0.501414, 7.628906, 0.670256, 0.632813, 7.628906, 0, -1.070312, 7.875, 0, 0.429278, 7.03125, 0.639395, 0.554688, 7.03125, 0, -0.162029, 6.292969, 0.38696, -0.085937, 6.292969, 0, -0.147812, 5.625, 0.3925, -0.070312, 5.625, 0, 0.140489, 7.628906, 1.210801, -1.070312, 7.875, 0, 0.084844, 7.03125, 1.155156, -0.370879, 6.292969, 0.699434, -0.360312, 5.625, 0.71, -0.400056, 7.628906, 1.571726, -1.070312, 7.875, 0, -0.430918, 7.03125, 1.49959, -0.683352, 6.292969, 0.908284, -0.677812, 5.625, 0.9225, -1.070312, 7.628906, 1.703125, -1.070312, 7.875, 0, -1.070312, 7.03125, 1.625, -1.070312, 6.292969, 0.984375, -1.070312, 5.625, 1, -1.740569, 7.628906, 1.571726, -1.070312, 7.628906, 1.703125, -1.070312, 7.875, 0, -1.709707, 7.03125, 1.49959, -1.070312, 7.03125, 1.625, -1.457273, 6.292969, 0.908284, -1.070312, 6.292969, 0.984375, -1.462812, 5.625, 0.9225, -1.070312, 5.625, 1, -2.281113, 7.628906, 1.210801, -1.070312, 7.875, 0, -2.225469, 7.03125, 1.155156, -1.769746, 6.292969, 0.699434, -1.780312, 5.625, 0.71, -2.642038, 7.628906, 0.670256, -1.070312, 7.875, 0, -2.569902, 7.03125, 0.639395, -1.978596, 6.292969, 0.38696, -1.992812, 5.625, 0.3925, -2.773438, 7.628906, 0, -1.070312, 7.875, 0, -2.695313, 7.03125, 0, -2.054687, 6.292969, 0, -2.070312, 5.625, 0, -2.642038, 7.628906, -0.670256, -2.773438, 7.628906, 0, -1.070312, 7.875, 0, -2.569902, 7.03125, -0.639395, -2.695313, 7.03125, 0, -1.978596, 6.292969, -0.38696, -2.054687, 6.292969, 0, -1.992812, 5.625, -0.3925, -2.070312, 5.625, 0, -2.281113, 7.628906, -1.210801, -1.070312, 7.875, 0, -2.225469, 7.03125, -1.155156, -1.769746, 6.292969, -0.699434, -1.780312, 5.625, -0.71, -1.740569, 7.628906, -1.571726, -1.070312, 7.875, 0, -1.709707, 7.03125, -1.49959, -1.457273, 6.292969, -0.908284, -1.462812, 5.625, -0.9225, -1.070312, 7.628906, -1.703125, -1.070312, 7.875, 0, -1.070312, 7.03125, -1.625, -1.070312, 6.292969, -0.984375, -1.070312, 5.625, -1, -0.400056, 7.628906, -1.571726, -1.070312, 7.628906, -1.703125, -1.070312, 7.875, 0, -0.430918, 7.03125, -1.49959, -1.070312, 7.03125, -1.625, -0.683352, 6.292969, -0.908284, -1.070312, 6.292969, -0.984375, -0.677812, 5.625, -0.9225, -1.070312, 5.625, -1, 0.140489, 7.628906, -1.210801, -1.070312, 7.875, 0, 0.084844, 7.03125, -1.155156, -0.370879, 6.292969, -0.699434, -0.360312, 5.625, -0.71, 0.501414, 7.628906, -0.670256, -1.070312, 7.875, 0, 0.429278, 7.03125, -0.639395, -0.162029, 6.292969, -0.38696, -0.147812, 5.625, -0.3925, 0.632813, 7.628906, 0, -1.070312, 7.875, 0, 0.554688, 7.03125, 0, -0.085937, 6.292969, 0, -0.070312, 5.625, 0, -0.070312, 5.625, 0, -0.147812, 5.625, 0.3925, 1.034141, 5.179688, 0.895391, 1.210938, 5.179688, 0, 2.735, 4.875, 1.619062, 3.054688, 4.875, 0, 4.262891, 4.570313, 2.26914, 4.710938, 4.570313, 0, 4.925938, 4.125, 2.55125, 5.429688, 4.125, 0, -0.360312, 5.625, 0.71, 0.549375, 5.179688, 1.619688, 1.858438, 4.875, 2.92875, 3.034375, 4.570313, 4.104687, 3.544688, 4.125, 4.615, -0.677812, 5.625, 0.9225, -0.174922, 5.179688, 2.104453, 0.54875, 4.875, 3.805313, 1.198828, 4.570313, 5.333203, 1.480938, 4.125, 5.99625, -1.070312, 5.625, 1, -1.070312, 5.179688, 2.28125, -1.070312, 4.875, 4.125, -1.070312, 4.570313, 5.78125, -1.070312, 4.125, 6.5, -1.070312, 5.625, 1, -1.462812, 5.625, 0.9225, -1.965703, 5.179688, 2.104453, -1.070312, 5.179688, 2.28125, -2.689375, 4.875, 3.805313, -1.070312, 4.875, 4.125, -3.339453, 4.570313, 5.333203, -1.070312, 4.570313, 5.78125, -3.621562, 4.125, 5.99625, -1.070312, 4.125, 6.5, -1.780312, 5.625, 0.71, -2.69, 5.179688, 1.619688, -3.999062, 4.875, 2.92875, -5.174999, 4.570313, 4.104687, -5.685312, 4.125, 4.615, -1.992812, 5.625, 0.3925, -3.174765, 5.179688, 0.895391, -4.875625, 4.875, 1.619062, -6.403516, 4.570313, 2.26914, -7.066563, 4.125, 2.55125, -2.070312, 5.625, 0, -3.351562, 5.179688, 0, -5.195313, 4.875, 0, -6.851563, 4.570313, 0, -7.570313, 4.125, 0, -2.070312, 5.625, 0, -1.992812, 5.625, -0.3925, -3.174765, 5.179688, -0.895391, -3.351562, 5.179688, 0, -4.875625, 4.875, -1.619062, -5.195313, 4.875, 0, -6.403516, 4.570313, -2.26914, -6.851563, 4.570313, 0, -7.066563, 4.125, -2.55125, -7.570313, 4.125, 0, -1.780312, 5.625, -0.71, -2.69, 5.179688, -1.619688, -3.999062, 4.875, -2.92875, -5.174999, 4.570313, -4.104687, -5.685312, 4.125, -4.615, -1.462812, 5.625, -0.9225, -1.965703, 5.179688, -2.104453, -2.689375, 4.875, -3.805313, -3.339453, 4.570313, -5.333203, -3.621562, 4.125, -5.99625, -1.070312, 5.625, -1, -1.070312, 5.179688, -2.28125, -1.070312, 4.875, -4.125, -1.070312, 4.570313, -5.78125, -1.070312, 4.125, -6.5, -1.070312, 5.625, -1, -0.677812, 5.625, -0.9225, -0.174922, 5.179688, -2.104453, -1.070312, 5.179688, -2.28125, 0.54875, 4.875, -3.805313, -1.070312, 4.875, -4.125, 1.198828, 4.570313, -5.333203, -1.070312, 4.570313, -5.78125, 1.480938, 4.125, -5.99625, -1.070312, 4.125, -6.5, -0.360312, 5.625, -0.71, 0.549375, 5.179688, -1.619688, 1.858438, 4.875, -2.92875, 3.034375, 4.570313, -4.104687, 3.544688, 4.125, -4.615, -0.147812, 5.625, -0.3925, 1.034141, 5.179688, -0.895391, 2.735, 4.875, -1.619062, 4.262891, 4.570313, -2.26914, 4.925938, 4.125, -2.55125, -0.070312, 5.625, 0, 1.210938, 5.179688, 0, 3.054688, 4.875, 0, 4.710938, 4.570313, 0, 5.429688, 4.125, 0],
      normals: [-0.966742, -0.255752, 0, -0.893014, -0.256345, -0.369882, -0.893437, 0.255996, -0.369102, -0.966824, 0.255443, 0, -0.083877, 0.995843, -0.035507, -0.092052, 0.995754, 0, 0.629724, 0.73186, 0.260439, 0.68205, 0.731305, 0, 0.803725, 0.49337, 0.332584, 0.870301, 0.492521, 0, -0.683407, -0.256728, -0.683407, -0.683531, 0.256068, -0.683531, -0.064925, 0.995776, -0.064925, 0.481399, 0.732469, 0.481399, 0.614804, 0.493997, 0.614804, -0.369882, -0.256345, -0.893014, -0.369102, 0.255996, -0.893437, -0.035507, 0.995843, -0.083877, 0.260439, 0.73186, 0.629724, 0.332584, 0.493369, 0.803725, -0.002848, -0.257863, -0.966177, -0.001923, 0.254736, -0.967009, -0.000266, 0.995734, -0.09227, 0.000024, 0.731295, 0.682061, 0, 0.492521, 0.870301, -0.002848, -0.257863, -0.966177, 0.379058, -0.3593, -0.852771, 0.37711, 0.149085, -0.914091, -0.001923, 0.254736, -0.967009, 0.027502, 0.992081, -0.122552, -0.000266, 0.995734, -0.09227, -0.26101, 0.726762, 0.635367, 0.000024, 0.731295, 0.682061, -0.332485, 0.492546, 0.804271, 0, 0.492521, 0.870301, 0.663548, -0.41079, -0.625264, 0.712664, 0.073722, -0.697621, 0.099726, 0.987509, -0.121983, -0.48732, 0.723754, 0.488569, -0.615242, 0.492602, 0.615484, 0.880028, -0.332906, -0.338709, 0.917276, 0.167113, -0.361493, 0.113584, 0.992365, -0.04807, -0.63415, 0.727508, 0.261889, -0.804126, 0.492634, 0.332705, 0.96669, -0.255738, 0.010454, 0.967442, 0.252962, 0.008103, 0.093436, 0.995624, 0.001281, -0.682167, 0.731196, -0.000343, -0.870322, 0.492483, -0.000054, 0.96669, -0.255738, 0.010454, 0.893014, -0.256345, 0.369882, 0.893437, 0.255996, 0.369102, 0.967442, 0.252962, 0.008103, 0.083877, 0.995843, 0.035507, 0.093436, 0.995624, 0.001281, -0.629724, 0.73186, -0.260439, -0.682167, 0.731196, -0.000343, -0.803725, 0.49337, -0.332584, -0.870322, 0.492483, -0.000054, 0.683407, -0.256728, 0.683407, 0.683531, 0.256068, 0.683531, 0.064925, 0.995776, 0.064925, -0.481399, 0.732469, -0.481399, -0.614804, 0.493997, -0.614804, 0.369882, -0.256345, 0.893014, 0.369102, 0.255996, 0.893437, 0.035507, 0.995843, 0.083877, -0.260439, 0.73186, -0.629724, -0.332584, 0.493369, -0.803725, 0, -0.255752, 0.966742, 0, 0.255443, 0.966824, 0, 0.995754, 0.092052, 0, 0.731305, -0.68205, 0, 0.492521, -0.870301, 0, -0.255752, 0.966742, -0.369882, -0.256345, 0.893014, -0.369102, 0.255996, 0.893437, 0, 0.255443, 0.966824, -0.035507, 0.995843, 0.083877, 0, 0.995754, 0.092052, 0.260439, 0.73186, -0.629724, 0, 0.731305, -0.68205, 0.332584, 0.49337, -0.803725, 0, 0.492521, -0.870301, -0.683407, -0.256728, 0.683407, -0.683531, 0.256068, 0.683531, -0.064925, 0.995776, 0.064925, 0.481399, 0.732469, -0.481399, 0.614804, 0.493997, -0.614804, -0.893014, -0.256345, 0.369882, -0.893437, 0.255996, 0.369102, -0.083877, 0.995843, 0.035507, 0.629724, 0.73186, -0.260439, 0.803725, 0.493369, -0.332584, -0.966742, -0.255752, 0, -0.966824, 0.255443, 0, -0.092052, 0.995754, 0, 0.68205, 0.731305, 0, 0.870301, 0.492521, 0, 0.870301, 0.492521, 0, 0.803725, 0.49337, 0.332584, 0.845438, 0.403546, 0.349835, 0.915321, 0.402725, 0, 0.869996, 0.336859, 0.360047, 0.941808, 0.336151, 0, 0.904193, 0.205791, 0.37428, 0.97869, 0.205342, 0, 0.921879, -0.06637, 0.381752, 0.997804, -0.06624, 0, 0.614804, 0.493997, 0.614804, 0.646802, 0.404096, 0.646802, 0.665655, 0.337351, 0.665655, 0.691923, 0.20612, 0.691923, 0.705543, -0.06648, 0.705542, 0.332584, 0.493369, 0.803725, 0.349835, 0.403546, 0.845438, 0.360047, 0.336859, 0.869996, 0.37428, 0.205791, 0.904193, 0.381752, -0.066369, 0.921879, 0, 0.492521, 0.870301, 0, 0.402725, 0.915321, 0, 0.336151, 0.941808, 0, 0.205342, 0.97869, 0, -0.06624, 0.997804, 0, 0.492521, 0.870301, -0.332485, 0.492546, 0.804271, -0.349835, 0.403546, 0.845438, 0, 0.402725, 0.915321, -0.360047, 0.336859, 0.869996, 0, 0.336151, 0.941808, -0.37428, 0.205791, 0.904193, 0, 0.205342, 0.97869, -0.381752, -0.06637, 0.921879, 0, -0.06624, 0.997804, -0.615242, 0.492602, 0.615484, -0.646802, 0.404096, 0.646802, -0.665655, 0.337351, 0.665655, -0.691923, 0.20612, 0.691923, -0.705542, -0.06648, 0.705543, -0.804126, 0.492634, 0.332705, -0.845438, 0.403546, 0.349835, -0.869996, 0.336859, 0.360047, -0.904193, 0.205791, 0.37428, -0.921879, -0.066369, 0.381752, -0.870322, 0.492483, -0.000054, -0.915321, 0.402725, 0, -0.941808, 0.336151, 0, -0.97869, 0.205342, 0, -0.997804, -0.06624, 0, -0.870322, 0.492483, -0.000054, -0.803725, 0.49337, -0.332584, -0.845438, 0.403546, -0.349835, -0.915321, 0.402725, 0, -0.869996, 0.336859, -0.360047, -0.941808, 0.336151, 0, -0.904193, 0.205791, -0.37428, -0.97869, 0.205342, 0, -0.921879, -0.06637, -0.381752, -0.997804, -0.06624, 0, -0.614804, 0.493997, -0.614804, -0.646802, 0.404096, -0.646802, -0.665655, 0.337351, -0.665655, -0.691923, 0.20612, -0.691923, -0.705543, -0.06648, -0.705542, -0.332584, 0.493369, -0.803725, -0.349835, 0.403546, -0.845438, -0.360047, 0.336859, -0.869996, -0.37428, 0.205791, -0.904193, -0.381752, -0.066369, -0.921879, 0, 0.492521, -0.870301, 0, 0.402725, -0.915321, 0, 0.336151, -0.941808, 0, 0.205342, -0.97869, 0, -0.06624, -0.997804, 0, 0.492521, -0.870301, 0.332584, 0.49337, -0.803725, 0.349835, 0.403546, -0.845438, 0, 0.402725, -0.915321, 0.360047, 0.336859, -0.869996, 0, 0.336151, -0.941808, 0.37428, 0.205791, -0.904193, 0, 0.205342, -0.97869, 0.381752, -0.06637, -0.921879, 0, -0.06624, -0.997804, 0.614804, 0.493997, -0.614804, 0.646802, 0.404096, -0.646802, 0.665655, 0.337351, -0.665655, 0.691923, 0.20612, -0.691923, 0.705542, -0.06648, -0.705543, 0.803725, 0.493369, -0.332584, 0.845438, 0.403546, -0.349835, 0.869996, 0.336859, -0.360047, 0.904193, 0.205791, -0.37428, 0.921879, -0.066369, -0.381752, 0.870301, 0.492521, 0, 0.915321, 0.402725, 0, 0.941808, 0.336151, 0, 0.97869, 0.205342, 0, 0.997804, -0.06624, 0, 0.997804, -0.06624, 0, 0.921879, -0.06637, 0.381752, 0.831437, -0.43618, 0.344179, 0.900182, -0.435513, 0, 0.673512, -0.684666, 0.278594, 0.729611, -0.683863, 0, 0.640399, -0.720924, 0.264874, 0.693951, -0.720022, 0, 0.732949, -0.608995, 0.303167, 0.79395, -0.607983, 0, 0.705543, -0.06648, 0.705542, 0.636092, -0.436778, 0.636092, 0.514965, -0.68529, 0.514965, 0.489651, -0.721446, 0.489651, 0.560555, -0.609554, 0.560555, 0.381752, -0.066369, 0.921879, 0.344179, -0.43618, 0.831437, 0.278595, -0.684666, 0.673512, 0.264874, -0.720924, 0.640399, 0.303167, -0.608995, 0.732949, 0, -0.06624, 0.997804, 0, -0.435513, 0.900182, 0, -0.683863, 0.729611, 0, -0.720022, 0.693951, 0, -0.607983, 0.79395, 0, -0.06624, 0.997804, -0.381752, -0.06637, 0.921879, -0.344179, -0.43618, 0.831437, 0, -0.435513, 0.900182, -0.278594, -0.684666, 0.673512, 0, -0.683863, 0.729611, -0.264874, -0.720924, 0.640399, 0, -0.720022, 0.693951, -0.303167, -0.608995, 0.732949, 0, -0.607983, 0.79395, -0.705542, -0.06648, 0.705543, -0.636092, -0.436778, 0.636092, -0.514965, -0.68529, 0.514965, -0.489651, -0.721446, 0.489651, -0.560555, -0.609554, 0.560555, -0.921879, -0.066369, 0.381752, -0.831437, -0.43618, 0.344179, -0.673512, -0.684666, 0.278595, -0.640399, -0.720924, 0.264874, -0.732949, -0.608995, 0.303167, -0.997804, -0.06624, 0, -0.900182, -0.435513, 0, -0.729611, -0.683863, 0, -0.693951, -0.720022, 0, -0.79395, -0.607983, 0, -0.997804, -0.06624, 0, -0.921879, -0.06637, -0.381752, -0.831437, -0.43618, -0.344179, -0.900182, -0.435513, 0, -0.673512, -0.684666, -0.278594, -0.729611, -0.683863, 0, -0.640399, -0.720924, -0.264874, -0.693951, -0.720022, 0, -0.732949, -0.608995, -0.303167, -0.79395, -0.607983, 0, -0.705543, -0.06648, -0.705542, -0.636092, -0.436778, -0.636092, -0.514965, -0.68529, -0.514965, -0.489651, -0.721446, -0.489651, -0.560555, -0.609554, -0.560555, -0.381752, -0.066369, -0.921879, -0.344179, -0.43618, -0.831437, -0.278595, -0.684666, -0.673512, -0.264874, -0.720924, -0.640399, -0.303167, -0.608995, -0.732949, 0, -0.06624, -0.997804, 0, -0.435513, -0.900182, 0, -0.683863, -0.729611, 0, -0.720022, -0.693951, 0, -0.607983, -0.79395, 0, -0.06624, -0.997804, 0.381752, -0.06637, -0.921879, 0.344179, -0.43618, -0.831437, 0, -0.435513, -0.900182, 0.278594, -0.684666, -0.673512, 0, -0.683863, -0.729611, 0.264874, -0.720924, -0.640399, 0, -0.720022, -0.693951, 0.303167, -0.608995, -0.732949, 0, -0.607983, -0.79395, 0.705542, -0.06648, -0.705543, 0.636092, -0.436778, -0.636092, 0.514965, -0.68529, -0.514965, 0.489651, -0.721446, -0.489651, 0.560555, -0.609554, -0.560555, 0.921879, -0.066369, -0.381752, 0.831437, -0.43618, -0.344179, 0.673512, -0.684666, -0.278595, 0.640399, -0.720924, -0.264874, 0.732949, -0.608995, -0.303167, 0.997804, -0.06624, 0, 0.900182, -0.435513, 0, 0.729611, -0.683863, 0, 0.693951, -0.720022, 0, 0.79395, -0.607983, 0, 0.79395, -0.607983, 0, 0.732949, -0.608995, 0.303167, 0.57623, -0.781801, 0.238217, 0.62386, -0.781536, 0, 0.163628, -0.984208, 0.067527, 0.177291, -0.984159, 0, 0.045422, -0.998792, 0.018736, 0.049207, -0.998789, 0, 0, -1, 0, 0.560555, -0.609554, 0.560555, 0.440416, -0.782348, 0.440416, 0.124903, -0.984276, 0.124903, 0.034662, -0.998798, 0.034662, 0, -1, 0, 0.303167, -0.608995, 0.732949, 0.238217, -0.781801, 0.57623, 0.067527, -0.984208, 0.163628, 0.018736, -0.998792, 0.045422, 0, -1, 0, 0, -0.607983, 0.79395, 0, -0.781536, 0.62386, 0, -0.984159, 0.177291, 0, -0.998789, 0.049207, 0, -1, 0, 0, -0.607983, 0.79395, -0.303167, -0.608995, 0.732949, -0.238217, -0.781801, 0.57623, 0, -0.781536, 0.62386, -0.067527, -0.984208, 0.163628, 0, -0.984159, 0.177291, -0.018736, -0.998792, 0.045422, 0, -0.998789, 0.049207, 0, -1, 0, -0.560555, -0.609554, 0.560555, -0.440416, -0.782348, 0.440416, -0.124903, -0.984276, 0.124903, -0.034662, -0.998798, 0.034662, 0, -1, 0, -0.732949, -0.608995, 0.303167, -0.57623, -0.781801, 0.238217, -0.163628, -0.984208, 0.067527, -0.045422, -0.998792, 0.018736, 0, -1, 0, -0.79395, -0.607983, 0, -0.62386, -0.781536, 0, -0.177291, -0.984159, 0, -0.049207, -0.998789, 0, 0, -1, 0, -0.79395, -0.607983, 0, -0.732949, -0.608995, -0.303167, -0.57623, -0.781801, -0.238217, -0.62386, -0.781536, 0, -0.163628, -0.984208, -0.067527, -0.177291, -0.984159, 0, -0.045422, -0.998792, -0.018736, -0.049207, -0.998789, 0, 0, -1, 0, -0.560555, -0.609554, -0.560555, -0.440416, -0.782348, -0.440416, -0.124903, -0.984276, -0.124903, -0.034662, -0.998798, -0.034662, 0, -1, 0, -0.303167, -0.608995, -0.732949, -0.238217, -0.781801, -0.57623, -0.067527, -0.984208, -0.163628, -0.018736, -0.998792, -0.045422, 0, -1, 0, 0, -0.607983, -0.79395, 0, -0.781536, -0.62386, 0, -0.984159, -0.177291, 0, -0.998789, -0.049207, 0, -1, 0, 0, -0.607983, -0.79395, 0.303167, -0.608995, -0.732949, 0.238217, -0.781801, -0.57623, 0, -0.781536, -0.62386, 0.067527, -0.984208, -0.163628, 0, -0.984159, -0.177291, 0.018736, -0.998792, -0.045422, 0, -0.998789, -0.049207, 0, -1, 0, 0.560555, -0.609554, -0.560555, 0.440416, -0.782348, -0.440416, 0.124903, -0.984276, -0.124903, 0.034662, -0.998798, -0.034662, 0, -1, 0, 0.732949, -0.608995, -0.303167, 0.57623, -0.781801, -0.238217, 0.163628, -0.984208, -0.067527, 0.045422, -0.998792, -0.018736, 0, -1, 0, 0.79395, -0.607983, 0, 0.62386, -0.781536, 0, 0.177291, -0.984159, 0, 0.049207, -0.998789, 0, 0, -1, 0, 0.007786, -0.99997, -0.000216, 0.007039, -0.812495, 0.582926, 0.036127, -0.837257, 0.545614, 0.039138, -0.999233, -0.000989, 0.161846, -0.810421, 0.563048, 0.179512, -0.983746, -0.004369, 0.482365, -0.595148, 0.642746, 0.612299, -0.790557, -0.01046, 0.73872, -0.114594, 0.664199, 0.986152, -0.165708, -0.00667, -0.001909, 0.162121, 0.986769, 0.002762, 0.017107, 0.99985, 0.010533, 0.073398, 0.997247, -0.066041, 0.13007, 0.989303, -0.094427, 0.016594, 0.995393, -0.009203, 0.871509, 0.490293, -0.048606, 0.840609, 0.539457, -0.223298, 0.80288, 0.552739, -0.596365, 0.559971, 0.575135, -0.803337, 0.068236, 0.591603, -0.010561, 0.999944, 0.000103, -0.058798, 0.99827, 0.00071, -0.28071, 0.959787, 0.003269, -0.749723, 0.661738, 0.004268, -0.997351, 0.072714, 0.002059, -0.010561, 0.999944, 0.000103, -0.008792, 0.871493, -0.49033, -0.046494, 0.841178, -0.538756, -0.058798, 0.99827, 0.00071, -0.217909, 0.806807, -0.549161, -0.28071, 0.959787, 0.003269, -0.597291, 0.560026, -0.574121, -0.749723, 0.661738, 0.004268, -0.804, 0.062913, -0.591292, -0.997351, 0.072714, 0.002059, -0.001806, 0.161691, -0.98684, 0.002031, 0.014555, -0.999892, 0.009215, 0.060069, -0.998152, -0.059334, 0.113865, -0.991723, -0.086899, 0.01229, -0.996141, 0.006418, -0.812379, -0.583095, 0.033783, -0.837512, -0.545373, 0.157113, -0.811947, -0.56219, 0.484406, -0.589366, -0.646528, 0.73887, -0.10132, -0.666187, 0.007786, -0.99997, -0.000216, 0.039138, -0.999233, -0.000989, 0.179512, -0.983746, -0.004369, 0.612299, -0.790557, -0.01046, 0.986152, -0.165708, -0.00667, 0.986152, -0.165708, -0.00667, 0.73872, -0.114594, 0.664199, 0.725608, 0.259351, 0.637361, 0.946512, 0.32265, -0.003357, 0.645945, 0.461988, 0.607719, 0.82583, 0.56387, -0.007452, 0.531615, 0.63666, 0.558614, 0.650011, 0.759893, -0.006937, 0.424964, 0.681717, 0.59554, 0.532429, 0.846459, -0.005245, -0.094427, 0.016594, 0.995393, -0.049562, -0.019755, 0.998576, -0.037816, -0.035624, 0.99865, -0.037914, -0.036512, 0.998614, -0.168854, -0.297945, 0.93953, -0.803337, 0.068236, 0.591603, -0.742342, -0.299166, 0.599523, -0.619602, -0.529406, 0.579502, -0.483708, -0.68576, 0.543837, -0.445293, -0.794355, 0.413177, -0.997351, 0.072714, 0.002059, -0.926513, -0.376258, 0.001996, -0.75392, -0.656952, 0.004317, -0.566224, -0.824244, 0.003461, -0.481804, -0.876277, 0.00185, -0.997351, 0.072714, 0.002059, -0.804, 0.062913, -0.591292, -0.744675, -0.294425, -0.598977, -0.926513, -0.376258, 0.001996, -0.621949, -0.528114, -0.578165, -0.75392, -0.656952, 0.004317, -0.481171, -0.68834, -0.542828, -0.566224, -0.824244, 0.003461, -0.438055, -0.797035, -0.415744, -0.481804, -0.876277, 0.00185, -0.086899, 0.01229, -0.996141, -0.044337, -0.017056, -0.998871, -0.026176, -0.028166, -0.99926, -0.025294, -0.028332, -0.999278, -0.157482, -0.289392, -0.944167, 0.73887, -0.10132, -0.666187, 0.728244, 0.25241, -0.637142, 0.647055, 0.459725, -0.608254, 0.522994, 0.640657, -0.56217, 0.409978, 0.682857, -0.604669, 0.986152, -0.165708, -0.00667, 0.946512, 0.32265, -0.003357, 0.82583, 0.56387, -0.007452, 0.650011, 0.759893, -0.006937, 0.532429, 0.846459, -0.005245, -0.230787, 0.972982, -0.006523, -0.152877, 0.687211, 0.71019, -0.316721, 0.63775, 0.702113, -0.548936, 0.835863, -0.001511, -0.601067, 0.471452, 0.64533, -0.875671, 0.482806, 0.009893, -0.635889, 0.44609, 0.629801, -0.877554, 0.479097, 0.019092, -0.435746, 0.601008, 0.670011, -0.69619, 0.717439, 0.024497, 0.111113, -0.08507, 0.99016, 0.22331, 0.00654, 0.974726, 0.190097, 0.154964, 0.969458, 0.005271, 0.189482, 0.98187, -0.011752, 0.246688, 0.969024, 0.343906, -0.722796, 0.599412, 0.572489, -0.567656, 0.591627, 0.787436, -0.256459, 0.560512, 0.647097, -0.306374, 0.698141, 0.427528, -0.499343, 0.753576, 0.410926, -0.911668, 0.001284, 0.67152, -0.740986, -0.000899, 0.922026, -0.38706, -0.007253, 0.84691, -0.531556, -0.013854, 0.535924, -0.844201, -0.010505, 0.410926, -0.911668, 0.001284, 0.341188, -0.722823, -0.600931, 0.578664, -0.561139, -0.591838, 0.67152, -0.740986, -0.000899, 0.784869, -0.25102, -0.566542, 0.922026, -0.38706, -0.007253, 0.642681, -0.302257, -0.70399, 0.84691, -0.531556, -0.013854, 0.418589, -0.500042, -0.758117, 0.535924, -0.844201, -0.010505, 0.115806, -0.079139, -0.990114, 0.232811, 0.012565, -0.972441, 0.206662, 0.153601, -0.96628, 0.0245, 0.161443, -0.986578, 0.003382, 0.211115, -0.977455, -0.134912, 0.687491, -0.713551, -0.31954, 0.633073, -0.705063, -0.603902, 0.461442, -0.649903, -0.631815, 0.437169, -0.640072, -0.424306, 0.612706, -0.66675, -0.230787, 0.972982, -0.006523, -0.548936, 0.835863, -0.001511, -0.875671, 0.482806, 0.009893, -0.877554, 0.479097, 0.019092, -0.69619, 0.717439, 0.024497, -0.69619, 0.717439, 0.024497, -0.435746, 0.601008, 0.670011, -0.259858, 0.791937, 0.552548, -0.425801, 0.904753, 0.010805, 0.009539, 0.99972, -0.021674, 0.022046, 0.999756, 0.001623, 0.410157, 0.332912, -0.849082, 0.999598, 0.025875, 0.011556, 0.541523, -0.548619, -0.637001, 0.709587, -0.704552, 0.009672, -0.011752, 0.246688, 0.969024, 0.046311, 0.455223, 0.889172, -0.010688, 0.988794, 0.1489, -0.044376, 0.682946, -0.72912, 0.122824, 0.009233, -0.992385, 0.427528, -0.499343, 0.753576, 0.481839, -0.18044, 0.85748, 0.455272, 0.736752, 0.499925, -0.220542, 0.907193, -0.358277, -0.235919, 0.65725, -0.715797, 0.535924, -0.844201, -0.010505, 0.728094, -0.6853, -0.015585, 0.888738, 0.458112, -0.016679, -0.260098, 0.965582, 0.0008, -0.371611, 0.928378, -0.004418, 0.535924, -0.844201, -0.010505, 0.418589, -0.500042, -0.758117, 0.480165, -0.178362, -0.858853, 0.728094, -0.6853, -0.015585, 0.488102, 0.716802, -0.497947, 0.888738, 0.458112, -0.016679, -0.222004, 0.905399, 0.361892, -0.260098, 0.965582, 0.0008, -0.235405, 0.66318, 0.710477, -0.371611, 0.928378, -0.004418, 0.003382, 0.211115, -0.977455, 0.05872, 0.437702, -0.8972, 0.001326, 0.986459, -0.164002, -0.04419, 0.681675, 0.730319, 0.138801, -0.034188, 0.98973, -0.424306, 0.612706, -0.66675, -0.25889, 0.797206, -0.54538, 0.01227, 0.999739, 0.019287, 0.398632, 0.35489, 0.845663, 0.537564, -0.581398, 0.610738, -0.69619, 0.717439, 0.024497, -0.425801, 0.904753, 0.010805, 0.022046, 0.999756, 0.001623, 0.999598, 0.025875, 0.011556, 0.709587, -0.704552, 0.009672, 0.76264, 0.565035, 0.314825, 0.82454, 0.565804, 0.000017, 0, 1, 0, 0.847982, -0.397998, 0.350034, 0.917701, -0.397272, 0.000034, 0.864141, -0.355261, 0.356441, 0.935269, -0.353939, 0.000113, 0.720992, 0.625625, 0.297933, 0.780712, 0.62489, 0.000075, 0.583357, 0.565165, 0.583338, 0, 1, 0, 0.648485, -0.398726, 0.648448, 0.660872, -0.355894, 0.660748, 0.551862, 0.62529, 0.55178, 0.314824, 0.565051, 0.762629, 0, 1, 0, 0.350045, -0.397976, 0.847988, 0.356474, -0.355199, 0.864153, 0.297983, 0.625515, 0.721067, -0.000017, 0.565804, 0.82454, 0, 1, 0, -0.000034, -0.397272, 0.917701, -0.000113, -0.353939, 0.935269, -0.000075, 0.62489, 0.780712, -0.314825, 0.565035, 0.76264, -0.000017, 0.565804, 0.82454, 0, 1, 0, -0.350034, -0.397998, 0.847982, -0.000034, -0.397272, 0.917701, -0.356441, -0.355261, 0.864141, -0.000113, -0.353939, 0.935269, -0.297933, 0.625625, 0.720992, -0.000075, 0.62489, 0.780712, -0.583338, 0.565165, 0.583357, 0, 1, 0, -0.648448, -0.398726, 0.648485, -0.660748, -0.355894, 0.660872, -0.55178, 0.62529, 0.551862, -0.762629, 0.565051, 0.314824, 0, 1, 0, -0.847988, -0.397976, 0.350045, -0.864153, -0.355199, 0.356474, -0.721067, 0.625515, 0.297983, -0.82454, 0.565804, -0.000017, 0, 1, 0, -0.917701, -0.397272, -0.000034, -0.935269, -0.353939, -0.000113, -0.780712, 0.62489, -0.000075, -0.76264, 0.565035, -0.314825, -0.82454, 0.565804, -0.000017, 0, 1, 0, -0.847982, -0.397998, -0.350034, -0.917701, -0.397272, -0.000034, -0.864141, -0.355261, -0.356441, -0.935269, -0.353939, -0.000113, -0.720992, 0.625625, -0.297933, -0.780712, 0.62489, -0.000075, -0.583357, 0.565165, -0.583338, 0, 1, 0, -0.648485, -0.398726, -0.648448, -0.660872, -0.355894, -0.660748, -0.551862, 0.62529, -0.55178, -0.314824, 0.565051, -0.762629, 0, 1, 0, -0.350045, -0.397976, -0.847988, -0.356474, -0.355199, -0.864153, -0.297983, 0.625515, -0.721067, 0.000017, 0.565804, -0.82454, 0, 1, 0, 0.000034, -0.397272, -0.917701, 0.000113, -0.353939, -0.935269, 0.000075, 0.62489, -0.780712, 0.314825, 0.565035, -0.76264, 0.000017, 0.565804, -0.82454, 0, 1, 0, 0.350034, -0.397998, -0.847982, 0.000034, -0.397272, -0.917701, 0.356441, -0.355261, -0.864141, 0.000113, -0.353939, -0.935269, 0.297933, 0.625625, -0.720992, 0.000075, 0.62489, -0.780712, 0.583338, 0.565165, -0.583357, 0, 1, 0, 0.648448, -0.398726, -0.648485, 0.660748, -0.355894, -0.660872, 0.55178, 0.62529, -0.551862, 0.762629, 0.565051, -0.314824, 0, 1, 0, 0.847988, -0.397976, -0.350045, 0.864153, -0.355199, -0.356474, 0.721067, 0.625515, -0.297983, 0.82454, 0.565804, 0.000017, 0, 1, 0, 0.917701, -0.397272, 0.000034, 0.935269, -0.353939, 0.000113, 0.780712, 0.62489, 0.000075, 0.780712, 0.62489, 0.000075, 0.720992, 0.625625, 0.297933, 0.217978, 0.971775, 0.090216, 0.236583, 0.971611, 0, 0.159589, 0.984977, 0.065961, 0.173084, 0.984907, 0, 0.350498, 0.925311, 0.14474, 0.379703, 0.925108, 0, 0.48559, 0.850653, 0.201474, 0.526673, 0.850068, 0, 0.551862, 0.62529, 0.55178, 0.166631, 0.971838, 0.166631, 0.121908, 0.985026, 0.121908, 0.267668, 0.925585, 0.267668, 0.371315, 0.851029, 0.371315, 0.297983, 0.625515, 0.721067, 0.090216, 0.971775, 0.217978, 0.065961, 0.984977, 0.159589, 0.14474, 0.925311, 0.350498, 0.201475, 0.850653, 0.48559, -0.000075, 0.62489, 0.780712, 0, 0.971611, 0.236583, 0, 0.984907, 0.173084, 0, 0.925108, 0.379703, 0, 0.850068, 0.526673, -0.000075, 0.62489, 0.780712, -0.297933, 0.625625, 0.720992, -0.090216, 0.971775, 0.217978, 0, 0.971611, 0.236583, -0.065961, 0.984977, 0.159589, 0, 0.984907, 0.173084, -0.14474, 0.925311, 0.350498, 0, 0.925108, 0.379703, -0.201474, 0.850653, 0.48559, 0, 0.850068, 0.526673, -0.55178, 0.62529, 0.551862, -0.166631, 0.971838, 0.166631, -0.121908, 0.985026, 0.121908, -0.267668, 0.925585, 0.267668, -0.371315, 0.851029, 0.371315, -0.721067, 0.625515, 0.297983, -0.217978, 0.971775, 0.090216, -0.159589, 0.984977, 0.065961, -0.350498, 0.925311, 0.14474, -0.48559, 0.850653, 0.201475, -0.780712, 0.62489, -0.000075, -0.236583, 0.971611, 0, -0.173084, 0.984907, 0, -0.379703, 0.925108, 0, -0.526673, 0.850068, 0, -0.780712, 0.62489, -0.000075, -0.720992, 0.625625, -0.297933, -0.217978, 0.971775, -0.090216, -0.236583, 0.971611, 0, -0.159589, 0.984977, -0.065961, -0.173084, 0.984907, 0, -0.350498, 0.925311, -0.14474, -0.379703, 0.925108, 0, -0.48559, 0.850653, -0.201474, -0.526673, 0.850068, 0, -0.551862, 0.62529, -0.55178, -0.166631, 0.971838, -0.166631, -0.121908, 0.985026, -0.121908, -0.267668, 0.925585, -0.267668, -0.371315, 0.851029, -0.371315, -0.297983, 0.625515, -0.721067, -0.090216, 0.971775, -0.217978, -0.065961, 0.984977, -0.159589, -0.14474, 0.925311, -0.350498, -0.201475, 0.850653, -0.48559, 0.000075, 0.62489, -0.780712, 0, 0.971611, -0.236583, 0, 0.984907, -0.173084, 0, 0.925108, -0.379703, 0, 0.850068, -0.526673, 0.000075, 0.62489, -0.780712, 0.297933, 0.625625, -0.720992, 0.090216, 0.971775, -0.217978, 0, 0.971611, -0.236583, 0.065961, 0.984977, -0.159589, 0, 0.984907, -0.173084, 0.14474, 0.925311, -0.350498, 0, 0.925108, -0.379703, 0.201474, 0.850653, -0.48559, 0, 0.850068, -0.526673, 0.55178, 0.62529, -0.551862, 0.166631, 0.971838, -0.166631, 0.121908, 0.985026, -0.121908, 0.267668, 0.925585, -0.267668, 0.371315, 0.851029, -0.371315, 0.721067, 0.625515, -0.297983, 0.217978, 0.971775, -0.090216, 0.159589, 0.984977, -0.065961, 0.350498, 0.925311, -0.14474, 0.48559, 0.850653, -0.201475, 0.780712, 0.62489, 0.000075, 0.236583, 0.971611, 0, 0.173084, 0.984907, 0, 0.379703, 0.925108, 0, 0.526673, 0.850068, 0],
      textureCoords: [2, 2, 1.75, 2, 1.75, 1.975, 2, 1.975, 1.75, 1.95, 2, 1.95, 1.75, 1.925, 2, 1.925, 1.75, 1.9, 2, 1.9, 1.5, 2, 1.5, 1.975, 1.5, 1.95, 1.5, 1.925, 1.5, 1.9, 1.25, 2, 1.25, 1.975, 1.25, 1.95, 1.25, 1.925, 1.25, 1.9, 1, 2, 1, 1.975, 1, 1.95, 1, 1.925, 1, 1.9, 1, 2, 0.75, 2, 0.75, 1.975, 1, 1.975, 0.75, 1.95, 1, 1.95, 0.75, 1.925, 1, 1.925, 0.75, 1.9, 1, 1.9, 0.5, 2, 0.5, 1.975, 0.5, 1.95, 0.5, 1.925, 0.5, 1.9, 0.25, 2, 0.25, 1.975, 0.25, 1.95, 0.25, 1.925, 0.25, 1.9, 0, 2, 0, 1.975, 0, 1.95, 0, 1.925, 0, 1.9, 2, 2, 1.75, 2, 1.75, 1.975, 2, 1.975, 1.75, 1.95, 2, 1.95, 1.75, 1.925, 2, 1.925, 1.75, 1.9, 2, 1.9, 1.5, 2, 1.5, 1.975, 1.5, 1.95, 1.5, 1.925, 1.5, 1.9, 1.25, 2, 1.25, 1.975, 1.25, 1.95, 1.25, 1.925, 1.25, 1.9, 1, 2, 1, 1.975, 1, 1.95, 1, 1.925, 1, 1.9, 1, 2, 0.75, 2, 0.75, 1.975, 1, 1.975, 0.75, 1.95, 1, 1.95, 0.75, 1.925, 1, 1.925, 0.75, 1.9, 1, 1.9, 0.5, 2, 0.5, 1.975, 0.5, 1.95, 0.5, 1.925, 0.5, 1.9, 0.25, 2, 0.25, 1.975, 0.25, 1.95, 0.25, 1.925, 0.25, 1.9, 0, 2, 0, 1.975, 0, 1.95, 0, 1.925, 0, 1.9, 2, 1.9, 1.75, 1.9, 1.75, 1.675, 2, 1.675, 1.75, 1.45, 2, 1.45, 1.75, 1.225, 2, 1.225, 1.75, 1, 2, 1, 1.5, 1.9, 1.5, 1.675, 1.5, 1.45, 1.5, 1.225, 1.5, 1, 1.25, 1.9, 1.25, 1.675, 1.25, 1.45, 1.25, 1.225, 1.25, 1, 1, 1.9, 1, 1.675, 1, 1.45, 1, 1.225, 1, 1, 1, 1.9, 0.75, 1.9, 0.75, 1.675, 1, 1.675, 0.75, 1.45, 1, 1.45, 0.75, 1.225, 1, 1.225, 0.75, 1, 1, 1, 0.5, 1.9, 0.5, 1.675, 0.5, 1.45, 0.5, 1.225, 0.5, 1, 0.25, 1.9, 0.25, 1.675, 0.25, 1.45, 0.25, 1.225, 0.25, 1, 0, 1.9, 0, 1.675, 0, 1.45, 0, 1.225, 0, 1, 2, 1.9, 1.75, 1.9, 1.75, 1.675, 2, 1.675, 1.75, 1.45, 2, 1.45, 1.75, 1.225, 2, 1.225, 1.75, 1, 2, 1, 1.5, 1.9, 1.5, 1.675, 1.5, 1.45, 1.5, 1.225, 1.5, 1, 1.25, 1.9, 1.25, 1.675, 1.25, 1.45, 1.25, 1.225, 1.25, 1, 1, 1.9, 1, 1.675, 1, 1.45, 1, 1.225, 1, 1, 1, 1.9, 0.75, 1.9, 0.75, 1.675, 1, 1.675, 0.75, 1.45, 1, 1.45, 0.75, 1.225, 1, 1.225, 0.75, 1, 1, 1, 0.5, 1.9, 0.5, 1.675, 0.5, 1.45, 0.5, 1.225, 0.5, 1, 0.25, 1.9, 0.25, 1.675, 0.25, 1.45, 0.25, 1.225, 0.25, 1, 0, 1.9, 0, 1.675, 0, 1.45, 0, 1.225, 0, 1, 2, 1, 1.75, 1, 1.75, 0.85, 2, 0.85, 1.75, 0.7, 2, 0.7, 1.75, 0.55, 2, 0.55, 1.75, 0.4, 2, 0.4, 1.5, 1, 1.5, 0.85, 1.5, 0.7, 1.5, 0.55, 1.5, 0.4, 1.25, 1, 1.25, 0.85, 1.25, 0.7, 1.25, 0.55, 1.25, 0.4, 1, 1, 1, 0.85, 1, 0.7, 1, 0.55, 1, 0.4, 1, 1, 0.75, 1, 0.75, 0.85, 1, 0.85, 0.75, 0.7, 1, 0.7, 0.75, 0.55, 1, 0.55, 0.75, 0.4, 1, 0.4, 0.5, 1, 0.5, 0.85, 0.5, 0.7, 0.5, 0.55, 0.5, 0.4, 0.25, 1, 0.25, 0.85, 0.25, 0.7, 0.25, 0.55, 0.25, 0.4, 0, 1, 0, 0.85, 0, 0.7, 0, 0.55, 0, 0.4, 2, 1, 1.75, 1, 1.75, 0.85, 2, 0.85, 1.75, 0.7, 2, 0.7, 1.75, 0.55, 2, 0.55, 1.75, 0.4, 2, 0.4, 1.5, 1, 1.5, 0.85, 1.5, 0.7, 1.5, 0.55, 1.5, 0.4, 1.25, 1, 1.25, 0.85, 1.25, 0.7, 1.25, 0.55, 1.25, 0.4, 1, 1, 1, 0.85, 1, 0.7, 1, 0.55, 1, 0.4, 1, 1, 0.75, 1, 0.75, 0.85, 1, 0.85, 0.75, 0.7, 1, 0.7, 0.75, 0.55, 1, 0.55, 0.75, 0.4, 1, 0.4, 0.5, 1, 0.5, 0.85, 0.5, 0.7, 0.5, 0.55, 0.5, 0.4, 0.25, 1, 0.25, 0.85, 0.25, 0.7, 0.25, 0.55, 0.25, 0.4, 0, 1, 0, 0.85, 0, 0.7, 0, 0.55, 0, 0.4, 2, 0.4, 1.75, 0.4, 1.75, 0.3, 2, 0.3, 1.75, 0.2, 2, 0.2, 1.75, 0.1, 2, 0.1, 1.75, 0, 1.5, 0.4, 1.5, 0.3, 1.5, 0.2, 1.5, 0.1, 1.5, 0, 1.25, 0.4, 1.25, 0.3, 1.25, 0.2, 1.25, 0.1, 1.25, 0, 1, 0.4, 1, 0.3, 1, 0.2, 1, 0.1, 1, 0, 1, 0.4, 0.75, 0.4, 0.75, 0.3, 1, 0.3, 0.75, 0.2, 1, 0.2, 0.75, 0.1, 1, 0.1, 0.75, 0, 0.5, 0.4, 0.5, 0.3, 0.5, 0.2, 0.5, 0.1, 0.5, 0, 0.25, 0.4, 0.25, 0.3, 0.25, 0.2, 0.25, 0.1, 0.25, 0, 0, 0.4, 0, 0.3, 0, 0.2, 0, 0.1, 0, 0, 2, 0.4, 1.75, 0.4, 1.75, 0.3, 2, 0.3, 1.75, 0.2, 2, 0.2, 1.75, 0.1, 2, 0.1, 1.75, 0, 1.5, 0.4, 1.5, 0.3, 1.5, 0.2, 1.5, 0.1, 1.5, 0, 1.25, 0.4, 1.25, 0.3, 1.25, 0.2, 1.25, 0.1, 1.25, 0, 1, 0.4, 1, 0.3, 1, 0.2, 1, 0.1, 1, 0, 1, 0.4, 0.75, 0.4, 0.75, 0.3, 1, 0.3, 0.75, 0.2, 1, 0.2, 0.75, 0.1, 1, 0.1, 0.75, 0, 0.5, 0.4, 0.5, 0.3, 0.5, 0.2, 0.5, 0.1, 0.5, 0, 0.25, 0.4, 0.25, 0.3, 0.25, 0.2, 0.25, 0.1, 0.25, 0, 0, 0.4, 0, 0.3, 0, 0.2, 0, 0.1, 0, 0, 1, 1, 0.875, 1, 0.875, 0.875, 1, 0.875, 0.875, 0.75, 1, 0.75, 0.875, 0.625, 1, 0.625, 0.875, 0.5, 1, 0.5, 0.75, 1, 0.75, 0.875, 0.75, 0.75, 0.75, 0.625, 0.75, 0.5, 0.625, 1, 0.625, 0.875, 0.625, 0.75, 0.625, 0.625, 0.625, 0.5, 0.5, 1, 0.5, 0.875, 0.5, 0.75, 0.5, 0.625, 0.5, 0.5, 0.5, 1, 0.375, 1, 0.375, 0.875, 0.5, 0.875, 0.375, 0.75, 0.5, 0.75, 0.375, 0.625, 0.5, 0.625, 0.375, 0.5, 0.5, 0.5, 0.25, 1, 0.25, 0.875, 0.25, 0.75, 0.25, 0.625, 0.25, 0.5, 0.125, 1, 0.125, 0.875, 0.125, 0.75, 0.125, 0.625, 0.125, 0.5, 0, 1, 0, 0.875, 0, 0.75, 0, 0.625, 0, 0.5, 1, 0.5, 0.875, 0.5, 0.875, 0.375, 1, 0.375, 0.875, 0.25, 1, 0.25, 0.875, 0.125, 1, 0.125, 0.875, 0, 1, 0, 0.75, 0.5, 0.75, 0.375, 0.75, 0.25, 0.75, 0.125, 0.75, 0, 0.625, 0.5, 0.625, 0.375, 0.625, 0.25, 0.625, 0.125, 0.625, 0, 0.5, 0.5, 0.5, 0.375, 0.5, 0.25, 0.5, 0.125, 0.5, 0, 0.5, 0.5, 0.375, 0.5, 0.375, 0.375, 0.5, 0.375, 0.375, 0.25, 0.5, 0.25, 0.375, 0.125, 0.5, 0.125, 0.375, 0, 0.5, 0, 0.25, 0.5, 0.25, 0.375, 0.25, 0.25, 0.25, 0.125, 0.25, 0, 0.125, 0.5, 0.125, 0.375, 0.125, 0.25, 0.125, 0.125, 0.125, 0, 0, 0.5, 0, 0.375, 0, 0.25, 0, 0.125, 0, 0, 0.5, 0, 0.625, 0, 0.625, 0.225, 0.5, 0.225, 0.625, 0.45, 0.5, 0.45, 0.625, 0.675, 0.5, 0.675, 0.625, 0.9, 0.5, 0.9, 0.75, 0, 0.75, 0.225, 0.75, 0.45, 0.75, 0.675, 0.75, 0.9, 0.875, 0, 0.875, 0.225, 0.875, 0.45, 0.875, 0.675, 0.875, 0.9, 1, 0, 1, 0.225, 1, 0.45, 1, 0.675, 1, 0.9, 0, 0, 0.125, 0, 0.125, 0.225, 0, 0.225, 0.125, 0.45, 0, 0.45, 0.125, 0.675, 0, 0.675, 0.125, 0.9, 0, 0.9, 0.25, 0, 0.25, 0.225, 0.25, 0.45, 0.25, 0.675, 0.25, 0.9, 0.375, 0, 0.375, 0.225, 0.375, 0.45, 0.375, 0.675, 0.375, 0.9, 0.5, 0, 0.5, 0.225, 0.5, 0.45, 0.5, 0.675, 0.5, 0.9, 0.5, 0.9, 0.625, 0.9, 0.625, 0.925, 0.5, 0.925, 0.625, 0.95, 0.5, 0.95, 0.625, 0.975, 0.5, 0.975, 0.625, 1, 0.5, 1, 0.75, 0.9, 0.75, 0.925, 0.75, 0.95, 0.75, 0.975, 0.75, 1, 0.875, 0.9, 0.875, 0.925, 0.875, 0.95, 0.875, 0.975, 0.875, 1, 1, 0.9, 1, 0.925, 1, 0.95, 1, 0.975, 1, 1, 0, 0.9, 0.125, 0.9, 0.125, 0.925, 0, 0.925, 0.125, 0.95, 0, 0.95, 0.125, 0.975, 0, 0.975, 0.125, 1, 0, 1, 0.25, 0.9, 0.25, 0.925, 0.25, 0.95, 0.25, 0.975, 0.25, 1, 0.375, 0.9, 0.375, 0.925, 0.375, 0.95, 0.375, 0.975, 0.375, 1, 0.5, 0.9, 0.5, 0.925, 0.5, 0.95, 0.5, 0.975, 0.5, 1, 0.875, 0.75, 1, 0.75, 1, 1, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 0.75, 0.875, 1, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 0.75, 0.75, 1, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 0.75, 0.625, 1, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.375, 0.75, 0.5, 0.75, 0.5, 1, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 0.75, 0.375, 1, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 0.75, 0.25, 1, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 0.75, 0.125, 1, 0, 0.5, 0, 0.25, 0, 0, 0.875, 0.75, 1, 0.75, 1, 1, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 0.75, 0.875, 1, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 0.75, 0.75, 1, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 0.75, 0.625, 1, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.375, 0.75, 0.5, 0.75, 0.5, 1, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 0.75, 0.375, 1, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 0.75, 0.25, 1, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 0.75, 0.125, 1, 0, 0.5, 0, 0.25, 0, 0, 1, 1, 0.875, 1, 0.875, 0.75, 1, 0.75, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 1, 0.75, 0.75, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 1, 0.625, 0.75, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 1, 0.5, 0.75, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.5, 1, 0.375, 1, 0.375, 0.75, 0.5, 0.75, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 1, 0.25, 0.75, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 1, 0.125, 0.75, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 1, 0, 0.75, 0, 0.5, 0, 0.25, 0, 0, 1, 1, 0.875, 1, 0.875, 0.75, 1, 0.75, 0.875, 0.5, 1, 0.5, 0.875, 0.25, 1, 0.25, 0.875, 0, 1, 0, 0.75, 1, 0.75, 0.75, 0.75, 0.5, 0.75, 0.25, 0.75, 0, 0.625, 1, 0.625, 0.75, 0.625, 0.5, 0.625, 0.25, 0.625, 0, 0.5, 1, 0.5, 0.75, 0.5, 0.5, 0.5, 0.25, 0.5, 0, 0.5, 1, 0.375, 1, 0.375, 0.75, 0.5, 0.75, 0.375, 0.5, 0.5, 0.5, 0.375, 0.25, 0.5, 0.25, 0.375, 0, 0.5, 0, 0.25, 1, 0.25, 0.75, 0.25, 0.5, 0.25, 0.25, 0.25, 0, 0.125, 1, 0.125, 0.75, 0.125, 0.5, 0.125, 0.25, 0.125, 0, 0, 1, 0, 0.75, 0, 0.5, 0, 0.25, 0, 0],
      indices: [0, 1, 2, 2, 3, 0, 3, 2, 4, 4, 5, 3, 5, 4, 6, 6, 7, 5, 7, 6, 8, 8, 9, 7, 1, 10, 11, 11, 2, 1, 2, 11, 12, 12, 4, 2, 4, 12, 13, 13, 6, 4, 6, 13, 14, 14, 8, 6, 10, 15, 16, 16, 11, 10, 11, 16, 17, 17, 12, 11, 12, 17, 18, 18, 13, 12, 13, 18, 19, 19, 14, 13, 15, 20, 21, 21, 16, 15, 16, 21, 22, 22, 17, 16, 17, 22, 23, 23, 18, 17, 18, 23, 24, 24, 19, 18, 25, 26, 27, 27, 28, 25, 28, 27, 29, 29, 30, 28, 30, 29, 31, 31, 32, 30, 32, 31, 33, 33, 34, 32, 26, 35, 36, 36, 27, 26, 27, 36, 37, 37, 29, 27, 29, 37, 38, 38, 31, 29, 31, 38, 39, 39, 33, 31, 35, 40, 41, 41, 36, 35, 36, 41, 42, 42, 37, 36, 37, 42, 43, 43, 38, 37, 38, 43, 44, 44, 39, 38, 40, 45, 46, 46, 41, 40, 41, 46, 47, 47, 42, 41, 42, 47, 48, 48, 43, 42, 43, 48, 49, 49, 44, 43, 50, 51, 52, 52, 53, 50, 53, 52, 54, 54, 55, 53, 55, 54, 56, 56, 57, 55, 57, 56, 58, 58, 59, 57, 51, 60, 61, 61, 52, 51, 52, 61, 62, 62, 54, 52, 54, 62, 63, 63, 56, 54, 56, 63, 64, 64, 58, 56, 60, 65, 66, 66, 61, 60, 61, 66, 67, 67, 62, 61, 62, 67, 68, 68, 63, 62, 63, 68, 69, 69, 64, 63, 65, 70, 71, 71, 66, 65, 66, 71, 72, 72, 67, 66, 67, 72, 73, 73, 68, 67, 68, 73, 74, 74, 69, 68, 75, 76, 77, 77, 78, 75, 78, 77, 79, 79, 80, 78, 80, 79, 81, 81, 82, 80, 82, 81, 83, 83, 84, 82, 76, 85, 86, 86, 77, 76, 77, 86, 87, 87, 79, 77, 79, 87, 88, 88, 81, 79, 81, 88, 89, 89, 83, 81, 85, 90, 91, 91, 86, 85, 86, 91, 92, 92, 87, 86, 87, 92, 93, 93, 88, 87, 88, 93, 94, 94, 89, 88, 90, 95, 96, 96, 91, 90, 91, 96, 97, 97, 92, 91, 92, 97, 98, 98, 93, 92, 93, 98, 99, 99, 94, 93, 100, 101, 102, 102, 103, 100, 103, 102, 104, 104, 105, 103, 105, 104, 106, 106, 107, 105, 107, 106, 108, 108, 109, 107, 101, 110, 111, 111, 102, 101, 102, 111, 112, 112, 104, 102, 104, 112, 113, 113, 106, 104, 106, 113, 114, 114, 108, 106, 110, 115, 116, 116, 111, 110, 111, 116, 117, 117, 112, 111, 112, 117, 118, 118, 113, 112, 113, 118, 119, 119, 114, 113, 115, 120, 121, 121, 116, 115, 116, 121, 122, 122, 117, 116, 117, 122, 123, 123, 118, 117, 118, 123, 124, 124, 119, 118, 125, 126, 127, 127, 128, 125, 128, 127, 129, 129, 130, 128, 130, 129, 131, 131, 132, 130, 132, 131, 133, 133, 134, 132, 126, 135, 136, 136, 127, 126, 127, 136, 137, 137, 129, 127, 129, 137, 138, 138, 131, 129, 131, 138, 139, 139, 133, 131, 135, 140, 141, 141, 136, 135, 136, 141, 142, 142, 137, 136, 137, 142, 143, 143, 138, 137, 138, 143, 144, 144, 139, 138, 140, 145, 146, 146, 141, 140, 141, 146, 147, 147, 142, 141, 142, 147, 148, 148, 143, 142, 143, 148, 149, 149, 144, 143, 150, 151, 152, 152, 153, 150, 153, 152, 154, 154, 155, 153, 155, 154, 156, 156, 157, 155, 157, 156, 158, 158, 159, 157, 151, 160, 161, 161, 152, 151, 152, 161, 162, 162, 154, 152, 154, 162, 163, 163, 156, 154, 156, 163, 164, 164, 158, 156, 160, 165, 166, 166, 161, 160, 161, 166, 167, 167, 162, 161, 162, 167, 168, 168, 163, 162, 163, 168, 169, 169, 164, 163, 165, 170, 171, 171, 166, 165, 166, 171, 172, 172, 167, 166, 167, 172, 173, 173, 168, 167, 168, 173, 174, 174, 169, 168, 175, 176, 177, 177, 178, 175, 178, 177, 179, 179, 180, 178, 180, 179, 181, 181, 182, 180, 182, 181, 183, 183, 184, 182, 176, 185, 186, 186, 177, 176, 177, 186, 187, 187, 179, 177, 179, 187, 188, 188, 181, 179, 181, 188, 189, 189, 183, 181, 185, 190, 191, 191, 186, 185, 186, 191, 192, 192, 187, 186, 187, 192, 193, 193, 188, 187, 188, 193, 194, 194, 189, 188, 190, 195, 196, 196, 191, 190, 191, 196, 197, 197, 192, 191, 192, 197, 198, 198, 193, 192, 193, 198, 199, 199, 194, 193, 200, 201, 202, 202, 203, 200, 203, 202, 204, 204, 205, 203, 205, 204, 206, 206, 207, 205, 207, 206, 208, 208, 209, 207, 201, 210, 211, 211, 202, 201, 202, 211, 212, 212, 204, 202, 204, 212, 213, 213, 206, 204, 206, 213, 214, 214, 208, 206, 210, 215, 216, 216, 211, 210, 211, 216, 217, 217, 212, 211, 212, 217, 218, 218, 213, 212, 213, 218, 219, 219, 214, 213, 215, 220, 221, 221, 216, 215, 216, 221, 222, 222, 217, 216, 217, 222, 223, 223, 218, 217, 218, 223, 224, 224, 219, 218, 225, 226, 227, 227, 228, 225, 228, 227, 229, 229, 230, 228, 230, 229, 231, 231, 232, 230, 232, 231, 233, 233, 234, 232, 226, 235, 236, 236, 227, 226, 227, 236, 237, 237, 229, 227, 229, 237, 238, 238, 231, 229, 231, 238, 239, 239, 233, 231, 235, 240, 241, 241, 236, 235, 236, 241, 242, 242, 237, 236, 237, 242, 243, 243, 238, 237, 238, 243, 244, 244, 239, 238, 240, 245, 246, 246, 241, 240, 241, 246, 247, 247, 242, 241, 242, 247, 248, 248, 243, 242, 243, 248, 249, 249, 244, 243, 250, 251, 252, 252, 253, 250, 253, 252, 254, 254, 255, 253, 255, 254, 256, 256, 257, 255, 257, 256, 258, 258, 259, 257, 251, 260, 261, 261, 252, 251, 252, 261, 262, 262, 254, 252, 254, 262, 263, 263, 256, 254, 256, 263, 264, 264, 258, 256, 260, 265, 266, 266, 261, 260, 261, 266, 267, 267, 262, 261, 262, 267, 268, 268, 263, 262, 263, 268, 269, 269, 264, 263, 265, 270, 271, 271, 266, 265, 266, 271, 272, 272, 267, 266, 267, 272, 273, 273, 268, 267, 268, 273, 274, 274, 269, 268, 275, 276, 277, 277, 278, 275, 278, 277, 279, 279, 280, 278, 280, 279, 281, 281, 282, 280, 282, 281, 283, 283, 284, 282, 276, 285, 286, 286, 277, 276, 277, 286, 287, 287, 279, 277, 279, 287, 288, 288, 281, 279, 281, 288, 289, 289, 283, 281, 285, 290, 291, 291, 286, 285, 286, 291, 292, 292, 287, 286, 287, 292, 293, 293, 288, 287, 288, 293, 294, 294, 289, 288, 290, 295, 296, 296, 291, 290, 291, 296, 297, 297, 292, 291, 292, 297, 298, 298, 293, 292, 293, 298, 299, 299, 294, 293, 300, 301, 302, 302, 303, 300, 303, 302, 304, 304, 305, 303, 305, 304, 306, 306, 307, 305, 307, 306, 308, 301, 309, 310, 310, 302, 301, 302, 310, 311, 311, 304, 302, 304, 311, 312, 312, 306, 304, 306, 312, 313, 309, 314, 315, 315, 310, 309, 310, 315, 316, 316, 311, 310, 311, 316, 317, 317, 312, 311, 312, 317, 318, 314, 319, 320, 320, 315, 314, 315, 320, 321, 321, 316, 315, 316, 321, 322, 322, 317, 316, 317, 322, 323, 324, 325, 326, 326, 327, 324, 327, 326, 328, 328, 329, 327, 329, 328, 330, 330, 331, 329, 331, 330, 332, 325, 333, 334, 334, 326, 325, 326, 334, 335, 335, 328, 326, 328, 335, 336, 336, 330, 328, 330, 336, 337, 333, 338, 339, 339, 334, 333, 334, 339, 340, 340, 335, 334, 335, 340, 341, 341, 336, 335, 336, 341, 342, 338, 343, 344, 344, 339, 338, 339, 344, 345, 345, 340, 339, 340, 345, 346, 346, 341, 340, 341, 346, 347, 348, 349, 350, 350, 351, 348, 351, 350, 352, 352, 353, 351, 353, 352, 354, 354, 355, 353, 355, 354, 356, 349, 357, 358, 358, 350, 349, 350, 358, 359, 359, 352, 350, 352, 359, 360, 360, 354, 352, 354, 360, 361, 357, 362, 363, 363, 358, 357, 358, 363, 364, 364, 359, 358, 359, 364, 365, 365, 360, 359, 360, 365, 366, 362, 367, 368, 368, 363, 362, 363, 368, 369, 369, 364, 363, 364, 369, 370, 370, 365, 364, 365, 370, 371, 372, 373, 374, 374, 375, 372, 375, 374, 376, 376, 377, 375, 377, 376, 378, 378, 379, 377, 379, 378, 380, 373, 381, 382, 382, 374, 373, 374, 382, 383, 383, 376, 374, 376, 383, 384, 384, 378, 376, 378, 384, 385, 381, 386, 387, 387, 382, 381, 382, 387, 388, 388, 383, 382, 383, 388, 389, 389, 384, 383, 384, 389, 390, 386, 391, 392, 392, 387, 386, 387, 392, 393, 393, 388, 387, 388, 393, 394, 394, 389, 388, 389, 394, 395, 396, 397, 398, 398, 399, 396, 399, 398, 400, 400, 401, 399, 401, 400, 402, 402, 403, 401, 403, 402, 404, 404, 405, 403, 397, 406, 407, 407, 398, 397, 398, 407, 408, 408, 400, 398, 400, 408, 409, 409, 402, 400, 402, 409, 410, 410, 404, 402, 406, 411, 412, 412, 407, 406, 407, 412, 413, 413, 408, 407, 408, 413, 414, 414, 409, 408, 409, 414, 415, 415, 410, 409, 411, 416, 417, 417, 412, 411, 412, 417, 418, 418, 413, 412, 413, 418, 419, 419, 414, 413, 414, 419, 420, 420, 415, 414, 421, 422, 423, 423, 424, 421, 424, 423, 425, 425, 426, 424, 426, 425, 427, 427, 428, 426, 428, 427, 429, 429, 430, 428, 422, 431, 432, 432, 423, 422, 423, 432, 433, 433, 425, 423, 425, 433, 434, 434, 427, 425, 427, 434, 435, 435, 429, 427, 431, 436, 437, 437, 432, 431, 432, 437, 438, 438, 433, 432, 433, 438, 439, 439, 434, 433, 434, 439, 440, 440, 435, 434, 436, 441, 442, 442, 437, 436, 437, 442, 443, 443, 438, 437, 438, 443, 444, 444, 439, 438, 439, 444, 445, 445, 440, 439, 446, 447, 448, 448, 449, 446, 449, 448, 450, 450, 451, 449, 451, 450, 452, 452, 453, 451, 453, 452, 454, 454, 455, 453, 447, 456, 457, 457, 448, 447, 448, 457, 458, 458, 450, 448, 450, 458, 459, 459, 452, 450, 452, 459, 460, 460, 454, 452, 456, 461, 462, 462, 457, 456, 457, 462, 463, 463, 458, 457, 458, 463, 464, 464, 459, 458, 459, 464, 465, 465, 460, 459, 461, 466, 467, 467, 462, 461, 462, 467, 468, 468, 463, 462, 463, 468, 469, 469, 464, 463, 464, 469, 470, 470, 465, 464, 471, 472, 473, 473, 474, 471, 474, 473, 475, 475, 476, 474, 476, 475, 477, 477, 478, 476, 478, 477, 479, 479, 480, 478, 472, 481, 482, 482, 473, 472, 473, 482, 483, 483, 475, 473, 475, 483, 484, 484, 477, 475, 477, 484, 485, 485, 479, 477, 481, 486, 487, 487, 482, 481, 482, 487, 488, 488, 483, 482, 483, 488, 489, 489, 484, 483, 484, 489, 490, 490, 485, 484, 486, 491, 492, 492, 487, 486, 487, 492, 493, 493, 488, 487, 488, 493, 494, 494, 489, 488, 489, 494, 495, 495, 490, 489, 496, 497, 498, 498, 499, 496, 499, 498, 500, 500, 501, 499, 501, 500, 502, 502, 503, 501, 503, 502, 504, 504, 505, 503, 497, 506, 507, 507, 498, 497, 498, 507, 508, 508, 500, 498, 500, 508, 509, 509, 502, 500, 502, 509, 510, 510, 504, 502, 506, 511, 512, 512, 507, 506, 507, 512, 513, 513, 508, 507, 508, 513, 514, 514, 509, 508, 509, 514, 515, 515, 510, 509, 511, 516, 517, 517, 512, 511, 512, 517, 518, 518, 513, 512, 513, 518, 519, 519, 514, 513, 514, 519, 520, 520, 515, 514, 521, 522, 523, 523, 524, 521, 524, 523, 525, 525, 526, 524, 526, 525, 527, 527, 528, 526, 528, 527, 529, 529, 530, 528, 522, 531, 532, 532, 523, 522, 523, 532, 533, 533, 525, 523, 525, 533, 534, 534, 527, 525, 527, 534, 535, 535, 529, 527, 531, 536, 537, 537, 532, 531, 532, 537, 538, 538, 533, 532, 533, 538, 539, 539, 534, 533, 534, 539, 540, 540, 535, 534, 536, 541, 542, 542, 537, 536, 537, 542, 543, 543, 538, 537, 538, 543, 544, 544, 539, 538, 539, 544, 545, 545, 540, 539, 546, 547, 548, 548, 549, 546, 549, 548, 550, 550, 551, 549, 551, 550, 552, 552, 553, 551, 553, 552, 554, 554, 555, 553, 547, 556, 557, 557, 548, 547, 548, 557, 558, 558, 550, 548, 550, 558, 559, 559, 552, 550, 552, 559, 560, 560, 554, 552, 556, 561, 562, 562, 557, 556, 557, 562, 563, 563, 558, 557, 558, 563, 564, 564, 559, 558, 559, 564, 565, 565, 560, 559, 561, 566, 567, 567, 562, 561, 562, 567, 568, 568, 563, 562, 563, 568, 569, 569, 564, 563, 564, 569, 570, 570, 565, 564, 571, 572, 573, 573, 574, 571, 574, 573, 575, 575, 576, 574, 576, 575, 577, 577, 578, 576, 578, 577, 579, 579, 580, 578, 572, 581, 582, 582, 573, 572, 573, 582, 583, 583, 575, 573, 575, 583, 584, 584, 577, 575, 577, 584, 585, 585, 579, 577, 581, 586, 587, 587, 582, 581, 582, 587, 588, 588, 583, 582, 583, 588, 589, 589, 584, 583, 584, 589, 590, 590, 585, 584, 586, 591, 592, 592, 587, 586, 587, 592, 593, 593, 588, 587, 588, 593, 594, 594, 589, 588, 589, 594, 595, 595, 590, 589, 596, 597, 598, 597, 596, 599, 599, 600, 597, 600, 599, 601, 601, 602, 600, 602, 601, 603, 603, 604, 602, 605, 596, 606, 596, 605, 607, 607, 599, 596, 599, 607, 608, 608, 601, 599, 601, 608, 609, 609, 603, 601, 610, 605, 611, 605, 610, 612, 612, 607, 605, 607, 612, 613, 613, 608, 607, 608, 613, 614, 614, 609, 608, 615, 610, 616, 610, 615, 617, 617, 612, 610, 612, 617, 618, 618, 613, 612, 613, 618, 619, 619, 614, 613, 620, 621, 622, 621, 620, 623, 623, 624, 621, 624, 623, 625, 625, 626, 624, 626, 625, 627, 627, 628, 626, 629, 620, 630, 620, 629, 631, 631, 623, 620, 623, 631, 632, 632, 625, 623, 625, 632, 633, 633, 627, 625, 634, 629, 635, 629, 634, 636, 636, 631, 629, 631, 636, 637, 637, 632, 631, 632, 637, 638, 638, 633, 632, 639, 634, 640, 634, 639, 641, 641, 636, 634, 636, 641, 642, 642, 637, 636, 637, 642, 643, 643, 638, 637, 644, 645, 646, 645, 644, 647, 647, 648, 645, 648, 647, 649, 649, 650, 648, 650, 649, 651, 651, 652, 650, 653, 644, 654, 644, 653, 655, 655, 647, 644, 647, 655, 656, 656, 649, 647, 649, 656, 657, 657, 651, 649, 658, 653, 659, 653, 658, 660, 660, 655, 653, 655, 660, 661, 661, 656, 655, 656, 661, 662, 662, 657, 656, 663, 658, 664, 658, 663, 665, 665, 660, 658, 660, 665, 666, 666, 661, 660, 661, 666, 667, 667, 662, 661, 668, 669, 670, 669, 668, 671, 671, 672, 669, 672, 671, 673, 673, 674, 672, 674, 673, 675, 675, 676, 674, 677, 668, 678, 668, 677, 679, 679, 671, 668, 671, 679, 680, 680, 673, 671, 673, 680, 681, 681, 675, 673, 682, 677, 683, 677, 682, 684, 684, 679, 677, 679, 684, 685, 685, 680, 679, 680, 685, 686, 686, 681, 680, 687, 682, 688, 682, 687, 689, 689, 684, 682, 684, 689, 690, 690, 685, 684, 685, 690, 691, 691, 686, 685, 692, 693, 694, 694, 695, 692, 695, 694, 696, 696, 697, 695, 697, 696, 698, 698, 699, 697, 699, 698, 700, 700, 701, 699, 693, 702, 703, 703, 694, 693, 694, 703, 704, 704, 696, 694, 696, 704, 705, 705, 698, 696, 698, 705, 706, 706, 700, 698, 702, 707, 708, 708, 703, 702, 703, 708, 709, 709, 704, 703, 704, 709, 710, 710, 705, 704, 705, 710, 711, 711, 706, 705, 707, 712, 713, 713, 708, 707, 708, 713, 714, 714, 709, 708, 709, 714, 715, 715, 710, 709, 710, 715, 716, 716, 711, 710, 717, 718, 719, 719, 720, 717, 720, 719, 721, 721, 722, 720, 722, 721, 723, 723, 724, 722, 724, 723, 725, 725, 726, 724, 718, 727, 728, 728, 719, 718, 719, 728, 729, 729, 721, 719, 721, 729, 730, 730, 723, 721, 723, 730, 731, 731, 725, 723, 727, 732, 733, 733, 728, 727, 728, 733, 734, 734, 729, 728, 729, 734, 735, 735, 730, 729, 730, 735, 736, 736, 731, 730, 732, 737, 738, 738, 733, 732, 733, 738, 739, 739, 734, 733, 734, 739, 740, 740, 735, 734, 735, 740, 741, 741, 736, 735, 742, 743, 744, 744, 745, 742, 745, 744, 746, 746, 747, 745, 747, 746, 748, 748, 749, 747, 749, 748, 750, 750, 751, 749, 743, 752, 753, 753, 744, 743, 744, 753, 754, 754, 746, 744, 746, 754, 755, 755, 748, 746, 748, 755, 756, 756, 750, 748, 752, 757, 758, 758, 753, 752, 753, 758, 759, 759, 754, 753, 754, 759, 760, 760, 755, 754, 755, 760, 761, 761, 756, 755, 757, 762, 763, 763, 758, 757, 758, 763, 764, 764, 759, 758, 759, 764, 765, 765, 760, 759, 760, 765, 766, 766, 761, 760, 767, 768, 769, 769, 770, 767, 770, 769, 771, 771, 772, 770, 772, 771, 773, 773, 774, 772, 774, 773, 775, 775, 776, 774, 768, 777, 778, 778, 769, 768, 769, 778, 779, 779, 771, 769, 771, 779, 780, 780, 773, 771, 773, 780, 781, 781, 775, 773, 777, 782, 783, 783, 778, 777, 778, 783, 784, 784, 779, 778, 779, 784, 785, 785, 780, 779, 780, 785, 786, 786, 781, 780, 782, 787, 788, 788, 783, 782, 783, 788, 789, 789, 784, 783, 784, 789, 790, 790, 785, 784, 785, 790, 791, 791, 786, 785]
    };

    function Teapot(options) {
      this.size = 1;
      Teapot.__super__.constructor.call(this, options);
    }

    Teapot.prototype.init = function(verts, colors, texes, norms, indices) {
      var max, scale, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;

      max = null;
      _ref = teapot.vertices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        if (max === null || v > max) {
          max = v;
        }
      }
      scale = this.size / max;
      _ref1 = teapot.vertices;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        v = _ref1[_j];
        verts.push(v * scale);
      }
      _ref2 = teapot.normals;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        v = _ref2[_k];
        norms.push(v);
      }
      _ref3 = teapot.textureCoords;
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        v = _ref3[_l];
        texes.push(v);
      }
      _ref4 = teapot.indices;
      _results = [];
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        v = _ref4[_m];
        _results.push(indices.push(v));
      }
      return _results;
    };

    return Teapot;

  })(Jax.Mesh.Triangles);

}).call(this);
/*
A torus is a donut-shaped mesh.

Options:
  * innerRadius, default: 0.6
  * outerRadius, default: 1.8
  * sides, default: 64
  * rings, default: 128
  
Examples:
    new Jax.Mesh.Torus()
    new Jax.Mesh.Torus
      innerRadius: 1.0
      outerRadius: 3.0
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Mesh.Torus = (function(_super) {
    __extends(Torus, _super);

    function Torus(options) {
      this.innerRadius = 0.6;
      this.outerRadius = 1.8;
      this.sides = 16;
      this.rings = 32;
      Torus.__super__.constructor.call(this, options);
    }

    Torus.prototype.init = function(vertices, colors, texes, normals) {
      var cosphi, costheta, costheta1, dist, i, innerRadius, j, outerRadius, phi, ringdelta, rings, sidedelta, sides, sinphi, sintheta, sintheta1, theta, theta1, _i, _j, _ref, _results;

      innerRadius = this.innerRadius;
      outerRadius = this.outerRadius;
      sides = this.sides;
      rings = this.rings;
      sidedelta = 2 * Math.PI / sides;
      ringdelta = 2 * Math.PI / rings;
      theta = sintheta = 0;
      costheta = 1;
      _results = [];
      for (i = _i = _ref = rings - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
        theta1 = theta + ringdelta;
        costheta1 = Math.cos(theta1);
        sintheta1 = Math.sin(theta1);
        phi = 0;
        for (j = _j = sides; sides <= 0 ? _j <= 0 : _j >= 0; j = sides <= 0 ? ++_j : --_j) {
          phi = phi + sidedelta;
          cosphi = Math.cos(phi);
          sinphi = Math.sin(phi);
          dist = outerRadius + (innerRadius * cosphi);
          normals.push(costheta1 * cosphi, -sintheta1 * cosphi, sinphi);
          vertices.push(costheta1 * dist, -sintheta1 * dist, innerRadius * sinphi);
          normals.push(costheta * cosphi, -sintheta * cosphi, sinphi);
          vertices.push(costheta * dist, -sintheta * dist, innerRadius * sinphi);
        }
        theta = theta1;
        costheta = costheta1;
        _results.push(sintheta = sintheta1);
      }
      return _results;
    };

    return Torus;

  })(Jax.Mesh.TriangleStrip);

}).call(this);
(function() {


}).call(this);
/*

A visual frames per second counter that can be added to the world like any 
other model:

    @world.addObject new Jax.Framerate

Several options can be passed:

    width  - the width in pixels, defaults to 128
    height - the height in pixels, defaults to 64
    font   - the font, defaults to "10pt Arial"
    ema    - a number, or false (see below), defaults to 30
    left   - the left pixel coordinate of the counter
    top    - the top pixel coordinate of the counter

After instantiation, the counter can be manipulated just like any other Jax 
model (e.g. `new Jax.Framerate().camera.getPosition()`) except that it uses 
pixel coordinates instead of world units and is displayed with an 
orthographic (essentially 2D) projection.

The framerate is capable of two modes of operation:

* EMA - calculates an exponential moving average of the framerate based on 
  the `ema` option, producing a smooth line on the graph, allowing you to 
  visually "skip over" temporary disruptions such as garbage collection, and 
  giving you the "big picture".
* Instant - if the `ema` option is `false`, no moving averages will be 
  calculated, allowing you to view every tiny disruption in framerate. You 
  can use this to home in on common wasteful coding practices such as 
  allocating too many temporary objects. This sort of optimization will 
  produce a smoother-flowing application with fewer and shorter pauses as 
  the JavaScript garbage collector is run.

You can also get the current framerate any time after the framerate has been
added to the world by calling `fps`.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Framerate = (function(_super) {
    var clamp, drawPath;

    __extends(Framerate, _super);

    drawPath = function(ctx, points, height, current) {
      var i, _i;

      ctx.beginPath();
      ctx.moveTo(0, clamp(height - points[0] * height, 0, height));
      for (i = _i = 0; 0 <= current ? _i <= current : _i >= current; i = 0 <= current ? ++_i : --_i) {
        ctx.lineTo(i, clamp(height - points[i] * height, 0, height));
      }
      ctx.stroke();
      return ctx.closePath();
    };

    clamp = function(val, min, max) {
      if (val < min) {
        return min;
      } else if (val > max) {
        return max;
      } else {
        return val;
      }
    };

    function Framerate(options) {
      if (options == null) {
        options = {};
      }
      options.stroke || (options.stroke = "rgba(0, 0, 0, 255)");
      options.fill || (options.fill = "rgba(255, 0, 255, 255)");
      options.width || (options.width = 128);
      options.height || (options.height = 64);
      options.position || (options.position = [options.width / 2, options.height / 2, -0.1001]);
      options.castShadow || (options.castShadow = false);
      options.receiveShadow || (options.receiveShadow = false);
      options.illuminated || (options.illuminated = false);
      options.fontHeight || (options.fontHeight = 12);
      Framerate.__super__.constructor.call(this, options);
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.font = this.font || (this.font = "" + this.fontHeight + "px Arial");
      this.history = [];
      this.current = -1;
      this.max_fps = 100;
      if (this.ema === void 0) {
        this.ema = 30;
      }
      this.ema_exponent = 2 / (this.ema + 1);
      this._max_data_width = this.width / 3;
      this._fps_label_left = 0;
      this._one_quarter_height = this.height * 0.25;
      this._two_quarter_height = this.height * 0.5;
      this._three_quarter_height = this.height * 0.75;
      this._12_pcnt_height = this.height * 0.12;
      this._marker_offset = this.width - this._12_pcnt_height;
      this._max_queue_size = Math.round(this.width - this._12_pcnt_height);
      this.glTex = new Jax.Texture({
        width: this.width,
        height: this.height,
        mag_filter: GL_LINEAR,
        min_filter: GL_LINEAR,
        flip_y: true,
        wrap_s: GL_CLAMP_TO_EDGE,
        wrap_t: GL_CLAMP_TO_EDGE
      });
      this.glTex.image = this.canvas;
      this.mesh = new Jax.Mesh.Quad({
        width: this.width,
        height: this.height,
        color: [1, 1, 1, 1],
        transparent: true,
        material: new Jax.Material.Custom({
          layers: [
            {
              type: 'Position'
            }, {
              type: 'VertexColor'
            }, {
              type: 'Texture',
              instance: this.glTex
            }
          ]
        })
      });
    }

    Framerate.prototype.render = function(context, material) {
      var curEMA, curPcnt, fpsPcnt, i, stack, x, y, _i, _ref;

      this.fps = context.getFramesPerSecond();
      fpsPcnt = this.fps / this.max_fps;
      if (this.fps === Number.POSITIVE_INFINITY) {
        this.fps = fpsPcnt = 0;
      }
      if (this.current === this._max_queue_size) {
        for (i = _i = 0, _ref = this.current; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          this.history[i] = this.history[i + 1];
        }
      } else {
        this.current++;
      }
      if (this.ema) {
        if (this.current === 0) {
          curEMA = 0;
        } else {
          curEMA = this.history[this.current - 1];
        }
        this.history[this.current] = curPcnt = (fpsPcnt * this.ema_exponent) + (curEMA * (1 - this.ema_exponent));
      } else {
        this.history[this.current] = curPcnt = fpsPcnt;
      }
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!this.ema || this.current >= this.ema) {
        this.ctx.strokeStyle = this.fill;
        drawPath(this.ctx, this.history, this.height, this.current);
        this.ctx.textBaseline = "center";
        x = this.width - this.fontHeight * 4.25;
        y = clamp(this.height - (curPcnt * this.height + 5), this.fontHeight, this.height);
        this.ctx.strokeStyle = this.stroke;
        this.ctx.strokeText("" + (Math.round(this.fps)) + " FPS", x, y);
        this.ctx.fillStyle = this.fill;
        this.ctx.fillText("" + (Math.round(this.fps)) + " FPS", x, y);
      } else {
        this.ctx.strokeStyle = this.stroke;
        this.ctx.fillText("Gathering data...", 10, this.height / 2, this.width - 20);
        this.ctx.fillStyle = "rgba(128, 128, 128, 255)";
        this.ctx.fillText("Gathering data...", 10, this.height / 2, this.width - 20);
      }
      this.glTex.refresh(context);
      if (!this.ortho) {
        this.camera.ortho({
          left: 0,
          right: context.canvas.width,
          bottom: 0,
          top: context.canvas.height
        });
        this.ortho = this.camera.getProjectionMatrix();
        this.identity = mat4.identity(mat4.create());
      }
      stack = context.matrix_stack;
      stack.push();
      stack.loadProjectionMatrix(this.ortho);
      stack.loadViewMatrix(this.identity);
      stack.multModelMatrix(this.camera.getTransformationMatrix());
      this.mesh.render(context, this, material);
      return stack.pop();
    };

    return Framerate;

  })(Jax.Model);

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {
  var Parser;

  Parser = (function() {
    Parser.prototype.findVariables = function() {
      var match, offsetEnd, offsetStart, rx, src, variables;

      variables = [];
      rx = /(shared[\s\t\n]+|)(varying|uniform|attribute)[\s\t\n]+(\w+)[\s\t\n]+(((\w+)([\s\t\n]*,[\s\t\n]*|))+)[\s\t\n]*;/;
      src = this.src;
      while (match = rx.exec(src)) {
        offsetStart = match.index;
        offsetEnd = match.index + match[0].length;
        variables.push({
          shared: !!match[1],
          qualifier: match[2],
          type: match[3],
          names: match[4].split(/, ?/),
          match: match
        });
        src = src.slice(0, offsetStart) + src.slice(offsetEnd);
      }
      return variables;
    };

    Parser.prototype.findFunctions = function() {
      var func, functions, match, offsetEnd, offsetStart, rx, signature, src;

      functions = [];
      rx = /(shared[\s\t\n]+|)(\w+)[\s\t\n]+(\w+)[\s\t\n]*\([\s\t\n]*[\s\t\n]*(.*?)[\s\t\n]*\)[\s\t\n]*{/;
      src = this.src;
      while (match = rx.exec(src)) {
        offsetStart = match.index;
        offsetEnd = match.index + match[0].length;
        signature = match[4];
        offsetEnd += Jax.Util.scan(src.slice(offsetEnd), '}', '{').length + 1;
        func = src.slice(offsetStart, offsetEnd);
        src = src.slice(0, offsetStart) + src.slice(offsetEnd);
        functions.push({
          shared: !!match[1],
          signature: signature,
          full: func,
          type: match[2],
          name: match[3]
        });
      }
      return functions;
    };

    function Parser(src, mangler) {
      this.src = src;
      this.mangler = mangler;
    }

    Parser.prototype.getMangledMain = function() {
      var mangle, mangles, _i, _len;

      mangles = this.findFunctions();
      for (_i = 0, _len = mangles.length; _i < _len; _i++) {
        mangle = mangles[_i];
        if (mangle.name === 'main') {
          mangle.mangledName = mangle.name + this.mangler;
          return mangle;
        }
      }
      return null;
    };

    Parser.prototype.map = function() {
      var mangle, mangles, map, name, _i, _j, _len, _len1, _ref;

      map = {};
      mangles = this.findVariables();
      for (_i = 0, _len = mangles.length; _i < _len; _i++) {
        mangle = mangles[_i];
        _ref = mangle.names;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          name = _ref[_j];
          if (mangle.shared) {
            map[name] = name;
          } else {
            map[name] = name + this.mangler;
          }
        }
      }
      return map;
    };

    Parser.prototype.mangle = function(currentSrc) {
      var mangle, mangledFunc, mangledName, mangledNames, mangledSignature, mangles, match, name, src, variable, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1;

      src = this.src;
      mangles = this.findVariables();
      for (_i = 0, _len = mangles.length; _i < _len; _i++) {
        mangle = mangles[_i];
        mangledNames = [];
        _ref = mangle.names;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          name = _ref[_j];
          if (mangle.shared) {
            if (new RegExp("" + name + "(,|;)").test(currentSrc)) {
              continue;
            }
            mangledNames.push(name);
          } else {
            mangledNames.push(name + this.mangler);
          }
        }
        if (mangledNames.length > 0) {
          mangledNames = mangledNames.join(', ');
          variable = [mangle.qualifier, mangle.type, mangledNames].join(' ');
          variable += ';';
        } else {
          variable = "";
        }
        src = src.replace(mangle.match[0], variable);
        if (mangle.shared) {
          continue;
        }
        _ref1 = mangle.names;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          name = _ref1[_k];
          mangledName = name + this.mangler;
          while (match = new RegExp("(^|\\W)" + name + "(\\W|$)").exec(src)) {
            src = src.replace(match[0], match[1] + mangledName + match[2]);
          }
        }
      }
      mangles = this.findFunctions();
      for (_l = 0, _len3 = mangles.length; _l < _len3; _l++) {
        mangle = mangles[_l];
        if (mangle.shared) {
          mangledName = mangle.name;
        } else {
          mangledName = mangle.name + this.mangler;
        }
        mangledSignature = mangle.signature.replace(mangle.name, mangledName);
        mangledFunc = mangle.full.replace(mangle.signature, mangledSignature);
        mangledFunc = mangledFunc.replace(/shared[\s\t\n]+/, '');
        src = src.replace(mangle.full, mangledFunc);
        if (mangle.shared) {
          continue;
        }
        while (match = new RegExp("(^|\\W)" + mangle.name + "(\\W|$)").exec(src)) {
          src = src.replace(match[0], match[1] + mangledName + match[2]);
        }
      }
      return src;
    };

    return Parser;

  })();

  Jax.Shader = (function() {
    Shader.include(Jax.EventEmitter);

    function Shader(name) {
      this.name = name != null ? name : "generic";
      this.id = Jax.guid();
      this.variables = {};
      this.sources = [];
      this.main = new Array();
    }

    Shader.prototype.processExportsAndImports = function(code) {
      var definitions, exp, exportID, exports, expr, imp, match, offset, offsetEnd, offsetStart, ofs, remainder, replacement, rx, value, _i, _j, _k, _len, _len1, _ref;

      exports = [];
      rx = /export[\s\t\n]*\(/;
      offset = 0;
      exportID = 0;
      while (match = rx.exec(code.slice(offset))) {
        offsetStart = match.index + offset;
        offsetEnd = offsetStart + match[0].length;
        remainder = Jax.Util.scan(code.slice(offsetEnd));
        offsetEnd += remainder.length + 1;
        exp = /^(.*?)[\s\t\n]*,[\s\t\n]*(.*?)[\s\t\n]*,[\s\t\n]*(.*)$/.exec(remainder);
        exports.push({
          fullMatch: code.slice(offsetStart, offsetEnd),
          type: exp[1],
          name: exp[2],
          mangledName: "export_" + exp[2] + exportID++,
          value: exp[3],
          offsetStart: offsetStart,
          offsetEnd: offsetEnd
        });
        offset = offsetEnd;
      }
      rx = /import[\s\t\n]*\(/;
      for (offset = _i = _ref = code.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; offset = _ref <= 0 ? ++_i : --_i) {
        if (match = rx.exec(code.slice(offset))) {
          offsetStart = match.index + offset;
          offsetEnd = offsetStart + match[0].length;
          remainder = Jax.Util.scan(code.slice(offsetEnd));
          offsetEnd += remainder.length + 1;
          if (code[offsetEnd] === ';') {
            offsetEnd++;
          }
          imp = /^(.*?)[\s\t\n]*,[\s\t\n]*(.*)$/.exec(remainder);
          imp = {
            fullMatch: code.slice(offsetStart, offsetEnd),
            name: imp[1],
            value: imp[2],
            offsetStart: offsetStart,
            offsetEnd: offsetEnd
          };
          replacement = "";
          for (_j = 0, _len = exports.length; _j < _len; _j++) {
            exp = exports[_j];
            if (exp.name === imp.name && exp.offsetStart < imp.offsetStart) {
              value = imp.value.replace(new RegExp(imp.name, 'g'), exp.mangledName);
              replacement += value + ";\n";
            }
          }
          code = code.replace(imp.fullMatch, replacement);
        }
      }
      definitions = "";
      for (_k = 0, _len1 = exports.length; _k < _len1; _k++) {
        exp = exports[_k];
        definitions += "" + exp.type + " " + exp.mangledName + ";\n";
        expr = exp.mangledName + " = " + exp.value;
        code = code.replace(exp.fullMatch, expr);
      }
      if (match = /precision.*?\n/.exec(code)) {
        ofs = match.index + match[0].length;
        code = code.slice(0, ofs) + definitions + code.slice(ofs);
      } else {
        code = definitions + code;
      }
      return code;
    };

    Shader.prototype.toLines = function() {
      return this.toString().split('\n');
    };

    Shader.prototype.toString = function() {
      var body, cache, cacheCode, cacheName, cacheType, caches, definitions, i, line, main, mangledMain, match, name, offsetEnd, offsetStart, ofs, rest, result, src, _i, _j, _len, _len1, _ref, _ref1;

      main = new Array();
      _ref = this.main;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        main.push(line);
      }
      result = "";
      _ref1 = this.sources;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        src = _ref1[i];
        result += src.mangle(result);
        result += "\n";
        if (mangledMain = src.getMangledMain()) {
          main.push(mangledMain.mangledName + "();");
        }
      }
      body = this.processExportsAndImports(result + ("void main(void) {\n  " + (main.join('\n  ')) + "\n}"));
      caches = {};
      while (match = /cache[\s\t\n]*\([\s\t\n]*([^,]+?)[\s\t\n]*,[\s\t\n]*(.*?)[\s\t\n]*\)[\s\t\n]*\{/.exec(body)) {
        cacheType = match[1].trim();
        cacheName = match[2].trim();
        offsetStart = match.index;
        offsetEnd = offsetStart + match[0].length;
        rest = Jax.Util.scan(body.slice(offsetEnd), '}', '{');
        offsetEnd += rest.length + 1;
        cache = body.slice(offsetStart, offsetEnd);
        cacheCode = "";
        if (caches[cacheName]) {
          if (caches[cacheName].type !== cacheType) {
            throw new Error("Cached variable " + cacheName + " has a conflicting type: " + cacheType + " (already defined as a " + caches[cacheName].type + ")");
          }
        } else {
          caches[cacheName] = {
            name: cacheName,
            type: cacheType
          };
          cacheCode += rest;
        }
        body = body.slice(0, offsetStart) + cacheCode + body.slice(offsetEnd);
      }
      definitions = "";
      for (name in caches) {
        cache = caches[name];
        definitions += cache.type + " " + cache.name + ";\n";
      }
      if (match = /precision.*?\n/.exec(body)) {
        ofs = match.index + match[0].length;
        body = body.slice(0, ofs) + definitions + body.slice(ofs);
      } else {
        body = definitions + body;
      }
      if (body.indexOf('precision') === -1) {
        return "precision mediump float;\n\n" + body;
      } else {
        return body;
      }
    };

    Shader.prototype.mergeVariables = function(parser, map) {
      var definition, name, _i, _j, _len, _len1, _ref, _ref1;

      _ref = parser.findVariables();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        definition = _ref[_i];
        _ref1 = definition.names;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          name = _ref1[_j];
          name = map[name];
          this.variables[name] = {
            name: name,
            qualifier: definition.qualifier,
            type: definition.type
          };
        }
      }
      return this.variables;
    };

    Shader.prototype.insert = function(src, mangler, index) {
      var map, parser;

      this.sources.splice(index, 0, parser = new Parser(src, mangler));
      map = parser.map();
      this.mergeVariables(parser, map);
      this.fireEvent('changed');
      return map;
    };

    Shader.prototype.append = function(src, mangler) {
      if (mangler == null) {
        mangler = Jax.guid();
      }
      return this.insert(src, mangler, this.sources.length);
    };

    return Shader;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Jax.Shader.CompileError = (function(_super) {
    __extends(CompileError, _super);

    function CompileError(message) {
      CompileError.__super__.constructor.call(this);
      this.message = message;
    }

    return CompileError;

  })(Jax.Error);

  Jax.Shader.Program = (function() {
    var popularity, shallowClone;

    popularity = {};

    Program.resetPopularities = function() {
      return popularity = {};
    };

    Program.getPopularities = function() {
      return popularity;
    };

    shallowClone = function(obj) {
      var clone, k, v;

      clone = {};
      for (k in obj) {
        v = obj[k];
        clone[k] = v;
      }
      return clone;
    };

    function Program(name) {
      this.name = name != null ? name : "generic";
      this.invalidate = __bind(this.invalidate, this);
      this.fragmentShaderChanged = __bind(this.fragmentShaderChanged, this);
      this.vertexShaderChanged = __bind(this.vertexShaderChanged, this);
      this._contexts = {};
      this._guid = Jax.guid();
      this._dislikedAttributes = [];
      this.variables = {
        attributes: {},
        uniforms: {},
        varyings: {}
      };
      this.vertex = new Jax.Shader("" + this.name + "-v");
      this.vertex.addEventListener('changed', this.vertexShaderChanged);
      this.fragment = new Jax.Shader("" + this.name + "-f");
      this.fragment.addEventListener('changed', this.fragmentShaderChanged);
      if (this.vertex.main.length === 0) {
        this.vertex.main.push("gl_Position = vec4(1.0, 1.0, 1.0, 1.0);");
      }
      if (this.fragment.main.length === 0) {
        this.fragment.main.push("gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);");
      }
    }

    /*
    Sets the shader's variables according to the name/value pairs which appear
    in the given `assigns` object. An error will be raised if any named 
    variable does not exist. If the program has not already been compiled and 
    activated, an error is raised.
    */


    Program.prototype.set = function(context, assigns) {
      var attribute, descriptor, gl, id, mustRebind, name, uniform, value, _ref, _ref1;

      gl = context.gl;
      mustRebind = false;
      _ref = this.variables.attributes;
      for (name in _ref) {
        attribute = _ref[name];
        if ((value = assigns[name]) !== void 0) {
          this.setAttribute(context, attribute, value);
        } else {
          id = context.id;
          if (this.isAttributeEnabled(context, attribute.location[id])) {
            if (attribute.location[id] === 0 && this._dislikedAttributes.indexOf(name) === -1) {
              this._dislikedAttributes.push(name);
              mustRebind = true;
            }
            this.disableAttribute(context, attribute.location[id], attribute.name);
          }
        }
        attribute.value = value;
      }
      if (mustRebind) {
        descriptor = this.getDescriptor(context);
        this.popularize();
        this.relink(descriptor);
        this.bind(context);
        return this.set(context, assigns);
      }
      this.__textureIndex = 0;
      _ref1 = this.variables.uniforms;
      for (name in _ref1) {
        uniform = _ref1[name];
        value = assigns[name];
        if (value === void 0) {
          continue;
        }
        if (value != null ? value.toVec4 : void 0) {
          value = value.toVec4();
        }
        this.setUniform(context, uniform, value);
        uniform.value = value;
      }
      return true;
    };

    Program.prototype.setAttribute = function(context, variable, value) {
      var id;

      id = context.id;
      if (!this.isAttributeEnabled(context, variable.location[id])) {
        this.enableAttribute(context, variable.location[id], variable.name);
      }
      value.bind(context);
      return context.gl.vertexAttribPointer(variable.location[id], value.itemSize, value.dataType || GL_FLOAT, false, 0, value.offset || 0);
    };

    Program.prototype.setUniform = function(context, variable, value) {
      var gl, id;

      gl = context.gl;
      id = context.id;
      switch (variable.type) {
        case 'float':
          return gl.uniform1f(variable.location[id], value);
        case 'bool':
        case 'int':
          return gl.uniform1i(variable.location[id], value);
        case 'vec2':
          return gl.uniform2fv(variable.location[id], value);
        case 'vec3':
          return gl.uniform3fv(variable.location[id], value);
        case 'vec4':
          return gl.uniform4fv(variable.location[id], value);
        case 'bvec2':
        case 'ivec2':
          return gl.uniform2iv(variable.location[id], value);
        case 'bvec3':
        case 'ivec3':
          return gl.uniform3iv(variable.location[id], value);
        case 'bvec4':
        case 'ivec4':
          return gl.uniform4iv(variable.location[id], value);
        case 'mat2':
          return gl.uniformMatrix2fv(variable.location[id], false, value);
        case 'mat3':
          return gl.uniformMatrix3fv(variable.location[id], false, value);
        case 'mat4':
          return gl.uniformMatrix4fv(variable.location[id], false, value);
        case 'sampler2D':
        case 'samplerCube':
          if (!(value instanceof Jax.Texture) || value.ready()) {
            gl.activeTexture(GL_TEXTURE0 + this.__textureIndex);
            if (!value.isValid(context)) {
              value.refresh(context);
            }
            gl.bindTexture(value.options.target, value.getHandle(context));
            return gl.uniform1i(variable.location[id], value = this.__textureIndex++);
          }
          break;
        default:
          throw new Error("Unexpected variable type: " + variable.type);
      }
    };

    Program.prototype.insert = function(vsrc, fsrc, index) {
      var fmap, k, mangler, map, v, vmap;

      mangler = Jax.guid();
      map = {};
      vmap = this.vertex.insert(vsrc, mangler, index);
      fmap = this.fragment.insert(fsrc, mangler, index);
      for (k in fmap) {
        v = fmap[k];
        map[k] = v;
      }
      for (k in vmap) {
        v = vmap[k];
        map[k] = v;
      }
      return map;
    };

    Program.prototype.bindAttributeLocations = function(descriptor) {
      var gl, id, name, nextAvailableLocation, variable, variables, _i, _len,
        _this = this;

      gl = descriptor.context.gl;
      variables = (function() {
        var _ref, _results;

        _ref = this.variables.attributes;
        _results = [];
        for (name in _ref) {
          variable = _ref[name];
          _results.push(variable);
        }
        return _results;
      }).call(this);
      variables.sort(function(a, b) {
        var aarr, barr, da, db, s;

        if ((da = _this._dislikedAttributes.indexOf(a.name)) !== (db = _this._dislikedAttributes.indexOf(b.name))) {
          if (da === -1) {
            return -1;
          } else {
            return 1;
          }
        }
        if ((barr = popularity[b.name]) && (aarr = popularity[a.name])) {
          if ((s = barr.length - aarr.length) !== 0) {
            return s;
          }
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
      nextAvailableLocation = 0;
      id = descriptor.context.id;
      for (_i = 0, _len = variables.length; _i < _len; _i++) {
        variable = variables[_i];
        variable.location || (variable.location = {});
        variable.location[id] = nextAvailableLocation;
        gl.bindAttribLocation(descriptor.glProgram, nextAvailableLocation, variable.name);
        nextAvailableLocation += (function() {
          switch (variable.type) {
            case 'mat2':
              return 2;
            case 'mat3':
              return 3;
            case 'mat4':
              return 4;
            default:
              return 1;
          }
        })();
      }
      return true;
    };

    Program.prototype.enableAllAttributes = function(descriptor) {
      var id, name, variable, _ref;

      id = descriptor.context.id;
      _ref = this.variables.attributes;
      for (name in _ref) {
        variable = _ref[name];
        this.enableAttribute(descriptor.context, variable.location[id], name);
      }
      return true;
    };

    Program.prototype.enableAttribute = function(context, location, name) {
      context._enabledAttributes[location] = 1;
      return context.gl.enableVertexAttribArray(location);
    };

    Program.prototype.disableAttribute = function(context, location, name) {
      context._enabledAttributes[location] = 0;
      return context.gl.disableVertexAttribArray(location);
    };

    Program.prototype.isAttributeEnabled = function(context, location) {
      return context._enabledAttributes[location] === 1;
    };

    Program.prototype.getUniformLocations = function(descriptor) {
      var gl, id, name, program, variable, _ref;

      gl = descriptor.context.gl;
      program = this.getGLProgram(descriptor.context);
      id = descriptor.context.id;
      _ref = this.variables.uniforms;
      for (name in _ref) {
        variable = _ref[name];
        variable.location || (variable.location = {});
        variable.location[id] = gl.getUniformLocation(program, variable.name);
        if (variable.location[id] === null) {
          delete this.variables.uniforms[name];
        }
      }
      return true;
    };

    Program.prototype.relink = function(descriptor) {
      var gl;

      gl = descriptor.context.gl;
      this.bindAttributeLocations(descriptor);
      gl.linkProgram(descriptor.glProgram);
      this.enableAllAttributes(descriptor);
      return this.getUniformLocations(descriptor);
    };

    Program.prototype.compileShader = function(descriptor, type, jaxShader, glShader) {
      var backtrace, gl, info, source;

      gl = descriptor.context.gl;
      info = this.getShaderContext(descriptor, type);
      source = new EJS({
        text: jaxShader.toString()
      }).render(info);
      gl.shaderSource(glShader, source);
      gl.compileShader(glShader);
      if (!gl.getShaderParameter(glShader, GL_COMPILE_STATUS)) {
        backtrace = this.buildBacktrace(gl, glShader, source.split(/\n/));
        throw new Jax.Shader.CompileError("Shader " + jaxShader.name + " failed to compile\n\n" + (backtrace.join("\n")));
      }
      return glShader;
    };

    Program.prototype.compileShaders = function(descriptor) {
      var context, gl, glFragment, glVertex;

      context = descriptor.context, glVertex = descriptor.glVertex, glFragment = descriptor.glFragment;
      gl = context.gl;
      this.compileShader(descriptor, 'vertex', this.vertex, glVertex);
      this.compileShader(descriptor, 'fragment', this.fragment, glFragment);
      gl.attachShader(descriptor.glProgram, descriptor.glVertex);
      return gl.attachShader(descriptor.glProgram, descriptor.glFragment);
    };

    Program.prototype.compileProgram = function(descriptor) {
      var gl;

      gl = descriptor.context.gl;
      descriptor.glProgram || (descriptor.glProgram = gl.createProgram());
      descriptor.glVertex || (descriptor.glVertex = gl.createShader(GL_VERTEX_SHADER));
      descriptor.glFragment || (descriptor.glFragment = gl.createShader(GL_FRAGMENT_SHADER));
      this.compileShaders(descriptor);
      this.relink(descriptor);
      if (!gl.getProgramParameter(descriptor.glProgram, GL_LINK_STATUS)) {
        throw new Error("Could not initialize shader!\n\n" + gl.getProgramInfoLog(descriptor.glProgram));
      }
    };

    Program.prototype.bind = function(context) {
      var descriptor, glProgram;

      descriptor = this.getDescriptor(context);
      if (!descriptor.valid) {
        this.validate(context);
      }
      context = descriptor.context, glProgram = descriptor.glProgram;
      if (context._currentProgram !== glProgram) {
        context.gl.useProgram(glProgram);
        return context._currentProgram = glProgram;
      }
    };

    Program.prototype.getGLProgram = function(context) {
      return this.getDescriptor(context).glProgram;
    };

    Program.prototype.vertexShaderChanged = function() {
      this.invalidate();
      return this.mergeVariables(this.vertex);
    };

    Program.prototype.fragmentShaderChanged = function() {
      this.invalidate();
      return this.mergeVariables(this.fragment);
    };

    Program.prototype.popularize = function() {
      var ary, index, name, variable, _ref;

      for (name in popularity) {
        ary = popularity[name];
        if ((index = ary.indexOf(this._guid)) !== -1) {
          ary.splice(ary.indexOf(this._guid), 1);
        }
      }
      _ref = this.variables.attributes;
      for (name in _ref) {
        variable = _ref[name];
        ary = popularity[name] || (popularity[name] = []);
        if (this._dislikedAttributes.indexOf(name) === -1) {
          ary.push(this._guid);
        }
      }
      return true;
    };

    Program.prototype.mergeVariables = function(shader) {
      var clone, name, variable, _ref;

      _ref = shader.variables;
      for (name in _ref) {
        variable = _ref[name];
        clone = shallowClone(variable);
        switch (variable.qualifier) {
          case 'attribute':
            this.variables.attributes[name] = clone;
            break;
          case 'varying':
            this.variables.varyings[name] = clone;
            break;
          case 'uniform':
            this.variables.uniforms[name] = clone;
            break;
          default:
            throw new Error("Unexpected qualifier: " + variable.qualifier);
        }
      }
      this.popularize();
      return this.variables;
    };

    Program.prototype.validate = function(context) {
      var descriptor;

      descriptor = this.getDescriptor(context);
      this.compileProgram(descriptor);
      context._attributesEnabled || (context._attributesEnabled = {});
      return descriptor.valid = true;
    };

    Program.prototype.getDescriptor = function(context) {
      var descriptor, maxAttrs;

      if (!(descriptor = this._contexts[context.id])) {
        descriptor = this._contexts[context.id] = {
          valid: false,
          context: context
        };
        maxAttrs = this.getShaderContext(descriptor, 'vertex').maxVertexAttribs;
        context._enabledAttributes || (context._enabledAttributes = new Uint8Array(maxAttrs));
      }
      return descriptor;
    };

    Program.prototype.isValid = function(context) {
      var _ref;

      return (_ref = this._contexts[context.id]) != null ? _ref.valid : void 0;
    };

    Program.prototype.invalidate = function(context) {
      var descriptor, id, _ref, _ref1, _results;

      if (context == null) {
        context = null;
      }
      if (context) {
        return (_ref = this._contexts[context.id]) != null ? _ref.valid = false : void 0;
      } else {
        _ref1 = this._contexts;
        _results = [];
        for (id in _ref1) {
          descriptor = _ref1[id];
          _results.push(this.invalidate(descriptor.context));
        }
        return _results;
      }
    };

    Program.prototype.getShaderContext = function(descriptor, shaderType) {
      var _base;

      descriptor.shaderContexts || (descriptor.shaderContexts = {});
      return (_base = descriptor.shaderContexts)[shaderType] || (_base[shaderType] = this.newShaderContext(descriptor, shaderType));
    };

    Program.prototype.newShaderContext = function(descriptor, shaderType) {
      var gl;

      gl = descriptor.context.gl;
      return {
        shaderType: shaderType,
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        maxFragmentTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        gl: gl
      };
    };

    Program.prototype.buildBacktrace = function(gl, shader, source) {
      var errno, errors, humanLineNo, index, line, log, rx, _i, _j, _ref, _ref1, _ref2;

      log = ((_ref = gl.getShaderInfoLog(shader)) != null ? _ref.split(/\n/) : void 0) || [];
      rx = /\d+:(\d+):(.*)/;
      errors = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = log.length; _i < _len; _i++) {
          line = log[_i];
          _results.push(rx.exec(line));
        }
        return _results;
      })();
      for (index = _i = 0, _ref1 = source.length; 0 <= _ref1 ? _i < _ref1 : _i > _ref1; index = 0 <= _ref1 ? ++_i : --_i) {
        line = source[index];
        humanLineNo = index + 1;
        if (humanLineNo < 10) {
          humanLineNo = "  " + humanLineNo;
        } else if (humanLineNo < 100) {
          humanLineNo = " " + humanLineNo;
        }
        log.push("" + humanLineNo + " : " + line);
        for (errno = _j = 0, _ref2 = errors.length; 0 <= _ref2 ? _j < _ref2 : _j > _ref2; errno = 0 <= _ref2 ? ++_j : --_j) {
          if (errors[errno] && parseInt(errors[errno][1]) === index + 1) {
            log.push("   :: ERROR : " + errors[errno][2]);
            errors.splice(errno - 1, 1);
            errno = 0;
          }
        }
      }
      return log;
    };

    return Program;

  })();

}).call(this);
(function() {
  var __slice = [].slice;

  Jax.Material = (function() {
    function Material(options, name) {
      var key, layer, layers, value, _i, _j, _k, _layers, _len, _len1, _len2, _ref;

      this.name = name != null ? name : "generic";
      this._localizedShader = false;
      this.layers = [];
      if (this.__proto__.constructor.__shader) {
        this.shader = this.__proto__.constructor.__shader;
        _ref = this.__proto__.constructor.getLayers();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          layer = _ref[_i];
          this.layers.push(new layer.__proto__.constructor(layer));
        }
      } else {
        this.shader = this.__proto__.constructor.__shader = new Jax.Shader.Program(this.name);
        layers = [];
        _layers = this.__proto__.constructor.getLayers();
        for (_j = 0, _len1 = _layers.length; _j < _len1; _j++) {
          layer = _layers[_j];
          layers.push(this.addLayer(layer, false));
        }
        _layers.splice.apply(_layers, [0, _layers.length].concat(__slice.call(layers)));
      }
      this.assigns = {};
      options = Jax.Util.normalizeOptions(options, {});
      for (key in options) {
        value = options[key];
        switch (key) {
          case 'layers':
            for (_k = 0, _len2 = value.length; _k < _len2; _k++) {
              layer = value[_k];
              this.addLayer(layer);
            }
            break;
          default:
            this[key] = value;
        }
      }
    }

    Material.__shader = null;

    Material.getLayers = function() {
      var array, layer, parent, parentLayers, _i, _len;

      parent = this.__super__;
      if (this.__layers) {
        if (parent) {
          if (this.__layers !== parent.constructor.getLayers()) {
            return this.__layers;
          }
        } else {
          return this.__layers;
        }
      }
      array = [];
      if (parent) {
        parentLayers = parent.constructor.getLayers();
        for (_i = 0, _len = parentLayers.length; _i < _len; _i++) {
          layer = parentLayers[_i];
          array.push(layer);
        }
      }
      this.__layers = array;
      return array;
    };

    Material.addLayer = function(options) {
      return this.getLayers().push(options);
    };

    Material.define('vertex', {
      get: function() {
        return this.shader.vertex;
      }
    });

    Material.define('fragment', {
      get: function() {
        return this.shader.fragment;
      }
    });

    /*
    Returns the first layer that is an instance of the given class, or null
    if it is not found at all.
    */


    Material.prototype.findLayer = function(klass) {
      var layer, _i, _len, _ref;

      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        if (layer instanceof klass) {
          return layer;
        }
      }
      return null;
    };

    /*
    Causes this material instance to split its shader apart from the shared
    shader which is used by default for all instances of a given material.
    This is slower, but allows for greater customization of a material.
    
    For example, a material which normally has diffuse lighting but no
    specular lighting can localize its shader so that a specific instance
    of the material can have specular lighting added to it without tainting
    the shader of any other instance.
    */


    Material.prototype.localizeShader = function() {
      var layer, layers, _i, _len, _ref;

      if (this._localizedShader) {
        return;
      }
      this._localizedShader = true;
      this.shader = new Jax.Shader.Program(this.shader.name + "-localized-" + Jax.guid());
      _ref = [this.layers, []], layers = _ref[0], this.layers = _ref[1];
      for (_i = 0, _len = layers.length; _i < _len; _i++) {
        layer = layers[_i];
        this.addLayer(layer);
      }
      return true;
    };

    Material.prototype.insertLayer = function(index, options, localize) {
      var Klass, layer;

      if (localize == null) {
        localize = true;
      }
      if (localize) {
        this.localizeShader();
      }
      if (typeof options === 'string') {
        options = {
          type: options
        };
      }
      if (options instanceof Jax.Material.Layer) {
        options.attachTo(this, index);
        this.layers.splice(index, 0, options);
        return options;
      }
      options = Jax.Util.normalizeOptions(options, {});
      Klass = Jax.Material.Layer[options.type];
      if (!Klass) {
        if (Jax.Material[options.type]) {
          console.log(("" + this.name + ": Material layer type " + options.type + " could not be found ") + "within namespace Jax.Material.Layer, but an object of the same name " + "was found within namespace Jax.Material. Please note that this is " + "deprecated usage, and material layers should appear within namespace " + "Jax.Material.Layer.");
          Klass = Jax.Material[options.type];
        } else {
          throw new Error("" + this.name + ": Material layer type " + options.type + " could not be found");
        }
      }
      options.shader || (options.shader = Klass.shader || Jax.Util.underscore(options.type));
      layer = new Klass(options);
      if (layer instanceof Jax.Material) {
        throw new Error("" + this.name + ": Custom material layers now inherit from Jax.Material.Layer instead of Jax.Material.");
      }
      layer.attachTo(this, index);
      this.layers.splice(index, 0, layer);
      return layer;
    };

    Material.prototype.addLayer = function(options, localize) {
      if (localize == null) {
        localize = true;
      }
      return this.insertLayer(this.layers.length, options, localize);
    };

    Material.prototype.clearAssigns = function() {
      var assigns, k;

      assigns = this.assigns;
      for (k in assigns) {
        assigns[k] = void 0;
      }
      return true;
    };

    /*
    Renders a single mesh, taking as many passes as the material's layers indicate
    are needed, and then returns the number of passes it actually took.
    */


    Material.prototype.renderMesh = function(context, mesh, model) {
      var gl, layer, numPassesRendered, numPassesRequested, pass, passes, _i, _j, _len, _ref;

      numPassesRendered = 0;
      numPassesRequested = 0;
      mesh.data.context = context;
      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        layer.material = this;
        if (layer.prepare) {
          layer.prepare(context, mesh, model);
        }
        passes = layer.numPasses(context, mesh, model);
        if (passes > numPassesRequested) {
          numPassesRequested = passes;
        }
      }
      this.clearAssigns();
      mesh.data.context = context;
      this.shader.bind(context);
      gl = context.gl;
      for (pass = _j = 0; 0 <= numPassesRequested ? _j < numPassesRequested : _j > numPassesRequested; pass = 0 <= numPassesRequested ? ++_j : --_j) {
        if (!this.preparePass(context, mesh, model, pass, numPassesRendered)) {
          continue;
        }
        numPassesRendered++;
        this.drawBuffers(context, mesh, pass);
      }
      if (numPassesRendered > 1) {
        gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        gl.depthFunc(GL_LESS);
      }
      return numPassesRendered;
    };

    Material.prototype.preparePass = function(context, mesh, model, pass, numPassesRendered) {
      var gl, k, layer, map, result, v, _i, _len, _ref;

      if (numPassesRendered == null) {
        numPassesRendered = 0;
      }
      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        if ((result = layer.setup(context, mesh, model, pass)) === false) {
          return false;
        } else {
          map = layer.variableMap;
          for (k in result) {
            v = result[k];
            if (map[k]) {
              k = map[k];
            }
            if (v !== void 0) {
              this.assigns[k] = v;
            }
          }
        }
      }
      if (numPassesRendered === 1) {
        gl = context.gl;
        gl.blendFunc(GL_ONE, GL_ONE);
        gl.depthFunc(GL_EQUAL);
      }
      this.shader.set(context, this.assigns);
      return true;
    };

    Material.prototype.drawBuffers = function(context, mesh, pass) {
      var buffer, length, _ref;

      if (pass == null) {
        pass = 0;
      }
      if ((buffer = mesh.getIndexBuffer()) && buffer.length) {
        if (pass === 0) {
          buffer.bind(context);
        }
        return context.gl.drawElements(mesh.draw_mode, buffer.length, buffer.dataType, 0);
      } else if (length = (_ref = mesh.data.vertexBuffer) != null ? _ref.length : void 0) {
        return context.gl.drawArrays(mesh.draw_mode, 0, length);
      }
    };

    /*
    Renders the given mesh and its sub-mesh, if any, and then returns
    the total number of render passes that were required.
    */


    Material.prototype.render = function(context, mesh, model) {
      var numPassesRendered;

      numPassesRendered = 0;
      while (mesh) {
        numPassesRendered += this.renderMesh(context, mesh, model);
        mesh = mesh.submesh;
      }
      return numPassesRendered;
    };

    Material.instances = {};

    Material.resources = {};

    Material.__isMaterial = true;

    Material.all = function() {
      var name, _results;

      _results = [];
      for (name in Jax.Material.resources) {
        _results.push(name);
      }
      return _results;
    };

    Material.find = function(name) {
      var Klass, data, _ref;

      if (Jax.Material.instances[name]) {
        return Jax.Material.instances[name];
      }
      if (!(data = Jax.Material.resources[name])) {
        throw new Error("Material '" + name + "' could not be found!");
      }
      switch ((_ref = data.type) != null ? _ref.toString().toUpperCase() : void 0) {
        case 'CUSTOM':
          Klass = Jax.Material.Custom;
          break;
        case 'LEGACY':
          Klass = Jax.Material.Legacy;
          break;
        case 'SURFACE':
          Klass = Jax.Material.Surface;
          break;
        case 'HALO':
          Klass = Jax.Material.Halo;
          break;
        case 'WIRE':
          Klass = Jax.Material.Wire;
          break;
        default:
          if (!((Klass = Jax.Material[data.type]) && Klass.__isMaterial)) {
            console.log(("" + name + ": Material type " + data.type + " is invalid. Please note that its meaning ") + "changed in Jax v3.0; it should be one of 'Surface', 'Legacy', 'Wire', 'Custom'.");
            console.log("Type of material " + name + " is defaulting to 'Legacy'.");
            Klass = Jax.Material.Legacy;
          }
      }
      if (!Klass) {
        throw new Error("" + name + ": Material type " + data.type + " is not yet implemented.");
      }
      return Jax.Material.instances[name] = new Klass(data, name);
    };

    Material.addResources = function(resources) {
      var data, name, _results;

      _results = [];
      for (name in resources) {
        data = resources[name];
        _results.push(Jax.Material.resources[name] = data);
      }
      return _results;
    };

    Material.clearResources = function() {
      Jax.Material.resources = {};
      return Jax.Material.instances = {};
    };

    return Material;

  })();

}).call(this);
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Custom = (function(_super) {
    __extends(Custom, _super);

    function Custom() {
      _ref = Custom.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return Custom;

  })(Jax.Material);

}).call(this);
(function() {
  Jax.Material.Layer = (function() {
    var shaderSource;

    shaderSource = function(data, which) {
      var options, source;

      source = (data.common || "") + (data[which] || "");
      options = {
        SHADER_TYPE: which
      };
      return new EJS({
        text: source
      }).render(options);
    };

    function Layer(options, material) {
      var k, src, v;

      if (options != null ? options.setVariables : void 0) {
        this.setVariables = options != null ? options.setVariables : void 0;
      }
      this.assigns = new Jax.Material.ShaderVariableMap;
      if (options) {
        if (options.shader && (src = Jax.shader_data(options.shader)) && (src.fragment || src.vertex)) {
          this._shaderSource = src;
        } else if ((src = options) && (src.fragment || src.vertex)) {
          this._shaderSource = src;
        }
        for (k in options) {
          v = options[k];
          this[k] = v;
        }
      }
      if (!this._shaderSource) {
        if ((src = this.__proto__.constructor.shaderSource) !== void 0) {
          this._shaderSource = src;
        } else if ((src = Jax.shader_data(Jax.Util.underscore(this.__proto__.constructor.name))) && (src.fragment || src.vertex)) {
          this._shaderSource = src;
        }
      }
      if (material) {
        this.attachTo(material);
      }
    }

    Layer.prototype.attachTo = function(material, insertionIndex) {
      var fragment, map, vertex;

      map = {};
      if (this._shaderSource) {
        vertex = shaderSource(this._shaderSource, 'vertex');
        fragment = shaderSource(this._shaderSource, 'fragment');
        map = material.shader.insert(vertex, fragment, insertionIndex);
      }
      return this.variableMap = map;
    };

    Layer.prototype.numPasses = function(context) {
      return 1;
    };

    Layer.prototype.clearAssigns = function() {
      var k, map;

      map = this.assigns;
      for (k in map) {
        map[k] = void 0;
      }
      return true;
    };

    Layer.prototype.setup = function(context, mesh, model, pass) {
      var result, varmap;

      varmap = null;
      this.clearAssigns();
      if (this.setVariables) {
        result = this.setVariables(context, mesh, model, this.assigns, pass);
        if (result === false) {
          return false;
        }
      }
      return this.assigns;
    };

    return Layer;

  })();

}).call(this);
/*
A superclass for layers which are light-dependent. It allows
subclasses to skip checking the pass number or distance to
the light source.
*/


(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.IlluminationLayer = (function(_super) {
    __extends(IlluminationLayer, _super);

    function IlluminationLayer() {
      _ref = IlluminationLayer.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    /*
    The number of passes required for an illumination layer is an
    ambient pass plus one pass per light source. It's safe to
    override this if a particular layer follows a different scheme.
    */


    IlluminationLayer.prototype.numPasses = function(context) {
      return context.world.lights.length + 1;
    };

    /*
    Returns immediately on ambient passes; aborts the render pass
    entirely if the light source is too far away from the specified
    model to have any effect. Otherwise, calls #illuminate.
    
    In all cases, sets the shader variable `PASS` to the pass number.
    */


    IlluminationLayer.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var light;

      vars.PASS = pass;
      if (!pass) {
        return;
      }
      light = context.world.lights[pass - 1];
      if (!(light.enabled && light.isInRange(model))) {
        return false;
      }
      return this.illuminate(context, mesh, model, vars, light);
    };

    /*
    Expected to be overridden by subclasses, called when a mesh is
    about to be illuminated by a particular light. Use this to set
    shader variables. By default, this does nothing.
    */


    IlluminationLayer.prototype.illuminate = function(context, mesh, model, vars, light) {};

    return IlluminationLayer;

  })(Jax.Material.Layer);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Legacy = (function(_super) {
    __extends(Legacy, _super);

    Legacy.addLayer('Position');

    Legacy.addLayer('VertexColor');

    Legacy.define('ambient', {
      get: function() {
        return this._ambient;
      },
      set: function(c) {
        var _ref;

        this._ambient = Jax.Color.parse(c);
        return (_ref = this.findLayer(Jax.Material.Layer.LightAmbient)) != null ? _ref.color = this._ambient : void 0;
      }
    });

    Legacy.define('diffuse', {
      get: function() {
        return this._diffuse;
      },
      set: function(c) {
        var _ref;

        this._diffuse = Jax.Color.parse(c);
        return (_ref = this.findLayer(Jax.Material.Layer.LambertDiffuse)) != null ? _ref.color = this._diffuse : void 0;
      }
    });

    Legacy.define('specular', {
      get: function() {
        return this._specular;
      },
      set: function(c) {
        var _ref;

        this._specular = Jax.Color.parse(c);
        return (_ref = this.findLayer(Jax.Material.Layer.PhongSpecular)) != null ? _ref.color = this._specular : void 0;
      }
    });

    Legacy.define('shininess', {
      get: function() {
        return this._shininess;
      },
      set: function(c) {
        var _ref;

        this._shininess = c;
        return (_ref = this.findLayer(Jax.Material.Layer.PhongSpecular)) != null ? _ref.shininess = this._shininess : void 0;
      }
    });

    function Legacy(options, name) {
      var layer, layers, _i, _len;

      if (options) {
        layers = options.layers;
        delete options.layers;
      }
      Legacy.__super__.constructor.call(this, options, name);
      if (layers) {
        for (_i = 0, _len = layers.length; _i < _len; _i++) {
          layer = layers[_i];
          switch (layer.type) {
            case 'Lighting':
              layer.type = 'LightAmbient';
              this.addLayer(layer);
              layer.type = 'LambertDiffuse';
              this.addLayer(layer);
              layer.type = 'PhongSpecular';
              this.addLayer(layer);
              break;
            case 'NormalMap':
              this.insertLayer(0, layer);
              break;
            default:
              this.addLayer(layer);
          }
        }
      }
      this.ambient = this.ambient || '#ffff';
      this.diffuse = this.diffuse || '#ffff';
      this.specular = this.specular || '#ffff';
      if (this.shininess === void 0) {
        this.shininess = 60;
      }
    }

    return Legacy;

  })(Jax.Material.Custom);

}).call(this);
/*
A dummy object that is only here for legacy reasons;
it could really be replaced by a generic object except
for the `set` function and the `texture` function, both
of which are deprecated in favor of just directly setting
property values on the object.

Values assigned to the variable map are eventually assigned
to shaders, so their keys should be names of shader
variables.
*/


(function() {
  Jax.Material.ShaderVariableMap = (function() {
    function ShaderVariableMap() {}

    ShaderVariableMap.prototype.set = function(keyOrVariables, valueOrNothing) {
      var k, v, _results;

      if (!this.alreadyWarned) {
        this.alreadyWarned = true;
        console.log("`vars.set` and `vars.texture` are both deprecated. Instead, " + "you should just set variable values directly on the `vars` " + "object. For example, to set a shader variable named `color` " + "to the value [1, 1, 1, 1], use the syntax: " + "vars.color = [1, 1, 1, 1]`");
      }
      if (valueOrNothing === void 0) {
        _results = [];
        for (k in keyOrVariables) {
          v = keyOrVariables[k];
          if (v === void 0) {
            continue;
          }
          _results.push(this[k] = v);
        }
        return _results;
      } else {
        k = keyOrVariables;
        v = valueOrNothing;
        if (v !== void 0) {
          return this[k] = v;
        }
      }
    };

    ShaderVariableMap.prototype.texture = function(name, tex, context) {
      return this.set(name, tex);
    };

    ShaderVariableMap.define('set', {
      enumerable: false
    });

    ShaderVariableMap.define('texture', {
      enumerable: false
    });

    return ShaderVariableMap;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Surface = (function(_super) {
    __extends(Surface, _super);

    Surface.addLayer('Position');

    Surface.addLayer('VertexColor');

    Surface.addLayer('WorldAmbient');

    Surface.addLayer('LambertDiffuse');

    Surface.addLayer('PhongSpecular');

    Surface.addLayer('ShadowMap');

    Surface.addLayer('LightAmbient');

    Surface.addLayer('Attenuation');

    Surface.addLayer('ClampColor');

    Surface.define('intensity', {
      get: function() {
        return this._intensity;
      },
      set: function(obj) {
        var intensity;

        intensity = this._intensity;
        if (typeof obj === 'number') {
          return intensity.ambient = intensity.diffuse = intensity.specular = obj;
        } else {
          if (obj.ambient !== void 0) {
            intensity.ambient = obj.ambient;
          }
          if (obj.diffuse !== void 0) {
            intensity.diffuse = obj.diffuse;
          }
          if (obj.specular !== void 0) {
            return intensity.specular = obj.specular;
          }
        }
      }
    });

    Surface.define('color', {
      get: function() {
        return this._color;
      },
      set: function(obj) {
        var color, isColor;

        color = this._color;
        isColor = typeof obj !== 'object' || (obj.ambient === void 0 && obj.diffuse === void 0 && obj.specular === void 0);
        if (isColor) {
          return color.ambient = color.diffuse = color.specular = obj;
        } else {
          if (obj.ambient !== void 0) {
            color.ambient = obj.ambient;
          }
          if (obj.diffuse !== void 0) {
            color.diffuse = obj.diffuse;
          }
          if (obj.specular !== void 0) {
            return color.specular = obj.specular;
          }
        }
      }
    });

    Surface.define('shininess', {
      get: function() {
        return this._shininess;
      },
      set: function(s) {
        var _ref;

        if ((_ref = this.findLayer(Jax.Material.Layer.PhongSpecular)) != null) {
          _ref.shininess = s;
        }
        return this._shininess = s;
      }
    });

    Surface.define('pcf', {
      get: function() {
        return this._pcf;
      },
      set: function(s) {
        var _ref;

        if ((_ref = this.findLayer(Jax.Material.Layer.ShadowMap)) != null) {
          _ref.pcf = s;
        }
        return this._pcf = s;
      }
    });

    function Surface(options, name) {
      var map, mat, texture, _i, _j, _len, _len1, _ref, _ref1;

      this._intensity = {};
      mat = this;
      Object.defineProperty(this._intensity, 'ambient', {
        get: function() {
          return this._ambient;
        },
        set: function(i) {
          var _ref, _ref1;

          if ((_ref = mat.findLayer(Jax.Material.Layer.WorldAmbient)) != null) {
            _ref.intensity = i;
          }
          if ((_ref1 = mat.findLayer(Jax.Material.Layer.LightAmbient)) != null) {
            _ref1.intensity = i;
          }
          return this._ambient = i;
        }
      });
      Object.defineProperty(this._intensity, 'diffuse', {
        get: function() {
          return this._diffuse;
        },
        set: function(i) {
          var _ref;

          if ((_ref = mat.findLayer(Jax.Material.Layer.LambertDiffuse)) != null) {
            _ref.intensity = i;
          }
          return this._diffuse = i;
        }
      });
      Object.defineProperty(this._intensity, 'specular', {
        get: function() {
          return this._specular;
        },
        set: function(i) {
          var _ref;

          if ((_ref = mat.findLayer(Jax.Material.Layer.PhongSpecular)) != null) {
            _ref.intensity = i;
          }
          return this._specular = i;
        }
      });
      this._color = {};
      mat = this;
      Object.defineProperty(this._color, 'ambient', {
        get: function() {
          return this._ambient;
        },
        set: function(c) {
          var _ref, _ref1;

          if ((_ref = mat.findLayer(Jax.Material.Layer.WorldAmbient)) != null) {
            _ref.color = Jax.Color.parse(c);
          }
          if ((_ref1 = mat.findLayer(Jax.Material.Layer.LightAmbient)) != null) {
            _ref1.color = Jax.Color.parse(c);
          }
          return this._ambient = c;
        }
      });
      Object.defineProperty(this._color, 'diffuse', {
        get: function() {
          return this._diffuse;
        },
        set: function(c) {
          var _ref;

          if ((_ref = mat.findLayer(Jax.Material.Layer.LambertDiffuse)) != null) {
            _ref.color = Jax.Color.parse(c);
          }
          return this._diffuse = c;
        }
      });
      Object.defineProperty(this._color, 'specular', {
        get: function() {
          return this._specular;
        },
        set: function(c) {
          var _ref;

          if ((_ref = mat.findLayer(Jax.Material.Layer.PhongSpecular)) != null) {
            _ref.color = Jax.Color.parse(c);
          }
          return this._specular = c;
        }
      });
      options || (options = {});
      if (options.intensity === void 0) {
        options.intensity = 1;
      }
      if (options.color === void 0) {
        options.color = '#fff';
      }
      if (options.shininess === void 0) {
        options.shininess = 60;
      }
      if (options.pcf === void 0) {
        options.pcf = true;
      }
      Surface.__super__.constructor.call(this, options, name);
      if (options) {
        if (options.textures) {
          _ref = options.textures;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            texture = _ref[_i];
            this.addLayer({
              type: 'Texture',
              texture: texture
            });
          }
        }
        if (options.normalMaps) {
          _ref1 = options.normalMaps;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            map = _ref1[_j];
            this.insertLayer(0, {
              type: 'NormalMap',
              texture: map
            });
          }
        }
      }
    }

    return Surface;

  })(Jax.Material.Custom);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Wire = (function(_super) {
    __extends(Wire, _super);

    Wire.addLayer('Wire');

    function Wire(options, name) {
      this.transparent = true;
      Wire.__super__.constructor.call(this, options, name);
    }

    return Wire;

  })(Jax.Material.Surface);

}).call(this);
(function() {
  Jax.Camera = (function() {
    var LOCAL_RIGHT, LOCAL_UP, LOCAL_VIEW, _dirQuat, _dirRightVec, _dirUpVec, _dirVec, _moveVec, _projectRight, _projectView, _rotQuat, _rotVec, _unprojectInf;

    Camera.include(Jax.EventEmitter);

    LOCAL_VIEW = vec3.clone([0, 0, -1]);

    LOCAL_RIGHT = vec3.clone([1, 0, 0]);

    LOCAL_UP = vec3.clone([0, 1, 0]);

    function Camera(options) {
      this.rotation = quat.identity(quat.create());
      this._position = vec3.create();
      this.matrices = {
        mv: mat4.identity(mat4.create()),
        imv: mat4.identity(mat4.create()),
        p: mat4.identity(mat4.create()),
        n: mat3.identity(mat3.create())
      };
      this.reset();
      this.setFixedYawAxis(true, vec3.UNIT_Y);
      this._isValid = false;
      this._viewVector = vec3.create();
      this._upVector = vec3.create();
      this._rightVector = vec3.create();
      if (options) {
        if (options.position) {
          this._position = options.position;
        }
        if (options.direction) {
          this.direction = options.direction;
        }
      }
    }

    Camera.getter('frustum', function() {
      this._frustum || (this._frustum = new Jax.Frustum(this.matrices.imv, this.matrices.p));
      if (!this.isValid()) {
        this.validate();
      }
      if (this._stale) {
        this.recalculateMatrices();
      }
      if (!this._frustum.isValid()) {
        this._frustum.validate();
      }
      return this._frustum;
    });

    _dirVec = vec3.create();

    _dirRightVec = vec3.create();

    _dirUpVec = vec3.create();

    _dirQuat = quat.create();

    Camera.define('direction', {
      get: function() {
        if (!this.isValid()) {
          this.validate();
        }
        return this._viewVector;
      },
      set: function(dir) {
        var right, rotquat, up, vec;

        vec = vec3.copy(_dirVec, dir);
        vec3.normalize(vec, vec);
        if (this._fixedYaw) {
          vec3.negate(vec, vec);
          right = vec3.normalize(_dirRightVec, vec3.cross(_dirRightVec, this._fixedYawAxis, vec));
          up = vec3.normalize(_dirUpVec, vec3.cross(_dirUpVec, vec, right));
          quat.setAxes(this.rotation, vec, right, up);
        } else {
          rotquat = quat.rotationTo(_dirQuat, this.direction, vec);
          quat.multiply(this.rotation, rotquat, this.rotation);
        }
        quat.normalize(this.rotation, this.rotation);
        this.invalidate();
        return this.fireEvent('updated');
      }
    });

    Camera.getter('right', function() {
      if (!this.isValid()) {
        this.validate();
      }
      return this._rightVector;
    });

    Camera.getter('up', function() {
      if (!this.isValid()) {
        this.validate();
      }
      return this._upVector;
    });

    Camera.define('position', {
      get: function() {
        return this._position;
      },
      set: function(x) {
        var _ref;

        vec3.copy(this._position, x);
        this._stale = true;
        if ((_ref = this._frustum) != null) {
          _ref.invalidate();
        }
        return this.fireEvent('updated');
      }
    });

    Camera.prototype.invalidate = function() {
      var _ref;

      this._isValid = false;
      this._stale = true;
      return (_ref = this._frustum) != null ? _ref.invalidate() : void 0;
    };

    Camera.prototype.isValid = function() {
      return this._isValid;
    };

    Camera.prototype.recalculateMatrices = function() {
      if (!this.isValid()) {
        this.validate();
      }
      this._stale = false;
      mat4.fromRotationTranslation(this.matrices.mv, this.rotation, this.position);
      mat4.invert(this.matrices.imv, this.matrices.mv);
      mat3.fromMat4(this.matrices.n, this.matrices.imv);
      mat3.transpose(this.matrices.n, this.matrices.n);
      return this.fireEvent('matrixUpdated');
    };

    Camera.prototype.validate = function() {
      this._isValid = true;
      this._viewVector = vec3.transformQuat(this._viewVector, LOCAL_VIEW, this.rotation);
      this._rightVector = vec3.transformQuat(this._rightVector, LOCAL_RIGHT, this.rotation);
      return this._upVector = vec3.transformQuat(this._upVector, LOCAL_UP, this.rotation);
    };

    Camera.prototype.setFixedYawAxis = function(useFixedYaw, axis) {
      this._fixedYaw = useFixedYaw;
      if (axis) {
        return this._fixedYawAxis = axis;
      }
    };

    Camera.prototype.ortho = function(options) {
      options.left || (options.left = -1);
      options.right || (options.right = 1);
      options.top || (options.top = 1);
      options.bottom || (options.bottom = -1);
      options.far || (options.far = 200);
      options.near || (options.near = 0.1);
      mat4.ortho(this.matrices.p, options.left, options.right, options.bottom, options.top, options.near, options.far);
      this.projection = {
        width: options.right - options.left,
        height: options.top - options.bottom,
        depth: options.far - options.near,
        left: options.left,
        right: options.right,
        top: options.top,
        bottom: options.bottom,
        near: options.near,
        far: options.far,
        type: 'orthographic'
      };
      return this.fireEvent('matrixUpdated');
    };

    Camera.prototype.perspective = function(options) {
      var aspectRatio;

      options || (options = {});
      if (!options.width) {
        throw new Error("Expected a screen width in Jax.Camera#perspective");
      }
      if (!options.height) {
        throw new Error("Expected a screen height in Jax.Camera#perspective");
      }
      options.fov || (options.fov = 0.785398);
      options.near || (options.near = 0.1);
      options.far || (options.far = 200);
      aspectRatio = options.width / options.height;
      mat4.perspective(this.matrices.p, options.fov, aspectRatio, options.near, options.far);
      this.projection = {
        width: options.width,
        height: options.height,
        near: options.near,
        far: options.far,
        fov: options.fov,
        type: 'perspective'
      };
      return this.fireEvent('matrixUpdated');
    };

    _rotVec = vec3.create();

    _rotQuat = quat.create();

    Camera.prototype.rotate = function(amount, x, y, z) {
      var vec;

      if (y === void 0) {
        vec = x;
      } else {
        vec = _rotVec;
        vec[0] = x;
        vec[1] = y;
        vec[2] = z;
      }
      return this.rotateWorld(amount, vec3.transformQuat(vec, vec, this.rotation));
    };

    Camera.prototype.rotateWorld = function(amount, x, y, z) {
      var rotquat, vec;

      if (y === void 0) {
        vec = x;
      } else {
        vec = _rotVec;
        vec[0] = x;
        vec[1] = y;
        vec[2] = z;
      }
      rotquat = quat.setAxisAngle(_rotQuat, vec, amount);
      quat.normalize(rotquat, rotquat);
      quat.multiply(this.rotation, rotquat, this.rotation);
      this.invalidate();
      this.fireEvent('updated');
      return this;
    };

    Camera.prototype.pitch = function(amount) {
      var axis;

      axis = this.right;
      return this.rotateWorld(amount, axis);
    };

    Camera.prototype.yaw = function(amount) {
      var axis;

      if (this._fixedYaw) {
        axis = this._fixedYawAxis;
      } else {
        axis = this.up;
      }
      return this.rotateWorld(amount, axis);
    };

    Camera.prototype.roll = function(amount) {
      var axis;

      axis = this.direction;
      return this.rotateWorld(amount, axis);
    };

    Camera.prototype.reorient = function(view, pos) {
      if (pos) {
        this.position = pos;
      }
      this.direction = view;
      return this;
    };

    Camera.prototype.lookAt = function(point, pos) {
      var view;

      if (pos) {
        this.position = pos;
      } else {
        pos = this.position;
      }
      view = this.direction;
      return this.direction = vec3.subtract(view, point, pos);
    };

    Camera.prototype.getTransformationMatrix = function() {
      if (this._stale) {
        this.recalculateMatrices();
      }
      return this.matrices.mv;
    };

    Camera.prototype.getInverseTransformationMatrix = function() {
      if (this._stale) {
        this.recalculateMatrices();
      }
      return this.matrices.imv;
    };

    Camera.prototype.getNormalMatrix = function() {
      if (this._stale) {
        this.recalculateMatrices();
      }
      return this.matrices.n;
    };

    Camera.prototype.getProjectionMatrix = function() {
      if (this._stale) {
        this.recalculateMatrices();
      }
      return this.matrices.p;
    };

    _unprojectInf = vec4.create();

    Camera.prototype.unproject = function(winx, winy, winz) {
      var inf, m, mm, out, pm, result, viewport;

      if (winz !== void 0) {
        inf = _unprojectInf;
        mm = this.getTransformationMatrix();
        pm = this.getProjectionMatrix();
        viewport = [0, 0, this.projection.width, this.projection.height];
        m = mat4.invert(mat4.create(), mm);
        mat4.multiply(m, pm, m);
        if (!mat4.invert(m, m)) {
          return null;
        }
        inf[0] = (winx - viewport[0]) / viewport[2] * 2 - 1;
        inf[1] = (winy - viewport[1]) / viewport[3] * 2 - 1;
        inf[2] = 2 * winz - 1;
        inf[3] = 1;
        out = inf;
        vec4.transformMat4(out, inf, m);
        if (out[3] === 0) {
          return null;
        }
        result = vec3.create();
        out[3] = 1 / out[3];
        result[0] = out[0] * out[3];
        result[1] = out[1] * out[3];
        result[2] = out[2] * out[3];
        return result;
      } else {
        return [this.unproject(winx, winy, 0), this.unproject(winx, winy, 1)];
      }
    };

    Camera.prototype.strafe = function(distance) {
      this.move(distance, this.right);
      return this;
    };

    _moveVec = vec3.create();

    Camera.prototype.move = function(distance, direction) {
      direction || (direction = this.direction);
      vec3.add(this.position, vec3.scale(_moveVec, direction, distance), this.position);
      this.invalidate();
      this.fireEvent('updated');
      return this;
    };

    _projectView = vec3.create();

    _projectRight = vec3.create();

    Camera.prototype.projectMovement = function(forward, strafe, dest) {
      var right, view;

      strafe || (strafe = 0);
      dest || (dest = vec3.create());
      view = _projectView;
      right = _projectRight;
      vec3.scale(view, this.direction, forward);
      vec3.scale(right, this.right, strafe);
      vec3.copy(dest, this.position);
      vec3.add(dest, view, dest);
      vec3.add(dest, right, dest);
      return dest;
    };

    Camera.prototype.reset = function() {
      this.position[0] = this.position[1] = this.position[2] = 0;
      this.rotation[0] = this.rotation[1] = this.rotation[2] = 0;
      this.rotation[3] = 1;
      this.invalidate();
      return this.fireEvent('updated');
    };

    return Camera;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Frustum = (function(_super) {
    var BOTTOM, FAR, LEFT, NEAR, RIGHT, TOP, extractedM, extractedVec, testVec, _ref;

    __extends(Frustum, _super);

    Frustum.include(Jax.EventEmitter);

    _ref = [0, 1, 2, 3, 4, 5], RIGHT = _ref[0], LEFT = _ref[1], BOTTOM = _ref[2], TOP = _ref[3], FAR = _ref[4], NEAR = _ref[5];

    Frustum.OUTSIDE = Jax.Geometry.Plane.BACK;

    Frustum.INTERSECT = Jax.Geometry.Plane.INTERSECT;

    Frustum.INSIDE = Jax.Geometry.Plane.FRONT;

    function Frustum(modelview, projection) {
      var i;

      this.modelview = modelview;
      this.projection = projection;
      Frustum.__super__.constructor.call(this);
      this.planes = (function() {
        var _i, _results;

        _results = [];
        for (i = _i = 0; _i < 6; i = ++_i) {
          _results.push(new Jax.Geometry.Plane);
        }
        return _results;
      })();
      this.invalidate();
    }

    Frustum.getter('mesh', function() {
      var mesh, recalculateMeshVertices,
        _this = this;

      if (this._mesh) {
        return this._mesh;
      }
      mesh = this._mesh = new Jax.Mesh.Lines({
        init: function(vertices, colors) {
          var i, _i, _results;

          _results = [];
          for (i = _i = 0; _i < 28; i = ++_i) {
            vertices.push(0, 0, 0);
            _results.push(colors.push(1, 1, 0, 1));
          }
          return _results;
        }
      });
      recalculateMeshVertices = function() {
        var e, i, vertices, _i;

        vertices = mesh.data.vertexBuffer;
        e = _this.extents();
        for (i = _i = 0; _i <= 2; i = ++_i) {
          vertices[0 + i] = e.ntl[i];
          vertices[3 + i] = e.ntr[i];
          vertices[6 + i] = e.ntr[i];
          vertices[9 + i] = e.nbr[i];
          vertices[12 + i] = e.ntr[i];
          vertices[15 + i] = e.nbr[i];
          vertices[18 + i] = e.nbr[i];
          vertices[21 + i] = e.nbl[i];
          vertices[24 + i] = e.nbl[i];
          vertices[27 + i] = e.ntl[i];
          vertices[30 + i] = e.ftl[i];
          vertices[33 + i] = e.ftr[i];
          vertices[36 + i] = e.ftr[i];
          vertices[39 + i] = e.fbr[i];
          vertices[42 + i] = e.ftr[i];
          vertices[45 + i] = e.fbr[i];
          vertices[48 + i] = e.fbr[i];
          vertices[51 + i] = e.fbl[i];
          vertices[54 + i] = e.fbl[i];
          vertices[57 + i] = e.ftl[i];
          vertices[60 + i] = e.ntl[i];
          vertices[63 + i] = e.ftl[i];
          vertices[66 + i] = e.nbl[i];
          vertices[69 + i] = e.fbl[i];
          vertices[72 + i] = e.ntr[i];
          vertices[75 + i] = e.ftr[i];
          vertices[78 + i] = e.nbr[i];
          vertices[81 + i] = e.fbr[i];
        }
        return mesh.data.invalidate();
      };
      this.addEventListener('updated', recalculateMeshVertices);
      recalculateMeshVertices();
      return mesh;
    });

    testVec = vec3.create();

    Frustum.prototype.point = function(point, y, z) {
      var plane, _i, _len, _ref1, _ref2;

      this.validate();
      if (y !== void 0) {
        _ref1 = [point, y, z], testVec[0] = _ref1[0], testVec[1] = _ref1[1], testVec[2] = _ref1[2];
        point = testVec;
      }
      _ref2 = this.planes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        plane = _ref2[_i];
        if (plane.distance(point) < 0) {
          return Jax.Frustum.OUTSIDE;
        }
      }
      return Jax.Frustum.INSIDE;
    };

    Frustum.prototype.sphere = function(center, radius, y, z) {
      var distance, plane, result, _i, _len, _ref1, _ref2;

      this.validate();
      if (y !== void 0) {
        radius = z;
        _ref1 = [center, radius, y], testVec[0] = _ref1[0], testVec[1] = _ref1[1], testVec[2] = _ref1[2];
        center = testVec;
      }
      result = Jax.Frustum.INSIDE;
      _ref2 = this.planes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        plane = _ref2[_i];
        distance = plane.distance(center);
        if (distance < -radius) {
          return Jax.Frustum.OUTSIDE;
        }
        if (distance < radius) {
          result = Jax.Frustum.INTERSECT;
        }
      }
      return result;
    };

    Frustum.prototype.cube = function(position, w, h, d) {
      var c, c2, plane, xn, xp, yn, yp, zn, zp, _i, _len, _ref1, _ref2, _ref3, _ref4;

      this.validate();
      c2 = 0;
      _ref1 = [position[0] + w, position[0] - w], xp = _ref1[0], xn = _ref1[1];
      _ref2 = [position[1] + h, position[1] - h], yp = _ref2[0], yn = _ref2[1];
      _ref3 = [position[2] + d, position[2] - d], zp = _ref3[0], zn = _ref3[1];
      _ref4 = this.planes;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        plane = _ref4[_i];
        c = 0;
        if (plane.classify(xp, yp, zp) > 0) {
          c++;
        }
        if (plane.classify(xn, yp, zp) > 0) {
          c++;
        }
        if (plane.classify(xp, yn, zp) > 0) {
          c++;
        }
        if (plane.classify(xn, yn, zp) > 0) {
          c++;
        }
        if (plane.classify(xp, yp, zn) > 0) {
          c++;
        }
        if (plane.classify(xn, yp, zn) > 0) {
          c++;
        }
        if (plane.classify(xp, yn, zn) > 0) {
          c++;
        }
        if (plane.classify(xn, yn, zn) > 0) {
          c++;
        }
        if (c === 0) {
          return Jax.Frustum.OUTSIDE;
        }
        if (c === 8) {
          c2++;
        }
      }
      if (c2 === 6) {
        return Jax.Frustum.INSIDE;
      } else {
        return Jax.Frustum.INTERSECT;
      }
    };

    Frustum.prototype.pointVisible = function(center, y, z) {
      return this.point(center, y, z) !== Jax.Frustum.OUTSIDE;
    };

    Frustum.prototype.sphereVisible = function(center, radius, y, z) {
      return this.sphere(center, radius, y, z) !== Jax.Frustum.OUTSIDE;
    };

    Frustum.prototype.cubeVisible = function(position, w, h, d) {
      return this.cube(position, w, h, d) !== Jax.Frustum.OUTSIDE;
    };

    Frustum.prototype.invalidate = function() {
      return this._isValid = false;
    };

    Frustum.prototype.isValid = function() {
      return this._isValid;
    };

    Frustum.prototype.validate = function() {
      if (this.isValid()) {
        return;
      }
      this.extractFrustum();
      this._isValid = true;
      return this.fireEvent('updated');
    };

    extractedM = mat4.create();

    extractedVec = vec3.create();

    Frustum.prototype.calcExtent = function(vec, x, y, z) {
      vec[0] = x;
      vec[1] = y;
      vec[2] = z;
      vec[3] = 1;
      vec4.transformMat4(vec, vec, extractedM);
      if (vec[3] === 0) {
        vec[0] = vec[1] = vec[2] = 0;
        return vec;
      }
      vec[3] = 1 / vec[3];
      vec[0] = vec[0] * vec[3];
      vec[1] = vec[1] * vec[3];
      vec[2] = vec[2] * vec[3];
      return vec;
    };

    Frustum.prototype.extents = function() {
      var e, m;

      if (this.isValid()) {
        return this._extractedExtents;
      }
      e = this._extractedExtents || (this._extractedExtents = {
        ntl: vec4.create(),
        ntr: vec4.create(),
        nbl: vec4.create(),
        nbr: vec4.create(),
        ftl: vec4.create(),
        ftr: vec4.create(),
        fbl: vec4.create(),
        fbr: vec4.create()
      });
      m = extractedM;
      mat4.multiply(m, this.projection, this.modelview);
      mat4.invert(m, m);
      this.calcExtent(e.ntl, -1, 1, -1);
      this.calcExtent(e.ntr, 1, 1, -1);
      this.calcExtent(e.nbl, -1, -1, -1);
      this.calcExtent(e.nbr, 1, -1, -1);
      this.calcExtent(e.ftl, -1, 1, 1);
      this.calcExtent(e.ftr, 1, 1, 1);
      this.calcExtent(e.fbl, -1, -1, 1);
      this.calcExtent(e.fbr, 1, -1, 1);
      return this._extractedExtents;
    };

    Frustum.prototype.extractFrustum = function() {
      var e;

      e = this.extents();
      this.planes[TOP].set(e.ntr, e.ntl, e.ftl);
      this.planes[BOTTOM].set(e.nbl, e.nbr, e.fbr);
      this.planes[LEFT].set(e.ntl, e.nbl, e.fbl);
      this.planes[RIGHT].set(e.nbr, e.ntr, e.fbr);
      this.planes[NEAR].set(e.ntl, e.ntr, e.nbr);
      return this.planes[FAR].set(e.ftr, e.ftl, e.fbl);
    };

    Frustum.prototype.render = function(context, material) {
      return this.mesh.render(context, this, material);
    };

    return Frustum;

  })(Jax.Model);

}).call(this);
/*
An octree that is completely dynamic. It expands to fit the size of the scene and merges
nodes with too few objects. It will subdivide itself as many times as needed to contain
all of the objects in the scene.

It takes two parameters: split threshold and merge threshold.

If the number of objects added to a node is equal to or greater than the split threshold,
the octree subdivides itself and the objects added to it are delegated into its children.

If the total number of objects in a node (including its children and grandchildren) drops
below the merge threshold, then that node is un-subdivided, and all of the objects in
that node, its children and its grandchildren are removed into the node itself.

The octree exposes a few useful properties:

  * `objects`: a hash containing all of the objects _in this node_. This does not contain
    any objects belonging to any of the octree's children.
  * `nestedObjects`: a hash containing all of the objects in this node and all of its
    children, combined. This allows you to stop recursing and immediately process all
    objects at and below a particular level of subdivision, yielding a notable performance
    boost.
  * `objectCount`: the number of objects contained in this node, not counting its children.
  * `nestedObjectCount`: the number of objects contained in this node and all of its
    children, combined.
  * `position`: the position of a particular node in the octree. The root node is always
    at the origin `[0,0,0]`.
  * `size`: half of the total size of the octree (or of a particular node). The octree's
    total dimensions are `[(position - size) .. (position + size)]`.
  * `mesh`: useful for debugging purposes, each octree exposes an instance of `Jax.Mesh`.
    Rendering the mesh does not render the entire octree, only the specific node
    whose mesh was requested.
  
Objects are positioned in the octree according to their position in world space. The size
of the object doesn't have an effect on its location, only its depth in the octree. If an
object has no mesh or its mesh has no vertices, the size defaults to 0.1 to prevent
recursion errors.
*/


(function() {
  Jax.Octree = (function() {
    var chvec;

    function Octree(splitThreshold, mergeThreshold, depth, size, parent) {
      this.splitThreshold = splitThreshold != null ? splitThreshold : 2;
      this.mergeThreshold = mergeThreshold != null ? mergeThreshold : 1;
      this.depth = depth != null ? depth : 0;
      this.size = size != null ? size : 1;
      this.parent = parent;
      this._isParent = false;
      this._isSubdivided = false;
      this.children = [];
      this.objectCount = 0;
      this.nestedObjectCount = 0;
      this.objects = {};
      this.nestedObjects = {};
      this.position = vec3.create();
    }

    Octree.getter('mesh', function() {
      return this._mesh || (this._mesh = new Jax.Mesh.LineCube(this.size, this.position));
    });

    /*
    Returns true if this octree contains other octrees, which is the case if
    any child of this octree has been instantiated, regardless of whether it
    is currently subdivided. If an octree returns true for both `isSubdivided`
    and `isParent`, then it has children that are currently in use. If it returns
    true for `isParent` but not `isSubdivided`, then it has children that were
    once in use, but currently are not. If it returns true for `isSubdivided`
    but not `isParent`, then it is expected to have children soon, but they
    have not yet been instantiated.
    */


    Octree.prototype.isParent = function() {
      return this._isParent;
    };

    /*
    Returns true if this octree has been subdivided. This indicates whether
    the octree is expected to contain other octrees, not whether it currently
    does so. An octree that is subdivided may or may not be a parent, because
    it may have been subdivided but its children may not yet have been
    instantiated. If an octree returns true for both `isSubdivided` and
    `isParent`, then it has children that are currently in use. If it returns
    true for `isParent` but not `isSubdivided`, then it has children that were
    once in use, but currently are not. If it returns true for `isSubdivided`
    but not `isParent`, then it is expected to have children soon, but they
    have not yet been instantiated.
    */


    Octree.prototype.isSubdivided = function() {
      return this._isSubdivided;
    };

    /*
    Doubles the size of this octree. If it is not a parent, it is subdivided.
    If it is a parent, then each of its nodes will also double in size; the
    leaf nodes be subdivided and become parents.
    */


    Octree.prototype.enlarge = function() {
      var child, _i, _len, _ref;

      this.size *= 2;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child) {
          this.recalculateChildPosition(child);
          child.enlarge();
          child.reEvaluateObjects();
        }
      }
      this.subdivide();
      this.reEvaluateObjects();
      this.mesh.halfSize = this.size;
      this.mesh.offset = this.position;
      return this.mesh.invalidate();
    };

    /*
    Subdivides this octree, but does not actually instantiate any of its
    chidlren.
    */


    Octree.prototype.subdivide = function() {
      return this._isSubdivided = true;
    };

    chvec = vec3.create();

    /*
    Returns the child in the appropriate quadrant for the given vector, which
    represents a position in world space. If the child has not yet been instantiated,
    it is instantiated and this octree becomes a parent. Otherwise, the current
    instance is returned.
    */


    Octree.prototype.getChildInQuadrant = function(vec) {
      var child;

      if (child = this.children[this.quadrant(vec, chvec)]) {
        return child;
      } else {
        child = new Jax.Octree(this.splitThreshold, this.mergeThreshold, this.depth + 1, this.size * 0.5, this);
        vec3.scale(chvec, chvec, this.size * 0.5);
        vec3.add(child.position, chvec, this.position);
        return this.children[this.quadrant(vec)] = child;
      }
    };

    /*
    Given a child node, recalculates its position based on the size and position
    of this node.
    */


    Octree.prototype.recalculateChildPosition = function(child) {
      this.quadrant(child.position, chvec);
      vec3.scale(chvec, chvec, this.size * 0.5);
      return vec3.add(child.position, chvec, this.position);
    };

    /*
    Returns true if this octree can contain the specified object based on its
    current position and size.
    */


    Octree.prototype.canContain = function(obj) {
      var objPos, objSize, octPos, octSize, _ref;

      objPos = obj.position;
      objSize = ((_ref = obj.mesh) != null ? _ref.bounds.radius : void 0) || 0.1;
      octPos = this.position;
      octSize = this.size;
      if (objSize > octSize) {
        return false;
      }
      if (objPos[0] > octPos[0] + octSize) {
        return false;
      }
      if (objPos[0] < octPos[0] - octSize) {
        return false;
      }
      if (objPos[1] > octPos[1] + octSize) {
        return false;
      }
      if (objPos[1] < octPos[1] - octSize) {
        return false;
      }
      if (objPos[2] > octPos[2] + octSize) {
        return false;
      }
      if (objPos[2] < octPos[2] - octSize) {
        return false;
      }
      return true;
    };

    /*
    Adds the object to `nestedObjects` and increments `nestedObjectCount`. This
    represents the union of all objects in either this octree or one of its
    children.
    
    If this octree has a parent, it is instructed to track the object as well.
    
    Returns the object.
    */


    Octree.prototype.trackNestedObject = function(obj) {
      if (!this.nestedObjects[obj.__unique_id]) {
        this.nestedObjects[obj.__unique_id] = obj;
        this.nestedObjectCount++;
      }
      if (this.parent) {
        this.parent.trackNestedObject(obj);
      }
      return obj;
    };

    /*
    Removes the object from @nestedObjects, and then instructs this node's
    parent, if any, to do the same. Children are not affected. Returns
    the object. This method triggers merging via `#merge` if the number of
    nested objects meets the @mergeThreshold.
    */


    Octree.prototype.untrackNestedObject = function(obj) {
      if (this.nestedObjects[obj.__unique_id]) {
        delete this.nestedObjects[obj.__unique_id];
        this.nestedObjectCount--;
        if (this.nestedObjectCount <= this.mergeThreshold) {
          this.merge();
        }
      }
      if (this.parent) {
        this.parent.untrackNestedObject(obj);
      }
      return obj;
    };

    /*
    Adds the object to this octree (not any of its children). This method
    triggers splitting via `#split` if the number of objects meets the
    @splitThreshold.
    */


    Octree.prototype.addToSelf = function(obj) {
      if (!this.objects[obj.__unique_id]) {
        this.objects[obj.__unique_id] = obj;
        this.objectCount++;
        if (this.objectCount >= this.splitThreshold) {
          this.split();
        }
      }
      return this.trackNestedObject(obj);
    };

    /*
    Adds the object to the appropriate node (this octree, one of its
    children, or this octree's parent, if any) based on its size and
    position. If the object is too large, and this octree doesn't have
    a parent to add it to, this octree and all of its children will
    be enlarged to fit the object.
    */


    Octree.prototype.add = function(obj) {
      if (!this.hasBeenMerged() && this.canContain(obj)) {
        if (this.isSubdivided()) {
          return this.addToChild(obj) || this.addToSelf(obj);
        } else {
          return this.addToSelf(obj);
        }
      } else {
        if (this.parent) {
          return this.parent.add(obj);
        } else {
          this.enlarge();
          return this.add(obj);
        }
      }
    };

    /*
    Returns true if this node has been merged into its parent, false
    otherwise.
    */


    Octree.prototype.hasBeenMerged = function() {
      return this.parent && !this.parent.isSubdivided();
    };

    /*
    Removes the object from the octree, potentially triggering a merge.
    */


    Octree.prototype.remove = function(obj) {
      if (this.objects[obj.__unique_id]) {
        delete this.objects[obj.__unique_id];
        this.objectCount--;
      }
      return this.untrackNestedObject(obj);
    };

    /*
    Causes this octree to subdivide itself if it has no children, and then
    redistribute its objects to its children if they fit. If the objects
    are too large to be distributed to children, they will remain in this
    octree.
    */


    Octree.prototype.split = function() {
      var id, obj, _ref;

      this.subdivide();
      _ref = this.objects;
      for (id in _ref) {
        obj = _ref[id];
        this.addToChild(obj);
      }
      return true;
    };

    /*
    Re-checks all objects in this node to make sure they don't belong in
    a child node. This method will not trigger a split or a merge on the
    current node, but the act of moving objects to child nodes may do so.
    */


    Octree.prototype.reEvaluateObjects = function() {
      var i, obj, _ref;

      if (this.isSubdivided()) {
        _ref = this.objects;
        for (i in _ref) {
          obj = _ref[i];
          this.addToChild(obj);
        }
      }
      return true;
    };

    /*
    Merges all of the children in this octree by moving their objects into
    this node and then un-subdividing this node.
    */


    Octree.prototype.merge = function() {
      var child, id, obj, _i, _len, _ref, _ref1;

      this._isSubdivided = false;
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child != null) {
          child.clear();
        }
      }
      this.objectCount = this.nestedObjectCount;
      _ref1 = this.nestedObjects;
      for (id in _ref1) {
        obj = _ref1[id];
        this.objects[id] = obj;
      }
      return true;
    };

    /*
    Recursively clears this octree, removing everything in it and its children,
    and then un-subdivides itself.
    */


    Octree.prototype.clear = function() {
      var child, id, obj, _i, _len, _ref, _ref1, _ref2;

      _ref = this.nestedObjects;
      for (id in _ref) {
        obj = _ref[id];
        delete this.nestedObjects[id];
      }
      _ref1 = this.objects;
      for (id in _ref1) {
        obj = _ref1[id];
        delete this.objects[id];
      }
      _ref2 = this.children;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        child = _ref2[_i];
        if (child != null) {
          child.clear();
        }
      }
      this._isSubdivided = false;
      return this.objectCount = this.nestedObjectCount = 0;
    };

    /*
    Attempts to add obj to one of the children of this node, returning
    false if no suitable child could be found.
    */


    Octree.prototype.addToChild = function(obj) {
      var child;

      child = this.getChildInQuadrant(obj.position);
      if (child.canContain(obj)) {
        if (this.objects[obj.__unique_id]) {
          delete this.objects[obj.__unique_id];
          this.objectCount--;
        }
        this._isParent = true;
        child.add(obj);
        this.trackNestedObject(obj);
        return true;
      } else {
        return false;
      }
    };

    /*
    Returns the quadrant index (from 0 through 7) for the specified
    position, which is a `vec3` in world space. If `dest` is supplied,
    it should be a `vec3` and is populated with `[-1|1, -1|1, -1|1]`,
    a (non-normalized) directional vector from the position
    of this node toward the specified position.
    
    The returned index can be used to access the `#children` in this
    node, but they are not guaranteed to have been instantiated yet.
    Use `#getChildInQuadrant` to ensure that the sub-node has been
    instantiated.
    */


    Octree.prototype.quadrant = function(pos, dest) {
      var position, quadrant;

      position = this.position;
      quadrant = 0;
      if (pos[0] > position[0]) {
        quadrant |= 1;
      }
      if (pos[1] > position[1]) {
        quadrant |= 2;
      }
      if (pos[2] > position[2]) {
        quadrant |= 4;
      }
      if (dest) {
        dest[0] = (quadrant & 1 ? 1 : -1);
        dest[1] = (quadrant & 2 ? 1 : -1);
        dest[2] = (quadrant & 4 ? 1 : -1);
      }
      return quadrant;
    };

    /*
    Finds and returns the node containing obj, or returns null if it can't
    be found.
    */


    Octree.prototype.find = function(obj) {
      var child, result, _i, _len, _ref;

      if (this.objects[obj.__unique_id]) {
        return this;
      } else {
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child && child.nestedObjects[obj.__unique_id]) {
            if (result = child.find(obj)) {
              return result;
            }
          }
        }
      }
      return null;
    };

    Octree.prototype.update = function(obj) {
      var id, node, replace;

      node = this.find(obj);
      replace = false;
      while (node && !node.canContain(obj)) {
        replace = true;
        id = obj.__unique_id;
        if (node.nestedObjects[id]) {
          delete node.nestedObjects[id];
          node.nestedObjectCount--;
        }
        if (node.objects[id]) {
          delete node.objects[id];
          node.objectCount--;
        }
        if (node.nestedObjectCount <= node.mergeThreshold) {
          node.merge();
        }
        node = node.parent;
      }
      if (!replace) {
        return;
      }
      node || (node = this);
      node.add(obj);
      return true;
    };

    /*
    Traverses this octree and its children, calling the callback method at each
    node. If the callback method returns `false` for any node, that node's children
    will not be traversed. If it returns any other value, `traverse` will recurse
    into the node's children.
    
    Nodes with an @nestedObjectCount equal to 0 are not processed.
    
    Nodes are always yielded in front-to-back order relative to the specified
    position, which must be a `vec3`.
    */


    Octree.prototype.traverse = function(pos, callback) {
      var first, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;

      if (this.nestedObjectCount === 0) {
        return;
      }
      if (callback(this) === false) {
        return;
      }
      if (this.isSubdivided()) {
        first = this.quadrant(pos);
        if ((_ref = this.children[first]) != null) {
          _ref.traverse(pos, callback);
        }
        if ((_ref1 = this.children[first ^ 1]) != null) {
          _ref1.traverse(pos, callback);
        }
        if ((_ref2 = this.children[first ^ 2]) != null) {
          _ref2.traverse(pos, callback);
        }
        if ((_ref3 = this.children[first ^ 4]) != null) {
          _ref3.traverse(pos, callback);
        }
        if ((_ref4 = this.children[first ^ 3]) != null) {
          _ref4.traverse(pos, callback);
        }
        if ((_ref5 = this.children[first ^ 5]) != null) {
          _ref5.traverse(pos, callback);
        }
        if ((_ref6 = this.children[first ^ 6]) != null) {
          _ref6.traverse(pos, callback);
        }
        if ((_ref7 = this.children[first ^ 7]) != null) {
          _ref7.traverse(pos, callback);
        }
      }
      return true;
    };

    return Octree;

  })();

}).call(this);
/*
A +Jax.World+ represents a scene in the graphics engine. All objects to be rendered (or at least,
all objects that you do not want to manually control!) should be added to the world. Each instance
of +Jax.Context+ has its own +Jax.World+, and the currently-active +Jax.World+ is delegated into
controllers and views as the +this.world+ property.
*/


(function() {
  Jax.World = (function() {
    var hashify, pickDataBuffers, singlePickArray;

    World.include(Jax.EventEmitter);

    function World(context) {
      var buf, world;

      this.context = context;
      this.renderOctree = false;
      this.lights = [];
      this._objects = {};
      this.ambientColor = new Jax.Color(0.05, 0.05, 0.05, 1);
      this._objectsArray = [];
      this._renderQueue = [];
      this._sortPosition = vec3.create();
      this._cameras = [];
      this.cameras = 1;
      this.octree = new Jax.Octree(20, 10);
      this._octreeModel = new Jax.Model({
        octree: this.octree
      });
      world = this;
      this.invalidateShadowMaps = function() {
        var light, obj, _i, _len, _ref;

        obj = this;
        if (obj.castShadow) {
          _ref = world.lights;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            light = _ref[_i];
            if (!(light.shadowmap && light.isInRange(obj))) {
              continue;
            }
            light.shadowmap.invalidate();
          }
        }
        return true;
      };
      this.updateOctree = function() {
        return world.octree.update(this);
      };
      buf = vec3.create();
      this._queueSorter = function(a, b) {
        var camPos, len1, len2, _ref, _ref1;

        camPos = world._sortPosition;
        len1 = vec3.length(vec3.subtract(buf, a.position, camPos)) - (((_ref = a.mesh) != null ? _ref.bounds.radius : void 0) || 0);
        len2 = vec3.length(vec3.subtract(buf, b.position, camPos)) - (((_ref1 = b.mesh) != null ? _ref1.bounds.radius : void 0) || 0);
        return len1 - len2;
      };
    }

    World.define('ambientColor', {
      get: function() {
        return this._ambientColor;
      },
      set: function(c) {
        (this._ambientColor || (this._ambientColor = new Jax.Color)).parse(c);
        return this.fireEvent('ambientChanged');
      }
    });

    World.getter('objects', function() {
      var obj, result, _i, _len, _ref;

      console.log("The getter `objects` is deprecated; please use `getObjects()` instead.\nNote that the latter returns an array, where the former used to be a\ngeneric object.");
      console.log(new Error().stack);
      result = {};
      _ref = this.getObjects();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        result[obj.__unique_id] = obj;
      }
      return result;
    });

    World.define('cameras', {
      get: function() {
        return this._cameras;
      },
      set: function(i) {
        var j, num, _i;

        if (i < 1) {
          i = 1;
        }
        num = this._cameras.length;
        this._cameras.length = i;
        if (i > num) {
          for (j = _i = num; num <= i ? _i < i : _i > i; j = num <= i ? ++_i : --_i) {
            this._cameras[j] = new Jax.Camera;
          }
        }
        return this.fireEvent('numCamerasChanged');
      }
    });

    /*
    Renders this World to its Jax context. If a material (or its name) is not
    specified, the object will be rendered using the `"default"` material.
    
    If `cull` is `false`, the octree will not be culled and all objects within
    it will be rendered. This defaults to `true`.
    
    Returns the total number of objects rendered.
    */


    World.prototype.render = function(material, cull) {
      if (material) {
        if (!(material instanceof Jax.Material)) {
          material = Jax.Material.find(material);
        }
      }
      return this.renderOpaques(material, cull) + this.renderTransparencies(material);
    };

    /*
    Renders the transparent objects in this scene. This is not meant to be
    called until after #renderOpaques, which simultaneously renders non-transparent
    objects and constructs the list of transparent ones.
    
    Returns the number of transparent objects rendered.
    */


    World.prototype.renderTransparencies = function(material) {
      var context, queue;

      context = this.context;
      queue = this._renderQueue;
      if (queue.length) {
        /*
        FIXME the octree does yield nodes in order, but can't yet guarantee the
        order of the objects in the node. No big deal for opaques but we have to
        sort the transparencies because of this. Also, objects not in the octree
        are in no particular order.
        */

        queue = queue.sort(this._queueSorter);
        while (queue.length) {
          queue.pop().render(context, material);
        }
      }
      return queue.length;
    };

    World.prototype.renderOrEnqueue = function(material, models) {
      var context, i, model, num, queue;

      context = this.context;
      queue = this._renderQueue;
      num = 0;
      for (i in models) {
        model = models[i];
        if (model.transparent || (model.mesh && model.mesh.transparent)) {
          queue.push(model);
        } else {
          model.render(context, material);
          num++;
        }
      }
      return num;
    };

    /*
    Renders the opaque objects in this scene and simultaneously builds up the list
    of transparent objects.
    
    Returns the number of opaque objects rendered.
    */


    World.prototype.renderOpaques = function(material, cull) {
      var numObjectsRendered;

      numObjectsRendered = 0;
      this._sortPosition[0] = this._sortPosition[1] = this._sortPosition[2] = 0;
      vec3.transformMat4(this._sortPosition, this._sortPosition, this.context.matrix_stack.getInverseModelViewMatrix());
      if (cull !== false) {
        numObjectsRendered += this.renderOpaquesInOctree(material);
      } else {
        numObjectsRendered += this.renderOrEnqueue(material, this.octree.nestedObjects);
      }
      return numObjectsRendered + this.renderOrEnqueue(material, this._objects);
    };

    /*
    Renders the opaque objects in the octree, and adds any transparent objects it
    encounters within the tree to the World's render queue to be rendered last.
    Does not actually render transparent objects. Returns the number of objects
    rendered.
    */


    World.prototype.renderOpaquesInOctree = function(material) {
      var context, frustum, numObjectsRendered, octreeModel, queue, renderOctree, _ref,
        _this = this;

      numObjectsRendered = 0;
      context = this.context;
      frustum = context.activeCamera.frustum;
      queue = this._renderQueue;
      _ref = [this.renderOctree, this.octreeModel], renderOctree = _ref[0], octreeModel = _ref[1];
      this.octree.traverse(this._sortPosition, function(node) {
        var keepRecursing, objectCount, objects, size;

        size = node.size * 2;
        switch (frustum.cube(node.position, size, size, size)) {
          case Jax.Frustum.OUTSIDE:
            return false;
          case Jax.Frustum.INSIDE:
            objectCount = node.nestedObjectCount;
            objects = node.nestedObjects;
            keepRecursing = false;
            break;
          default:
            objectCount = node.objectCount;
            objects = node.objects;
            keepRecursing = true;
        }
        if (renderOctree && objectCount) {
          node.mesh.render(context, octreeModel, material);
        }
        numObjectsRendered += _this.renderOrEnqueue(material, objects);
        return keepRecursing;
      });
      return numObjectsRendered;
    };

    /*
    Returns the framebuffer used for picking. See also #pickRegionalIndices.
    */


    World.prototype.getPickBuffer = function() {
      return this.pickBuffer || (this.pickBuffer = new Jax.Framebuffer({
        depth: true,
        width: this.context.canvas.width,
        height: this.context.canvas.height
      }));
    };

    /*
    Adds the light to the world and then returns the light itself unchanged.
    Alternatively, you may specify options describing the light, which will
    be used to instantiate it internally and then return the new light source.
    */


    World.prototype.addLight = function(light) {
      if (!(light instanceof Jax.Light)) {
        light = Jax.Light.find(light);
      }
      this.lights.push(light);
      this.fireEvent('lightAdded', light);
      return light;
    };

    /*
    Removes the specified light from the world. The light is returned.
    */


    World.prototype.removeLight = function(light) {
      this.lights.splice(this.lights.indexOf(light));
      this.fireEvent('lightRemoved', light);
      return light;
    };

    /*
    Adds the model to the world and then returns the model itself unchanged.
    
    Options:
      * `addToOctree`: if `false`, the object will be added to a flat array
        which is iterated every frame. If `true`, the object will be added
        to an octree and culled from rendering if it is off-screen. Defaults
        to `true`.
    
    Note: the object itself may also define a `cull` property. If false, it
    acts the same as setting the `addToOctree` option to false. This also
    applies to the object's mesh, if any. Also note that if the object has
    no mesh, it will not be added to the octree.
    */


    World.prototype.addObject = function(object, options) {
      var addToOctree;

      addToOctree = (!options || options.addToOctree !== false && options.cull !== false) && object.cull !== false && object.mesh && object.mesh.cull !== false;
      if (addToOctree) {
        this.octree.add(object);
        object.addEventListener('transformed', this.updateOctree);
        this.fireEvent('objectAddedToOctree');
      } else {
        this._objects[object.__unique_id] = object;
      }
      this.getObjects().push(object);
      this.fireEvent('objectAdded');
      if (object.castShadow !== false) {
        this.invalidateShadowMaps.call(object);
        object.addEventListener('transformed', this.invalidateShadowMaps);
      }
      return object;
    };

    /*
    Returns the object with the specified object ID if it has been added to
    this World, or undefined if it has not.
    */


    World.prototype.getObject = function(id) {
      var object, _i, _len, _ref;

      if (object = this._objects[id]) {
        return object;
      }
      _ref = this.getObjects();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        if (object.__unique_id === id) {
          return object;
        }
      }
      return null;
    };

    /*
    If the model has not been added to this World, nothing happens. Otherwise,
    the object is removed from this World.
    
    The object itself is returned.
    */


    World.prototype.removeObject = function(obj) {
      var node, objectArray;

      delete this._objects[obj.__unique_id];
      objectArray = this.getObjects();
      objectArray.splice(objectArray.indexOf(obj), 1);
      this.invalidateShadowMaps.call(obj);
      obj.removeEventListener('transformed', this.invalidateShadowMaps);
      obj.removeEventListener('transformed', this.updateOctree);
      if (node = this.octree.find(obj)) {
        node.remove(obj);
        this.fireEvent('objectRemovedFromOctree');
      }
      this.fireEvent('objectRemoved');
      return obj;
    };

    pickDataBuffers = {};

    hashify = function(a, b, c, d) {
      return "" + (a.toFixed(6)) + "," + (b.toFixed(6)) + "," + (c.toFixed(6)) + "," + (d.toFixed(6));
    };

    /*
    Receives RGBA image data, which should have been encoded during a render-to-texture
    using the 'picking' material. Iterates through the image data and populates `array`
    with exactly one of each decoded ID encountered. Returns the array in which IDs are
    stored.
    */


    World.prototype.parsePickData = function(rgba, array) {
      var i, index, _i, _ref;

      for (i = _i = 2, _ref = rgba.length; _i < _ref; i = _i += 4) {
        if (rgba[i] > 0) {
          index = Jax.Util.decodePickingColor(rgba[i - 2], rgba[i - 1], rgba[i], rgba[i + 1]);
          if (index !== void 0 && array.indexOf(index) === -1) {
            array.push(index);
          }
        }
      }
      return array;
    };

    /*
    Picks all visible object IDs within the specified rectangular region and
    returns them as elements in an array.
    
    If an array is not specified, a new one is created. Otherwise, the array's
    contents are cleared.
    
    The array of objects is returned.
    */


    World.prototype.pickRegionalIndices = function(x1, y1, x2, y2, ary) {
      var context, data, h, pickBuffer, w, x, y, _name, _ref, _ref1;

      if (ary == null) {
        ary = [];
      }
      _ref = [Math.min(x1, x2), Math.min(y1, y2)], x = _ref[0], y = _ref[1];
      _ref1 = [Math.max(x1, x2) - x, Math.max(y1, y2) - y], w = _ref1[0], h = _ref1[1];
      ary.length = 0;
      context = this.context;
      y = this.context.canvas.height - (y + h);
      data = pickDataBuffers[_name = hashify(x, y, w, h)] || (pickDataBuffers[_name] = new Uint8Array(w * h * 4));
      pickBuffer = this.getPickBuffer();
      pickBuffer.bind(context);
      pickBuffer.viewport(context);
      context.gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
      context.gl.disable(GL_BLEND);
      this.render("picking");
      context.gl.enable(GL_BLEND);
      context.gl.readPixels(x, y, w, h, GL_RGBA, GL_UNSIGNED_BYTE, data);
      if (data.data) {
        data = data.data;
      }
      pickBuffer.unbind(context);
      context.viewport();
      return this.parsePickData(data, ary);
    };

    /*
    Picks all visible objects within the specified rectangular regions and returns them
    as elements in an array. The specified array is populated with objects that were
    picked; if omitted, a new array is created.
    */


    World.prototype.pickRegion = function(x1, y1, x2, y2, array) {
      var i, result, _i, _ref;

      if (array == null) {
        array = [];
      }
      result = this.pickRegionalIndices(x1, y1, x2, y2, array);
      for (i = _i = 0, _ref = result.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        result[i] = Jax.Model.__instances[result[i]];
      }
      return result;
    };

    singlePickArray = new Array(1);

    /*
    Picks the visible object at the specified pixel coordinates and returns its unique ID.
    If no object is visible at the given position, returns `undefined`.
    */


    World.prototype.pickIndex = function(x, y) {
      return this.pickRegionalIndices(x, y, x + 1, y + 1, singlePickArray)[0];
    };

    /*
    Picks the visible object at the specified pixel coordinates and returns the object.
    If no object is visible at the given position, returns `undefined`.
    */


    World.prototype.pick = function(x, y) {
      return this.pickRegion(x, y, x + 1, y + 1, singlePickArray)[0];
    };

    /*
    Returns the number of objects currently registered with this World.
    */


    World.prototype.countObjects = function() {
      return this.getObjects().length;
    };

    /*
    Returns an array of all of the objects that have been added to this World.
    Note that the returned array should not be altered in-place; duplicate it
    if you need to make changes to it.
    */


    World.prototype.getObjects = function() {
      return this._objectsArray;
    };

    /*
    Updates each object in the world, passing the `timechange` argument into
    the objects' respective `update` functions (if they have one).
    */


    World.prototype.update = function(timechange) {
      var object, _i, _len, _ref, _results;

      _ref = this.getObjects();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        _results.push(typeof object.update === "function" ? object.update(timechange) : void 0);
      }
      return _results;
    };

    /*
    Disposes of this world by removing all references to its objects and
    disposing its light sources. Note that by default, objects within this 
    world will also be disposed. Pass `false` as an argument if you do not want
    the objects to be disposed.
    
    Note that both models and meshes _can_ be reused after disposal; they'll just
    be silently re-initialized. This means it is safe to dispose of models while
    they are still being used (although this is slower and not recommended if
    it can be avoided).
    */


    World.prototype.dispose = function(includeObjects) {
      var light, obj, _i, _j, _len, _len1, _ref, _ref1;

      if (includeObjects == null) {
        includeObjects = true;
      }
      if (includeObjects) {
        _ref = this.getObjects().slice(0);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          obj = _ref[_i];
          this.removeObject(obj);
          obj.dispose(this.context);
        }
      }
      _ref1 = this.lights.splice(0);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        light = _ref1[_j];
        this.removeLight(light);
        light.dispose(this.context);
      }
      this.ambientColor = new Jax.Color(0.05, 0.05, 0.05, 1);
      this.fireEvent('disposed');
      return true;
    };

    return World;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.POINT_LIGHT = 1;

  Jax.SPOT_LIGHT = 2;

  Jax.DIRECTIONAL_LIGHT = 3;

  Jax.Light = (function(_super) {
    var crMinIntensity, inRangeVec, __maxSpotAngle;

    __extends(Light, _super);

    __maxSpotAngle = Math.PI / 2 - Math.EPSILON;

    Light.getMaxSpotAngle = function() {
      return __maxSpotAngle;
    };

    function Light(options) {
      var _this = this;

      if (this.__proto__.constructor.name === 'Light') {
        if (options != null ? options.type : void 0) {
          switch (options.type) {
            case "SPOT_LIGHT":
            case Jax.SPOT_LIGHT:
              options.type = "Spot";
              break;
            case "POINT_LIGHT":
            case Jax.POINT_LIGHT:
              options.type = "Point";
              break;
            case "DIRECTIONAL_LIGHT":
            case Jax.DIRECITONAL_LIGHT:
              options.type = "Directional";
          }
          if (Jax.Light[options.type]) {
            return new Jax.Light[options.type](options);
          }
        }
      }
      this.shadows = false;
      this.enabled = true;
      this._color = new Jax.Light.Color;
      this._attenuation = new Jax.Light.Attenuation;
      this.innerSpotAngle = Math.PI / 4.375;
      this.outerSpotAngle = Math.PI / 4;
      this.attenuation.on('constantChanged', function() {
        return _this._maxEffectiveRangeCache = null;
      });
      this.attenuation.on('linearChanged', function() {
        return _this._maxEffectiveRangeCache = null;
      });
      this.attenuation.on('quadraticChanged', function() {
        return _this._maxEffectiveRangeCache = null;
      });
      Light.__super__.constructor.call(this, options);
    }

    Light.define('color', {
      get: function() {
        return this._color;
      },
      set: function(c) {
        return this._color = new Jax.Light.Color(c);
      }
    });

    Light.define('attenuation', {
      get: function() {
        return this._attenuation;
      },
      set: function(options) {
        return this._attenuation = new Jax.Light.Attenuation(options);
      }
    });

    Light.define('direction', {
      get: function() {
        return this.camera.direction;
      },
      set: function(dir) {
        return this.camera.direction = dir;
      }
    });

    Light.define('position', {
      get: function() {
        return this.camera.position;
      },
      set: function(pos) {
        return this.camera.position = pos;
      }
    });

    Light.define('innerSpotAngle', {
      get: function() {
        return this._innerSpotAngle;
      },
      set: function(c) {
        this._innerSpotAngle = c;
        this._innerSpotAngleCos = Math.cos(c / 2);
        this.trigger('innerSpotAngleChanged', c);
        if (this._outerSpotAngle < c) {
          return this.outerSpotAngle = c;
        }
      }
    });

    Light.define('outerSpotAngle', {
      get: function() {
        return this._outerSpotAngle;
      },
      set: function(c) {
        this._outerSpotAngle = c;
        this._outerSpotAngleCos = Math.cos(c / 2);
        this.trigger('outerSpotAngleChanged', c);
        if (this._innerSpotAngle > c) {
          return this.innerSpotAngle = c;
        }
      }
    });

    Light.define('outerSpotAngleCos', {
      get: function() {
        return this._outerSpotAngleCos;
      }
    });

    Light.define('innerSpotAngleCos', {
      get: function() {
        return this._innerSpotAngleCos;
      }
    });

    /*
    Returns true if the specified model is close enough to this light
    source to be at least partially illuminated by it. This does not 
    indicate whether or not the model is in shadow, which is a much
    more time-consuming calculation performed by
    `Jax.ShadowMap#isIlluminated`.
    */


    inRangeVec = vec3.create();

    Light.prototype.isInRange = function(model) {
      var dist, objPos, radius, range, _ref;

      radius = ((_ref = model.mesh) != null ? _ref.bounds.radius : void 0) || 0;
      objPos = model.position;
      dist = vec3.length(vec3.subtract(inRangeVec, objPos, this.position)) - radius;
      range = this.maxEffectiveRange();
      return range === -1 || range >= dist;
    };

    Light.prototype.dispose = function(context) {
      var _ref;

      return (_ref = this.shadowmap) != null ? _ref.dispose(context) : void 0;
    };

    Light.prototype.rotate = function(amount, axisX, axisY, axisZ) {
      return this.camera.rotate(amount, axisX, axisY, axisZ);
    };

    Light.prototype.eyeDirection = function(matrix, dest) {
      dest || (dest = vec3.create());
      return vec3.normalize(dest, vec3.transformMat3(dest, this.camera.direction, matrix));
    };

    Light.prototype.eyePosition = function(matrix, dest) {
      return vec3.transformMat4(dest, this.camera.position, matrix);
    };

    crMinIntensity = 10.0 / 256.0;

    Light.prototype.maxEffectiveRange = function(rangeIncrement) {
      var attenuation, distance;

      if (rangeIncrement == null) {
        rangeIncrement = 1.0;
      }
      if (this._maxEffectiveRangeCache) {
        return this._maxEffectiveRangeCache;
      }
      attenuation = this.attenuation;
      if (attenuation.constant < Math.EPSILON || attenuation.linear < Math.EPSILON || attenuation.quadratic < Math.EPSILON || (attenuation.constant < (1 / crMinIntensity) && attenuation.linear < Math.EPSILON && attenuation.quadratic < Math.EPSILON)) {
        return this._maxEffectiveRangeCache = -1;
      }
      distance = rangeIncrement;
      while (this.calculateIntensity(distance) > crMinIntensity) {
        distance += rangeIncrement;
      }
      return this._maxEffectiveRangeCache = distance;
    };

    Light.prototype.calculateIntensity = function(distance) {
      return 1.0 / (this.attenuation.constant + this.attenuation.linear * distance + this.attenuation.quadratic * distance * distance);
    };

    return Light;

  })(Jax.Model);

  Jax.Scene || (Jax.Scene = {});

  Jax.Scene.LightSource = (function(_super) {
    var notice;

    __extends(LightSource, _super);

    notice = function() {
      console.log('Please note that Jax.LightSource has been deprecated; it is now just Jax.Light.');
      return console.log('(You should also rename `app/assets/jax/resources/light_sources` to ' + '`app/assets/jax/resources/lights`.)');
    };

    function LightSource(options) {
      notice();
      LightSource.__super__.constructor.call(this, options);
    }

    LightSource.find = function() {
      var _ref;

      notice();
      return (_ref = Jax.Light).find.apply(_ref, arguments);
    };

    LightSource.addResources = function() {
      var _ref;

      notice();
      return (_ref = Jax.Light).addResources.apply(_ref, arguments);
    };

    return LightSource;

  })(Jax.Light);

  Jax.getGlobal().LightSource = Jax.LightSource = Jax.Scene.LightSource;

}).call(this);
(function() {
  var __slice = [].slice;

  Jax.Light.Attenuation = (function() {
    Attenuation.include(Jax.EventEmitter);

    Attenuation.define('constant', {
      get: function() {
        return this._constant;
      },
      set: function(v) {
        this._constant = v;
        return this.trigger('constantChanged', v);
      }
    });

    Attenuation.define('linear', {
      get: function() {
        return this._linear;
      },
      set: function(v) {
        this._linear = v;
        return this.trigger('linearChanged', v);
      }
    });

    Attenuation.define('quadratic', {
      get: function() {
        return this._quadratic;
      },
      set: function(v) {
        this._quadratic = v;
        return this.trigger('quadraticChanged', v);
      }
    });

    function Attenuation(defaults) {
      var _ref;

      this.constant = 0;
      this.linear = 1;
      this.quadratic = 0;
      if (defaults != null ? defaults.length : void 0) {
        _ref = __slice.call(defaults), this.constant = _ref[0], this.linear = _ref[1], this.quadratic = _ref[2];
      } else {
        if ((defaults != null ? defaults.constant : void 0) !== void 0) {
          this.constant = defaults.constant;
        }
        if ((defaults != null ? defaults.linear : void 0) !== void 0) {
          this.linear = defaults.linear;
        }
        if ((defaults != null ? defaults.quadratic : void 0) !== void 0) {
          this.quadratic = defaults.quadratic;
        }
      }
    }

    return Attenuation;

  })();

}).call(this);
(function() {
  Jax.Light.Color = (function() {
    Color.define('ambient', {
      get: function() {
        return this._ambient;
      },
      set: function(c) {
        return this._ambient = Jax.Color.parse(c);
      }
    });

    Color.define('diffuse', {
      get: function() {
        return this._diffuse;
      },
      set: function(c) {
        return this._diffuse = Jax.Color.parse(c);
      }
    });

    Color.define('specular', {
      get: function() {
        return this._specular;
      },
      set: function(c) {
        return this._specular = Jax.Color.parse(c);
      }
    });

    function Color(defaults) {
      this.diffuse = new Jax.Color(0.0, 0.0, 0.0, 1);
      this.specular = new Jax.Color(0.0, 0.0, 0.0, 1);
      this.ambient = new Jax.Color(0.0, 0.0, 0.0, 1);
      if (defaults) {
        if (defaults.length || defaults.toVec4) {
          this.diffuse = defaults;
          this.specular = defaults;
          this.ambient = defaults;
        } else {
          if (defaults.diffuse !== void 0) {
            this.diffuse = defaults.diffuse;
          }
          if (defaults.specular !== void 0) {
            this.specular = defaults.specular;
          }
          if (defaults.ambient !== void 0) {
            this.ambient = defaults.ambient;
          }
        }
      }
    }

    return Color;

  })();

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Light.Directional = (function(_super) {
    __extends(Directional, _super);

    function Directional(options) {
      Directional.__super__.constructor.call(this, options);
      this.innerSpotAngle = Math.PI;
      this.outerSpotAngle = Math.PI;
      this.type = Jax.DIRECTIONAL_LIGHT;
      this.shadowmap = new Jax.ShadowMap.Directional(this);
    }

    /*
    Directional lights must by definition always have constant
    attenuation. This property shouldn't be modified.
    */


    Directional.define('attenuation', {
      get: function() {
        return this._realAttenuation || (this._realAttenuation = new Jax.Light.Attenuation({
          constant: 1,
          linear: 0,
          quadratic: 0
        }));
      }
    });

    return Directional;

  })(Jax.Light);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Light.Point = (function(_super) {
    __extends(Point, _super);

    function Point(options) {
      Point.__super__.constructor.call(this, options);
      this.innerSpotAngle = Math.PI * 2;
      this.outerSpotAngle = Math.PI * 2;
      this.type = Jax.POINT_LIGHT;
      this.shadowmap = new Jax.ShadowMap.Point(this);
    }

    return Point;

  })(Jax.Light);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Light.Spot = (function(_super) {
    __extends(Spot, _super);

    function Spot(options) {
      Spot.__super__.constructor.call(this, options);
      this.type = Jax.SPOT_LIGHT;
      this.shadowmap = new Jax.ShadowMap.Spot(this);
    }

    return Spot;

  })(Jax.Light);

}).call(this);
(function() {
  Jax.ShadowMap = (function() {
    var illuminationArray;

    function ShadowMap(light) {
      var _this = this;

      this.light = light;
      this._shadowMatrix = mat4.create();
      this._projectionMatrix = mat4.create();
      this._isValid = false;
      this.light.camera.addEventListener('updated', function() {
        return _this.invalidate();
      });
      this.biasMatrix = mat4.identity(mat4.create());
      this.clearColor = [0, 0, 0, 0];
      this.cullFace = GL_FRONT;
      mat4.translate(this.biasMatrix, this.biasMatrix, [0.5, 0.5, 0.5]);
      mat4.scale(this.biasMatrix, this.biasMatrix, [0.5, 0.5, 0.5]);
    }

    ShadowMap.getter('shadowMatrix', function() {
      if (!this.isValid()) {
        this.validate();
      }
      return this._shadowMatrix;
    });

    ShadowMap.getter('projectionMatrix', function() {
      if (!this.isValid()) {
        this.validate();
      }
      return this._projectionMatrix;
    });

    ShadowMap.prototype.bindTextures = function(context, vars, texture1) {
      var _ref;

      return vars[texture1] = (_ref = this.shadowmapFBO) != null ? _ref.getTexture(context, 0) : void 0;
    };

    /*
    Sets up the projection matrix used to render to the framebuffer object from the
    light's point of view. This method should be overridden by subclasses to construct
    the optimum view frustum for a particular type of light. For example, a spot light
    should constrain the view frustum to the light's spot radius, while a directional
    light should encompass the entire visible scene.
    */


    ShadowMap.prototype.setupProjection = function(projection) {
      throw new Error("ShadowMap type " + this.__proto__.constructor.name + " did not initialize its projection matrix!");
    };

    ShadowMap.prototype.validate = function(context) {
      var maxSize;

      if (context && !this._isValid) {
        if (!this._initialized) {
          maxSize = context.gl.getParameter(context.gl.MAX_RENDERBUFFER_SIZE);
          if (maxSize > 1024) {
            maxSize = 1024;
          }
          this.width = this.height = maxSize;
          this.shadowmapFBO = new Jax.Framebuffer({
            width: this.width,
            height: this.height,
            depth: true,
            color: GL_RGBA
          });
          this._initialized = true;
        }
        this.setupProjection(this._projectionMatrix, context);
        mat4.copy(this._shadowMatrix, this.light.camera.getInverseTransformationMatrix());
        mat4.multiply(this._shadowMatrix, this._projectionMatrix, this._shadowMatrix);
        this._isValid = true;
        this.illuminate(context);
        return mat4.multiply(this._shadowMatrix, this.biasMatrix, this._shadowMatrix);
      }
    };

    ShadowMap.prototype.invalidate = function() {
      return this._isValid = this._isUpToDate = false;
    };

    ShadowMap.prototype.dispose = function(context) {
      var _ref, _ref1;

      if ((_ref = this.shadowmapFBO) != null) {
        _ref.dispose(context);
      }
      return (_ref1 = this.illuminationFBO) != null ? _ref1.dispose(context) : void 0;
    };

    ShadowMap.prototype.isValid = function() {
      return this._isValid;
    };

    /*
    Applies the light's view and projection matrices, and resets the model matrix.
    */


    ShadowMap.prototype.setupMatrices = function(stack) {
      stack.loadModelMatrix(mat4.IDENTITY);
      stack.loadViewMatrix(this.shadowMatrix);
      return stack.loadProjectionMatrix(mat4.IDENTITY);
    };

    ShadowMap.prototype.isDualParaboloid = function() {
      return false;
    };

    /*
    Renders the scene from the light's point of view. This method should be
    overridden by subclasses if they need a specialized render process (for
    example, rendering more than one pass).
    */


    ShadowMap.prototype.illuminate = function(context, material, fbo, capture) {
      var clearColor, gl,
        _this = this;

      if (material == null) {
        material = 'depthmap';
      }
      if (fbo == null) {
        fbo = this.shadowmapFBO;
      }
      if (capture == null) {
        capture = false;
      }
      gl = context.gl;
      clearColor = context.renderer.clearColor;
      fbo.bind(context, function() {
        var cc;

        fbo.viewport(context);
        cc = _this.clearColor;
        gl.clearColor(cc[0], cc[1], cc[2], cc[3]);
        gl.clear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        gl.disable(GL_BLEND);
        gl.enable(GL_POLYGON_OFFSET_FILL);
        if (_this.cullFace) {
          gl.cullFace(_this.cullFace);
        }
        gl.polygonOffset(2, 2);
        context.matrix_stack.push();
        _this.setupMatrices(context.matrix_stack);
        context.world.render(material, false);
        context.matrix_stack.pop();
        if (capture) {
          return gl.readPixels(0, 0, _this.width, _this.height, GL_RGBA, GL_UNSIGNED_BYTE, _this.illuminationData);
        }
      });
      gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
      context.viewport();
      gl.polygonOffset(0, 0);
      gl.disable(GL_POLYGON_OFFSET_FILL);
      gl.cullFace(GL_BACK);
      return gl.enable(GL_BLEND);
    };

    illuminationArray = [];

    ShadowMap.prototype.isIlluminated = function(model, context) {
      var cullFace;

      this.validate(context);
      this.illuminationFBO || (this.illuminationFBO = new Jax.Framebuffer({
        width: this.width,
        height: this.height,
        depth: true,
        color: GL_RGBA
      }));
      this.illuminationData || (this.illuminationData = new Uint8Array(this.width * this.height * 4));
      cullFace = this.cullFace;
      this.cullFace = null;
      this.illuminate(context, 'picking', this.illuminationFBO, true);
      this.cullFace = cullFace;
      context.world.parsePickData(this.illuminationData, illuminationArray);
      return illuminationArray.indexOf(model.__unique_id) !== -1;
    };

    return ShadowMap;

  })();

}).call(this);
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.ShadowMap.Directional = (function(_super) {
    var center;

    __extends(Directional, _super);

    function Directional() {
      _ref = Directional.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    center = vec3.create();

    Directional.prototype.setupProjection = function(projection, context) {
      var count, dist, length, obj, sceneRadius, _i, _j, _len, _len1, _ref1, _ref2, _ref3;

      center[0] = center[1] = center[2] = 0;
      count = 0;
      _ref1 = context.world.getObjects();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        obj = _ref1[_i];
        if (!obj.castShadow) {
          continue;
        }
        count += 1;
        vec3.add(center, obj.camera.position, center);
      }
      if (count > 0) {
        vec3.scale(center, center, 1 / count);
        this.light.camera.position = center;
        sceneRadius = 0;
        dist = vec3.create();
        _ref2 = context.world.getObjects();
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          obj = _ref2[_j];
          if (!obj.castShadow) {
            continue;
          }
          length = vec3.length(vec3.subtract(dist, center, obj.camera.position)) + ((_ref3 = obj.mesh) != null ? _ref3.bounds.radius : void 0);
          if (sceneRadius < length) {
            sceneRadius = length;
          }
        }
        if (sceneRadius === 0) {
          sceneRadius = 1;
        }
        return mat4.ortho(projection, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius, -sceneRadius, sceneRadius);
      } else {
        return mat4.ortho(projection, -1, 1, -1, 1, -1, 1);
      }
    };

    return Directional;

  })(Jax.ShadowMap);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Jax.ShadowMap.Point = (function(_super) {
    var relative;

    __extends(Point, _super);

    function Point() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Point.__super__.constructor.apply(this, args);
      this.clearColor = [0, 0, 0, 0];
      mat4.identity(this.biasMatrix);
    }

    Point.prototype.illuminate = function(context, material, fbo) {
      var layer;

      if (material == null) {
        material = 'paraboloid-depthmap';
      }
      if (fbo == null) {
        fbo = this.shadowmapFBO;
      }
      if (!this.backFBO) {
        this.backFBO = new Jax.Framebuffer({
          width: this.width,
          height: this.height,
          depth: true,
          color: GL_RGBA
        });
      }
      material = Jax.Material.find(material);
      layer = material.findLayer(Jax.Material.Layer.Paraboloid);
      layer.paraboloidNear = this.paraboloidNear;
      layer.paraboloidFar = this.paraboloidFar;
      this.cullFace = GL_FRONT;
      layer.direction = 1;
      Point.__super__.illuminate.call(this, context, material, fbo);
      this.cullFace = GL_BACK;
      layer.direction = -1;
      return Point.__super__.illuminate.call(this, context, material, this.backFBO);
    };

    Point.prototype.dispose = function(context) {
      var _ref;

      Point.__super__.dispose.call(this, context);
      return (_ref = this.backFBO) != null ? _ref.dispose(context) : void 0;
    };

    Point.prototype.isDualParaboloid = function() {
      return true;
    };

    Point.prototype.bindTextures = function(context, vars, front, back) {
      Point.__super__.bindTextures.call(this, context, vars, front);
      return vars[back] = this.backFBO.getTexture(context, 0);
    };

    relative = vec3.create();

    Point.prototype.setupProjection = function(projection, context) {
      var dist, far, id, mostDistant, obj, rangeIncrement, _ref, _ref1;

      mat4.identity(projection);
      mostDistant = 0;
      _ref = context.world.getObjects();
      for (id in _ref) {
        obj = _ref[id];
        vec3.subtract(relative, this.light.position, obj.camera.position);
        dist = vec3.length(relative) + ((_ref1 = obj.mesh) != null ? _ref1.bounds.radius : void 0);
        if (dist > mostDistant) {
          mostDistant = dist;
        }
      }
      rangeIncrement = (mostDistant / 100) || 0.1;
      far = this.light.maxEffectiveRange(rangeIncrement);
      if (far === -1) {
        far = mostDistant;
      }
      this.paraboloidNear = 0.1;
      return this.paraboloidFar = far;
    };

    return Point;

  })(Jax.ShadowMap);

}).call(this);
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.ShadowMap.Spot = (function(_super) {
    var relative;

    __extends(Spot, _super);

    function Spot() {
      _ref = Spot.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    relative = vec3.create();

    Spot.prototype.setupProjection = function(projection, context) {
      var angle, aspect_ratio, dist, far, fov, id, mostDistant, near, obj, rangeIncrement, _ref1, _ref2;

      mostDistant = 0;
      _ref1 = context.world.getObjects();
      for (id in _ref1) {
        obj = _ref1[id];
        vec3.subtract(relative, this.light.position, obj.camera.position);
        dist = vec3.length(relative) + ((_ref2 = obj.mesh) != null ? _ref2.bounds.radius : void 0);
        if (dist > mostDistant) {
          mostDistant = dist;
        }
      }
      rangeIncrement = (mostDistant / 100) || 0.1;
      far = this.light.maxEffectiveRange(rangeIncrement);
      if (far === -1) {
        far = mostDistant;
      }
      angle = this.light.outerSpotAngle;
      if (angle <= Math.EPSILON) {
        angle = Math.EPSILON;
      }
      angle += Math.EPSILON;
      fov = angle;
      near = 0.1;
      aspect_ratio = this.width / this.height;
      return mat4.perspective(projection, fov, aspect_ratio, near, far);
    };

    return Spot;

  })(Jax.ShadowMap);

}).call(this);
Jax.shader_data("lib")["lights"] = "#define MAX_LIGHTS 1\n\nshared uniform vec4 LightDiffuseColor;\nshared uniform vec3 EyeSpaceLightDirection;\nshared uniform vec3 EyeSpaceLightPosition;\nshared uniform int LightType;\nshared uniform float LightSpotInnerCos;\nshared uniform float LightSpotOuterCos;\nshared uniform vec4 LightSpecularColor;\n";
Jax.shader_data("attenuation")["fragment"] = "<%= Jax.import_shader_code(\"lib\", \"lights\") %>\n\nshared uniform int PASS;\nshared uniform float ConstantAttenuation;\nshared uniform float LinearAttenuation;\nshared uniform float QuadraticAttenuation;\n\nvoid main(void) {\n  if (PASS != 0) {\n    cache(float, LightDistanceFromSurface) { LightDistanceFromSurface = 1.0; }\n    cache(float, SpotAttenuation) { SpotAttenuation = 1.0; }\n\n    float multiplier = 1.0;\n    import(AttenuationMultiplier, multiplier *= AttenuationMultiplier);\n\n    // the SkipAttenuation stuff will be optimized out by the compiler since it will\n    // be essentially become a set of constant expressions\n    int skipAttenuation = 0;\n    import(SkipAttenuation, skipAttenuation += SkipAttenuation);\n  \n    if (skipAttenuation == 0) {\n      multiplier *= SpotAttenuation;\n      gl_FragColor.rgb *= multiplier / (ConstantAttenuation +\n                                 LinearAttenuation * LightDistanceFromSurface +\n                                 QuadraticAttenuation * pow(LightDistanceFromSurface, 2.0));\n    }\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Attenuation = (function(_super) {
    __extends(Attenuation, _super);

    function Attenuation(options) {
      Attenuation.__super__.constructor.call(this, options);
    }

    Attenuation.prototype.numPasses = function(context) {
      return context.world.lights.length + 1;
    };

    Attenuation.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var light;

      vars.PASS = pass;
      if (!pass) {
        return;
      }
      light = context.world.lights[pass - 1];
      vars.ConstantAttenuation = light.attenuation.constant;
      vars.LinearAttenuation = light.attenuation.linear;
      return vars.QuadraticAttenuation = light.attenuation.quadratic;
    };

    return Attenuation;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("clamp_color")["fragment"] = "void main(void) { gl_FragColor = clamp(gl_FragColor, 0.0, 1.0); }\n";
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.ClampColor = (function(_super) {
    __extends(ClampColor, _super);

    function ClampColor() {
      _ref = ClampColor.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return ClampColor;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("depthmap")["common"] = "shared uniform mat4 pMatrix;\n";
Jax.shader_data("functions")["depth_map"] = "vec4 pack_depth(in float depth)\n{\n  vec4 bit_shift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);\n  vec4 bit_mask  = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);\n  vec4 res = fract(depth * bit_shift);\n  res -= res.xxyz * bit_mask;\n  return res;\n}\n\nfloat unpack_depth(in vec4 rgba_depth)\n{\n  vec4 bit_shift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);\n  float depth = dot(rgba_depth, bit_shift);\n  return depth;\n}\n";
Jax.shader_data("depthmap")["fragment"] = "<%= Jax.import_shader_code(\"functions\", \"depth_map\") %>\n\nvoid main(void) {\n  vec4 pos = gl_FragCoord;\n  gl_FragColor = pack_depth(pos.z);\n}\n";
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Depthmap = (function(_super) {
    __extends(Depthmap, _super);

    function Depthmap() {
      _ref = Depthmap.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Depthmap.prototype.setVariables = function(context, mesh, model, vars, pass) {
      if (!model.castShadow) {
        return false;
      }
    };

    return Depthmap;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("fog")["common"] = "const float LOG2 = 1.442695;\n\nuniform vec4 FogColor;\nuniform int Algorithm;\nuniform float Scale;\nuniform float End;\nuniform float Start;\nuniform float Density;\n\nvarying float vDistance;\n\nshared uniform mat4 ModelViewProjectionMatrix;\n";
Jax.shader_data("fog")["fragment"] = "void main() {\n  /*\n  I used to use gl_FragCoord.z / gl_FragCoord.w but noted that\n  at least on my machine, it didn't interpolate cleanly; I don't\n  know how best to define the issue but it seemed at first similar\n  to a contrast or gamma issue. Switching to my own varying fixes\n  the issue.\n  */\n  \n  float fog;\n\n  if (Algorithm == <%= Jax.LINEAR %>) {\n    fog = smoothstep(Start, End, vDistance);\n  } else if (Algorithm == <%= Jax.EXPONENTIAL %>) {\n    fog = exp(-Density * vDistance);\n    fog = 1.0 - clamp(fog, 0.0, 1.0);\n  } else if (Algorithm == <%= Jax.EXP2 %>) {\n    fog = exp2(-Density * Density * vDistance * vDistance * LOG2);\n    fog = 1.0 - clamp(fog, 0.0, 1.0);\n  }\n  \n  gl_FragColor.rgb = mix(gl_FragColor.rgb, FogColor.rgb, fog);\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.LINEAR = 1;

  Jax.EXPONENTIAL = 2;

  Jax.EXP2 = 3;

  Jax.Material.Layer.Fog = (function(_super) {
    __extends(Fog, _super);

    Fog.define('color', {
      get: function() {
        return this._color;
      },
      set: function(c) {
        return this._color = Jax.Color.parse(c);
      }
    });

    function Fog(options) {
      options || (options = {});
      this.start = options.start;
      this.end = options.end;
      this.density = options.density || 0.0025;
      this.algorithm = options.algorithm || Jax.EXP2;
      this.color = options.color || Jax.Color.parse('#fff');
      this.color = Jax.Util.colorize(this.color);
      this._positionMap = {
        vertices: 'VERTEX_POSITION'
      };
      Fog.__super__.constructor.call(this, options);
      switch (this.algorithm) {
        case Jax.LINEAR:
        case Jax.EXPONENTIAL:
        case Jax.EXP2:
          break;
        case 'LINEAR':
        case 'EXPONENTIAL':
        case 'EXP2':
          options.algorithm = Jax[options.algorithm];
          break;
        default:
          throw new Error("Jax: Fog algorithm must be one of LINEAR, EXPONENTIAL, or EXP2");
      }
    }

    Fog.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var _ref, _ref1;

      if (this.start) {
        vars.Start = this.start;
      } else {
        vars.Start = ((_ref = context.activeCamera.projection) != null ? _ref.near : void 0) || 0.1;
      }
      if (this.end) {
        vars.End = this.end;
      } else {
        vars.End = ((_ref1 = context.activeCamera.projection) != null ? _ref1.far : void 0) || 200;
      }
      vars.Scale = 1.0 / (vars.End - vars.Start);
      vars.Algorithm = this.algorithm;
      vars.Density = this.density;
      vars.FogColor = this.color;
      vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix();
      return mesh.data.set(vars, this._positionMap);
    };

    return Fog;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("fog")["vertex"] = "shared attribute vec4 VERTEX_POSITION;\n\nvoid main(void) {\n  vDistance = (ModelViewProjectionMatrix * VERTEX_POSITION).z;\n}\n";
Jax.shader_data("functions")["lights"] = "shared uniform bool LIGHT_ENABLED;\nshared uniform int LIGHT_TYPE;\nshared uniform vec3 LIGHT_POSITION, LIGHT_DIRECTION;\nshared uniform vec4 LIGHT_AMBIENT, LIGHT_DIFFUSE, LIGHT_SPECULAR;\nshared uniform float LIGHT_ATTENUATION_CONSTANT, LIGHT_ATTENUATION_LINEAR, LIGHT_ATTENUATION_QUADRATIC,\n                     LIGHT_SPOT_EXPONENT, LIGHT_SPOT_COS_CUTOFF;\n\nfloat calcAttenuation(in vec3 ecPosition3,\n                      out vec3 lightDirection)\n{\n//  lightDirection = vec3(vnMatrix * -light.position) - ecPosition3;\n  lightDirection = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  float d = length(lightDirection);\n  \n  return 1.0 / (LIGHT_ATTENUATION_CONSTANT + LIGHT_ATTENUATION_LINEAR * d + LIGHT_ATTENUATION_QUADRATIC * d * d);\n}\n\nvoid DirectionalLight(in vec3 normal,\n                      inout vec4 ambient,\n                      inout vec4 diffuse,\n                      inout vec4 specular)\n{\n  vec3 nLDir = normalize(vnMatrix * -normalize(LIGHT_DIRECTION));\n  vec3 halfVector = normalize(nLDir + vec3(0,0,1));\n  float pf;\n    \n  float NdotD  = max(0.0, dot(normal, nLDir));\n  float NdotHV = max(0.0, dot(normal, halfVector));\n    \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n    \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\n/* Use when attenuation != (1,0,0) */\nvoid PointLightWithAttenuation(in vec3 ecPosition3,\n                               in vec3 normal,\n                               inout vec4 ambient,\n                               inout vec4 diffuse,\n                               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n\n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n\n/* Use for better performance when attenuation == (1,0,0) */\nvoid PointLightWithoutAttenuation(in vec3 ecPosition3,\n                                  in vec3 normal,\n                                  inout vec4 ambient,\n                                  inout vec4 diffuse,\n                                  inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float d;     // distance from surface to light source\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  \n  VP = vec3(ivMatrix * vec4(LIGHT_POSITION, 1.0)) - ecPosition3;\n  d = length(VP);\n  VP = normalize(VP);\n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT;\n  diffuse += LIGHT_DIFFUSE * NdotD;\n  specular += LIGHT_SPECULAR * pf;\n}\n\nvoid SpotLight(in vec3 ecPosition3,\n               in vec3 normal,\n               inout vec4 ambient,\n               inout vec4 diffuse,\n               inout vec4 specular)\n{\n  float NdotD; // normal . light direction\n  float NdotHV;// normal . half vector\n  float pf;    // specular factor\n  float attenuation;\n  vec3 VP;     // direction from surface to light position\n  vec3 halfVector; // direction of maximum highlights\n  float spotDot; // cosine of angle between spotlight\n  float spotAttenuation; // spotlight attenuation factor\n  \n  attenuation = calcAttenuation(ecPosition3, VP);\n  VP = normalize(VP);\n  \n  // See if point on surface is inside cone of illumination\n  spotDot = dot(-VP, normalize(vnMatrix*LIGHT_DIRECTION));\n  if (spotDot < LIGHT_SPOT_COS_CUTOFF)\n    spotAttenuation = 0.0;\n  else spotAttenuation = pow(spotDot, LIGHT_SPOT_EXPONENT);\n  \n  attenuation *= spotAttenuation;\n  \n  halfVector = normalize(VP+vec3(0,0,1));\n  NdotD = max(0.0, dot(normal, VP));\n  NdotHV= max(0.0, dot(normal, halfVector));\n  \n  if (NdotD == 0.0) pf = 0.0;\n  else pf = pow(NdotHV, materialShininess);\n  \n  ambient += LIGHT_AMBIENT * attenuation;\n  diffuse += LIGHT_DIFFUSE * NdotD * attenuation;\n  specular += LIGHT_SPECULAR * pf * attenuation;\n}\n";
Jax.shader_data("functions")["noise"] = "/**\n * Classic and 'improved' (simplex) Perlin noise.\n *\n * This implementation attempts to use texture-based lookups if the client\n * hardware can support it. This is no problem in fragment shaders but can\n * be an issue in vertex shaders, where VTL is not supported by about 20%\n * of clients.\n *\n * In the event this is a vertex shader *and* the client doesn't support\n * VTL, the functions will fall back to 'ashima' noise\n * (https://github.com/ashima/webgl-noise) for a slower, non-texture-based\n * implementation.\n **/\n\n \n<% if (shaderType != 'vertex' || maxVertexTextureImageUnits > 0) { %>\n  /*\n   * Author: Stefan Gustavson (stegu@itn.liu.se) 2004, 2005, 2012\n   * Stefan's original implementation: http://www.itn.liu.se/~stegu/simplexnoise/\n   */\n\n\n  /*\n   * 2D, 3D and 4D Perlin noise, classic and simplex, in a GLSL fragment shader.\n   *\n   * Classic noise is implemented by the functions:\n   * float noise(vec2 P)\n   * float noise(vec3 P)\n   * float noise(vec4 P)\n   *\n   * Simplex noise is implemented by the functions:\n   * float snoise(vec2 P)\n   * float snoise(vec3 P)\n   * float snoise(vec4 P)\n   *\n   * Author: Stefan Gustavson ITN-LiTH (stegu@itn.liu.se) 2004-12-05\n   * Simplex indexing functions by Bill Licea-Kane, ATI (bill@ati.com)\n   * Modified to use same texture for 2D, 3D and 4D 2012-03-27.\n   *\n   * You may use, modify and redistribute this code free of charge,\n   * provided that the author's names and this notice appear intact.\n   */\n\n  /*\n   * The value of classic 4D noise goes above 1.0 and below -1.0 at some\n   * points. Not much and only very sparsely, but it happens. This is a\n   * long standing bug from Perlin's original software implementation,\n   * so I left it untouched.\n   */\n\n\n  /*\n   * \"gradTexture\" is a 256x256 RGBA texture that is used for both the\n   * permutations, encoded in A, and the 2D, 3D and 4D gradients,\n   * encoded in RGB with x in R, y in B and z and w combined in B.\n   * For details, see the main C program.\n   */\n  shared uniform sampler2D gradTexture;\n\n  /*\n   * To create offsets of one texel and one half texel in the\n   * texture lookup, we need to know the texture image size.\n   */\n  #define ONE 0.00390625\n  #define ONEHALF 0.001953125\n  // The numbers above are 1/256 and 0.5/256, change accordingly\n  // if you change the code to use another texture size.\n\n\n  /*\n   * The interpolation function for classic noise. This could be a 1D texture\n   * lookup to possibly gain some speed, but it's not the main part of the\n   * algorithm, and the texture bandwidth is pretty choked up as it is.\n   */\n  shared float fade(float t) {\n    // return t*t*(3.0-2.0*t); // Old fade, yields discontinuous second derivative\n    return t*t*t*(t*(t*6.0-15.0)+10.0); // Improved fade, yields C2-continuous noise\n  }\n\n  /*\n   * Efficient simplex indexing functions by Bill Licea-Kane, ATI. Thanks!\n   * (This was originally implemented as a 1D texture lookup. Nice to avoid that.)\n   */\n  shared void simplex( const in vec3 P, out vec3 offset1, out vec3 offset2 )\n  {\n    vec3 offset0;\n \n    vec2 isX = step( P.yz, P.xx ); // P.x >= P.y ? 1.0 : 0.0;  P.x >= P.z ? 1.0 : 0.0;\n    offset0.x  = isX.x + isX.y;    // Accumulate all P.x >= other channels in offset.x\n    offset0.yz = 1.0 - isX;        // Accumulate all P.x <  other channels in offset.yz\n\n    float isY = step( P.z, P.y );  // P.y >= P.z ? 1.0 : 0.0;\n    offset0.y += isY;              // Accumulate P.y >= P.z in offset.y\n    offset0.z += 1.0 - isY;        // Accumulate P.y <  P.z in offset.z\n \n    // offset0 now contains the unique values 0,1,2 in each channel\n    // 2 for the channel greater than other channels\n    // 1 for the channel that is less than one but greater than another\n    // 0 for the channel less than other channels\n    // Equality ties are broken in favor of first x, then y\n    // (z always loses ties)\n\n    offset2 = clamp( offset0, 0.0, 1.0 );\n    // offset2 contains 1 in each channel that was 1 or 2\n    offset1 = clamp( offset0-1.0, 0.0, 1.0 );\n    // offset1 contains 1 in the single channel that was 1\n  }\n\n  shared void simplex( const in vec4 P, out vec4 offset1, out vec4 offset2, out vec4 offset3 )\n  {\n    vec4 offset0;\n \n    vec3 isX = step( P.yzw, P.xxx );        // See comments in 3D simplex function\n    offset0.x = isX.x + isX.y + isX.z;\n    offset0.yzw = 1.0 - isX;\n\n    vec2 isY = step( P.zw, P.yy );\n    offset0.y += isY.x + isY.y;\n    offset0.zw += 1.0 - isY;\n \n    float isZ = step( P.w, P.z );\n    offset0.z += isZ;\n    offset0.w += 1.0 - isZ;\n\n    // offset0 now contains the unique values 0,1,2,3 in each channel\n\n    offset3 = clamp( offset0, 0.0, 1.0 );\n    offset2 = clamp( offset0-1.0, 0.0, 1.0 );\n    offset1 = clamp( offset0-2.0, 0.0, 1.0 );\n  }\n\n\n  /*\n   * 2D classic Perlin noise. Fast, but less useful than 3D noise.\n   */\n  shared float noise(vec2 P)\n  {\n    vec2 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled and offset for texture lookup\n    vec2 Pf = fract(P);             // Fractional part for interpolation\n\n    // Noise contribution from lower left corner\n    vec2 grad00 = texture2D(gradTexture, Pi).rg * 4.0 - 2.0;\n    float n00 = dot(grad00, Pf);\n\n    // Noise contribution from lower right corner\n    vec2 grad10 = texture2D(gradTexture, Pi + vec2(ONE, 0.0)).rg * 4.0 - 2.0;\n    float n10 = dot(grad10, Pf - vec2(1.0, 0.0));\n\n    // Noise contribution from upper left corner\n    vec2 grad01 = texture2D(gradTexture, Pi + vec2(0.0, ONE)).rg * 4.0 - 2.0;\n    float n01 = dot(grad01, Pf - vec2(0.0, 1.0));\n\n    // Noise contribution from upper right corner\n    vec2 grad11 = texture2D(gradTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 2.0;\n    float n11 = dot(grad11, Pf - vec2(1.0, 1.0));\n\n    // Blend contributions along x\n    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade(Pf.x));\n\n    // Blend contributions along y\n    float n_xy = mix(n_x.x, n_x.y, fade(Pf.y));\n\n    // We're done, return the final noise value.\n    return 1.7 * n_xy;\n  }\n\n\n  /*\n   * 3D classic noise. Slower, but a lot more useful than 2D noise.\n   */\n  shared float noise(vec3 P)\n  {\n    vec3 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel\n                                    // and offset 1/2 texel to sample texel centers\n    vec3 Pf = fract(P);     // Fractional part for interpolation\n\n    // Noise contributions from (x=0, y=0), z=0 and z=1\n    float perm00 = texture2D(gradTexture, Pi.xy).a ;\n    vec3  grad000 = texture2D(gradTexture, vec2(perm00, Pi.z)).rgb * 4.0 - 2.0;\n    grad000.z = floor(grad000.z); // Remove small variations due to w\n    float n000 = dot(grad000, Pf);\n    vec3  grad001 = texture2D(gradTexture, vec2(perm00, Pi.z + ONE)).rgb * 4.0 - 2.0;\n    grad001.z = floor(grad001.z); // Remove small variations due to w\n    float n001 = dot(grad001, Pf - vec3(0.0, 0.0, 1.0));\n\n    // Noise contributions from (x=0, y=1), z=0 and z=1\n    float perm01 = texture2D(gradTexture, Pi.xy + vec2(0.0, ONE)).a ;\n    vec3  grad010 = texture2D(gradTexture, vec2(perm01, Pi.z)).rgb * 4.0 - 2.0;\n    grad010.z = floor(grad010.z); // Remove small variations due to w\n    float n010 = dot(grad010, Pf - vec3(0.0, 1.0, 0.0));\n    vec3  grad011 = texture2D(gradTexture, vec2(perm01, Pi.z + ONE)).rgb * 4.0 - 2.0;\n    grad011.z = floor(grad011.z); // Remove small variations due to w\n    float n011 = dot(grad011, Pf - vec3(0.0, 1.0, 1.0));\n\n    // Noise contributions from (x=1, y=0), z=0 and z=1\n    float perm10 = texture2D(gradTexture, Pi.xy + vec2(ONE, 0.0)).a ;\n    vec3  grad100 = texture2D(gradTexture, vec2(perm10, Pi.z)).rgb * 4.0 - 2.0;\n    grad100.z = floor(grad100.z); // Remove small variations due to w\n    float n100 = dot(grad100, Pf - vec3(1.0, 0.0, 0.0));\n    vec3  grad101 = texture2D(gradTexture, vec2(perm10, Pi.z + ONE)).rgb * 4.0 - 2.0;\n    grad101.z = floor(grad101.z); // Remove small variations due to w\n    float n101 = dot(grad101, Pf - vec3(1.0, 0.0, 1.0));\n\n    // Noise contributions from (x=1, y=1), z=0 and z=1\n    float perm11 = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a ;\n    vec3  grad110 = texture2D(gradTexture, vec2(perm11, Pi.z)).rgb * 4.0 - 2.0;\n    grad110.z = floor(grad110.z); // Remove small variations due to w\n    float n110 = dot(grad110, Pf - vec3(1.0, 1.0, 0.0));\n    vec3  grad111 = texture2D(gradTexture, vec2(perm11, Pi.z + ONE)).rgb * 4.0 - 2.0;\n    grad111.z = floor(grad111.z); // Remove small variations due to w\n    float n111 = dot(grad111, Pf - vec3(1.0, 1.0, 1.0));\n\n    // Blend contributions along x\n    vec4 n_x = mix(vec4(n000, n001, n010, n011),\n                   vec4(n100, n101, n110, n111), fade(Pf.x));\n\n    // Blend contributions along y\n    vec2 n_xy = mix(n_x.xy, n_x.zw, fade(Pf.y));\n\n    // Blend contributions along z\n    float n_xyz = mix(n_xy.x, n_xy.y, fade(Pf.z));\n\n    // We're done, return the final noise value.\n    return n_xyz;\n  }\n\n\n  /*\n   * 4D classic noise. Slow, but very useful. 4D simplex noise is a lot faster.\n   *\n   * This function performs 8 texture lookups and 16 dependent texture lookups,\n   * 16 dot products, 4 mix operations and a lot of additions and multiplications.\n   * Needless to say, it's not super fast. But it's not dead slow either.\n   */\n  shared float noise(vec4 P)\n  {\n    vec4 Pi = ONE*floor(P)+ONEHALF; // Integer part, scaled so +1 moves one texel\n                                    // and offset 1/2 texel to sample texel centers\n    vec4 Pf = fract(P);      // Fractional part for interpolation\n\n    // \"n0000\" is the noise contribution from (x=0, y=0, z=0, w=0), and so on\n    float perm00xy = texture2D(gradTexture, Pi.xy).a ;\n    float perm00zw = texture2D(gradTexture, Pi.zw).a ;\n    vec4 grad0000 = texture2D(gradTexture, vec2(perm00xy, perm00zw)).rgbb * 4.0 - 2.0;\n    grad0000.z = floor(grad0000.z); // Remove slight variation from w\n    grad0000.w = fract(grad0000.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0000 = dot(grad0000, Pf);\n\n    float perm01zw = texture2D(gradTexture, Pi.zw  + vec2(0.0, ONE)).a ;\n    vec4 grad0001 = texture2D(gradTexture, vec2(perm00xy, perm01zw)).rgbb * 4.0 - 2.0;\n    grad0001.z = floor(grad0001.z); // Remove slight variation from w\n    grad0001.w = fract(grad0001.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0001 = dot(grad0001, Pf - vec4(0.0, 0.0, 0.0, 1.0));\n\n    float perm10zw = texture2D(gradTexture, Pi.zw  + vec2(ONE, 0.0)).a ;\n    vec4 grad0010 = texture2D(gradTexture, vec2(perm00xy, perm10zw)).rgbb * 4.0 - 2.0;\n    grad0010.z = floor(grad0010.z); // Remove slight variation from w\n    grad0010.w = fract(grad0010.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0010 = dot(grad0010, Pf - vec4(0.0, 0.0, 1.0, 0.0));\n\n    float perm11zw = texture2D(gradTexture, Pi.zw  + vec2(ONE, ONE)).a ;\n    vec4 grad0011 = texture2D(gradTexture, vec2(perm00xy, perm11zw)).rgbb * 4.0 - 2.0;\n    grad0011.z = floor(grad0011.z); // Remove slight variation from w\n    grad0011.w = fract(grad0011.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0011 = dot(grad0011, Pf - vec4(0.0, 0.0, 1.0, 1.0));\n\n    float perm01xy = texture2D(gradTexture, Pi.xy + vec2(0.0, ONE)).a ;\n    vec4 grad0100 = texture2D(gradTexture, vec2(perm01xy, perm00zw)).rgbb * 4.0 - 2.0;\n    grad0100.z = floor(grad0100.z); // Remove slight variation from w\n    grad0100.w = fract(grad0100.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0100 = dot(grad0100, Pf - vec4(0.0, 1.0, 0.0, 0.0));\n\n    vec4 grad0101 = texture2D(gradTexture, vec2(perm01xy, perm01zw)).rgbb * 4.0 - 2.0;\n    grad0101.z = floor(grad0101.z); // Remove slight variation from w\n    grad0101.w = fract(grad0101.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0101 = dot(grad0101, Pf - vec4(0.0, 1.0, 0.0, 1.0));\n\n    vec4 grad0110 = texture2D(gradTexture, vec2(perm01xy, perm10zw)).rgbb * 4.0 - 2.0;\n    grad0110.z = floor(grad0110.z); // Remove slight variation from w\n    grad0110.w = fract(grad0110.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0110 = dot(grad0110, Pf - vec4(0.0, 1.0, 1.0, 0.0));\n\n    vec4  grad0111 = texture2D(gradTexture, vec2(perm01xy, perm11zw)).rgbb * 4.0 - 2.0;\n    grad0111.z = floor(grad0111.z); // Remove slight variation from w\n    grad0111.w = fract(grad0111.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n0111 = dot(grad0111, Pf - vec4(0.0, 1.0, 1.0, 1.0));\n\n    float perm10xy = texture2D(gradTexture, Pi.xy + vec2(ONE, 0.0)).a ;\n    vec4  grad1000 = texture2D(gradTexture, vec2(perm10xy, perm00zw)).rgbb * 4.0 - 2.0;\n    grad1000.z = floor(grad1000.z); // Remove slight variation from w\n    grad1000.w = fract(grad1000.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1000 = dot(grad1000, Pf - vec4(1.0, 0.0, 0.0, 0.0));\n\n    vec4  grad1001 = texture2D(gradTexture, vec2(perm10xy, perm01zw)).rgbb * 4.0 - 2.0;\n    grad1001.z = floor(grad1001.z); // Remove slight variation from w\n    grad1001.w = fract(grad1001.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1001 = dot(grad1001, Pf - vec4(1.0, 0.0, 0.0, 1.0));\n\n    vec4  grad1010 = texture2D(gradTexture, vec2(perm10xy, perm10zw)).rgbb * 4.0 - 2.0;\n    grad1010.z = floor(grad1010.z); // Remove slight variation from w\n    grad1010.w = fract(grad1010.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1010 = dot(grad1010, Pf - vec4(1.0, 0.0, 1.0, 0.0));\n\n    vec4  grad1011 = texture2D(gradTexture, vec2(perm10xy, perm11zw)).rgbb * 4.0 - 2.0;\n    grad1011.z = floor(grad1011.z); // Remove slight variation from w\n    grad1011.w = fract(grad1011.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1011 = dot(grad1011, Pf - vec4(1.0, 0.0, 1.0, 1.0));\n\n    float perm11xy = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a ;\n    vec4  grad1100 = texture2D(gradTexture, vec2(perm11xy, perm00zw)).rgbb * 4.0 - 2.0;\n    grad1100.z = floor(grad1100.z); // Remove slight variation from w\n    grad1100.w = fract(grad1100.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1100 = dot(grad1100, Pf - vec4(1.0, 1.0, 0.0, 0.0));\n\n    vec4  grad1101 = texture2D(gradTexture, vec2(perm11xy, perm01zw)).rgbb * 4.0 - 2.0;\n    grad1101.z = floor(grad1101.z); // Remove slight variation from w\n    grad1101.w = fract(grad1101.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1101 = dot(grad1101, Pf - vec4(1.0, 1.0, 0.0, 1.0));\n\n    vec4  grad1110 = texture2D(gradTexture, vec2(perm11xy, perm10zw)).rgbb * 4.0 - 2.0;\n    grad1110.z = floor(grad1110.z); // Remove slight variation from w\n    grad1110.w = fract(grad1110.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1110 = dot(grad1110, Pf - vec4(1.0, 1.0, 1.0, 0.0));\n\n    vec4  grad1111 = texture2D(gradTexture, vec2(perm11xy, perm11zw)).rgbb * 4.0 - 2.0;\n    grad1111.z = floor(grad1111.z); // Remove slight variation from w\n    grad1111.w = fract(grad1111.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float n1111 = dot(grad1111, Pf - vec4(1.0, 1.0, 1.0, 1.0));\n\n    // Blend contributions along x\n    float fadex = fade(Pf.x);\n    vec4 n_x0 = mix(vec4(n0000, n0001, n0010, n0011),\n                    vec4(n1000, n1001, n1010, n1011), fadex);\n    vec4 n_x1 = mix(vec4(n0100, n0101, n0110, n0111),\n                    vec4(n1100, n1101, n1110, n1111), fadex);\n\n    // Blend contributions along y\n    vec4 n_xy = mix(n_x0, n_x1, fade(Pf.y));\n\n    // Blend contributions along z\n    vec2 n_xyz = mix(n_xy.xy, n_xy.zw, fade(Pf.z));\n\n    // Blend contributions along w\n    float n_xyzw = mix(n_xyz.x, n_xyz.y, fade(Pf.w));\n\n    // We're done, return the final noise value.\n    return n_xyzw;\n  }\n\n\n  /*\n   * 2D simplex noise. Somewhat slower but much better looking than classic noise.\n   */\n  shared float snoise(vec2 P) {\n\n  // Skew and unskew factors are a bit hairy for 2D, so define them as constants\n  // This is (sqrt(3.0)-1.0)/2.0\n  #define F2 0.366025403784\n  // This is (3.0-sqrt(3.0))/6.0\n  #define G2 0.211324865405\n\n    // Skew the (x,y) space to determine which cell of 2 simplices we're in\n   \tfloat s = (P.x + P.y) * F2;   // Hairy factor for 2D skewing\n    vec2 Pi = floor(P + s);\n    float t = (Pi.x + Pi.y) * G2; // Hairy factor for unskewing\n    vec2 P0 = Pi - t; // Unskew the cell origin back to (x,y) space\n    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n    vec2 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n    // For the 2D case, the simplex shape is an equilateral triangle.\n    // Find out whether we are above or below the x=y diagonal to\n    // determine which of the two triangles we're in.\n    vec2 o1;\n    if(Pf0.x > Pf0.y) o1 = vec2(1.0, 0.0);  // +x, +y traversal order\n    else o1 = vec2(0.0, 1.0);               // +y, +x traversal order\n\n    // Noise contribution from simplex origin\n    vec2 grad0 = texture2D(gradTexture, Pi).rg * 4.0 - 2.0;\n    float t0 = 0.5 - dot(Pf0, Pf0);\n    float n0;\n    if (t0 < 0.0) n0 = 0.0;\n    else {\n      t0 *= t0;\n      n0 = t0 * t0 * dot(grad0, Pf0);\n    }\n\n    // Noise contribution from middle corner\n    vec2 Pf1 = Pf0 - o1 + G2;\n    vec2 grad1 = texture2D(gradTexture, Pi + o1*ONE).rg * 4.0 - 2.0;\n    float t1 = 0.5 - dot(Pf1, Pf1);\n    float n1;\n    if (t1 < 0.0) n1 = 0.0;\n    else {\n      t1 *= t1;\n      n1 = t1 * t1 * dot(grad1, Pf1);\n    }\n  \n    // Noise contribution from last corner\n    vec2 Pf2 = Pf0 - vec2(1.0-2.0*G2);\n    vec2 grad2 = texture2D(gradTexture, Pi + vec2(ONE, ONE)).rg * 4.0 - 2.0;\n    float t2 = 0.5 - dot(Pf2, Pf2);\n    float n2;\n    if(t2 < 0.0) n2 = 0.0;\n    else {\n      t2 *= t2;\n      n2 = t2 * t2 * dot(grad2, Pf2);\n    }\n\n    // Sum up and scale the result to cover the range [-1,1]\n    return 100.0 * (n0 + n1 + n2);\n  }\n\n\n  /*\n   * 3D simplex noise. Comparable in speed to classic noise, better looking.\n   */\n  shared float snoise(vec3 P) {\n\n  // The skewing and unskewing factors are much simpler for the 3D case\n  #define F3 0.333333333333\n  #define G3 0.166666666667\n\n    // Skew the (x,y,z) space to determine which cell of 6 simplices we're in\n   \tfloat s = (P.x + P.y + P.z) * F3; // Factor for 3D skewing\n    vec3 Pi = floor(P + s);\n    float t = (Pi.x + Pi.y + Pi.z) * G3;\n    vec3 P0 = Pi - t; // Unskew the cell origin back to (x,y,z) space\n    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n    vec3 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.\n    // To find out which of the six possible tetrahedra we're in, we need to\n    // determine the magnitude ordering of x, y and z components of Pf0.\n    vec3 o1;\n    vec3 o2;\n    simplex(Pf0, o1, o2);\n\n    // Noise contribution from simplex origin\n    float perm0 = texture2D(gradTexture, Pi.xy).a;\n    vec3  grad0 = texture2D(gradTexture, vec2(perm0, Pi.z)).rgb * 4.0 - 2.0;\n    grad0.z = floor(grad0.z); // Remove small variations due to w\n    float t0 = 0.6 - dot(Pf0, Pf0);\n    float n0;\n    if (t0 < 0.0) n0 = 0.0;\n    else {\n      t0 *= t0;\n      n0 = t0 * t0 * dot(grad0, Pf0);\n    }\n\n    // Noise contribution from second corner\n    vec3 Pf1 = Pf0 - o1 + G3;\n    float perm1 = texture2D(gradTexture, Pi.xy + o1.xy*ONE).a;\n    vec3  grad1 = texture2D(gradTexture, vec2(perm1, Pi.z + o1.z*ONE)).rgb * 4.0 - 2.0;\n    grad1.z = floor(grad1.z); // Remove small variations due to w\n    float t1 = 0.6 - dot(Pf1, Pf1);\n    float n1;\n    if (t1 < 0.0) n1 = 0.0;\n    else {\n      t1 *= t1;\n      n1 = t1 * t1 * dot(grad1, Pf1);\n    }\n  \n    // Noise contribution from third corner\n    vec3 Pf2 = Pf0 - o2 + 2.0 * G3;\n    float perm2 = texture2D(gradTexture, Pi.xy + o2.xy*ONE).a;\n    vec3  grad2 = texture2D(gradTexture, vec2(perm2, Pi.z + o2.z*ONE)).rgb * 4.0 - 2.0;\n    grad2.z = floor(grad2.z); // Remove small variations due to w\n    float t2 = 0.6 - dot(Pf2, Pf2);\n    float n2;\n    if (t2 < 0.0) n2 = 0.0;\n    else {\n      t2 *= t2;\n      n2 = t2 * t2 * dot(grad2, Pf2);\n    }\n  \n    // Noise contribution from last corner\n    vec3 Pf3 = Pf0 - vec3(1.0-3.0*G3);\n    float perm3 = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a;\n    vec3  grad3 = texture2D(gradTexture, vec2(perm3, Pi.z + ONE)).rgb * 4.0 - 2.0;\n    grad3.z = floor(grad3.z); // Remove small variations due to w\n    float t3 = 0.6 - dot(Pf3, Pf3);\n    float n3;\n    if(t3 < 0.0) n3 = 0.0;\n    else {\n      t3 *= t3;\n      n3 = t3 * t3 * dot(grad3, Pf3);\n    }\n\n    // Sum up and scale the result to cover the range [-1,1]\n    return 20.0 * (n0 + n1 + n2 + n3);\n  }\n\n\n  /*\n   * 4D simplex noise. A lot faster than classic 4D noise, and better looking.\n   */\n\n  shared float snoise(vec4 P) {\n\n  // The skewing and unskewing factors are hairy again for the 4D case\n  // This is (sqrt(5.0)-1.0)/4.0\n  #define F4 0.309016994375\n  // This is (5.0-sqrt(5.0))/20.0\n  #define G4 0.138196601125\n\n    // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in\n   \tfloat s = (P.x + P.y + P.z + P.w) * F4; // Factor for 4D skewing\n    vec4 Pi = floor(P + s);\n    float t = (Pi.x + Pi.y + Pi.z + Pi.w) * G4;\n    vec4 P0 = Pi - t; // Unskew the cell origin back to (x,y,z,w) space\n    Pi = Pi * ONE + ONEHALF; // Integer part, scaled and offset for texture lookup\n\n    vec4 Pf0 = P - P0;  // The x,y distances from the cell origin\n\n    // For the 4D case, the simplex is a 4D shape I won't even try to describe.\n    // To find out which of the 24 possible simplices we're in, we need to\n    // determine the magnitude ordering of x, y, z and w components of Pf0.\n    vec4 o1;\n    vec4 o2;\n    vec4 o3;\n    simplex(Pf0, o1, o2, o3);  \n\n    // Noise contribution from simplex origin\n    float perm0xy = texture2D(gradTexture, Pi.xy).a;\n    float perm0zw = texture2D(gradTexture, Pi.zw).a;\n    vec4 grad0 = texture2D(gradTexture, vec2(perm0xy, perm0zw)).rgbb * 4.0 - 2.0;\n    grad0.z = floor(grad0.z); // Remove slight variation from w\n    grad0.w = fract(grad0.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float t0 = 0.6 - dot(Pf0, Pf0);\n    float n0;\n    if (t0 < 0.0) n0 = 0.0;\n    else {\n      t0 *= t0;\n      n0 = t0 * t0 * dot(grad0, Pf0);\n    }\n\n    // Noise contribution from second corner\n    vec4 Pf1 = Pf0 - o1 + G4;\n    o1 = o1 * ONE;\n    float perm1xy = texture2D(gradTexture, Pi.xy + o1.xy).a;\n    float perm1zw = texture2D(gradTexture, Pi.zw + o1.zw).a;\n    vec4 grad1 = texture2D(gradTexture, vec2(perm1xy, perm1zw)).rgbb * 4.0 - 2.0;\n    grad1.z = floor(grad1.z); // Remove slight variation from w\n    grad1.w = fract(grad1.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float t1 = 0.6 - dot(Pf1, Pf1);\n    float n1;\n    if (t1 < 0.0) n1 = 0.0;\n    else {\n      t1 *= t1;\n      n1 = t1 * t1 * dot(grad1, Pf1);\n    }\n  \n    // Noise contribution from third corner\n    vec4 Pf2 = Pf0 - o2 + 2.0 * G4;\n    o2 = o2 * ONE;\n    float perm2xy = texture2D(gradTexture, Pi.xy + o2.xy).a;\n    float perm2zw = texture2D(gradTexture, Pi.zw + o2.zw).a;\n    vec4 grad2 = texture2D(gradTexture, vec2(perm2xy, perm2zw)).rgbb * 4.0 - 2.0;\n    grad2.z = floor(grad2.z); // Remove slight variation from w\n    grad2.w = fract(grad2.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float t2 = 0.6 - dot(Pf2, Pf2);\n    float n2;\n    if (t2 < 0.0) n2 = 0.0;\n    else {\n      t2 *= t2;\n      n2 = t2 * t2 * dot(grad2, Pf2);\n    }\n  \n    // Noise contribution from fourth corner\n    vec4 Pf3 = Pf0 - o3 + 3.0 * G4;\n    o3 = o3 * ONE;\n    float perm3xy = texture2D(gradTexture, Pi.xy + o3.xy).a;\n    float perm3zw = texture2D(gradTexture, Pi.zw + o3.zw).a;\n    vec4 grad3 = texture2D(gradTexture, vec2(perm3xy, perm3zw)).rgbb * 4.0 - 2.0;\n    grad3.z = floor(grad3.z); // Remove slight variation from w\n    grad3.w = fract(grad3.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float t3 = 0.6 - dot(Pf3, Pf3);\n    float n3;\n    if (t3 < 0.0) n3 = 0.0;\n    else {\n      t3 *= t3;\n      n3 = t3 * t3 * dot(grad3, Pf3);\n    }\n  \n    // Noise contribution from last corner\n    vec4 Pf4 = Pf0 - vec4(1.0-4.0*G4);\n    float perm4xy = texture2D(gradTexture, Pi.xy + vec2(ONE, ONE)).a;\n    float perm4zw = texture2D(gradTexture, Pi.zw + vec2(ONE, ONE)).a;\n    vec4  grad4 = texture2D(gradTexture, vec2(perm4xy, perm4zw)).rgbb * 4.0 - 2.0;\n    grad4.z = floor(grad4.z); // Remove slight variation from w\n    grad4.w = fract(grad4.w + 0.25) * 4.0 - 1.0; // Extract w from joint encoding\n    float t4 = 0.6 - dot(Pf4, Pf4);\n    float n4;\n    if(t4 < 0.0) n4 = 0.0;\n    else {\n      t4 *= t4;\n      n4 = t4 * t4 * dot(grad4, Pf4);\n    }\n\n    // Sum up and scale the result to cover the range [-1,1]\n    return 27.0 * (n0 + n1 + n2 + n3 + n4);\n  }\n\n\n<%\n} else {\n// non-texture-based implementation:\n// Ian McEwan, Ashima Arts.\n// Copyright (C) 2011 Ashima Arts. All rights reserved.\n// Distributed under the MIT License. See LICENSE file.\n%>\n\nshared vec4 permute(vec4 x)\n{\n  return mod(((x*34.0)+1.0)*x, 289.0);\n}\n\nshared vec3 permute(vec3 x)\n{\n  return mod(((x*34.0)+1.0)*x, 289.0);\n}\n\nshared float permute(float x)\n{\n  return floor(mod(((x*34.0)+1.0)*x, 289.0));\n}\n\nshared vec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nshared float taylorInvSqrt(float r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nshared vec4 grad4(float j, vec4 ip)\n{\n  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n  vec4 p,s;\n\n  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n  s = vec4(lessThan(p, vec4(0.0)));\n  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;\n\n  return p;\n}\n\nshared vec4 fade(vec4 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\nshared vec3 fade(vec3 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\nshared vec2 fade(vec2 t) {\n  return t*t*t*(t*(t*6.0-15.0)+10.0);\n}\n\n// Classic Perlin noise\nshared float cnoise(vec2 P)\n{\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n\n  vec4 i = permute(permute(ix) + iy);\n\n  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;\n  vec4 gy = abs(gx) - 0.5 ;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x,gy.x);\n  vec2 g10 = vec2(gx.y,gy.y);\n  vec2 g01 = vec2(gx.z,gy.z);\n  vec2 g11 = vec2(gx.w,gy.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n\n  vec2 fade_xy = fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\n// Classic Perlin noise, periodic variant\nshared float pnoise(vec2 P, vec2 rep)\n{\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n\n  vec4 i = permute(permute(ix) + iy);\n\n  vec4 gx = 2.0 * fract(i / 41.0) - 1.0 ;\n  vec4 gy = abs(gx) - 0.5 ;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n\n  vec2 g00 = vec2(gx.x,gy.x);\n  vec2 g10 = vec2(gx.y,gy.y);\n  vec2 g01 = vec2(gx.z,gy.z);\n  vec2 g11 = vec2(gx.w,gy.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n\n  vec2 fade_xy = fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\n// Classic Perlin noise\nshared float cnoise(vec3 P)\n{\n  vec3 Pi0 = floor(P); // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n// Classic Perlin noise, periodic variant\nshared float pnoise(vec3 P, vec3 rep)\n{\n  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P); // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n\n  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n// Classic Perlin noise\nshared float cnoise(vec4 P)\n{\n  vec4 Pi0 = floor(P); // Integer part for indexing\n  vec4 Pi1 = Pi0 + 1.0; // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n  vec4 ixy00 = permute(ixy0 + iw0);\n  vec4 ixy01 = permute(ixy0 + iw1);\n  vec4 ixy10 = permute(ixy1 + iw0);\n  vec4 ixy11 = permute(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 / 7.0;\n  vec4 gy00 = floor(gx00) / 7.0;\n  vec4 gz00 = floor(gy00) / 6.0;\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 / 7.0;\n  vec4 gy01 = floor(gx01) / 7.0;\n  vec4 gz01 = floor(gy01) / 6.0;\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 / 7.0;\n  vec4 gy10 = floor(gx10) / 7.0;\n  vec4 gz10 = floor(gy10) / 6.0;\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 / 7.0;\n  vec4 gy11 = floor(gx11) / 7.0;\n  vec4 gz11 = floor(gy11) / 6.0;\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\n// Classic Perlin noise, periodic version\nshared float cnoise(vec4 P, vec4 rep)\n{\n  vec4 Pi0 = mod(floor(P), rep); // Integer part modulo rep\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\n  vec4 Pf0 = fract(P); // Fractional part for interpolation\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = vec4(Pi0.zzzz);\n  vec4 iz1 = vec4(Pi1.zzzz);\n  vec4 iw0 = vec4(Pi0.wwww);\n  vec4 iw1 = vec4(Pi1.wwww);\n\n  vec4 ixy = permute(permute(ix) + iy);\n  vec4 ixy0 = permute(ixy + iz0);\n  vec4 ixy1 = permute(ixy + iz1);\n  vec4 ixy00 = permute(ixy0 + iw0);\n  vec4 ixy01 = permute(ixy0 + iw1);\n  vec4 ixy10 = permute(ixy1 + iw0);\n  vec4 ixy11 = permute(ixy1 + iw1);\n\n  vec4 gx00 = ixy00 / 7.0;\n  vec4 gy00 = floor(gx00) / 7.0;\n  vec4 gz00 = floor(gy00) / 6.0;\n  gx00 = fract(gx00) - 0.5;\n  gy00 = fract(gy00) - 0.5;\n  gz00 = fract(gz00) - 0.5;\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\n  vec4 sw00 = step(gw00, vec4(0.0));\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\n\n  vec4 gx01 = ixy01 / 7.0;\n  vec4 gy01 = floor(gx01) / 7.0;\n  vec4 gz01 = floor(gy01) / 6.0;\n  gx01 = fract(gx01) - 0.5;\n  gy01 = fract(gy01) - 0.5;\n  gz01 = fract(gz01) - 0.5;\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\n  vec4 sw01 = step(gw01, vec4(0.0));\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\n\n  vec4 gx10 = ixy10 / 7.0;\n  vec4 gy10 = floor(gx10) / 7.0;\n  vec4 gz10 = floor(gy10) / 6.0;\n  gx10 = fract(gx10) - 0.5;\n  gy10 = fract(gy10) - 0.5;\n  gz10 = fract(gz10) - 0.5;\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\n  vec4 sw10 = step(gw10, vec4(0.0));\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\n\n  vec4 gx11 = ixy11 / 7.0;\n  vec4 gy11 = floor(gx11) / 7.0;\n  vec4 gz11 = floor(gy11) / 6.0;\n  gx11 = fract(gx11) - 0.5;\n  gy11 = fract(gy11) - 0.5;\n  gz11 = fract(gz11) - 0.5;\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\n  vec4 sw11 = step(gw11, vec4(0.0));\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\n\n  vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);\n  vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);\n  vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);\n  vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);\n  vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);\n  vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);\n  vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);\n  vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);\n  vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);\n  vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);\n  vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);\n  vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);\n  vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);\n  vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);\n  vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);\n  vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);\n\n  vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));\n  g0000 *= norm00.x;\n  g0100 *= norm00.y;\n  g1000 *= norm00.z;\n  g1100 *= norm00.w;\n\n  vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));\n  g0001 *= norm01.x;\n  g0101 *= norm01.y;\n  g1001 *= norm01.z;\n  g1101 *= norm01.w;\n\n  vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));\n  g0010 *= norm10.x;\n  g0110 *= norm10.y;\n  g1010 *= norm10.z;\n  g1110 *= norm10.w;\n\n  vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));\n  g0011 *= norm11.x;\n  g0111 *= norm11.y;\n  g1011 *= norm11.z;\n  g1111 *= norm11.w;\n\n  float n0000 = dot(g0000, Pf0);\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));\n  float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));\n  float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));\n  float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));\n  float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\n  float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));\n  float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));\n  float n1111 = dot(g1111, Pf1);\n\n  vec4 fade_xyzw = fade(Pf0);\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\n  return 2.2 * n_xyzw;\n}\n\nshared float snoise(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439, // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626, // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i = floor(v + dot(v, C.yy) );\n  vec2 x0 = v - i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod(i, 289.0); // Avoid truncation effects in permutation\n  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n+ i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Inlined for speed: m *= taylorInvSqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x = a0.x * x0.x + h.x * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nshared float snoise(vec3 v)\n{\n  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i = floor(v + dot(v, C.yyy) );\n  vec3 x0 = v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  // x0 = x0 - 0.0 + 0.0 * C.xxx;\n  // x1 = x0 - i1 + 1.0 * C.xxx;\n  // x2 = x0 - i2 + 2.0 * C.xxx;\n  // x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy; // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod(i, 289.0 );\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nshared float snoise(vec4 v)\n{\n  const vec4 C = vec4( 0.138196601125011, // (5 - sqrt(5))/20 G4\n                        0.276393202250021, // 2 * G4\n                        0.414589803375032, // 3 * G4\n                       -0.447213595499958); // -1 + 4 * G4\n\n  // (sqrt(5) - 1)/4 = F4, used once below\n  #define F4 0.309016994374947451\n\n// First corner\n  vec4 i = floor(v + dot(v, vec4(F4)) );\n  vec4 x0 = v - i + dot(i, C.xxxx);\n\n// Other corners\n\n// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\n  vec4 i0;\n  vec3 isX = step( x0.yzw, x0.xxx );\n  vec3 isYZ = step( x0.zww, x0.yyz );\n// i0.x = dot( isX, vec3( 1.0 ) );\n  i0.x = isX.x + isX.y + isX.z;\n  i0.yzw = 1.0 - isX;\n// i0.y += dot( isYZ.xy, vec2( 1.0 ) );\n  i0.y += isYZ.x + isYZ.y;\n  i0.zw += 1.0 - isYZ.xy;\n  i0.z += isYZ.z;\n  i0.w += 1.0 - isYZ.z;\n\n  // i0 now contains the unique values 0,1,2,3 in each channel\n  vec4 i3 = clamp( i0, 0.0, 1.0 );\n  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\n  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\n\n  // x0 = x0 - 0.0 + 0.0 * C.xxxx\n  // x1 = x0 - i1 + 0.0 * C.xxxx\n  // x2 = x0 - i2 + 0.0 * C.xxxx\n  // x3 = x0 - i3 + 0.0 * C.xxxx\n  // x4 = x0 - 1.0 + 4.0 * C.xxxx\n  vec4 x1 = x0 - i1 + C.xxxx;\n  vec4 x2 = x0 - i2 + C.yyyy;\n  vec4 x3 = x0 - i3 + C.zzzz;\n  vec4 x4 = x0 + C.wwww;\n\n  // Permutations\n  i = mod(i, 289.0);\n  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);\n  vec4 j1 = permute( permute( permute( permute (\n             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\n           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\n           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\n           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\n\n  // Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope\n  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.\n  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\n\n  vec4 p0 = grad4(j0, ip);\n  vec4 p1 = grad4(j1.x, ip);\n  vec4 p2 = grad4(j1.y, ip);\n  vec4 p3 = grad4(j1.z, ip);\n  vec4 p4 = grad4(j1.w, ip);\n\n  // Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n  p4 *= taylorInvSqrt(dot(p4,p4));\n\n  // Mix contributions from the five corners\n  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\n  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4) ), 0.0);\n  m0 = m0 * m0;\n  m1 = m1 * m1;\n  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))\n               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;\n\n}\n\n<% } %>\n";
Jax.shader_data("functions")["paraboloid"] = "void mapToParaboloid(inout vec4 position, float zNear, float zFar) {\n  float L = length(position.xyz);\n  position /= L;\n  position.z += 1.0;\n  position.xy /= position.z;\n  position.z = (L - zNear) / (zFar - zNear);\n  position.w = 1.0;\n}\n";
Jax.shader_data("gamma_correction")["fragment"] = "uniform float GammaCorrectionFactor;\n\nvoid main(void) {\n  if (GammaCorrectionFactor == 0.0) {\n    // sRGB\n    vec3 c = gl_FragColor.rgb;\n    gl_FragColor.rgb = (step(0.0031308, c)*1.055*pow(c, vec3(1.0/2.4))-0.055) +\n                       (step(-0.0031308, -c)*12.92*c);\n  } else {\n    gl_FragColor.rgb = pow(gl_FragColor.rgb,\n                       vec3(GammaCorrectionFactor));\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.GammaCorrection = (function(_super) {
    __extends(GammaCorrection, _super);

    function GammaCorrection(options) {
      GammaCorrection.__super__.constructor.call(this, options);
    }

    GammaCorrection.prototype.setVariables = function(context, mesh, model, vars, pass) {
      if (this.gamma === void 0) {
        return vars.GammaCorrectionFactor = 1.0 / 2.2;
      } else if (isNaN(this.gamma)) {
        return vars.GammaCorrectionFactor = 0.0;
      } else {
        return vars.GammaCorrectionFactor = 1.0 / this.gamma;
      }
    };

    return GammaCorrection;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("lambert_diffuse")["common"] = "<%= Jax.import_shader_code(\"lib\", \"lights\") %>\n\nshared uniform int PASS;\nshared uniform float MaterialDiffuseIntensity;\nshared uniform vec4 MaterialDiffuseColor;\nshared uniform mat3 NormalMatrix;\nshared uniform mat4 ModelViewMatrix;\n\nshared varying vec3 vEyeSpaceSurfaceNormal, vEyeSpaceSurfacePosition;\n";
Jax.shader_data("lambert_diffuse")["fragment"] = "// Lambert formula: L dot N * C * Il,\n//   where L is direction from surface to light, N is normal, C is color, Il is light intensity\n// This shader holds alpha constant at 1.0 and is intended to be blended\n// additively with a prior ambient pass. Light intensity is held constant \n// at 1.0 and attenuation is calculated in a different layer.\n\nvoid main(void) {\n  // no output on ambient pass\n  if (PASS != 0) {\n    cache(vec3, NormalizedEyeSpaceSurfaceNormal) {\n      bool useVertexNormal = true;\n      import(UseVertexNormal, useVertexNormal = UseVertexNormal);\n      vec3 normal = vec3(0.0, 0.0, 0.0);\n      if (useVertexNormal) normal = vEyeSpaceSurfaceNormal;\n      import(Normal, normal = normal + Normal);\n      // handle double sided lighting, when cull face isn't BACK\n      if (!gl_FrontFacing) normal = -normal;\n      NormalizedEyeSpaceSurfaceNormal = normalize(normal);\n    }\n  \n    vec3 L;\n    float d = 1.0;\n    if (LightType == <%= Jax.DIRECTIONAL_LIGHT %>) {\n      L = -EyeSpaceLightDirection;\n      d = 1.0;\n    } else {\n      L = EyeSpaceLightPosition - vEyeSpaceSurfacePosition;\n      d = length(L);\n      L /= d;\n    }\n  \n    cache(float, SpotAttenuation) {\n      float cosCurAngle = dot(-L, EyeSpaceLightDirection);\n      float cosInnerMinusOuterAngle = LightSpotInnerCos - LightSpotOuterCos;\n      SpotAttenuation = clamp((cosCurAngle - LightSpotOuterCos) / cosInnerMinusOuterAngle, 0.0, 1.0);\n    }\n  \n    // this is cached here so that attenuation can get a handle on it\n    // FIXME we probably need a better interface for this sort of thing\n    cache(float, LightDistanceFromSurface) { LightDistanceFromSurface = d; }\n  \n    float intensity = LightDiffuseColor.a * MaterialDiffuseIntensity;\n    vec3 C =  LightDiffuseColor.rgb * MaterialDiffuseColor.rgb;\n\n    float lambert = max(dot(NormalizedEyeSpaceSurfaceNormal, L), 0.0);\n    float diffuse = lambert * SpotAttenuation * intensity;\n    vec4 color = vec4(C * diffuse, MaterialDiffuseColor.a * diffuse);\n    import(VertexColor, color *= VertexColor);\n    gl_FragColor += color;\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.LambertDiffuse = (function(_super) {
    __extends(LambertDiffuse, _super);

    function LambertDiffuse(options) {
      this.intensity = 1;
      LambertDiffuse.__super__.constructor.call(this, options);
      this.meshDataMap = {
        vertices: 'VERTEX_POSITION',
        normals: 'VERTEX_NORMAL'
      };
      this.eyeDir = vec3.create();
      this.eyePos = vec3.create();
    }

    LambertDiffuse.prototype.illuminate = function(context, mesh, model, vars, light) {
      vars['LightDiffuseColor'] = light.color.diffuse;
      vars['LightSpotInnerCos'] = light.innerSpotAngleCos;
      vars['LightSpotOuterCos'] = light.outerSpotAngleCos;
      vars['LightType'] = light.type;
      vars['EyeSpaceLightDirection'] = light.eyeDirection(context.matrix_stack.getViewNormalMatrix(), this.eyeDir);
      vars['EyeSpaceLightPosition'] = light.eyePosition(context.matrix_stack.getViewMatrix(), this.eyePos);
      vars.NormalMatrix = context.matrix_stack.getNormalMatrix();
      vars.MaterialDiffuseIntensity = this.intensity;
      vars.MaterialDiffuseColor = this.color;
      vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix();
      return mesh.data.set(vars, this.meshDataMap);
    };

    return LambertDiffuse;

  })(Jax.Material.IlluminationLayer);

}).call(this);
Jax.shader_data("lambert_diffuse")["vertex"] = "shared attribute vec4 VERTEX_COLOR, VERTEX_POSITION;\nshared attribute vec3 VERTEX_NORMAL;\n\nvoid main(void) {\n  if (PASS != 0) {\n    /* These variables are cached so that other shaders can replace their values */\n    cache(vec3, VertexNormal) { VertexNormal = VERTEX_NORMAL; }\n    cache(vec4, VertexPosition) { VertexPosition = VERTEX_POSITION; }\n    /* exports can also be used to modify the normal */\n    vec3 normal = VertexNormal;\n    import(VertexNormal, normal = normalize(normal + VertexNormal));\n    vEyeSpaceSurfaceNormal = NormalMatrix * normal;\n    vEyeSpaceSurfacePosition = (ModelViewMatrix * VertexPosition).xyz;\n  }\n}\n";
Jax.shader_data("light_ambient")["fragment"] = "shared uniform int PASS;\nshared uniform float MaterialAmbientIntensity;\nshared uniform vec4 MaterialAmbientColor;\nshared uniform vec4 LightAmbientColor;\n\nvoid main(void) {\n  // no output on world ambient pass\n  if (PASS != 0) {\n    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb;\n    vec4 color = vec4(LightAmbientColor.rgb * LightAmbientColor.a * material, MaterialAmbientColor.a);\n    import(VertexColor, color *= VertexColor);\n    gl_FragColor += color;\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.LightAmbient = (function(_super) {
    __extends(LightAmbient, _super);

    function LightAmbient(options) {
      this.color = Jax.Color.parse('#ffff');
      this.intensity = 1;
      LightAmbient.__super__.constructor.call(this, options);
    }

    LightAmbient.prototype.illuminate = function(context, mesh, model, vars, light) {
      vars.MaterialAmbientIntensity = this.intensity;
      vars.LightAmbientColor = light.color.ambient;
      return vars.MaterialAmbientColor = this.color;
    };

    return LightAmbient;

  })(Jax.Material.IlluminationLayer);

}).call(this);
Jax.shader_data("noise")["fragment"] = "<%= Jax.import_shader_code(\"functions\", \"noise\") %>\n";
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Noise = (function(_super) {
    __extends(Noise, _super);

    function Noise() {
      _ref = Noise.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Noise.prototype.setVariables = function(context, mesh, model, vars, pass) {
      if (!Jax.noise.isPrepared(context)) {
        Jax.noise.prepare(context);
      }
      return vars.gradTexture = Jax.noise.grad;
    };

    return Noise;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("noise")["vertex"] = "<%= Jax.import_shader_code(\"functions\", \"noise\") %>\n";
Jax.shader_data("normal_map")["common"] = "uniform sampler2D Texture;\nuniform float TextureScaleX, TextureScaleY;\nuniform bool UseSpecularChannel;\n\nshared varying vec2 vTexCoords;\n\nshared uniform mat3 NormalMatrix;\nshared uniform int PASS;\n\nvarying mat3 vTangentMatrix;\n\nvarying vec3 vN, vT, vB;\n";
Jax.shader_data("normal_map")["exports"] = Jax.shader_data("normal_map")["exports"] || {};
Jax.shader_data("normal_map")["exports"]["SpecularIntensity"] = "float";
Jax.shader_data("normal_map")["fragment"] = "void main() {\n  vec4 rgba = texture2D(Texture, vTexCoords *\n                vec2(TextureScaleX, TextureScaleY));\n  vec3 bump = normalize(rgba.xyz * 2.0 - 1.0);\n  \n  vec3 t = normalize(vT);\n  vec3 n = normalize(vN);\n  vec3 b = normalize(vB);\n  \n  // inverse\n  // float r0 = t.x, r1 = b.x, r2 = n.x,\n  //       r3 = t.y, r4 = b.y, r5 = n.y,\n  //       r6 = t.z, r7 = b.z, r8 = b.z;\n  \n  float r0 = t.x, r1 = t.y, r2 = t.z,\n        r3 = b.x, r4 = b.y, r5 = b.z,\n        r6 = n.x, r7 = n.y, r8 = n.z;\n  mat3 tangentMatrix = mat3(r0, r1, r2, r3, r4, r5, r6, r7, r8);\n  \n  bump = normalize(tangentMatrix * bump);\n  // vertex normal is already encoded in the tangent matrix\n  export(bool, UseVertexNormal, false);\n  export(vec3, Normal, bump);\n  \n  // Alpha channel may contain a specular map\n  float specular = 1.0;\n  if (UseSpecularChannel) specular = rgba.a;\n  export(float, SpecularIntensity, specular);\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Texture = (function(_super) {
    __extends(Texture, _super);

    function Texture(options) {
      var texture;

      if (options && options.instance) {
        texture = options.instance;
      } else if (options && options.texture) {
        texture = options.texture;
      } else if (options) {
        texture = options;
      }
      if (!(texture instanceof Jax.Texture)) {
        texture = new Jax.Texture(texture);
      }
      Texture.__super__.constructor.call(this, {
        shader: options != null ? options.shader : void 0
      });
      this.texture = texture;
      this.dataMap = {
        textures: 'VERTEX_TEXCOORDS'
      };
    }

    Texture.prototype.setVariables = function(context, mesh, model, vars, pass) {
      vars.TextureScaleX = this.texture.options.scale_x || this.texture.options.scale || 1;
      vars.TextureScaleY = this.texture.options.scale_y || this.texture.options.scale || 1;
      vars.Texture = this.texture;
      return mesh.data.set(vars, this.dataMap);
    };

    return Texture;

  })(Jax.Material.Layer);

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.NormalMap = (function(_super) {
    __extends(NormalMap, _super);

    function NormalMap(options) {
      this.specularChannel = !!(options && (options.specularChannel || (options.texture && options.texture.specularChannel)));
      NormalMap.__super__.constructor.call(this, options);
      this.dataMap.tangents = 'VERTEX_TANGENT';
      this.dataMap.normals = 'VERTEX_NORMAL';
      this.dataMap.vertices = 'VERTEX_POSITION';
    }

    NormalMap.prototype.setVariables = function(context, mesh, model, vars, pass) {
      NormalMap.__super__.setVariables.call(this, context, mesh, model, vars, pass);
      vars.NormalMatrix = context.matrix_stack.getNormalMatrix();
      vars.UseSpecularChannel = this.specularChannel;
      return true;
    };

    return NormalMap;

  })(Jax.Material.Layer.Texture);

}).call(this);
Jax.shader_data("normal_map")["vertex"] = "<%= Jax.import_shader_code(\"lib\", \"lights\") %>\n\nshared attribute vec4 VERTEX_POSITION;\nshared attribute vec2 VERTEX_TEXCOORDS;\nshared attribute vec3 VERTEX_NORMAL;\nshared attribute vec4 VERTEX_TANGENT;\nshared attribute vec3 VERTEX_BITANGENT;\n\nvoid main(void) {\n  if (PASS != 0) {\n    vTexCoords = VERTEX_TEXCOORDS;\n    \n    vec3 n = VERTEX_NORMAL;\n    vec3 t = VERTEX_TANGENT.xyz;\n    vec3 b = cross(n, t) * VERTEX_TANGENT.w;\n    \n    vN = NormalMatrix * n;\n    vT = NormalMatrix * t;\n    vB = NormalMatrix * b;\n  }\n}\n";
Jax.shader_data("paraboloid")["common"] = "shared uniform mat4 ModelView;\n\nuniform float Near, Far;\nuniform float Direction;\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Paraboloid = (function(_super) {
    __extends(Paraboloid, _super);

    function Paraboloid(options) {
      Paraboloid.__super__.constructor.call(this, options);
      this._meshMap = {
        vertices: 'VERTEX_POSITION'
      };
    }

    Paraboloid.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var direction;

      direction = this.direction;
      if (direction !== 1 && direction !== -1) {
        throw new Error("`direction` must be either 1 or -1");
      }
      mesh.data.set(vars, this._meshMap);
      vars.ModelView = context.matrix_stack.getModelViewMatrix();
      vars.Near = this.paraboloidNear || 1;
      vars.Far = this.paraboloidFar || 1;
      return vars.Direction = direction;
    };

    return Paraboloid;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("paraboloid")["vertex"] = "<%= Jax.import_shader_code(\"functions\", \"paraboloid\") %>\n\nshared attribute vec4 VERTEX_POSITION;\n                \nvoid main(void) {\n  vec4 position = ModelView * VERTEX_POSITION;\n  position /= position.w;\n  position.z *= Direction;\n  mapToParaboloid(position, Near, Far);\n  gl_Position = position;\n}\n";
Jax.shader_data("phong_specular")["common"] = "<%= Jax.import_shader_code(\"lib\", \"lights\") %>\n\nshared uniform int PASS;\nshared uniform float MaterialSpecularIntensity;\nshared uniform float MaterialShininess;\nshared uniform vec4 MaterialSpecularColor;\nshared uniform mat4 ModelViewMatrix;\nshared uniform mat3 NormalMatrix;\n\nshared varying vec3 vEyeSpaceSurfaceNormal;\nshared varying vec3 vEyeSpaceSurfacePosition;\n";
Jax.shader_data("phong_specular")["fragment"] = "// Phong formula: Is = Sm x Sl x pow( max(R dot E, 0.0), f )\n//   where Sl is the light specular color, Sm is the material specular color,\n//     E is the view vector, and R is the reflected light vector.\n//\n// This shader holds alpha constant at 1.0 and is intended to be blended\n// additively with a prior ambient pass.\n\nvoid main(void) {\n  // instead of `a && b`, use `all(bvec*)` for compatibility with ATI cards\n  bvec2 enabled = bvec2(\n    // no output on ambient pass\n    PASS != 0,\n\n    // if MaterialShininess == 0.0, then the specular formula will be \n    // fubarred so instead, it should be skipped entirely.\n    MaterialShininess > 0.0\n  );\n  if (all(enabled)) {\n    cache(vec3, NormalizedEyeSpaceSurfaceNormal) {\n      bool useVertexNormal = true;\n      import(UseVertexNormal, useVertexNormal = UseVertexNormal);\n      vec3 normal = vec3(0.0, 0.0, 0.0);\n      if (useVertexNormal) normal = vEyeSpaceSurfaceNormal;\n      import(Normal, normal = normal + Normal);\n      // handle double sided lighting, when cull face isn't BACK\n      if (!gl_FrontFacing) normal = -normal;\n      NormalizedEyeSpaceSurfaceNormal = normalize(normal);\n    }\n  \n    vec3 L;\n    if (LightType == <%= Jax.DIRECTIONAL_LIGHT %>) {\n      L = -EyeSpaceLightDirection;\n    } else {\n      L = normalize(EyeSpaceLightPosition - vEyeSpaceSurfacePosition);\n    }\n\n    cache(float, SpotAttenuation) {\n      float cosCurAngle = dot(-L, EyeSpaceLightDirection);\n      float cosInnerMinusOuterAngle = LightSpotInnerCos - LightSpotOuterCos;\n      SpotAttenuation = clamp((cosCurAngle - LightSpotOuterCos) / cosInnerMinusOuterAngle, 0.0, 1.0);\n    }\n\n    float lambert = dot(NormalizedEyeSpaceSurfaceNormal, L);\n    if (lambert > 0.0) {\n      vec3 R = reflect(L, NormalizedEyeSpaceSurfaceNormal);\n      vec3 C = MaterialSpecularColor.rgb * LightSpecularColor.rgb;\n      vec3 E = normalize(vEyeSpaceSurfacePosition);\n      float specularIntensity = MaterialSpecularIntensity;\n      import(SpecularIntensity, specularIntensity *= SpecularIntensity);\n      specularIntensity *= SpotAttenuation * pow(clamp(dot(R, E), 0.0, 1.0), MaterialShininess) * LightSpecularColor.a;\n      gl_FragColor += vec4(C * specularIntensity, MaterialSpecularColor.a * specularIntensity);\n    }\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.PhongSpecular = (function(_super) {
    __extends(PhongSpecular, _super);

    function PhongSpecular(options) {
      this.intensity = 1;
      PhongSpecular.__super__.constructor.call(this, options);
      this.meshDataMap = {
        vertices: 'VERTEX_POSITION',
        normals: 'VERTEX_NORMAL'
      };
      this.eyeDir = vec3.create();
      this.eyePos = vec3.create();
    }

    PhongSpecular.prototype.illuminate = function(context, mesh, model, vars, light) {
      vars['LightSpecularColor'] = light.color.specular;
      vars['EyeSpaceLightDirection'] = light.eyeDirection(context.matrix_stack.getViewNormalMatrix(), this.eyeDir);
      vars['LightType'] = light.type;
      vars['LightSpotInnerCos'] = light.innerSpotAngleCos;
      vars['LightSpotOuterCos'] = light.outerSpotAngleCos;
      vars['EyeSpaceLightPosition'] = light.eyePosition(context.matrix_stack.getViewMatrix(), this.eyePos);
      vars.ModelViewMatrix = context.matrix_stack.getModelViewMatrix();
      vars.NormalMatrix = context.matrix_stack.getNormalMatrix();
      vars.MaterialShininess = this.shininess;
      vars.MaterialSpecularIntensity = this.intensity;
      vars.MaterialSpecularColor = this.color;
      return mesh.data.set(vars, this.meshDataMap);
    };

    return PhongSpecular;

  })(Jax.Material.IlluminationLayer);

}).call(this);
Jax.shader_data("phong_specular")["vertex"] = "shared attribute vec4 VERTEX_COLOR, VERTEX_POSITION;\nshared attribute vec3 VERTEX_NORMAL;\n\nvoid main(void) {\n  if (PASS != 0) {\n    /* These variables are cached so that other shaders can replace their values */\n    cache(vec3, VertexNormal) { VertexNormal = VERTEX_NORMAL; }\n    cache(vec4, VertexPosition) { VertexPosition = VERTEX_POSITION; }\n    /* exports can also be used to modify the normal */\n    vec3 normal = VertexNormal;\n    import(VertexNormal, normal = normalize(normal + VertexNormal));\n    vEyeSpaceSurfaceNormal = NormalMatrix * normal;\n    vEyeSpaceSurfacePosition = (ModelViewMatrix * VertexPosition).xyz;\n  }\n}\n";
Jax.shader_data("picking")["common"] = "uniform float INDEX;\nvarying vec4 vPickingColor;\n";
Jax.shader_data("picking")["fragment"] = "void main(void) {\n  if (INDEX == -1.0) discard;\n  gl_FragColor = vPickingColor;\n}\n";
Jax.Material.Layer.Picking = Jax.Class.create(Jax.Material.Layer, {
  initialize: function($super, options) {
    $super({shader:"picking"});
  },
  
  setVariables: function(context, mesh, model, vars) {
    model_index = model.__unique_id;
    if (model_index === undefined) model_index = -1;
    vars.INDEX = model_index;
  }
});
Jax.shader_data("picking")["vertex"] = "void main(void) {\n  /*\n    Note that the agorithm here must be followed exactly on the JS side in order\n    to reconstitute the index when it is read.\n    \n    This supports 65,535 objects. If more are needed, we could feasibly open up\n    the alpha channel, as long as blending is disabled. Need to do more tests\n    on this first, however.\n  */\n  \n  \n  // equivalent to [ int(INDEX/256), INDEX % 256 ] / 255. The last division\n  // is necessary to scale to the [0..1] range.\n  \n  float d = 1.0 / 255.0;\n  float f = floor(INDEX / 256.0);\n  vPickingColor = vec4(f * d, (INDEX - 256.0 * f) * d, 1.0, 1.0);\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Position = (function(_super) {
    __extends(Position, _super);

    function Position(options) {
      Position.__super__.constructor.call(this, options);
      this.meshMap = {
        vertices: 'VERTEX_POSITION'
      };
    }

    Position.prototype.setVariables = function(context, mesh, model, vars) {
      mesh.data.set(vars, this.meshMap);
      return vars.ModelViewProjectionMatrix = context.matrix_stack.getModelViewProjectionMatrix();
    };

    return Position;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("position")["vertex"] = "shared uniform mat4 ModelViewProjectionMatrix;\nshared attribute vec4 VERTEX_POSITION;\n\nvoid main(void) {\n  cache(vec4, VertexPosition) { VertexPosition = VERTEX_POSITION; }\n  gl_Position = ModelViewProjectionMatrix * VertexPosition;\n}\n";
Jax.shader_data("shadow_map")["common"] = "<%= Jax.import_shader_code(\"lib\", \"lights\") %>\n\nshared uniform int PASS;\nshared uniform mat4 mMatrix, pMatrix;\n\nshared uniform bool IsDualParaboloid;\nshared uniform bool SHADOWMAP_ENABLED;\nshared uniform sampler2D SHADOWMAP0, SHADOWMAP1;\nshared uniform mat4 SHADOWMAP_MATRIX;\nshared uniform bool SHADOWMAP_PCF_ENABLED;\nshared uniform float ParaboloidNear, ParaboloidFar;\nshared uniform float SHADOWMAP_WIDTH, SHADOWMAP_HEIGHT;\n\nshared varying vec4 vShadowCoord;\n";
Jax.shader_data("shadow_map")["fragment"] = "\n\n<%= Jax.import_shader_code(\"functions\", \"paraboloid\") %>\n<%= Jax.import_shader_code(\"functions\", \"depth_map\") %>\n\nvec4 shadowCoord;\n\n/*\n  Since we set the clear color to transparent while rendering the\n  shadowmap, no depth recorded in texture means nothing blocked the\n  light.\n  \n  This is what allows us to do testing beyond the view frustum\n  of the shadow matrix, so at the cost of a branching operation it's\n  much more accurate when some objects such as the floor are\n  excluded from casting shadows.\n*/\n\nfloat dp_lookup(vec2 offset, sampler2D shadowmap) {\n  vec4 rgba_depth = texture2D(shadowmap, shadowCoord.xy * 0.5 + 0.5 + offset);\n  float shadowDepth = unpack_depth(rgba_depth);\n  if (shadowDepth == 0.0) return 1.0;\n  if (shadowDepth - shadowCoord.z > -0.005)\n    return 1.0;\n  else\n    return 0.0;\n}\n      \nfloat depth_lookup(vec2 offset, sampler2D shadowmap) {\n  vec4 rgba_depth = texture2D(shadowmap, shadowCoord.xy + offset);\n  float d = unpack_depth(rgba_depth);\n  if (d == 0.0) return 1.0;\n  if (shadowCoord.z - d > 0.00002)\n    return 0.0;\n  else\n    return 1.0;\n}\n\nvoid main() {\n  /* if (a && b) is broken on some hardware, use if (all(bvec)) instead */\n  float visibility = 1.0;\n  if (PASS != 0) {\n    float dx, dy;\n    bool front;\n\n    if (SHADOWMAP_ENABLED) {\n      shadowCoord = vShadowCoord / vShadowCoord.w;\n      visibility = 0.0;\n      dx = 1.0 / SHADOWMAP_WIDTH;\n      dy = 1.0 / SHADOWMAP_HEIGHT;\n      front = false;\n\n      // for PCF, nested loops break on some ATI cards, so the loop must be unrolled\n      // explicitly. Luckily we have EJS....\n\n      if (IsDualParaboloid) {\n        if (shadowCoord.z > 0.0) front = true;\n        else shadowCoord.z *= -1.0;\n        mapToParaboloid(shadowCoord, ParaboloidNear, ParaboloidFar);\n        shadowCoord.z = shadowCoord.z * 0.5 + 0.5;\n        \n        if (front) {\n          if (SHADOWMAP_PCF_ENABLED) {\n            <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>\n              <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>\n                visibility += dp_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP0);\n              <% } %>\n            <% } %>\n            visibility /= 9.0;\n          } else {\n            visibility += dp_lookup(vec2(0.0, 0.0), SHADOWMAP0);\n          }\n        } else {\n          if (SHADOWMAP_PCF_ENABLED) {\n            <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>\n              <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>\n                visibility += dp_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP1);\n              <% } %>\n            <% } %>\n            visibility /= 9.0;\n          } else {\n            visibility += dp_lookup(vec2(0.0, 0.0), SHADOWMAP1);\n          }\n        }\n      } else {\n        if (SHADOWMAP_PCF_ENABLED) {\n          <% for (var x = -1.5; x <= 1.5; x += 1.5) { %>\n            <% for (var y = -1.5; y <= 1.5; y += 1.5) { %>\n              visibility += depth_lookup(vec2(<%= x.toFixed(6) %> * dx, <%= y.toFixed(6) %> * dy), SHADOWMAP0);\n            <% } %>\n          <% } %>\n          visibility /= 9.0;\n        } else {\n          visibility += depth_lookup(vec2(0.0, 0.0), SHADOWMAP0);\n        }\n      }\n    }\n  }\n\n  gl_FragColor.rgb *= visibility;\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.ShadowMap = (function(_super) {
    __extends(ShadowMap, _super);

    function ShadowMap(options) {
      this.pcf = true;
      this.meshMap = {
        vertices: 'VERTEX_POSITION'
      };
      ShadowMap.__super__.constructor.call(this, options);
    }

    ShadowMap.prototype.numPasses = function(context) {
      return context.world.lights.length + 1;
    };

    ShadowMap.prototype.prepare = function(context, mesh, model) {
      var i, light, _i, _ref;

      for (i = _i = 1, _ref = this.numPasses(context); 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        light = context.world.lights[i - 1];
        if (light.shadows && light.shadowmap) {
          light.shadowmap.validate(context);
        }
      }
      return true;
    };

    ShadowMap.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var light;

      vars.PASS = pass;
      vars['SHADOWMAP_ENABLED'] = false;
      if (!pass) {
        return;
      }
      light = context.world.lights[pass - 1];
      vars['SHADOWMAP_ENABLED'] = light.shadows && !!light.shadowmap && model.receiveShadow;
      vars.mMatrix = context.matrix_stack.getModelMatrix();
      mesh.data.set(vars, this.meshMap);
      if (vars['SHADOWMAP_ENABLED']) {
        vars['ParaboloidNear'] = light.shadowmap.paraboloidNear || 1;
        vars['ParaboloidFar'] = light.shadowmap.paraboloidFar || 200;
        vars['SHADOWMAP_PCF_ENABLED'] = this.pcf;
        vars['SHADOWMAP_MATRIX'] = light.shadowmap.shadowMatrix;
        vars['SHADOWMAP_WIDTH'] = light.shadowmap.width;
        vars['SHADOWMAP_HEIGHT'] = light.shadowmap.height;
        vars['IsDualParaboloid'] = light.shadowmap.isDualParaboloid();
        return light.shadowmap.bindTextures(context, vars, 'SHADOWMAP0', 'SHADOWMAP1');
      }
    };

    return ShadowMap;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("shadow_map")["vertex"] = "shared attribute vec4 VERTEX_POSITION;\n\nvoid main(void) {\n  if (PASS != 0) {\n    if (SHADOWMAP_ENABLED)\n      vShadowCoord = SHADOWMAP_MATRIX * mMatrix * VERTEX_POSITION;\n  }\n}\n";
Jax.shader_data("ssao")["common"] = "varying vec2 uv;\n";
Jax.shader_data("ssao")["fragment"] = "uniform sampler2D Input;\n\nvoid main(void) {\n  gl_FragColor = texture2D(Input, uv);\n  \n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.SSAO = (function(_super) {
    var ortho, quad;

    __extends(SSAO, _super);

    quad = ortho = null;

    function SSAO(options) {
      SSAO.__super__.constructor.call(this, options);
      this._dataMap = {
        vertices: 'VERTEX_POSITION'
      };
    }

    SSAO.prototype.setVariables = function(context, mesh, model, vars, pass) {
      vars.Input = this.input;
      mesh.data.set(vars, this._dataMap);
      return true;
    };

    return SSAO;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("ssao")["vertex"] = "shared attribute vec4 VERTEX_POSITION;\n\nvoid main(void) {\n  gl_Position.xy = VERTEX_POSITION.xy * 2.0;\n  gl_Position.z = -1.0;\n  gl_Position.w = 1.0;\n  uv = VERTEX_POSITION.xy + vec2(0.5, 0.5);\n}\n";
Jax.shader_data("texture")["common"] = "uniform sampler2D Texture;\nuniform float TextureScaleX, TextureScaleY;\n\nshared varying vec2 vTexCoords;\n";
Jax.shader_data("texture")["fragment"] = "void main() {\n  vec4 t = texture2D(Texture, vTexCoords * vec2(TextureScaleX, TextureScaleY));\n  gl_FragColor *= t;\n}\n";
Jax.shader_data("texture")["vertex"] = "shared attribute vec2 VERTEX_TEXCOORDS;\n\nvoid main(void) {\n  vTexCoords = VERTEX_TEXCOORDS;\n}\n";
Jax.shader_data("vertex_color")["common"] = "shared uniform int PASS;\n\nshared varying vec4 vColor;\n";
Jax.shader_data("vertex_color")["exports"] = Jax.shader_data("vertex_color")["exports"] || {};
Jax.shader_data("vertex_color")["exports"]["VertexColor"] = "vec4";
Jax.shader_data("vertex_color")["fragment"] = "void main(void) {\n  export(vec4, VertexColor, vColor);\n  if (PASS == 0) gl_FragColor = vColor;\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.VertexColor = (function(_super) {
    __extends(VertexColor, _super);

    function VertexColor(options) {
      VertexColor.__super__.constructor.call(this, options);
      this.dataMap = {
        colors: 'VERTEX_COLOR'
      };
    }

    VertexColor.prototype.setVariables = function(context, mesh, model, vars, pass) {
      vars.PASS = pass;
      return mesh.data.set(vars, this.dataMap);
    };

    return VertexColor;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("vertex_color")["vertex"] = "shared attribute vec4 VERTEX_COLOR;\n\nvoid main(void) {\n  vColor = VERTEX_COLOR;\n}\n";
Jax.shader_data("wire")["common"] = "/*\nSingle-pass wire frame implementation - see http://cgg-journal.com/2008-2/06/index.html\n*/\n\n\nvarying vec3 dist;\n";
Jax.shader_data("wire")["fragment"] = "// uniform vec4 WireColor;\n// uniform vec4 FillColor;\n\nvoid main(void)\n{\n  // Undo perspective correction.\n\tvec3 dist_vec = dist * gl_FragCoord.w;\n\t\n  // Compute the shortest distance to the edge\n\tfloat d =min(dist_vec[0],min(dist_vec[1],dist_vec[2]));\n\t\n\t// Compute line intensity and then fragment color\n \tfloat I = exp2(-2.0*d*d);\n \t\n  const vec4 fillColor = vec4(0.0, 0.0, 0.0, 0.0);\n  vec4 wireColor = gl_FragColor;\n \t\n \tgl_FragColor = I*wireColor + (1.0 - I)*fillColor;\n}\n";
/*
Single-pass wire frame implementation - see http://cgg-journal.com/2008-2/06/index.html
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.Wire = (function(_super) {
    __extends(Wire, _super);

    Jax.Mesh.Data.endpoints.p2verts = 4;

    Jax.Mesh.Data.endpoints.p3verts = 3;

    function Wire(options) {
      this._dataMap = {
        vertices: 'position',
        p2verts: 'p1_3d',
        p3verts: 'p2_3d'
      };
      this._winScale = [0, 0];
      Wire.__super__.constructor.call(this, options);
    }

    Wire.prototype.prepare = function(context, mesh, model) {
      var b1, b2, b3, c1, c2, c3, colorBuffer, data, i, i1, i2, i3, indexBuffer, normalBuffer, t1, t2, t3, textureCoordsBuffer, v1, v2, v3, vertexBuffer, _i, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;

      if (!mesh.data.wired) {
        indexBuffer = mesh.data.indexBuffer;
        colorBuffer = mesh.data.colorBuffer;
        normalBuffer = mesh.data.normalBuffer;
        textureCoordsBuffer = mesh.data.textureCoordsBuffer;
        vertexBuffer = mesh.data.vertexBuffer;
        data = new Jax.Mesh.Data(indexBuffer.length * 3);
        data.wired = true;
        for (i = _i = 0, _ref = indexBuffer.length; _i < _ref; i = _i += 3) {
          _ref1 = [i, i + 1, i + 2], i1 = _ref1[0], i2 = _ref1[1], i3 = _ref1[2];
          _ref2 = [indexBuffer[i1], indexBuffer[i2], indexBuffer[i3]], b1 = _ref2[0], b2 = _ref2[1], b3 = _ref2[2];
          _ref3 = [b1 * 3, b2 * 3, b3 * 3], v1 = _ref3[0], v2 = _ref3[1], v3 = _ref3[2];
          _ref4 = [b1 * 4, b2 * 4, b3 * 4], c1 = _ref4[0], c2 = _ref4[1], c3 = _ref4[2];
          _ref5 = [b1 * 2, b2 * 2, b3 * 3], t1 = _ref5[0], t2 = _ref5[1], t3 = _ref5[2];
          data.vertexBuffer[i1 * 3] = vertexBuffer[v1];
          data.vertexBuffer[i1 * 3 + 1] = vertexBuffer[v1 + 1];
          data.vertexBuffer[i1 * 3 + 2] = vertexBuffer[v1 + 2];
          data.normalBuffer[i1 * 3] = normalBuffer[v1];
          data.normalBuffer[i1 * 3 + 1] = normalBuffer[v1 + 1];
          data.normalBuffer[i1 * 3 + 2] = normalBuffer[v1 + 2];
          data.colorBuffer[i1 * 4] = colorBuffer[c1];
          data.colorBuffer[i1 * 4 + 1] = colorBuffer[c1 + 1];
          data.colorBuffer[i1 * 4 + 2] = colorBuffer[c1 + 2];
          data.colorBuffer[i1 * 4 + 3] = colorBuffer[c1 + 3];
          data.textureCoordsBuffer[i1 * 2] = textureCoordsBuffer[t1];
          data.textureCoordsBuffer[i1 * 2 + 1] = textureCoordsBuffer[t1 + 1];
          data.p2verts[i1 * 4] = vertexBuffer[v2];
          data.p2verts[i1 * 4 + 1] = vertexBuffer[v2 + 1];
          data.p2verts[i1 * 4 + 2] = vertexBuffer[v2 + 2];
          data.p2verts[i1 * 4 + 3] = 0;
          data.p3verts[i1 * 3] = vertexBuffer[v3];
          data.p3verts[i1 * 3 + 1] = vertexBuffer[v3 + 1];
          data.p3verts[i1 * 3 + 2] = vertexBuffer[v3 + 2];
          data.vertexBuffer[i2 * 3] = vertexBuffer[v2];
          data.vertexBuffer[i2 * 3 + 1] = vertexBuffer[v2 + 1];
          data.vertexBuffer[i2 * 3 + 2] = vertexBuffer[v2 + 2];
          data.normalBuffer[i2 * 3] = normalBuffer[v2];
          data.normalBuffer[i2 * 3 + 1] = normalBuffer[v2 + 1];
          data.normalBuffer[i2 * 3 + 2] = normalBuffer[v2 + 2];
          data.colorBuffer[i2 * 4] = colorBuffer[c2];
          data.colorBuffer[i2 * 4 + 1] = colorBuffer[c2 + 1];
          data.colorBuffer[i2 * 4 + 2] = colorBuffer[c2 + 2];
          data.colorBuffer[i2 * 4 + 3] = colorBuffer[c2 + 3];
          data.textureCoordsBuffer[i2 * 2] = textureCoordsBuffer[t2];
          data.textureCoordsBuffer[i2 * 2 + 1] = textureCoordsBuffer[t2 + 1];
          data.p2verts[i2 * 4] = vertexBuffer[v3];
          data.p2verts[i2 * 4 + 1] = vertexBuffer[v3 + 1];
          data.p2verts[i2 * 4 + 2] = vertexBuffer[v3 + 2];
          data.p2verts[i2 * 4 + 3] = 1;
          data.p3verts[i2 * 3] = vertexBuffer[v1];
          data.p3verts[i2 * 3 + 1] = vertexBuffer[v1 + 1];
          data.p3verts[i2 * 3 + 2] = vertexBuffer[v1 + 2];
          data.vertexBuffer[i3 * 3] = vertexBuffer[v3];
          data.vertexBuffer[i3 * 3 + 1] = vertexBuffer[v3 + 1];
          data.vertexBuffer[i3 * 3 + 2] = vertexBuffer[v3 + 2];
          data.normalBuffer[i3 * 3] = normalBuffer[v3];
          data.normalBuffer[i3 * 3 + 1] = normalBuffer[v3 + 1];
          data.normalBuffer[i3 * 3 + 2] = normalBuffer[v3 + 2];
          data.colorBuffer[i3 * 4] = colorBuffer[c3];
          data.colorBuffer[i3 * 4 + 1] = colorBuffer[c3 + 1];
          data.colorBuffer[i3 * 4 + 2] = colorBuffer[c3 + 2];
          data.colorBuffer[i3 * 4 + 3] = colorBuffer[c3 + 3];
          data.textureCoordsBuffer[i3 * 2] = textureCoordsBuffer[t3];
          data.textureCoordsBuffer[i3 * 2 + 1] = textureCoordsBuffer[t3 + 1];
          data.p2verts[i3 * 4] = vertexBuffer[v1];
          data.p2verts[i3 * 4 + 1] = vertexBuffer[v1 + 1];
          data.p2verts[i3 * 4 + 2] = vertexBuffer[v1 + 2];
          data.p2verts[i3 * 4 + 3] = 2;
          data.p3verts[i3 * 3] = vertexBuffer[v2];
          data.p3verts[i3 * 3 + 1] = vertexBuffer[v2 + 1];
          data.p3verts[i3 * 3 + 2] = vertexBuffer[v2 + 2];
        }
        return mesh.data = data;
      }
    };

    Wire.prototype.setVariables = function(context, mesh, model, vars, pass) {
      var _ref;

      mesh.data.set(vars, this._dataMap);
      _ref = [context.canvas.width / 2, context.canvas.height / 2], this._winScale[0] = _ref[0], this._winScale[1] = _ref[1];
      vars.WIN_SCALE = this._winScale;
      return vars.MVP = context.matrix_stack.getModelViewProjectionMatrix();
    };

    return Wire;

  })(Jax.Material.Layer);

}).call(this);
Jax.shader_data("wire")["vertex"] = "uniform vec2 WIN_SCALE;\nuniform mat4 MVP;\n\nattribute vec4 position;\nattribute vec4 p1_3d;\nattribute vec4 p2_3d;\n\nvoid main(void)\n{\n\t // We store the vertex id (0,1, or 2) in the w coord of the vertex\n\t // which then has to be restored to w=1.\n\t float swizz = p1_3d.w;\n\t vec4 p1_3d_ = p1_3d;\n\t p1_3d_.w = 1.0;\n\t \n\t // Compute the vertex position in the usual fashion.\n   gl_Position = MVP * position;\n   \n\t // p0 is the 2D position of the current vertex.\n\t vec2 p0 = gl_Position.xy/gl_Position.w;\n\t \n\t // Project p1 and p2 and compute the vectors v1 = p1-p0\n\t // and v2 = p2-p0\n\t p1_3d_ = MVP * p1_3d_;\n\t vec2 v1 = WIN_SCALE*(p1_3d_.xy / p1_3d_.w - p0);\n\t vec4 p2_3d_ = MVP * p2_3d;\n\t vec2 v2 = WIN_SCALE*(p2_3d_.xy / p2_3d_.w - p0);\n\t \n\t // Compute 2D area of triangle.\n\t float area2 = abs(v1.x*v2.y - v1.y * v2.x);\n\t \n   // Compute distance from vertex to line in 2D coords\n   float h = area2/length(v1-v2);\n   \n   // ---\n   // The swizz variable tells us which of the three vertices\n   // we are dealing with. The ugly comparisons would not be needed if\n   // swizz was an int.\n   if(swizz<0.1)\n      dist = vec3(h,0,0);\n   else if(swizz<1.1)\n      dist = vec3(0,h,0);\n   else\n      dist = vec3(0,0,h);\n      \n   // ----\n   // Quick fix to defy perspective correction\n   dist *= gl_Position.w;\n}\n";
Jax.shader_data("world_ambient")["common"] = "shared uniform int PASS;\nshared uniform float MaterialAmbientIntensity;\nshared uniform vec4 WorldAmbientColor;\nshared uniform vec4 MaterialAmbientColor;\n";
Jax.shader_data("world_ambient")["fragment"] = "void main(void) {\n  if (PASS == 0) {\n    // ambient pass only\n    vec3 material = MaterialAmbientIntensity * MaterialAmbientColor.rgb * MaterialAmbientColor.a;\n    vec4 color = vec4(WorldAmbientColor.rgb * WorldAmbientColor.a * material, 1.0);\n    import(VertexColor, color *= VertexColor);\n\tgl_FragColor = color;\n  }\n}\n";
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Jax.Material.Layer.WorldAmbient = (function(_super) {
    __extends(WorldAmbient, _super);

    function WorldAmbient(options) {
      this.intensity = 1;
      this.color = Jax.Color.parse('#ffff');
      WorldAmbient.__super__.constructor.call(this, options);
    }

    WorldAmbient.prototype.setVariables = function(context, mesh, model, vars, pass) {
      vars.PASS = pass;
      vars.WorldAmbientColor = context.world.ambientColor.toVec4();
      vars.MaterialAmbientColor = this.color;
      return vars.MaterialAmbientIntensity = this.intensity;
    };

    return WorldAmbient;

  })(Jax.Material.Layer);

}).call(this);
(function() {


}).call(this);
(function() {
  Jax.Material.addResources({
    basic: {
      type: "Custom",
      layers: [
        {
          type: "Basic"
        }
      ]
    },
    "default": {
      type: "Surface",
      intensity: {
        ambient: 1,
        diffuse: 1,
        specular: 1
      },
      shininess: 60,
      color: {
        ambient: "#ffffff",
        diffuse: "#cccccc",
        specular: "#ffffff"
      }
    },
    depthmap: {
      type: 'Custom',
      layers: [
        {
          type: 'Position'
        }, {
          type: 'Depthmap'
        }
      ]
    },
    "paraboloid-depthmap": {
      type: "Custom",
      layers: [
        {
          type: "Paraboloid"
        }, {
          type: "Depthmap"
        }
      ]
    },
    picking: {
      type: "Custom",
      layers: [
        {
          type: 'Position'
        }, {
          type: 'Picking'
        }
      ]
    },
    ssao: {
      type: "Custom",
      layers: [
        {
          type: "SSAO"
        }
      ]
    },
    wire: {
      type: 'Wire',
      intensity: {
        ambient: 1,
        diffuse: 1,
        specular: 1
      },
      shininess: 60,
      color: {
        ambient: "#ffffff",
        diffuse: "#cccccc",
        specular: "#ffffff"
      }
    }
  });

}).call(this);
((function() {
  function messageFor(owner, newProp, oldProp) {
    if (newProp) {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please use `"+owner.name+"#"+newProp.replace(/\./g, '#')+"` instead.";
    } else {
      return "`"+owner.name+"#"+oldProp.replace(/\./g, '#')+"` has been deprecated. "+
             "Please see the documentation.";
    }
  }

  function createDelegator(oldProp, newProp, message) {
    var setter = false;
    if (newProp) {
      setter = newProp.charAt(newProp.length-1) === '=';
      newProp = newProp.replace(/=$/, '');
    }
    
    return (function() {
      var _value;
      var src = this;
      if (newProp) {
        var prop = newProp.split('.');
        while (prop.length > 1) {
          src = src[prop.shift()];
          if (src === undefined) throw new Error(message);
        }
        prop = prop[0]
        _value = src[prop]
        if (Jax.deprecate.level > 0) console.log(new Error(message).stack);
        else console.log(message);
        if (_value instanceof Function)
          return _value.apply(this, arguments);
        else {
          if (setter)
            if (arguments.length > 1)
              return src[prop] = arguments;
            else
              return src[prop] = arguments[0];
          else
            return _value;
        }
      } else {
        throw new Error(message);
      }
    });
  }

  Jax.deprecate = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    _proto[oldProp] = delegator;
  };

  Jax.deprecateProperty = function(owner, oldProp, newProp, message) {
    if (!owner) throw new Error("Can't deprecate '"+oldProp+"' without an owner");
    var _proto = owner.prototype || owner;
    var delegator = createDelegator(oldProp, newProp, message || messageFor(owner, newProp, oldProp));
    Object.defineProperty(_proto, oldProp, {
      get: delegator,
      set: delegator
    });
  };
})());

Jax.deprecate.level = 1;

if (Jax.Camera) {
  Jax.deprecate(Jax.Camera, 'getFrustum', 'frustum');
  Jax.deprecate(Jax.Camera, 'getPosition', 'position');
  Jax.deprecate(Jax.Camera, 'getDirection', 'direction');
  Jax.deprecate(Jax.Camera, 'getViewVector', 'direction');
  Jax.deprecate(Jax.Camera, 'getRightVector', 'right');
  Jax.deprecate(Jax.Camera, 'getUpVector', 'up');
  Jax.deprecate(Jax.Camera, 'setDirection', 'direction=');
  Jax.deprecate(Jax.Camera, 'setViewVector', 'direction=');
  Jax.deprecate(Jax.Camera, 'setPosition', 'position=');
  /** deprecated
   * Jax.Camera#orient(viewVector, upVector[, positionVector]) -> Jax.Camera
   * - viewVector (vec3): the new direction that the camera will be pointing
   * - upVector (vec3): the new "up" direction perpendicular to the view
   * - positionVector (vec3): optionally, a new position for the camera
   * Jax.Camera#orient(vx, vy, vz, ux, uy, uz[, px, py, pz]) -> Jax.Camera
   * 
   * Reorients this camera to be looking in the specified direction.
   * Optionally, repositions this camera.
   *
   * **Deprecated.** Please use Jax.Camera#setDirection instead.
   **/
  Jax.deprecate(Jax.Camera, 'orient', 'reorient');

}

/** deprecated
 * Jax.World#addLightSource(light) -> Jax.Scene.LightSource
 * - light (Jax.Scene.LightSource): the instance of Jax.Scene.LightSource to add to this world.
 *
 * Adds the light to the world and then returns the light itself unchanged.
 * Deprecated: use `Jax.World#addLight` instead.
 **/
if (Jax.World) {
  Jax.deprecate(Jax.World, 'addLightSource', 'addLight');
}

if (Jax.Light) {
  Jax.deprecate(Jax.Light, 'getPosition', 'position');
  Jax.deprecate(Jax.Light, 'castShadows', 'shadows');
}

if (Jax.Model) {
  Jax.deprecate(Jax.Model, 'lit', 'illuminated');
  Jax.deprecate(Jax.Model, 'shadow_caster', 'castShadow and receiveShadow');
}

if (Jax.Mesh) {
  if (Jax.Mesh.Base) {
    Jax.deprecate(Jax.Mesh.Base, 'getVertexBuffer', 'data.set(vars, {vertices: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getNormalBuffer', 'data.set(vars, {normals: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getColorBuffer', 'data.set(vars, {colors: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTextureCoordsBuffer', 'data.set(vars, {texture: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTangentBuffer', 'data.set(vars, {tangents: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Base, 'getTriangles', 'eachTriangle(callback)');
  }

  if (Jax.Mesh.Triangles) {
    Jax.deprecate(Jax.Mesh.Triangles, 'getVertexBuffer', 'data.set(vars, {vertices: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getNormalBuffer', 'data.set(vars, {normals: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getColorBuffer', 'data.set(vars, {colors: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getTextureCoordsBuffer', 'data.set(vars, {texture: "shaderVariableName"})');
    Jax.deprecate(Jax.Mesh.Triangles, 'getTangentBuffer', 'data.set(vars, {tangents: "shaderVariableName"})');
  }
}

if (Jax.View) {
  Jax.deprecateProperty(Jax.View, 'gl', 'context.gl', 'The @gl property of Jax views has been deprecated. Please use @context.renderer instead. If @context.renderer cannot do what you need, then use @context.gl, but bear in mind that this will become a deprecated property sometime in the future, after @context.renderer becomes more capable.');
  Jax.deprecate(Jax.View, 'glClear', 'gl.clear');
}

/** deprecated
 * Jax.RouteSet#root(controller, actionName) -> undefined
 * - controller (Jax.Controller): the controller that will be routed to
 * - actionName (String): the name of the action to be invoked by this route
 * 
 * Note that the controller is expected to be a subclass of Jax.Controller.
 * 
 * Example:
 * 
 *     Jax.routes.root(WelcomeController, "index");
 * 
 **/
if (Jax.RouteSet) {
  Jax.deprecate(Jax.RouteSet, 'root', null, 
    "Jax.RouteSet#root is deprecated. Instead, please use\n" +
    "  `new Jax.Context(canvas, {root:'controller/action'})`\n"+
    "or redirect explicitly with \n"+
    "  `context.redirectTo('controller/action')`"
  );
}

if (Jax.Framebuffer) {
  /** deprecated
   * Jax.Framebuffer#getTextureBuffer(context, index) -> Jax.Texture
   *
   * This method is deprecated. See Jax.Framebuffer#getTexture instead.
   **/
  Jax.deprecate(Jax.Framebuffer, 'getTextureBuffer', 'getTexture');

  /** deprecated
   * Jax.Framebuffer#getTextureBufferHandle(context, index) -> WebGLTexture
   *
   * This method is deprecated. See Jax.Framebuffer#getTextureHandle instead.
   **/
  Jax.deprecate(Jax.Framebuffer, 'getTextureBufferHandle', 'getTextureHandle');
}

if (Jax.Context) {
  Jax.deprecate(Jax.Context, 'getUpdatesPerSecond');
  Jax.deprecate(Jax.Context, 'disableUpdateSpeedCalculations');
  Jax.deprecate(Jax.Context, 'loadModelMatrix', 'matrix_stack.loadModelMatrix');
  Jax.deprecate(Jax.Context, 'loadViewMatrix', 'matrix_stack.loadViewMatrix');
  Jax.deprecate(Jax.Context, 'loadProjectionMatrix', 'matrix_stack.loadProjectionMatrix');
  Jax.deprecate(Jax.Context, 'multModelMatrix', 'matrix_stack.multModelMatrix');
  Jax.deprecate(Jax.Context, 'multViewMatrix', 'matrix_stack.multViewMatrix');
  Jax.deprecate(Jax.Context, 'multProjectionMatrix', 'matrix_stack.multProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getModelMatrix', 'matrix_stack.getModelMatrix');
  Jax.deprecate(Jax.Context, 'getViewMatrix', 'matrix_stack.getViewMatrix');
  Jax.deprecate(Jax.Context, 'getProjectionMatrix', 'matrix_stack.getProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getInverseModelMatrix', 'matrix_stack.getInverseModelMatrix');
  Jax.deprecate(Jax.Context, 'getNormalMatrix', 'matrix_stack.getNormalMatrix');
  Jax.deprecate(Jax.Context, 'getInverseViewMatrix', 'matrix_stack.getInverseViewMatrix');
  Jax.deprecate(Jax.Context, 'getModelViewMatrix', 'matrix_stack.getModelViewMatrix');
  Jax.deprecate(Jax.Context, 'getInverseModelViewMatrix', 'matrix_stack.getInverseModelViewMatrix');
  Jax.deprecate(Jax.Context, 'getModelViewProjectionMatrix', 'matrix_stack.getModelViewProjectionMatrix');
  Jax.deprecate(Jax.Context, 'getInverseProjectionMatrix', 'matrix_stack.getInverseProjectionMatrix');
  Jax.deprecateProperty(Jax.Context, 'current_controller', 'controller');
  Jax.deprecateProperty(Jax.Context, 'current_view', 'view');
  /** deprecated
   * Jax.Context#afterRender(func) -> Jax.Context
   * 
   * Registers the specified function to be called immediately after every render pass.
   * Returns this context.
   *
   * When the function is called, its +this+ object is set to the context itself.
   **/
  Jax.deprecate(Jax.Context, "afterRender");

  /** deprecated
   * Jax.Context#afterUpdate(func) -> Jax.Context
   *
   * Registers the specified function to be called immediately after every update pass.
   * Returns this context.
   *
   * When the function is called, its +this+ object is set to the context itself.
   **/
  Jax.deprecate(Jax.Context, "afterUpdate");

  Jax.deprecate(Jax.Context, 'glClearColor', 'gl.clearColor');
  Jax.deprecate(Jax.Context, 'glGetContextAttributes', 'gl.getContextAttributes');
  Jax.deprecate(Jax.Context, 'glIsContextLost', 'gl.isContextLost');
  Jax.deprecate(Jax.Context, 'glGetSupportedExtensions', 'gl.getSupportedExtensions');
  Jax.deprecate(Jax.Context, 'glGetExtension', 'gl.getExtension');
  Jax.deprecate(Jax.Context, 'glActiveTexture', 'gl.activeTexture');
  Jax.deprecate(Jax.Context, 'glAttachShader', 'gl.attachShader');
  Jax.deprecate(Jax.Context, 'glBindAttribLocation', 'gl.bindAttribLocation');
  Jax.deprecate(Jax.Context, 'glBindBuffer', 'gl.bindBuffer');
  Jax.deprecate(Jax.Context, 'glBindFramebuffer', 'gl.bindFramebuffer');
  Jax.deprecate(Jax.Context, 'glBindRenderbuffer', 'gl.bindRenderbuffer');
  Jax.deprecate(Jax.Context, 'glBindTexture', 'gl.bindTexture');
  Jax.deprecate(Jax.Context, 'glBlendColor', 'gl.blendColor');
  Jax.deprecate(Jax.Context, 'glBlendEquation', 'gl.blendEquation');
  Jax.deprecate(Jax.Context, 'glBlendEquationSeparate', 'gl.blendEquationSeparate');
  Jax.deprecate(Jax.Context, 'glBlendFunc', 'gl.blendFunc');
  Jax.deprecate(Jax.Context, 'glBlendFuncSeparate', 'gl.blendFuncSeparate');
  Jax.deprecate(Jax.Context, 'glBufferData', 'gl.bufferData');
  Jax.deprecate(Jax.Context, 'glBufferSubData', 'gl.bufferSubData');
  Jax.deprecate(Jax.Context, 'glCheckFramebufferStatus', 'gl.checkFramebufferStatus');
  Jax.deprecate(Jax.Context, 'glClear', 'gl.clear');
  Jax.deprecate(Jax.Context, 'glClearColor', 'gl.clearColor');
  Jax.deprecate(Jax.Context, 'glClearDepth', 'gl.clearDepth');
  Jax.deprecate(Jax.Context, 'glClearStencil', 'gl.clearStencil');
  Jax.deprecate(Jax.Context, 'glColorMask', 'gl.colorMask');
  Jax.deprecate(Jax.Context, 'glCompileShader', 'gl.compileShader');
  Jax.deprecate(Jax.Context, 'glCompressedTexImage2D', 'gl.compressedTexImage2D');
  Jax.deprecate(Jax.Context, 'glCompressedTexSubImage2D', 'gl.compressedTexSubImage2D');
  Jax.deprecate(Jax.Context, 'glCopyTexImage2D', 'gl.copyTexImage2D');
  Jax.deprecate(Jax.Context, 'glCopyTexSubImage2D', 'gl.copyTexSubImage2D');
  Jax.deprecate(Jax.Context, 'glCreateBuffer', 'gl.createBuffer');
  Jax.deprecate(Jax.Context, 'glCreateFramebuffer', 'gl.createFramebuffer');
  Jax.deprecate(Jax.Context, 'glCreateProgram', 'gl.createProgram');
  Jax.deprecate(Jax.Context, 'glCreateRenderbuffer', 'gl.createRenderbuffer');
  Jax.deprecate(Jax.Context, 'glCreateShader', 'gl.createShader');
  Jax.deprecate(Jax.Context, 'glCreateTexture', 'gl.createTexture');
  Jax.deprecate(Jax.Context, 'glCullFace', 'gl.cullFace');
  Jax.deprecate(Jax.Context, 'glDeleteBuffer', 'gl.deleteBuffer');
  Jax.deprecate(Jax.Context, 'glDeleteFramebuffer', 'gl.deleteFramebuffer');
  Jax.deprecate(Jax.Context, 'glDeleteProgram', 'gl.deleteProgram');
  Jax.deprecate(Jax.Context, 'glDeleteRenderbuffer', 'gl.deleteRenderbuffer');
  Jax.deprecate(Jax.Context, 'glDeleteShader', 'gl.deleteShader');
  Jax.deprecate(Jax.Context, 'glDeleteTexture', 'gl.deleteTexture');
  Jax.deprecate(Jax.Context, 'glDepthFunc', 'gl.depthFunc');
  Jax.deprecate(Jax.Context, 'glDepthMask', 'gl.depthMask');
  Jax.deprecate(Jax.Context, 'glDetachShader', 'gl.detachShader');
  Jax.deprecate(Jax.Context, 'glDisable', 'gl.disable');
  Jax.deprecate(Jax.Context, 'glDisableVertexAttribArray', 'gl.disableVertexAttribArray');
  Jax.deprecate(Jax.Context, 'glDrawArrays', 'gl.drawArrays');
  Jax.deprecate(Jax.Context, 'glDrawElements', 'gl.drawElements');
  Jax.deprecate(Jax.Context, 'glEnable', 'gl.enable');
  Jax.deprecate(Jax.Context, 'glEnableVertexAttribArray', 'gl.enableVertexAttribArray');
  Jax.deprecate(Jax.Context, 'glFinish', 'gl.finish');
  Jax.deprecate(Jax.Context, 'glFlush', 'gl.flush');
  Jax.deprecate(Jax.Context, 'glFramebufferRenderbuffer', 'gl.framebufferRenderbuffer');
  Jax.deprecate(Jax.Context, 'glFramebufferTexture2D', 'gl.framebufferTexture2D');
  Jax.deprecate(Jax.Context, 'glFrontFace', 'gl.frontFace');
  Jax.deprecate(Jax.Context, 'glGenerateMipmap', 'gl.generateMipmap');
  Jax.deprecate(Jax.Context, 'glGetActiveAttrib', 'gl.getActiveAttrib');
  Jax.deprecate(Jax.Context, 'glGetActiveUniform', 'gl.getActiveUniform');
  Jax.deprecate(Jax.Context, 'glGetAttachedShaders', 'gl.getAttachedShaders');
  Jax.deprecate(Jax.Context, 'glGetAttribLocation', 'gl.getAttribLocation');
  Jax.deprecate(Jax.Context, 'glGetBufferParameter', 'gl.getBufferParameter');
  Jax.deprecate(Jax.Context, 'glGetParameter', 'gl.getParameter');
  Jax.deprecate(Jax.Context, 'glGetError', 'gl.getError');
  Jax.deprecate(Jax.Context, 'glGetFramebufferAttachmentParameter', 'gl.getFramebufferAttachmentParameter');
  Jax.deprecate(Jax.Context, 'glGetProgramParameter', 'gl.getProgramParameter');
  Jax.deprecate(Jax.Context, 'glGetProgramInfoLog', 'gl.getProgramInfoLog');
  Jax.deprecate(Jax.Context, 'glGetRenderbufferParameter', 'gl.getRenderbufferParameter');
  Jax.deprecate(Jax.Context, 'glGetShaderParameter', 'gl.getShaderParameter');
  Jax.deprecate(Jax.Context, 'glGetShaderPrecisionFormat', 'gl.getShaderPrecisionFormat');
  Jax.deprecate(Jax.Context, 'glGetShaderInfoLog', 'gl.getShaderInfoLog');
  Jax.deprecate(Jax.Context, 'glGetShaderSource', 'gl.getShaderSource');
  Jax.deprecate(Jax.Context, 'glGetTexParameter', 'gl.getTexParameter');
  Jax.deprecate(Jax.Context, 'glGetUniform', 'gl.getUniform');
  Jax.deprecate(Jax.Context, 'glGetUniformLocation', 'gl.getUniformLocation');
  Jax.deprecate(Jax.Context, 'glGetVertexAttrib', 'gl.getVertexAttrib');
  Jax.deprecate(Jax.Context, 'glGetVertexAttribOffset', 'gl.getVertexAttribOffset');
  Jax.deprecate(Jax.Context, 'glHint', 'gl.hint');
  Jax.deprecate(Jax.Context, 'glIsBuffer', 'gl.isBuffer');
  Jax.deprecate(Jax.Context, 'glIsEnabled', 'gl.isEnabled');
  Jax.deprecate(Jax.Context, 'glIsFramebuffer', 'gl.isFramebuffer');
  Jax.deprecate(Jax.Context, 'glIsProgram', 'gl.isProgram');
  Jax.deprecate(Jax.Context, 'glIsRenderbuffer', 'gl.isRenderbuffer');
  Jax.deprecate(Jax.Context, 'glIsShader', 'gl.isShader');
  Jax.deprecate(Jax.Context, 'glIsTexture', 'gl.isTexture');
  Jax.deprecate(Jax.Context, 'glLineWidth', 'gl.lineWidth');
  Jax.deprecate(Jax.Context, 'glLinkProgram', 'gl.linkProgram');
  Jax.deprecate(Jax.Context, 'glPixelStorei', 'gl.pixelStorei');
  Jax.deprecate(Jax.Context, 'glPolygonOffset', 'gl.polygonOffset');
  Jax.deprecate(Jax.Context, 'glReadPixels', 'gl.readPixels');
  Jax.deprecate(Jax.Context, 'glRenderbufferStorage', 'gl.renderbufferStorage');
  Jax.deprecate(Jax.Context, 'glSampleCoverage', 'gl.sampleCoverage');
  Jax.deprecate(Jax.Context, 'glScissor', 'gl.scissor');
  Jax.deprecate(Jax.Context, 'glShaderSource', 'gl.shaderSource');
  Jax.deprecate(Jax.Context, 'glStencilFunc', 'gl.stencilFunc');
  Jax.deprecate(Jax.Context, 'glStencilFuncSeparate', 'gl.stencilFuncSeparate');
  Jax.deprecate(Jax.Context, 'glStencilMask', 'gl.stencilMask');
  Jax.deprecate(Jax.Context, 'glStencilMaskSeparate', 'gl.stencilMaskSeparate');
  Jax.deprecate(Jax.Context, 'glStencilOp', 'gl.stencilOp');
  Jax.deprecate(Jax.Context, 'glStencilOpSeparate', 'gl.stencilOpSeparate');
  Jax.deprecate(Jax.Context, 'glTexImage2D', 'gl.texImage2D');
  Jax.deprecate(Jax.Context, 'glTexParameterf', 'gl.texParameterf');
  Jax.deprecate(Jax.Context, 'glTexParameteri', 'gl.texParameteri');
  Jax.deprecate(Jax.Context, 'glTexSubImage2D', 'gl.texSubImage2D');
  Jax.deprecate(Jax.Context, 'glUniform1f', 'gl.uniform1f');
  Jax.deprecate(Jax.Context, 'glUniform1fv', 'gl.uniform1fv');
  Jax.deprecate(Jax.Context, 'glUniform1i', 'gl.uniform1i');
  Jax.deprecate(Jax.Context, 'glUniform1iv', 'gl.uniform1iv');
  Jax.deprecate(Jax.Context, 'glUniform2f', 'gl.uniform2f');
  Jax.deprecate(Jax.Context, 'glUniform2fv', 'gl.uniform2fv');
  Jax.deprecate(Jax.Context, 'glUniform2i', 'gl.uniform2i');
  Jax.deprecate(Jax.Context, 'glUniform2iv', 'gl.uniform2iv');
  Jax.deprecate(Jax.Context, 'glUniform3f', 'gl.uniform3f');
  Jax.deprecate(Jax.Context, 'glUniform3fv', 'gl.uniform3fv');
  Jax.deprecate(Jax.Context, 'glUniform3i', 'gl.uniform3i');
  Jax.deprecate(Jax.Context, 'glUniform3iv', 'gl.uniform3iv');
  Jax.deprecate(Jax.Context, 'glUniform4f', 'gl.uniform4f');
  Jax.deprecate(Jax.Context, 'glUniform4fv', 'gl.uniform4fv');
  Jax.deprecate(Jax.Context, 'glUniform4i', 'gl.uniform4i');
  Jax.deprecate(Jax.Context, 'glUniform4iv', 'gl.uniform4iv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix2fv', 'gl.uniformMatrix2fv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix3fv', 'gl.uniformMatrix3fv');
  Jax.deprecate(Jax.Context, 'glUniformMatrix4fv', 'gl.uniformMatrix4fv');
  Jax.deprecate(Jax.Context, 'glUseProgram', 'gl.useProgram');
  Jax.deprecate(Jax.Context, 'glValidateProgram', 'gl.validateProgram');
  Jax.deprecate(Jax.Context, 'glVertexAttrib1f', 'gl.vertexAttrib1f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib1fv', 'gl.vertexAttrib1fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib2f', 'gl.vertexAttrib2f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib2fv', 'gl.vertexAttrib2fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib3f', 'gl.vertexAttrib3f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib3fv', 'gl.vertexAttrib3fv');
  Jax.deprecate(Jax.Context, 'glVertexAttrib4f', 'gl.vertexAttrib4f');
  Jax.deprecate(Jax.Context, 'glVertexAttrib4fv', 'gl.vertexAttrib4fv');
  Jax.deprecate(Jax.Context, 'glVertexAttribPointer', 'gl.vertexAttribPointer');
  Jax.deprecate(Jax.Context, 'glViewport', 'gl.viewport');
}
;
/*
Loads the various Jax components but not the files in this directory.
This was split from `jax.js.coffee` so that it can be reused by the
project docs without the development cruft.


This file pulls in your Jax application and any files (such as
Jax itself) that it depends upon. You can tweak this file as
needed. By default, the entire Jax framework gets included.

Pull in `Jax.Context`, which is the fundamental interface
for using Jax.


Load renderers. Jax will try to use renderers in the order they
appear here.


Support for input devices. Don't bother loading this
if your scene does not process input from the user,
or if you're handling that yourself.


Support for Perlin noise within fragment and vertex shaders


Support for built-in models and meshes.


Support for Jax shaders and materials.
Without these, you'll need to manually pass a `material`
object into the render sequence.



The default Jax scene manager. Without it, you'll need
to manage the scene directly.


Light and shadow constructs. Without these, you'll be unable
to make use of the default diffuse, specular and shadow map
shaders.



Pull in all shaders and resources.



Deprecation warnings. These should come _last_ in the load
order. If your application is **not** giving you any deprecation
warnings in development mode, it's safe to remove the notices
from a production application.
*/


(function() {


}).call(this);
