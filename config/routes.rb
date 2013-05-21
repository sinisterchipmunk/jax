Jax::Engine.routes.draw do
  if defined?(JasmineRails)
    mount JasmineRails::Engine => '/jasmine', :as => 'jasmine_rails'
  end
  
  root :to => "suite#index"
  get '/specs(.:format)' => 'suite#specs'
end

if defined?(JasmineRails)
  Rails.application.routes.draw do
    mount JasmineRails::Engine => '/jasmine', :as => 'jasmine_rails'
  end
end
