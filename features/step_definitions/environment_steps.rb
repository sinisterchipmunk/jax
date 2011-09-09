Given /^file "([^"]*)" contains "([^"]*)"$/ do |arg1, arg2|
  create_file arg1, arg2
end

When /^I visit "([^"]*)"$/ do |arg1|
  visit arg1
end

Given /^shader "([^"]*)" exists$/ do |arg1|
  create_shader arg1, :vertex => "void main(void) { gl_Position = vec4(0,0,0,1); }"
end

Given /^I clear the cache$/ do
  # FileUtils.rm_rf File.expand_path("../../tmp/cache", File.dirname(__FILE__))
end