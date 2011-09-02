JMVCTest = {
	APPLICATION_NAME : 'EJS',
	TEST_DESCRIPTION : 'This tests ejs',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			this.animals = ['sloth', 'bear', 'monkey']
			this.square_brackets = "<ul>[% this.animals.each(function(animal){%]" +
			               "<li>[%= animal %]</li>" + 
				      "[%});%]</ul>"
		    this.square_brackets_no_this = "<ul>[% animals.each(function(animal){%]" +
			               "<li>[%= animal %]</li>" + 
				      "[%});%]</ul>"
		    this.angle_brackets_no_this  = "<ul><% animals.each(function(animal){%>" +
			               "<li><%= animal %></li>" + 
				      "<%});%></ul>";
		},
		teardown: function() {
		},
	    test_render_with_left_bracket: function() { with(this) {
			var compiled = new EJS({text: this.square_brackets, type: '['}).render({animals: this.animals})
			assertEqual("<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
		test_render_with_process: function() { with(this) {
			var compiled = new EJS({text: this.square_brackets_no_this, type: '['}).render({animals: this.animals}) ;
			assertEqual("<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
	    test_render_with_carrot: function() { with(this) {
			var compiled = new EJS({text: this.angle_brackets_no_this}).render({animals: this.animals}) ;

			assertEqual("<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
		test_update : function() { with(this) {
			var compiled = new EJS({text: this.angle_brackets_no_this}).update( 'update_me', {animals: this.animals}  );
			assertEqual("<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", document.getElementById('update_me').innerHTML.toLowerCase().replace(/\r\n/g, '') )
	    }},
		test_render_with_double: function() { with(this) {
			var text = "<%% replace_me %>"+
					  "<ul><% animals.each(function(animal){%>" +
			               "<li><%= animal %></li>" + 
				      "<%});%></ul>";
			var compiled = new EJS({text: text}).render({animals: this.animals}) ;
			assertEqual("<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
		test_render_with_comment: function() { with(this) {

			var text = "<%# replace_me %>"+
					  "<ul><% animals.each(function(animal){%>" +
			               "<li><%= animal %></li>" + 
				      "<%});%></ul>";
			var compiled = new EJS({text: text}).render({animals: this.animals}) ;
			assertEqual("<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
		test_render_with_double_equal: function() { with(this) {
			var text = "<%%= replace_me %>"+
					  "<ul><% animals.each(function(animal){%>" +
			               "<li><%= animal %></li>" + 
				      "<%});%></ul>";
			var compiled = new EJS({text: text}).render({animals: this.animals}) ;
			assertEqual("<%= replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", compiled)
	    }},
		test_error_forgot_opening_carrot: function() { with(this) {

			var text = "<ul><% animals.each(function(animal){%>" +
			               "<li> animal %></li>" + 
				      "<%});%></ul>";
			var compiled = new EJS({text: text}).render({animals: this.animals}) ;
			assertEqual("<ul><li> animal %></li><li> animal %></li><li> animal %></li></ul>", compiled)
	    }},
		test_with_elements : function(){with(this){
			var compiled = new EJS({element: 'test_template'}).render({animals: this.animals}) ;
			assertEqual("<ul>\n\t<li>sloth</li>\n\n\t<li>bear</li>\n\n\t<li>monkey</li>\n</ul>", compiled)
			
			var compiled = new EJS({element: document.getElementById('test_template') }).render({animals: this.animals}) ;
			assertEqual("<ul>\n\t<li>sloth</li>\n\n\t<li>bear</li>\n\n\t<li>monkey</li>\n</ul>", compiled)
			
		}},
		test_error_forgot_closing_carrot: function() { with(this) {

			var text = "<ul><% animals.each(function(animal){%>\n" +
			               "<li><% animal %</li>\n" + 
				      "<%});%></ul>";
			try{
				var compiled = new EJS({text: text}) ;
				assert(false,'An error should have been reported')
			}catch(e){
				assertEqual(2, e.lineNumber)
			}
	    }}
	    
	  }, "testlog");
  }
}