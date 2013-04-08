desc "Start the Jax dev server"
task :server => "testbed:#{current_testbed}:server"
