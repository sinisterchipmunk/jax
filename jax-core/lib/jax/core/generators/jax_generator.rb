require File.expand_path("all", File.dirname(__FILE__))

class JaxGenerator < ::Rails::Generators::Base
  def show_helpful_info
    say "You can invoke the following Jax generators:\n\n"
    Jax::Generators.constants.each do |const_name|
      const = Jax::Generators.const_get const_name
      unless const.name =~ /Base$/ or not const.is_a? Class
        say "  #{const.banner}"
      end
    end
  end
end
