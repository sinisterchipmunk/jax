class Jax::ResourceCompiler
  def save(destination_file)
    if destination_file.kind_of?(IO)
      save_resources destination_file
    else
      mkdir_p File.dirname(destination_file) unless File.exist?(File.dirname(destination_file))
      File.open destination_file, "w" do |f|
        save_resources f
      end
    end
  end
  
  def to_s
    resources.inject("") do |result, (model_name, instances)|
      result + "#{model_name.camelize}.addResources(#{instances.to_json});\n"
    end
  end
  
  def resources
    gather_resources
  end
  
  private
  def save_resources(io)
    io.puts to_s
  end
  
  def gather_resources
    # app.resource_files.concat config.paths.app.resources.to_a
    
    Jax.application.resource_paths.inject({}) do |resources, paths|
      paths.to_a.each do |yml|
        model_name = File.basename(File.dirname(yml)).singularize
        resource_id = File.basename(yml).sub(/^(.*)\..*$/, '\1')
        hash = YAML::load(File.read(yml)) || {}

        resources[model_name] ||= {}
        resources[model_name].merge!({ resource_id => hash })
      end
      resources
    end
  end
  
  # Camelizes the keys in this hash, except the first character,
  # following the JavaScript variable naming conventions.
  #
  # If the camelized key already exists, no change is made.
  def camelize_keys(hash)
    hash.keys.each do |key|
      camelized = key.gsub(/[_\-](.)/) { |m| $~[1].upcase }
      unless hash.key?(camelized)
        value = hash[camelized] = hash.delete(key)
        if value.kind_of?(Hash)
          camelize_keys(value)
        end
      end
    end
    hash
  end
end
