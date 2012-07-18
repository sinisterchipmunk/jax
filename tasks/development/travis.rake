desc "Run test suite using selenium under Travis-CI"
task :travis do
  ENV['DISPLAY'] = ':99.0'
  Rake::Task['jasmine'].invoke unless ENV["SKIP_WEBGL"]
end
