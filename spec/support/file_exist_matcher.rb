module FileExistMatcher
  def exist(name)
    FileExistMatcher.new(name)
  end

  class FileExistMatcher
    def initialize(name)
      @name = name
    end

    def matches?(what)
      what.exist?(@name)
    end

    def failure_message
      "Expected file '#{@name}' to exist"
    end

    def negative_failure_message
      "Expected file '#{@name}' to not exist"
    end
  end
end
