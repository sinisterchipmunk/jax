Given /^the WebGL start page is "([^"]*)"$/ do |arg1|
  Jax.config.webgl_start = arg1
end

Then /^the WebGL start path should be "([^"]*)"$/ do |arg1|
  url_for(Jax.config.webgl_start).should == arg1
end

Given /^the WebGL start page is a hash with the following keys:$/ do |table|
  Jax.config.webgl_start = table.hashes.first
end
