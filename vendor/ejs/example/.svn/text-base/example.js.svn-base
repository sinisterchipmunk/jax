
function testUsingText() {
	/*
	 * Some DOM Element on your web page is to be the recipient 
	 * of the processed EJS fragment. This element is assigned 
	 * to *output*.
	 */
	var output = $('output_results');

	/* Create some fragment of EJS code. Variables from the 
	 * current scope can be used inside the current EJS code.
	 */
	var animals = ['sloth', 'bear', 'monkey'];
	var ejs = "<ul>[% animals.each(function(animal){%]" +
	               "<li>[%= animal %]</li>" + 
		      "[%});%]</ul>";
	
	/*
	 * Create a new compiler and pass it a reference to the DOM
	 * node containing the source. 
	 */
	var compiler = new EjsCompiler(ejs);		
	
	/*
	 * Call the compile() function
	 */
	compiler.compile();	
	
	/*
	 * View the compiled results
	 */
	$('output_code').innerHTML = compiler.out.escapeHTML();

	/*
	 * Evaluate the compiled EJS code and save the output as 
	 * the string *compiled*. This string contains the result.
	 */
	var compiled = eval(compiler.out);

	/*
	 * Set the inner HTML of the output node to the result.
	 */
	output.innerHTML = compiled;
}


function testUsingDOM() {
	/*
	 * Some DOM Element on your web page has EJS source code
	 * within it. This element is assigned to *source*
	 *
	 * Some DOM Element on your web page is to be the recipient 
	 * of the processed EJS fragment. This element is assigned 
	 * to *output*.
     *
	 */
	var source = $('source_code');
	var output = $('output_results');

    /*
	 * Create a new compiler and pass it a reference to the DOM
	 * node containing the source
	 */
	var compiler = new EjsCompiler(source);		
	
	/*
	 * Call the compile() function
	 */
	compiler.compile();	
	
	/*
	 * View the compiled results
	 */
	$('output_code').innerHTML = compiler.out.escapeHTML();
	
	/*
	 * Evaluate the compiled EJS code and save the output as 
	 * the string *compiled*. This string contains the result.
	 */
	var compiled = eval(compiler.out);
	
	/*
	 * Set the inner HTML of the output node to the result.
	 */
	output.innerHTML = compiled;


}
