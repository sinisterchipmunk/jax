Jax::Engine.routes.draw do
  root :to => "suite#index"
end

if defined?(Jax::Rails::Application)
  # we are running a non-Rails Jax app

  Jax::Rails::Application.routes.draw do
    mount Jax::Engine => "/"
  end
end
