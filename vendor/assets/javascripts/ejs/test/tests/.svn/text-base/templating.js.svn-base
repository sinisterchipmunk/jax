JMVCTest = {
	APPLICATION_NAME : 'EJS',
	TEST_DESCRIPTION : 'This tests templating',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			this.animals = ['sloth', 'bear', 'monkey']
		},
		teardown: function() {
		},
	    test_find_and_process: function() { with(this) {
			var result = new EJS({url: 'templates/test.ejs'}).render({animals: this.animals}) ;
			assertEqual("<ul>\n<li>sloth</li>\n\n<li>bear</li>\n\n<li>monkey</li>\n</ul>", result)
			
	    }},
		test_caching: function() { with(this) {
			// create a basic template to insert
			var ejs = "<%% replace_me %>"+
					  "<ul><% animals.each(function(animal){%>" +
			               "<li><%= animal %></li>" + 
				      "<%});%></ul>";

			EJS.update('templates/test.ejs', new EJS({text: ejs}) )
			
			var result = new EJS({url: 'templates/test.ejs'}).render({animals: this.animals}) ;
			assertEqual("<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", result)
	    }},
		test_template_not_found : function() { with(this) {
			try{
				new EJS({url: 'templates/test_not_found.ejs'}) ;
				assert(false, 'an error should have happened')
			}catch(e){
				assert(true)
			}

	    }}
		
		//error
	    
	  }, "testlog");
  }
}