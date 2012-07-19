namespace :guides do
  # gen docs first because we're going to include a direct link to the JS API
  task :generate do
    rm_rf "guides/output"
    # FIXME API docs skipped until they are working again
    # if !ENV["SKIP_API"]
    #   Rake::Task['doc'].invoke
    #   mkdir_p "guides/output"
    #   cp_r "doc/lib", "guides/output/lib"
    # end
    ENV["WARN_BROKEN_LINKS"] = "1" # authors can't disable this
    ruby "guides/jax_guides.rb"
  end

  desc 'Validate guides, use ONLY=foo to process just "foo.html"'
  task :validate do
    ruby "guides/w3c_validator.rb"
  end
  
  desc "Publish the guides"
  task :publish => 'guides:generate' do
    require 'rake/contrib/sshpublisher'
    mkdir_p 'pkg'
    `tar -czf pkg/guides.gz guides/output`
    Rake::SshFilePublisher.new("jaxgl.com", "~/guides/public", "pkg", "guides.gz").upload
    `ssh jaxgl.com 'cd ~/guides/public/ && tar -xvzf guides.gz && cp -rf guides/output/* . && rm -rf guides*'`
  end
end
