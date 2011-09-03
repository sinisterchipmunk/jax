Jax::Engine.routes.draw do
  root :to => "suite#index"
  match "/:action(/*id)", :controller => "suite"
end

if defined?(Jax::Rails::Application)
  # we are running a non-Rails Jax app

  Jax::Rails::Application.routes.draw do
    mount Jax::Engine => "/"
  end
end
