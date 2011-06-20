require 'test_helper'

class Jax::Generators::Plugin::CredentialsTest < IsolatedTestCase
  def shell
    @shell ||= SpecShell.new
  end
  
  def subject
    @subject ||= Jax::Generators::Plugin::Credentials.new(
      :home => FIXTURES_PATH,
      :in => shell.stdin,
      :out => shell.stdout
    )
  end
  
  def setup
    build_app
    boot_app
    FileUtils.rm fixture_path(".jax") if File.exist?(fixture_path(".jax"))
  end
  
  test "with new account" do
    shell.stdin.returns [
      'missing@gmail.com',
      'password', 'password'
    ]
    
    assert_equal "WXTzIXC2ODdbLAyvVL9p", subject.api_key
  end
  
  test "with missing config file and valid existing credentials" do
    shell.stdin.returns [
      'sinisterchipmunk@gmail.com',
      'password'
    ]
    
    assert_equal "WXTzIXC2ODdbLAyvVL9p", subject.api_key
  end
  
  test "with missing config file and invalid credentials for an existing account" do
    shell.stdin.returns [
      'missing@gmail.com',
      'invalid'
    ]
    
    assert_raises(RuntimeError) { subject.api_key }
  end
  
  test "with missing api key" do
    shell.stdin.returns [
      'missing@gmail.com',
      'password', 'password'
    ]
    subject.api_key
    
    assert_match /email/i, shell.stdout.string
  end
  
  test "with api key" do
    stub_fixture(".jax") { |f| f.print 'api_key: "1234"' }
    
    assert_equal "1234", subject.api_key
  end
  
  test "default home" do
    assert_equal File.expand_path("~"), Jax::Generators::Plugin::Credentials.new.home
  end
  
  test "override home" do
    assert_equal File.expand_path("."), Jax::Generators::Plugin::Credentials.new(:home => ".").home
  end
end
