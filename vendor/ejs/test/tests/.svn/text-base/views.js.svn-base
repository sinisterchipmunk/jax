JMVCTest = {
	APPLICATION_NAME : 'EJS',
	TEST_DESCRIPTION : 'This tests templating',
	perform_test : function() {
	  new Test.Unit.Runner({
	  	
		setup: function() {
			this.view = new EJS.Helpers({});
			this.animals = ['sloth', 'bear', 'monkey'];
		},
		teardown: function() {
		},
	    test_link_to: function() { with(this) {
			assertEqual( "<a href='/something/here' >hello world</a>", 
				this.view.link_to('hello world', '/something/here'  )  )
				
			var compiled = new EJS({text: "<%= link_to('hello world', '/something/here'  ) %>"}).render({}) ;
			assertEqual("<a href='/something/here' >hello world</a>", compiled)
	    }},
		test_date_tag: function() { with(this) {
			var date = new Date(2007,10,20,1,1,1,1)
			assertEqual( "<select id=\'Installation[date][year]\' value=\'2007\' name=\'Installation[date][year]\' ><option value=\'1992\' >1992</option><option value=\'1993\' >1993</option><option value=\'1994\' >1994</option><option value=\'1995\' >1995</option><option value=\'1996\' >1996</option><option value=\'1997\' >1997</option><option value=\'1998\' >1998</option><option value=\'1999\' >1999</option><option value=\'2000\' >2000</option><option value=\'2001\' >2001</option><option value=\'2002\' >2002</option><option value=\'2003\' >2003</option><option value=\'2004\' >2004</option><option value=\'2005\' >2005</option><option value=\'2006\' >2006</option><option value=\'2007\' selected=\'selected\' >2007</option><option value=\'2008\' >2008</option><option value=\'2009\' >2009</option><option value=\'2010\' >2010</option><option value=\'2011\' >2011</option><option value=\'2012\' >2012</option><option value=\'2013\' >2013</option><option value=\'2014\' >2014</option><option value=\'2015\' >2015</option><option value=\'2016\' >2016</option><option value=\'2017\' >2017</option><option value=\'2018\' >2018</option><option value=\'2019\' >2019</option><option value=\'2020\' >2020</option><option value=\'2021\' >2021</option></select><select id=\'Installation[date][month]\' value=\'10\' name=\'Installation[date][month]\' ><option value=\'0\' >January</option><option value=\'1\' >February</option><option value=\'2\' >March</option><option value=\'3\' >April</option><option value=\'4\' >May</option><option value=\'5\' >June</option><option value=\'6\' >July</option><option value=\'7\' >August</option><option value=\'8\' >September</option><option value=\'9\' >October</option><option value=\'10\' selected=\'selected\' >November</option><option value=\'11\' >December</option></select><select id=\'Installation[date][day]\' value=\'20\' name=\'Installation[date][day]\' ><option value=\'1\' >1</option><option value=\'2\' >2</option><option value=\'3\' >3</option><option value=\'4\' >4</option><option value=\'5\' >5</option><option value=\'6\' >6</option><option value=\'7\' >7</option><option value=\'8\' >8</option><option value=\'9\' >9</option><option value=\'10\' >10</option><option value=\'11\' >11</option><option value=\'12\' >12</option><option value=\'13\' >13</option><option value=\'14\' >14</option><option value=\'15\' >15</option><option value=\'16\' >16</option><option value=\'17\' >17</option><option value=\'18\' >18</option><option value=\'19\' >19</option><option value=\'20\' selected=\'selected\' >20</option><option value=\'21\' >21</option><option value=\'22\' >22</option><option value=\'23\' >23</option><option value=\'24\' >24</option><option value=\'25\' >25</option><option value=\'26\' >26</option><option value=\'27\' >27</option><option value=\'28\' >28</option><option value=\'29\' >29</option><option value=\'30\' >30</option><option value=\'31\' >31</option></select>", 
				this.view.date_tag('Installation[date]', date)  )
	    }},
		test_form_tag: function() { with(this) {
			assertEqual( "<form action=\'/myaction\' >",				
				this.view.form_tag('/myaction')  )
	    }},
		test_end_form_tag: function() { with(this) {
			assertEqual( "</form>",				
				this.view.form_tag_end()  )
	    }},
		test_hidden_field_tag: function() { with(this) {
			assertEqual( "<input id=\'something[interesting]\' value=\'5\' type=\'hidden\' name=\'something[interesting]\' />",				
				this.view.hidden_field_tag('something[interesting]', 5)  )
	    }},
		test_input_field_tag: function() { with(this) {
			assertEqual( "<input id='something[interesting]' value='5' type='text' name='something[interesting]' />",				
				this.view.input_field_tag('something[interesting]', 5)  )
	    }},
		test_current_page : function(){with (this){
			assert( this.view.is_current_page(window.location.href) );
			assert( this.view.is_current_page(window.location.pathname) );
			assertEqual(false,  this.view.is_current_page('juptierit.com') );
		}},
		test_submit_link_to : function(){with (this){
			
			assertEqual( "<input onclick='window.location=\"/new/location\";return false;' value='holla' type='submit' >",				
				this.view.submit_link_to('holla', '/new/location')  )
		}},
		test_link_to_unless : function(){with (this){
			assertEqual( "<a href='/reply' >Reply</a>",	 this.view.link_to_unless(false, 'Reply', '/reply' )  )
			assertEqual( "Reply",	 this.view.link_to_unless(true, 'Reply', '/reply' )  )
		}},
		test_link_to_if : function(){with (this){
			assertEqual( "<a href='/reply' >Reply</a>",	 this.view.link_to_if(true, 'Reply', '/reply' )  )
			assertEqual( "Reply",	 this.view.link_to_if(false, 'Reply', '/reply' )  )
		}},
		test_link_to_unless_current : function(){with (this){
			assertEqual( "<a href='/reply' >Reply</a>",	 this.view.link_to_unless_current('Reply', '/reply' )  )
			assertEqual( "Reply",	 this.view.link_to_unless_current('Reply', window.location.pathname )  )
		}},
		test_password_field_tag : function(){with (this){
			assertEqual( "<input id='something[interesting]' value='5' type='password' name='something[interesting]' />",				
				this.view.password_field_tag('something[interesting]', 5)  )
		}},
		test_password_field_tag : function(){with (this){
			assertEqual( "<input id='something[interesting]' value='5' type='password' name='something[interesting]' />",				
				this.view.password_field_tag('something[interesting]', 5)  )
		}},
		test_select_tag : function(){with (this){
			var choices = [ {value: 1,      text: 'First Choice' }, 
                  {value: 2,      text: 'Second Choice'},
                  {value: '3',    text: 'Third Choice'}  ]
			assertEqual( "<select id='mySelectElement' value='2' name='mySelectElement' ><option value='1' >First Choice</option><option value='2' selected='selected' >Second Choice</option><option value='3' >Third Choice</option></select>",				
				this.view.select_tag('mySelectElement', 2,  choices)  )
		}},
		test_text_area_tag : function(){with (this){
			assertEqual( "<textarea id='task[description]' name='task[description]' cols='50' rows='4' >Here is some text.\nA new line.</textarea>",				
				this.view.text_area_tag('task[description]', 'Here is some text.\nA new line.')  )
		}},
		test_text_field_tag : function(){with (this){
			assertEqual( "<input id='something[interesting]' value='5' type='text' name='something[interesting]' />",				
				this.view.text_field_tag('something[interesting]', 5)  )
		}},
		test_text_img_tag : function(){with (this){
			assertEqual( "<img src='/some.png' alt='something' />",				
				this.view.img_tag('/some.png', 'something')  )
		}},
		test_submit_tag : function(){with (this){
			assertEqual( "<input type=\'submit\' value=\'Submit\' />",				
				this.view.submit_tag('Submit')  )
		}}
		
		
		//error
	    
	  }, "testlog");
  }
}