RAILS_APP_PATH = File.expand_path('../../spec/testbeds/rails-3.2',
                                  File.dirname(__FILE__))

namespace :testbed do
  if File.directory?(RAILS_APP_PATH)
    namespace :rails do
      load File.join(RAILS_APP_PATH, 'Rakefile')
    end
  end
end
