# pull in some helpers to detect current testbed
load File.expand_path('tasks/support/gemfiles.rb', File.dirname(__FILE__))
testbed = TaskHelpers.current_testbed.split(':').join('-')

# get full path to testbed's config.ru
config = File.join('spec/testbeds', testbed, 'config.ru')
src_path = File.expand_path(config, File.dirname(__FILE__))

# pull in testbed's application, for _common to hook into
require File.expand_path('config/application', File.dirname(src_path))

# inject common paths for jax test codez
load File.expand_path('spec/testbeds/_common.rb', File.dirname(__FILE__))

# eval testbed's config.ru
src = File.read src_path
eval src, binding, src_path
