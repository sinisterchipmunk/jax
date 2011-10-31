require 'rest_client'

module Jax::Plugin
  class Credentials
    attr_reader :home, :shell
  
    def api_key
      @api_key ||= find_api_key
    end
  
    def initialize(options = {})
      @shell = options[:shell] || Thor::Shell::Basic.new
      @home = home_path(options)
    end
  
    def config_file
      File.join(home, ".jax")
    end
  
    def home_path(options = {})
      File.expand_path(options[:home] || Thor::Util.user_home)
    end
  
    def plugins
      @plugins ||= RestClient::Resource.new(File.join(Jax.config.plugin_repository_url, "plugins"), :accept => :xml)
    end

    def authors
      @authors ||= RestClient::Resource.new(File.join(Jax.config.plugin_repository_url, "authors"), :accept => :xml)
    end
  
    def profile
      @profile ||= RestClient::Resource.new(File.join(Jax.config.plugin_repository_url, "profile"), :accept => :xml)
    end
  
    private
    def login
      profile.options[:user] = email
      profile.options[:password] = password
    
      begin
        Hash.from_xml(profile.get).with_indifferent_access
      rescue RestClient::RequestFailed => err # login doesn't exist
        message = Hash.from_xml($!.http_body)
        if message && (message = message['hash']) && (message = message['error']) && (message =~ /Login not found/i)
          create_account
        else
          raise err
        end
      rescue RestClient::Unauthorized # bad password
        raise "Invalid password."
      end
    end
  
    def email
      @email ||= begin
        shell.ask "Please enter your email address: "
      end
    end
  
    def password
      @password ||= begin
        shell.ask "Please enter your password: "
      end
    end
  
    def create_account
      confirmation = shell.ask "Please confirm your password: "
      raise "Password and confirmation don't match" if confirmation != password
    
      login = email && email[/\@/] ? email[0...$~.offset(0)[0]] : email
      Hash.from_xml(profile.post(:author => {
        :login => login, :password => password, :password_confirmation => confirmation, :email => email
      })).with_indifferent_access
    rescue RestClient::RequestFailed
      raise Hash.from_xml($!.http_body)['hash']['error']
    end
  
    def find_api_key
      if File.file?(config_file)
        yml = (YAML::load(File.read(config_file)) || {}).with_indifferent_access
        if yml[:api_key]
          yml[:api_key]
        else
          key = login[:author][:single_access_token]
          yml[:api_key] = key
          File.open(config_file, "w") { |f| f.print yml.to_yaml }
          key
        end
      else login[:author][:single_access_token]
      end
    end
  end
end
