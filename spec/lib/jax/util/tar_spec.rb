require 'spec_helper'

describe Jax::Util::Tar do
  include Jax::Util::Tar
  
  it "should use relative paths, not absolute ones" do
    src = File.expand_path("../../../../tmp/jax-tar", File.dirname(__FILE__))
    dest = File.expand_path("../../../../tmp/jax-tar/dst", File.dirname(__FILE__))
    
    FileUtils.rm_rf src  if File.exist?(src)
    FileUtils.rm_rf dest if File.exist?(dest)
    
    FileUtils.mkdir_p src unless File.directory?(src)
    Dir.chdir src do
      File.open "root-file", "w" do |f|
        f.print "CONTENT"
      end
    end
    
    tarfile = tar src
    untar tarfile, dest
    
    File.should exist(File.join(dest, "root-file"))
    File.read(File.join(dest, "root-file")).should == "CONTENT"
  end
end
