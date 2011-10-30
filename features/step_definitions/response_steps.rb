Then /^show me the response$/ do
  puts page.body
end

Then /^I should see:$/ do |text|
  page.body.should =~ /#{Regexp::escape(text)}/
end

# Basically the same as 'I should see' but used for matchers
# against jax/application.js, which is huge.
Then /^the response should contain:$/ do |text|
  (!!page.body.to_s[text]).should be_true
end
