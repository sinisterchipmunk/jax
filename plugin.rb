#!/usr/bin/env ruby

require 'rest_client'
require 'active_support/core_ext'

Author  = RestClient::Resource.new("http://localhost:3000/author", :accept => :xml)
JAX_CONFIG = File.expand_path("~/.jax")

def fatal(message)
  error message
  exit
end

def error(message)
  puts message
  puts
end

def bug(message)
  fatal "BUG: #{message}"
end

def restart
  exec "ruby", $0, *ARGV
end

def prompt(msg)
  print msg.strip, " "
  gets.chomp
end

def welcome
  puts "Welcome!"
  puts
end

def create_passwd
  passwd = prompt "Please choose a password:"
  passwd_conf = prompt "Please confirm your password:"
  
  if passwd != passwd_conf
    error "Passwords do not match. Please try again."
    create_passwd
  end
  
  passwd
end

def create_account(login)
  welcome
  passwd = create_passwd
  email = prompt "Please enter your email, in case you lose your password:"
  
  Hash.from_xml(Author.post(:author => {
    :login => login, :password => passwd, :password_confirmation => passwd, :email => email
  }))
rescue RestClient::RequestFailed
  error Hash.from_xml($!.http_body)['hash']['error']
  restart
end

def login_without_api_key
  api_key = nil
  
  login = prompt "Login:"
  Author.options[:user] = login
  
  begin
    Author.get
    bug "Didn't expect #{hash.inspect} to be authorized"
  rescue RestClient::RequestFailed # this happens when the login doesn't exist
    hash = create_account login
  rescue RestClient::Unauthorized # this happens because passwd was omitted
    passwd = prompt "Password:"
    Author.options[:password] = passwd
    hash = Hash.from_xml(Author.get)
  end

  if author = hash && hash['author']
    api_key = author['single_access_token']
    bug "Couldn't query API key! Result was:\n#{res.body}" if !api_key
    File.open(JAX_CONFIG, "w") { |f| f.puts({ :api_key => api_key }.to_yaml) }
  else
    bug "Unexpected result: #{hash.inspect}"
  end

  api_key
rescue RestClient::Unauthorized
  fatal "Invalid password."
rescue RestClient::RequestFailed
  res = Hash.from_xml($!.http_body)
  fatal res['hash']['error']
end

def api_key
  if File.exist?(JAX_CONFIG)
    require 'yaml'
    YAML::load(File.read(JAX_CONFIG))[:api_key]
  else
    login_without_api_key
  end
end

plugin = {
  :single_access_token => api_key,
  :plugin => {
    :name => "test",
    :description => "descr",
    :version => "1.0.1",
    :stream => File.new("Gemfile", "r")
  }
}

begin
  res = Hash.from_xml(Author['plugins'].post plugin)
  puts res.inspect
rescue RestClient::RequestFailed
  res = Hash.from_xml($!.http_body)
  if error = res['hash'] && res['hash']['error']
    fatal error
  else
    fatal "A server-side error has occurred."
  end
end
