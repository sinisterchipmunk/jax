module Matchers
  class NumericMatcher
    def initialize(expected, operation)
      @expected, @operation = expected, operation
    end
    
    def matches?(actual)
      @actual = actual
      @actual.respond_to?(@operation) ? actual.send(@operation, @expected) : false
    end
    
    def failure_message
      "Expected #{@actual.inspect} #{@operation} #{@expected.inspect}"
    end
    
    def negative_failure_message
      "Expected #{@actual.inspect} not #{@operation} #{@expected.inspect}"
    end
  end
  
  def be_less_than(other)
    Matchers::NumericMatcher.new other, :<
  end
end

World(Matchers)
