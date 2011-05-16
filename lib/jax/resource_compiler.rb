class Jax::ResourceCompiler
  def save(destination_file)
    resources = gather_resources

    if destination_file.kind_of?(IO)
      save_resources destination_file, resources
    else
      mkdir_p File.dirname(destination_file)
      File.open destination_file, "w" do |f|
        save_resources f, resources
      end
    end
  end
  
  private
  def save_resources(io, resources)
    resources.each do |model_name, instances|
      io.puts "#{model_name.camelize}.addResources(#{instances.to_json});"
    end
  end
  
  def gather_resources
    Dir[Jax.root.join("app/resources/**/*.yml")].inject({}) do |resources, yml|
      model_name = File.basename(File.dirname(yml)).singularize
      resource_id = File.basename(yml).sub(/^(.*)\..*$/, '\1')
      hash = YAML::load(File.read(yml)) || {}

      resources[model_name] ||= {}
      resources[model_name].merge!({ resource_id => hash })
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
