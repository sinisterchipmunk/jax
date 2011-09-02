require 'thor'

class TestShell
  # TODO capture it for testing against
  
  def say(message = "", color = nil, force_new_line = (message.to_s !~ /(|\t)$/))
  end
  
  def say_status(status, message, log_status = true)
  end
end
