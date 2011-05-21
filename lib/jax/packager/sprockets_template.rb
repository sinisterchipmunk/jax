class Jax::Packager::SprocketsTemplate < Sprockets::SourceFile
  def initialize(environment)
    pathname = environment.pathname_from(File.join(Jax.root, "template.js"))
    super(environment, pathname)
  end
  
  def template
    @template ||= begin
      template = [
        'Jax.environment = Jax.PRODUCTION;',
        '',
        '//= provide "public/"',
        ''
      ]
      Dir[Jax.root.join("app/**/*.js")].each do |jsfi|
        if File.file?(jsfi)
          relative_path = jsfi.sub(/^#{Regexp::escape Jax.root.to_s}[\/\\]?/, '')
          template << "//= require \"#{relative_path}\""
        end
      end
      template.concat [
        "if (Jax.doVersionCheck) Jax.doVersionCheck('#{Jax::Version::STRING}');",
        "else alert('Your Jax gem version is newer than your Jax JavaScript library!\n\nRun `rake jax:update` to fix this.');"
      ]
      template
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
