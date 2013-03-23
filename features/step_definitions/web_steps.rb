When 'I wait long enough for an iframe to load' do
  sleep 5
  puts page.body
end

When /^I should see "([^"]*)" within the iframe$/ do |content| # "
  within_frame "iframe" do
    page.should have_content content
  end
end

When /^I should see "([^"]*)" within the iframe$/ do |content| # "
  within_frame "iframe" do
    page.should have_content content
  end
end

When(/^I follow "(.*?)"$/) do |arg1|
  page.click_link arg1
end

Then /^the page source should contain "(.*?)"$/ do |arg|
  page.body.should include(arg)
end

Then /^I should see "(.*?)"$/ do |arg|
  page.should have_content arg
end

When /^I go to the page in the iframe source$/ do
  visit page.find("iframe")['src']
end

Given(/^I am on the WebGL start page$/) do
  visit url_for(Jax.config.webgl_start)
end

Then /^(?:|I )should see an? "([^"]*)" element$/ do |element_name| # "
  page.should have_xpath("//#{element_name}")
end
