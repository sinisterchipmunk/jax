module Jasmine
  class Config
    # overridden so that we can map source files separately from /public
    def src_files
      if simple_config['src_files']
        match_files(src_dir, simple_config['src_files']).collect { |f| File.join("__src__", f) }
      else
        []
      end
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
