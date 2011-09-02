# check the RailsApplicationHelper to make sure it's working as expected
require 'spec_helper'

describe RailsApplicationHelper, :type => :rails do
  it "should load" do
    app.load!
    Rails.application.should be_kind_of(RailsApp::Application)
  end
  
  it "should find assets" do
    app.load!

    app.file "app/assets/javascripts/test.js.erb" do |f|
      f.print "alert()"
    end

    app.get('/assets/test.js').body.should match("alert()")
  end
  
  # it "should run in isolation" do
  #   if defined?(Rails.application)
  #     Rails.application.should_not be_kind_of(RailsApp::Application)
  #   else
  #     # nothing to test, this passes too
  #   end
  # end
end
