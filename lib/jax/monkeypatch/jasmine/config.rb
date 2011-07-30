module Jasmine
  class Config
    def plugin_and_app_files(src_files)
      src_files.collect do |src_file|
        Jax.application.plugins.inject([]) { |ary, plugin| 
          ary + [File.join(plugin.relative_path, src_file)]
        } + [src_file]
      end.flatten
    end
    
    # overridden so that we can map source files separately from /public
    def src_files
      if simple_config['src_files']
        match_files(src_dir, plugin_and_app_files(simple_config['src_files'])).collect do |f|
          File.join("__src__", f)
        end.uniq
      else
        []
      end
    end
    
    def helpers
      helpers = simple_config['helpers'] || ['helpers/**/*.js']
      helpers.collect! { |s| File.expand_path(s, spec_dir).gsub(/^#{Regexp::escape Jax.root.to_s}\/?/, '') }
      
      match_files(project_root, plugin_and_app_files(helpers)).uniq
    end
    
    def spec_files
      spec_files = simple_config['spec_files'] || ['**/*[sS]pec.js']
      spec_files.collect! { |s| File.expand_path(s, spec_dir).gsub(/^#{Regexp::escape Jax.root.to_s}\/?/, '') }
      
      match_files(project_root, plugin_and_app_files(spec_files)).uniq
    end
    
    # new, used by overridden 'server.rb' so that we can map /public to root
    def root_dir
      if simple_config['root_dir']
        File.join project_root, simple_config['root_dir']
      else
        project_root
      end
    end
  end
end
