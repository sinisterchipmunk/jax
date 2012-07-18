YELLOW = "\e[33m"
BLUE = "\e[34m" # or 36
RED = "\e[31m"
RESET = "\e[0m"
FILES = Dir['src/**/*'] + Dir['lib/**/*']

def flag(color, tag)
  results = []
  max1 = 0
  max2 = 0
  FILES.each do |fi|
    if File.file?(fi)
      max1 = fi.length if max1 < fi.length
      result = %x[grep -Hni '#{tag}' '#{fi}'].sub(/fixme/i, '')
      if result =~ /^(.*?):(\d+):[\s\t]*(.*)$/
        results.push [ fi, $2, $3 ]
        max2 = $2.length if max2 < $2.length
      end
    end
  end
  results.each do |result|
    print color, tag.ljust(6), RESET, result[0].ljust(max1+1), ':', result[1].ljust(max2+1), result[2], "\n"
  end
end


namespace :flagged do
  desc "list all TODO items"
  task :todo do
    flag BLUE, 'TODO'
  end

  desc "list all FIXME items"
  task :fixme do
    flag YELLOW, 'FIXME'
  end

  desc "list all HACK items"
  task :hacks do
    flag RED, 'HACK'
  end
end

desc "list all flagged items"
task :flagged do
  Rake::Task['flagged:todo'].invoke
  Rake::Task['flagged:fixme'].invoke
  Rake::Task['flagged:hacks'].invoke
end
