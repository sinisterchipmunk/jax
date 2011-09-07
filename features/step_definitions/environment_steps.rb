Given /^file "([^"]*)" contains "([^"]*)"$/ do |arg1, arg2|
  create_file arg1, arg2
end

When /^I visit "([^"]*)"$/ do |arg1|
  visit arg1
end
