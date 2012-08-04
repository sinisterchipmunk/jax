require 'rocco/tasks'

namespace :doc do
  task :build_assets => :compile do
    # minify the compiled assets
    dir = File.dirname(__FILE__)
    require 'uglifier'

    src = Uglifier.new.compile(File.read(File.expand_path('../../tmp/jax.js', dir)))
    File.open(File.expand_path('../../doc/assets/jax.js', dir), "w") { |f| f.print src }
  end

  # preserve single-line comments in source code
  Rocco::CommentStyles::COMMENT_STYLES['coffee-script'][:single] = nil

  Rocco::Task.new :build_docs, 'doc/generated', 'doc/input/**/*.{js,coffee,rb,erb,glsl}', {
    :language => 'coffee-script',
    :stylesheet => File.expand_path('../../templates/rocco.css', File.dirname(__FILE__)),
    :template_file => File.expand_path('../../templates/rocco_layout.mustache.html', File.dirname(__FILE__))
  }

  task :clobber do
    FileUtils.rm_rf File.expand_path("../../doc/generated", File.dirname(__FILE__))
    Rake::Task['doc'].invoke
  end

  desc "publish docs to docs.jaxgl.com"
  task :publish => :doc do
    require 'rake/contrib/sshpublisher'
    mkdir_p 'pkg'
    `tar -czf pkg/docs.gz doc/generated doc/assets`
    Rake::SshFilePublisher.new("jaxgl.com", "~/docs/public", "pkg", "docs.gz").upload
    `ssh jaxgl.com 'cd ~/docs/public/ && tar -xvzf docs.gz && \
     cp -rf doc/generated/doc/input/* . && rm -rf ./assets && cp -rf doc/assets ./assets && rm -rf doc*'`
  end
end

desc "Build documentation"
task :doc => ['doc:build_assets', 'doc:build_docs']

desc "Clobber and rebuild API docs"
task :redoc => ['doc:clobber', 'doc']
