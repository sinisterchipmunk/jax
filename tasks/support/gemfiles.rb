require 'rails'

BASE = File.expand_path('../../gemfiles', File.dirname(__FILE__))

def current_testbed
  "rails:#{Rails.version[/^\d+\.\d+/]}"
end

def run desc, *cmd
  puts (['bundle', 'exec'] + cmd).join(' ')
  unless system *cmd
    raise [desc, 'failed'].join(' ')
  end
end

def each_gemfile
  gemfiles = Dir[File.join(BASE, '**/*')]
  gemfiles.select! { |f| File.file?(f) }
  gemfiles.each do |gemfile|
    next if gemfile[/\.lock$/]
    path = gemfile.sub(/^#{Regexp::escape BASE}\/?/, '').split(/[\\\/]/)
    yield gemfile, path
  end
end

def namespace_for_gemfile path, index = 0, &block
  if path.length - index > 1
    namespace path[index] do
      namespace_for_gemfile path, index + 1, &block
    end
  else
    yield path
  end
end

def namespace_each_gemfile
  each_gemfile do |gemfile, path|
    namespace_for_gemfile path do
      yield gemfile, path
    end
  end
end
