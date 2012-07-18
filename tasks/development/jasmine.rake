# load 'jasmine/tasks/jasmine.rake'

desc "Run jasmine specs in browser"
task :jasmine do
  begin
    server = nil
    result = {}
    th = Thread.new do
      ENV['quiet'] = '1'
      Rake::Task['server'].execute
    end
  
    require 'selenium-webdriver'
    driver = Selenium::WebDriver.for :firefox
    driver.navigate.to "http://localhost:3000/jasmine"
    
    puts driver.title if ENV["DEBUG"]
    if driver.title =~ /Exception/ # Rails exception occurred
      puts driver.page_source
      raise "Rails error occurred requesting jasmine specs"
    end
  
    execjs = proc do |js|
      puts "eval js: #{js}" if ENV['DEBUG']
      result = driver.execute_script js
      puts "     =>  #{result.inspect}" if ENV['DEBUG']
      result
    end

    until execjs.call("return jsApiReporter && jsApiReporter.finished") == true
      sleep 0.1
    end
  
    result = execjs.call(<<-end_code)
    var result = jsApiReporter.results();
    var failures = new Array();
    var results = { };
    for (var i in result) {
      for (var j = 0; j < result[i].messages.length; j++) {
        var msg = result[i].messages[j];
        msg.toString = msg.toString();
        msg.passed = msg.passed();
        if (!msg.passed)
          failures.push(msg);
      }
      results[result[i].result] = results[result[i].result] || 0;
      results[result[i].result]++;
    }
    return { results: results, failure_messages: failures };
    end_code
  ensure
    driver.quit if driver and driver.respond_to?(:quit)
    # server.stop if server
  end
  
  passed = result["results"]["passed"].to_i
  failed = result["results"]["failed"].to_i
  total = passed + failed
  green, red = "\e[32m", "\e[31m"
  color = failed > 0 ? red : green
  puts "#{color}#{total} jasmine specs: #{passed} passed, #{failed} failed\e[0m"
  unless (failure_messages = result["failure_messages"]).empty?
    failure_messages.each do |message|
      puts message["message"]
      puts
      puts message["trace"]["stack"].split(/\n/).collect { |line|
        line['@'] ? line.sub(/^.*\@/, '') : line }.reject { |line|
        line['/jasmine.js?'] }.join("\n")
    end
    raise "jasmine specs failed"
  end
end
