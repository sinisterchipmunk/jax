
module Colors
  def green str
    "\e[32m#{str}\e[0m"
  end

  def red str
    "\e[31m#{str}\e[0m"
  end
end

class JSReporter
  include Capybara::DSL
  include Colors

  class Message
    include Colors

    attr_reader :message, :trace

    def initialize raw_message
      @message = raw_message['message']
      @trace = raw_message['trace']
      @passed = raw_message['passed_']
    end

    def passed?
      @passed
    end

    def dot
      passed? ? green('.') : red('F')
    end

    def to_s
      if passed?
        green(message)
      else
        stack = trace['stackTrace'].reject { |entry| entry['fileName'] =~ /__jasmine__\/jasmine\.js/ }

        red [
          trace['message'],
          "    " + stack.collect { |entry|
            [entry['methodName'], 'in', entry['fileName'], 'line', entry['lineNumber']].join(" ")
          }.join("\n    ")
        ].join("\n")
      end
    end
  end

  class Result
    include Colors

    attr_reader :type, :name, :messages, :children

    def passed?
      @passed
    end

    def initialize raw_result
      @type = raw_result['type']
      @name = raw_result['name']
      @children = raw_result['children']
      if @type == 'spec'
        @passed = raw_result['result']['result'] == 'passed'
        @messages = raw_result['result']['messages'].collect { |m| Message.new m }
      else
        @messages = []
      end
    end

    def dump level = 0
      indent = "  " * level
      print indent
      if type == 'suite' then print name
      else
        if passed?
          print green(name)
        else
          print red(name)
        end
      end
      puts

      unless type == 'suite' or passed?
        indent += "  "
        messages.each do |message|
          next if message.passed?
          puts indent + message.to_s.gsub(/\n/, "\n" + indent).strip
        end
        puts
      end

      unless children.empty?
        children = self.children.sort { |a, b| -(a.type <=> b.type) }
        children.each { |child| child.dump level + 1 }
        puts
      end
    end
  end

  class Suites
    include Capybara::DSL

    def initialize suites, reporter
      @suites = suites
      @reporter = reporter
    end

    def dump
      results.each do |spec|
        spec.dump 0
      end
    end

    def build_results
      max = page.evaluate_script("#{@suites}.length")
      results = []
      max.times do |i|
        result = page.evaluate_script <<-end_script
          (function() {
            var suite = #{@suites}[#{i}];
            return {
              id: suite.id,
              name: suite.name,
              type: suite.type,
              num_children: suite.children ? suite.children.length : 0
            };
          })();
        end_script
        results << result
      end
      results
    end

    def results
      @results ||= begin
        # we have to do this in multiple passes to keep the script from hanging
        # during serialization to ruby
        results = build_results

        results.each_with_index do |result, i|
          if result['type'] == 'spec'
            result['result'] = page.evaluate_script <<-end_script
              (function() {
                // clean up messages. we don't use actual or expected
                // but both can be huge, and cause timeouts.
                var result = #{@reporter}.results_[#{result['id']}];

                // we don't dump passing messages, so remove them.
                if (result.result == 'passed') {
                  result.messages = [];
                } else {
                  for (var i = 0; i < result.messages.length; i++) {
                    delete result.messages[i].expected;
                    delete result.messages[i].actual;
                    delete result.messages[i].toString;
                  }
                }
                return result;
              })();
            end_script
          end

          if result['num_children'] != 0
            result['children'] = Suites.new("#{@suites}[#{i}].children", @reporter).results
          else
            result['children'] = []
          end
        end

        results.collect { |raw_result| Result.new raw_result }
      end
    end
  end

  def initialize
    visit 'http://localhost:8888'
  end

  def _reporter
    <<-end_code.lines.join.strip
      (((typeof jasmine === 'undefined') ? {} : jasmine.getEnv())
      .reporter || {subReporters_:[]})
      .subReporters_[0]
    end_code
  end

  def finished?
    page.evaluate_script("#{_reporter}.finished")
  end

  def dump
    Suites.new("#{_reporter}.suites_", _reporter).dump
  end
end
