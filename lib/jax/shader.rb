class Jax::Shader
  attr_accessor :common, :fragment, :vertex, :name
  
  def initialize(name)
    @name = name
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
      shader = new(File.basename(path))
      %w(common fragment vertex).each do |name|
        file = File.join(path, "#{name}.js")
        if File.file?(file)
          shader.send("#{name}=", File.read(file))
        elsif File.file?(file = File.join(path, "#{name}.ejs"))
          shader.send("#{name}=", File.read(file).inspect)
        end
      end
      shader
    end
  end
  
  private
  def js_options
    result = "{"
    %w(common fragment vertex).each do |segment|
      data = send segment
      result += "  #{segment}:#{data},\n" if data
    end
    result += "name: #{name.inspect}"
    result += "}"
    
    result
  end
end