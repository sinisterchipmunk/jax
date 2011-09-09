module Jax::HelperMethods
  def jax_resource_files
    resources = []
    ::Rails.application.assets.each_file do |filename|
      next if File.directory?(filename)
      if filename =~ /\.resource$/
        attributes = ::Rails.application.assets.attributes_for(filename)
        filename = attributes.logical_path
        resources << filename unless resources.include? filename
      end
    end
    resources
  end
  
  def include_jax_resource_files
    jax_resource_files.collect { |filename|
      # the resources don't have a .js extension
      javascript_include_tag(filename)
    }.join("\n").html_safe
  end
end
