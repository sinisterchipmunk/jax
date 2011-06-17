class Jax::Packager::SprocketsTemplate < Sprockets::SourceFile
  def initialize(environment)
    pathname = environment.pathname_from(File.join(Jax.root, "template.js"))
    super(environment, pathname)
  end
  
  def template
    added_files.clear
    @template ||= begin
      template = [
        'Jax.environment = Jax.PRODUCTION;',
        '',
        asset_paths,
        ''
      ].flatten
      
      Jax.application.javascript_sources.each { |jsfi| try_to_add_file(template, jsfi) }

      template
    end
  end
  
  def try_to_add_file(template, jsfi)
    if File.file?(jsfi) && !already_added?(jsfi)
      add_file(template, jsfi)
    end
  end
  
  def add_file(template, jsfi)
    relative_path = jsfi.sub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
    template << "//= require <#{relative_path}>"
    added_files << jsfi
  end
  
  def already_added?(jsfi)
    added_files.include?(jsfi)
  end
  
  def added_files
    @added_files ||= []
  end
  
  def asset_paths
    Jax.application.asset_paths.collect do |path|
      if File.directory?(path)
        "//= provide \"#{File.join(path, "").gsub(/^#{Regexp::escape Jax.root.to_s}\/?/, '')}\""
      end
    end.reject do |result|
      result.nil?
    end
  end
  
  def source_lines
    # basically the same as super but with a string instead of a file
    # TODO would templating be a worthy addition to Sprockets itself?
    @lines ||= begin
      lines = []
      comments = []
      
      template.each_with_index do |line, lineno|
        lines << line = Sprockets::SourceLine.new(self, line, lineno+1)
        if line.begins_pdoc_comment? || comments.any?
          comments << line
        end
        
        if line.ends_multiline_comment?
          if line.ends_pdoc_comment?
            comments.each { |l| l.comment! }
          end
          comments.clear
        end
      end

      lines
    end
  end
end
