/**
 * Jax
 * Root namespace containing all Jax data
 **/

var Jax = {
  PRODUCTION: 1,
  
  VERSION: "<%=JAX_VERSION%>",
  
  webgl_not_supported_path: "/webgl_not_supported.html",
  
  /**
   * Global
   * Objects and functions defined here are available in the global scope.
   **/
  getGlobal: function() {
    return (function() {
      if (typeof(global) != 'undefined') return global;
      else return window;
    })();
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

/* Called by Jax applications as of version 0.0.0.5 to alert the user to incomplete upgrades */
Jax.doVersionCheck = function(targetVersion) {
  // don't do this in production cause that would be a Bad Idea
  if (Jax.environment && Jax.environment == Jax.PRODUCTION) return;
  
  if (Jax.VERSION != targetVersion) {
    alert("Jax version mismatch!\n\n" +
          "Your Jax gem is version "+targetVersion+", but the Jax JS library is version "+Jax.VERSION+"!\n\n" +
          "Please run `rake jax:update` at the command line to fix this issue.");
  }
};

/* Defines constants, functions, etc. that may exist in one browser but not in another */

/* Compatibility layer for node.js */

if (typeof(window) == "undefined")
  Jax.getGlobal().window = Jax.getGlobal();

if (typeof(document) == "undefined") {
  Jax.getGlobal().document = require("helpers/node_dom_emulator");
}

/**
 * Jax.Compatibility
 * Contains values used for cross-browser compatibility.
 **/
Jax.Compatibility = (function() {
  var offsetTop = 1;
  var offsetLeft = 1;
  
  return {
    /**
     * Jax.Compatibility.offsetTop -> Number
     * Some browsers have different values for +offsetTop+. Jax must track these
     * changes in order to ensure that the reported mouse coordinates are accurate.
     **/
    offsetTop: offsetTop,
  
    /**
     * Jax.Compatibility.offsetLeft -> Number
     * Some browsers have different values for +offsetLeft+. Jax must track these
     * changes in order to ensure that the reported mouse coordinates are accurate.
     **/
    offsetLeft: offsetLeft,
  };
})();

/*
  Object.keys defined only in the newest browsers. If they're going to fail, let them fail due to HTML5 incompatibility
  and not standards compat.
 */
if (!Object.keys) {
  Object.keys = function(object) {
    var arr = [];
    for (var i in object)
      arr.push(i);
    return arr;
  };
}

/**
 * Array#clear() -> Array
 * Removes all objects from this array and returns itself, now empty.
 **/
Array.prototype.clear = Array.prototype.clear || function() {
  this.splice(0, this.length);
  return this;
};


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
EJS.Helpers.prototype.date_tag = function(name, value , html_options) {
    if(! (value instanceof Date))
		value = new Date()
	
	var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var years = [], months = [], days =[];
	var year = value.getFullYear();
	var month = value.getMonth();
	var day = value.getDate();
	for(var y = year - 15; y < year+15 ; y++)
	{
		years.push({value: y, text: y})
	}
	for(var m = 0; m < 12; m++)
	{
		months.push({value: (m), text: month_names[m]})
	}
	for(var d = 0; d < 31; d++)
	{
		days.push({value: (d+1), text: (d+1)})
	}
	var year_select = this.select_tag(name+'[year]', year, years, {id: name+'[year]'} )
	var month_select = this.select_tag(name+'[month]', month, months, {id: name+'[month]'})
	var day_select = this.select_tag(name+'[day]', day, days, {id: name+'[day]'})
	
    return year_select+month_select+day_select;
}

EJS.Helpers.prototype.form_tag = function(action, html_options) {
                 
    
    html_options     = html_options                     || {};
	html_options.action = action
    if(html_options.multipart == true) {
        html_options.method = 'post';
        html_options.enctype = 'multipart/form-data';
    }
    
    return this.start_tag_for('form', html_options)
}

EJS.Helpers.prototype.form_tag_end = function() { return this.tag_end('form'); }

EJS.Helpers.prototype.hidden_field_tag   = function(name, value, html_options) { 
    return this.input_field_tag(name, value, 'hidden', html_options); 
}

EJS.Helpers.prototype.input_field_tag = function(name, value , inputType, html_options) {
    
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value || '';
    html_options.type = inputType || 'text';
    html_options.name = name;
    
    return this.single_tag_for('input', html_options)
}

EJS.Helpers.prototype.is_current_page = function(url) {
	return (window.location.href == url || window.location.pathname == url ? true : false);
}

EJS.Helpers.prototype.link_to = function(name, url, html_options) {
    if(!name) var name = 'null';
    if(!html_options) var html_options = {}
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} "
		html_options.confirm = null;
	}
    html_options.href=url
    return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
}

EJS.Helpers.prototype.submit_link_to = function(name, url, html_options){
	if(!name) var name = 'null';
    if(!html_options) var html_options = {}
    html_options.onclick = html_options.onclick  || '' ;
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} "
		html_options.confirm = null;
	}
	
    html_options.value = name;
	html_options.type = 'submit'
    html_options.onclick=html_options.onclick+
		(url ? this.url_for(url) : '')+'return false;';
    //html_options.href='#'+(options ? Routes.url_for(options) : '')
	return this.start_tag_for('input', html_options)
}

EJS.Helpers.prototype.link_to_if = function(condition, name, url, html_options, post, block) {
	return this.link_to_unless((condition == false), name, url, html_options, post, block);
}

EJS.Helpers.prototype.link_to_unless = function(condition, name, url, html_options, block) {
	html_options = html_options || {};
	if(condition) {
		if(block && typeof block == 'function') {
			return block(name, url, html_options, block);
		} else {
			return name;
		}
	} else
		return this.link_to(name, url, html_options);
}

EJS.Helpers.prototype.link_to_unless_current = function(name, url, html_options, block) {
	html_options = html_options || {};
	return this.link_to_unless(this.is_current_page(url), name, url, html_options, block)
}


EJS.Helpers.prototype.password_field_tag = function(name, value, html_options) { return this.input_field_tag(name, value, 'password', html_options); }

EJS.Helpers.prototype.select_tag = function(name, value, choices, html_options) {     
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value;
	html_options.name = name;
    
    var txt = ''
    txt += this.start_tag_for('select', html_options)
    
    for(var i = 0; i < choices.length; i++)
    {
        var choice = choices[i];
        var optionOptions = {value: choice.value}
        if(choice.value == value)
            optionOptions.selected ='selected'
        txt += this.start_tag_for('option', optionOptions )+choice.text+this.tag_end('option')
    }
    txt += this.tag_end('select');
    return txt;
}

EJS.Helpers.prototype.single_tag_for = function(tag, html_options) { return this.tag(tag, html_options, '/>');}

EJS.Helpers.prototype.start_tag_for = function(tag, html_options)  { return this.tag(tag, html_options); }

EJS.Helpers.prototype.submit_tag = function(name, html_options) {  
    html_options = html_options || {};
    //html_options.name  = html_options.id  || 'commit';
    html_options.type = html_options.type  || 'submit';
    html_options.value = name || 'Submit';
    return this.single_tag_for('input', html_options);
}

EJS.Helpers.prototype.tag = function(tag, html_options, end) {
    if(!end) var end = '>'
    var txt = ' '
    for(var attr in html_options) { 
	   if(html_options[attr] != null)
        var value = html_options[attr].toString();
       else
        var value=''
       if(attr == "Class") // special case because "class" is a reserved word in IE
        attr = "class";
       if( value.indexOf("'") != -1 )
            txt += attr+'=\"'+value+'\" ' 
       else
            txt += attr+"='"+value+"' " 
    }
    return '<'+tag+txt+end;
}

EJS.Helpers.prototype.tag_end = function(tag)             { return '</'+tag+'>'; }

EJS.Helpers.prototype.text_area_tag = function(name, value, html_options) { 
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.name  = html_options.name  || name;
	value = value || ''
    if(html_options.size) {
        html_options.cols = html_options.size.split('x')[0]
        html_options.rows = html_options.size.split('x')[1];
        delete html_options.size
    }
    
    html_options.cols = html_options.cols  || 50;
    html_options.rows = html_options.rows  || 4;
    
    return  this.start_tag_for('textarea', html_options)+value+this.tag_end('textarea')
}
EJS.Helpers.prototype.text_tag = EJS.Helpers.prototype.text_area_tag

EJS.Helpers.prototype.text_field_tag     = function(name, value, html_options) { return this.input_field_tag(name, value, 'text', html_options); }

EJS.Helpers.prototype.url_for = function(url) {
        return 'window.location="'+url+'";'
}
EJS.Helpers.prototype.img_tag = function(image_location, alt, options){
	options = options || {};
	options.src = image_location
	options.alt = alt
	return this.single_tag_for('img', options)
}
;
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

// Fallback for systems that don't support WebGL
if(typeof Float32Array != 'undefined') {
	glMatrixArrayType = Float32Array;
} else if(typeof WebGLFloatArray != 'undefined') {
	glMatrixArrayType = WebGLFloatArray; // This is officially deprecated and should dissapear in future revisions.
} else {
	glMatrixArrayType = Array;
}

/**
 * vec3
 * 3 Dimensional Vector
 **/
var vec3 = {};

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
vec3.create = function(vec) {
	var dest = new glMatrixArrayType(3);
	
	if(vec) {
		dest[0] = vec[0];
		dest[1] = vec[1];
		dest[2] = vec[2];
	}
	
	return dest;
};

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
vec3.set = function(vec, dest) {
	dest[0] = vec[0];
	dest[1] = vec[1];
	dest[2] = vec[2];
	
	return dest;
};

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
vec3.negate = function(vec, dest) {
	if(!dest) { dest = vec; }
	
	dest[0] = -vec[0];
	dest[1] = -vec[1];
	dest[2] = -vec[2];
	return dest;
};

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
vec3.cross = function(vec, vec2, dest){
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
	
	dest[0] = y*z2 - z*y2;
	dest[1] = z*x2 - x*z2;
	dest[2] = x*y2 - y*x2;
	return dest;
};

/**
 * vec3.length(vec) -> Number
 * - vec (vec3) : vec3 to calculate length of
 *
 * Caclulates the length of a vec3
 *
 * Returns:
 * Length of vec
 **/
vec3.length = function(vec){
	var x = vec[0], y = vec[1], z = vec[2];
	return Math.sqrt(x*x + y*y + z*z);
};

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
vec3.dot = function(vec, vec2){
	return vec[0]*vec2[0] + vec[1]*vec2[1] + vec[2]*vec2[2];
};

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
vec3.lerp = function(vec, vec2, lerp, dest){
    if(!dest) { dest = vec; }
    
    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
    
    return dest;
}

/**
 * vec3.str(vec) -> String
 * - vec (vec3) : vec3 to represent as a string
 *
 * Returns a string representation of a vector
 *
 * Returns:
 * string representation of vec
 **/
vec3.str = function(vec) {
	return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']'; 
};

/**
 * mat3
 * 3x3 Matrix
 **/
var mat3 = {};

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

/**
 * mat3.identity(dest) -> mat3
 * - dest (mat3) : mat3 to set
 *
 * Sets a mat3 to an identity matrix
 *
 * Returns:
 * dest
 **/
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
mat3.transpose = function(mat, dest) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
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

/**
 * mat3.str(mat) -> String
 * - mat (mat3) : mat3 to represent as a string
 *
 * Returns a string representation of a mat3
 *
 * Returns:
 * string representation of mat
 **/
mat3.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + 
		', ' + mat[3] + ', '+ mat[4] + ', ' + mat[5] + 
		', ' + mat[6] + ', ' + mat[7] + ', '+ mat[8] + ']';
};

/**
 * mat4
 * 4x4 Matrix
 **/
var mat4 = {};

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

/**
 * mat4.identity(dest) -> mat4
 * - dest (mat4) : mat4 to set
 *
 * Sets a mat4 to an identity matrix
 *
 * Returns:
 * dest
 **/
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
mat4.transpose = function(mat, dest) {
	// If we are transposing ourselves we can skip a few steps but have to cache some values
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

/**
 * mat4.determinant(mat) -> mat4
 * - mat (mat4) : mat4 to calculate determinant of
 *
 * Calculates the determinant of a mat4
 *
 * Returns:
 * determinant of mat
 **/
mat4.determinant = function(mat) {
	// Cache the matrix values (makes for huge speed increases!)
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
mat4.inverse = function(mat, dest) {
	if(!dest) { dest = mat; }
	
	// Cache the matrix values (makes for huge speed increases!)
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
	
	// Calculate the determinant (inlined to avoid double-caching)
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
mat4.toInverseMat3 = function(mat, dest) {
	// Cache the matrix values (makes for huge speed increases!)
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
mat4.multiply = function(mat, mat2, dest) {
	if(!dest) { dest = mat }
	
	// Cache the matrix values (makes for huge speed increases!)
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
mat4.multiplyVec3 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2];
	
	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12];
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13];
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14];
	
	return dest;
};

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
mat4.multiplyVec4 = function(mat, vec, dest) {
	if(!dest) { dest = vec }
	
	var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
	
	dest[0] = mat[0]*x + mat[4]*y + mat[8]*z + mat[12]*w;
	dest[1] = mat[1]*x + mat[5]*y + mat[9]*z + mat[13]*w;
	dest[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
	dest[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w;
	
	return dest;
};

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
	
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	
	// Construct the elements of the rotation matrix
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
	
	// Perform rotation-specific matrix multiplication
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
mat4.rotateX = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
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
	
	// Perform axis-specific matrix multiplication
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
mat4.rotateY = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
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
	
	// Perform axis-specific matrix multiplication
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
mat4.rotateZ = function(mat, angle, dest) {
	var s = Math.sin(angle);
	var c = Math.cos(angle);
	
	// Cache the matrix values (makes for huge speed increases!)
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
	
	// Perform axis-specific matrix multiplication
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
mat4.perspective = function(fovy, aspect, near, far, dest) {
	var top = near*Math.tan(fovy*Math.PI / 360.0);
	var right = top*aspect;
	return mat4.frustum(-right, right, -top, top, near, far, dest);
};

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
	
	//vec3.direction(eye, center, z);
	z0 = eyex - center[0];
	z1 = eyey - center[1];
	z2 = eyez - center[2];
	
	// normalize (no check needed for 0 because of early return)
	len = 1/Math.sqrt(z0*z0 + z1*z1 + z2*z2);
	z0 *= len;
	z1 *= len;
	z2 *= len;
	
	//vec3.normalize(vec3.cross(up, z, x));
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
	
	//vec3.normalize(vec3.cross(z, x, y));
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

/**
 * mat4.str(mat) -> String
 * - mat (mat4) : mat4 to represent as a string
 *
 * Returns a string representation of a mat4
 *
 * Returns:
 * string representation of mat
 **/
mat4.str = function(mat) {
	return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + 
		', '+ mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] + 
		', '+ mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] + 
		', '+ mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
};

/**
 * quat4
 * Quaternions 
 **/
quat4 = {};

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
quat4.set = function(quat, dest) {
	dest[0] = quat[0];
	dest[1] = quat[1];
	dest[2] = quat[2];
	dest[3] = quat[3];
	
	return dest;
};

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

/**
 * quat4.length(quat) -> quat4
 * - quat (quat4) : quat4 to calculate length of
 *
 * Calculates the length of a quat4
 *
 * Returns:
 * Length of quat
 **/
quat4.length = function(quat) {
	var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
	return Math.sqrt(x*x + y*y + z*z + w*w);
}

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
quat4.multiplyVec3 = function(quat, vec, dest) {
	if(!dest) { dest = vec; }
	
	var x = vec[0], y = vec[1], z = vec[2];
	var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];

	// calculate quat * vec
	var ix = qw*x + qy*z - qz*y;
	var iy = qw*y + qz*x - qx*z;
	var iz = qw*z + qx*y - qy*x;
	var iw = -qx*x - qy*y - qz*z;
	
	// calculate result * inverse quat
	dest[0] = ix*qw + iw*-qx + iy*-qz - iz*-qy;
	dest[1] = iy*qw + iw*-qy + iz*-qx - ix*-qz;
	dest[2] = iz*qw + iw*-qz + ix*-qy - iy*-qx;
	
	return dest;
}

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

/**
 * quat4.str(quat) -> String
 * - quat (quat4) : quat4 to represent as a string
 *
 * Returns a string representation of a quaternion
 *
 * Returns:
 * string representation of quat
 **/
quat4.str = function(quat) {
	return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']'; 
}

;
/**
 * mat3.multiplyVec3(matrix, vec[, dest]) -> vec3
 * - matrix (mat3): the 3x3 matrix to multiply against
 * - vec (vec3): the vector to multiply
 * - dest (vec3): an optional receiving vector. If not given, vec is used.
 *
 * Transforms the vec3 according to this rotation matrix. Returns +dest+.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/

mat3.multiplyVec3 = function(matrix, vec, dest) {
  if (!dest) dest = vec;
  
  dest[0] = vec[0] * matrix[0] + vec[1] * matrix[3] + vec[2] * matrix[6];
  dest[1] = vec[0] * matrix[1] + vec[1] * matrix[4] + vec[2] * matrix[7];
  dest[2] = vec[0] * matrix[2] + vec[1] * matrix[5] + vec[2] * matrix[8];
  
  return dest;
};
/**
 * mat4.IDENTITY -> mat4
 *
 * Represents a 4x4 Identity matrix.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/

mat4.IDENTITY = mat4.identity(mat4.create());

/**
 * quat4.fromAxes(view, right, up[, dest]) -> quat4
 * - view (vec3): the view vector
 * - right (vec3): the right vector
 * - up (vec3): the up vector
 * - dest (quat): an optional receiving quat4. If omitted, a new one is created.
 *
 * Creates a quaternion from the 3 given vectors. They must be perpendicular
 * to one another.
 **/

quat4.fromAxes = function(view, right, up, dest) {
  var mat = quat4.fromAxes.mat = quat4.fromAxes.mat || mat3.create();
  
  mat[0] = right[0];
  mat[3] = right[1];
  mat[6] = right[2];

  mat[1] = up[0];
  mat[4] = up[1];
  mat[7] = up[2];

  mat[2] = view[0];
  mat[5] = view[1];
  mat[8] = view[2];

  quat4.fromRotationMatrix(mat, dest);
};

/**
 * quat4.fromRotationMatrix(mat[, dest]) -> quat4
 * - mat (mat3): a 3x3 rotation matrix
 * - dest (quat4): an optional receiving quat4. If omitted, a new one is created.
 *
 * Creates a quaternion from the given rotation matrix.
 **/
quat4.fromRotationMatrix = function(mat, dest) {
  if (!dest) dest = quat4.create();
  
  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".

  var fTrace = mat[0] + mat[4] + mat[8];
  var fRoot;

  if ( fTrace > 0.0 )
  {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0);  // 2w
    dest[3] = 0.5 * fRoot;
    fRoot = 0.5/fRoot;  // 1/(4w)
    dest[0] = (mat[7]-mat[5])*fRoot;
    dest[1] = (mat[2]-mat[6])*fRoot;
    dest[2] = (mat[3]-mat[1])*fRoot;
  }
  else
  {
    // |w| <= 1/2
    var s_iNext = quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1,2,0];
    var i = 0;
    if ( mat[4] > mat[0] )
      i = 1;
    if ( mat[8] > mat[i*3+i] )
      i = 2;
    var j = s_iNext[i];
    var k = s_iNext[j];
    
    fRoot = Math.sqrt(mat[i*3+i]-mat[j*3+j]-mat[k*3+k] + 1.0);
    dest[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    dest[3] = (mat[k*3+j] - mat[j*3+k]) * fRoot;
    dest[j] = (mat[j*3+i] + mat[i*3+j]) * fRoot;
    dest[k] = (mat[k*3+i] + mat[i*3+k]) * fRoot;
  }
    
  return dest;
};

/**
 * quat4.toAngleAxis(src[, dest]) -> vec4
 * - src (quat4): the quaternion to convert into an axis with angle
 * - dest (vec4): the optional destination vec4 to store the axis and angle in
 *
 * If dest is not given, src will be modified in place and returned.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.toAngleAxis = function(src, dest) {
  if (!dest) dest = src;
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

  var sqrlen = src[0]*src[0]+src[1]*src[1]+src[2]*src[2];
  if (sqrlen > 0)
  {
    dest[3] = 2 * Math.acos(src[3]);
    var invlen = Math.invsrt(sqrlen);
    dest[0] = src[0]*invlen;
    dest[1] = src[1]*invlen;
    dest[2] = src[2]*invlen;
  } else {
    // angle is 0 (mod 2*pi), so any axis will do
    dest[3] = 0;
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
  }
  
  return dest;
};

/**
 * quat4.fromAngleAxis(angle, axis[, dest]) -> quat4
 * - angle (Number): the angle in radians
 * - axis (vec3): the axis around which to rotate
 * - dest (quat4): the optional quat4 to store the result in
 *
 * Creates a quat4 from the given angle and rotation axis,
 * then returns it. If dest is not given, a new quat4 is created.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.fromAngleAxis = function(angle, axis, dest) {
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
  if (!dest) dest = quat4.create();
  
  var half = angle * 0.5;
  var s = Math.sin(half);
  dest[3] = Math.cos(half);
  dest[0] = s * axis[0];
  dest[1] = s * axis[1];
  dest[2] = s * axis[2];
  
  return dest;
};

/**
 * quat4.IDENTITY -> quat4
 *
 * Represents the Identity quaternion.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
quat4.IDENTITY = quat4.create([0, 0, 0, 1]);

/**
 * class vec2
 * 
 * A 2D vector.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/

if (typeof(vec2) == 'undefined') var vec2 = {};

/**
 * vec2.create([vec]) -> vec2
 * - vec (vec2): optional vec2 to initialize from
 * 
 * Creates a 2D vector and returns it.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec2.create = function(src) {
  var vec = new glMatrixArrayType(2);
  if (src) { vec[0] = src[0]; vec[1] = src[1]; }
  return vec;
};

/**
 * vec3.toQuatRotation(first, second[, dest]) -> quat4
 * - first (vec3): the initial direction vector
 * - second (vec3): the direction to rotate to
 * - dest (quat4): optional quat4 containing result
 *
 * Returns the shortest arc rotation between the two vectors
 * in the form of a quaternion. If dest is not given, it is
 * created.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/

vec3.toQuatRotation = function(first, second, dest) {
  var dot = vec3.dot(first, second);
  // if dot == 1, vectors are the same
  if (dot >= 1.0) return quat4.IDENTITY;
  if (dot < (0.000001 - 1.0)) { // 180 degrees
    // generate an axis
    var axis = vec3.cross(vec3.UNIT_X, first, vec3.create());
    if (vec3.length(axis) < Math.EPSILON) // pick another if colinear
      axis = vec3.cross(vec3.UNIT_Y, first, axis);
    vec3.normalize(axis);
    return quat4.fromAngleAxis(Math.PI, axis, dest);
  } else {
    var s = Math.sqrt((1+dot)*2);
    var invs = 1 / s;
    var c = vec3.cross(first, second, vec3.create());
    if (!dest) dest = quat4.create();
    dest[0] = c[0] * invs;
    dest[1] = c[1] * invs;
    dest[2] = c[2] * invs;
    dest[3] = s * 0.5;
    return quat4.normalize(dest);
  }
};

/**
 * vec3.multiply(a, b[, dest]) -> vec3
 * - a (vec3): left operand
 * - b (vec3): right operand, a 3D vector
 * - dest (vec3): optional destination vector; if omitted, +a+ is used
 *
 * Multiplies the vector +a+ by the vector +b+ and stores the
 * result in either +dest+ or +a+ if +dest+ is omitted. Returns the result.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.multiply = function(a, b, dest) {
  if (!dest) dest = a;
  dest[0] = a[0] * b[0];
  dest[1] = a[1] * b[1];
  dest[2] = a[2] * b[2];
  return dest;
}

/**
 * vec3.UNIT_X -> vec3
 *
 * Represents a unit vector along the positive X axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_X = vec3.create([1,0,0]);

/**
 * vec3.UNIT_Y -> vec3
 *
 * Represents a unit vector along the positive Y axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_Y = vec3.create([0,1,0]);

/**
 * vec3.UNIT_Z -> vec3
 *
 * Represents a unit vector along the positive Z axis
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec3.UNIT_Z = vec3.create([0,0,1]);
/**
 * class vec4
 * 
 * A 4D vector.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/

if (typeof(vec4) == 'undefined') var vec4 = {};

/**
 * vec4.create([src]) -> vec4
 * - src (vec4 | Array): an optional source array to initialize this vec4 from
 * 
 * Creates and returns a new vec4, optionally initialized with values from +src+.
 *
 * (Note: this is a Jax-specific extension. It does not appear by default
 * in the glMatrix library.)
 **/
vec4.create = function(src) {
  var dest = new glMatrixArrayType(4);
  if (src) {
    dest[0] = src[0];
    dest[1] = src[1];
    dest[2] = src[2];
  }
  return dest;
};
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
 * Math
 * Defines math-related helper functions.
 **/

/**
 * Math.radToDeg(rad) -> Number
 * Helper to convert radians to degrees.
 **/
Math.radToDeg = Math.radToDeg || function(rad) {
  return rad * 180.0 / Math.PI;
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
  return deg * Math.PI / 180.0;
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
  if (!a.length && !b.length)
    return Math.abs(a - b) <= Math.EPSILON;

  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; i++)
    if (a[i] == undefined || b[i] == undefined ||
        isNaN(a[i]) != isNaN(b[i]) ||
        isFinite(a[i]) != isFinite(b[i]) ||
        Math.abs(a[i] - b[i]) > Math.EPSILON)
      return false;
  return true;
};
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
    else if (name_or_instance.isKindOf && name_or_instance.isKindOf(Jax.Material))
      return name_or_instance;

    throw new Error("Material must be an instance of Jax.Material, or "+
                    "a string representing a material in the Jax material registry");
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
      if (data.length && data.length >= 3) return vec3.set(data, res);
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
      var res = [0,0,0,0];

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
    if (!src) return;
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
        Jax.Util.merge(src[i], dst[i] = dst[i] || {});
      }
      else dst[i] = src[i];
    }
    
    if (Object.isArray(src)) for (i = 0; i < src.length; i++) doComparison(i);
    else for (i in src) doComparison(i);

    return dst;
  },
  
  /**
   * Jax.Util.normalizeOptions(incoming, defaults) -> Object
   * Receives incoming and formats it into a generic Object with a structure representing the given defaults.
   * The returned object is always a brand-new object, to avoid polluting original incoming object.
   * If the object contains a Jax.Class instance, that actual object is copied over. All other objects
   * are cloned into brand-new objects.
   **/
  normalizeOptions: function(incoming, defaults) {
    var result = {};
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
   * Jax.Util.addRequestedHelpers(klass) -> Array
   * - klass (Jax.Class): A class into which to mix the helpers.
   *
   * First, if +ApplicationHelper+ is defined, it is automatically mixed into the specified class.
   *
   * Then, the class is searched for a #helpers method; if it exists, it is expected to return an array of
   * Helpers (created with +Jax.Helper.create({...})+ ). Each element in the array returned by #helpers is
   * then mixed into the class.
   *
   * An array of all helpers that were just mixed into the target class is returned.
   *
   * As of Jax v1.1.0, you may also set the array of helpers directly on the +helpers+ property
   * of a class, instead of defining a function.
   **/
  addRequestedHelpers: function(klass) {
    var helpers = [];
    if (typeof(ApplicationHelper) != "undefined") {
      helpers.push(ApplicationHelper);
      klass.addMethods(ApplicationHelper);
    }
    if (klass.prototype.helpers) {
      var helper_array;
      if (typeof(klass.prototype.helpers) == "function")
        helper_array = klass.prototype.helpers.call(klass);
      else helper_array = klass.prototype.helpers;
      
      for (var i = 0; i < helper_array.length; i++) {
        helpers.push(helper_array[i]);
        klass.addMethods(helper_array[i]);
      }
    }
    return helpers;
  }
};

/**
 * class Jax.MatrixStack
 * 
 * A matrix stack, obviously. Every Jax.Context allocates its own matrix stack, so you probably
 * shouldn't have to instantiate this directly. Calls to methods of the same name on Jax.Context
 * are delegated into its own matrix stack, so you're really calling these methods.
 * 
 * Note that for performance reasons, whenever you call get[Some]Matrix(), the matrix instance
 * itself is returned instead of a copy of the instance. That gives you the power to make changes
 * directly to the matrix, instead of doing them via the stack. For instance, instead of calling
 * Jax.MatrixStack#loadMatrix(), you could just as easily call mat4#set() using one of the
 * matrices here as an argument. *However*, in doing so you will lose the auto-updating of other
 * matrices, so you must be very careful about how you modify matrices.
 *
 * For example, it would be very easy to use mat4.multiply() to change the model matrix. In doing
 * so, the inverse model matrix would no longer be accurate. This could lead to very
 * difficult-to-debug situations.
 * 
 * When in doubt, it is _strongly_ recommended to use the various matrix methods found in
 * Jax.MatrixStack to modify the matrices here. This will keep all related matrices up-to-date.
 **/

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
    /**
     * Jax.MatrixStack#push() -> Jax.MatrixStack
     * 
     * Saves the state of all current matrices, so that further operations won't affect them directly.
     * If another set of matrices already exist, they are used; otherwise, a new set is allocated.
     * After a new set of matrices has been secured, all current values are copied into the new set.
     * 
     * See also Jax.MatrixStack#pop()
     **/
    push: function() { pushMatrix(this); return this; },

    /**
     * Jax.MatrixStack#pop() -> Jax.MatrixStack
     *
     * Reverts back to an earlier matrix stack, effectively undoing any changes that have been made
     * since the most recent call to Jax.MatrixStack#push().
     *
     * See also Jax.MatrixStack#push()
     **/
    pop: function() { this.depth--; return this; },

    /**
     * Jax.MatrixStack#reset() -> Jax.MatrixStack
     * 
     * Resets the stack depth to zero, effectively undoing all calls to #push().
     **/
    reset: function() { this.depth = 0; return this; },

    /**
     * Jax.MatrixStack#loadModelMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     *
     * Replaces the current model matrix with the specified one.
     * Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    loadModelMatrix: function(values) { loadMatrix(this, MODEL, values); return this; },

    /**
     * Jax.MatrixStack#loadViewMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     *
     * Replaces the current view matrix with the specified one.
     * Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    loadViewMatrix: function(values) { loadMatrix(this, VIEW, values); return this; },

    /**
     * Jax.MatrixStack#loadProjectionMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the new matrix values
     *
     * Replaces the current projection matrix with the specified one.
     * Updates the inverse projection matrix.
     **/
    loadProjectionMatrix: function(values) { loadMatrix(this, PROJECTION, values); return this; },

    /**
     * Jax.MatrixStack#multModelMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     *
     * Multiplies the current model matrix with the specified one.
     * Updates the inverse model matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    multModelMatrix: function(values) { multMatrix(this, MODEL, values); return this; },

    /**
     * Jax.MatrixStack#multViewMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     *
     * Multiplies the current view matrix with the specified one.
     * Updates the inverse view matrix, the modelview matrix, the inverse modelview matrix and the normal matrix.
     **/
    multViewMatrix: function(values) { multMatrix(this, VIEW, values); return this; },

    /**
     * Jax.MatrixStack#multProjectionMatrix(matr) -> Jax.MatrixStack
     * - matr (mat4): the matrix values
     *
     * Multiplies the current projection matrix with the specified one.
     * Updates the inverse projection matrix.
     **/
    multProjectionMatrix: function(values) { multMatrix(this, PROJECTION, values); return this; },
    
    /**
     * Jax.MatrixStack#getModelMatrix() -> mat4
     * 
     * the local model transformation matrix. Most models will manipulate this matrix. Multiplying an object-space
     * coordinate by this matrix will result in a world-space coordinate.
     **/
    getModelMatrix: function() { return this.matrices.model[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseModelMatrix() -> mat4
     * 
     * the opposite of the local model transformation matrix. Multiplying a point in world space against this matrix
     * will result in an object relative to the current object space.
     **/
    getInverseModelMatrix: function() { return this.matrices.inverse_model[this.depth]; },

    /**
     * Jax.MatrixStack#getNormalMatrix() -> mat3
     * 
     * the inverse transpose of the modelview matrix. See
     *   http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
     * for a good writeup of where and how this matrix is useful. Multiplying a 3D _directional_ (not _positional)
     * vector against this matrix will result in a 3D _directional_ vector in eye space.
     **/
    getNormalMatrix: function() { return this.matrices.normal[this.depth]; },
    
    /**
     * Jax.MatrixStack#getViewMatrix() -> mat4
     * 
     * aka the camera matrix. Multiplying a point in eye space (e.g. relative to the camera) against the view matrix
     * results in a point in world space.
     **/
    getViewMatrix: function() { return this.matrices.view[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseViewMatrix() -> mat4
     * 
     * the opposite of the camera matrix. Multiplying a point in world space against this matrix
     * will result in a point in eye space (relative to camera).
     **/
    getInverseViewMatrix: function() { return this.matrices.inverse_view[this.depth]; },

    /**
     * Jax.MatrixStack#getModelViewMatrix() -> mat4
     * 
     * the only matrix OpenGL actually cares about, the modelview matrix. A combination of both model and view
     * matrices, equivalent to mat4.multiply(view, model). (OpenGL matrix operations are read from right-to-left.)
     * 
     * Multiplying a point in object space by this matrix will effectively skip the world space transformation,
     * resulting in a coordinate placed directly into eye space. This has the obvious advantage of being faster
     * than performing the operation in two steps (model and then view).
     **/
    getModelViewMatrix: function() { return this.matrices.modelview[this.depth]; },
    
    /**
     * Jax.MatrixStack#getInverseModelViewMatrix() -> mat4
     * 
     * The opposite of the modelview matrix. Multiplying an eye-space coordinate by this matrix results in an
     * object-space coordinate.
     **/
    getInverseModelViewMatrix: function() { return this.matrices.inverse_modelview[this.depth]; },
        
    /**
     * Jax.MatrixStack#getProjectionMatrix() -> mat4
     * 
     * aka the screen matrix. Multiplying a point in eye space against the projection matrix results in a 4D
     * vector in clip space. Dividing clip coordinates (XYZ) by the 4th component (W) yields a 3D vector in
     * normalized device coordinates, where all components are in the range [-1,1]. These points are ultimately
     * multiplied by screen dimensions to find a pixel position.
     **/
    getProjectionMatrix: function() { return this.matrices.projection[this.depth]; },

    /**
     * Jax.MatrixStack#getModelViewProjectionMatrix() -> mat4
     * 
     * Returns the model, view and projection matrices combined into one.
     **/
    getModelViewProjectionMatrix: function() { return this.matrices.modelview_projection[this.depth]; },
        
    /**
     * Jax.MatrixStack#getInverseProjectionMatrix() -> mat4
     * 
     * the opposite of the projection matrix. Multiplying a 4D vector in normalized device coordinates by
     * its 4th component will result in clip space coordinates. Multiplying these clip space coordinates by the inverse
     * projection matrix will result in a point in eye space, relative to the camera.
     **/
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
      
      this.loadModelMatrix(mat4.IDENTITY);
      this.loadViewMatrix(mat4.IDENTITY);
      this.loadProjectionMatrix(mat4.IDENTITY); // there's no known data about the viewport at this time.
    }
  });
})();

/**
 * Global#debugAssert(expr[, msg]) -> undefined
 * a global debugAssert method that will do nothing in production, and fail if expr is false
 * in any other run mode. If msg is given, an error with that message is raised. Otherwise,
 * a more generic error is raised.
 **/

window.debugAssert = function(expr, msg) {
  if (Jax.environment != Jax.PRODUCTION && !expr)
  {
    var error = new Error(msg || "debugAssert failed");
    if (error.stack) error = new Error((msg || "debugAssert failed")+"\n\n"+error.stack);
    throw error;
  }
};

// If glMatrixArrayType isn't simply Array, then most browsers (FF, Chrome) have a pretty
// crappy implementation of toString() that actually tells you nothing about the array's
// contents. This makes the #toString method a little more Array-like.
//
// Ex: "[Float32Array: -100,-100,-100]"
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
;
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


/**
 * Global#requestAnimFrame(callback, element) -> undefined
 * - callback (Function): callback to be fired to initiate a render sequence
 * - element (DOMElement): a DOM element to attach the animation state to
 *
 * Provides requestAnimationFrame in a cross browser way.
 **/

if (typeof(window) == "undefined") {
  global.requestAnimFrame = (function() {
    return global.requestAnimationFrame ||
           global.webkitRequestAnimationFrame ||
           global.mozRequestAnimationFrame ||
           global.oRequestAnimationFrame ||
           global.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             setTimeout(callback, 1000/60);
           };
  })();
}
else {
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             setTimeout(callback, 1000/60);
           };
  })();
}

;

(function() {
  /*
    Delegator is instantiated by the class method #delegate with _this_ and _arguments_ as arguments.
    It is effectively responsible for copying a set of methods into the destination object.
    
    @see Jax.Class.Methods#delegate
   */
  var Delegator = Jax.Class.create({
    initialize: function(target, methods) {
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
    isKindOf: function(klass) {
      return(this instanceof klass);
    }
  };

  var original_create = Jax.Class.create;
  Jax.Class.create = function() {
    var klass = original_create.apply(Jax.Class, arguments);
    klass.prototype.klass = klass;
    klass.addMethods(Jax.Class.InstanceMethods);
    Jax.Util.addRequestedHelpers(klass);

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
    // to make sure sub-properties of data are standalone objects, so that the original data can't be tainted
    data = Jax.Util.normalizeOptions(data, {});
    
    var attribute;
        
    if (data) {
      for (attribute in data) {
        switch(attribute) {
          case 'position':    self.camera.setPosition(Jax.Util.vectorize(data[attribute])); break;
          case 'direction':   self.camera.setDirection(Jax.Util.vectorize(data[attribute])); break;
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
        this.camera = new Jax.Camera();
        
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

      /**
       * Jax.Model#render(context) -> undefined
       * 
       * Renders this model with the given context. If the model doesn't have a mesh,
       * nothing is rendered.
       **/
      render: function(context, options) {
        if (this.mesh)
        {
          var self = this;
          context.pushMatrix(function() {
            context.multModelMatrix(self.camera.getTransformationMatrix());
            self.mesh.render(context, options);
          });
        }
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
        if (!this.mesh.built) this.mesh.rebuild();
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
    }
  };
  
  Jax.Model.default_properties = {
    lit: true,
    shadow_caster: true
  };
  
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

    Object.extend(klass, model_class_methods);
    return klass;
  };
})();
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
 *   * *mouse_pressed*  - called when a mouse button has been pressed.
 *   * *mouse_released* - called when a mouse button has been released.
 *   * *mouse_clicked*  - called when a mouse button has been clicked.
 *   * *key_pressed*    - called when a keyboard button has been pressed.
 *   * *key_released*   - called when a keyboard button has been released.
 *   * *key_typed*      - called when a keyboard button has been typed.
 *   * *update*         - called (approximately) every 60 milliseconds for as long
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
 * corresponding views (see Jax.View) in this way, as a view is rendered many times
 * -- up to a target rate of 60 passes per second.
 *
 **/

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
      /**
       * Jax.Controller#fireAction(action_name) -> Jax.Controller
       *
       * Erases the results of the last action, then calls the specified action. If it doesn't exist,
       * an error is raised. Finally, unless the action redirects to a different action or renders
       * a different action directly, the specified action becomes the focus of the current view.
       *
       * Returns this controller.
       **/
      fireAction: function(action_name) {
        this.eraseResult();
        this.action_name = action_name;

        if (this[action_name])
          this[action_name].call(this, []);
        else throw new Error("Call to missing action: '"+action_name+"' in controller '"+this.getControllerName()+"'");
        
        if (!this.rendered_or_redirected)
          setViewKey(this);
        return this;
      },
      
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
      instance.context = context;
      instance.world = context && context.world;
      instance.player = context && context.player;
      instance.fireAction(action_name);
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
    Object.extend(klass, { getControllerName: function() { return controller_name; } });
    klass.addMethods({getControllerName: function() { return controller_name; } });
    
    // we already know the controller name and all its actions, so may as well
    // set up routing here.
    for (var method_name in klass.prototype)
    {
      if (!is_protected(method_name)) {
        // it's not a protected name, so treat it as an action
        Jax.routes.map(controller_name+"/"+method_name, klass, method_name);
      }
    }

    return klass;
  };
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
      this.views[path] = view;
    },
    
    /**
     * Jax.ViewManager#get(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    get: function(path) {
      if (this.views[path])
        return new Jax.View(this.views[path]);
      else throw new Error("Could not find view at '"+path+"'!");
    },

    /** alias of: Jax.ViewManager#get
     * Jax.ViewManager#find(path) -> Object
     * - path (String): the view path to be returned.
     * 
     * Note that every call to this method produces a new instance of Jax.View,
     * so be aware that this can cause efficiency problems and memory leaks
     * if not handled appropriately.
     **/
    find: function(path) { return this.get(path); }
  });
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

    /**
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
    root: function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
      set_route(this, "/", this.getRouteDescriptor.apply(this, args));
    },
    
    /**
     * Jax.RouteSet#map(path, controller, actionName) -> undefined
     **/
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
    
    /**
     * Jax.RouteSet#recognize_route(path) -> Object
     * - path (String): the route path to be recognized
     * 
     * Recognizes the specified path, returning an object with properties
     * 'controller' and 'action'. If the route cannot be recognized, an
     * error is thrown.
     **/
    recognize_route: function(path) {
      var route = find_route(this, path) || find_route(this, path+"/index");
      if (!route) throw new Error("Route not recognized: '"+path+"'");
      return route;
    },

    /**
     * Jax.RouteSet#isRouted(path) -> Boolean
     * - path (String): the route path to be recognized
     * 
     * Returns true if the specified path can be routed, false otherwise.
     **/
    isRouted: function(path) {
      return !!find_route(this, path);
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
      var route = this.recognize_route(path);
      
      return route.controller.invoke(route.action, context);
    }
  });
})();
/**
 * class Jax.View
 * 
 * Provides a container class around which View functions can be stored.
 * 
 * This is useful because other parts of Jax will set up helper methods and
 * delegation methods for a View to make use of.
 * 
 * For example, one of the most common tasks for a View is to clear the
 * rendering canvas:
 * 
 *     this.glClear(GL_COLOR_BIT | GL_DEPTH_BUFFER_BIT);
 *     
 * The _glClear_ method is delegated into the Jax.Context associated with
 * this view.
 * 
 * By default, in addition to all WebGL methods, the following delegates and
 * properties are created by Jax:
 * 
 *   * *world*   - the instance of Jax.World that houses all of the objects in
 *                 the scene
 *   * *player*  - the instance of Jax.Player for this context containing information
 *                 about the human user.
 *   * *context* - the instance of Jax.Context that this view is associated with.
 * 
 **/

Jax.View = (function() {
  return Jax.Class.create({
    initialize: function(view_func) {
      this.view_func = view_func;
    },
    
    /**
     * Jax.View#render() -> Jax.View
     *
     * Renders this View. Returns itself.
     **/
    render: function() {
      this.view_func();
      return this;
    }
  });
})();
/*
This file will set up WebGL constants as globals prefixed with GL_, and will add
a new global called GL_METHODS. This will later be used for method delegation
within Jax.Context.
 */

/*
  all files in the webgl/ subdirectory will have access to a temporary GL context,
  via `Jax.getGlobal()['GL']`, which will be unloaded after they have been loaded into memory.
 */

Jax.getGlobal()['WEBGL_CONTEXT_NAME'] = "experimental-webgl";
Jax.getGlobal()['WEBGL_CONTEXT_OPTIONS'] = {stencil:true};
Jax.getGlobal()['GL_METHODS'] = {};

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

  try {
    var gl = canvas.getContext(WEBGL_CONTEXT_NAME);
  } catch(e) {
    // these are now handled by the Context upon initialization.
    // document.location.pathname = "/webgl_not_supported.html";
    // throw new Error("WebGL is disabled or is not supported by this browser!");
    gl = null;
  }

  if (gl) {
    for (var method_name in gl)
    {
      if (typeof(gl[method_name]) == "function")
      {
        var camelized_method_name = method_name.substring(1, method_name.length);
        camelized_method_name = "gl" + method_name.substring(0, 1).toUpperCase() + camelized_method_name;

        /* we'll add a layer here to check for render errors, only in development mode */
        /* FIXME Chrome has serious performance issues related to gl.getError(). Disabling under Chrome for now. */
        var func = "(function "+camelized_method_name+"() {"
                 + "  var result;"
                 + "  if ("+(method_name == 'getError')+" || Jax.environment == Jax.PRODUCTION)"
                 + "    result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + "  else {"
                 + "    try { "
                 + "      result = this.gl."+method_name+".apply(this.gl, arguments);"
                 + "      if ("+(navigator.userAgent.toLowerCase().indexOf('chrome') == -1)+")"
                 + "        this.checkForRenderErrors();"
                 + "    } catch(e) { "
                 + "      var args = [], i;"
                 + "      for (i = 0; i < arguments.length; i++) args.push(arguments[i]);"
                 + "      try { args = JSON.stringify(args); } catch(jsonErr) { args = args.toString(); }"
                 + "      if (!e.stack) e = new Error(e.toString());"
                 + "      this.handleRenderError('"+method_name+"', args, e);"
                 + "    }"
                 + "  }"
                 + "  return result;"
                 + "})";

        GL_METHODS[camelized_method_name] = eval("("+func+")");
      }
      else
      {
        /* define the GL enums Jax.getGlobal()ly so we don't need a context to reference them */
        if (!/[a-z]/.test(method_name)) // no lowercase letters
          Jax.getGlobal()[('GL_'+method_name)] = gl[method_name];
      }
    }

    /* define some extra Jax.getGlobal()s that the above didn't generate */
//    Jax.getGlobal()['GL_MAX_VERTEX_ATTRIBS'] = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    Jax.getGlobal()['GL_DEPTH_COMPONENT'] = gl.DEPTH_COMPONENT || gl.DEPTH_COMPONENT16;
    Jax.getGlobal()['GL_TEXTURES'] = [];
    for (i = 0; i < 32; i++) Jax.getGlobal()['GL_TEXTURES'][i] = gl["TEXTURE"+i];
    Jax.getGlobal()['GL_MAX_ACTIVE_TEXTURES'] = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  }

  Jax.getGlobal()['GL'] = gl;

  Jax.getGlobal()['WEBGL_CLEANUP'] = function() {
    /* clean up after ourselves */
    if (temporaryBody)
      body.parentNode.removeChild(body);
    else
      body.removeChild(canvas);
      
    // remove the temporary GL context that will no longer be used
    delete Jax.getGlobal()['GL'];
    delete Jax.getGlobal()['WEBGL_CLEANUP'];
  };
})();

/**
 * class Jax.Shader
 *
 * Wraps around a WebGL shader program.
 **/

Jax.Shader = (function() {
  function buildStackTrace(context, glShader, source) {
    source = source.split(/\n/);
    var log = context.glGetShaderInfoLog(glShader).split(/\n/);
    
    /* build a detailed backtrace with error information so devs can actually find the error */
    var current = 1, injected = [], li;
    function strToInject() { return current+" : "+source[current-1]; }
    for (li = 0; li < log.length; li++) {
      var line = log[li];
      var match = /0:(\d+):(.*)/.exec(line);
      if (!match) continue; // blank line
      var line_number = parseInt(match[1]);
      if (line_number > current)
        for (; current < line_number; current++)
          injected.push(strToInject());
      if (line_number == current) {
        injected.push(strToInject());
        injected.push(":: ERROR : "+match[2]); /* error message */
      }
      current = line_number+1;
    }
    
    /* prepend a summary so user can debug simple errors at a glance */
    injected.unshift("");
    for (li = log.length-1; li >= 0; li--)
      injected.unshift(log[li]);
        
    /* finally, add 3 more lines so the user has an easier time finding the problem in ambiguous code */
    li = current;
    for (current = li; current < li+3; current++)
      injected.push(strToInject());
        
    return injected.join("\n");
  }
  
  function compile(context, shader, source) {
    context.glShaderSource(shader, source);
    shader.source = source;
    context.glCompileShader(shader);
    if (!context.glGetShaderParameter(shader, GL_COMPILE_STATUS))
      throw new Error(buildStackTrace(context, shader, source));
  }
  
  function sanitizeName(name) {
    return name.replace(/-/, '_');
  }
  
  function getExportedVariableName(exportPrefix, name) {
    return sanitizeName("_"+exportPrefix+"_"+name);
  }
  
  /*
    preprocess shader source code to replace "import(varname, expression)" with the globalized varname if it's been
    exported (as an attribute of material.exports || self.options.exports), or expression if it hasn't.
   */
  function applyImports(self, options, source) {
    var rx = /import\((.*?),\s*(.*?)\)/, result;
    var exp;
    while (result = rx.exec(source)) {
      var name = result[1];
      if (options && (exp = (options.exports && options.exports[name]) || (self.options.exports && self.options.exports[name]))) {
        var exportedVariableName = getExportedVariableName(options.export_prefix || self.getName(), name);
        source = source.replace(result[0], result[2].replace(new RegExp(name, "g"), exportedVariableName));
      }
      else source = source.replace(result[0], "");
    }
    return source;
  }
  
  function applyExports(self, options, source) {
    var rx = /export\((.*?),\s*(.*?)(,\s*(.*?))?\)/, result;
    // rx should match both 'export(vec4, ambient)' and 'export(vec4, ambient, ambient)'
    var replacement, name, type, assignment;
    while (result = rx.exec(source)) {
      type = result[1];
      name = result[2];
      assignment = result[4] || null;
      replacement = getExportedVariableName(options && options.export_prefix || self.getName(), name)+" = ";
      if (assignment) replacement += assignment;
      else replacement += name;
      source = source.replace(result[0], replacement);
    }
    return source;
  }
  
  function mangleUniformsAndAttributes(self, material, source) {
    var map = self.getInputMap(material);
    for (var name in map)
      source = source.replace(new RegExp("(^|[^a-zA-Z0-9])"+name+"([^a-zA-Z0-9]|$)", "g"), "$1"+map[name].full_name+"$2");
    
    // remove the "shared" directive
    return source.replace(/(^|[^\w])shared\s+/g, "$1");
  }
  
  function stripSharedDefinitions(self, options, source) {
    var map = self.getInputMap(options);
    for (var i in map) {
      if (map[i].shared) {
        if (options.skip_global_definitions && options.skip_global_definitions.indexOf(map[i].full_name) != -1) {
          var rx = new RegExp("(shared\\s+)"+map[i].scope+"\\s*"+map[i].type+"[^;]*?"+map[i].full_name+"[^;]*?;\n?", "g");
          source = source.replace(rx, "");
        }
//        else source = source.replace(rx, map[i].scope+" "+map[i].type+" "+map[i].full_name+";\n");
      }
    }

    return source.replace(/shared\s+/, '');
  }
  
  /* TODO separate preprocessing from shader and friends; perhaps a Jax.Shader.Preprocessor class? */
  function preprocess(self, options, source, isVertex) {
    source = stripSharedDefinitions(self, options, source);
//    source = source.replace(/^\s*(shared\s+|)(uniform|attribute|varying)([^;]*)?;\n?/, '');
//    if (!options || !options.skip_global_definitions)
//      source = self.getGlobalDefinitions(options, isVertex) + source;
    source = applyExports(self, options, source);
    source = applyImports(self, options, source);
    source = mangleUniformsAndAttributes(self, options, source);

    return source;
  }
  
  function sourceWithoutComments(source) {
    return source.replace(/\/\*.*\*\//g, "");
  }
  
  function numArgumentsInMain(source) {
    // if a comment contains 'void main' in it, we'll get false positives
    var result = /void\s*main\((.*?)\)\s*\{/.exec(sourceWithoutComments(source));
    if (result) {
      result = result[1].replace(/\s*/g, '');
      if (result == "" || result == "void") return 0;
      else return result[1].split(/,/).length;
    }
    else throw new Error("Could not find main() function in source!\n\n"+source);
  }
  
  return Jax.Class.create({
    initialize: function(obj) {
      this.options = obj;
      
      if (obj.vertex)   this.setRawSource(obj.vertex,   'vertex');
      if (obj.fragment) this.setRawSource(obj.fragment, 'fragment');
      if (obj.common)   this.setRawSource(obj.common,   'common');
      
      this.shaders = { vertex: {}, fragment: {} };
    },
    
    getName: function() { return this.options.name; },
    
    getVertexShader: function(context) {
      if (!this.options.vertex) return null;
      this.shaders.vertex[context.id] = this.shaders.vertex[context.id] || context.glCreateShader(GL_VERTEX_SHADER);
      return this.shaders.vertex[context.id];
    },
    
    getFragmentShader: function(context) {
      if (!this.options.fragment) return null;
      this.shaders.fragment[context.id] = this.shaders.fragment[context.id] || context.glCreateShader(GL_FRAGMENT_SHADER);
      return this.shaders.fragment[context.id];
    },
    
    getCommonSource: function(material) {
      return this.options.common ? this.options.common.render(material) : "";
    },
    
    getVertexSource: function(material) {
      var source = this.getRawSource(material, 'vertex');
      return source && preprocess(this, material, source, true);
    },
    
    getPreamble: function(options) {
      return options && options.ignore_es_precision ? "" : "#ifdef GL_ES\nprecision highp float;\n#endif\n";
    },
    
    getFragmentSource: function(material) {
      var source = this.getRawSource(material, 'fragment');
      return source && preprocess(this, material, source, false);
    },
    
    getVertexArgumentCount: function(options) {
      var source = this.getVertexSource(options);
      return numArgumentsInMain(source);
    },
    
    getFragmentArgumentCount: function(options) {
      var source = this.getFragmentSource(options);
      return numArgumentsInMain(source);
    },
    
    getRawSource: function(options, which) {
      var source = this.options[which];
      options = Jax.Util.normalizeOptions(options, {shader:this,shader_type:which});
      if (source && (source = source.render(options))) {
        var result = this.getPreamble(options);
        if (!options || !options.skip_export_definitions)
          result += this.getExportDefinitions(options && options.export_prefix || this.getName());
        if (!options || !options.skip_common_source)
          result += this.getCommonSource(options) + "\n";
        result += source;
        return result;
      }
      return null;
    },
    
    getGlobalDefinitions: function(options, isVertex) {
      var map = this.getInputMap(options);
      var source = "";
      for (var i in map) {
        if (map[i].scope == "attribute" && !isVertex) continue;
        source += map[i].scope+" "+map[i].type+" "+map[i].full_name+";\n";
      }
      return source;
    },
    
    setRawSource: function(source, which) { this.options[which] = source && new EJS({text:source}); },
    
    setVertexSource: function(source) { this.setRawSource(source, 'vertex'); },
    
    setFragmentSource: function(source) { this.setRawSource(source, 'fragment'); },
    
    getInputMap: function(options) {
      var map = {};
      var prefix = "";
      
      if (options && options.local_prefix)  prefix = options.local_prefix+"_";
      else if (options && options.export_prefix) prefix = options.export_prefix+"_";
      
      var source = (this.getRawSource(options, 'common')   || "") + "\n\n" +
                   (this.getRawSource(options, 'vertex')   || "")  + "\n\n" +
                   (this.getRawSource(options, 'fragment') || "");
      
      // if it's not a "shared" uniform, mangle its name.
      var rx = new RegExp("(^|\\n|\\s+)((shared\\s+)?)(uniform|attribute|varying)\\s+(\\w+)\\s+((?!"+prefix+")[^;]*);"), result;
      while (result = rx.exec(source)) {
        var shared = /shared/.test(result[2]);
        var scope = result[4];
        var type = result[5];
        var names = result[6].split(/,/);

        for (var i = 0; i < names.length; i++) {
          names[i] = names[i].replace(/^\s+/, '').replace(/\s+$/, '');
          if (shared) map[names[i]] = names[i];
          else map[names[i]] = sanitizeName(prefix+names[i]);
          map[names[i]] = { full_name: map[names[i]], type: type, scope: scope, shared: shared };
          source = source.replace(new RegExp("(^|[^a-zA-Z0-9_])"+names[i]+"([^a-zA-Z0-9_]|$)", "g"),
                                  "$1"+prefix+names[i]+"$2");
        }
      }
      
      return map;
    },
    
    getExportDefinitions: function(exportPrefix, skip) {
      var exports = "";
      if (this.options.exports) {
        for (var name in this.options.exports) {
          if (!skip || skip.indexOf(name) == -1)
            exports += this.options.exports[name]+" "+getExportedVariableName(exportPrefix, name)+";\n";
        }
      }
      return exports + "\n";
    },
    
    build: function(context, material) {
      var count = 0;
      if (this.getVertexShader(context)) {
        count++;
        compile(context, this.getVertexShader(context), this.getVertexSource(material));
      }
      if (this.getFragmentShader(context)) {
        count++;
        compile(context, this.getFragmentShader(context), this.getFragmentSource(material));
      }
      if (count == 0) throw new Error("No sources specified for shader '"+this.getName()+"'!");
    }
  });
})();

(function() {
  var gl = Jax.getGlobal()['GL']);
  Jax.Shader.max_varyings          = gl ? gl.getParameter(GL_MAX_VARYING_VECTORS) : 0;
  Jax.Shader.max_vertex_uniforms   = gl ? gl.getParameter(GL_MAX_VERTEX_UNIFORM_VECTORS) : 0;
  Jax.Shader.max_fragment_uniforms = gl ? gl.getParameter(GL_MAX_FRAGMENT_UNIFORM_VECTORS) : 0;
  Jax.Shader.max_attributes        = gl ? gl.getParameter(GL_MAX_VERTEX_ATTRIBS) : 0;
  Jax.Shader.max_vertex_textures   = gl ? gl.getParameter(GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS) : 0;

  // FIXME differentiate between vertex & fragment uniforms
  Jax.Shader.max_uniforms           = Math.min(Jax.Shader.max_fragment_uniforms, Jax.Shader.max_vertex_uniforms);
})();
Jax.Shader.Delegator = (function() {
  return Jax.Class.create({
    initialize: function(context, program, variables) {
      this.context = context;
      this.program = program;
      this.variables = variables;
    },
    
    doesExist: function(key) {
      return this.variables[key] != undefined;
    }
  });
})();

Jax.Shader.AttributeDelegator = (function() {
  return Jax.Class.create(Jax.Shader.Delegator, {
    initialize: function($super, context, program) {
      var numAttributes = context.glGetProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
      var attributes = {};
      for (var i = 0; i < numAttributes; i++)
      {
        var attrib = context.glGetActiveAttrib(program, i);
        attributes[attrib.name] = {
          length:attrib.length,
          size:attrib.size,
          type:attrib.type,
          type_str:Jax.Util.enumName(attrib.type),
          location: context.glGetAttribLocation(program, attrib.name)
        };
      }
      $super(context, program, attributes);
    },
    
    set: function(name, value) {
      var v, c = this.context, i, variables = this.variables;
      
      function _set(name, value) {
        if (value == undefined) return;
//        if (value == undefined) throw new Error("Value is undefined for shader attribute "+JSON.stringify(name));
        
        if (v = variables[name]) {
          value.bind(c);
          c.glEnableVertexAttribArray(v.location);
          c.glVertexAttribPointer(v.location, value.itemSize, GL_FLOAT, false, 0, 0);
//        } else {
//          console.warn("skipping assignment of attribute %s (variables: %s)", name, JSON.stringify(variables));
        }
      }
      
      if (arguments.length == 1 && typeof(arguments[0]) == "object")
        for (i in arguments[0])
          _set(i, arguments[0][i]);
      else
        for (i = 0; i < arguments.length; i += 2)
          _set(arguments[i], arguments[i+1]);
    },
    
    disableAll: function() {
      for (var v in this.variables) {
        v = this.variables[v];
        this.context.glDisableVertexAttribArray(v.location);
      }
    }
  });
})();

Jax.Shader.UniformDelegator = (function() {
  return Jax.Class.create(Jax.Shader.Delegator, {
    initialize: function($super, context, program) {
      var numUniforms = context.glGetProgramParameter(program, GL_ACTIVE_UNIFORMS);
      var uniforms = {};
      for (var i = 0; i < numUniforms; i++)
      {
        var unif = context.glGetActiveUniform(program, i);
        uniforms[unif.name] = {
          length:unif.length,
          size:unif.size,
          type:unif.type,
          type_str:Jax.Util.enumName(unif.type),
          location: context.glGetUniformLocation(program, unif.name)
        };
      }
      $super(context, program, uniforms);
    },
    
    set: function(name, value) {
      var self = this;
      var variables = this.variables, v, c = this.context, i;
      
      function _set(name, value) {
        if (value == undefined) throw new Error("Value is undefined for shader uniform "+JSON.stringify(name));
        
        if (v = variables[name]) {
          try {
            switch(v.type) {
              case GL_FLOAT:
                value.length != undefined ? c.glUniform1fv(v.location, value) : c.glUniform1f(v.location, value);
                break;
              case GL_BOOL: // same as int
              case GL_INT:
                value.length != undefined ? c.glUniform1iv(v.location, value) : c.glUniform1i(v.location, value);
                break;
              case GL_FLOAT_VEC2:   c.glUniform2fv(v.location, value); break;
              case GL_FLOAT_VEC3:   c.glUniform3fv(v.location, value); break;
              case GL_FLOAT_VEC4:   c.glUniform4fv(v.location, value); break;
              case GL_FLOAT_MAT2:   c.glUniformMatrix2fv(v.location, false, value); break;
              case GL_FLOAT_MAT3:   c.glUniformMatrix3fv(v.location, false, value); break;
              case GL_FLOAT_MAT4:   c.glUniformMatrix4fv(v.location, false, value); break;
              case GL_BOOL_VEC2:    // same as int
              case GL_INT_VEC2:     c.glUniform2iv(v.location, value); break;
              case GL_BOOL_VEC3:    // same as int
              case GL_INT_VEC3:     c.glUniform3iv(v.location, value); break;
              case GL_BOOL_VEC4:    // same as int
              case GL_INT_VEC4:     c.glUniform4iv(v.location, value); break;
              case GL_SAMPLER_2D:   c.glUniform1i(v.location, value); break;
              case GL_SAMPLER_CUBE: c.glUniform1i(v.location, value); break;
              default:
                throw new Error("Unexpected attribute type: "+v.type+" ("+JSON.stringify(v)+")");
            }
          } catch(e) {
            var error = new Error("Failed to set uniform for "+name+' ('+value+") in shader program:\n\n"+e);
            Jax.reraise(e, error);
          }
        }
      }
      
      if (arguments.length == 1 && typeof(arguments[0]) == "object")
        for (i in arguments[0])
          _set(i, arguments[0][i]);
      else
        for (i = 0; i < arguments.length; i += 2)
          _set(arguments[i], arguments[i+1]);
    }
  });
})();
/**
 * class Jax.Shader.Manifest
 *   
 * Used to track variable assignments. After all assignments have been made just prior to committing a render phase,
 * the manifest will be used to actually pass variable values into the shader. This keeps from specifying shader
 * values more than once. Manifest can also be used to cache values between render passes, because its values are
 * never reset.
 **/

Jax.Shader.Manifest = Jax.Class.create({
  initialize: function(existing) {
    this.values = {};
    this.texture_tracker = 0;
    this.variable_prefix = "";
    this.existing = existing || [];
  },
  
  set: function(name, value) {
    var i;
    if (value === undefined)
      if (typeof(name) == "object")
        for (i in name)
          this.set(i, name[i]);
      else throw new Error("Invalid argument (or the value given is undefined): "+
              JSON.stringify(name)+"\n\n"+new Error().stack);
    else
      for (i = 0; i < arguments.length; i += 2) {
        if (this.existing.indexOf(arguments[i]) != -1)
          this.values[arguments[i]] = arguments[i+1];
        else
          this.values[this.variable_prefix+arguments[i]] = arguments[i+1];
      }
  },
  
  getValue: function(name) {
    if (this.existing.indexOf(name) != -1)
      return this.values[name];
    else return this.values[this.variable_prefix+name];
  },
  
  texture: function(name, tex, context) {
    if (!context) throw new Error("Can't bind texture without a context");
    if (this.texture_tracker == GL_MAX_ACTIVE_TEXTURES-1) {
      /* FIXME add a callback for Materials to enter compatibility mode and recompile their shaders
         before throwing a hard error. Until this is implemented, the hard error itself is disabled
         because it causes unnecessary barfing on machines that are otherwise capable of running the
         scene. Using too many textures doesn't seem to have any catastrophic results on tested
         hardware, except some visual anomolies, so there's no reason to crash out catastrophically.
      */
//      throw new Error("Maximum number of textures ("+GL_MAX_ACTIVE_TEXTURES+") has been reached!");
    }
    
    if (typeof(this.getValue(name)) != "number")
      this.set(name, this.texture_tracker++);
    
    if (tex.loaded) {
      context.glActiveTexture(GL_TEXTURES[this.getValue(name)]);
      tex.bind(context, this.getValue(name));
    }
  },
  
  apply: function(uniforms, attributes) {
    attributes.disableAll();
    for (var name in this.values) {
      if (uniforms.doesExist(name))
        uniforms.set(name, this.values[name]);
      else if (attributes.doesExist(name))
        attributes.set(name, this.values[name]);
    }
  }
});

Jax.Shader.Program = (function() {
  function buildShaderSources(self, context, material) {
    for (var i = 0; i < self.shaders.length; i++) {
      self.shaders[i].build(context, material);
    }
  }
  
  function getShaderProgram(self, context) {
    if (self.programs[context.id]) return self.programs[context.id];
    return self.programs[context.id] = context.glCreateProgram();
  }
  
  function addToVariableList(self, delegator) {
    for (var name in delegator.variables) {
      self.variable_names.push(name);
    }
  }
  
  function updateVariableList(self, context) {
    while (self.variable_names.length > 0) self.variable_names.pop();
    addToVariableList(self, self.getAttributeDelegator(context));
    addToVariableList(self, self.getUniformDelegator(context));
  }
  
  function linkProgram(self, context, material, program) {
    /* really attach those shaders that we've pretended to have attached already */
    for (var i = 0; i < self.shaders.length; i++) {
      var shader = self.shaders[i];
      var vert = shader.getVertexShader(context),
          frag = shader.getFragmentShader(context);
      
      if (vert) {
        program.vertex = vert;
        program.vertex_shader = vert;
        context.glAttachShader(program, vert);
      }
      if (frag) {
        program.fragment = true;
        program.fragment_shader = frag;
        context.glAttachShader(program, frag);
      }
    }

    if (!program.vertex || !program.fragment)
      throw new Error("Attempted to link program missing either a vertex or fragment shader! " +
                      "(WebGL requires at least 1 of each.)");
    
    buildShaderSources(self, context, material);
    context.glLinkProgram(program);
    
    if (!context.glGetProgramParameter(program, GL_LINK_STATUS))
      throw new Error("Could not initialize shader!\n\n"+context.glGetProgramInfoLog(program));
    else program.linked = true;
    
    context.glUseProgram(program);

    self.attribute_delegator[context.id] = new Jax.Shader.AttributeDelegator(context, program);
    self.uniform_delegator[context.id] = new Jax.Shader.UniformDelegator(context, program);
  }
  
  return Jax.Class.create({
    initialize: function() {
      this.shaders = [];
      this.programs = {};
      this.attribute_delegator = {};
      this.uniform_delegator = {};
      this.variable_names = [];
      this.manifest = new Jax.Shader.Manifest(this.variable_names);
    },
    
    attach: function(shaderName, context) {
      if (!context) throw new Error("No context!");
      var shader = Jax.shaders[shaderName];
      if (!shader)
        throw new Error("Could not find shader named '"+shaderName+"'! " +
                        "Does it exist in Jax.shaders?");
      this.shaders.push(shader);
    },
    
    invalidate: function() {
      for (var i in this.programs)
        this.programs[i].linked = false;
    },
    
    link: function(context, material) {
      var program = this.getGLProgram(context);
      
      if (!program.linked)
        linkProgram(this, context, material, program);
      
      // update list of variable names
      updateVariableList(this, context);
      
      return program;
    },
    
    setShaderVariables: function(context, mesh, material, options) {
      material.setShaderVariables(context, mesh, options, this.manifest);
      this.manifest.apply(this.getUniformDelegator(context), this.getAttributeDelegator(context));
    },
    
    render: function(context, mesh, material, options) {
      var program = this.link(context, material);
      
      context.glUseProgram(program);
      
      this.setShaderVariables(context, mesh, material, options);
      
      try {
        var buffer;
        if ((buffer = mesh.getIndexBuffer()) && buffer.length > 0) {
          buffer.bind(context);
          context.glDrawElements(options.draw_mode, buffer.length, GL_UNSIGNED_SHORT, 0);
        }
        else if ((buffer = mesh.getVertexBuffer()) && buffer.length > 0) {
          context.glDrawArrays(options.draw_mode, 0, buffer.length);
        }
      } catch(e) {
        var error = new Error("Fatal error encountered while drawing mesh:\n\n"+e+"\n\nShaders: "+this.getShaderNames());
        Jax.reraise(e, error);
      }
    },
    
    getShaderNames: function() {
      var shaderNames = [];
      for (var i = 0; i < this.shaders.length; i++) shaderNames[i] = this.shaders[i].getName();
      return shaderNames;
    },
    
    getGLProgram: function(context) { return getShaderProgram(this, context); },
    getAttributeDelegator: function(context) { return this.attribute_delegator[context.id]; },
    getUniformDelegator: function(context) { return this.uniform_delegator[context.id]; }
  });
})();

Jax.ShaderChain = (function() {
  function sanitizeName(name) {
    return name.replace(/-/, '_');
  }
  
  function preprocessFunctions(self, prefix, suffix, source) {
    /* TODO mangle all function and structure names to prevent conflicts -- right now we only mangle main() */
    
    return source.replace(/void\s*main\s*\(/g, 'void '+sanitizeName(prefix)+'_main_'+sanitizeName(suffix)+'(');
  }
  
  function preprocessorOptions(self) {
    return {
      shader: self,
      ignore_es_precision: true,
      export_prefix: self.getName(),
      exports: self.gatherExports(),
      skip_export_definitions: true,
      skip_global_definitions: [] // array containing definitions so they aren't accidentally redefined
    };
  }
  
  function preventRedefinition(imap, options) {
    for (var j in imap)
      options.skip_global_definitions.push(imap[j].full_name);
  }
  
  return Jax.Class.create(Jax.Shader.Program, {
    initialize: function($super, name) {
      $super();
      this.name = name;
      this.shaders.push(this.getMasterShader());
      this.phases = [];
    },
    
    getMasterShader: function() {
      return this.master_shader = this.master_shader || new Jax.Shader({});
    },
    
    addShader: function(shader) {
      if (typeof(shader) == "string")
        if (Jax.shaders[shader])
          shader = Jax.shaders[shader];
        else throw new Error("Shader is not defined: "+shader);
      this.phases.push(shader);
      this.invalidate();
      return sanitizeName(shader.getName()+(this.phases.length - 1)+"_");
    },
    
    getShaderNames: function() {
      var result = [];
      for (var i = 0; i < this.phases.length; i++)
        result[i] = this.phases[i].getName();
      return result;
    },
    
    removeAllShaders: function() {
      while (this.phases.length > 0) this.phases.pop();
    },
    
    link: function($super, context, material) {
      var program = this.getGLProgram(context);
      
      if (!program.linked) {
        var master = this.getMasterShader();
        
        var numVaryings = this.countVaryings(material),
            numUniforms = this.countUniforms(material),
            numAttributes = this.countAttributes(material);
        
        if (numVaryings > Jax.Shader.max_varyings)
          throw new RangeError("Varyings ("+numVaryings+") exceed maximum number of varyings ("+Jax.Shader.max_varyings+") supported by GPU! Try using a shorter chain.");
        if (numUniforms > Jax.Shader.max_uniforms)
          throw new RangeError("Uniforms ("+numUniforms+") exceed maximum number of uniforms ("+Jax.Shader.max_uniforms+") supported by GPU! Try using a shorter chain.");
        if (numAttributes > Jax.Shader.max_attributes)
          throw new RangeError("Attributes ("+numAttributes+") exceed maximum number of attributes ("+Jax.Shader.max_attributes+") supported by GPU! Try using a shorter chain.");

        master.setVertexSource(this.getVertexSource(material));
        master.setFragmentSource(this.getFragmentSource(material));
        
        program = $super(context, material);
      }
      
      return program;
    },
    
    getFragmentSource: function(options) {
      options = Jax.Util.normalizeOptions(options, preprocessorOptions(this));
      
      var source = "";
      source += this.getExportDefinitions(options);

      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "\n/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'f', this.phases[i].getFragmentSource(options));
        source += "\n\n";

        preventRedefinition(this.phases[i].getInputMap(options), options);
      }
      
      return source + this.getFragmentMain(options);
    },
    
    getVertexSource: function(options) {
      options = Jax.Util.normalizeOptions(options, preprocessorOptions(this));
      
      var source = "";
      source += this.getExportDefinitions(options);

      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        source += "\n/**** Shader chain index "+i+": "+this.phases[i].getName()+" ****/\n";
        source += preprocessFunctions(this, this.phases[i].getName()+i, 'v', this.phases[i].getVertexSource(options));
        source += "\n\n";
        
        preventRedefinition(this.phases[i].getInputMap(options), options);
      }
      
      return source + this.getVertexMain(options);
    },
    
    getVertexMain: function(options) {
      var functionCalls = "";
      for (var i = 0; i < this.phases.length; i++) {
        var args = "";
        if (this.phases[i].getVertexArgumentCount() > 0)
          args = "gl_Position";  
        functionCalls += "  "+sanitizeName(this.phases[i].getName())+i+"_main_v("+args+");\n";
      }
      
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               functionCalls +
             "}\n";
    },
    
    getFragmentMain: function(options) {
      var functionCalls = "";
      var lastTookArguments = false;
      for (var i = 0; i < this.phases.length; i++) {
        var args = "";
        if (this.phases[i].getFragmentArgumentCount() > 0) {
          lastTookArguments = true;
          args = "ambient, diffuse, specular";
        } else lastTookArguments = false;
        functionCalls += "  "+sanitizeName(this.phases[i].getName())+i+"_main_f("+args+");\n";
      }
      
      var colors = "#ifdef PASS_TYPE\n"
                 + "  if (PASS_TYPE == "+Jax.Scene.ILLUMINATION_PASS+") gl_FragColor = ambient + diffuse + specular;\n"
                 + "  else gl_FragColor = ambient;\n"
                 + "#else\n"
                 + "  gl_FragColor = ambient + diffuse + specular;\n"
                 + "#endif\n";
                 
      return "/**** Shader chain generated #main ****/\n" +
             "void main(void) {\n" +
               "vec4 ambient = vec4(1.0,1.0,1.0,1.0), diffuse = vec4(1.0,1.0,1.0,1.0), specular = vec4(1.0,1.0,1.0,1.0);\n" +
               functionCalls +
               (lastTookArguments ? colors : "") +
             "}\n";
    },
    
    getExportDefinitions: function(options) {
      var source = "\n/** Exported shader chain variables **/\n";
      var skip = [];
      for (var i = 0; i < this.phases.length; i++) {
        source += this.phases[i].getExportDefinitions(options.export_prefix, skip);
        for (var j in this.phases[i].options.exports)
          skip.push(j);
      }
      return source;
    },
    
    getGlobalDefinitions: function(options, isVertex) {
      var source = "\n/** Shared uniforms, attributes and varyings **/\n";
      var map = this.getInputMap(options);
      for (var name in map) {
        if (map[name].scope == "attribute" && !isVertex) continue;
        source += map[name].scope+" "+map[name].type+" "+map[name].full_name+";\n";
      }
      return source;
    },
    
    getPerShaderInputMap: function(options) {
      options = Jax.Util.normalizeOptions(options, {local_prefix:""});
      var map = {};
      var tracking_map = {};
      var name;
      for (var i = 0; i < this.phases.length; i++) {
        name = this.phases[i].getName();
        var entry = (map[name] = map[name] || { uniforms: [], attributes: [], varyings: [] });

        options.local_prefix = this.phases[i].getName()+i;
        
        var _map = this.phases[i].getInputMap(options);
        for (name in _map) {
          var variable = _map[name];
          // ignore anything that's already been defined, as it's primarily required by a shader with
          // higher priority (implied that the fact that it came first in the list of phases)
          if (!tracking_map[variable.full_name]) {
            if (variable.scope == 'uniform')        entry.uniforms.push(variable);
            else if (variable.scope == 'attribute') entry.attributes.push(variable);
            else if (variable.scope == 'varying')   entry.varyings.push(variable);
            else throw new Error("unhandled variable scope: "+JSON.stringify(variable));

            tracking_map[variable.full_name] = 1;
          }
        }
      }
      return map;
    },
    
    getInputMap: function(options) {
      options = Jax.Util.normalizeOptions(options, {local_prefix:""});
      var map = {};
      for (var i = 0; i < this.phases.length; i++) {
        options.local_prefix = this.phases[i].getName()+i;
        var _map = this.phases[i].getInputMap(options);
        for (var name in _map) {
          var variable = _map[name];
          if (map[variable.full_name]) {
            if (map[name].type      != variable.type)
              throw new Error("Conflicting types for variable '"+name+"' ("+map[name].type+" and "+variable.type+")!");
            if (map[name].scope     != variable.scope)
              throw new Error("Conflicting scopes for variable '"+name+"' ("+map[name].scope+" and "+variable.scope+")!");
          }
          else map[variable.full_name] = variable;
        }
      }

      return map;
    },
    
    countVariables: function(scope, options) {
      var map = this.getInputMap(options);
      var count = 0;
      for (var i in map) {
        if (map[i].scope == scope) count++;
      }
      return count;
    },
    
    countVaryings: function(options) { return this.countVariables("varying", options); },
    
    countAttributes: function(options) { return this.countVariables("attribute", options); },
    
    countUniforms: function(options) { return this.countVariables("uniform", options); },
    
    gatherExports: function() {
      var result = {};
      for (var i = 0; i < this.phases.length; i++) {
        if (this.phases[i].options.exports) {
          Jax.Util.merge(this.phases[i].options.exports, result);
        }
      }
      return result;
    },
    
    getName: function() { return this.name; }
  });
})();

/**
 * class Jax.Material
 * 
 * Represents a single material, which has its own color, lighting and texture properties.
 * 
 * Example:
 * 
 *     var material = new Jax.Material({ shininess: 1,
 *                                       diffuse:  [0.8, 0.8, 0.8, 1.0],
 *                                       ambient:  [0.8, 0.8, 0.8, 1.0],
 *                                       specular: [1.0, 1.0, 1.0, 1.0],
 *                                       emissive: [0.0, 0.0, 0.0, 1.0]
 *                                     });
 *                                     
 * IMPORTANT: Note that shaders are no longer directly tied to a given Material. Instead, the shader
 * should be specified as a property (or render option) of the mesh to be rendered. In most cases,
 * however, the appropriate shader will be determined automatically by Jax.
 **/

Jax.Material = (function() {
  function updatePrevious(self) {
    self.previous = self.previous || {subshaders:[]};
    for (var i = 0; i < self.layers.length; i++)
      self.previous.subshaders[i] = self.layers[i].getName();
  }
  
  function instantiate_layer(options) {
    if (options.isKindOf && options.isKindOf(Jax.Material))
      return options;
    else {
      if (options.type) {
        var klass = Jax.Material[options.type];
        if (!klass) throw new Error("Could not find material layer type: "+options.type);
        delete options.type;
        return new klass(options);
      }
      else
        throw new Error("Could not create layer: property 'type' was missing!");
    }
  }
  
  return Jax.Class.create({
    initialize: function(options) {
      options = Jax.Util.normalizeOptions(options, {
        ambient: [1,1,1,1],
        diffuse: [1,1,1,1],
        specular:[1,1,1,1],
        emissive: [0, 0, 0, 1.0],
        shininess: 10,
        default_shader: Jax.default_shader
      });
      options.ambient = Jax.Util.colorize(options.ambient);
      options.diffuse = Jax.Util.colorize(options.diffuse);
      options.specular = Jax.Util.colorize(options.specular);
      options.emissive = Jax.Util.colorize(options.emissive);

      for (var i in options) { this[i] = options[i]; }
      this.option_properties = Jax.Util.properties(options);
      this.protected_properties = ['name', 'shader', 'default_shader', 'shaders', 'layers'];
      
      this.name = options.name || options.shader || options.default_shader;
      this.shaders = {};
      this.layers = [];

      var tex;
      if (options.texture) {
        tex = new Jax.Texture(options.texture);
        this.addTextureLayer(tex);
        delete options.texture;
      } else if (options.textures) {
        for (i = 0; i < options.textures.length; i++) {
          tex = new Jax.Texture(options.textures[i]);
          this.addTextureLayer(tex);
        }
        delete options.textures;
      }
      
      if (options.layers) {
        for (i = 0; i < options.layers.length; i++) {
          this.addLayer(instantiate_layer(options.layers[i]));
        }
      }
    },
    
    /**
     * Jax.Material#supportsLighting() -> Boolean
     *
     * Returns true if this material supports lighting effects.
     **/
    supportsLighting: function() {
      if (this.getName() == "lighting")
        return true;
      for (var i = 0; i < this.layers.length; i++)
        if (this.layers[i].getName() == "lighting")
          return true;
      return false;
    },
    
    getName: function() { return this.name; },
    
    addTextureLayer: function(tex) {
      var mat;
      switch(tex.options.type) {
        case Jax.NORMAL_MAP:
          mat = new Jax.Material.NormalMap(tex);
          break;
        default:
          mat = new Jax.Material.Texture(tex);
      }
      this.addLayer(mat);
    },
    
    addLayer: function(layer) {
      if (!layer.option_properties) layer = instantiate_layer(layer);
      this.layers.push(layer);

      for (var i = 0; i < layer.option_properties.length; i++) {
        var name = layer.option_properties[i];
        if (this.protected_properties.indexOf(name) == -1 && this[name] == undefined) {
          this[name] = layer[name];
        }
      }
    },

    /**
     * Jax.Material#buildShader(name) -> Jax.Shader
     * 
     * Forces a rebuild of the specified shader. If the shader doesn't exist, one will be instantiated.
     * Note that this doesn't result in an immediate recompile (as that would require a Jax.Context).
     * Instead, it schedules the rebuild for the next render pass, when the Jax.Context is readily
     * available.
     **/
    buildShader: function() {
      if (this.shaderChain)
        this.shaderChain.removeAllShaders();
      else
        this.shaderChain = new Jax.ShaderChain(this.getName());
      
      this.addShadersToChain(this.shaderChain);

      return this.shaderChain;
    },
    
    addShadersToChain: function(chain) {
      this.shader_variable_prefix = chain.addShader(this.getBaseShader());
      for (var i = 0; i < this.layers.length; i++)
        this.layers[i].addShadersToChain(chain);
    },
    
    getBaseShader: function() {
      return (this.shader || this.default_shader);
    },
    
    /**
     * Jax.Material#updateModifiedShaders() -> self
     * 
     * If this Material has been modified, all shaders attached to it will be rebuilt.
     **/
    updateModifiedShaders: function() {
      if (this.isChanged()) {
        this.buildShader();
        updatePrevious(this);
      }
      return this;
    },

    /**
     * Jax.Material#prepareShader(name) -> Jax.Shader
     * 
     * Prepares the specified shader for rendering. If this Material has been modified,
     * then all related shaders are updated. The specified shader is either built or returned,
     * depending on whether it has already been built.
     **/
    prepareShader: function() {
      var shader;
      
      if (this.shaderChain) shader = this.shaderChain;
      else shader = this.buildShader();
      
      this.updateModifiedShaders();
      return shader;
    },
    
    setUniforms: function(context, mesh, options, uniforms) {},
    setAttributes: function(context, mesh, options, attributes) { },
    
    setShaderVariables: function(context, mesh, options, manifest) {
      manifest.variable_prefix = this.shader_variable_prefix;

      manifest.set({
        mMatrix: context.getModelMatrix(),
        vnMatrix: mat3.transpose(mat4.toMat3(context.getViewMatrix())),
        ivMatrix:  context.getInverseViewMatrix(),
        vMatrix:   context.getViewMatrix(),
        mvMatrix:  context.getModelViewMatrix(),
        pMatrix:   context.getProjectionMatrix(),
        nMatrix:   context.getNormalMatrix(),
        
        PASS_TYPE: context.current_pass,
        
        materialAmbient: this.ambient,
        materialDiffuse: this.diffuse,
        materialSpecular: this.specular,
        materialShininess: this.shininess
      });
      manifest.set('VERTEX_POSITION',  mesh.getVertexBuffer() || null);
      manifest.set('VERTEX_COLOR',     mesh.getColorBuffer() || null);
      manifest.set('VERTEX_NORMAL',    mesh.getNormalBuffer() || null);
      manifest.set('VERTEX_TEXCOORDS', mesh.getTextureCoordsBuffer() || null);

      
      this.setUniforms(context, mesh, options, manifest);
      this.setAttributes(context, mesh, options, manifest);

      for (var i = 0; i < this.layers.length; i++) {
        manifest.variable_prefix = this.layers[i].shader_variable_prefix;
        this.layers[i].setUniforms(context, mesh, options, manifest);
        this.layers[i].setAttributes(context, mesh, options, manifest);
      }
    },
    
    /**
     * Jax.Material#render(context, mesh) -> undefined
     * Renders the specified object to the specified context, using this material.
     *
     * This action will build and compile the shader for the given context if necessary.
     **/
    render: function(context, mesh, options) {
      this.lights = context.world.lighting._lights;
      this.light_count = context.world.lighting._lights.length;
      
      try {
        var shader = this.prepareShader(context);
        
        shader.render(context, mesh, this, options);
      } catch(error) {
        if (error instanceof RangeError) {
          // we've hit hardware limits. Back off a layer. If we are down to no layers, raise a coherent error.
          if (this.layers.length > 0) {
            this.adaptShaderToHardwareLimits(shader, error);
            this.render(context, mesh, options);
          }
          else throw error;
        }
        else throw error;
      }
    },
    
    adaptShaderToHardwareLimits: function(shader, error) {
      function log(msg) {
        if (Jax.getGlobal().console)
          console.log(msg);
        else
          setTimeout(function() { throw new Error(msg); }, 1);
      }
            
      log("WARNING: Hardware limits reached for material '"+this.getName()+"'! (original message: "+error+")");
      
      /*
        choose which shader(s) to remove. We know off the bat that we can remove any shaders which would
        push us over the threshold on their own (e.g. not combined with any except 'basic'), so let's remove
        those first.
      */
      
      var map = shader.getPerShaderInputMap(this);
      
      var uniformsRemaining = Jax.Shader.max_uniforms - map[this.getBaseShader()].uniforms.length;
      var varyingsRemaining = Jax.Shader.max_varyings - map[this.getBaseShader()].varyings.length;
      var attributesRemaining = Jax.Shader.max_attributes - map[this.getBaseShader()].attributes.length;
      
      // we'll use these to determine if we *still* need to pop at the end.
      var totalUniformsInUse = 0, totalVaryingsInUse = 0, totalAttributesInUse = 0;
      
      for (var i = 0; i < this.layers.length; i++) {
        var entry = map[this.layers[i].getBaseShader()];

        if (entry.uniforms.length > uniformsRemaining || entry.varyings.length > varyingsRemaining ||
                entry.attributes.length > attributesRemaining)
        {
          log("WARNING: Removing shader '"+this.layers[i].getName()+"' due to hardware limitations!");
          this.layers.splice(i, 1);
          i = 0;
        } else {
          totalUniformsInUse += entry.uniforms.length;
          totalVaryingsInUse += entry.varyings.length;
          totalAttributesInUse += entry.attributes.length;
        }
      }
      
      if (totalUniformsInUse > uniformsRemaining || totalVaryingsInUse > varyingsRemaining ||
              totalAttributesInUse > attributesRemaining)
      {
        log("WARNING: Removing shader '"+this.layers[this.layers.length-1].getName()+"' due to hardware limitations!");
        this.layers.pop();
      }
    },
    
    /**
     * Jax.Material#isChanged() -> Boolean
     * Returns true if this material's properties have been changed since
     * the last time its internal shader was compiled.
     **/
    isChanged: function() {
      if (!this.previous) return true;

      if (this.previous.subshaders.length != this.layers.length) return true;
      
      for (var i = 0; i < this.layers.length; i++)
        if (this.previous.subshaders[i] != this.layers[i].getName())
          return true;

      return false;
    }
  });
})();

Jax.Material.instances = {};

/**
 * Jax.Material.find(name) -> Jax.Material
 * - name (String): the unique name of the material you're looking for
 * 
 * Returns the instance of Jax.Material matching the specified name, or throws
 * an error if the material can't be found.
 **/
Jax.Material.find = function(name) {
  var result;
  if (result = Jax.Material.instances[name])
    return result;
  throw new Error("Material {material:'"+name+"'} could not be found.");
};

/**
 * Jax.Material.create(name, options) -> Jax.Material
 * - name (String): the unique name of this material
 * - options (Object): a set of options to be passed to the material constructor
 * 
 * Creates a material and adds it to the material registry. This way,
 * the material can be later retrieved using:
 * 
 *     var matr = Jax.Material.find(name);
 *     
 * Note that unlike instances of Jax.Model, specifying a name for a material that
 * already exists will not raise an error. Instead, the previous material will be
 * replaced with a new material constructed using the new options. This allows you
 * to override Jax defaults like so:
 * 
 *     Jax.Material.create("default", {...});
 *     
 **/
Jax.Material.create = function(name, options) {
  options = Jax.Util.normalizeOptions(options, { name: name });
  
  var klass = Jax.Material;
  if (options.type) klass = klass[options.type];
  
  if (!klass) throw new Error("Material type '"+options.type+"' not found!");
  return Jax.Material.instances[name] = new klass(options);
};

/**
 * Jax.Material.all() -> Array
 * 
 * Returns an array containing the names of all Materials currently registered
 * with Jax. Note that this does not include one-off materials created directly,
 * for example, using "new Jax.Material()".
 **/
Jax.Material.all = function() {
  return Jax.Util.properties(Jax.Material.instances);
};

Jax.Material.addResources = function(resources) {
  for (var i in resources) {
    if (Jax.Material.instances[i]) throw new Error("Duplicate material resource ID: "+i);
    Jax.Material.create(i, resources[i]);
  }
};


/**
 * class Jax.Mesh
 * 
 * Example:
 * 
 *     var mesh = new Jax.Mesh({
 *       init: function(vertices, colors, textureCoords, normals, indices) {
 *          // all of the arguments are arrays. If you don't intend to use one,
 *          // simply don't populate it with data. For instance, if your mesh
 *          // does not use vertex indices, don't add any data to the indices
 *          // array.
 *          
 *          // Colors will default to white if they are not populated.
 *          
 *          // A simple, red, opaque quad:
 *          vertices.push(-1, -1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push(-1,  1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push( 1,  1, 0); colors.push(1, 0, 0, 1);
 *          vertices.push( 1, -1, 0); colors.push(1, 0, 0, 1);
 *       }
 *     });
 *     
 * You can also subclass Mesh directly:
 * 
 *     var Quad = Jax.Class.create(Jax.Mesh, {
 *       init: function(vertices, colors, textureCoords, normals, indices) {
 *          // ...
 *       }
 *     });
 **/

Jax.Mesh = (function() {
  
  var BUFFERS = {
    /**
     * Jax.Mesh#vertices -> Array
     *
     * A subgroup of Jax.Mesh#vertexData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 3 elements (an X, Y, Z value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     **/
    vertices:['vertexData',3],
    /**
     * Jax.Mesh#normals -> Array
     *
     * A subgroup of Jax.Mesh#normalData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 3 elements (an X, Y, Z value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getNormalBuffer().
     **/
    normals:['normalData',3],
    /**
     * Jax.Mesh#colors -> Array
     *
     * A subgroup of Jax.Mesh#colorData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 4 elements (an R, G, B, A value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getColorBuffer().
     **/
    colors:['colorData',4],
    /**
     * Jax.Mesh#textureCoords -> Array
     *
     * A subgroup of Jax.Mesh#textureCoordsData.
     * 
     * This is essentially an array of arrays, each inner array
     * containing 2 elements (a U, V value). This shares the same memory as the raw data it is
     * based on, so the memory footprint is negligible, though it does take some time to construct
     * the data group the first time it is called.
     *
     * You can modify the inner arrays of this object, but you should then call refresh() on
     * Jax.Mesh#getTextureCoordsBuffer().
     **/
    textureCoords:['textureCoordsData',2]
  };
                 
  return Jax.Class.create({
    initialize: function(options) {
      this.buffers = {};
      
      this.bounds = {
        left: 0, right: 0, front: 0, back: 0, top: 0, bottom: 0,
        width: 0, height: 0, depth: 0
      };
      
      this.triangles = [];

      var self = this;
      for (var i in BUFFERS) {
        Object.defineProperty(self, i, (function() {
          var j = "_"+i, k = BUFFERS[i];
          return {
            configurable: true,
            enumerable: true,
            get: function() {
              if (!self[j])                                   // if (!self._vertices)
                self[j] = self.validate()[k[0]].group(k[1]);  //   self._vertices = self.validate().vertexData.group(3);
              return self[j];                                 // return self._vertices;
            },
            // set: function(v) { }
          };
        })());
      }
      
      /**
       * Jax.Mesh#material -> String | Jax.Material
       * This property represents the material that will be used to render this mesh. If
       * it is a string, Jax will find the material with this name in the material registry
       * using:
       * 
       *     Jax.Material.find(...).
       *     
       * If not specified, Jax.Mesh#default_material will be used instead.
       **/

      /**
       * Jax.Mesh#default_material -> String | Jax.Material
       * This property represents the material that will be used to render this mesh if #material
       * isn't given a value and the render options don't override the material. If
       * it is a string, Jax will find the material with this name in the material registry
       * using:
       * 
       *     Jax.Material.find(...).
       *     
       * This property can also be specified as a render option in order to specify a default
       * for a particular pass.
       **/
      this.default_material = "default";

      for (var i in options)
        this[i] = options[i];

      if (this.draw_mode == undefined)
        this.draw_mode = GL_TRIANGLES;
    },
    
    /**
     * Jax.Mesh#getBounds() -> Object
     *
     * Returns a generic object containing the following properties describing
     * an axis-aligned bounding box (AABB):
     *
     * <table>
     *   <tr><th>left, right</th><td>X-axis coordinates of the left-most and right-most vertices</td></tr>
     *   <tr><th>top, bottom</th><td>Y-axis coordinates of the top-most and bottom-most vertices</td></tr>
     *   <tr><th>front, back<sup>1</sup></th><td>Z-axis coordinates of the closest and furthest vertices</td></tr>
     *   <tr><th>width, height, depth</th><td>non-negative dimensions of the cube</td></tr>
     * </table>
     *
     * <sup>1</sup> as with most units in WebGL, the front is the greatest value, while the back
     * is the lowest.
     *
     * If the mesh has not been built yet (e.g. +Jax.Mesh#isValid+ returns false), these properties will
     * all be zero, or they will be whatever their previous values were if the mesh has been invalidated.
     *
     * These properties will also all be zero if the mesh has been built but has no vertices.
     **/
    getBounds: function() { return this.bounds; },
    
    /**
     * Jax.Mesh#getTriangles() -> Array<Jax.Geometry.Triangle>
     *
     * Returns an array of +Jax.Geometry.Triangle+ built from the vertices in this mesh.
     * If the draw mode for the mesh is not one of +GL_TRIANGLES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN+,
     * then the array will be empty.
     *
     * Also, it is up to the +init+ method to make sure that the number of vertices produced
     * matches the selected draw mode. If, for instance, the draw mode is +GL_TRIANGLES+ but
     * the number of vertices is not divisible by 3, this method will simply return an incomplete
     * or empty triangle array rather than raise an error.
     **/
    getTriangles: function() {
      this.validate();
      if (this.triangles.length == 0 && this.vertices.length != 0) this.buildTriangles();
      return this.triangles;
    },
    
    /**
     * Jax.Mesh#setColor(red, green, blue, alpha) -> Jax.Mesh
     * Sets the color of this mesh. This will set the color at each vertex, regardless
     * of the original color of that vertex. The result will be that the entire mesh
     * takes on the specified color (not just a particular vertex).
     **/
    setColor: function(red, green, blue, alpha) {
      var colorBuffer = this.getColorBuffer();
      
      for (var i = 0; i < this.colors.length; i++) {
        if (arguments.length == 4) {
          this.colors[i].array[0] = red;
          this.colors[i].array[1] = green;
          this.colors[i].array[2] = blue;
          this.colors[i].array[3] = alpha;
        } else {
          for (var j = 0; j < 4; j++) {
            this.colors[i].array[j] = arguments[0][j];
          }
        }
      }

      colorBuffer.refresh();
      return this;
    },

    /**
     * Jax.Mesh#dispose() -> undefined
     * Frees the various WebGL buffers used by this mesh.
     **/
    dispose: function() {
      for (var i in this.buffers)
        this.buffers[i].dispose();
      this.built = false;
    },

    /**
     * Jax.Mesh#render(context[, options]) -> undefined
     * - context (Jax.Context): the Jax context to render this object to
     * - options (Object): a set of custom render options to override the defaults for this Mesh.
     * 
     * Options include:
     *   * *draw_mode* : a GL rendering enum, such as GL_TRIANGLES or GL_LINE_STRIP.
     *   * *material* : an instance of Jax.Material, or the name of a registered Jax material, to override
     *     the material associated with this mesh.
     **/
    render: function(context, options) {
      if (!this.isValid()) this.rebuild();
      options = this.getNormalizedRenderOptions(options);
      options.material.render(context, this, options);
    },
    
    getNormalizedRenderOptions: function(options) {
      var result = Jax.Util.normalizeOptions(options, {
        material: this.material,
        default_material: this.default_material,
        draw_mode: this.draw_mode == undefined ? GL_TRIANGLES : this.draw_mode
      });
    
      if (!result.material) result.material = result.default_material;

      result.material = Jax.Util.findMaterial(result.material);

      return result;
    },

    /**
     * Jax.Mesh#getVertexBuffer() -> Jax.DataBuffer
     **/
    getVertexBuffer: function() {
      this.validate();
      if (this.buffers.vertex_buffer.length == 0) return null;
      return this.buffers.vertex_buffer;
    },
    
    /**
     * Jax.Mesh#getColorBuffer() -> Jax.DataBuffer
     **/
    getColorBuffer:  function() {
      this.validate();
      if (this.buffers.color_buffer.length == 0) return null;
      return this.buffers.color_buffer;
    },
    
    /**
     * Jax.Mesh#getIndexBuffer() -> Jax.DataBuffer
     **/
    getIndexBuffer:  function() {
      this.validate();
      if (this.buffers.index_buffer.length == 0) return null;
      return this.buffers.index_buffer;
    },
    
    /**
     * Jax.Mesh#getNormalBuffer() -> Jax.DataBuffer
     **/
    getNormalBuffer: function() {
      this.validate();
      if (this.buffers.normal_buffer.length == 0 && this.buffers.vertex_buffer.length > 0)
        this.recalculateNormals();
      if (this.buffers.normal_buffer.length == 0) return null;
      return this.buffers.normal_buffer;
    },
    
    /**
     * Jax.Mesh#getTextureCoordsBuffer() -> Jax.DataBuffer
     **/
    getTextureCoordsBuffer: function() {
      this.validate();
      if (this.buffers.texture_coords.length == 0) return null;
      return this.buffers.texture_coords;
    },
    
    /**
     * Jax.Mesh#getTangentBuffer() -> Jax.DataBuffer
     * Returns tangent normals for each normal in this Mesh. Used for normal / bump mapping.
     **/
    getTangentBuffer: function() {
      if (!this.buffers.tangent_buffer) return this.rebuildTangentBuffer();
      if (this.buffers.tangent_buffer.length == 0) return null;
      return this.buffers.tangent_buffer;
    },

    /**
     * Jax.Mesh#rebuildTangentBuffer() -> Jax.NormalBuffer
     * Forces an immediate rebuild of the tangent buffer for this Mesh. Use this if you've changed
     * the vertex, normal or texture information to update the tangent vectors. If this step is
     * skipped, you'll notice strange artifacts when using bump mapping (because the tangents will
     * be pointing in the wrong direction).
     **/
    rebuildTangentBuffer: function() {
      return this.makeTangentBuffer();
    },
    
    /**
     * Jax.Mesh#validate() -> Jax.Mesh
     *
     * If this mesh is not valid (its #init method hasn't been called or needs to be called again),
     * the mesh will be rebuilt per +Jax.Mesh#rebuild+. This mesh is returned.
     **/
    validate: function() {
      if (!this.isValid()) this.rebuild();
      return this;
    },

    /**
     * Jax.Mesh#isValid() -> Boolean
     * 
     * Returns true if this mesh is valid. If the mesh is invalid, it will be rebuilt during the next call to
     * Jax.Mesh#render().
     **/
    isValid: function() { return !!this.built; },
    
    /**
     * Jax.Mesh#recalculateNormals() -> Jax.Mesh
     *
     * Recalculates all vertex normals based on the vertices themselves (and vertex indices, if present),
     * replacing all current values. This is a very expensive operation and should be avoided if at all
     * possible by populating the normals directly within this mesh's +init+ method.
     **/
    recalculateNormals: function() {
      this.calculateNormals();
    },

    /**
     * Jax.Mesh#rebuild() -> undefined
     * 
     * Forces Jax to rebuild this mesh immediately. This will dispose of any WebGL buffers
     * and reinitialize them with a new call to this mesh's data init method. Note that this
     * is a very expensive operation and is *usually not* what you want.
     * 
     * If, for instance, you want to update the mesh with new vertex positions (say, for animation)
     * then you'd be much better off doing something like this:
     * 
     *     var vbuf = mesh.getVertexBuffer();
     *     vbuf.js.clear();
     *     for (var i = 0; i < newVertexData.length; i++)
     *       vbuf.push(newVertexData[i]);
     *     vbuf.refresh();
     * 
     **/
    rebuild: function() {
      this.dispose();
      
      // we are about to recalculate vertices, that means triangles will (maybe) be inaccurate
      while (this.triangles.length > 0)
        this.triangles.pop();

      var vertices = [], colors = [], textureCoords = [], normals = [], indices = [];
      if (this.init)
        this.init(vertices, colors, textureCoords, normals, indices);
      
      this.built = true;
      
      // mesh builder didn't set colors...default to this.color || white.
      if (colors.length == 0 || this.color) {
        if (!this.color) this.color = [1,1,1,1];
        for (var i = 0; i < vertices.length / 3; i++) {
          for (var j = 0; j < 4; j++)
            colors[i*4+j] = this.color[j];
        }
      }

      if (this.dataRegion) {
        // we don'y simply call data.set(vertices) because the data count may
        // have changed. Remapping will reallocate memory as needed.
        this.dataRegion.remap(this.vertexData,        vertices);
        this.dataRegion.remap(this.colorData,         colors);
        this.dataRegion.remap(this.textureCoordsData, textureCoords);
        this.dataRegion.remap(this.normalData,        normals);
        this.dataRegion.remap(this.indices,           indices);
      } else {
        // it's faster to preallocate a known number of bytes than it is to
        // let the data region figure it out incrementally. We can be conservative here.
        // If the number is too low, dataRegion will adapt.
        this.dataRegion = new Jax.DataRegion(
          (vertices.length+colors.length+textureCoords.length+normals.length) * Float32Array.BYTES_PER_ELEMENT +
          indices.length * Uint16Array.BYTES_PER_ELEMENT
        );
        
        this.vertexData        = this.dataRegion.map(Float32Array, vertices);
        this.colorData         = this.dataRegion.map(Float32Array, colors);
        this.textureCoordsData = this.dataRegion.map(Float32Array, textureCoords);
        this.normalData        = this.dataRegion.map(Float32Array, normals);
        this.indices           = this.dataRegion.map(Uint16Array,  indices);
      }
      
      this._vertices = null;
      this._colors = null;
      this._textureCoords = null;
      this._normals = null;
      
      this.calculateBounds(vertices);

      this.buffers.vertex_buffer  = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.vertexData, 3);
      this.buffers.color_buffer   = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.colorData, 4);
      this.buffers.normal_buffer  = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.normalData, 3);
      this.buffers.texture_coords = new Jax.DataBuffer(GL_ARRAY_BUFFER, this.textureCoordsData, 2);
      this.buffers.index_buffer   = new Jax.DataBuffer(GL_ELEMENT_ARRAY_BUFFER, this.indices);

      if (this.after_initialize) this.after_initialize();
    }
  });
})();
// used by Jax.Mesh to build tangent-space buffer
// function makeTangentBuffer(self) {
Jax.Mesh.prototype.makeTangentBuffer = function() {
  var self = this;
  
  var normals = self.getNormalBuffer();
  var vertices = self.getVertexBuffer();
  var texcoords = self.getTextureCoordsBuffer();
  var indices = self.getIndexBuffer();
  if (!normals || !vertices || !texcoords) return null;

  var tangentBuffer = self.buffers.tangent_buffer;
  normals = normals.js;
  vertices = vertices.js;
  texcoords = texcoords.js;
  if (indices && indices.length > 0) indices = indices.js;
  else indices = null;
  
  var tangents = tangentBuffer ? tangentBuffer.js : [];
  var tan1 = [], tan2 = [], a;
  var v1 = vec3.create(), v2 = vec3.create(), v3 = vec3.create();
  var w1 = [], w2 = [], w3 = [];
  var vertcount;
  var x1, x2, y1, y2, z1, z2, s1, s2, t1, t2, r;
  var dif = [];
  var sdir = vec3.create(), tdir = vec3.create();
  
  function setv(v, a) { v[0] = vertices[a*3];  v[1] = vertices[a*3+1];  v[2] = vertices[a*3+2]; }
  function setw(w, a) { w[0] = texcoords[a*2]; w[1] = texcoords[a*2+1]; }
  function sett1(a) { tan1[a] = tan1[a] || vec3.create(); vec3.add(tan1[a], sdir, tan1[a]); }
  function sett2(a) { tan2[a] = tan2[a] || vec3.create(); vec3.add(tan2[a], tdir, tan2[a]); }
  function findTangentVector(a1, a2, a3) {
    if (indices) { a1 = indices[a1]; a2 = indices[a2]; a3 = indices[a3]; }
    
    setv(v1, a1); setv(v2, a2); setv(v3, a3);
    setw(w1, a1); setw(w2, a2); setw(w3, a3);
    x1 = v2[0] - v1[0]; x2 = v3[0] - v1[0];
    y1 = v2[1] - v1[1]; y2 = v3[1] - v1[1];
    z1 = v2[2] - v1[2]; z2 = v3[2] - v1[2];
    s1 = w2[0] - w1[0]; s2 = w3[0] - w1[0];
    t1 = w2[1] - w1[1]; t2 = w3[1] - w1[1];
    r = 1.0 / (s1 * t2 - s2 * t1);
    
    sdir[0] = (t2 * x1 - t1 * x2) * r; sdir[1] = (t2 * y1 - t1 * y2) * r; sdir[2] = (t2 * z1 - t1 * z2) * r;
    tdir[0] = (s1 * x2 - s2 * x1) * r; tdir[1] = (s1 * y2 - s2 * y1) * r; tdir[2] = (s1 * z2 - s2 * z1) * r;
    
    if (isNaN(sdir[0]) || isNaN(sdir[1]) || isNaN(sdir[2]) ||
        isNaN(tdir[0]) || isNaN(tdir[1]) || isNaN(tdir[2]) )
    {
      // this only seems to happen when dealing with degenerate triangles
      // ...which seems to be fairly common. So, let's see what happens if
      // we just set the offending vectors to zero.
      sdir[0] = sdir[1] = sdir[2] = tdir[0] = tdir[1] = tdir[2] = 0;
    }
    sett1(a1); sett1(a2); sett1(a3);
    sett2(a1); sett2(a2); sett2(a3);
  }
  
  vertcount = indices && indices.length > 0 ? indices.length : normals.length / 3;

  /* we need to pass the vertices into findTangentVector differently depending on draw mode */
  /* TODO refactor: merge this with mesh support */
  switch(self.draw_mode) {
    case GL_TRIANGLE_STRIP:
      for (a = 2; a < vertcount; a += 2) {
        findTangentVector(a-2, a-1, a);
        findTangentVector(a, a-1, a+1);
      }
      break;
    case GL_TRIANGLES:
      for (a = 0; a < vertcount; a += 3)
        findTangentVector(a, a+1, a+2);
      break;
    case GL_TRIANGLE_FAN:
      for (a = 2; a < vertcount; a++)
        findTangentVector(0, a-1, a);
      break;
    default:
      throw new Error("Cannot calculate tangent space for draw mode: "+Jax.Util.enumName(self.draw_mode));
  }

  var normal = vec3.create();

  // remove any tangents left over from earlier builds (this should be pretty rare)
  while (tangents.length > vertcount) tangents.pop();

  var b;
  for (b = 0; b < vertcount; b++) {
    
    if (indices) a = indices[b];
    else a = b;
    
    // Gram-Schmidt orthogonalize: (t - n * dot(n, t)).normalize()
    normal[0] = normals[a*3]; normal[1] = normals[a*3+1]; normal[2] = normals[a*3+2];
    vec3.scale(normal, vec3.dot(normal, tan1[a]), dif);
    vec3.subtract(tan1[a], dif, dif);
    vec3.normalize(dif);
        
    tangents[a*4] = dif[0];
    tangents[a*4+1] = dif[1];
    tangents[a*4+2] = dif[2];
    // calc handedness
    tangents[a*4+3] = (vec3.dot(vec3.cross(normal, tan1[a]), tan2[a])) < 0.0 ? -1.0 : 1.0;
  }
  
  if (tangentBuffer)
    self.buffers.tangent_buffer.refresh();
  else
    self.buffers.tangent_buffer = new Jax.NormalBuffer(tangents);
  return self.buffers.tangent_buffer;
}
;
// Support functions used by Jax.Mesh

Jax.Mesh.prototype.eachTriangle = function(callback) {
  var mesh = this;
  var vertcount, a;
  
  var indices = mesh.getIndexBuffer(), vertices = mesh.vertices;
  if (vertices.length == 0) return;
  
  if (indices) {
    if (indices.length == 0) return;
    indices = indices.getTypedArray();
    vertcount = indices.length;
  } else
    vertcount = vertices.length;
    
  function call(i1, i2, i3) {
    var v1, v2, v3, i = false;
    
    if (indices) {
      i = true;
      v1 = vertices[indices[i1]];
      v2 = vertices[indices[i2]];
      v3 = vertices[indices[i3]];
    } else {
      i = false;
      v1 = vertices[i1];
      v2 = vertices[i2];
      v3 = vertices[i3];
    }
      
    if (!v1 || !v2 || !v3) return;
    callback(v1.array, v2.array, v3.array);
  }
  
  switch(mesh.draw_mode) {
    case GL_TRIANGLE_STRIP:
      for (a = 2; a < vertcount; a += 2) {
        call(a-2, a-1, a);
        call(a, a-1, a+1);
      }
      break;
    case GL_TRIANGLES:
      for (a = 0; a < vertcount; a += 3)
        call(a, a+1, a+2);
      break;
    case GL_TRIANGLE_FAN:
      for (a = 2; a < vertcount; a++)
        call(0, a-1, a);
      break;
    default:
      return;
  }
};

Jax.Mesh.prototype.buildTriangles = function() {
  var mesh = this;
  mesh.triangles.clear();
  
  mesh.eachTriangle(function(v1, v2, v3) {
    var tri = new Jax.Geometry.Triangle();
    tri.assign(v1, v2, v3);
    mesh.triangles.push(tri);
  });
};

Jax.Mesh.calculateBounds = function(vertices) {
  var self = this;
  if (vertices.length == 0) {
    self.bounds.left = self.bounds.right = 0;
    self.bounds.top = self.bounds.bottom = 0;
    self.bounds.front = self.bounds.back = 0;
    self.bounds.width = self.bounds.height = self.bounds.depth = 0;
  } else {
    self.bounds.left = self.bounds.right = null;
    self.bounds.top = self.bounds.bottom = null;
    self.bounds.front = self.bounds.back = null;
    self.bounds.width = self.bounds.height = self.bounds.depth = null;
  }

  var i, v;
  
  for (i = 0; i < vertices.length; i++)
  {
    // x, i % 3 == 0
    v = vertices[i];
    if (self.bounds.left  == null || v < self.bounds.left)   self.bounds.left   = v;
    if (self.bounds.right == null || v > self.bounds.right)  self.bounds.right  = v;
    
    // y, i % 3 == 1
    v = vertices[++i];
    if (self.bounds.bottom== null || v < self.bounds.bottom) self.bounds.bottom = v;
    if (self.bounds.top   == null || v > self.bounds.top)    self.bounds.top    = v;
    
    // z, i % 3 == 2
    v = vertices[++i];
    if (self.bounds.front == null || v > self.bounds.front)  self.bounds.front  = v;
    if (self.bounds.back  == null || v < self.bounds.back)   self.bounds.back   = v;
  }
  
  self.bounds.width = self.bounds.right - self.bounds.left;
  self.bounds.height= self.bounds.top   - self.bounds.bottom;
  self.bounds.depth = self.bounds.front - self.bounds.back;
};
// (re)calculates vertex normals based on Jax.Mesh vertex data

Jax.Mesh.prototype.calculateNormals = function() {
  var mesh = this;
  var triangles = mesh.getTriangles();
  var normals = {}, i;
  
  // it's much slower to nest an iteration within an iteration; instead
  // we'll create properties in +normals+ and then enumerate the properties
  // later.
  for (i = 0; i < triangles.length; i++) {
    var tri = triangles[i];
    normals[tri.a] = normals[tri.a] || [];
    normals[tri.b] = normals[tri.b] || [];
    normals[tri.c] = normals[tri.c] || [];
    normals[tri.a].push(tri.getNormal());
    normals[tri.b].push(tri.getNormal());
    normals[tri.c].push(tri.getNormal());
  }
  
  var normal = vec3.create();
  mesh.dataRegion.remap(mesh.normalData, triangles.length * 9);
  for (i = 0; i < mesh.vertices.length; i++) {
    var v = mesh.vertices[i].array;
    if (normals[v]) {
      normal[0] = normal[1] = normal[2] = 0;
      for (var j = 0; j < normals[v].length; j++)
        vec3.add(normal, normals[v][j], normal);
      vec3.scale(normal, 1/normals[v].length);
      
      vec3.set(normal, mesh.normals[i].array);
    }
  }
  
  // finally, update or create the WebGL buffer
  mesh.buffers.normal_buffer.refresh();
}
;
/**
 * Jax.Events
 * 
 * Generic event listener functionality which is added to a number of Jax objects
 * by default.
 **/

Jax.Events = (function() {
  return {
    /**
     * mixin Jax.Events.Methods
     *
     * Methods which can be added to potential event emitters.
     **/
    Methods: {
      /**
       * Jax.Events.Methods#getEventListeners(type) -> Array
       * - type (String): the type of event to retrieve listeners for.
       *
       * Returns an array containing all event listeners associated with the specified
       * event type.
       **/
      getEventListeners: function(name) {
        this.event_listeners = this.event_listeners || {};
        return this.event_listeners[name] = this.event_listeners[name] || {length:0};
      },
      
      /**
       * Jax.Events.Methods#addEventListener(type, callback) -> Number
       * - type (String): the type of event to listen for.
       * - callback (Function): the callback function to receive the event
       *
       * Adds the specified callback to the list of event listeners to be called
       * when the given event type is fired.
       *
       * Returns the numeric array index of the listener to be added.
       **/
      addEventListener: function(name, callback) {
        var ary = this.getEventListeners(name);
        var index = ary.length++;
        ary[index] = callback;
        return index;
      },
      
      /**
       * Jax.Events.Methods#removeEventListener(type, index) -> Function | undefined
       * - type (String): the type of event to remove the listener from.
       * - index (Number): the numeric index of the callback to be removed.
       *
       * Removes the callback represented by the index (as returned by
       * Jax.Events.Methods#addEventListener) from the event listener of
       * the specified type. Other event types are unaffected, even if they
       * contain the exact same callback function.
       *
       * Returns the original callback function, or undefined if it was not found.
       **/
      removeEventListener: function(name, index) {
        if (!name || index == undefined) throw new Error("both event type and listener index are required");
        var ary = this.getEventListeners(name);
        var func = ary[index];
        if (ary[index]) delete ary[index];
        // ary.splice(index, 1);
        return func;
      },
      
      /**
       * Jax.Events.Methods#fireEvent(type[, event]) -> undefined
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
       * Note that the callback is fired using +call+, so the +this+ object
       * within a callback will represent the object that fired the event.
       *
       **/
      fireEvent: function(name, event_object) {
        var listeners = this.getEventListeners(name);
        if (event_object && event_object.type == undefined)
          event_object.type = name;
        for (var i in listeners)
          if (i == 'length') continue;
          else listeners[i].call(this, event_object);
      }
    }
  };
})();

/**
 * Jax.Scene
 *
 **/

Jax.Scene = {};

/* used by some shaders to determine what kind of shading is to be done.
 * This is stored in context.world.current_pass.
 */
Jax.Scene.ILLUMINATION_PASS = 1;
Jax.Scene.AMBIENT_PASS = 2;
Jax.Scene.SHADOWMAP_PASS = 3;

/**
 * Jax.Geometry
 * Namespace containing geometric classes and functions
 **/

Jax.Geometry = {
  DISJOINT: 0,
  COINCIDE: 1,
  INTERSECT: 2,
};
Jax.Geometry.Line = (function() {
  var Line = Jax.Class.create({
    /**
     * new Jax.Geometry.Line([a, b])
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
      vec3.set(a, this.a);
      vec3.set(b, this.b);
      
      vec3.subtract(b, a, this.normal);
      this.length = vec3.length(this.normal);
      vec3.normalize(this.normal);
      
      return this;
    },
    
    /**
     * Jax.Geometry.Line#intersectLineSegment(line[, dest]) -> Boolean
     * - line (Jax.Geometry.Line): the line to test for intersection
     * - dest (Jax.Geometry.Line): an optional receiving line
     *
     * Tests the two lines for intersection. If +dest+ is given, the overlap is stored
     * within it. (If the lines intersect at a single point, but do not overlap, then
     * only the A point in +dest+ will be set.) If +dest+ is
     * omitted, this information is ignored.
     *
     * If the lines do not interesct, Jax.Geometry.DISJOINT (which is equal to 0) is returned.
     * If they intersect in a single unique point, Jax.Geometry.INTERSECT is returned.
     * If they intersect in a sub-segment, Jax.Geometry.COINCIDE is returned.
     **/
    intersectLineSegment: function(line, dest) {
      var u = vec3.subtract(this.b, this.a, vec3.create());
      var v = vec3.subtract(line.b, line.a, vec3.create());
      var w = vec3.subtract(this.a, line.a, vec3.create());
      var D = (u[0] * v[1] - u[1] * v[0]);
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
          if (dest) vec3.set(line.a, dest.a);
          // vec3.set(line.a, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (du == 0) { // +this+ is a single point
          if (!line.contains(this.a)) // but is not in S2
            return Jax.Geometry.DISJOINT;
          if (dest) vec3.set(this.a, dest.a);
          // vec3.set(this.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        if (dv == 0) { // +line+ is a single point
          if (!this.contains(line.a)) // but is not in this line
            return Jax.Geometry.DISJOINT;
          if (dest) vec3.set(line.a, dest.a);
          // vec3.set(line.b, dest.b);
          return Jax.Geometry.INTERSECT;
        }
        // they are colinear segments - get overlap (or not)
        var t0, t1; // endpoints of +this+ in eqn for +line+
        var w2 = vec3.subtract(this.a, line.a, vec3.create());
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
            vec3.add(line.a, vec3.scale(v, t0, dest.a), dest.a);
            return Jax.Geometry.INTERSECT;
          }
        }
          
        // they overlap in a valid subsegment
        if (dest) {
          vec3.add(line.a, vec3.scale(v, t0, dest.a), dest);
          vec3.add(line.b, vec3.scale(v, t1, dest.b), dest);
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
        
      if (dest) vec3.add(this.a, vec3.scale(u, sI, dest), dest);
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
      return "[Plane normal:"+this.normal+"; D:"+this.d+"]";
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
      var ad = this.classify(t.a), bd = this.classify(t.b), cd = this.classify(t.c);
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
      var u = vec3.subtract(line.b, line.a, (bufs.lineseg_u = bufs.lineseg_u || vec3.create()));
      var w = vec3.subtract(line.a, this.point, (bufs.lineseg_w = bufs.lineseg_w || vec3.create()));
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
        vec3.add(line.a, vec3.scale(u, sI, point), point);
      
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
      vec3.cross(p1n, p2n, u);
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
        
        vec3.set(iP,    line[0]);
        vec3.add(iP, u, line[1]);
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
      this.normal = vec3.create([0,1,0]);
      
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
     * Jax.Geometry.Plane#classify(O) -> Number
     * - O (vec3): origin
     * 
     * equivalent to vec3.dot(this.normal, O) + this.d;
     **/
    classify: function(O) {
      if (O.array) return vec3.dot(this.normal, O.array) + this.d;
      else return vec3.dot(this.normal, O) + this.d;
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
        vec3.set(arguments[1], this.normal);
        this.d = -vec3.dot(arguments[1], arguments[0]);
      } else {
        var tmp1 = this.normal, tmp2 = vec3.create();
        var points = arguments;
        
        if (arguments.length != 3) points = arguments[0];
        if (typeof(points[0]) == 'object' && points[0].array) {
          vec3.subtract(points[1].array, points[0].array, tmp1);
          vec3.subtract(points[2].array, points[0].array, tmp2);
          vec3.normalize(vec3.cross(tmp1, tmp2, this.normal));
          this.d = -vec3.dot(this.normal, points[0].array);
        } else {
          vec3.subtract(points[1], points[0], tmp1);
          vec3.subtract(points[2], points[0], tmp2);
          vec3.normalize(vec3.cross(tmp1, tmp2, this.normal));
          this.d = -vec3.dot(this.normal, points[0]);
        }
      }
      
      vec3.scale(this.normal, this.d, this.point);
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
     * Jax.Geometry.Plane#distance(point) -> Number
     * - point (vec3): A 3D vector. Can be any type with values for indices [0..2] (e.g. an Array).
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
  
  Plane.prototype.distance = Plane.prototype.classify;
  
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
  var bufs = {};
  
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
      return this.assign(vec3.create(a), vec3.create(b), vec3.create(c));
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
    
      // (a+b+c) / 3
      vec3.add(a, b, this.center);
      vec3.add(c, this.center, this.center);
      vec3.scale(this.center, 1/3);
      
      // calculate triangle normal
      var tmp = bufs.tmp = bufs.tmp || vec3.create();
      vec3.subtract(b, a, this.normal);
      vec3.subtract(c, a, tmp);
      vec3.cross(this.normal, tmp, this.normal);
      vec3.normalize(this.normal);
      
      this.updateDescription();
      return this;
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
      return "Triangle: "+this.a+"; "+this.b+"; "+this.c;
    },
    
    /**
     * Jax.Geometry.Triangle#intersect(O, D, cp[, segmax]) -> Boolean
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
      vec3.set(D, cp);
      vec3.scale(cp, t, cp);
      vec3.add(O, cp, cp);

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
      vec3.scale(p.normal, dist, point);
      vec3.subtract(O, point, point);
      if (this.pointInTri(point)) {
        if (cp) vec3.set(point, cp);
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
        vec3.subtract(v[i+1], v[i], u);
        vec3.subtract(O, v[i], pa);
        var s = vec3.dot(u, pa) / vec3.dot(u, u);

        if (s < 0) vec3.set(v[i], tmp);
        else if (s > 1) vec3.set(v[i+1], tmp);
        else { vec3.scale(u, s, tmp); vec3.add(v[i], tmp, tmp); }
        if (cp) vec3.set(tmp, cp);

        vec3.subtract(O, tmp, tmp);
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
      var u = this._u = this._u || vec3.create();
      var v = this._v = this._v || vec3.create();
      u[0] = P[this._i1] - this.a[this._i1];
      u[1] = this.b[this._i1] - this.a[this._i1];
      u[2] = this.c[this._i1] - this.a[this._i1];
      v[0] = P[this._i2] - this.a[this._i2];
      v[1] = this.b[this._i2] - this.a[this._i2];
      v[2] = this.c[this._i2] - this.a[this._i2];

      var a, b;
      if (u[1] == 0) {
        b = u[0] / u[2];
        if (b >= 0 && b <= 1) a = (v[0] - b * v[2]) / v[1];
        else return false;
      } else {
        b = (v[0] * u[1] - u[0] * v[1]) / (v[2] * u[1] - u[2] * v[1]);
        if (b >= 0 && b <= 1) a = (u[0] - b * u[2]) / u[1];
        else return false;
      }
      return a >= 0 && (a+b) <= 1;
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
    vec3.subtract(V1, V0, E1);
    vec3.subtract(V2, V0, E2);
    vec3.cross(E1, E2, N1);
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
    vec3.subtract(U1, U0, E1);
    vec3.subtract(U2, U0, E2);
    vec3.cross(E1, E2, N2);
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
    vec3.cross(N1, N2, D);

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

/**
 * class Jax.Scene.Frustum
 * includes Jax.Events.Methods
 * 
 * A Frustum represents a camera's view; it encloses the entire visible area and can be used
 * to query whether any given point is visible.
 *
 * Frustums are best known for their use in frustum culling, which is the practice of testing to
 * see whether an object is on-screen or not. If it's not on-screen, then there is no reason to
 * draw it.
 *
 * Frustums can also be useful for AI programming. In Jax, all instances of Jax.Camera create and
 * maintain their own internal Jax.Scene.Frustum instance. Since nearly every object has, in turn,
 * its own Jax.Camera, almost every object can effectively "see" the objects surrounding it.
 *
 * To get a Frustum instance, see the Jax.Camera#getFrustum method. Here are some examples:
 *
 *     var playerFrustum = this.context.player.camera.getFrustum();
 *     var ogreFrustum = ogre.camera.getFrustum();
 *     // where 'ogre' is an instance of Jax.Model
 *
 **/

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

      //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
      var m = mat4.set(mm, mat4.create());
      
      mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
      mat4.multiply(pm, m, m);
      mat4.inverse(m, m);

      // Transformation of normalized coordinates between -1 and 1
      inf[0]=x;//*2.0-1.0;    /* x*2-1 translates x from 0..1 to -1..1 */
      inf[1]=y;//*2.0-1.0;
      inf[2]=z;//*2.0-1.0;
      inf[3]=1.0;
      
      //Objects coordinates
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
    /**
     * new Jax.Scene.Frustum(view, projection)
     * - view (mat4): the view matrix
     * - projection (mat4): the projection matrix
     *
     * A frustum is usually instantiated by Jax.Camera; however, if you are maintaining
     * your own view and projection matrices then it could be helpful to instantiate
     * the frustum directly. See also Jax.Frustum#update for keeping a frustum up-to-date.
     **/
    initialize: function(modelview, projection) {
      this.planes = {};
      for (var i = 0; i < 6; i++) this.planes[i] = new Jax.Geometry.Plane();
      this.setMatrices(modelview, projection);
    },
  
    /**
     * Jax.Scene.Frustum#update() -> Jax.Scene.Frustum
     *
     * A frustum must maintain the 6 planes making up its boundaries; if the view or
     * projection matrix is modified, then the frustum is no longer accurate and must
     * be updated. For improved performance, you should only call this method when the
     * corresponding matrices are actually changed (or even better, when the matrices
     * have been changed and the frustum is actually being used).
     *
     * After updating the frustum, this method will fire an 'updated' event.
     *
     * Instances of Jax.Camera maintain their own frustums; they will fire this
     * method automatically whenever doing so becomes necessary.
     **/
    update: function() {
      if (this.mv && this.p) {
        extractFrustum(this);
        this.fireEvent('updated');
      }
      return this;
    },
    
    /**
     * Jax.Scene.Frustum#setViewMatrix(view) -> Jax.Scene.Frustum
     * - view (mat4): a 4x4 matrix
     * 
     * Replaces this frustum's view matrix with the specified one and then
     * updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the view matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setViewMatrix: function(mv) { return this.setMatrices(mv, this.p); },

    /**
     * Jax.Scene.Frustum#setProjectionMatrix(proj) -> Jax.Scene.Frustum
     * - proj (mat4): a 4x4 matrix
     * 
     * Replaces this frustum's projection matrix with the specified one and then
     * updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the projection matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setProjectionMatrix: function(p) { return this.setMatrices(this.mv, p); },
  
    /**
     * Jax.Scene.Frustum#setMatrices(view, proj) -> Jax.Scene.Frustum
     * - view (mat4): the 4x4 view matrix
     * - proj (mat4): the 4x4 projection matrix
     *
     * Replaces both matrices in the frustum, and then updates the frustum.
     *
     * Note that the frustum adopts the given matrix reference; that is,
     * if you make further changes to the projection matrix, they will be reflected
     * by the frustum (though you still need to call Jax.Scene.Frustum#update).
     **/
    setMatrices: function(mv, p) {
      this.mv = mv;
      this.p  = p;
      this.update();
      return this;
    },
  
    /**
     * Jax.Scene.Frustum#point(p) -> Jax.Scene.Frustum.INSIDE | Jax.Scene.Frustum.OUTSIDE
     * - p (vec3): the 3D point to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified point lies within this frustum;
     * returns Jax.Scene.Frustum.OUTSIDE otherwise.
     **/
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
  
    /**
     * Jax.Scene.Frustum#sphere(center, radius) -> Jax.Scene.Frustum.INSIDE | Jax.Scene.Frustum.OUTSIDE | Jax.Scene.Frustum.INTERSECT
     * - center (vec3): the center of the sphere to be tested
     * - radius (Number): the radius of the sphere to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified sphere lies entirely within this frustum;
     * Jax.Scene.Frustum.INTERSECT if the sphere lies only partially within this frustum; or
     * Jax.Scene.Frustum.OUTSIDE if the sphere lies entirely beyond the boundaries of this frustum.
     **/
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
  
    
    /**
     * Jax.Scene.Frustum#cube(corners) -> Jax.Scene.Frustum.INSIDE | Jax.Scene.Frustum.OUTSIDE | Jax.Scene.Frustum.INTERSECT
     * Jax.Scene.Frustum#cube(center, width, height, depth) -> Jax.Scene.Frustum.INSIDE | Jax.Scene.Frustum.OUTSIDE | Jax.Scene.Frustum.INTERSECT
     * - corners (Array): an array of 3D points representing the corners of the cube to be tested
     * - center (vec3): a 3D point representing the center of the cube to be tested
     * - width (Number): the width of the cube to be tested
     * - height (Number): the height of the cube to be tested
     * - depth (Number): the depth of the cube to be tested
     * 
     * Returns Jax.Scene.Frustum.INSIDE if the specified cube lies entirely within this frustum;
     * Jax.Scene.Frustum.INTERSECT if the cube lies only partially within this frustum; or
     * Jax.Scene.Frustum.OUTSIDE if the cube lies entirely beyond the boundaries of this frustum.
     **/
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
  
    /**
     * Jax.Scene.Frustum#sphereVisible(center, radius) -> Boolean
     * - center (vec3): the center of the sphere to be tested
     * - radius (Number): the radius of the sphere to be tested
     *
     * Returns true if the sphere is entirely or partially within this frustum, false otherwise.
     **/
    sphereVisible: function(center, radius) { return this.sphere.apply(this, arguments) != OUTSIDE; },
    
    /**
     * Jax.Scene.Frustum#pointVisible(point) -> Boolean
     * - point (vec3): the 3D point to be tested
     *
     * Returns true if the point is within this frustum, false otherwise.
     **/
    pointVisible:  function(center)         { return this.point.apply(this, arguments)  != OUTSIDE; },

    /**
     * Jax.Scene.Frustum#cubeVisible(corners) -> Boolean
     * Jax.Scene.Frustum#cubeVisible(center, width, height, depth) -> Boolean
     * - corners (Array): an array of 3D points representing the corners of the cube to be tested
     * - center (vec3): a 3D point representing the center of the cube to be tested
     * - width (Number): the width of the cube to be tested
     * - height (Number): the height of the cube to be tested
     * - depth (Number): the depth of the cube to be tested
     * 
     * Returns true if the cube is entirely or partially within this frustum, false otherwise.
     **/
    cubeVisible:   function(corners)        { return this.cube.apply(this, arguments)   != OUTSIDE; },
  
    /**
     * Jax.Scene.Frustum#isValid() -> Boolean
     *
     * Returns true if the frustum has both a projection and a view matrix, false otherwise.
     **/
    isValid: function() { return this.p && this.mv; },
  
    /**
     * Jax.Scene.Frustum#getRenderable() -> Jax.Model
     *
     * Returns a renderable 3D object with a corresponding Jax.Mesh
     * representing this frustum and its orientation within the world. Very
     * useful for debugging or otherwise visualizing the frustum object.
     *
     * The 3D object hooks into this frustum's 'updated' event so that
     * whenever the frustum is updated, the renderable will be, too.
     **/
    getRenderable: function()
    {
      if (this.renderable) return this.renderable;
    
      var renderable = this.renderable = new Jax.Model({mesh: new Jax.Mesh()});
      renderable.upToDate = false;
      var frustum = this;
    
      function addVertices(e, vertices)
      {
        // near quad
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
      
        vertices.push(e.ntr[0], e.ntr[1], e.ntr[2]);
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
    
        vertices.push(e.nbr[0], e.nbr[1], e.nbr[2]);
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);

        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);

        // far quad
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
      
        vertices.push(e.ftr[0], e.ftr[1], e.ftr[2]);
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
    
        vertices.push(e.fbr[0], e.fbr[1], e.fbr[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);

        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);

        // left side
        vertices.push(e.ntl[0], e.ntl[1], e.ntl[2]);
        vertices.push(e.ftl[0], e.ftl[1], e.ftl[2]);
      
        vertices.push(e.nbl[0], e.nbl[1], e.nbl[2]);
        vertices.push(e.fbl[0], e.fbl[1], e.fbl[2]);
      
        // right side
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
    
      frustum.addEventListener('updated', function() {
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

  /**
   * Jax.Scene.Frustum.INSIDE = Jax.Geometry.Plane.FRONT
   *
   * Special value used to represent an object falling entirely within this frustum.
   **/
  klass.INSIDE = INSIDE;

  /**
   * Jax.Scene.Frustum.OUTSIDE = Jax.Geometry.Plane.BACK
   *
   * Special value used to represent an object falling entirely outside of this frustum.
   **/
  klass.OUTSIDE = OUTSIDE;

  /**
   * Jax.Scene.Frustum.INTERSECT = Jax.Geometry.Plane.INTERSECT
   *
   * Special value used to represent an object falling partially within this frustum, partially outside.
   **/
  klass.INTERSECT = INTERSECT;

  klass.addMethods(Jax.Events.Methods);

  return klass;
})();
Jax.POINT_LIGHT       = 1;
Jax.SPOT_LIGHT        = 2;
Jax.DIRECTIONAL_LIGHT = 3;

Jax.Scene.LightSource = (function() {
  function setupProjection(self) {
    if (self.camera.projection) return;
    
    switch(self.type) {
      case Jax.DIRECTIONAL_LIGHT:
        self.camera.ortho({left:-1,right:1, top:1,bottom:-1, near:-1,far:1 });
        self.camera.setPosition(0,0,0);
        break;
      case Jax.POINT_LIGHT:
        self.camera.perspective({fov:45,near:0.01,far:500,width:2048,height:2048});
        break;
      case Jax.SPOT_LIGHT:
        self.camera.perspective({near:0.1,far:500,fov:60,width:2048,height:2048});
        break;
      default:
        throw new Error("Unexpected light type: "+self.type);
    }
  }
  
  return Jax.Model.create({
    initialize: function($super, data) {
      data = Jax.Util.normalizeOptions(data, {
        enabled: true,
        type: Jax.POINT_LIGHT,
        color: {
          ambient: [0,0,0,1],
          diffuse: [1,1,1,1],
          specular: [1,1,1,1]
        },
        position: [0,0,0],
        direction: [0,0,-1],
        angle: Math.PI/6,
        attenuation: {
          constant: 0,
          linear: 0.02,
          quadratic: 0
        },
        spot_exponent: 0,
        shadowcaster: true
      });
      
      if (typeof(data.type) == "string") data.type = Jax[data.type] || data.type;
      data.color.ambient = Jax.Util.colorize(data.color.ambient);
      data.color.diffuse = Jax.Util.colorize(data.color.diffuse);
      data.color.specular= Jax.Util.colorize(data.color.specular);
      $super(data);
      
      var self = this;
      this.camera.addEventListener('updated', function() { self.invalidate(); });

      this.spotExponent = this.spot_exponent;
      delete this.spot_exponent;

      this.shadowMatrix = mat4.create();
      
      this.framebuffers = [new Jax.Framebuffer({width:1024,height:1024,depth:true,color:GL_RGBA}),
                           new Jax.Framebuffer({width:1024,height:1024,depth:true,color:GL_RGBA})];

      setupProjection(this);
    },
    
    format: function() {
      this._format = this._format || new glMatrixArrayType(Jax.Scene.LightSource.STRUCT_SIZE);
      var i, j, len = 0, self = this;
      function push() { for (j = 0; j < arguments.length; j++) self._format[len++] = arguments[j]; }
      for (i = 0; i < arguments.length; i++) {
        switch(arguments[i]) {
          case Jax.Scene.LightSource.POSITION:              push.apply(this, this.getPosition());      break;
          case Jax.Scene.LightSource.DIRECTION:             push.apply(this, this.getDirection());     break;
          case Jax.Scene.LightSource.AMBIENT:               push.apply(this, this.getAmbientColor());  break;
          case Jax.Scene.LightSource.DIFFUSE:               push.apply(this, this.getDiffuseColor());  break;
          case Jax.Scene.LightSource.SPECULAR:              push.apply(this, this.getSpecularColor()); break;
          case Jax.Scene.LightSource.CONSTANT_ATTENUATION:  push(this.getConstantAttenuation());       break;
          case Jax.Scene.LightSource.LINEAR_ATTENUATION:    push(this.getLinearAttenuation());         break;
          case Jax.Scene.LightSource.QUADRATIC_ATTENUATION: push(this.getQuadraticAttenuation());      break;
          case Jax.Scene.LightSource.SPOTLIGHT_EXPONENT:    push(this.getSpotExponent());              break;
          case Jax.Scene.LightSource.SPOTLIGHT_COS_CUTOFF:  push(this.getSpotCosCutoff());             break;
          default: throw new Error("Unexpected light source format descriptor: "+arguments[i]);
        }
      }
      return this._format;
    },
    
    getPosition: function() { setupProjection(this); return this.camera.getPosition(); },
    getDirection: function() { setupProjection(this); return this.camera.getViewVector(); },

    setEnabled: function(b) { this.enabled = b; },
    enable: function() { this.setEnabled(true); },
    disable: function() { this.setEnabled(false); },

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
      setupProjection(this);
      return this.framebuffers[0].getTexture(context, 0);
    },
    
    getShadowMapTextures: function(context) {
      setupProjection(this);
      return [this.framebuffers[0].getTexture(context, 0),
              this.framebuffers[1].getTexture(context, 0)];
    },
    
    isShadowMapEnabled: function() {
      return !!(this.framebuffers && this.isShadowcaster());
    },
    
    getShadowMatrix: function() {
      return this.shadowMatrix;
    },
    
    registerCaster: function(object) {
      var self = this;
      function updated() { self.invalidate(); }
      object.camera.addEventListener('updated', updated);
      this.invalidate();
    },
    
    unregisterCaster: function(object) {
      /* FIXME remove the shadowmap event listener from object's camera matrix */
    },
    
    isShadowcaster: function() { return this.shadowcaster; },
    
    getDPShadowNear: function() { setupProjection(this); return this.camera.projection.near; },
    
    getDPShadowFar: function() { setupProjection(this); return this.camera.projection.far; },
    
    invalidate: function() { this.valid = false; },
    
    render: function(context, objects, options) {
      if (!this.valid) {
        var real_pass = context.current_pass;
        /* shadowgen pass */
        context.current_pass = Jax.Scene.SHADOWMAP_PASS;
        // Look for errors while rendering the shadow map; if any occur, log them, but then
        // disable shadowmap generation so Jax can continue without shadow support.
        try {
          if (this.shadowcaster)
            this.updateShadowMap(context, this.boundingRadius, objects, options);
          this.valid = true;
        } catch(e) {
          if (window.console && window.console.log) window.console.log(e.toString());
          setTimeout(function() { throw e; }, 1);
          this.shadowcaster = false;
        }
        context.current_pass = real_pass;
      }
      
      for (var j = 0; j < objects.length; j++) {
        options.model_index = j;
        
        /* TODO optimization: see if objects[j] is even affected by this light (based on attenuation) */
        if (objects[j].isLit()) // it could be unlit but still in array if it casts a shadow
          objects[j].render(context, options);
      }
    },
    
    updateShadowMap: function(context, sceneBoundingRadius, objects, render_options) {
      // we can't afford to taint the original options
      render_options = Jax.Util.normalizeOptions(render_options, {});
      
      setupProjection(this);
      
      var self = this;
      var sm = this.shadowMatrix;
      var lightToSceneDistance = vec3.length(this.camera.getPosition());
      var nearPlane = lightToSceneDistance - sceneBoundingRadius;
      if (nearPlane < 0.01) nearPlane = 0.01;

      if (this.type == Jax.DIRECTIONAL_LIGHT) {
        this.camera.ortho({left:-sceneBoundingRadius,right:sceneBoundingRadius,
                           top:sceneBoundingRadius,bottom:-sceneBoundingRadius,
                           near:-sceneBoundingRadius,far:sceneBoundingRadius
        });
        this.camera.setPosition(0,0,0);
      } else if (this.type == Jax.SPOT_LIGHT) {
        // Save the depth precision for where it's useful
        var fieldOfView = Math.radToDeg(2.0 * Math.atan(sceneBoundingRadius / lightToSceneDistance));
      
//        fieldOfView = Math.radToDeg(this.getAngle());
        fieldOfView = 60;
        this.camera.perspective({near:nearPlane,far:nearPlane+(2.0*sceneBoundingRadius),fov:fieldOfView,width:2048,height:2048});
      } else if (this.type == Jax.POINT_LIGHT) {
        var paraboloid_depthmap = Jax.Material.find("paraboloid-depthmap");
        
        context.glDisable(GL_BLEND);
        context.glEnable(GL_CULL_FACE);
        context.glCullFace(GL_FRONT);
        context.glEnable(GL_POLYGON_OFFSET_FILL);
        context.glPolygonOffset(2.0, 2.0);
        
        context.pushMatrix(function() {
          render_options.direction = 1;
          render_options.material = paraboloid_depthmap;
          
          self.framebuffers[0].bind(context, function() {
            // front paraboloid
            self.framebuffers[0].viewport(context);
            context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            context.loadViewMatrix(self.camera.getTransformationMatrix());
            mat4.set(context.getInverseViewMatrix(), sm);
            
            for (var i = 0; i < objects.length; i++) {
              objects[i].render(context, render_options);
            }
          });

          render_options.direction = -1;
          
          self.framebuffers[1].bind(context, function() {
            // back paraboloid
            self.framebuffers[1].viewport(context);
            context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            context.loadViewMatrix(self.camera.getTransformationMatrix());
            for (var i = 0; i < objects.length; i++) {
              objects[i].render(context, render_options);
            }
          });
  
          context.glDisable(GL_POLYGON_OFFSET_FILL);
          context.glEnable(GL_BLEND);
          context.glCullFace(GL_BACK);
          context.glDisable(GL_CULL_FACE);

          // restore the original context viewport
          context.glViewport(0, 0, context.canvas.width, context.canvas.height);
        });

        return;
      }
      
      render_options.material = "depthmap";
      
      this.framebuffers[0].bind(context, function() {
        self.framebuffers[0].viewport(context);
        context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        context.pushMatrix(function() {
          self.framebuffers[0].viewport(context);
          context.matrix_stack.loadProjectionMatrix(self.camera.getProjectionMatrix());
          context.matrix_stack.loadViewMatrix(self.camera.getTransformationMatrix());
          mat4.identity(sm);
          sm[0] = sm[5] = sm[10] = sm[12] = sm[13] = sm[14] = 0.5;
          mat4.multiply(sm, context.getModelViewProjectionMatrix());
          
          context.glEnable(GL_CULL_FACE);
          context.glCullFace(GL_FRONT);
          context.glDisable(GL_BLEND);
          context.glEnable(GL_POLYGON_OFFSET_FILL);
          context.glPolygonOffset(2.0, 2.0);
          for (var i = 0; i < objects.length; i++) {
            objects[i].render(context, render_options);
          }
          context.glDisable(GL_POLYGON_OFFSET_FILL);
          context.glEnable(GL_BLEND);
          context.glCullFace(GL_BACK);
          context.glDisable(GL_CULL_FACE);
        });
        // restore the original context viewport
        context.glViewport(0, 0, context.canvas.width, context.canvas.height);
      });
    }
  });
})();

/*
  Constants used internally when constructing the flat-array format for a light source.
  This is so we don't need to make redundant glUniform() calls to specify the attributes of a single
  light source.
 */
Jax.Scene.LightSource.POSITION              =  1;
Jax.Scene.LightSource.DIRECTION             =  2;
Jax.Scene.LightSource.AMBIENT               =  3;
Jax.Scene.LightSource.DIFFUSE               =  4;
Jax.Scene.LightSource.SPECULAR              =  5;
Jax.Scene.LightSource.CONSTANT_ATTENUATION  =  6;
Jax.Scene.LightSource.LINEAR_ATTENUATION    =  7;
Jax.Scene.LightSource.QUADRATIC_ATTENUATION =  8;
Jax.Scene.LightSource.SPOTLIGHT_EXPONENT    =  9;
Jax.Scene.LightSource.SPOTLIGHT_COS_CUTOFF  = 10;

/* The size of the light source structure, in float elements */
Jax.Scene.LightSource.STRUCT_SIZE = 23;


Jax.Scene.LightManager = (function() {
  return Jax.Class.create({
    initialize: function(context) {
      this.context = context;
      this._lights = [];
      this.objects = [];
    },
    
    addObject: function(obj) {
      this.objects.push(obj);
      for (var j = 0; j < this._lights.length; j++)
        if (obj.isShadowCaster())
          this._lights[j].registerCaster(obj);
      this.recalculateBoundingRadius();
    },
    
    removeObject: function(obj) {
      if (this.objects[obj]) {
        var o = this.objects[obj];
        this.objects.splice(obj, 1);
        for (var j = 0; j < this._lights.length; j++)
          if (o.isShadowCaster())
            this._lights[j].unregisterCaster(o);
        this.recalculateBoundingRadius();
        return o;
      }
      for (var i = 0; i < this.objects.length; i++)
        if (this.objects[i] == obj)
          return this.removeObject(obj);
    },
    
    getShadowCasters: function() {
      var ret = [];
      for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].isShadowCaster())
          ret.push(this.objects[i]);
      }
      return ret;
    },
    
    add: function(light) {
      if (typeof(light) == "string") light = Jax.Scene.LightSource.find(light);
      
      if (this._lights.length == Jax.max_lights)
        throw new Error("Maximum number of light sources in a scene has been exceeded! Try removing some first.");
      for (var i = 0; i < this.objects.length; i++) {
        if (this.objects[i].isShadowCaster())
          light.registerCaster(this.objects[i]);
      }
      this._lights.push(light);
      light.boundingRadius = this.boundingRadius || 0;
    },
    
    recalculateBoundingRadius: function() {
      var boundingRadius = null;
      var i, j;
      for (i = 0; i < this.objects.length; i++) {
        j = vec3.length(this.objects[i].camera.getPosition()) + this.objects[i].getBoundingSphereRadius();
        if (boundingRadius == null || boundingRadius < j)
          boundingRadius = j;
      }
      this.boundingRadius = boundingRadius = boundingRadius || 0;
      
      for (i = 0; i < this._lights.length; i++)
        this._lights[i].boundingRadius = boundingRadius;
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
    
    illuminate: function(context, options) {
      // used by individual light sources
      options = Jax.Util.normalizeOptions(options, {});
      
      // Use alpha blending for the first pass, and additive blending for subsequent passes.
      context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      var i;
      for (i = 0; i < this._lights.length; i++) {
        if (i == 1) context.glBlendFunc(GL_ONE, GL_ONE);
        this._current_light = i;
        this._lights[i].render(context, this.objects, options);
      }
      
      if (i > 0) context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      
      delete this._current_light;
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

/**
 * class Jax.Camera
 * includes Jax.Events.Methods
 *
 * Every object in Jax has a Camera associated with it, and is usually referred to simply
 * as +camera+. Manipulating an object's camera is to manipulate the orientation of the
 * object itself within the world.
 *
 * You can add event listeners to Jax.Camera to monitor its matrices for changes. Whenever
 * a matrix changes, the object's orientation has been modified, so this is a good way to
 * keep track of changes to an object's orientation. Add listeners like so:
 *
 *     obj = new Jax.Model( ... );
 *     obj.camera.addEventListener('matrixUpdated', function() {
 *       // the object's orientation has changed
 *     });
 *
 * Note that no arguments are passed into the event listener in this case.
 *
 * See Jax.Events for more information about event listeners.
 *
 **/

Jax.Camera = (function() {
  var LOCAL_VIEW = [0,0,-1], LOCAL_UP = [0,1,0], LOCAL_RIGHT = [1,0,0];
  
  // used in tandem with _tmp[], see below
  var POSITION = 0, VIEW = 1, RIGHT = 2, UP = 3, FORWARD = 4, SIDE = 5;
  
  /*
    handles storing data in the private _vecbuf, which is used solely to prevent
    unnecessary allocation of temporary vectors. Note that _vecbuf is used for many
    operations and data persistence not guaranteed (read: improbable).
   */
  function store(self, buftype) {
    if (arguments.length == 2) {
      // no x,y,z given -- find it
      return storeVecBuf(self, buftype);
    }
    var buf = self._tmp[buftype];
    buf[0] = arguments[2];
    buf[1] = arguments[3];
    buf[2] = arguments[4];
    return buf;
  }
  
  function tmpRotQuat(self) {
    return self._rotquat = self._rotquat || quat4.create();
  }
  
  function storeVecBuf(self, buftype) {
    var world = self.rotation;
    
    var position = (self._tmp[POSITION]);
    var result   = (self._tmp[buftype]);
    
    vec3.set(self.position, position);

    switch(buftype) {
      case POSITION:
        // we already have the position
        return position;
        break;
      case VIEW:
        quat4.multiplyVec3(world, LOCAL_VIEW, result);
        break;
      case RIGHT:
        quat4.multiplyVec3(world, LOCAL_RIGHT, result);
        break;
      case UP:
        quat4.multiplyVec3(world, LOCAL_UP, result);
        break;
      default:
        throw new Error("Unexpected buftype: "+buftype);
    }
    return result;
  }
  
  function matrixUpdated(self) {
    // Callback fires whenever one of the camera's matrices has changed.
    // We need to use this to update other variables like normal matrix, frustum, etc,
    // but we don't actually update them here because the user may be making several
    // changes to the camera in sequence (and those updates would be useless).
    // Instead we'll mark them as out-of-date and let their respective getters do the
    // work.
    // update the normal matrix
    self.stale = true;
    self.frustum_up_to_date = false;
  }
  
  function calculateMatrices(self) {
    self.stale = false;

    var pos = storeVecBuf(self, POSITION);
    quat4.toMat4(self.rotation, self.matrices.mv);
    mat4.translate(self.matrices.mv, vec3.negate(pos), self.matrices.mv);
    mat4.inverse(self.matrices.mv);
    
    mat4.toInverseMat3(self.matrices.mv, self.matrices.n);
    mat3.transpose(self.matrices.n);
    
    self.fireEvent('matrixUpdated');
  }
  
  return Jax.Class.create({
    initialize: function() {
      /**
       * Jax.Camera#projection -> Object
       * This property is undefined until either #ortho() or #perspective() is called. After a projection matrix
       * has been initialized, this object will contain various metadata about the projection matrix, such as
       * the width and height of the viewport.
       * 
       * For orthogonal projection matrices, it contains the following information:
       *     width, height, depth
       *     left, right
       *     top, bottom
       *     near, far
       *     
       * For perspective projection matrices, it contains the following information:
       *     width, height
       *     near, far
       *     fov (in degrees)
       *     
       * Note that this information is here for reference only; modifying it will in no way modify the projection
       * matrix itself. (For that, you need to make another call to #ortho() or #perspective().) Therefore,
       * changing this object's properties is not recommended because doing so would no longer accurately reflect
       * the parameters of the real projection matrix.
       * 
       * Subsequent calls to #perspective() or #ortho() will cause this object to be regenerated. Because of this,
       * it is not recommended to store any persistent data in this object.
       **/
      
      /* used for temporary storage, just to avoid repeatedly allocating temporary vectors */
      this._tmp = [ vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create() ];
      
      this.rotation = quat4.create([0,0,0,1]);
      this.position = vec3.create([0,0,0]);
      
      this.matrices = { mv: mat4.identity(mat4.create()), p : mat4.identity(mat4.create()), n : mat3.create() };
      this.frustum = new Jax.Scene.Frustum(this.matrices.mv, this.matrices.p);
      
      this.addEventListener('updated', function() { matrixUpdated(this); });
      this.reset();
      this.setFixedYawAxis(true, vec3.UNIT_Y);
    },
    
    /**
     * Jax.Camera#setFixedYawAxis(useFixedYaw[, axis = vec3(0,1,0)]) -> Jax.Camera
     * - useFixedYaw (Boolean): set to true if you wish to fix the yaw axis, false otherwise
     * - axis (vec3): optional vec3 to use as the yaw axis.
     *
     * Due to the nature of 3D rotation, rotated objects are subject to a phenomenon known as
     * camera drift (also called Z drift or "roll" drift). This occurs when a series of
     * rotations cause the object's up vector to become rotated, affecting a "tilt" around
     * the object's local Z axis.
     *
     * Since this is not generally the expected outcome, Jax.Camera will by default set a
     * fixed yaw axis, which prevents drift. You can disable it or change the axis around
     * which yaw will be constrained by calling this function.
     **/
    setFixedYawAxis: function(useFixedYaw, axis) {
      this.fixed_yaw = useFixedYaw;
      if (axis) this.fixed_yaw_axis = vec3.create(axis);
    },

    /**
     * Jax.Camera#getFrustum() -> Jax.Scene.Frustum
     * Returns the frustum for the camera. If the frustum is out of date, it will
     * be refreshed.
     **/
    getFrustum: function() {
      if (!this.frustum_up_to_date) this.frustum.update();
      this.frustum_up_to_date = true;
      return this.frustum;
    },

    /**
     * Jax.Camera#getPosition() -> vec3
     * Returns the current world space position of this camera.
     **/
    getPosition:   function() { return vec3.create(this.position); },

    /**
     * Jax.Camera#getViewVector() -> vec3
     * Returns the view vector relative to this camera.
     **/
    getViewVector: function() { return vec3.create(storeVecBuf(this, VIEW)); },
    
    /**
     * Jax.Camera#getUpVector() -> vec3
     * Returns the up vector relative to this camera.
     **/
    getUpVector:   function() { return vec3.create(storeVecBuf(this, UP)); },
    
    /**
     * Jax.Camera#getRightVector() -> vec3
     * Returns the right vector relative to this camera.
     **/
    getRightVector:function() { return vec3.create(storeVecBuf(this, RIGHT)); },

    /**
     * Jax.Camera#ortho(options) -> undefined
     * - options (Object): the set of parameters used to calculate the projection matrix.
     * 
     * Sets up an orthographic projection matrix. Objects will not appear to shrink as they grow
     * more distant from the camera in this mode. This mode is frequently used by high-precision
     * tools such as modeling programs, and is commonly found in games when rendering UIs,
     * crosshairs and the like.
     * 
     * * _top_ - the topmost coordinate visible on the scren. Defaults to 1.
     * * _left_ - the leftmost coordinate visible on the screen. Defaults to -1.
     * * _right_ - the rightmost coordinate visible on the screen. Defaults to 1.
     * * _bottom_ - the bottommost coordinate visible on the screen. Defaults to -1.
     * * _near_ - the nearest coordinate visible. Defaults to 0.01.
     * * _far_ the furthest coordinate visible. Defaults to 200.
     *   
     **/
    ortho: function(options) {
      if (typeof(options.left)   == "undefined") options.left   = -1;
      if (typeof(options.right)  == "undefined") options.right  =  1;
      if (typeof(options.top)    == "undefined") options.top    =  1;
      if (typeof(options.bottom) == "undefined") options.bottom = -1;
      if (typeof(options.far)    == "undefined") options.far    = 200;
      options.near = options.near || 0.01;
      
      mat4.ortho(options.left, options.right, options.bottom, options.top, options.near, options.far, this.matrices.p);
      this.projection = {
        width: options.right - options.left,
        height: options.top - options.bottom,
        depth: options.near - options.far,
        left: options.left,
        right: options.right,
        near: options.near,
        far: options.far,
        top: options.top,
        bottom: options.bottom
      };
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#setPosition(positionVector) -> undefined
     * - positionVector (vec3): a vector representing the new position of the camera in world coordinates.
     * Jax.Camera#setPosition(x, y, z) -> undefined
     * - x (Number): the new X coordinate in world coordinates
     * - y (Number): the new Y coordinate in world coordinates
     * - z (Number): the new Z coordinate in world coordinates
     * 
     * Sets the position of this camera.
     **/
    setPosition: function() {
      switch(arguments.length) {
        case 1: vec3.set(arguments[0], this.position); break;
        case 3: vec3.set(arguments,    this.position); break;
        default: throw new Error("Invalid arguments for Camera#setPosition");
      }
      
      this.fireEvent('updated');

      return this;
    },

    /**
     * Jax.Camera#setDirection(vector) -> Jax.Camera
     * Jax.Camera#setDirection(x,y,z) -> Jax.Camera
     * - vector (vec3): the new direction that the camera will be pointing, relative to the camera
     * - x (Number): the X component of the direction to point in, relative to the camera
     * - y (Number): the Y component of the direction to point in, relative to the camera
     * - z (Number): the Z component of the direction to point in, relative to the camera
     *
     **/
    setDirection: function(vector) {
      var vec;
      if (arguments.length == 3) vec = arguments;
      else vec = vec3.create(vector);
      vec3.scale(vec, -1);
      vec3.normalize(vec);
      
      if (this.fixed_yaw) {
        var right = vec3.normalize(vec3.cross(this.fixed_yaw_axis, vec, vec3.create()));
        var up = vec3.normalize(vec3.cross(vec, right, vec3.create()));
        quat4.fromAxes(vec, right, up, this.rotation);
      } else {
        var rotquat = vec3.toQuatRotation(storeVecBuf(this, VIEW), vec, tmpRotQuat(this));
        quat4.multiply(rotquat, this.rotation, this.rotation);
      }
      
      quat4.normalize(this.rotation);
      this.fireEvent('updated');
      return this;
    },
    
    /**
     * Jax.Camera#rotate(amount, x, y, z) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - x (Number): X coordinate of the axis around which to rotate
     * - y (Number): Y coordinate of the axis around which to rotate
     * - z (Number): Z coordinate of the axis around which to rotate
     * Jax.Camera.rotate(amount, vector) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - vector (vec3): vector form of the axis around which to rotate
     * 
     * Rotates the camera by the specified amount around some axis. Note that this
     * axis is relative to the camera; see +Jax.Camera#rotateWorld+ if you need to
     * rotate around an axis in world space.
     **/
    rotate: function() {
      var amount = arguments[0];
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = this._tmp[0]; vec[0] = arguments[1]; vec[1] = arguments[2]; vec[2] = arguments[3];  break;
        default: throw new Error("Invalid arguments");
      }
      
      return this.rotateWorld(amount, quat4.multiplyVec3(this.rotation, vec, this._tmp[0]));
      
      // var axis = storeVecBuf(this, RIGHT);
      // this.rotateWorld(amount, axis);
      // 
      // var rotquat = quat4.fromAngleAxis(amount, vec, tmpRotQuat(this));
      // quat4.normalize(rotquat);
      // quat4.multiply(rotquat, this.rotation, this.rotation);
      // 
      // this.fireEvent('updated');
      // return this;
    },

    /**
     * Jax.Camera#rotateWorld(amount, x, y, z) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - x (Number): X coordinate of the axis around which to rotate
     * - y (Number): Y coordinate of the axis around which to rotate
     * - z (Number): Z coordinate of the axis around which to rotate
     * Jax.Camera.rotate(amount, vector) -> rotated camera
     * - amount (Number): amount to rotate, in radians
     * - vector (vec3): vector form of the axis around which to rotate
     * 
     * Rotates the camera by the specified amount around some axis. Note that this
     * axis is in world space; see +Jax.Camera#rotate+ if you need to
     * rotate around an axis relative to the camera's current orientation.
     **/
    rotateWorld: function() {
      var amount = arguments[0];
      var vec;
      switch(arguments.length) {
        case 2: vec = arguments[1]; break;
        case 4: vec = this._tmp[0]; vec[0] = arguments[1]; vec[1] = arguments[2]; vec[2] = arguments[3];  break;
        default: throw new Error("Invalid arguments");
      }
      
      var rotquat = quat4.fromAngleAxis(amount, vec, tmpRotQuat(this));
      quat4.normalize(rotquat);
      quat4.multiply(rotquat, this.rotation, this.rotation);
      
      this.fireEvent('updated');
      return this;
    },
    
    /**
     * Jax.Camera#pitch(amount) -> Jax.Camera
     * - amount (Number): rotation amount in radians
     *
     * Rotates around the camera's local X axis, resulting in a relative rotation up (positive) or down (negative).
     **/
    pitch: function(amount) {
      var axis = storeVecBuf(this, RIGHT);
      this.rotateWorld(amount, axis);
    },

    /**
     * Jax.Camera#yaw(amount) -> Jax.Camera
     * - amount (Number): rotation amount in radians
     *
     * Rotates around the camera's local Y axis, resulting in a relative rotation right (positive) or
     * left (negative).
     *
     * If this camera uses a fixed yaw axis (true by default), that world-space axis is used instead of the
     * camera's local Y axis.
     *
     * See also Jax.Camera#setFixedYawAxis
     **/
    yaw: function(amount) {
      var axis;
      if (this.fixed_yaw) axis = this.fixed_yaw_axis;
      else                axis = storeVecBuf(this, UP);
      this.rotateWorld(amount, axis);
    },

    /**
     * Jax.Camera#roll(amount) -> Jax.Camera
     * - amount (Number): rotation amount in radians
     *
     * Rotates around the camera's local Z axis, resulting in a relative tilting counter-clockwise (positive)
     * or clockwise (negative).
     **/
    roll: function(amount) {
      var axis = storeVecBuf(this, VIEW);
      this.rotateWorld(amount, axis);
    },

    /**
     * Jax.Camera#reorient(view[, position]) -> Jax.Camera
     * - view (vec3): the new direction, relative to the camera, that the camera will be pointing
     * - position (vec3): an optional new position for the camera, in world space.
     *
     * Reorients this camera to look in the given direction and optionally to be
     * repositioned according to the given position vector.
     *
     * Returns this camera after modification..
     **/
    reorient: function(view, pos) {
      if (pos) this.setPosition(pos);
      this.setDirection(view);
      return this;
    },
    
    /**
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
    orient: function(view, up) {
      var pos = null;
      
      if (Jax.environment != Jax.PRODUCTION)
        alert("Jax.Camera#orient is deprecated. Please use Jax.Camera#reorient instead.\n\n"+new Error().stack);
      
      switch(arguments.length) {
        case 1:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = null;
          break;
        case 2:
          view = store(this,     VIEW, view[0], view[1], view[2]);
          up   = store(this,       UP,   up[0],   up[1],   up[2]);
          break;
        case 3:
          if (typeof(arguments[0]) == "number") {
            view = store(this,     VIEW,    arguments[0],    arguments[1],    arguments[2]);
            up = null;
          } else {
            view = store(this,     VIEW,         view[0],         view[1],         view[2]);
            up   = store(this,       UP,           up[0],           up[1],           up[2]);
            pos  = store(this, POSITION, arguments[2][0], arguments[2][1], arguments[2][2]);
          }
          break;
        case 6:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          break;
        case 9:
          view = store(this,     VIEW, arguments[0], arguments[1], arguments[2]);
          up   = store(this,       UP, arguments[3], arguments[4], arguments[5]);
          pos  = store(this, POSITION, arguments[6], arguments[7], arguments[8]);
          break;
        default:
          throw new Error("Unexpected arguments for Camera#orient");
      }

      if (pos) this.setPosition(pos);
      this.setDirection(view);

      return this;
    },
    
    /**
     * Jax.Camera#lookAt(point[, pos]) -> Jax.Camera
     * - point (vec3): the point, in world space, to look at
     * - pos (vec3): an optional point to reposition this camera at, in world space,
     *               replacing its current position
     *
     **/
    lookAt: function(point, pos) {
      if (arguments.length > 2)
        alert("Jax.Camera#lookAt with more than 2 arguments is deprecated. Please use only two arguments: the point to look at (a vec3) and an optional point to reposition the camera to (a vec3).\n\n"+new Error().stack);
        
      if (pos) this.setPosition(pos);
      else pos = store(this, POSITION);
      
      var forward = this._tmp[FORWARD];
      this.setDirection(vec3.subtract(point, pos, forward));
    },

    /**
     * Jax.Camera#perspective(options) -> undefined
     * - options (Object): a generic object whose properties will be used to set up the
     *                     projection matrix.
     * 
     * Sets up a traditional perspective view for this camera. Objects will appear to be
     * smaller as they get further away from the camera.
     * 
     * Options include:
     *   * _width_ - the width of the camera, in pixels. Required.
     *   * _height_ - the height of the camera, in pixels. Required.
     *   * _fov_ - the angle of the field of view, in degrees. Default: 45
     *   * _near_ - the distance of the near plane from the camera's actual position. Objects
     *     closer to the camera than this will not be seen, even if they are technically in
     *     front of the camera itself. Default: 0.01
     *   * _far_ - the distance of the far plane from the camera's actual position. Objects
     *     further away from the camera than this won't be seen. Default: 200
     **/
    perspective: function(options) {
      options = options || {};
      if (!options.width) throw new Error("Expected a screen width in Jax.Camera#perspective");
      if (!options.height)throw new Error("Expected a screen height in Jax.Camera#perspective");
      options.fov  = options.fov  || 45;
      options.near = options.near || 0.01;
      options.far  = options.far  || 200;
      
      var aspect_ratio = options.width / options.height;
      mat4.perspective(options.fov, aspect_ratio, options.near, options.far, this.matrices.p);
      this.projection = {
        width: options.width, height: options.height,
        near: options.near,   far: options.far,
        fov: options.fov
      };
      this.fireEvent('matrixUpdated');
    },

    /**
     * Jax.Camera#getTransformationMatrix() -> mat4
     * 
     * Returns the transformation matrix. This matrix represents the camera's position and
     * orientation in the world.
     *
     * If the matrix is outdated due to changes to the camera,
     * it is automatically updated and then a 'matrixUpdated' event is fired.
     **/
    getTransformationMatrix: function() {
      if (this.stale) calculateMatrices(this);
      return this.matrices.mv;
    },

    /**
     * Jax.Camera#getProjectionMatrix() -> mat4
     * 
     * Returns the projection matrix. This matrix represents the projection of the world
     * onto a screen.
     **/
    getProjectionMatrix: function() { return this.matrices.p; },

    /**
     * Jax.Camera#getNormalMatrix() -> mat3
     * 
     * Returns the normal matrix, which is defined as the transpose of the inverse of the
     * transformation matrix.
     * 
     * This matrix is commonly used in lighting calculations.
     *
     * If the matrix is outdated due to changes to the camera,
     * it is automatically updated and then a 'matrixUpdated' event is fired.
     **/
    getNormalMatrix: function() {
      if (this.stale) calculateMatrices(this);
      return this.matrices.n;
    },

    /**
     * Jax.Camera#unproject(x, y[, z]) -> [[nearx, neary, nearz], [farx, fary, farz]]
     * - x (Number): X coordinate in pixels
     * - y (Number): Y coordinate in pixels
     * 
     * Calculates a line segment in world space of the given pixel location. One end of the
     * line segment represents the nearest world space point to which the pixel corresponds,
     * while the other end of the line segment represents the farthest visible point, depending
     * on the near and far planes of the projection matrix.
     * 
     * You can also find a point at an arbitrary distance by passing a third argument representing
     * the distance, Z, to travel from the near plane towards the far plane. Z should be a number
     * between 0 and 1 (so think of it as a percentage). In this form, only one set of coordinates
     * is returned: the actual world space position of the specified coordinate.
     * 
     * This function was adapted from gluUnproject(), found at
     * http://www.opengl.org/wiki/GluProject_and_gluUnProject_code
     **/
    unproject: function(winx, winy, winz) {
      // winz is either 0 (near plane), 1 (far plane) or somewhere in between.
      // if it's not given a value we'll produce coords for both.
      if (typeof(winz) == "number") {
        winx = parseFloat(winx);
        winy = parseFloat(winy);
        winz = parseFloat(winz);
      
        var inf = [];
        var mm = this.getTransformationMatrix(), pm = this.matrices.p;
        var viewport = [0, 0, pm.width, pm.height];
    
        //Calculation for inverting a matrix, compute projection x modelview; then compute the inverse
        var m = mat4.set(mm, mat4.create());
        
        mat4.inverse(m, m); // WHY do I have to do this? --see Jax.Context#reloadMatrices
        mat4.multiply(pm, m, m);
        mat4.inverse(m, m);
    
        // Transformation of normalized coordinates between -1 and 1
        inf[0]=(winx-viewport[0])/viewport[2]*2.0-1.0;
        inf[1]=(winy-viewport[1])/viewport[3]*2.0-1.0;
        inf[2]=2.0*winz-1.0;
        inf[3]=1.0;
    
        //Objects coordinates
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

    /**
     * Jax.Camera#strafe(distance) -> the translated camera
     * - distance (Number): the distance to move. If positive, the camera will move "right";
     *                      if negative, the camera will move "left".
     * 
     * Causes the camera to strafe, or move "sideways" along the right vector.
     **/
    strafe: function(distance) {
      this.move(distance, storeVecBuf(this, RIGHT));
      return this;
    },

    /**
     * Jax.Camera#move(distance[, direction]) -> the translated camera
     * - distance (Number): the distance to move. If positive, the camera will move "forward"
     *                      along the direction vector; if negative, it will move "backward".
     * - direction (vec3): the vector to move along. If not specified, this will default to
     *                     the camera's view vector. That is, it will default to the direction
     *                     the camera is pointing.
     *
     **/
    move: function(distance, direction) {
      if (!direction) direction = storeVecBuf(this, VIEW);
      vec3.add(vec3.scale(direction, distance, this._tmp[FORWARD]), this.position, this.position);
      this.fireEvent('updated');
      return this;
    },
    
    /**
     * Jax.Camera#projectMovement(forward[, strafe, dest]) -> vec3
     * - forward (Number): the amount of forward movement. Use a negative number for going
     *                     backwards.
     * - strafe (Number): the amount of horizontal movement. Use a negative number for going
     *                    left.
     * - dest (vec3): an optional receiving vec3 to store the projected result. If omitted, a
     *                new vec3 will be created.
     *
     * Projects the given movement amounts along this camera's view and right vectors, returning
     * the result without actually modifying this Camera.
     **/
    projectMovement: function(forward, strafe, dest) {
      if (!strafe) strafe = 0;
      if (!dest) dest = vec3.create();
      
      var view = vec3.scale(storeVecBuf(this, VIEW), forward);
      var right = vec3.scale(storeVecBuf(this, RIGHT), strafe);
      vec3.set(this.position, dest);
      vec3.add(view, dest, dest);
      vec3.add(right, dest, dest);
      
      return dest;
    },

    /**
     * Jax.Camera#reset() -> the reset camera
     *
     * Resets this camera by moving it back to the origin and pointing it along the negative
     * Z axis with the up vector along the positive Y axis.
     **/
    reset: function() {
      this.position[0] = this.position[1] = this.position[2] = 0;
      this.rotation[0] = this.rotation[1] = this.rotation[2] = 0;
      this.rotation[3] = 1;
      this.fireEvent('updated');
    }
  });
})();

/** alias of: Jax.Camera#setDirection
 * Jax.Camera#setViewVector(vector) -> Jax.Camera
 **/
Jax.Camera.prototype.setViewVector = Jax.Camera.prototype.setDirection;

Jax.Camera.addMethods(Jax.Events.Methods);

/**
 * class Jax.World
 * 
 * A +Jax.World+ represents a scene in the graphics engine. All objects to be rendered (or at least,
 * all objects that you do not want to manually control!) should be added to the world. Each instance
 * of +Jax.Context+ has its own +Jax.World+, and the currently-active +Jax.World+ is delegated into
 * controllers and views as the +this.world+ property.
 *
 **/

Jax.World = (function() {
  function getPickBuffer(self) {
    if (self.pickBuffer) return self.pickBuffer;
    return self.pickBuffer = new Jax.Framebuffer({
      width:self.context.canvas.width,
      height:self.context.canvas.height
    });
  }
  
  return Jax.Class.create({
    initialize: function(context) {
      this.context  = context;
      this.lighting = new Jax.Scene.LightManager(context);
      this.objects  = [];
    },
    
    /**
     * Jax.World#addLightSource(light) -> Jax.Scene.LightSource
     * - light (Jax.Scene.LightSource): the instance of Jax.Scene.LightSource to add to this world.
     *
     * Adds the light to the world and then returns the light itself unchanged.
     **/
    addLightSource: function(light)   { this.lighting.add(light); },
    
    /**
     * Jax.World#addObject(object) -> Jax.Model
     * - object (Jax.Model): the instance of Jax.Model to add to this world.
     *
     * Adds the model to the world and then returns the model itself unchanged.
     *
     **/
    addObject: function(object) {
      this.objects.push(object);
      if (object.isLit() || object.isShadowCaster())
        this.lighting.addObject(object);
      return object;
    },
    
    /**
     * Jax.World#getObject(index) -> Jax.Model
     * - index (Number): the world index of this object
     *
     * Returns the object with the specified world index, or undefined.
     **/
    getObject: function(index) { return this.objects[index]; },
    
    /**
     * Jax.World#removeObject(object_or_index) -> Jax.Model
     * - object_or_index (Number|Jax.Model): the model instance to remove, or its world index
     *
     * If the model or its index cannot be found, nothing happens and the return value is undefined.
     * Otherwise, the object is removed from this World and then returned.
     **/
    removeObject: function(object_or_index) {
      if (this.objects[object_or_index]) {
        var obj = this.objects[object_or_index];
        this.objects.splice(object_or_index, 1);
        this.lighting.removeObject(obj);
        return obj;
      }
      else
        for (var i = 0; i < this.objects.length; i++)
          if (this.objects[i] == object_or_index)
          {
            this.objects.splice(i, 1);
            this.lighting.removeObject(this.objects[i]);
            return this.objects[i];
          }
    },
    
    /**
     * Jax.World#pickRegionalIndices(x1, y1, x2, y2[, ary]) -> Array
     * - x1 (Number): the screen X coordinate of the first corner of the 2D rectangle within which to pick
     * - y1 (Number): the screen Y coordinate of the first corner of the 2D rectangle within which to pick
     * - x2 (Number): the screen X coordinate of the second corner of the 2D rectangle within which to pick
     * - y2 (Number): the screen Y coordinate of the second corner of the 2D rectangle within which to pick
     * - ary (Array): an optional array to populate. A new one will be created if this is not specified.
     *                (Note: the array's contents will be cleared.)
     * 
     * Picks all visible object indices within the specified rectangular regions and returns them as elements in
     * an array.
     *
     * An object's index matches its position in the world's object list. That is, the following code is
     * valid:
     *
     *     this.world.getObjects(this.world.pickRegionalIDs(0,0, 100,100));
     *
     **/
    pickRegionalIndices: function(x1, y1, x2, y2, ary) {
      var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
      if (ary) ary.clear();
      else ary = new Array();
      var world = this, pickBuffer = getPickBuffer(this), context = this.context;
      var data = new Uint8Array(w*h*4);

      pickBuffer.bind(context, function() {
        pickBuffer.viewport(context);
         context.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
         context.glDisable(GL_BLEND);
         world.render({material:"picking"});
         // read it back in
         context.glReadPixels(x1, y1, w, h, GL_RGBA, GL_UNSIGNED_BYTE, data);
         if (data.data) data = data.data;
      });
      
      // restore the visible viewport and blending
      context.glViewport(0, 0, context.canvas.width, context.canvas.height);
      context.glEnable(GL_BLEND);
      
      var index;
      for (var i = 2; i < data.length; i += 4) {
        if (data[i] > 0) { // blue key exists, we've found an object
          index = Jax.Util.decodePickingColor(data[i-2], data[i-1], data[i], data[i+1]);
          if (index != undefined) {
            ary.push(index);
          }
        }
      }
      
      return ary;
    },
    
    /**
     * Jax.World#pickRegion(x1, y1, x2, y2) -> Array
     * - x1 (Number): the screen X coordinate of the first corner of the 2D rectangle within which to pick
     * - y1 (Number): the screen Y coordinate of the first corner of the 2D rectangle within which to pick
     * - x2 (Number): the screen X coordinate of the second corner of the 2D rectangle within which to pick
     * - y2 (Number): the screen Y coordinate of the second corner of the 2D rectangle within which to pick
     * - ary (Array): an optional array to populate. A new one will be created if this is not specified.
     *                (Note: the array's contents will be cleared.)
     *
     * Picks all visible objects within the specified rectangular regions and returns them as elements in
     * an array.
     **/
    pickRegion: function(x1, y1, x2, y2, ary) {
      var result = this.pickRegionalIndices(x1, y1, x2, y2);
      for (var i = 0; i < result.length; i++)
        result[i] = this.getObject(i);
      return result;
    },
    
    /**
     * Jax.World#pickIndex(x, y) -> Number | undefined
     * - x (Number): the screen X coordinate to pick at
     * - y (Number): the screen Y coordinate to pick at
     *
     * Picks the visible object at the specified position and returns its index as used by
     * +Jax.World#getObject+. If no object is visible at the given position, the special value
     * +undefined+ is returned.
     **/
    pickIndex: function(x, y) {
      this._pick_ary = this._pick_ary || new Array();
      return this.pickRegionalIndices(x, y, x+1, y+1, this._pick_ary)[0];
    },
    
    /**
     * Jax.World#pick(x, y) -> Jax.Model | undefined
     * - x (Number): the screen X coordinate to pick at
     * - y (Number): the screen Y coordinate to pick at
     *
     * Picks the visible object at the specified position and returns it. If no object is visible
     * at the given position, the special value +undefined+ is returned.
     **/
    pick: function(x, y) {
      var index = this.pickIndex(x, y);
      if (index != undefined)
        return this.getObject(index);
      return index;
    },
    
    /**
     * Jax.World#countObjects() -> Number
     * Returns the number of objects currently registered with this World.
     **/
    countObjects: function() {
      return this.objects.length;
    },
    
    /**
     * Jax.World#getShadowCasters() -> Array
     *
     * Returns an array of all known shadow-casters in this World.
     **/
    getShadowCasters: function() { return this.lighting.getShadowCasters(); },
    
    /**
     * Jax.World#render([options]) -> Jax.World
     *
     * Renders this World to its Jax context. Options, if specified, are delegated
     * to the individual models to be rendered.
     *
     * Prior to rendering, this function assigns the blend function to
     * (+GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA+).
     *
     * This function determines whether light sources are to have an effect on the
     * render pass. If so, the world's +Jax.LightManager+ instance is invoked to
     * render the objects; otherwise, the objects are rendered directly with the
     * +unlit+ option set to +true+.
     **/
    render: function(options) {
      var i;
      
      /* this.current_pass is used by the material */

      this.context.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
      var unlit = Jax.Util.normalizeOptions(options, {unlit:true});
      
      if (this.lighting.isEnabled() && (!unlit.material || (unlit.material.supportsLighting && unlit.material.supportsLighting()))) {
        /* illumination pass */
        this.context.current_pass = Jax.Scene.ILLUMINATION_PASS;
        this.lighting.illuminate(this.context, options);

        /* ambient pass - unlit objects only because lit objects get ambient+diffuse+specular in one pass */
        this.context.current_pass = Jax.Scene.AMBIENT_PASS;
        for (i = 0; i < this.objects.length; i++)
          if (!this.objects[i].isLit()) {
            unlit.model_index = i;
            this.objects[i].render(this.context, unlit);
          }
      } else {
        this.context.current_pass = Jax.Scene.AMBIENT_PASS;
        for (i = 0; i < this.objects.length; i++) {
          unlit.model_index = i;
          this.objects[i].render(this.context, unlit);
        }
      }
      
      return this;
    },
    
    /**
     * Jax.World#update(timechange) -> Jax.World
     * - timechange (Number): the number of seconds to have passed since the last
     * call to +Jax.World#update+.
     *
     * Updates each object in the world, passing the +timechange+ argument into
     * the objects' respective +update+ functions (if they have one).
     **/
    update: function(timechange) {
      for (var i = this.objects.length-1; i >= 0; i--)
        if (this.objects[i].update)
          this.objects[i].update(timechange);
      return this;
    },
    
    /**
     * Jax.World#dispose() -> Jax.World
     *
     * Disposes of this world by removing all references to its objects and
     * reinitializing its +Jax.Scene.LightManager+ instance. Note that the
     * individual objects are not disposed; this is left as a task for either
     * the developer or the JavaScript garbage collector. The reason for this
     * is because it is impossible for Jax.World to know whether the objects
     * in question are in use by other Worlds.
     **/
    dispose: function() {
      var i, o;
      
      for (i = this.objects.length-1; i >= 0; i--)
        (o = this.objects.pop());// && o.dispose();
      
      this.lighting = new Jax.Scene.LightManager(this.context);
    }
  });
})();
Jax.NORMAL_MAP = 1;

/**
 * class Jax.Texture
 * Creates a managed WebGL texture.
 **/
Jax.Texture = (function() {
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
    self.handles[context.id] = context.glCreateTexture();
  }
  
  function generateTexture(context, self) {
    var data_type = self.options.data_type, format = self.options.format, target = self.options.target;
    if (self.image) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, format, data_type, self.image);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.image);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.image);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else if (self.images) {
      switch(target) {
        case GL_TEXTURE_2D:
          context.glTexImage2D(target, 0, format, format, data_type, self.images[0]);
          break;
        case GL_TEXTURE_CUBE_MAP:
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_X] || self.images[0]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Y] || self.images[1]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_POSITIVE_Z] || self.images[2]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_X] || self.images[3]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Y] || self.images[4]);
          context.glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, data_type, self.images[GL_TEXTURE_CUBE_MAP_NEGATIVE_Z] || self.images[5]);
          break;
        default: throw new Error("Unexpected texture target "+target+"; use GL_TEXTURE_2D or GL_TEXTURE_CUBE_MAP");
      }
    } else {
      // no images at all -- load the texture with empty data; it's probably for a framebuffer
      var width = self.options.width, height = self.options.height;
      if (!width || !height) throw new Error("Can't build an empty texture without at least a width and height");
      
      function ti2d(glEnum) {
        try {
          context.glTexImage2D(glEnum, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, null);
        } catch (e) {
          var tex = new Uint8Array(width*height*Jax.Util.sizeofFormat(format));
          context.glTexImage2D(glEnum, 0, format, width, height, 0, format, GL_UNSIGNED_BYTE, tex);
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
  
  /* pushLevel/popLevel are used for automatic management of glActiveTexture's.
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
    self.SLOT = GL_TEXTURES[level];
    context.glActiveTexture(self.SLOT);
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
      this.valid = [];
      
      if (!options && typeof(path_or_array) == "object" && path_or_array.length == undefined) {
        options = path_or_array;
        path_or_array = options.path || null;
        delete options.path;
      }
      
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
      
      var i;
      var enums = ['min_filter', 'mag_filter', 'mipmap_hint', 'format', 'target', 'data_type', 'wrap_s', 'wrap_t'];
      var global = Jax.getGlobal();
      for (i = 0; i < enums.length; i++)
        if (typeof(this.options[enums[i]]) == "string")
          this.options[enums[i]] = global[this.options[enums[i]]];

      if (path_or_array) {
        if (typeof(path_or_array) == "string") {
          this.image = new Image();
          this.image.onload = function() { imageLoaded(self, false, this); };
          this.image.onerror = this.image.onabort = function() { imageFailed(self, this); };
          this.image.src = path_or_array;
        } else {
          var onload = function() { imageLoaded(self, true, this); };
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
        this.options.generate_mipmap = !!(options && options.generate_mipmap);
        this.loaded = true;
      }
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
      
      context.glBindTexture(this.options.target, this.getHandle(context));
      generateTexture(context, this);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MAG_FILTER, this.options.mag_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_MIN_FILTER, this.options.min_filter);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_S, this.options.wrap_s);
      context.glTexParameteri(this.options.target, GL_TEXTURE_WRAP_T, this.options.wrap_t);
      context.glPixelStorei(GL_UNPACK_FLIP_Y_WEBGL, this.options.flip_y);
      context.glPixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.options.premultiply_alpha);
      context.glPixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, this.options.colorspace_conversion ? GL_BROWSER_DEFAULT_WEBGL : GL_NONE);
      
      if (this.options.generate_mipmap) {
        this.generateMipmap(context);
      }
      
      context.glBindTexture(this.options.target, null);
      this.valid[context.id] = true;
      return this;
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
      // context.glHint(GL_GENERATE_MIPMAP_HINT, this.options.mipmap_hint);
      context.glGenerateMipmap(this.options.target);
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
      context.glDeleteTexture(getHandle(context));
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
     *         // context.glActiveTexture has already been called with
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
      
      context.glBindTexture(this.options.target, this.getHandle(context));
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
      if (this.textureLevel != undefined) context.glActiveTexture(this.SLOT);
      context.glBindTexture(this.options.target, null);
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
if (Jax.getGlobal()['WEBGL_CLEANUP']) Jax.getGlobal()['WEBGL_CLEANUP']();
/**
 * Jax.EVENT_METHODS -> Object
 * Contains event handling methods which are added to +Jax.Context+.
 **/

Jax.EVENT_METHODS = (function() {
  function getCumulativeOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      valueT += Jax.Compatibility.offsetTop;
      valueL += Jax.Compatibility.offsetLeft;
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
    keyboard.last = evt;
    return evt;
  }
  
  function fixEvent(event) {
    // this borrowed from jQuery
    // store a copy of the original event object
		// and "clone" to set read-only properties
		var originalEvent = event;
		event = {type:originalEvent.type};
		var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" ");

		for ( var i = props.length, prop; i; ) {
			prop = props[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary
		if ( !event.target ) {
			// Fixes #1925 where srcElement might not be defined either
			event.target = event.srcElement || document;
		}

		// check if target is a textnode (safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Add relatedTarget, if necessary
		if ( !event.relatedTarget && event.fromElement ) {
			event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
		}

		// Calculate pageX/Y if missing and clientX/Y available
		if ( event.pageX == null && event.clientX != null ) {
			var eventDocument = event.target.ownerDocument || document,
				doc = eventDocument.documentElement,
				body = eventDocument.body;

			event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
			event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
		}

		// Add which for key events
		if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
			event.which = event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
		if ( !event.metaKey && event.ctrlKey ) {
			event.metaKey = event.ctrlKey;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		if ( !event.which && event.button !== undefined ) {
			event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
		}

		return event;
  }

  function buildMouseEvent(self, evt) {
    var mouse = self.mouse;

    evt = fixEvent(evt || window.event);
    evt.context = self;
    evt.canvas = self.canvas;
    evt.offsetx = mouse.x;
    evt.offsety = mouse.y;
    evt.mouse = mouse;
    
    mouse.offsetx = evt.offsetx || 0;
    mouse.offsety = evt.offsety || 0;

    var cumulativeOffset = getCumulativeOffset(self.canvas);
    mouse.x = evt.pageX - cumulativeOffset[0];
    mouse.y = evt.pageY - cumulativeOffset[1];

    if (self.canvas) {
      if (self.canvas.offsetWidth)  mouse.x = mouse.x / self.canvas.offsetWidth  * self.canvas.width;
      if (self.canvas.offsetHeight) mouse.y = mouse.y / self.canvas.offsetHeight * self.canvas.height;
    }

    mouse.y = self.canvas.height - mouse.y; // invert y

    // calculate differences, useful for checking movement relative to last position
    if (evt.type == 'mouseover') {
      // don't count 'mouseover' or we'll inadvertently cancel out long movements
      mouse.diffx = mouse.diffy = 0;
    } else {
      mouse.diffx = mouse.x - mouse.offsetx;
      mouse.diffy = mouse.y - mouse.offsety;
    }
    
    // check button state special cases
    if (evt.type == "mousedown" || evt.type == "onmousedown") {
      // begin dragging, and possibly click
      mouse.down = mouse.down || {count:0};
      mouse.down["button"+evt.which] = {at:[mouse.x,mouse.y],time:Jax.uptime};
      mouse.down.count++;
    } else if (evt.type == "click" || evt.type == "onclick") {
      // complete click
      evt.cancel = false;
      if (mouse.down && mouse.down["button"+evt.which]) {
        evt.cancel = !!Jax.click_speed && (Jax.uptime - mouse.down["button"+evt.which].time) > Jax.click_speed;
      }
    } else if (evt.type == "mouseup" || evt.type == "onmouseup") {
      // stop dragging
      if (mouse.down)
      {
        mouse.down.count--;
        // mouse.down = null;
        if (mouse.down.count < 0) mouse.down.count = 0;
      }
    } else if (evt.type == "mouseout" || evt.type == "onmouseout") {
      // reset all mousedown state so when mouse re-enters we won't be dragging
      // in practice, this behavior is accurate more often than the opposite
      // (e.g. drag out and then back in without releasing).
      // Requiring an extra mouse-up in this opposite instance is harmless and
      // relatively unobtrusive.
      mouse.down = null;
    }
    
    evt.x = mouse.x;
    evt.y = mouse.y;
    evt.diffx = mouse.diffx;
    evt.diffy = mouse.diffy;
    evt.down = mouse.down;

    return evt;
  }

  function dispatchEvent(self, evt) {
    if (evt.cancel) return;
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
      case "keydown":   target = "key_pressed";   break;
      case "keypress":  target = "key_typed";     break;
      case "keyup":     target = "key_released";  break;
      default: return true; // don't dispatch this event to the controller
    }

    if (self.current_controller[target]) {
      var result = self.current_controller[target](evt);
      if (result != undefined) return result;
    }
    return true;
  }
  
  // Tag names which, when active, should cause key input to be IGNORED. The implication is that while
  // one of these tags has focus, the user doesn't want to be controlling his character because s/he is
  // trying to type something.
  var ignoreKeyTagNames = [
          'input', 'form', 'textarea', 'label', 'fieldset', 'legend', 'select', 'optgroup', 'option', 'button'
  ];

  function registerListener(self, type, func) {
    if (self.canvas.addEventListener) {
      /* W3 */
      self.canvas.addEventListener(type, func, false);
    } else {
      /* IE */
      self.canvas.attachEvent("on"+type, func);
    }
  }

  return {
    disposeEventListeners: function() {
      this.unregisterMouseListeners();
      this.unregisterKeyListeners();
    },
    
    registerMouseListeners: function(receiver) {
      // we have to watch over/out to avoid problematic 'jittering' on mousemove
      var register = {mouseover:1,mouseout:1}, name;
      for (name in receiver) {
        switch(name) {
          case 'mouse_pressed' : register['mousedown'] = 1; break;
          case 'mouse_released': register['mouseup'] = 1; break;
          case 'mouse_dragged' : // same as mouse_moved
          case 'mouse_moved'   : register['mousedown'] = register['mouseup'] = register['mousemove'] = 1; break;
          case 'mouse_clicked' : register['click'] = register['mousedown'] = 1; break;
          case 'mouse_exited'  : register['mouseout'] = 1; break;
          case 'mouse_entered' : register['mouseover'] = 1; break;
        };
      }
      
      for (name in register) {
        if (name == 'mousemove')
          registerListener(this, name, this._evt_mousemovefunc);
        else
          registerListener(this, name, this._evt_mousefunc);
      }
    },
    
    unregisterMouseListeners: function() {
      if (this._evt_mousefunc)     this.canvas.removeEventListener(this._evt_mousefunc);
      if (this._evt_mousemovefunc) this.canvas.removeEventListener(this._evt_mousemovefunc);
    },
    
    registerKeyListeners: function() {
      if (this.canvas.addEventListener) {
        /* W3 */
        document.addEventListener('keydown',   this._evt_keyfunc,       false);
        document.addEventListener('keypress',  this._evt_keyfunc,       false);
        document.addEventListener('keyup',     this._evt_keyfunc,       false);
      } else {
        /* IE */
        document.attachEvent('onkeydown',   this._evt_keyfunc);
        document.attachEvent('onkeypress',  this._evt_keyfunc);
        document.attachEvent('onkeyup',     this._evt_keyfunc);
      }
    },
    
    unregisterKeyListeners: function() {
      if (!this._evt_keyfunc) return;
      
      this.canvas.removeEventListener(this._evt_keyfunc);
      document.removeEventListener('keydown',    this._evt_keyfunc, false);
      document.removeEventListener('keyup',      this._evt_keyfunc, false);
      document.removeEventListener('keypress',   this._evt_keyfunc, false);
      document.removeEventListener('onkeydown',  this._evt_keyfunc, false);
      document.removeEventListener('onkeyup',    this._evt_keyfunc, false);
      document.removeEventListener('onkeypress', this._evt_keyfunc, false);
    },
        
    setupEventListeners: function() {
      this.keyboard = {};
      this.mouse = {};

      var canvas = this.canvas;
      var self = this;

      this._evt_mousefunc     = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        return dispatchEvent(self, evt);
      };
      this._evt_mousemovefunc = function(evt) {
        if (!self.current_controller) return;
        evt = buildMouseEvent(self, evt);
        if (self.mouse && (!self.mouse.down || self.mouse.down.count <= 0)) // mouse is not being dragged
          evt.move_type = "mousemove";
        else
          evt.move_type = "mousedrag";
        return dispatchEvent(self, evt);
      };
      this._evt_keyfunc       = function(evt) {
        if (evt.which) evt.str = String.fromCharCode(evt.which);
        if (document.activeElement) {
          if (ignoreKeyTagNames.indexOf(document.activeElement.tagName) != -1)
          { // user is probably trying to type, so don't capture this input
            return;
          }
        }
        if (!self.current_controller) return;
        evt = buildKeyEvent(self, evt);
        return dispatchEvent(self, evt);
      };

      this.registerKeyListeners();
      
      // this is now done by the context
      // this.registerMouseListeners();
    }
  };
})();

/**
 * class Jax.Context
 * includes Jax.Events.Methods
 *
 * The highest level of operation in Jax. Initialization is simple:
 * 
 *     var context = new Jax.Context(canvas);
 *     
 * where _canvas_ is a reference to an HTML5 Canvas element.
 * 
 * If there is a root route set up, then at this point you are done.
 * If not, there's an additional step:
 * 
 *     context.redirectTo("controller_name/action_name");
 *     
 * where *controller_name* is the short name of the controller to start at,
 * and *action_name* is the action to fire within that controller.
 * 
 * Note that the specified redirect path must be registered in the route set.
 * 
 * Jax will automatically initialize and maintain a WebGL rendering bridge,
 * and WebGL methods can be called directly on this context by prefixing
 * the name of the method with "gl". For example:
 * 
 *     context.glClear(GL_COLOR_BIT | GL_DEPTH_BUFFER_BIT);
 *
 * ### Error Reporting
 *
 * Contexts emit an 'error' event that you can hook into in order to perform
 * error handling. By default, when an error is encountered in either the
 * 'render' or 'update' phase, Jax will log the error to the console, if
 * available, and in development mode will raise the error in the form of an
 * +alert()+ message. You can disable both of these by setting the +silence+
 * property of the error itself. Example:
 *
 *     context.addEventListener('error', function(err) {
 *       // do something with the error, then prevent it from logging
 *       error.silence = true;
 *     });
 * 
 * You can also see which phase the error was encountered under by checking
 * the +phase+ property on the error.
 *
 * Note that if an error is encountered, the phase it is encountered upon is
 * immediately halted. That is, if an error is encountered during the 'render'
 * phase, all rendering will be stopped, and the same goes for 'update' phases.
 *
 * You can restart rendering or updating after recovering from an error
 * by calling Jax.Context#startRendering or Jax.Context#startUpdating,
 * respectively.
 *
 * #### MVC Error Handling
 *
 * Your controllers can have an +error+ function which will be automatically
 * called whenever an error occurs. If the +error+ function returns any value
 * that evaluates to +true+, the error will be considered non-fatal and
 * no further error handling will be performed. Event handlers listening for 
 * error events will still be called, but the error will not be processed
 * in any other way.
 *
 * Example:
 *
 *     var ApplicationController = Jax.Controller.create("application", {
 *       error: function(error) {
 *         // handle the error, then return true
 *         // to indicate that it is non-fatal.
 *         return true;
 *       }
 *     });
 *
 * Returning a +false+ value will cause rendering and updating to be halted,
 * and will also invoke the default error handling behavior unless the error
 * is silenced.
 *
 * Error functions are inherited when a base controller is inherited. Since
 * the +ApplicationController+ is the base for all controllers, defining an
 * +error+ function on +ApplicationController+ will define the same error
 * function on all controllers. This provides a nice, DRY way to implement
 * consistent error handling across all controllers.
 *
 * When a Jax context is first being initialized, an error may occur if the
 * client does not support a WebGL context. This is a special case because
 * there are no controllers registered during context initialization. In
 * this event, the +ApplicationController+ prototype's +error+ function
 * will be called if it exists. In practice, this is identical to any other
 * controller-based error handling with the following exception:
 *
 * If the +error+ function returns a falsy value when given an error which
 * occurred during context initialization, Jax will redirect the user to
 * +Jax.webgl_not_supported_path+, which defaults to +/webgl_not_supported.html+.
 * If the function returns a truthy value, Jax will assume that the error
 * has been handled appropriately and will silence the error and then return
 * without further ado.
 *
 * In all cases, if an error occurs, rendering and updating are halted (even
 * for non-fatal errors); it is up to the error handler to restart rendering
 * and/or updating as necessary.
 *
 **/

Jax.Context = (function() {
  function setupContext(self) {
    if (!self.canvas.eventListeners) {
      /* TODO merge this with jax/webgl/core/events.js and use for all Jax event handling */
      self.canvas.eventListeners = {};
      var _add = self.canvas.addEventListener, _remove = self.canvas.removeEventListener;
      
      self.canvas.getEventListeners = function(type) {
        if (type) return (this.eventListeners[type] = this.eventListeners[type] || []);
        else {
          var ret = [];
          for (var i in this.eventListeners) ret = ret.concat(this.eventListeners[i]);
          return ret;
        }
      };
      
      self.canvas.addEventListener = function(type, listener, capture) {
        this.getEventListeners(type).push(listener);
        _add.call(this, type, listener, capture || false);
      }
      
      self.canvas.removeEventListener = function(type, listener, capture) {
        if (typeof(type) == "string") {
          var listeners = this.getEventListeners(type);
          var index = listeners.indexOf(listener);
          if (index != -1) {
            listeners.splice(index, 1);
            _remove.call(this, type, listener, capture || false);
          }
        } else if (!listener) {
          // type *is* the listener, remove it from all listener types
          for (var i in this.eventListeners)
            this.removeEventListener(i, type, false);
        }
      };
    }
    
    try { self.gl = self.canvas.getContext(WEBGL_CONTEXT_NAME, WEBGL_CONTEXT_OPTIONS); } catch(e) { }
    if (!self.gl) throw new Error("WebGL could not be initialized!");
  }
  
  function updateFramerate(self) {
    var current_render_start = Jax.uptime;
    if (!self.last_render_start) self.last_render_start = Jax.uptime;
    var time_to_render_this_frame = current_render_start - self.last_render_start;
    
    self.time_to_render = (self.time_to_render || 0) * self.framerate_sample_ratio
                        + time_to_render_this_frame * (1 - self.framerate_sample_ratio);
    
    // frames per second = 1 second divided by time to render; time is currently in ms so 1sec = 1000ms
    self.framerate = self.frames_per_second = 1.0 / self.time_to_render;
    self.last_render_start = current_render_start;
  }
  
  function updateUpdateRate(self) {
    var current_update_start = Jax.uptime;
    if (!self.last_update_start) self.last_update_start = current_update_start;
    var time_to_update_this_frame = current_update_start - self.last_update_start;
    
    if (self.calculateUpdateRate) {
      self.time_to_update = (self.time_to_update || 0) * self.framerate_sample_ratio
                          + time_to_update_this_frame * (1 - self.framerate_sample_ratio);
                        
      // update rate = seconds / time
      self.updates_per_second = 1.0 / self.time_to_update;
    }
    
    // in order to avoid recalculating the above for updates, we'll return the timechange
    // to be used in subsequent updates.
    var timechange = current_update_start - self.last_update_start;
    self.last_update_start = current_update_start;
    return timechange;
  }
  
  function startRendering(self) {
    if (self.isRendering()) return;
    
    function render() {
      try {
        if (self.isDisposed()) return;
        if (self.calculateFramerate) updateFramerate(self);
        if (self.current_view) {
          self.prepare();
          self.current_view.render();
          var len = self.afterRenderFuncs.length;
          for (var i = 0; i < len; i++) self.afterRenderFuncs[i].call(self);
          self.render_interval = requestAnimFrame(render, self.canvas);
        }
        else {
          self.stopRendering();
        }
      } catch(error) {
        self.handleError('render', error);
      }
    }
    
    self.render_interval = setTimeout(render, Jax.render_speed);
  }
  
  function startUpdating(self) {
    if (self.isUpdating()) return;
    
    function updateFunc() {
      try {
        if (self.isDisposed()) return;
        var timechange = updateUpdateRate(self);
      
        self.update(timechange);
        var len = self.afterUpdateFuncs.length;
        for (var i = 0; i < len; i++) self.afterUpdateFuncs[i].call(self);
        self.update_interval = setTimeout(updateFunc, Jax.update_speed);
      
        if (Jax.SHUTDOWN_IN_PROGRESS) self.dispose();
      } catch(error) {
        self.handleError('update', error);
      }
    }
    updateFunc();
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
    self.matrix_stack.loadModelMatrix(mat4.IDENTITY);
    self.matrix_stack.loadViewMatrix(self.player.camera.getTransformationMatrix());
    self.matrix_stack.loadProjectionMatrix(self.player.camera.getProjectionMatrix());
  }
  
  var klass = Jax.Class.create({
    /**
     * new Jax.Context(canvas[, options])
     * - canvas (String|HTMLCanvasElement): the canvas or the ID of the canvas to tie this context to
     * - options (Object): optional set of configuration options; see below
     *
     * Constructs a new Jax.Context, which is the basic object that ties together
     * models, controllers and views to produce a coherent application.
     *
     * Like most Jax objects, Jax.Context takes some optional initialization
     * options. They are as follows:
     *
     * <table>
     *   <tr>
     *     <th>alertErrors</th>
     *     <td>see +Jax.Context#alertErrors+</td>
     *   </tr>
     * </table>
     *
     *
     **/
    initialize: function(canvas, options) {
      try {
        if (typeof(canvas) == "string") canvas = document.getElementById(canvas);
        if (!canvas) throw new Error("Can't initialize a WebGL context without a canvas!");
        
        /**
         * Jax.Context#alertErrors -> Boolean
         * 
         * If true, an +alert+ prompt will be used to display errors encountered in development mode.
         * In production, they will be silenced (but logged to the console). If an error is silenced,
         * regardless of runmode, this won't happen.
         *
         * Defaults to +true+.
         *
         **/
        options = Jax.Util.normalizeOptions(options, { alertErrors: true });
        this.alertErrors = options.alertErrors;
        this.id = ++Jax.Context.identifier;
        this.canvas = canvas;
        this.setupEventListeners();
        this.render_interval = null;
        this.world = new Jax.World(this);
        this.player = {camera: new Jax.Camera()};
        this.player.camera.perspective({width:canvas.width, height:canvas.height});
        this.matrix_stack = new Jax.MatrixStack();
        this.current_pass = Jax.Scene.AMBIENT_PASS;
        this.afterRenderFuncs = [];
        this.afterUpdateFuncs = [];
        this.framerate = 0;
        this.frames_per_second = 0;
        this.updates_per_second = 0;
      
        /**
         * Jax.Context#framerate_sample_ratio -> Number
         *
         * A number between 0 and 1, to be used in updates to frames per second and updates per second.
         *
         * Setting this to a high value will produce "smoother" results; they will change less frequently,
         * but it will take longer to get initial results. High values are better for testing framerate
         * over the long term, while lower values are better for testing small disruptions in framerate
         * (such as garbage collection).
         *
         * Defaults to 0.9.
         **/
        this.framerate_sample_ratio = 0.9;
      
        setupContext(this);
        this.glClearColor(0.0, 0.0, 0.0, 1.0);
        this.glClearDepth(1.0);
        this.glEnable(GL_DEPTH_TEST);
        this.glDepthFunc(GL_LEQUAL);
        this.glEnable(GL_BLEND);
        this.glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        this.checkForRenderErrors();

        this.startUpdating();
      } catch(e) {
        this.handleError('initialize', e);
      }

      if (Jax.routes.isRouted("/"))
        this.redirectTo("/");
    },
    
    /**
     * Jax.Context#startUpdating() -> Jax.Context
     * 
     * Starts updating. This is done automatically within the constructor, but you can call it
     * again. Useful for resuming operation after processing an error.
     **/
    startUpdating: function() { startUpdating(this); return this; },
    
    /**
     * Jax.Context#startRendering() -> Jax.Context
     * 
     * Starts rendering. This is done automatically within the constructor, but you can call it
     * again. Useful for resuming operation after processing an error.
     **/
    startRendering: function() { startRendering(this); return this; },
    
    /**
     * Jax.Context#stopRendering() -> Jax.Context
     * 
     * Stops rendering.
     **/
    stopRendering: function() {
      clearTimeout(this.render_interval);
      this.render_interval = null;
      return this;
    },
    
    /**
     * Jax.Context#stopUpdating() -> Jax.Context
     * 
     * Stops updating.
     **/
    stopUpdating: function() {
      clearTimeout(this.update_interval);
      this.update_interval = null;
      return this;
    },
    
    /**
     * Jax.Context#getFramesPerSecond() -> Number
     * The average number of frames rendered in one second.
     *
     * Implicitly enables calculation of frames-per-second, which is initially disabled by default
     * to improve performance.
     **/
    getFramesPerSecond: function() { this.calculateFramerate = true; return this.frames_per_second; },
     
    /**
     * Jax.Context#getUpdatesPerSecond() -> Number
     * The average number of updates performed in one second. See also Jax.Context#getFramesPerSecond().
     *
     * Implicitly enables calculation of updates-per-second, which is initially disabled by default
     * to improve performance.
     **/
    getUpdatesPerSecond: function() { this.calculateUpdateRate = true; return this.updates_per_second; },
    
    /**
     * Jax.Context#disableFrameSpeedCalculations() -> Jax.Context
     * Disables calculation of frames-per-second. Note that this calculation is disabled by default
     * to improve performance, so you should only need to call this if you've previously called
     * Jax.Context#getUpdatesPerSecond().
     **/
    disableFrameSpeedCalculations: function() { this.calculateFramerate = false; },
    
    /**
     * Jax.Context#disableUpdateSpeedCalculations() -> Jax.Context
     * Disables calculation of updates-per-second. Note that this calculation is disabled by default
     * to improve performance, so you should only need to call this if you've previously called
     * Jax.Context#getUpdatesPerSecond().
     **/
    disableUpdateSpeedCalculations: function() { this.caclulateUpdateRate = false; },
     
    /**
     * Jax.Context#afterRender(func) -> Jax.Context
     * 
     * Registers the specified function to be called immediately after every render pass.
     * Returns this context.
     *
     * When the function is called, its +this+ object is set to the context itself.
     **/
    afterRender: function(func) {
      this.afterRenderFuncs.push(func);
    },
    
    /**
     * Jax.Context#afterUpdate(func) -> Jax.Context
     *
     * Registers the specified function to be called immediately after every update pass.
     * Returns this context.
     *
     * When the function is called, its +this+ object is set to the context itself.
     **/
    afterUpdate: function(func) {
      this.afterUpdateFuncs.push(func);
    },

    /**
     * Jax.Context#hasStencil() -> Boolean
     *
     * Returns true if this context supports stencil operations.
     **/
    hasStencil: function() {
      return !!this.gl.stencil;
    },

    /**
     * Jax.Context#redirectTo(path) -> Jax.Controller
     * - path (String): the path to redirect to
     * 
     * Redirects to the specified route, and then returns the Jax.Controller that
     * was just redirected to. The act of redirecting will dispose of the current
     * World, so be prepared to initialize a new scene.
     **/
    redirectTo: function(path) {
      try {
        this.stopRendering();
        this.stopUpdating();

        var current_controller = this.current_controller, current_view = this.current_view;
        var route = Jax.routes.recognize_route(path);

        /* yes, this is necessary. If the routing fails, controller must be null to prevent #update with a new world. */
        // this.current_controller = this.current_view = null;

        if (!current_controller || current_controller.klass != route.controller) {
          // different controller, unload the scene
          this.unregisterMouseListeners();
          this.world.dispose();
          this.player.camera.reset();
          this.current_controller = Jax.routes.dispatch(path, this);

          if (!this.current_controller.view_key)
            throw new Error("Controller '"+this.current_controller.getControllerName()+"' did not produce a renderable result");

          this.current_view = Jax.views.find(this.current_controller.view_key);
          setupView(this, this.current_view);
        } else {
          current_controller.fireAction(route.action);
          this.current_controller = current_controller;

          var newView, currentKey = current_controller.view_key;
          try {
            if (current_controller.view_key && (newView = Jax.views.find(current_controller.view_key))) {
              this.current_view = newView;
              setupView(this, newView);
            }
          } catch(e) {
            current_controller.view_key = currentKey;
            this.current_view = current_view;
          }
        }
        
        if (!this.isRendering()) this.startRendering();
        if (!this.isUpdating())  this.startUpdating();
      
        if (this.current_controller)
          this.registerMouseListeners(this.current_controller);
      } catch(e) {
        this.handleError('redirect', e);
      }
        
      return this.current_controller;
    },
    
    /**
     * Jax.Context#prepare() -> Jax.Context
     * 
     * Loads the matrices from +player.camera+ into the matrix stack, then
     * sets up the viewport. This should be run prior to rendering anything.
     * This is done automatically when the context has a View associated
     * with it, but if there is no View then the render process will be
     * halted, leaving it up to you to prepare the canvas explicitly.
     **/
    prepare: function() {
      reloadMatrices(this);
      this.glViewport(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Jax.Context#update(timechange) -> Jax.Context
     * - timechange (Number): the amount of time, in seconds, since the previous update
     *
     * Automatically called over time, this function will trigger an update
     * of all controllers and objects attached to this context.
     *
     * You can programmatically trigger updates to these objects by calling
     * this method directly. Doing this is useful for constructing consistent
     * test cases.
     **/
    update: function(timechange) {
      if (this.current_controller && this.current_controller.update)
        this.current_controller.update(timechange);
      this.world.update(timechange);
      return this;
    },

    /**
     * Jax.Context#isRendering() -> Boolean
     * Returns true if this Jax.Context currently has a render interval set.
     * This will be false by default if there is no root route; otherwise
     * it will be true. It is also enabled automatically upon the first
     * valid redirect.
     **/
    isRendering: function() {
      return this.render_interval != null;
    },
    
    /**
     * Jax.Context#isUpdating() -> Boolean
     * Returns true if this Jax.Context currently has an update interval set.
     * This will be false by default if there is no view; otherwise
     * it will be true. It is also enabled automatically upon the first
     * valid redirect.
     **/
    isUpdating: function() {
      return this.update_interval != null;
    },

    /**
     * Jax.Context#dispose() -> undefined
     *
     * Permanently disposes of this context, freeing the resources it is using.
     * This stops actions from running, closes any open rendering contexts, and
     * clears all other timeouts and intervals.
     *
     * A Jax.Context cannot be used once it is disposed.
     **/
    dispose: function() {
      this.disposed = true;
      this.stopRendering();
      this.stopUpdating();
      this.disposeEventListeners();
    },

    /**
     * Jax.Context#isDisposed() -> Boolean
     * Returns true if this context has been disposed.
     **/
    isDisposed: function() {
      return !!this.disposed;
    },

    /**
     * Jax.Context#pushMatrix(yield_to) -> Jax.Context
     * - yield_to (Function): a function to be called
     *
     * Pushes a new level onto the matrix stack and then calls the given function.
     * After the function completes, the matrix stack is reverted back to its
     * original state, effectively undoing any modifications made to the matrices
     * in the meantime.
     *
     * Example:
     *
     *     context.pushMatrix(function() {
     *       context.loadModelMatrix(mat4.IDENTITY);
     *       context.multViewMatrix(this.camera.getTransformationMatrix());
     *       // do some rendering
     *     });
     *     // matrix is restored to its previous state
     **/
    pushMatrix: function(yield_to) {
      this.matrix_stack.push();
      yield_to();
      this.matrix_stack.pop();
      return this;
    },
    
    /**
     * Jax.Context#getViewMatrix() -> mat4
     * Returns the view matrix. See Jax.MatrixStack#getViewMatrix for details.
     **/
    getViewMatrix: function() { return this.matrix_stack.getViewMatrix(); },
    
    /**
     * Jax.Context#getInverseViewMatrix() -> mat4
     * Returns the inverse view matrix. See Jax.MatrixStack#getInverseViewMatrix for details.
     **/
    getInverseViewMatrix: function() { return this.matrix_stack.getInverseViewMatrix(); },
    
    /**
     * Jax.Context#getFrustum() -> Jax.Scene.Frustum
     * Returns the frustum for the player's camera. Equivalent to calling
     * 
     *     context.player.camera.getFrustum()
     *     
     * Note that changes to the matrix via #multMatrix will not be represented
     * in this Jax.Scene.Frustum.
     **/
    getFrustum: function() { return this.player.camera.frustum; },
  
    checkForRenderErrors: function() {
      /* Error checking is slow, so don't do it in production mode */
      if (Jax.environment == Jax.PRODUCTION) return;

      var error = this.glGetError();
      if (error != GL_NO_ERROR)
      {
        var str = "GL error in "+this.canvas.id+": "+error+" ("+Jax.Util.enumName(error)+")";
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
    
    /**
     * Jax.Context#handleError(phase, error) -> Jax.Context
     * - phase (String): the processing stage during which this error was encountered; examples
     *                   include +initialize+, +update+ and +render+.
     * - error (Error): the error itself
     *
     * Handles the given error by first notifying any 'error' event listeners,
     * then passing the error into the current controller's +error+ method. If
     * there is no current controller or if the controller has no +error+ method,
     * the ApplicationController's +error+ method is called instead. In both
     * cases, the +error+ method may optionally return a non-false expression;
     * if they do, the error is silenced and the next processing step is skipped.
     *
     * If the error has not been silenced by either an error event listener or
     * a controller, the error is logged to the console and, in development mode,
     * an +alert+ box is shown indicating all known information about the error.
     *
     * Finally, the method returns this instance of Jax.Context.
     **/
    handleError: function(phase, error) {
      // not to be confused with handleRenderError(), this function is called
      // by render() and update() when an error is encountered anywhere within
      // them.
      var message = error.toString();
      error = {
        phase: phase,
        error: error.error || error,
        stack: error._stack || error.stack, 
        message: error.toString(),
        toString: function() { return message; }
      };
      this.fireEvent('error', error);
      
      var errorHandler = this.current_controller;
      if ((!errorHandler || !errorHandler.error) && typeof(ApplicationController) != 'undefined')
        errorHandler = Jax.getGlobal().ApplicationController.prototype;
      if (errorHandler && errorHandler.error) error.silence = errorHandler.error(error);

      // default error handling
      if (!error.silence && !error.silenced) {
        if (error.phase == 'initialize') {
          // init failure: most likely, webgl is not supported
          // TODO solidify this with new error types. Can check the error type for verification.
          
          document.location.pathname = Jax.webgl_not_supported_path || "/webgl_not_supported.html";
          throw error.toString()+"\n\n"+error.stack;
        }
        
        var log = null, stack = error._stack || error.stack || "(backtrace unavailable)";
        var message = error.toString()+"\n\n"+stack.toString();
    
        if (typeof(console) != 'undefined') {
          log = console.error || console.log;
          if (log) log.call(console, message);
        }
        if (Jax.environment != Jax.PRODUCTION && this.alertErrors)
          alert(message);
        throw error.error;
      }
      
      return this;
    },
    
    handleRenderError: function(method_name, args, err) {
      // FIXME this is going to be eventually caught by the try{} around render()
      // so, I'm not convinced we even need this function any more... maybe better
      // to throw the error outright than to call handleRenderError().
      throw err;
    }
  });
  
  /* set up matrix stack delegation */
  klass.delegate(/^(get|load|mult)(.*)Matrix$/).into("matrix_stack");
  
  /** alias of: Jax.Context#getFramesPerSecond
   * Jax.Context#getFramerate() -> Number
   * The average numebr of frames rendered in one second.
   **/
  klass.prototype.getFramerate = klass.prototype.getFramesPerSecond;
  
  return klass;
})();

Jax.Context.identifier = 0;
Jax.Context.addMethods(GL_METHODS);
Jax.Context.addMethods(Jax.EVENT_METHODS);
Jax.Context.addMethods(Jax.Events.Methods);
/**
 * class Jax.Noise
 * Constructs several textures to be used in vertex shaders involving Perlin noise.
 * As of v1.1.0, Jax defines a global variable called **Jax.noise** that you can use
 * instead of maintaining your own instance of +Jax.Noise+. This is both more memory
 * efficient and easier to use.
 *
 * Example:
 *
 *     setUniforms: function($super, context, mesh, options, uniforms) {
 *       $super(context, mesh, options, uniforms);
 *       
 *       Jax.noise.bind(context, uniforms);
 *       
 *       // . . .
 *     }
 *
 **/

Jax.Noise = (function() {
  var perm/*[256]*/ = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

  /* These are Ken Perlin's proposed gradients for 3D noise. I kept them for
     better consistency with the reference implementation, but there is really
     no need to pad this to 16 gradients for this particular implementation.
     If only the "proper" first 12 gradients are used, they can be extracted
     from the grad4[][] array: grad3[i][j] == grad4[i*2][j], 0<=i<=11, j=0,1,2
  */
  var grad3/*[16][3]*/ = [0,1,1,    0,1,-1,   0,-1,1,   0,-1,-1,
                          1,0,1,    1,0,-1,  -1,0,1,   -1,0,-1,
                          1,1,0,    1,-1,0,  -1,1,0,   -1,-1,0, // 12 cube edges
                          1,0,-1,  -1,0,-1,   0,-1,1,   0,1,1]; // 4 more to make 16

  /* These are my own proposed gradients for 4D noise. They are the coordinates
     of the midpoints of each of the 32 edges of a tesseract, just like the 3D
     noise gradients are the midpoints of the 12 edges of a cube.
  */
  var grad4/*[32][4]*/ = [0,1,1,1,   0,1,1,-1,   0,1,-1,1,   0,1,-1,-1, // 32 tesseract edges
                          0,-1,1,1,  0,-1,1,-1,  0,-1,-1,1,  0,-1,-1,-1,
                          1,0,1,1,   1,0,1,-1,   1,0,-1,1,   1,0,-1,-1,
                         -1,0,1,1,  -1,0,1,-1,  -1,0,-1,1,  -1,0,-1,-1,
                          1,1,0,1,   1,1,0,-1,   1,-1,0,1,   1,-1,0,-1,
                         -1,1,0,1,  -1,1,0,-1,  -1,-1,0,1,  -1,-1,0,-1,
                          1,1,1,0,   1,1,-1,0,   1,-1,1,0,   1,-1,-1,0,
                         -1,1,1,0,  -1,1,-1,0,  -1,-1,1,0,  -1,-1,-1,0];

  /* This is a look-up table to speed up the decision on which simplex we
     are in inside a cube or hypercube "cell" for 3D and 4D simplex noise.
     It is used to avoid complicated nested conditionals in the GLSL code.
     The table is indexed in GLSL with the results of six pair-wise
     comparisons beween the components of the P=(x,y,z,w) coordinates
     within a hypercube cell.
     c1 = x>=y ? 32 : 0;
     c2 = x>=z ? 16 : 0;
     c3 = y>=z ? 8 : 0;
     c4 = x>=w ? 4 : 0;
     c5 = y>=w ? 2 : 0;
     c6 = z>=w ? 1 : 0;
     offsets = simplex[c1+c2+c3+c4+c5+c6];
     o1 = step(160,offsets);
     o2 = step(96,offsets);
     o3 = step(32,offsets);
     (For the 3D case, c4, c5, c6 and o3 are not needed.)
  */
    var simplex4/*[][4]*/ = [0,64,128,192,   0,64,192,128,   0,0,0,0,        0,128,192,64,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        64,128,192,0,
                             0,128,64,192,   0,0,0,0,        0,192,64,128,   0,192,128,64,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        64,192,128,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             64,128,0,192,   0,0,0,0,        64,192,0,128,   0,0,0,0,
                             0,0,0,0,        0,0,0,0,        128,192,0,64,   128,192,64,0,
                             64,0,128,192,   64,0,192,128,   0,0,0,0,        0,0,0,0,
                             0,0,0,0,        128,0,192,64,   0,0,0,0,        128,64,192,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             0,0,0,0,        0,0,0,0,        0,0,0,0,        0,0,0,0,
                             128,0,64,192,   0,0,0,0,        0,0,0,0,        0,0,0,0,
                             192,0,64,128,   192,0,128,64,   0,0,0,0,        192,64,128,0,
                             128,64,0,192,   0,0,0,0,        0,0,0,0,        0,0,0,0,
                             192,64,0,128,   0,0,0,0,        192,128,0,64,   192,128,64,0];
                             
  var simplex_buf = null, perm_buf = null, grad_buf = null;
  
  /*
   * initPermTexture() - create and load a 2D texture for
   * a combined index permutation and gradient lookup table.
   * This texture is used for 2D and 3D noise, both classic and simplex.
   */
  function initPermTexture(context)
  {
    var tex = new Jax.Texture({min_filter: GL_NEAREST, mag_filter: GL_NEAREST, width:256, height:256});
    
    if (!perm_buf) {
      var pixels = new Array(256*256*4);
      var i,j;
      for(i = 0; i<256; i++)
        for(j = 0; j<256; j++) {
          var offset = (i*256+j)*4;
          var value = perm[(j+perm[i]) & 0xFF];
          var g = (value & 0x0F) * 3;
          pixels[offset]   = grad3[g+0] * 64 + 64; // Gradient x
          pixels[offset+1] = grad3[g+1] * 64 + 64; // Gradient y
          pixels[offset+2] = grad3[g+2] * 64 + 64; // Gradient z
          pixels[offset+3] = value;                // Permuted index
        }
      perm_buf = new Uint8Array(pixels);
    }

    return tex;
  }
  
  /*
   * initSimplexTexture() - create and load a 1D texture for a
   * simplex traversal order lookup table. This is used for simplex noise only,
   * and only for 3D and 4D noise where there are more than 2 simplices.
   * (3D simplex noise has 6 cases to sort out, 4D simplex noise has 24 cases.)
   */
  function initSimplexTexture(context)
  {
    // webgl doesn't support 1D so we'll simulate it with a 64x1 texture

    if (!simplex_buf) simplex_buf = new Uint8Array(simplex4);
    var tex = new Jax.Texture({min_filter:GL_NEAREST,mag_filter:GL_NEAREST, width:64, height:1});
    return tex;
  }
  
  /*
   * initGradTexture(context) - create and load a 2D texture
   * for a 4D gradient lookup table. This is used for 4D noise only.
   */
  function initGradTexture(context)
  {
    var tex = new Jax.Texture({min_filter: GL_NEAREST, mag_filter: GL_NEAREST, width:256, height:256});

    if (!grad_buf) {
      var pixels = new Array(256*256*4);
      var i,j;

      for(i = 0; i<256; i++)
        for(j = 0; j<256; j++) {
          var offset = (i*256+j)*4;
          var value = perm[(j+perm[i]) & 0xFF];
          var g = (value & 0x1F) * 4;
          pixels[offset]   = grad4[g+0] * 64 + 64; // Gradient x
          pixels[offset+1] = grad4[g+1] * 64 + 64; // Gradient y
          pixels[offset+2] = grad4[g+2] * 64 + 64; // Gradient z
          pixels[offset+3] = grad4[g+3] * 64 + 64; // Gradient z
        }
      
      grad_buf = new Uint8Array(pixels);
    }

    return tex;
  }
  
  function prepareAll(self, context) {
    if (!perm_buf || !simplex_buf || !grad_buf)
      throw new Error("Unknown error: one of the noise buffers is null!");
      
    self.perm.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, perm_buf);
    });
    self.simplex.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 64, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, simplex_buf);
    });
    self.grad.bind(context, function() {
      context.glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 256, 256, 0, GL_RGBA, GL_UNSIGNED_BYTE, grad_buf);
    });
  }

  return Jax.Class.create({
    initialize: function(context) {
      /** 
       * Jax.Noise#perm -> Jax.Texture
       * A 2D texture for a combined index permutation and gradient lookup table.
       * This texture is used for both 2D and 3D noise, both classic and simplex.
       **/
      this.perm = initPermTexture(context);
      
      /** 
       * Jax.Noise#simplex -> Jax.Texture
       * A 1D texture for a simplex transversal order lookup table. This is used
       * for simplex noise only, and only for 3D and 4D noise where there are more
       * than 2 simplices. (3D simplex noise has 6 cases to sort out, 4D simplex
       * noise has 24 cases.)
       *
       * Note that WebGL does not support 1D textures, so this is technically a
       * 2D texture with a height of 1 pixel.
       **/
      this.simplex = initSimplexTexture(context);
      
      /** 
       * Jax.Noise#grad -> Jax.Texture
       * A 2D texture for a 4D gradient lookup table. This is used for 4D noise
       * only.
       **/
      this.grad = initGradTexture(context);
      
      if (context) prepareAll(this, context);
    },
    
    /**
     * Jax.Noise#bind(context, uniforms) -> Jax.Shader.Delegator
     * - context (Jax.Context): the context to bind the noise textures to
     * - uniforms (Jax.Shader.Delegator): the shader variables to bind this noise to.
     * 
     * Binds the three noise textures to the given set of shader uniforms. This is
     * intended to be used from within a shader's +material.js+ file like so:
     *
     *     setUniforms: function($super, context, mesh, options, uniforms) {
     *       $super(context, mesh, options, uniforms);
     *       
     *       Jax.noise.bind(context, uniforms);
     *       
     *       // . . .
     *     }
     *
     * Returns the same uniforms delegator that was specified to begin with.
     *
     **/
    bind: function(context, uniforms) {
      if (!this.isPrepared(context)) prepareAll(this, context);
      uniforms.texture('permTexture',    this.perm,    context);
      uniforms.texture('simplexTexture', this.simplex, context);
      uniforms.texture('gradTexture',    this.grad,    context);
    },
    
    /**
     * Jax.Noise#isPrepared(context) -> Boolean
     * 
     * Returns true if this Jax.Noise has had its textures prepared for the
     * specified context.
     **/
    isPrepared: function(context) {
      return this.perm.isValid(context);
    }
  });
})();

Jax.noise = new Jax.Noise();
/**
 * class Jax.Mesh.Quad < Jax.Mesh
 * 
 * A simple square or rectangle. You can adjust its width and height, and that's about it.
 * 
 * This mesh is generally used for testing purposes, or for simple, textured objects like smoke particles.
 *
 * Options:
 *
 * * width : the width of this quad in units along the X axis. Defaults to +size+.
 * * height : the height of this quad in units along the Y axis. Defaults to +size+.
 * * size : a value to use for both width and height. Defaults to 1.0.
 *
 * Examples:
 * 
 *     var quad = new Jax.Mesh.Quad({width: 2, height: 1});
 *     var quad = new Jax.Mesh.Quad({size:1.5});
 * 
 **/

Jax.Mesh.Quad = (function() {
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      if (typeof(options) == "number") { options = {width:options, height:options}; }
      
      options = Jax.Util.normalizeOptions(options, {
        width:options && options.size ? options.size : 1,
        height:options && options.size ? options.size : 1
      });
      
      this.draw_mode = GL_TRIANGLE_STRIP;
      $super(options);
      
      this.setSize(options.width, options.height);
    },

    /**
     * Jax.Mesh.Quad#setWidth(width) -> undefined
     * - width (Number): the width of this quad in WebGL Units.
     *
     * Sets the width of this quad.
     **/
    setWidth: function(width) { this.setSize(width, this.height); },
    
    /**
     * Jax.Mesh.Quad#setHeight(height) -> undefined
     * - height (Number): the height of this quad in WebGL Units.
     *
     * Sets the height of this quad.
     **/
    setHeight:function(height){ this.setHeight(this.width, height); },
    
    /**
     * Jax.Mesh.Quad#setSize(width, height) -> undefined
     * - width (Number): the width of this quad in WebGL Units.
     * - height (Number): the height of this quad in WebGL Units.
     *
     * Sets the width and height of this quad.
     **/
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
/**
 * class Jax.Mesh.Cube < Jax.Mesh
 *
 * Constructs a 6-sided Cube mesh.
 *
 * Options:
 *
 * * width : the width of the cube in units. Defaults to +size+.
 * * height : the height of the cube in units. Defaults to +size+.
 * * depth : the depth of the cube in units. Defaults to +size+.
 * * size : a value to use for any of the other options if
 * they are unspecified. Defaults to 1.0.
 *
 * Example:
 *
 *     new Jax.Mesh.Cube();                  //=> 1x1x1
 *     new Jax.Mesh.Cube({size:2});          //=> 2x2x2
 *     new Jax.Mesh.Cube({width:2});         //=> 2x1x1
 *     new Jax.Mesh.Cube({width:2,depth:3}); //=> 2x1x3
 *
 **/

Jax.Mesh.Cube = Jax.Class.create(Jax.Mesh, {
  initialize: function($super, options) {
    var size = options && options.size || 1.0;
    options = Jax.Util.normalizeOptions(options, {
      width: size,
      depth: size,
      height: size
    });
    this.draw_mode = GL_TRIANGLES;
    $super(options);
    
    var w = options.width, h = options.height, d = options.depth;
    this.sides = {};

    this.sides.left = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.sides.left.camera.reorient([-1,0,0], [-w/2,0,0]);

    this.sides.right = new Jax.Model({mesh: new Jax.Mesh.Quad(d, h)});
    this.sides.right.camera.reorient([1,0,0], [w/2,0,0]);

    this.sides.front = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.sides.front.camera.reorient([0,0,1], [0,0,d/2]);

    this.sides.back = new Jax.Model({mesh: new Jax.Mesh.Quad(w, h)});
    this.sides.back.camera.reorient([0,0,-1], [0,0,-d/2]);

    this.sides.top = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.sides.top.camera.reorient([0,1,0], [0,h/2,0]);

    this.sides.bottom = new Jax.Model({mesh: new Jax.Mesh.Quad(w, d)});
    this.sides.bottom.camera.reorient([0,-1,0], [0,-h/2,0]);
  },
  
  init: function(verts, colors, texes, norms) {
    // we need to get each quad's vertices, but then transform them by the object's
    // local transformation, which includes the position offset and direction.
    
    var matrix;
    for (var i in this.sides)
    {
      var qverts = [], qcolor = [], qtex = [], qnorm = [];
      this.sides[i].mesh.init(qverts, qcolor, qtex, qnorm, []);
      matrix = this.sides[i].camera.getTransformationMatrix();

      // unfortunately quads are rendered in triangle strips; we need to translate that
      // into triangles, because there's no support at this time for ending one triangle
      // strip and beginning another.
      function push(verti) {
        var i1 = verti*3, i2 = verti*3+1, i3 = verti*3+2;
        var vert = mat4.multiplyVec3(matrix, [qverts[i1], qverts[i2], qverts[i3]]);
        var norm = mat4.multiplyVec3(matrix, [qnorm[i1], qnorm[i2], qnorm[i3]]);
        
        verts.push(vert[0], vert[1], vert[2]);
        norms.push(norm[0], norm[1], norm[2]);
        if (qcolor.length != 0) colors.push(qcolor[verti*4], qcolor[verti*4+1], qcolor[verti*4+2], qcolor[verti*4+3]);
        if (qtex.length != 0) texes. push(-qtex [verti*2], qtex[verti*2+1]);//, qtex [i3]);
      }
      push(0); push(1); push(2); // tri1
      push(2); push(1); push(3); // tri2
    }
  }
});
/**
 * class Jax.Mesh.Torus < Jax.Mesh
 *
 * A torus is a donut-shaped mesh.
 *
 * Options:
 *
 * * inner_radius, default: 0.6
 * * outer_radius, default: 1.8
 * * sides, default: 128
 * * rings, default: 256
 *
 * Examples:
 *
 *     new Jax.Mesh.Torus();
 *     new Jax.Mesh.Torus({inner_radius: 1.0, outer_radius:3.0});
 *
 **/

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
/**
 * class Jax.Mesh.Plane < Jax.Mesh
 *
 * Constructs a multi-polygonal flat plane treating the center of
 * the plane as the origin.
 *
 * Options:
 *
 * * width : the width of the cube in units. Defaults to +size+.
 * * depth : the depth of the cube in units. Defaults to +size+.
 * * size : a value to use for any of the other dimensional options if
 * they are unspecified. Defaults to 500.0.
 * * x_segments : the number of vertices along the plane's X axis.
 * Defaults to +segments+.
 * * z_segments : the number of vertices along the plane's Z axis.
 * Defaults to +segments+.
 * * segments : a value to use for any of the other segment count options
 * if they are unspecified. Defaults to 20.
 *
 * Examples:
 *
 *     new Jax.Mesh.Plane();
 *     new Jax.Mesh.Plane({size:2});
 *     new Jax.Mesh.Plane({width:2});
 *     new Jax.Mesh.Plane({width:2,x_segments:2});
 *
 **/

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
          texes.push(x / (x_seg-1), z / (z_seg-1));
          texes.push((x-1) / (x_seg-1), z / (z_seg-1));
      }

      for (z = z_seg-1; z >= 0; z--) {
          vx = x_unit * x - w / 2;
          vz = z_unit * z - d / 2;
          verts.push(vx-x_unit, 0, vz);
          verts.push(vx, 0, vz);
          norms.push(0,1,0,  0,1,0);
          texes.push((x-1) / (x_seg-1), z / (z_seg-1));
          texes.push(x / (x_seg-1), z / (z_seg-1));
      }
    }
  }
});
/**
 * class Jax.Mesh.Sphere < Jax.Mesh
 *
 * A spherical mesh.
 *
 * Takes 3 options:
 *
 * * radius: the size of this sphere. Defaults to 1.
 * * slices: the number of lines of longitude. The higher this value is, the smoother and more perfect the sphere will
 *           appear but the more hardware-intensive rendering it will be. Defaults to 30.
 * * stacks: The number of lines of latitude. The higher this value is, the smoother and more perfect the sphere will
 *           appear but the more hardware-intensive rendering it will be. Defaults to 30.
 *
 * Examples:
 *
 *     new Jax.Mesh.Sphere({radius:2.0});
 *     new Jax.Mesh.Sphere({slices:8, stacks:8, radius: 10.0});
 *
 **/

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
/**
 * class Jax.Mesh.Teapot < Jax.Mesh
 *
 * A teapot. Accepts a single +size+ attribute, used to scale the mesh, which defaults to 1.0.
 *
 * Examples:
 *
 *     new Jax.Mesh.Teapot({size:10.5});
 *
 **/

Jax.Mesh.Teapot = (function() {
  var teapot = {
      "vertices" : [5.929688,4.125,0,5.387188,4.125,2.7475,5.2971,4.494141,2.70917,5.832031,4.494141,0,5.401602,4.617188,2.753633,5.945313,4.617188,0,5.614209,4.494141,2.844092,6.175781,4.494141,0,5.848437,4.125,2.94375,6.429688,4.125,0,3.899688,4.125,4.97,3.830352,4.494141,4.900664,3.910782,4.617188,4.981094,4.074414,4.494141,5.144727,4.254687,4.125,5.325,1.677188,4.125,6.4575,1.638858,4.494141,6.367412,1.68332,4.617188,6.471914,1.77378,4.494141,6.684522,1.873438,4.125,6.91875,-1.070312,4.125,7,-1.070312,4.494141,6.902344,-1.070312,4.617188,7.015625,-1.070312,4.494141,7.246094,-1.070312,4.125,7.5,-1.070312,4.125,7,-4.007656,4.125,6.4575,-3.859572,4.494141,6.367412,-1.070312,4.494141,6.902344,-3.847676,4.617188,6.471914,-1.070312,4.617188,7.015625,-3.917371,4.494141,6.684522,-1.070312,4.494141,7.246094,-4.014062,4.125,6.91875,-1.070312,4.125,7.5,-6.209063,4.125,4.97,-6.042168,4.494141,4.900664,-6.0725,4.617188,4.981094,-6.217675,4.494141,5.144727,-6.395312,4.125,5.325,-7.591093,4.125,2.7475,-7.464421,4.494141,2.70917,-7.550137,4.617188,2.753633,-7.755822,4.494141,2.844092,-7.989062,4.125,2.94375,-8.070313,4.125,0,-7.972656,4.494141,0,-8.085938,4.617188,0,-8.316406,4.494141,0,-8.570313,4.125,0,-8.070313,4.125,0,-7.527812,4.125,-2.7475,-7.437724,4.494141,-2.70917,-7.972656,4.494141,0,-7.542227,4.617188,-2.753633,-8.085938,4.617188,0,-7.754834,4.494141,-2.844092,-8.316406,4.494141,0,-7.989062,4.125,-2.94375,-8.570313,4.125,0,-6.040312,4.125,-4.97,-5.970977,4.494141,-4.900664,-6.051406,4.617188,-4.981094,-6.215039,4.494141,-5.144727,-6.395312,4.125,-5.325,-3.817812,4.125,-6.4575,-3.779482,4.494141,-6.367412,-3.823945,4.617188,-6.471914,-3.914404,4.494141,-6.684522,-4.014062,4.125,-6.91875,-1.070312,4.125,-7,-1.070312,4.494141,-6.902344,-1.070312,4.617188,-7.015625,-1.070312,4.494141,-7.246094,-1.070312,4.125,-7.5,-1.070312,4.125,-7,1.677188,4.125,-6.4575,1.638858,4.494141,-6.367412,-1.070312,4.494141,-6.902344,1.68332,4.617188,-6.471914,-1.070312,4.617188,-7.015625,1.77378,4.494141,-6.684522,-1.070312,4.494141,-7.246094,1.873438,4.125,-6.91875,-1.070312,4.125,-7.5,3.899688,4.125,-4.97,3.830352,4.494141,-4.900664,3.910782,4.617188,-4.981094,4.074414,4.494141,-5.144727,4.254687,4.125,-5.325,5.387188,4.125,-2.7475,5.2971,4.494141,-2.70917,5.401602,4.617188,-2.753633,5.614209,4.494141,-2.844092,5.848437,4.125,-2.94375,5.929688,4.125,0,5.832031,4.494141,0,5.945313,4.617188,0,6.175781,4.494141,0,6.429688,4.125,0,6.429688,4.125,0,5.848437,4.125,2.94375,6.695264,2.162109,3.304053,7.347656,2.162109,0,7.433985,0.234375,3.61836,8.148438,0.234375,0,7.956494,-1.623047,3.840674,8.714844,-1.623047,0,8.154688,-3.375,3.925,8.929688,-3.375,0,4.254687,4.125,5.325,4.906446,2.162109,5.976758,5.475,0.234375,6.545312,5.877149,-1.623047,6.947461,6.029688,-3.375,7.1,1.873438,4.125,6.91875,2.23374,2.162109,7.765576,2.548047,0.234375,8.504297,2.770362,-1.623047,9.026807,2.854688,-3.375,9.225,-1.070312,4.125,7.5,-1.070312,2.162109,8.417969,-1.070312,0.234375,9.21875,-1.070312,-1.623047,9.785156,-1.070312,-3.375,10,-1.070312,4.125,7.5,-4.014062,4.125,6.91875,-4.374365,2.162109,7.765576,-1.070312,2.162109,8.417969,-4.688672,0.234375,8.504297,-1.070312,0.234375,9.21875,-4.910986,-1.623047,9.026807,-1.070312,-1.623047,9.785156,-4.995313,-3.375,9.225,-1.070312,-3.375,10,-6.395312,4.125,5.325,-7.047071,2.162109,5.976758,-7.615624,0.234375,6.545312,-8.017773,-1.623047,6.947461,-8.170312,-3.375,7.1,-7.989062,4.125,2.94375,-8.835889,2.162109,3.304053,-9.57461,0.234375,3.61836,-10.097119,-1.623047,3.840674,-10.295313,-3.375,3.925,-8.570313,4.125,0,-9.488281,2.162109,0,-10.289063,0.234375,0,-10.855469,-1.623047,0,-11.070313,-3.375,0,-8.570313,4.125,0,-7.989062,4.125,-2.94375,-8.835889,2.162109,-3.304053,-9.488281,2.162109,0,-9.57461,0.234375,-3.61836,-10.289063,0.234375,0,-10.097119,-1.623047,-3.840674,-10.855469,-1.623047,0,-10.295313,-3.375,-3.925,-11.070313,-3.375,0,-6.395312,4.125,-5.325,-7.047071,2.162109,-5.976758,-7.615624,0.234375,-6.545312,-8.017773,-1.623047,-6.947461,-8.170312,-3.375,-7.1,-4.014062,4.125,-6.91875,-4.374365,2.162109,-7.765576,-4.688672,0.234375,-8.504297,-4.910986,-1.623047,-9.026807,-4.995313,-3.375,-9.225,-1.070312,4.125,-7.5,-1.070312,2.162109,-8.417969,-1.070312,0.234375,-9.21875,-1.070312,-1.623047,-9.785156,-1.070312,-3.375,-10,-1.070312,4.125,-7.5,1.873438,4.125,-6.91875,2.23374,2.162109,-7.765576,-1.070312,2.162109,-8.417969,2.548047,0.234375,-8.504297,-1.070312,0.234375,-9.21875,2.770362,-1.623047,-9.026807,-1.070312,-1.623047,-9.785156,2.854688,-3.375,-9.225,-1.070312,-3.375,-10,4.254687,4.125,-5.325,4.906446,2.162109,-5.976758,5.475,0.234375,-6.545312,5.877149,-1.623047,-6.947461,6.029688,-3.375,-7.1,5.848437,4.125,-2.94375,6.695264,2.162109,-3.304053,7.433985,0.234375,-3.61836,7.956494,-1.623047,-3.840674,8.154688,-3.375,-3.925,6.429688,4.125,0,7.347656,2.162109,0,8.148438,0.234375,0,8.714844,-1.623047,0,8.929688,-3.375,0,8.929688,-3.375,0,8.154688,-3.375,3.925,7.794336,-4.857422,3.77168,8.539063,-4.857422,0,7.001562,-5.953125,3.434375,7.679688,-5.953125,0,6.208789,-6.697266,3.09707,6.820313,-6.697266,0,5.848437,-7.125,2.94375,6.429688,-7.125,0,6.029688,-3.375,7.1,5.752343,-4.857422,6.822656,5.142187,-5.953125,6.2125,4.532031,-6.697266,5.602344,4.254687,-7.125,5.325,2.854688,-3.375,9.225,2.701367,-4.857422,8.864649,2.364063,-5.953125,8.071875,2.026758,-6.697266,7.279101,1.873438,-7.125,6.91875,-1.070312,-3.375,10,-1.070312,-4.857422,9.609375,-1.070312,-5.953125,8.75,-1.070312,-6.697266,7.890625,-1.070312,-7.125,7.5,-1.070312,-3.375,10,-4.995313,-3.375,9.225,-4.841992,-4.857422,8.864649,-1.070312,-4.857422,9.609375,-4.504687,-5.953125,8.071875,-1.070312,-5.953125,8.75,-4.167383,-6.697266,7.279101,-1.070312,-6.697266,7.890625,-4.014062,-7.125,6.91875,-1.070312,-7.125,7.5,-8.170312,-3.375,7.1,-7.892968,-4.857422,6.822656,-7.282812,-5.953125,6.2125,-6.672656,-6.697266,5.602344,-6.395312,-7.125,5.325,-10.295313,-3.375,3.925,-9.934961,-4.857422,3.77168,-9.142187,-5.953125,3.434375,-8.349414,-6.697266,3.09707,-7.989062,-7.125,2.94375,-11.070313,-3.375,0,-10.679688,-4.857422,0,-9.820313,-5.953125,0,-8.960938,-6.697266,0,-8.570313,-7.125,0,-11.070313,-3.375,0,-10.295313,-3.375,-3.925,-9.934961,-4.857422,-3.77168,-10.679688,-4.857422,0,-9.142187,-5.953125,-3.434375,-9.820313,-5.953125,0,-8.349414,-6.697266,-3.09707,-8.960938,-6.697266,0,-7.989062,-7.125,-2.94375,-8.570313,-7.125,0,-8.170312,-3.375,-7.1,-7.892968,-4.857422,-6.822656,-7.282812,-5.953125,-6.2125,-6.672656,-6.697266,-5.602344,-6.395312,-7.125,-5.325,-4.995313,-3.375,-9.225,-4.841992,-4.857422,-8.864649,-4.504687,-5.953125,-8.071875,-4.167383,-6.697266,-7.279101,-4.014062,-7.125,-6.91875,-1.070312,-3.375,-10,-1.070312,-4.857422,-9.609375,-1.070312,-5.953125,-8.75,-1.070312,-6.697266,-7.890625,-1.070312,-7.125,-7.5,-1.070312,-3.375,-10,2.854688,-3.375,-9.225,2.701367,-4.857422,-8.864649,-1.070312,-4.857422,-9.609375,2.364063,-5.953125,-8.071875,-1.070312,-5.953125,-8.75,2.026758,-6.697266,-7.279101,-1.070312,-6.697266,-7.890625,1.873438,-7.125,-6.91875,-1.070312,-7.125,-7.5,6.029688,-3.375,-7.1,5.752343,-4.857422,-6.822656,5.142187,-5.953125,-6.2125,4.532031,-6.697266,-5.602344,4.254687,-7.125,-5.325,8.154688,-3.375,-3.925,7.794336,-4.857422,-3.77168,7.001562,-5.953125,-3.434375,6.208789,-6.697266,-3.09707,5.848437,-7.125,-2.94375,8.929688,-3.375,0,8.539063,-4.857422,0,7.679688,-5.953125,0,6.820313,-6.697266,0,6.429688,-7.125,0,6.429688,-7.125,0,5.848437,-7.125,2.94375,5.691685,-7.400391,2.877056,6.259766,-7.400391,0,4.853868,-7.640625,2.520586,5.351563,-7.640625,0,2.783648,-7.810547,1.639761,3.107422,-7.810547,0,-1.070312,-7.875,0,4.254687,-7.125,5.325,4.134043,-7.400391,5.204355,3.489219,-7.640625,4.559531,1.895879,-7.810547,2.966191,-1.070312,-7.875,0,1.873438,-7.125,6.91875,1.806743,-7.400391,6.761997,1.450274,-7.640625,5.92418,0.569448,-7.810547,3.85396,-1.070312,-7.875,0,-1.070312,-7.125,7.5,-1.070312,-7.400391,7.330078,-1.070312,-7.640625,6.421875,-1.070312,-7.810547,4.177734,-1.070312,-7.875,0,-1.070312,-7.125,7.5,-4.014062,-7.125,6.91875,-3.947368,-7.400391,6.761997,-1.070312,-7.400391,7.330078,-3.590898,-7.640625,5.92418,-1.070312,-7.640625,6.421875,-2.710073,-7.810547,3.85396,-1.070312,-7.810547,4.177734,-1.070312,-7.875,0,-6.395312,-7.125,5.325,-6.274668,-7.400391,5.204355,-5.629844,-7.640625,4.559531,-4.036504,-7.810547,2.966191,-1.070312,-7.875,0,-7.989062,-7.125,2.94375,-7.832309,-7.400391,2.877056,-6.994492,-7.640625,2.520586,-4.924272,-7.810547,1.639761,-1.070312,-7.875,0,-8.570313,-7.125,0,-8.400391,-7.400391,0,-7.492188,-7.640625,0,-5.248047,-7.810547,0,-1.070312,-7.875,0,-8.570313,-7.125,0,-7.989062,-7.125,-2.94375,-7.832309,-7.400391,-2.877056,-8.400391,-7.400391,0,-6.994492,-7.640625,-2.520586,-7.492188,-7.640625,0,-4.924272,-7.810547,-1.639761,-5.248047,-7.810547,0,-1.070312,-7.875,0,-6.395312,-7.125,-5.325,-6.274668,-7.400391,-5.204355,-5.629844,-7.640625,-4.559531,-4.036504,-7.810547,-2.966191,-1.070312,-7.875,0,-4.014062,-7.125,-6.91875,-3.947368,-7.400391,-6.761997,-3.590898,-7.640625,-5.92418,-2.710073,-7.810547,-3.85396,-1.070312,-7.875,0,-1.070312,-7.125,-7.5,-1.070312,-7.400391,-7.330078,-1.070312,-7.640625,-6.421875,-1.070312,-7.810547,-4.177734,-1.070312,-7.875,0,-1.070312,-7.125,-7.5,1.873438,-7.125,-6.91875,1.806743,-7.400391,-6.761997,-1.070312,-7.400391,-7.330078,1.450274,-7.640625,-5.92418,-1.070312,-7.640625,-6.421875,0.569448,-7.810547,-3.85396,-1.070312,-7.810547,-4.177734,-1.070312,-7.875,0,4.254687,-7.125,-5.325,4.134043,-7.400391,-5.204355,3.489219,-7.640625,-4.559531,1.895879,-7.810547,-2.966191,-1.070312,-7.875,0,5.848437,-7.125,-2.94375,5.691685,-7.400391,-2.877056,4.853868,-7.640625,-2.520586,2.783648,-7.810547,-1.639761,-1.070312,-7.875,0,6.429688,-7.125,0,6.259766,-7.400391,0,5.351563,-7.640625,0,3.107422,-7.810547,0,-1.070312,-7.875,0,-9.070313,2.25,0,-8.992188,2.425781,0.84375,-11.47583,2.405457,0.84375,-11.40625,2.232422,0,-13.298828,2.263184,0.84375,-13.132813,2.109375,0,-14.421631,1.877014,0.84375,-14.203125,1.775391,0,-14.804688,1.125,0.84375,-14.570313,1.125,0,-8.820313,2.8125,1.125,-11.628906,2.786134,1.125,-13.664063,2.601563,1.125,-14.902344,2.100586,1.125,-15.320313,1.125,1.125,-8.648438,3.199219,0.84375,-11.781982,3.166809,0.84375,-14.029297,2.939941,0.84375,-15.383057,2.324158,0.84375,-15.835938,1.125,0.84375,-8.570313,3.375,0,-11.851563,3.339844,0,-14.195313,3.09375,0,-15.601563,2.425781,0,-16.070313,1.125,0,-8.570313,3.375,0,-8.648438,3.199219,-0.84375,-11.781982,3.166809,-0.84375,-11.851563,3.339844,0,-14.029297,2.939941,-0.84375,-14.195313,3.09375,0,-15.383057,2.324158,-0.84375,-15.601563,2.425781,0,-15.835938,1.125,-0.84375,-16.070313,1.125,0,-8.820313,2.8125,-1.125,-11.628906,2.786134,-1.125,-13.664063,2.601563,-1.125,-14.902344,2.100586,-1.125,-15.320313,1.125,-1.125,-8.992188,2.425781,-0.84375,-11.47583,2.405457,-0.84375,-13.298828,2.263184,-0.84375,-14.421631,1.877014,-0.84375,-14.804688,1.125,-0.84375,-9.070313,2.25,0,-11.40625,2.232422,0,-13.132813,2.109375,0,-14.203125,1.775391,0,-14.570313,1.125,0,-14.570313,1.125,0,-14.804688,1.125,0.84375,-14.588013,0.00705,0.84375,-14.375,0.105469,0,-13.90918,-1.275146,0.84375,-13.757813,-1.125,0,-12.724976,-2.540863,0.84375,-12.671875,-2.355469,0,-10.992188,-3.609375,0.84375,-11.070313,-3.375,0,-15.320313,1.125,1.125,-15.056641,-0.209473,1.125,-14.242188,-1.605469,1.125,-12.841797,-2.94873,1.125,-10.820313,-4.125,1.125,-15.835938,1.125,0.84375,-15.525269,-0.425995,0.84375,-14.575195,-1.935791,0.84375,-12.958618,-3.356598,0.84375,-10.648438,-4.640625,0.84375,-16.070313,1.125,0,-15.738281,-0.524414,0,-14.726563,-2.085938,0,-13.011719,-3.541992,0,-10.570313,-4.875,0,-16.070313,1.125,0,-15.835938,1.125,-0.84375,-15.525269,-0.425995,-0.84375,-15.738281,-0.524414,0,-14.575195,-1.935791,-0.84375,-14.726563,-2.085938,0,-12.958618,-3.356598,-0.84375,-13.011719,-3.541992,0,-10.648438,-4.640625,-0.84375,-10.570313,-4.875,0,-15.320313,1.125,-1.125,-15.056641,-0.209473,-1.125,-14.242188,-1.605469,-1.125,-12.841797,-2.94873,-1.125,-10.820313,-4.125,-1.125,-14.804688,1.125,-0.84375,-14.588013,0.00705,-0.84375,-13.90918,-1.275146,-0.84375,-12.724976,-2.540863,-0.84375,-10.992188,-3.609375,-0.84375,-14.570313,1.125,0,-14.375,0.105469,0,-13.757813,-1.125,0,-12.671875,-2.355469,0,-11.070313,-3.375,0,7.429688,-0.75,0,7.429688,-1.394531,1.85625,10.01123,-0.677124,1.676074,9.828125,-0.199219,0,11.101563,0.84668,1.279688,10.867188,1.125,0,11.723145,2.629761,0.883301,11.4375,2.730469,0,12.898438,4.125,0.703125,12.429688,4.125,0,7.429688,-2.8125,2.475,10.414063,-1.728516,2.234766,11.617188,0.234375,1.70625,12.351563,2.408203,1.177734,13.929688,4.125,0.9375,7.429688,-4.230469,1.85625,10.816895,-2.779907,1.676074,12.132813,-0.37793,1.279688,12.97998,2.186646,0.883301,14.960938,4.125,0.703125,7.429688,-4.875,0,11,-3.257813,0,12.367188,-0.65625,0,13.265625,2.085938,0,15.429688,4.125,0,7.429688,-4.875,0,7.429688,-4.230469,-1.85625,10.816895,-2.779907,-1.676074,11,-3.257813,0,12.132813,-0.37793,-1.279688,12.367188,-0.65625,0,12.97998,2.186646,-0.883301,13.265625,2.085938,0,14.960938,4.125,-0.703125,15.429688,4.125,0,7.429688,-2.8125,-2.475,10.414063,-1.728516,-2.234766,11.617188,0.234375,-1.70625,12.351563,2.408203,-1.177734,13.929688,4.125,-0.9375,7.429688,-1.394531,-1.85625,10.01123,-0.677124,-1.676074,11.101563,0.84668,-1.279688,11.723145,2.629761,-0.883301,12.898438,4.125,-0.703125,7.429688,-0.75,0,9.828125,-0.199219,0,10.867188,1.125,0,11.4375,2.730469,0,12.429688,4.125,0,12.429688,4.125,0,12.898438,4.125,0.703125,13.291077,4.346237,0.65918,12.789063,4.335938,0,13.525879,4.422729,0.5625,13.054688,4.40625,0,13.532898,4.350357,0.46582,13.132813,4.335938,0,13.242188,4.125,0.421875,12.929688,4.125,0,13.929688,4.125,0.9375,14.395508,4.368896,0.878906,14.5625,4.458984,0.75,14.413086,4.38208,0.621094,13.929688,4.125,0.5625,14.960938,4.125,0.703125,15.499939,4.391556,0.65918,15.599121,4.495239,0.5625,15.293274,4.413804,0.46582,14.617188,4.125,0.421875,15.429688,4.125,0,16.001953,4.401855,0,16.070313,4.511719,0,15.693359,4.428224,0,14.929688,4.125,0,15.429688,4.125,0,14.960938,4.125,-0.703125,15.499939,4.391556,-0.65918,16.001953,4.401855,0,15.599121,4.495239,-0.5625,16.070313,4.511719,0,15.293274,4.413804,-0.46582,15.693359,4.428224,0,14.617188,4.125,-0.421875,14.929688,4.125,0,13.929688,4.125,-0.9375,14.395508,4.368896,-0.878906,14.5625,4.458984,-0.75,14.413086,4.38208,-0.621094,13.929688,4.125,-0.5625,12.898438,4.125,-0.703125,13.291077,4.346237,-0.65918,13.525879,4.422729,-0.5625,13.532898,4.350357,-0.46582,13.242188,4.125,-0.421875,12.429688,4.125,0,12.789063,4.335938,0,13.054688,4.40625,0,13.132813,4.335938,0,12.929688,4.125,0,0.501414,7.628906,0.670256,0.632813,7.628906,0,-1.070312,7.875,0,0.429278,7.03125,0.639395,0.554688,7.03125,0,-0.162029,6.292969,0.38696,-0.085937,6.292969,0,-0.147812,5.625,0.3925,-0.070312,5.625,0,0.140489,7.628906,1.210801,-1.070312,7.875,0,0.084844,7.03125,1.155156,-0.370879,6.292969,0.699434,-0.360312,5.625,0.71,-0.400056,7.628906,1.571726,-1.070312,7.875,0,-0.430918,7.03125,1.49959,-0.683352,6.292969,0.908284,-0.677812,5.625,0.9225,-1.070312,7.628906,1.703125,-1.070312,7.875,0,-1.070312,7.03125,1.625,-1.070312,6.292969,0.984375,-1.070312,5.625,1,-1.740569,7.628906,1.571726,-1.070312,7.628906,1.703125,-1.070312,7.875,0,-1.709707,7.03125,1.49959,-1.070312,7.03125,1.625,-1.457273,6.292969,0.908284,-1.070312,6.292969,0.984375,-1.462812,5.625,0.9225,-1.070312,5.625,1,-2.281113,7.628906,1.210801,-1.070312,7.875,0,-2.225469,7.03125,1.155156,-1.769746,6.292969,0.699434,-1.780312,5.625,0.71,-2.642038,7.628906,0.670256,-1.070312,7.875,0,-2.569902,7.03125,0.639395,-1.978596,6.292969,0.38696,-1.992812,5.625,0.3925,-2.773438,7.628906,0,-1.070312,7.875,0,-2.695313,7.03125,0,-2.054687,6.292969,0,-2.070312,5.625,0,-2.642038,7.628906,-0.670256,-2.773438,7.628906,0,-1.070312,7.875,0,-2.569902,7.03125,-0.639395,-2.695313,7.03125,0,-1.978596,6.292969,-0.38696,-2.054687,6.292969,0,-1.992812,5.625,-0.3925,-2.070312,5.625,0,-2.281113,7.628906,-1.210801,-1.070312,7.875,0,-2.225469,7.03125,-1.155156,-1.769746,6.292969,-0.699434,-1.780312,5.625,-0.71,-1.740569,7.628906,-1.571726,-1.070312,7.875,0,-1.709707,7.03125,-1.49959,-1.457273,6.292969,-0.908284,-1.462812,5.625,-0.9225,-1.070312,7.628906,-1.703125,-1.070312,7.875,0,-1.070312,7.03125,-1.625,-1.070312,6.292969,-0.984375,-1.070312,5.625,-1,-0.400056,7.628906,-1.571726,-1.070312,7.628906,-1.703125,-1.070312,7.875,0,-0.430918,7.03125,-1.49959,-1.070312,7.03125,-1.625,-0.683352,6.292969,-0.908284,-1.070312,6.292969,-0.984375,-0.677812,5.625,-0.9225,-1.070312,5.625,-1,0.140489,7.628906,-1.210801,-1.070312,7.875,0,0.084844,7.03125,-1.155156,-0.370879,6.292969,-0.699434,-0.360312,5.625,-0.71,0.501414,7.628906,-0.670256,-1.070312,7.875,0,0.429278,7.03125,-0.639395,-0.162029,6.292969,-0.38696,-0.147812,5.625,-0.3925,0.632813,7.628906,0,-1.070312,7.875,0,0.554688,7.03125,0,-0.085937,6.292969,0,-0.070312,5.625,0,-0.070312,5.625,0,-0.147812,5.625,0.3925,1.034141,5.179688,0.895391,1.210938,5.179688,0,2.735,4.875,1.619062,3.054688,4.875,0,4.262891,4.570313,2.26914,4.710938,4.570313,0,4.925938,4.125,2.55125,5.429688,4.125,0,-0.360312,5.625,0.71,0.549375,5.179688,1.619688,1.858438,4.875,2.92875,3.034375,4.570313,4.104687,3.544688,4.125,4.615,-0.677812,5.625,0.9225,-0.174922,5.179688,2.104453,0.54875,4.875,3.805313,1.198828,4.570313,5.333203,1.480938,4.125,5.99625,-1.070312,5.625,1,-1.070312,5.179688,2.28125,-1.070312,4.875,4.125,-1.070312,4.570313,5.78125,-1.070312,4.125,6.5,-1.070312,5.625,1,-1.462812,5.625,0.9225,-1.965703,5.179688,2.104453,-1.070312,5.179688,2.28125,-2.689375,4.875,3.805313,-1.070312,4.875,4.125,-3.339453,4.570313,5.333203,-1.070312,4.570313,5.78125,-3.621562,4.125,5.99625,-1.070312,4.125,6.5,-1.780312,5.625,0.71,-2.69,5.179688,1.619688,-3.999062,4.875,2.92875,-5.174999,4.570313,4.104687,-5.685312,4.125,4.615,-1.992812,5.625,0.3925,-3.174765,5.179688,0.895391,-4.875625,4.875,1.619062,-6.403516,4.570313,2.26914,-7.066563,4.125,2.55125,-2.070312,5.625,0,-3.351562,5.179688,0,-5.195313,4.875,0,-6.851563,4.570313,0,-7.570313,4.125,0,-2.070312,5.625,0,-1.992812,5.625,-0.3925,-3.174765,5.179688,-0.895391,-3.351562,5.179688,0,-4.875625,4.875,-1.619062,-5.195313,4.875,0,-6.403516,4.570313,-2.26914,-6.851563,4.570313,0,-7.066563,4.125,-2.55125,-7.570313,4.125,0,-1.780312,5.625,-0.71,-2.69,5.179688,-1.619688,-3.999062,4.875,-2.92875,-5.174999,4.570313,-4.104687,-5.685312,4.125,-4.615,-1.462812,5.625,-0.9225,-1.965703,5.179688,-2.104453,-2.689375,4.875,-3.805313,-3.339453,4.570313,-5.333203,-3.621562,4.125,-5.99625,-1.070312,5.625,-1,-1.070312,5.179688,-2.28125,-1.070312,4.875,-4.125,-1.070312,4.570313,-5.78125,-1.070312,4.125,-6.5,-1.070312,5.625,-1,-0.677812,5.625,-0.9225,-0.174922,5.179688,-2.104453,-1.070312,5.179688,-2.28125,0.54875,4.875,-3.805313,-1.070312,4.875,-4.125,1.198828,4.570313,-5.333203,-1.070312,4.570313,-5.78125,1.480938,4.125,-5.99625,-1.070312,4.125,-6.5,-0.360312,5.625,-0.71,0.549375,5.179688,-1.619688,1.858438,4.875,-2.92875,3.034375,4.570313,-4.104687,3.544688,4.125,-4.615,-0.147812,5.625,-0.3925,1.034141,5.179688,-0.895391,2.735,4.875,-1.619062,4.262891,4.570313,-2.26914,4.925938,4.125,-2.55125,-0.070312,5.625,0,1.210938,5.179688,0,3.054688,4.875,0,4.710938,4.570313,0,5.429688,4.125,0],
      "normals" : [-0.966742,-0.255752,0,-0.893014,-0.256345,-0.369882,-0.893437,0.255996,-0.369102,-0.966824,0.255443,0,-0.083877,0.995843,-0.035507,-0.092052,0.995754,0,0.629724,0.73186,0.260439,0.68205,0.731305,0,0.803725,0.49337,0.332584,0.870301,0.492521,0,-0.683407,-0.256728,-0.683407,-0.683531,0.256068,-0.683531,-0.064925,0.995776,-0.064925,0.481399,0.732469,0.481399,0.614804,0.493997,0.614804,-0.369882,-0.256345,-0.893014,-0.369102,0.255996,-0.893437,-0.035507,0.995843,-0.083877,0.260439,0.73186,0.629724,0.332584,0.493369,0.803725,-0.002848,-0.257863,-0.966177,-0.001923,0.254736,-0.967009,-0.000266,0.995734,-0.09227,0.000024,0.731295,0.682061,0,0.492521,0.870301,-0.002848,-0.257863,-0.966177,0.379058,-0.3593,-0.852771,0.37711,0.149085,-0.914091,-0.001923,0.254736,-0.967009,0.027502,0.992081,-0.122552,-0.000266,0.995734,-0.09227,-0.26101,0.726762,0.635367,0.000024,0.731295,0.682061,-0.332485,0.492546,0.804271,0,0.492521,0.870301,0.663548,-0.41079,-0.625264,0.712664,0.073722,-0.697621,0.099726,0.987509,-0.121983,-0.48732,0.723754,0.488569,-0.615242,0.492602,0.615484,0.880028,-0.332906,-0.338709,0.917276,0.167113,-0.361493,0.113584,0.992365,-0.04807,-0.63415,0.727508,0.261889,-0.804126,0.492634,0.332705,0.96669,-0.255738,0.010454,0.967442,0.252962,0.008103,0.093436,0.995624,0.001281,-0.682167,0.731196,-0.000343,-0.870322,0.492483,-0.000054,0.96669,-0.255738,0.010454,0.893014,-0.256345,0.369882,0.893437,0.255996,0.369102,0.967442,0.252962,0.008103,0.083877,0.995843,0.035507,0.093436,0.995624,0.001281,-0.629724,0.73186,-0.260439,-0.682167,0.731196,-0.000343,-0.803725,0.49337,-0.332584,-0.870322,0.492483,-0.000054,0.683407,-0.256728,0.683407,0.683531,0.256068,0.683531,0.064925,0.995776,0.064925,-0.481399,0.732469,-0.481399,-0.614804,0.493997,-0.614804,0.369882,-0.256345,0.893014,0.369102,0.255996,0.893437,0.035507,0.995843,0.083877,-0.260439,0.73186,-0.629724,-0.332584,0.493369,-0.803725,0,-0.255752,0.966742,0,0.255443,0.966824,0,0.995754,0.092052,0,0.731305,-0.68205,0,0.492521,-0.870301,0,-0.255752,0.966742,-0.369882,-0.256345,0.893014,-0.369102,0.255996,0.893437,0,0.255443,0.966824,-0.035507,0.995843,0.083877,0,0.995754,0.092052,0.260439,0.73186,-0.629724,0,0.731305,-0.68205,0.332584,0.49337,-0.803725,0,0.492521,-0.870301,-0.683407,-0.256728,0.683407,-0.683531,0.256068,0.683531,-0.064925,0.995776,0.064925,0.481399,0.732469,-0.481399,0.614804,0.493997,-0.614804,-0.893014,-0.256345,0.369882,-0.893437,0.255996,0.369102,-0.083877,0.995843,0.035507,0.629724,0.73186,-0.260439,0.803725,0.493369,-0.332584,-0.966742,-0.255752,0,-0.966824,0.255443,0,-0.092052,0.995754,0,0.68205,0.731305,0,0.870301,0.492521,0,0.870301,0.492521,0,0.803725,0.49337,0.332584,0.845438,0.403546,0.349835,0.915321,0.402725,0,0.869996,0.336859,0.360047,0.941808,0.336151,0,0.904193,0.205791,0.37428,0.97869,0.205342,0,0.921879,-0.06637,0.381752,0.997804,-0.06624,0,0.614804,0.493997,0.614804,0.646802,0.404096,0.646802,0.665655,0.337351,0.665655,0.691923,0.20612,0.691923,0.705543,-0.06648,0.705542,0.332584,0.493369,0.803725,0.349835,0.403546,0.845438,0.360047,0.336859,0.869996,0.37428,0.205791,0.904193,0.381752,-0.066369,0.921879,0,0.492521,0.870301,0,0.402725,0.915321,0,0.336151,0.941808,0,0.205342,0.97869,0,-0.06624,0.997804,0,0.492521,0.870301,-0.332485,0.492546,0.804271,-0.349835,0.403546,0.845438,0,0.402725,0.915321,-0.360047,0.336859,0.869996,0,0.336151,0.941808,-0.37428,0.205791,0.904193,0,0.205342,0.97869,-0.381752,-0.06637,0.921879,0,-0.06624,0.997804,-0.615242,0.492602,0.615484,-0.646802,0.404096,0.646802,-0.665655,0.337351,0.665655,-0.691923,0.20612,0.691923,-0.705542,-0.06648,0.705543,-0.804126,0.492634,0.332705,-0.845438,0.403546,0.349835,-0.869996,0.336859,0.360047,-0.904193,0.205791,0.37428,-0.921879,-0.066369,0.381752,-0.870322,0.492483,-0.000054,-0.915321,0.402725,0,-0.941808,0.336151,0,-0.97869,0.205342,0,-0.997804,-0.06624,0,-0.870322,0.492483,-0.000054,-0.803725,0.49337,-0.332584,-0.845438,0.403546,-0.349835,-0.915321,0.402725,0,-0.869996,0.336859,-0.360047,-0.941808,0.336151,0,-0.904193,0.205791,-0.37428,-0.97869,0.205342,0,-0.921879,-0.06637,-0.381752,-0.997804,-0.06624,0,-0.614804,0.493997,-0.614804,-0.646802,0.404096,-0.646802,-0.665655,0.337351,-0.665655,-0.691923,0.20612,-0.691923,-0.705543,-0.06648,-0.705542,-0.332584,0.493369,-0.803725,-0.349835,0.403546,-0.845438,-0.360047,0.336859,-0.869996,-0.37428,0.205791,-0.904193,-0.381752,-0.066369,-0.921879,0,0.492521,-0.870301,0,0.402725,-0.915321,0,0.336151,-0.941808,0,0.205342,-0.97869,0,-0.06624,-0.997804,0,0.492521,-0.870301,0.332584,0.49337,-0.803725,0.349835,0.403546,-0.845438,0,0.402725,-0.915321,0.360047,0.336859,-0.869996,0,0.336151,-0.941808,0.37428,0.205791,-0.904193,0,0.205342,-0.97869,0.381752,-0.06637,-0.921879,0,-0.06624,-0.997804,0.614804,0.493997,-0.614804,0.646802,0.404096,-0.646802,0.665655,0.337351,-0.665655,0.691923,0.20612,-0.691923,0.705542,-0.06648,-0.705543,0.803725,0.493369,-0.332584,0.845438,0.403546,-0.349835,0.869996,0.336859,-0.360047,0.904193,0.205791,-0.37428,0.921879,-0.066369,-0.381752,0.870301,0.492521,0,0.915321,0.402725,0,0.941808,0.336151,0,0.97869,0.205342,0,0.997804,-0.06624,0,0.997804,-0.06624,0,0.921879,-0.06637,0.381752,0.831437,-0.43618,0.344179,0.900182,-0.435513,0,0.673512,-0.684666,0.278594,0.729611,-0.683863,0,0.640399,-0.720924,0.264874,0.693951,-0.720022,0,0.732949,-0.608995,0.303167,0.79395,-0.607983,0,0.705543,-0.06648,0.705542,0.636092,-0.436778,0.636092,0.514965,-0.68529,0.514965,0.489651,-0.721446,0.489651,0.560555,-0.609554,0.560555,0.381752,-0.066369,0.921879,0.344179,-0.43618,0.831437,0.278595,-0.684666,0.673512,0.264874,-0.720924,0.640399,0.303167,-0.608995,0.732949,0,-0.06624,0.997804,0,-0.435513,0.900182,0,-0.683863,0.729611,0,-0.720022,0.693951,0,-0.607983,0.79395,0,-0.06624,0.997804,-0.381752,-0.06637,0.921879,-0.344179,-0.43618,0.831437,0,-0.435513,0.900182,-0.278594,-0.684666,0.673512,0,-0.683863,0.729611,-0.264874,-0.720924,0.640399,0,-0.720022,0.693951,-0.303167,-0.608995,0.732949,0,-0.607983,0.79395,-0.705542,-0.06648,0.705543,-0.636092,-0.436778,0.636092,-0.514965,-0.68529,0.514965,-0.489651,-0.721446,0.489651,-0.560555,-0.609554,0.560555,-0.921879,-0.066369,0.381752,-0.831437,-0.43618,0.344179,-0.673512,-0.684666,0.278595,-0.640399,-0.720924,0.264874,-0.732949,-0.608995,0.303167,-0.997804,-0.06624,0,-0.900182,-0.435513,0,-0.729611,-0.683863,0,-0.693951,-0.720022,0,-0.79395,-0.607983,0,-0.997804,-0.06624,0,-0.921879,-0.06637,-0.381752,-0.831437,-0.43618,-0.344179,-0.900182,-0.435513,0,-0.673512,-0.684666,-0.278594,-0.729611,-0.683863,0,-0.640399,-0.720924,-0.264874,-0.693951,-0.720022,0,-0.732949,-0.608995,-0.303167,-0.79395,-0.607983,0,-0.705543,-0.06648,-0.705542,-0.636092,-0.436778,-0.636092,-0.514965,-0.68529,-0.514965,-0.489651,-0.721446,-0.489651,-0.560555,-0.609554,-0.560555,-0.381752,-0.066369,-0.921879,-0.344179,-0.43618,-0.831437,-0.278595,-0.684666,-0.673512,-0.264874,-0.720924,-0.640399,-0.303167,-0.608995,-0.732949,0,-0.06624,-0.997804,0,-0.435513,-0.900182,0,-0.683863,-0.729611,0,-0.720022,-0.693951,0,-0.607983,-0.79395,0,-0.06624,-0.997804,0.381752,-0.06637,-0.921879,0.344179,-0.43618,-0.831437,0,-0.435513,-0.900182,0.278594,-0.684666,-0.673512,0,-0.683863,-0.729611,0.264874,-0.720924,-0.640399,0,-0.720022,-0.693951,0.303167,-0.608995,-0.732949,0,-0.607983,-0.79395,0.705542,-0.06648,-0.705543,0.636092,-0.436778,-0.636092,0.514965,-0.68529,-0.514965,0.489651,-0.721446,-0.489651,0.560555,-0.609554,-0.560555,0.921879,-0.066369,-0.381752,0.831437,-0.43618,-0.344179,0.673512,-0.684666,-0.278595,0.640399,-0.720924,-0.264874,0.732949,-0.608995,-0.303167,0.997804,-0.06624,0,0.900182,-0.435513,0,0.729611,-0.683863,0,0.693951,-0.720022,0,0.79395,-0.607983,0,0.79395,-0.607983,0,0.732949,-0.608995,0.303167,0.57623,-0.781801,0.238217,0.62386,-0.781536,0,0.163628,-0.984208,0.067527,0.177291,-0.984159,0,0.045422,-0.998792,0.018736,0.049207,-0.998789,0,0,-1,0,0.560555,-0.609554,0.560555,0.440416,-0.782348,0.440416,0.124903,-0.984276,0.124903,0.034662,-0.998798,0.034662,0,-1,0,0.303167,-0.608995,0.732949,0.238217,-0.781801,0.57623,0.067527,-0.984208,0.163628,0.018736,-0.998792,0.045422,0,-1,0,0,-0.607983,0.79395,0,-0.781536,0.62386,0,-0.984159,0.177291,0,-0.998789,0.049207,0,-1,0,0,-0.607983,0.79395,-0.303167,-0.608995,0.732949,-0.238217,-0.781801,0.57623,0,-0.781536,0.62386,-0.067527,-0.984208,0.163628,0,-0.984159,0.177291,-0.018736,-0.998792,0.045422,0,-0.998789,0.049207,0,-1,0,-0.560555,-0.609554,0.560555,-0.440416,-0.782348,0.440416,-0.124903,-0.984276,0.124903,-0.034662,-0.998798,0.034662,0,-1,0,-0.732949,-0.608995,0.303167,-0.57623,-0.781801,0.238217,-0.163628,-0.984208,0.067527,-0.045422,-0.998792,0.018736,0,-1,0,-0.79395,-0.607983,0,-0.62386,-0.781536,0,-0.177291,-0.984159,0,-0.049207,-0.998789,0,0,-1,0,-0.79395,-0.607983,0,-0.732949,-0.608995,-0.303167,-0.57623,-0.781801,-0.238217,-0.62386,-0.781536,0,-0.163628,-0.984208,-0.067527,-0.177291,-0.984159,0,-0.045422,-0.998792,-0.018736,-0.049207,-0.998789,0,0,-1,0,-0.560555,-0.609554,-0.560555,-0.440416,-0.782348,-0.440416,-0.124903,-0.984276,-0.124903,-0.034662,-0.998798,-0.034662,0,-1,0,-0.303167,-0.608995,-0.732949,-0.238217,-0.781801,-0.57623,-0.067527,-0.984208,-0.163628,-0.018736,-0.998792,-0.045422,0,-1,0,0,-0.607983,-0.79395,0,-0.781536,-0.62386,0,-0.984159,-0.177291,0,-0.998789,-0.049207,0,-1,0,0,-0.607983,-0.79395,0.303167,-0.608995,-0.732949,0.238217,-0.781801,-0.57623,0,-0.781536,-0.62386,0.067527,-0.984208,-0.163628,0,-0.984159,-0.177291,0.018736,-0.998792,-0.045422,0,-0.998789,-0.049207,0,-1,0,0.560555,-0.609554,-0.560555,0.440416,-0.782348,-0.440416,0.124903,-0.984276,-0.124903,0.034662,-0.998798,-0.034662,0,-1,0,0.732949,-0.608995,-0.303167,0.57623,-0.781801,-0.238217,0.163628,-0.984208,-0.067527,0.045422,-0.998792,-0.018736,0,-1,0,0.79395,-0.607983,0,0.62386,-0.781536,0,0.177291,-0.984159,0,0.049207,-0.998789,0,0,-1,0,0.007786,-0.99997,-0.000216,0.007039,-0.812495,0.582926,0.036127,-0.837257,0.545614,0.039138,-0.999233,-0.000989,0.161846,-0.810421,0.563048,0.179512,-0.983746,-0.004369,0.482365,-0.595148,0.642746,0.612299,-0.790557,-0.01046,0.73872,-0.114594,0.664199,0.986152,-0.165708,-0.00667,-0.001909,0.162121,0.986769,0.002762,0.017107,0.99985,0.010533,0.073398,0.997247,-0.066041,0.13007,0.989303,-0.094427,0.016594,0.995393,-0.009203,0.871509,0.490293,-0.048606,0.840609,0.539457,-0.223298,0.80288,0.552739,-0.596365,0.559971,0.575135,-0.803337,0.068236,0.591603,-0.010561,0.999944,0.000103,-0.058798,0.99827,0.00071,-0.28071,0.959787,0.003269,-0.749723,0.661738,0.004268,-0.997351,0.072714,0.002059,-0.010561,0.999944,0.000103,-0.008792,0.871493,-0.49033,-0.046494,0.841178,-0.538756,-0.058798,0.99827,0.00071,-0.217909,0.806807,-0.549161,-0.28071,0.959787,0.003269,-0.597291,0.560026,-0.574121,-0.749723,0.661738,0.004268,-0.804,0.062913,-0.591292,-0.997351,0.072714,0.002059,-0.001806,0.161691,-0.98684,0.002031,0.014555,-0.999892,0.009215,0.060069,-0.998152,-0.059334,0.113865,-0.991723,-0.086899,0.01229,-0.996141,0.006418,-0.812379,-0.583095,0.033783,-0.837512,-0.545373,0.157113,-0.811947,-0.56219,0.484406,-0.589366,-0.646528,0.73887,-0.10132,-0.666187,0.007786,-0.99997,-0.000216,0.039138,-0.999233,-0.000989,0.179512,-0.983746,-0.004369,0.612299,-0.790557,-0.01046,0.986152,-0.165708,-0.00667,0.986152,-0.165708,-0.00667,0.73872,-0.114594,0.664199,0.725608,0.259351,0.637361,0.946512,0.32265,-0.003357,0.645945,0.461988,0.607719,0.82583,0.56387,-0.007452,0.531615,0.63666,0.558614,0.650011,0.759893,-0.006937,0.424964,0.681717,0.59554,0.532429,0.846459,-0.005245,-0.094427,0.016594,0.995393,-0.049562,-0.019755,0.998576,-0.037816,-0.035624,0.99865,-0.037914,-0.036512,0.998614,-0.168854,-0.297945,0.93953,-0.803337,0.068236,0.591603,-0.742342,-0.299166,0.599523,-0.619602,-0.529406,0.579502,-0.483708,-0.68576,0.543837,-0.445293,-0.794355,0.413177,-0.997351,0.072714,0.002059,-0.926513,-0.376258,0.001996,-0.75392,-0.656952,0.004317,-0.566224,-0.824244,0.003461,-0.481804,-0.876277,0.00185,-0.997351,0.072714,0.002059,-0.804,0.062913,-0.591292,-0.744675,-0.294425,-0.598977,-0.926513,-0.376258,0.001996,-0.621949,-0.528114,-0.578165,-0.75392,-0.656952,0.004317,-0.481171,-0.68834,-0.542828,-0.566224,-0.824244,0.003461,-0.438055,-0.797035,-0.415744,-0.481804,-0.876277,0.00185,-0.086899,0.01229,-0.996141,-0.044337,-0.017056,-0.998871,-0.026176,-0.028166,-0.99926,-0.025294,-0.028332,-0.999278,-0.157482,-0.289392,-0.944167,0.73887,-0.10132,-0.666187,0.728244,0.25241,-0.637142,0.647055,0.459725,-0.608254,0.522994,0.640657,-0.56217,0.409978,0.682857,-0.604669,0.986152,-0.165708,-0.00667,0.946512,0.32265,-0.003357,0.82583,0.56387,-0.007452,0.650011,0.759893,-0.006937,0.532429,0.846459,-0.005245,-0.230787,0.972982,-0.006523,-0.152877,0.687211,0.71019,-0.316721,0.63775,0.702113,-0.548936,0.835863,-0.001511,-0.601067,0.471452,0.64533,-0.875671,0.482806,0.009893,-0.635889,0.44609,0.629801,-0.877554,0.479097,0.019092,-0.435746,0.601008,0.670011,-0.69619,0.717439,0.024497,0.111113,-0.08507,0.99016,0.22331,0.00654,0.974726,0.190097,0.154964,0.969458,0.005271,0.189482,0.98187,-0.011752,0.246688,0.969024,0.343906,-0.722796,0.599412,0.572489,-0.567656,0.591627,0.787436,-0.256459,0.560512,0.647097,-0.306374,0.698141,0.427528,-0.499343,0.753576,0.410926,-0.911668,0.001284,0.67152,-0.740986,-0.000899,0.922026,-0.38706,-0.007253,0.84691,-0.531556,-0.013854,0.535924,-0.844201,-0.010505,0.410926,-0.911668,0.001284,0.341188,-0.722823,-0.600931,0.578664,-0.561139,-0.591838,0.67152,-0.740986,-0.000899,0.784869,-0.25102,-0.566542,0.922026,-0.38706,-0.007253,0.642681,-0.302257,-0.70399,0.84691,-0.531556,-0.013854,0.418589,-0.500042,-0.758117,0.535924,-0.844201,-0.010505,0.115806,-0.079139,-0.990114,0.232811,0.012565,-0.972441,0.206662,0.153601,-0.96628,0.0245,0.161443,-0.986578,0.003382,0.211115,-0.977455,-0.134912,0.687491,-0.713551,-0.31954,0.633073,-0.705063,-0.603902,0.461442,-0.649903,-0.631815,0.437169,-0.640072,-0.424306,0.612706,-0.66675,-0.230787,0.972982,-0.006523,-0.548936,0.835863,-0.001511,-0.875671,0.482806,0.009893,-0.877554,0.479097,0.019092,-0.69619,0.717439,0.024497,-0.69619,0.717439,0.024497,-0.435746,0.601008,0.670011,-0.259858,0.791937,0.552548,-0.425801,0.904753,0.010805,0.009539,0.99972,-0.021674,0.022046,0.999756,0.001623,0.410157,0.332912,-0.849082,0.999598,0.025875,0.011556,0.541523,-0.548619,-0.637001,0.709587,-0.704552,0.009672,-0.011752,0.246688,0.969024,0.046311,0.455223,0.889172,-0.010688,0.988794,0.1489,-0.044376,0.682946,-0.72912,0.122824,0.009233,-0.992385,0.427528,-0.499343,0.753576,0.481839,-0.18044,0.85748,0.455272,0.736752,0.499925,-0.220542,0.907193,-0.358277,-0.235919,0.65725,-0.715797,0.535924,-0.844201,-0.010505,0.728094,-0.6853,-0.015585,0.888738,0.458112,-0.016679,-0.260098,0.965582,0.0008,-0.371611,0.928378,-0.004418,0.535924,-0.844201,-0.010505,0.418589,-0.500042,-0.758117,0.480165,-0.178362,-0.858853,0.728094,-0.6853,-0.015585,0.488102,0.716802,-0.497947,0.888738,0.458112,-0.016679,-0.222004,0.905399,0.361892,-0.260098,0.965582,0.0008,-0.235405,0.66318,0.710477,-0.371611,0.928378,-0.004418,0.003382,0.211115,-0.977455,0.05872,0.437702,-0.8972,0.001326,0.986459,-0.164002,-0.04419,0.681675,0.730319,0.138801,-0.034188,0.98973,-0.424306,0.612706,-0.66675,-0.25889,0.797206,-0.54538,0.01227,0.999739,0.019287,0.398632,0.35489,0.845663,0.537564,-0.581398,0.610738,-0.69619,0.717439,0.024497,-0.425801,0.904753,0.010805,0.022046,0.999756,0.001623,0.999598,0.025875,0.011556,0.709587,-0.704552,0.009672,0.76264,0.565035,0.314825,0.82454,0.565804,0.000017,0,1,0,0.847982,-0.397998,0.350034,0.917701,-0.397272,0.000034,0.864141,-0.355261,0.356441,0.935269,-0.353939,0.000113,0.720992,0.625625,0.297933,0.780712,0.62489,0.000075,0.583357,0.565165,0.583338,0,1,0,0.648485,-0.398726,0.648448,0.660872,-0.355894,0.660748,0.551862,0.62529,0.55178,0.314824,0.565051,0.762629,0,1,0,0.350045,-0.397976,0.847988,0.356474,-0.355199,0.864153,0.297983,0.625515,0.721067,-0.000017,0.565804,0.82454,0,1,0,-0.000034,-0.397272,0.917701,-0.000113,-0.353939,0.935269,-0.000075,0.62489,0.780712,-0.314825,0.565035,0.76264,-0.000017,0.565804,0.82454,0,1,0,-0.350034,-0.397998,0.847982,-0.000034,-0.397272,0.917701,-0.356441,-0.355261,0.864141,-0.000113,-0.353939,0.935269,-0.297933,0.625625,0.720992,-0.000075,0.62489,0.780712,-0.583338,0.565165,0.583357,0,1,0,-0.648448,-0.398726,0.648485,-0.660748,-0.355894,0.660872,-0.55178,0.62529,0.551862,-0.762629,0.565051,0.314824,0,1,0,-0.847988,-0.397976,0.350045,-0.864153,-0.355199,0.356474,-0.721067,0.625515,0.297983,-0.82454,0.565804,-0.000017,0,1,0,-0.917701,-0.397272,-0.000034,-0.935269,-0.353939,-0.000113,-0.780712,0.62489,-0.000075,-0.76264,0.565035,-0.314825,-0.82454,0.565804,-0.000017,0,1,0,-0.847982,-0.397998,-0.350034,-0.917701,-0.397272,-0.000034,-0.864141,-0.355261,-0.356441,-0.935269,-0.353939,-0.000113,-0.720992,0.625625,-0.297933,-0.780712,0.62489,-0.000075,-0.583357,0.565165,-0.583338,0,1,0,-0.648485,-0.398726,-0.648448,-0.660872,-0.355894,-0.660748,-0.551862,0.62529,-0.55178,-0.314824,0.565051,-0.762629,0,1,0,-0.350045,-0.397976,-0.847988,-0.356474,-0.355199,-0.864153,-0.297983,0.625515,-0.721067,0.000017,0.565804,-0.82454,0,1,0,0.000034,-0.397272,-0.917701,0.000113,-0.353939,-0.935269,0.000075,0.62489,-0.780712,0.314825,0.565035,-0.76264,0.000017,0.565804,-0.82454,0,1,0,0.350034,-0.397998,-0.847982,0.000034,-0.397272,-0.917701,0.356441,-0.355261,-0.864141,0.000113,-0.353939,-0.935269,0.297933,0.625625,-0.720992,0.000075,0.62489,-0.780712,0.583338,0.565165,-0.583357,0,1,0,0.648448,-0.398726,-0.648485,0.660748,-0.355894,-0.660872,0.55178,0.62529,-0.551862,0.762629,0.565051,-0.314824,0,1,0,0.847988,-0.397976,-0.350045,0.864153,-0.355199,-0.356474,0.721067,0.625515,-0.297983,0.82454,0.565804,0.000017,0,1,0,0.917701,-0.397272,0.000034,0.935269,-0.353939,0.000113,0.780712,0.62489,0.000075,0.780712,0.62489,0.000075,0.720992,0.625625,0.297933,0.217978,0.971775,0.090216,0.236583,0.971611,0,0.159589,0.984977,0.065961,0.173084,0.984907,0,0.350498,0.925311,0.14474,0.379703,0.925108,0,0.48559,0.850653,0.201474,0.526673,0.850068,0,0.551862,0.62529,0.55178,0.166631,0.971838,0.166631,0.121908,0.985026,0.121908,0.267668,0.925585,0.267668,0.371315,0.851029,0.371315,0.297983,0.625515,0.721067,0.090216,0.971775,0.217978,0.065961,0.984977,0.159589,0.14474,0.925311,0.350498,0.201475,0.850653,0.48559,-0.000075,0.62489,0.780712,0,0.971611,0.236583,0,0.984907,0.173084,0,0.925108,0.379703,0,0.850068,0.526673,-0.000075,0.62489,0.780712,-0.297933,0.625625,0.720992,-0.090216,0.971775,0.217978,0,0.971611,0.236583,-0.065961,0.984977,0.159589,0,0.984907,0.173084,-0.14474,0.925311,0.350498,0,0.925108,0.379703,-0.201474,0.850653,0.48559,0,0.850068,0.526673,-0.55178,0.62529,0.551862,-0.166631,0.971838,0.166631,-0.121908,0.985026,0.121908,-0.267668,0.925585,0.267668,-0.371315,0.851029,0.371315,-0.721067,0.625515,0.297983,-0.217978,0.971775,0.090216,-0.159589,0.984977,0.065961,-0.350498,0.925311,0.14474,-0.48559,0.850653,0.201475,-0.780712,0.62489,-0.000075,-0.236583,0.971611,0,-0.173084,0.984907,0,-0.379703,0.925108,0,-0.526673,0.850068,0,-0.780712,0.62489,-0.000075,-0.720992,0.625625,-0.297933,-0.217978,0.971775,-0.090216,-0.236583,0.971611,0,-0.159589,0.984977,-0.065961,-0.173084,0.984907,0,-0.350498,0.925311,-0.14474,-0.379703,0.925108,0,-0.48559,0.850653,-0.201474,-0.526673,0.850068,0,-0.551862,0.62529,-0.55178,-0.166631,0.971838,-0.166631,-0.121908,0.985026,-0.121908,-0.267668,0.925585,-0.267668,-0.371315,0.851029,-0.371315,-0.297983,0.625515,-0.721067,-0.090216,0.971775,-0.217978,-0.065961,0.984977,-0.159589,-0.14474,0.925311,-0.350498,-0.201475,0.850653,-0.48559,0.000075,0.62489,-0.780712,0,0.971611,-0.236583,0,0.984907,-0.173084,0,0.925108,-0.379703,0,0.850068,-0.526673,0.000075,0.62489,-0.780712,0.297933,0.625625,-0.720992,0.090216,0.971775,-0.217978,0,0.971611,-0.236583,0.065961,0.984977,-0.159589,0,0.984907,-0.173084,0.14474,0.925311,-0.350498,0,0.925108,-0.379703,0.201474,0.850653,-0.48559,0,0.850068,-0.526673,0.55178,0.62529,-0.551862,0.166631,0.971838,-0.166631,0.121908,0.985026,-0.121908,0.267668,0.925585,-0.267668,0.371315,0.851029,-0.371315,0.721067,0.625515,-0.297983,0.217978,0.971775,-0.090216,0.159589,0.984977,-0.065961,0.350498,0.925311,-0.14474,0.48559,0.850653,-0.201475,0.780712,0.62489,0.000075,0.236583,0.971611,0,0.173084,0.984907,0,0.379703,0.925108,0,0.526673,0.850068,0],
      "textureCoords" : [2,2,1.75,2,1.75,1.975,2,1.975,1.75,1.95,2,1.95,1.75,1.925,2,1.925,1.75,1.9,2,1.9,1.5,2,1.5,1.975,1.5,1.95,1.5,1.925,1.5,1.9,1.25,2,1.25,1.975,1.25,1.95,1.25,1.925,1.25,1.9,1,2,1,1.975,1,1.95,1,1.925,1,1.9,1,2,0.75,2,0.75,1.975,1,1.975,0.75,1.95,1,1.95,0.75,1.925,1,1.925,0.75,1.9,1,1.9,0.5,2,0.5,1.975,0.5,1.95,0.5,1.925,0.5,1.9,0.25,2,0.25,1.975,0.25,1.95,0.25,1.925,0.25,1.9,0,2,0,1.975,0,1.95,0,1.925,0,1.9,2,2,1.75,2,1.75,1.975,2,1.975,1.75,1.95,2,1.95,1.75,1.925,2,1.925,1.75,1.9,2,1.9,1.5,2,1.5,1.975,1.5,1.95,1.5,1.925,1.5,1.9,1.25,2,1.25,1.975,1.25,1.95,1.25,1.925,1.25,1.9,1,2,1,1.975,1,1.95,1,1.925,1,1.9,1,2,0.75,2,0.75,1.975,1,1.975,0.75,1.95,1,1.95,0.75,1.925,1,1.925,0.75,1.9,1,1.9,0.5,2,0.5,1.975,0.5,1.95,0.5,1.925,0.5,1.9,0.25,2,0.25,1.975,0.25,1.95,0.25,1.925,0.25,1.9,0,2,0,1.975,0,1.95,0,1.925,0,1.9,2,1.9,1.75,1.9,1.75,1.675,2,1.675,1.75,1.45,2,1.45,1.75,1.225,2,1.225,1.75,1,2,1,1.5,1.9,1.5,1.675,1.5,1.45,1.5,1.225,1.5,1,1.25,1.9,1.25,1.675,1.25,1.45,1.25,1.225,1.25,1,1,1.9,1,1.675,1,1.45,1,1.225,1,1,1,1.9,0.75,1.9,0.75,1.675,1,1.675,0.75,1.45,1,1.45,0.75,1.225,1,1.225,0.75,1,1,1,0.5,1.9,0.5,1.675,0.5,1.45,0.5,1.225,0.5,1,0.25,1.9,0.25,1.675,0.25,1.45,0.25,1.225,0.25,1,0,1.9,0,1.675,0,1.45,0,1.225,0,1,2,1.9,1.75,1.9,1.75,1.675,2,1.675,1.75,1.45,2,1.45,1.75,1.225,2,1.225,1.75,1,2,1,1.5,1.9,1.5,1.675,1.5,1.45,1.5,1.225,1.5,1,1.25,1.9,1.25,1.675,1.25,1.45,1.25,1.225,1.25,1,1,1.9,1,1.675,1,1.45,1,1.225,1,1,1,1.9,0.75,1.9,0.75,1.675,1,1.675,0.75,1.45,1,1.45,0.75,1.225,1,1.225,0.75,1,1,1,0.5,1.9,0.5,1.675,0.5,1.45,0.5,1.225,0.5,1,0.25,1.9,0.25,1.675,0.25,1.45,0.25,1.225,0.25,1,0,1.9,0,1.675,0,1.45,0,1.225,0,1,2,1,1.75,1,1.75,0.85,2,0.85,1.75,0.7,2,0.7,1.75,0.55,2,0.55,1.75,0.4,2,0.4,1.5,1,1.5,0.85,1.5,0.7,1.5,0.55,1.5,0.4,1.25,1,1.25,0.85,1.25,0.7,1.25,0.55,1.25,0.4,1,1,1,0.85,1,0.7,1,0.55,1,0.4,1,1,0.75,1,0.75,0.85,1,0.85,0.75,0.7,1,0.7,0.75,0.55,1,0.55,0.75,0.4,1,0.4,0.5,1,0.5,0.85,0.5,0.7,0.5,0.55,0.5,0.4,0.25,1,0.25,0.85,0.25,0.7,0.25,0.55,0.25,0.4,0,1,0,0.85,0,0.7,0,0.55,0,0.4,2,1,1.75,1,1.75,0.85,2,0.85,1.75,0.7,2,0.7,1.75,0.55,2,0.55,1.75,0.4,2,0.4,1.5,1,1.5,0.85,1.5,0.7,1.5,0.55,1.5,0.4,1.25,1,1.25,0.85,1.25,0.7,1.25,0.55,1.25,0.4,1,1,1,0.85,1,0.7,1,0.55,1,0.4,1,1,0.75,1,0.75,0.85,1,0.85,0.75,0.7,1,0.7,0.75,0.55,1,0.55,0.75,0.4,1,0.4,0.5,1,0.5,0.85,0.5,0.7,0.5,0.55,0.5,0.4,0.25,1,0.25,0.85,0.25,0.7,0.25,0.55,0.25,0.4,0,1,0,0.85,0,0.7,0,0.55,0,0.4,2,0.4,1.75,0.4,1.75,0.3,2,0.3,1.75,0.2,2,0.2,1.75,0.1,2,0.1,1.75,0,1.5,0.4,1.5,0.3,1.5,0.2,1.5,0.1,1.5,0,1.25,0.4,1.25,0.3,1.25,0.2,1.25,0.1,1.25,0,1,0.4,1,0.3,1,0.2,1,0.1,1,0,1,0.4,0.75,0.4,0.75,0.3,1,0.3,0.75,0.2,1,0.2,0.75,0.1,1,0.1,0.75,0,0.5,0.4,0.5,0.3,0.5,0.2,0.5,0.1,0.5,0,0.25,0.4,0.25,0.3,0.25,0.2,0.25,0.1,0.25,0,0,0.4,0,0.3,0,0.2,0,0.1,0,0,2,0.4,1.75,0.4,1.75,0.3,2,0.3,1.75,0.2,2,0.2,1.75,0.1,2,0.1,1.75,0,1.5,0.4,1.5,0.3,1.5,0.2,1.5,0.1,1.5,0,1.25,0.4,1.25,0.3,1.25,0.2,1.25,0.1,1.25,0,1,0.4,1,0.3,1,0.2,1,0.1,1,0,1,0.4,0.75,0.4,0.75,0.3,1,0.3,0.75,0.2,1,0.2,0.75,0.1,1,0.1,0.75,0,0.5,0.4,0.5,0.3,0.5,0.2,0.5,0.1,0.5,0,0.25,0.4,0.25,0.3,0.25,0.2,0.25,0.1,0.25,0,0,0.4,0,0.3,0,0.2,0,0.1,0,0,1,1,0.875,1,0.875,0.875,1,0.875,0.875,0.75,1,0.75,0.875,0.625,1,0.625,0.875,0.5,1,0.5,0.75,1,0.75,0.875,0.75,0.75,0.75,0.625,0.75,0.5,0.625,1,0.625,0.875,0.625,0.75,0.625,0.625,0.625,0.5,0.5,1,0.5,0.875,0.5,0.75,0.5,0.625,0.5,0.5,0.5,1,0.375,1,0.375,0.875,0.5,0.875,0.375,0.75,0.5,0.75,0.375,0.625,0.5,0.625,0.375,0.5,0.5,0.5,0.25,1,0.25,0.875,0.25,0.75,0.25,0.625,0.25,0.5,0.125,1,0.125,0.875,0.125,0.75,0.125,0.625,0.125,0.5,0,1,0,0.875,0,0.75,0,0.625,0,0.5,1,0.5,0.875,0.5,0.875,0.375,1,0.375,0.875,0.25,1,0.25,0.875,0.125,1,0.125,0.875,0,1,0,0.75,0.5,0.75,0.375,0.75,0.25,0.75,0.125,0.75,0,0.625,0.5,0.625,0.375,0.625,0.25,0.625,0.125,0.625,0,0.5,0.5,0.5,0.375,0.5,0.25,0.5,0.125,0.5,0,0.5,0.5,0.375,0.5,0.375,0.375,0.5,0.375,0.375,0.25,0.5,0.25,0.375,0.125,0.5,0.125,0.375,0,0.5,0,0.25,0.5,0.25,0.375,0.25,0.25,0.25,0.125,0.25,0,0.125,0.5,0.125,0.375,0.125,0.25,0.125,0.125,0.125,0,0,0.5,0,0.375,0,0.25,0,0.125,0,0,0.5,0,0.625,0,0.625,0.225,0.5,0.225,0.625,0.45,0.5,0.45,0.625,0.675,0.5,0.675,0.625,0.9,0.5,0.9,0.75,0,0.75,0.225,0.75,0.45,0.75,0.675,0.75,0.9,0.875,0,0.875,0.225,0.875,0.45,0.875,0.675,0.875,0.9,1,0,1,0.225,1,0.45,1,0.675,1,0.9,0,0,0.125,0,0.125,0.225,0,0.225,0.125,0.45,0,0.45,0.125,0.675,0,0.675,0.125,0.9,0,0.9,0.25,0,0.25,0.225,0.25,0.45,0.25,0.675,0.25,0.9,0.375,0,0.375,0.225,0.375,0.45,0.375,0.675,0.375,0.9,0.5,0,0.5,0.225,0.5,0.45,0.5,0.675,0.5,0.9,0.5,0.9,0.625,0.9,0.625,0.925,0.5,0.925,0.625,0.95,0.5,0.95,0.625,0.975,0.5,0.975,0.625,1,0.5,1,0.75,0.9,0.75,0.925,0.75,0.95,0.75,0.975,0.75,1,0.875,0.9,0.875,0.925,0.875,0.95,0.875,0.975,0.875,1,1,0.9,1,0.925,1,0.95,1,0.975,1,1,0,0.9,0.125,0.9,0.125,0.925,0,0.925,0.125,0.95,0,0.95,0.125,0.975,0,0.975,0.125,1,0,1,0.25,0.9,0.25,0.925,0.25,0.95,0.25,0.975,0.25,1,0.375,0.9,0.375,0.925,0.375,0.95,0.375,0.975,0.375,1,0.5,0.9,0.5,0.925,0.5,0.95,0.5,0.975,0.5,1,0.875,0.75,1,0.75,1,1,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,0.75,0.875,1,0.75,0.5,0.75,0.25,0.75,0,0.625,0.75,0.75,1,0.625,0.5,0.625,0.25,0.625,0,0.5,0.75,0.625,1,0.5,0.5,0.5,0.25,0.5,0,0.375,0.75,0.5,0.75,0.5,1,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,0.75,0.375,1,0.25,0.5,0.25,0.25,0.25,0,0.125,0.75,0.25,1,0.125,0.5,0.125,0.25,0.125,0,0,0.75,0.125,1,0,0.5,0,0.25,0,0,0.875,0.75,1,0.75,1,1,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,0.75,0.875,1,0.75,0.5,0.75,0.25,0.75,0,0.625,0.75,0.75,1,0.625,0.5,0.625,0.25,0.625,0,0.5,0.75,0.625,1,0.5,0.5,0.5,0.25,0.5,0,0.375,0.75,0.5,0.75,0.5,1,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,0.75,0.375,1,0.25,0.5,0.25,0.25,0.25,0,0.125,0.75,0.25,1,0.125,0.5,0.125,0.25,0.125,0,0,0.75,0.125,1,0,0.5,0,0.25,0,0,1,1,0.875,1,0.875,0.75,1,0.75,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,1,0.75,0.75,0.75,0.5,0.75,0.25,0.75,0,0.625,1,0.625,0.75,0.625,0.5,0.625,0.25,0.625,0,0.5,1,0.5,0.75,0.5,0.5,0.5,0.25,0.5,0,0.5,1,0.375,1,0.375,0.75,0.5,0.75,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,1,0.25,0.75,0.25,0.5,0.25,0.25,0.25,0,0.125,1,0.125,0.75,0.125,0.5,0.125,0.25,0.125,0,0,1,0,0.75,0,0.5,0,0.25,0,0,1,1,0.875,1,0.875,0.75,1,0.75,0.875,0.5,1,0.5,0.875,0.25,1,0.25,0.875,0,1,0,0.75,1,0.75,0.75,0.75,0.5,0.75,0.25,0.75,0,0.625,1,0.625,0.75,0.625,0.5,0.625,0.25,0.625,0,0.5,1,0.5,0.75,0.5,0.5,0.5,0.25,0.5,0,0.5,1,0.375,1,0.375,0.75,0.5,0.75,0.375,0.5,0.5,0.5,0.375,0.25,0.5,0.25,0.375,0,0.5,0,0.25,1,0.25,0.75,0.25,0.5,0.25,0.25,0.25,0,0.125,1,0.125,0.75,0.125,0.5,0.125,0.25,0.125,0,0,1,0,0.75,0,0.5,0,0.25,0,0],
      "indices" : [0,1,2,2,3,0,3,2,4,4,5,3,5,4,6,6,7,5,7,6,8,8,9,7,1,10,11,11,2,1,2,11,12,12,4,2,4,12,13,13,6,4,6,13,14,14,8,6,10,15,16,16,11,10,11,16,17,17,12,11,12,17,18,18,13,12,13,18,19,19,14,13,15,20,21,21,16,15,16,21,22,22,17,16,17,22,23,23,18,17,18,23,24,24,19,18,25,26,27,27,28,25,28,27,29,29,30,28,30,29,31,31,32,30,32,31,33,33,34,32,26,35,36,36,27,26,27,36,37,37,29,27,29,37,38,38,31,29,31,38,39,39,33,31,35,40,41,41,36,35,36,41,42,42,37,36,37,42,43,43,38,37,38,43,44,44,39,38,40,45,46,46,41,40,41,46,47,47,42,41,42,47,48,48,43,42,43,48,49,49,44,43,50,51,52,52,53,50,53,52,54,54,55,53,55,54,56,56,57,55,57,56,58,58,59,57,51,60,61,61,52,51,52,61,62,62,54,52,54,62,63,63,56,54,56,63,64,64,58,56,60,65,66,66,61,60,61,66,67,67,62,61,62,67,68,68,63,62,63,68,69,69,64,63,65,70,71,71,66,65,66,71,72,72,67,66,67,72,73,73,68,67,68,73,74,74,69,68,75,76,77,77,78,75,78,77,79,79,80,78,80,79,81,81,82,80,82,81,83,83,84,82,76,85,86,86,77,76,77,86,87,87,79,77,79,87,88,88,81,79,81,88,89,89,83,81,85,90,91,91,86,85,86,91,92,92,87,86,87,92,93,93,88,87,88,93,94,94,89,88,90,95,96,96,91,90,91,96,97,97,92,91,92,97,98,98,93,92,93,98,99,99,94,93,100,101,102,102,103,100,103,102,104,104,105,103,105,104,106,106,107,105,107,106,108,108,109,107,101,110,111,111,102,101,102,111,112,112,104,102,104,112,113,113,106,104,106,113,114,114,108,106,110,115,116,116,111,110,111,116,117,117,112,111,112,117,118,118,113,112,113,118,119,119,114,113,115,120,121,121,116,115,116,121,122,122,117,116,117,122,123,123,118,117,118,123,124,124,119,118,125,126,127,127,128,125,128,127,129,129,130,128,130,129,131,131,132,130,132,131,133,133,134,132,126,135,136,136,127,126,127,136,137,137,129,127,129,137,138,138,131,129,131,138,139,139,133,131,135,140,141,141,136,135,136,141,142,142,137,136,137,142,143,143,138,137,138,143,144,144,139,138,140,145,146,146,141,140,141,146,147,147,142,141,142,147,148,148,143,142,143,148,149,149,144,143,150,151,152,152,153,150,153,152,154,154,155,153,155,154,156,156,157,155,157,156,158,158,159,157,151,160,161,161,152,151,152,161,162,162,154,152,154,162,163,163,156,154,156,163,164,164,158,156,160,165,166,166,161,160,161,166,167,167,162,161,162,167,168,168,163,162,163,168,169,169,164,163,165,170,171,171,166,165,166,171,172,172,167,166,167,172,173,173,168,167,168,173,174,174,169,168,175,176,177,177,178,175,178,177,179,179,180,178,180,179,181,181,182,180,182,181,183,183,184,182,176,185,186,186,177,176,177,186,187,187,179,177,179,187,188,188,181,179,181,188,189,189,183,181,185,190,191,191,186,185,186,191,192,192,187,186,187,192,193,193,188,187,188,193,194,194,189,188,190,195,196,196,191,190,191,196,197,197,192,191,192,197,198,198,193,192,193,198,199,199,194,193,200,201,202,202,203,200,203,202,204,204,205,203,205,204,206,206,207,205,207,206,208,208,209,207,201,210,211,211,202,201,202,211,212,212,204,202,204,212,213,213,206,204,206,213,214,214,208,206,210,215,216,216,211,210,211,216,217,217,212,211,212,217,218,218,213,212,213,218,219,219,214,213,215,220,221,221,216,215,216,221,222,222,217,216,217,222,223,223,218,217,218,223,224,224,219,218,225,226,227,227,228,225,228,227,229,229,230,228,230,229,231,231,232,230,232,231,233,233,234,232,226,235,236,236,227,226,227,236,237,237,229,227,229,237,238,238,231,229,231,238,239,239,233,231,235,240,241,241,236,235,236,241,242,242,237,236,237,242,243,243,238,237,238,243,244,244,239,238,240,245,246,246,241,240,241,246,247,247,242,241,242,247,248,248,243,242,243,248,249,249,244,243,250,251,252,252,253,250,253,252,254,254,255,253,255,254,256,256,257,255,257,256,258,258,259,257,251,260,261,261,252,251,252,261,262,262,254,252,254,262,263,263,256,254,256,263,264,264,258,256,260,265,266,266,261,260,261,266,267,267,262,261,262,267,268,268,263,262,263,268,269,269,264,263,265,270,271,271,266,265,266,271,272,272,267,266,267,272,273,273,268,267,268,273,274,274,269,268,275,276,277,277,278,275,278,277,279,279,280,278,280,279,281,281,282,280,282,281,283,283,284,282,276,285,286,286,277,276,277,286,287,287,279,277,279,287,288,288,281,279,281,288,289,289,283,281,285,290,291,291,286,285,286,291,292,292,287,286,287,292,293,293,288,287,288,293,294,294,289,288,290,295,296,296,291,290,291,296,297,297,292,291,292,297,298,298,293,292,293,298,299,299,294,293,300,301,302,302,303,300,303,302,304,304,305,303,305,304,306,306,307,305,307,306,308,301,309,310,310,302,301,302,310,311,311,304,302,304,311,312,312,306,304,306,312,313,309,314,315,315,310,309,310,315,316,316,311,310,311,316,317,317,312,311,312,317,318,314,319,320,320,315,314,315,320,321,321,316,315,316,321,322,322,317,316,317,322,323,324,325,326,326,327,324,327,326,328,328,329,327,329,328,330,330,331,329,331,330,332,325,333,334,334,326,325,326,334,335,335,328,326,328,335,336,336,330,328,330,336,337,333,338,339,339,334,333,334,339,340,340,335,334,335,340,341,341,336,335,336,341,342,338,343,344,344,339,338,339,344,345,345,340,339,340,345,346,346,341,340,341,346,347,348,349,350,350,351,348,351,350,352,352,353,351,353,352,354,354,355,353,355,354,356,349,357,358,358,350,349,350,358,359,359,352,350,352,359,360,360,354,352,354,360,361,357,362,363,363,358,357,358,363,364,364,359,358,359,364,365,365,360,359,360,365,366,362,367,368,368,363,362,363,368,369,369,364,363,364,369,370,370,365,364,365,370,371,372,373,374,374,375,372,375,374,376,376,377,375,377,376,378,378,379,377,379,378,380,373,381,382,382,374,373,374,382,383,383,376,374,376,383,384,384,378,376,378,384,385,381,386,387,387,382,381,382,387,388,388,383,382,383,388,389,389,384,383,384,389,390,386,391,392,392,387,386,387,392,393,393,388,387,388,393,394,394,389,388,389,394,395,396,397,398,398,399,396,399,398,400,400,401,399,401,400,402,402,403,401,403,402,404,404,405,403,397,406,407,407,398,397,398,407,408,408,400,398,400,408,409,409,402,400,402,409,410,410,404,402,406,411,412,412,407,406,407,412,413,413,408,407,408,413,414,414,409,408,409,414,415,415,410,409,411,416,417,417,412,411,412,417,418,418,413,412,413,418,419,419,414,413,414,419,420,420,415,414,421,422,423,423,424,421,424,423,425,425,426,424,426,425,427,427,428,426,428,427,429,429,430,428,422,431,432,432,423,422,423,432,433,433,425,423,425,433,434,434,427,425,427,434,435,435,429,427,431,436,437,437,432,431,432,437,438,438,433,432,433,438,439,439,434,433,434,439,440,440,435,434,436,441,442,442,437,436,437,442,443,443,438,437,438,443,444,444,439,438,439,444,445,445,440,439,446,447,448,448,449,446,449,448,450,450,451,449,451,450,452,452,453,451,453,452,454,454,455,453,447,456,457,457,448,447,448,457,458,458,450,448,450,458,459,459,452,450,452,459,460,460,454,452,456,461,462,462,457,456,457,462,463,463,458,457,458,463,464,464,459,458,459,464,465,465,460,459,461,466,467,467,462,461,462,467,468,468,463,462,463,468,469,469,464,463,464,469,470,470,465,464,471,472,473,473,474,471,474,473,475,475,476,474,476,475,477,477,478,476,478,477,479,479,480,478,472,481,482,482,473,472,473,482,483,483,475,473,475,483,484,484,477,475,477,484,485,485,479,477,481,486,487,487,482,481,482,487,488,488,483,482,483,488,489,489,484,483,484,489,490,490,485,484,486,491,492,492,487,486,487,492,493,493,488,487,488,493,494,494,489,488,489,494,495,495,490,489,496,497,498,498,499,496,499,498,500,500,501,499,501,500,502,502,503,501,503,502,504,504,505,503,497,506,507,507,498,497,498,507,508,508,500,498,500,508,509,509,502,500,502,509,510,510,504,502,506,511,512,512,507,506,507,512,513,513,508,507,508,513,514,514,509,508,509,514,515,515,510,509,511,516,517,517,512,511,512,517,518,518,513,512,513,518,519,519,514,513,514,519,520,520,515,514,521,522,523,523,524,521,524,523,525,525,526,524,526,525,527,527,528,526,528,527,529,529,530,528,522,531,532,532,523,522,523,532,533,533,525,523,525,533,534,534,527,525,527,534,535,535,529,527,531,536,537,537,532,531,532,537,538,538,533,532,533,538,539,539,534,533,534,539,540,540,535,534,536,541,542,542,537,536,537,542,543,543,538,537,538,543,544,544,539,538,539,544,545,545,540,539,546,547,548,548,549,546,549,548,550,550,551,549,551,550,552,552,553,551,553,552,554,554,555,553,547,556,557,557,548,547,548,557,558,558,550,548,550,558,559,559,552,550,552,559,560,560,554,552,556,561,562,562,557,556,557,562,563,563,558,557,558,563,564,564,559,558,559,564,565,565,560,559,561,566,567,567,562,561,562,567,568,568,563,562,563,568,569,569,564,563,564,569,570,570,565,564,571,572,573,573,574,571,574,573,575,575,576,574,576,575,577,577,578,576,578,577,579,579,580,578,572,581,582,582,573,572,573,582,583,583,575,573,575,583,584,584,577,575,577,584,585,585,579,577,581,586,587,587,582,581,582,587,588,588,583,582,583,588,589,589,584,583,584,589,590,590,585,584,586,591,592,592,587,586,587,592,593,593,588,587,588,593,594,594,589,588,589,594,595,595,590,589,596,597,598,597,596,599,599,600,597,600,599,601,601,602,600,602,601,603,603,604,602,605,596,606,596,605,607,607,599,596,599,607,608,608,601,599,601,608,609,609,603,601,610,605,611,605,610,612,612,607,605,607,612,613,613,608,607,608,613,614,614,609,608,615,610,616,610,615,617,617,612,610,612,617,618,618,613,612,613,618,619,619,614,613,620,621,622,621,620,623,623,624,621,624,623,625,625,626,624,626,625,627,627,628,626,629,620,630,620,629,631,631,623,620,623,631,632,632,625,623,625,632,633,633,627,625,634,629,635,629,634,636,636,631,629,631,636,637,637,632,631,632,637,638,638,633,632,639,634,640,634,639,641,641,636,634,636,641,642,642,637,636,637,642,643,643,638,637,644,645,646,645,644,647,647,648,645,648,647,649,649,650,648,650,649,651,651,652,650,653,644,654,644,653,655,655,647,644,647,655,656,656,649,647,649,656,657,657,651,649,658,653,659,653,658,660,660,655,653,655,660,661,661,656,655,656,661,662,662,657,656,663,658,664,658,663,665,665,660,658,660,665,666,666,661,660,661,666,667,667,662,661,668,669,670,669,668,671,671,672,669,672,671,673,673,674,672,674,673,675,675,676,674,677,668,678,668,677,679,679,671,668,671,679,680,680,673,671,673,680,681,681,675,673,682,677,683,677,682,684,684,679,677,679,684,685,685,680,679,680,685,686,686,681,680,687,682,688,682,687,689,689,684,682,684,689,690,690,685,684,685,690,691,691,686,685,692,693,694,694,695,692,695,694,696,696,697,695,697,696,698,698,699,697,699,698,700,700,701,699,693,702,703,703,694,693,694,703,704,704,696,694,696,704,705,705,698,696,698,705,706,706,700,698,702,707,708,708,703,702,703,708,709,709,704,703,704,709,710,710,705,704,705,710,711,711,706,705,707,712,713,713,708,707,708,713,714,714,709,708,709,714,715,715,710,709,710,715,716,716,711,710,717,718,719,719,720,717,720,719,721,721,722,720,722,721,723,723,724,722,724,723,725,725,726,724,718,727,728,728,719,718,719,728,729,729,721,719,721,729,730,730,723,721,723,730,731,731,725,723,727,732,733,733,728,727,728,733,734,734,729,728,729,734,735,735,730,729,730,735,736,736,731,730,732,737,738,738,733,732,733,738,739,739,734,733,734,739,740,740,735,734,735,740,741,741,736,735,742,743,744,744,745,742,745,744,746,746,747,745,747,746,748,748,749,747,749,748,750,750,751,749,743,752,753,753,744,743,744,753,754,754,746,744,746,754,755,755,748,746,748,755,756,756,750,748,752,757,758,758,753,752,753,758,759,759,754,753,754,759,760,760,755,754,755,760,761,761,756,755,757,762,763,763,758,757,758,763,764,764,759,758,759,764,765,765,760,759,760,765,766,766,761,760,767,768,769,769,770,767,770,769,771,771,772,770,772,771,773,773,774,772,774,773,775,775,776,774,768,777,778,778,769,768,769,778,779,779,771,769,771,779,780,780,773,771,773,780,781,781,775,773,777,782,783,783,778,777,778,783,784,784,779,778,779,784,785,785,780,779,780,785,786,786,781,780,782,787,788,788,783,782,783,788,789,789,784,783,784,789,790,790,785,784,785,790,791,791,786,785]
  };
  
  return Jax.Class.create(Jax.Mesh, {
    initialize: function($super, options) {
      this.size = options && options.size || 1;
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

Jax.Material.Texture = Jax.Class.create(Jax.Material, {
  initialize: function($super, texture) {
    this.texture = Jax.Material.Texture.normalizeTexture(texture);
    $super({shader:"texture"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('Texture', this.texture, context);
    uniforms.set('TextureScaleX', this.texture.options.scale_x || this.texture.options.scale || 1);
    uniforms.set('TextureScaleY', this.texture.options.scale_y || this.texture.options.scale || 1);
  }
});

Jax.Material.Texture.normalizeTexture = function(tex) {
  if (tex.isKindOf && tex.isKindOf(Jax.Texture)) return tex;
  return new Jax.Texture(tex); 
};
Jax.Material.NormalMap = Jax.Class.create(Jax.Material, {
  initialize: function($super, map) {
    this.map = Jax.Material.Texture.normalizeTexture(map);
    $super({shader:"normal_map"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    uniforms.texture('NormalMap', this.map, context);
  },
  
  setAttributes: function($super, context, mesh, options, attributes) {
    $super(context, mesh, options, attributes);
    attributes.set('VERTEX_TANGENT', mesh.getTangentBuffer());
  }
});
Jax.Material.ShadowMap = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"shadow_map"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR: 500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
          
      SHADOWMAP_PCF_ENABLED: false,
      SHADOWMAP_MATRIX: context.world.lighting.getLight().getShadowMatrix(),
      SHADOWMAP_ENABLED: context.world.lighting.getLight().isShadowMapEnabled()
    });
    
    var light = context.world.lighting.getLight(), front, back;

    front = light.getShadowMapTextures(context)[0];
    back  = light.getShadowMapTextures(context)[1];
    
    if (front) uniforms.texture('SHADOWMAP0', front, context);
    if (back)  uniforms.texture('SHADOWMAP1', back,  context);
  }
});
Jax.Material.Depthmap = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"depthmap"});
  }
});
Jax.Material.Paraboloid = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    $super(Jax.Util.normalizeOptions(options, {shader:"paraboloid"}));
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    uniforms.set({
      DP_SHADOW_NEAR: 0.1, //c.world.lighting.getLight().getDPShadowNear() || 0.1;}},
      DP_SHADOW_FAR:  500,//c.world.lighting.getLight().getDPShadowFar() || 500;}},
      DP_DIRECTION: options && options.direction || 1
    });
  }
});
Jax.LINEAR = 1;
Jax.EXPONENTIAL = 2;
Jax.EXP2 = 3;

Jax.Material.Fog = Jax.Class.create(Jax.Material, {
  initialize: function($super, options) {
    options = Jax.Util.normalizeOptions(options, {
      shader: "fog",
      algorithm: Jax.EXP2,
      start: 10.0,
      end: 100.0,
      density: 0.0015,
      color:[1,1,1,1]
    });
    options.color = Jax.Util.colorize(options.color);
    options.color = [options.color[0],options.color[1],options.color[2],options.color[3]];
    if (typeof(options.algorithm) == "string") {
      var name = options.algorithm;
      options.algorithm = Jax[name];
      if (!options.algorithm) throw new Error("Jax: Fog algorithm must be one of LINEAR, EXPONENTIAL, or EXP2");
    }
    $super(options);
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);
    
    uniforms.set('End', this.end);
    uniforms.set('Scale', 1.0 / (this.end - this.start));
    uniforms.set('Algorithm', this.algorithm);
    uniforms.set('Density', this.density);
    uniforms.set('FogColor', this.color);
  }
});
Jax.Material.Picking = Jax.Class.create(Jax.Material, {
  initialize: function($super) {
    $super({shader:"picking"});
  },
  
  setUniforms: function($super, context, mesh, options, uniforms) {
    $super(context, mesh, options, uniforms);

    model_index = options.model_index;
    if (model_index == undefined) model_index = -1;

    uniforms.set('INDEX', model_index);
  }
});
/* meshes */


Jax.Material.create("basic");
Jax.Material.create("default", {default_shader:'basic'});
Jax.Material.create("depthmap", {default_shader:"depthmap"});
Jax.Material.create("paraboloid-depthmap", {type:"Paraboloid",default_shader:"paraboloid",layers:[{type:"Depthmap"}]});
Jax.Material.create("picking", {type:"Picking"});

// note: the default_shader is used immediately after Jax.Material has been defined. So, most
// likely the end user won't be able to customize it with the expected result. Materials created
// *after* the default shader has been changed are fine, but materials already existing
// (such as "default") will continue to use the previous default. If default material init can be deferred
// until first use (e.g. upon first call to model#render), then we can expose this variable.
// Since materials are generally meant to maintain their own shaders, it may not be desirable to
// expose it in any case.
Jax.default_shader = "basic";

Jax.shaders = {};

/**
 * Jax.views -> Jax.ViewManager
 **/
Jax.views = new Jax.ViewManager();

/**
 * Jax.routes -> Jax.RouteSet
 **/
Jax.routes = new Jax.RouteSet();

/**
 * Jax.loaded -> Boolean
 * True after Jax has been loaded.
 **/
Jax.loaded = true;

/**
 * Jax.render_speed -> Number
 * Target number of milliseconds to wait between frames.
 * This is not a guaranteed number in JavaScript, just a target. Most notably,
 * system performance issues can drive the framerate down regardless of the
 * target refresh rate.
 *
 * Defaults to 16, for a target rate of 60 frames per second.
 **/
Jax.render_speed = 16;

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
Jax.uptime_tracker = new Date();

/**
 * Jax.shutdown() -> undefined
 *
 * Causes all Jax contexts to be disposed.
 **/
Jax.shutdown = function() {
  if (Jax.uptime_interval) clearInterval(Jax.uptime_interval);
  Jax.uptime_interval = null;
  Jax.SHUTDOWN_IN_PROGRESS = true;
};

/**
 * Jax.restart() -> undefined
 *
 * Restarts the Jax subsystem after a prior call to Jax.shutdown().
 **/
Jax.restart = function() {
  Jax.SHUTDOWN_IN_PROGRESS = false;
  /* TODO: verify : is setInterval better for updates, or should be we using requestAnimFrame? */
  if (!Jax.uptime_interval)
    Jax.uptime_interval = setInterval(function() { Jax.uptime = (new Date() - Jax.uptime_tracker) / 1000; }, 33);
};

// start 'er up!
Jax.restart();

/*
  FIXME Resource manager looks for an object in the global namespace, so using Jax.Scene.LightSource
  instead of just LightSource results in a broken resource load.
 */
var LightSource = Jax.Scene.LightSource;
var Material = Jax.Material;


/* Export globals into 'exports' for CommonJS */
if (typeof(exports) != "undefined") {
  exports.Jax = Jax;
  exports.mat4 = mat4;
  exports.mat3 = mat3;
  exports.vec3 = vec3;
  exports.glMatrixArrayType = glMatrixArrayType;
  exports.quat4 = quat4;
}
;
