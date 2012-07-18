require "jshintrb/jshinttask"
desc "Run static code analysis"
Jshintrb::JshintTask.new :jshint => :compile do |t|
  t.pattern = 'tmp/jax.js'
  # t.options = :defaults
  t.options = {
    :bitwise => false,
    :curly => false,
    :eqeqeq => false,
    :forin => false,
    :immed => true,
    :latedef => true,
    :newcap => true,
    :noarg => true,
    :noempty => false,
    :nonew => true,
    :plusplus => false,
    :regexp => false,
    :undef => true,
    :strict => true,
    :trailing => true,
    :boss => true,
    :es5 => true,
    :evil => false,
    :browser => true,
    :devel => true,

    # :predef => [ 'module', 'global', 'Float32Array', 'Int32Array', 'define' ]
  }
end
