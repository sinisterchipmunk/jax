require 'rails/generators'
require File.expand_path("base/named_base", File.dirname(__FILE__))
require File.expand_path("base/rails_base", File.dirname(__FILE__))

Dir[File.expand_path("*/*.rb", File.dirname(__FILE__))].each { |generator| require generator }
