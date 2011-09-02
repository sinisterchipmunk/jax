module Matchers
  def match(str_or_regexp)
    MatchOverride.new(str_or_regexp)
  end
end
