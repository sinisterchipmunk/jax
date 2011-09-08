Then /^show me the response$/ do
  puts page.body
end

Then /^I should see:$/ do |text|
  page.body.should =~ /#{Regexp::escape(text)}/
end
