require 'spec_helper'

describe Jax::PluginManager do
  def shell
    @shell ||= GenSpec::Shell.new
  end
  
  def input(str)
    shell.new shell.output, str
  end
  
  def destination_root
    @destination_root ||= ::Rails.application.root.to_s
  end

  def generate(*args)
    Jax::PluginManager.start args, :shell => shell,
                                                        :destination_root => destination_root
    shell.output.string.tap { shell.new }
  end
  
  def generate_plugin(name)
    Jax::Generators::PluginGenerator.start([name], :shell => shell, :destination_root => ::Rails.application.root)
    shell.new
    ENV['JAX_CWD'] = @destination_root = ::Rails.application.root.join('vendor/plugins', name).to_s
    Jax::Plugin::Manifest.new(name)
  end
  
  it "push plugin with edited manifest" do
    manifest = generate_plugin 'cloud'
    manifest.description = "a cloudy day"
    manifest.save
  
    # how to test success? A file has been uploaded. For now we'll just verify nothing raised...
    input "sinisterchipmunk@gmail.com\npassword\n"
    proc { generate 'push' }.should_not raise_error
  end

  it "push plugin with default manifest" do
    generate_plugin 'cloud'
    result = generate "push"
    result.should =~ /enter a plugin description/
  end

  it "push plugin without manifest" do
    generate_plugin 'cloud'
    manifest = local "vendor/plugins/cloud/manifest.yml"
    FileUtils.rm manifest if File.file?(manifest)

    result = generate "push"

    result.should =~ /manifest is missing/i
    result.should =~ /create/
    File.should be_file(manifest)
  end

  it "push plugin outside plugin dir" do
    generate_plugin 'cloud'
    ENV['JAX_CWD'] = local "."
    result = generate "push"
    result.should =~ /aborted/i
  end
end
