# Overrides the built-in `x.should match(...)` matcher to provide
# a serialization-safe alternative. Only used in isolated tests.
#
class MatchOverride
  def initialize(str_or_regexp)
    @str_or_regexp = str_or_regexp
  end
  
  def matches?(actual)
    @actual = actual
    case @str_or_regexp
    when Regexp
      actual =~ @str_or_regexp
    else
      actual =~ /#{Regexp::escape @str_or_regexp}/
    end
  end
  
  def failure_message
    "expected to match #{@str_or_regexp.inspect}, but was #{@actual.inspect}"
  end
  
  def negative_failure_message
    failure_message.sub(/ to/, ' not to')
  end
end
