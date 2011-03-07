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
      resources[model_name] ||= {}
      resources[model_name].merge!({ resource_id => YAML::load(File.read(yml)) })
      resources
    end
  end
end