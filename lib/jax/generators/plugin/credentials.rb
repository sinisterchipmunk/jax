require 'rest_client'

class Jax::Generators::Plugin::Credentials
  attr_reader :home, :out, :in
  
  def api_key
    @api_key ||= find_api_key
  end
  
  def initialize(options = {})
    @home = File.expand_path(options[:home] || "~")
    @out = options[:out] || $stdout || STDOUT
    @in = options[:in] || $stdin || STDIN
  end
  
  def config_file
    File.join(home, ".jax")
  end

  def author
    @author ||= RestClient::Resource.new(File.join(Jax.application.plugin_repository_url, "author"), :accept => :xml)
  end
  
  private
  def login
    author.options[:user] = email
    author.options[:password] = password
    
    begin
      Hash.from_xml(author.get).with_indifferent_access
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
      print "Please enter your email address: "
      gets.chomp
    end
  end
  
  def password
    @password ||= begin
      print "Please enter your password: "
      gets.chomp
    end
  end
  
  def create_account
    print "Please confirm your password: "
    confirmation = gets.chomp
    raise "Password and confirmation don't match" if confirmation != password
    
    Hash.from_xml(author.post(:author => {
      :login => email, :password => password, :password_confirmation => confirmation, :email => email
    })).with_indifferent_access
  rescue RestClient::RequestFailed
    raise Hash.from_xml($!.http_body)['hash']['error']
  end
  
  def puts(*a)
    out.puts *a
  end
  
  def print(*a)
    out.print *a
  end
  
  def gets(*a)
    self.in.gets(*a).to_s
  end
  
  def find_api_key
    if File.file?(config_file)
      yml = (YAML::load(File.read(config_file)) || {}).with_indifferent_access
      yml[:api_key] || login[:author][:single_access_token]
    else login[:author][:single_access_token]
    end
  end
end