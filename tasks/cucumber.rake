require 'cucumber/rake/task'
Cucumber::Rake::Task.new(:cucumber) do |t|
  t.cucumber_opts = ["-f", "pretty", "-f", "rerun", "-r", "features", "-o", "features/rerun.txt", "-t", "~@wip"]
  unless ENV['FEATURE']
    if !ENV['ALL'] &&
      File.file?(rerun = File.expand_path("../features/rerun.txt", File.dirname(__FILE__))) &&
      (rerun = File.read(rerun).strip).length > 0
      t.cucumber_opts << rerun.split(/\s/)
    else
      t.cucumber_opts << "features"
    end
  end
end
