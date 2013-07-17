require 'jax'
require 'testbeds'

testbed = Testbeds.current
raise "need a testbed, set BUNDLE_GEMFILE" unless testbed

testbed.dependencies.each do |dep|
  require dep
end

# eval testbed's config.ru
ru = testbed.store_in.join(testbed.name, 'config.ru')
puts "Binding server under testbed: #{ru}"
src = File.read ru
eval src, binding, ru.to_s
