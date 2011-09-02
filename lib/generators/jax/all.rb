Dir[File.expand_path("*/*.rb", File.dirname(__FILE__))].each { |generator| require generator }
