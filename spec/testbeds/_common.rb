# This file is loaded after the Rails application is loaded, but before
# it is initialized. It is used to inject common code (e.g. test fixtures)
# into the Rails application paths.

Rails.application.class.initializer 'common', :after => 'sprockets.environment' do |app|
  app.assets.prepend_path File.expand_path('_common/app/assets/javascripts', File.dirname(__FILE__))
end

# HACK teach jasmine to look for assets in _common without having to modify
# jasmine.yml -- this allows us to regenerate the Rails app at will without
# having to postprocess jasmine.yml.
class Jasmine::Headless::FilesList
  alias _asset_paths asset_paths
  def asset_paths
    paths = _asset_paths
    # pull out rails root if present
    paths.collect! { |p| p.sub(/^#{Regexp::escape Rails.root.to_s}\/?/, '') }
    paths = paths.collect { |p| File.join('../_common', p) } + paths
    paths.collect! do |p|
      File.expand_path(p, Rails.root.to_s)
    end
    paths
  end
end
