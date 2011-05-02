class Jax::Shader
  attr_reader :common, :fragment, :vertex
  attr_accessor :name, :path, :exports
  
  def initialize(path)
    @exports = {}
    @name = File.basename(path)
    @path = File.dirname(path)
  end
  
  def to_s
    "Jax.shaders['#{name}'] = new Jax.Shader(#{js_options.gsub(/<%/, '<%')});"
  end
  
  def save_to(filename)
    File.open(filename, "w") { |f| f.puts to_s }
  end
  
  class << self
    def from(path)
      raise ArgumentError, "Expected path to be a directory" unless File.directory? path
      shader = new(path)
      %w(common fragment vertex).each do |name|
        if File.file?(file = File.join(path, "#{name}.ejs"))
          shader.send("#{name}=", File.read(file))
        end
      end
      shader
    end
  end
  
  def common=(str)
    @common = preprocess(str).inspect
  end
  
  def fragment=(str)
    @fragment = preprocess(str).inspect
  end
  
  def vertex=(str)
    @vertex = preprocess(str).inspect
  end
  
  def preprocess(str)
    include_dependencies str
    intercept_export_directives str
#    intercept_import_directives str
#    prepend_export_definitions str
    
    str
  end
  
  private
  def intercept_import_directives(str)
    str.gsub! /import\s*\(\s*([^\s]*)\s*\)/ do
      export_name($~[1])
    end
  end
  
  def prepend_export_definitions(str)
    exports.each do |name, export|
      str.insert 0, "#{export[:type]} #{name};\n"
    end
  end
  
  def intercept_export_directives(str)
    intercept_export_directives_with_assignment(str)
    intercept_export_directives_without_assignment(str)
  end
  
  def intercept_export_directives_without_assignment(str)
    str.gsub! /export\s*\(\s*([^\s]*),\s*([^\s]*)\s*\);?/ do |match|
      export $~[1], $~[2]
      match # we'll do the rest on the JS side
    end
  end
  
  def intercept_export_directives_with_assignment(str)
    str.gsub! /export\s*\(\s*([^\s]*),\s*([^\s]*),\s*([^\s]*)\s*\);?/ do |match|
      export $~[1], $~[2], $~[3]
      match # we'll do the rest on the JS side
    end
  end
  
  def export(type, name, value = name)
    exports[name] ||= { :type => type, :value => value }
    "#{exported_name(name)} = #{value};"
  end
  
  def include_dependencies(str)
    # look for Sprockets-style require directives
    str.gsub! /\/\/=\s*require\s*['"]([^'"]*)['"]/m do |sub|
      File.read(File.join(@path, "#{$~[1]}.ejs")) + "\n"
    end
  end
  
  def exported_name(name)
    "_#{self.name}_#{name}"
  end
  
  def export_keys_as_js
    "{" + exports.collect { |key,value| export_descriptor(key, value) }.join(",") + "}"
  end
  
  def export_descriptor(name, info)
    "#{name.to_s.inspect}:#{info[:type].to_s.inspect}"
  end
  
  def js_options
    result = "{"
    %w(common fragment vertex).each do |segment|
      data = send segment
      if data
        result += "  #{segment}:#{data},\n"
      end
    end
    result += "exports: #{export_keys_as_js},\n"
    result += "name: #{name.inspect}"
    result += "}"
    
    result
  end
end