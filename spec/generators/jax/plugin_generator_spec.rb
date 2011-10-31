require 'spec_helper'

describe 'jax:plugin' do
  EXPECTED_FILES = %w(
    vendor/plugins/cloud/app/assets/jax/controllers
    vendor/plugins/cloud/app/assets/jax/models
    vendor/plugins/cloud/app/assets/jax/helpers
    vendor/plugins/cloud/app/assets/jax/views
    vendor/plugins/cloud/app/assets/jax/resources
    vendor/plugins/cloud/public
    vendor/plugins/cloud/spec
    vendor/plugins/cloud/manifest.yml
    vendor/plugins/cloud/init.rb
    vendor/plugins/cloud/install.rb
    vendor/plugins/cloud/uninstall.rb
  )
  
  before :each do
    Jax.config.plugin_repository_url = Jax.config.default_plugin_repository_url
  end
  
  before_generation do |dir|
    ::Rails.application.stub!(:root).and_return(Pathname.new dir)
  end
  
  with_args "cloud" do
    context "remote repo unavailable" do
      before :each do
        Jax.config.plugin_repository_url = "http://nowhere.example.com"
      end
      
      with_input "y\n" do
        it "with confirmation" do
          subject.should output(/an error occurred/i)
          EXPECTED_FILES.each do |fi|
            subject.should generate(fi)
          end
        end
      end
      
      with_input "n\n" do
        it "with abort" do
          subject.should output(/aborted/)
          EXPECTED_FILES.each do |fi|
            # FIXME this is outputting empty lines into the test results. Why?
            subject.should_not generate(fi)
          end
        end
      end
    end
  end
  
  context "new plugin not in repo" do
    with_args "missing" do
      it "should generate expected files" do
        # is this not a double of 'clean new plugin'? why does that one not fail?
        # probably screwed up the fixture somehow. wutevs, this test is the real
        # deal.
        EXPECTED_FILES.each do |fi|
          subject.should generate(fi.gsub(/cloud/, 'missing'))
        end
      end
    end
  end
  
  with_args "cloud" do
    context "a clean new plugin" do
      it "should generate expected files" do
        EXPECTED_FILES.each do |fi|
          subject.should generate(fi)
        end
      end
    end
  
    context "overwriting a locally conflicting name" do
      with_input "y\n" do
        before_generation do |d|
          FileUtils.mkdir_p File.join(d, "vendor/plugins/cloud")
          File.open(File.join(d, "vendor/plugins/cloud/custom"), "w") { |f| f.print "file contents" }
        end

        it "should remove the offending file" do
          subject.should_not generate("vendor/plugins/cloud/custom")
        end
      
        it "should not abort generating the plugin" do
          subject.should generate("vendor/plugins/cloud")
        end
      end
    end

  end

  context "using a conflicting name with --local" do
    with_args "clouds", "--local"
    
    it "should not abort" do
      subject.should_not output(/aborted/)
    end
    
    it "should generate the plugin" do
      subject.should generate("vendor/plugins/clouds")
    end
  end


  context "without remote name conflicts" do
    with_args "cloud"
    
    it "should not abort" do
      subject.should_not output(/aborted/)
    end
    
    it "should generate the plugin" do
      subject.should generate("vendor/plugins/cloud")
    end
  end
  
  context "aborting remote name conflicts" do
    with_input "n\n"
    with_args "clouds"
    
    it "should abort" do
      subject.should output(/aborted/)
    end
    
    it "should not generate the plugin" do
      subject.should_not generate('vendor/plugins/clouds')
    end
  end
      
  context "allowing remote name conflicts" do
    with_input "y\n"
    with_args "clouds"
    
    it "should not abort" do
      subject.should_not output(/aborted/)
    end
    
    it "should generate the plugin" do
      subject.should generate("vendor/plugins/clouds")
    end
  end
end
