module Jax::Generators::SourceRoot
  def source_root
    @source_root ||= File.expand_path("../../../../../templates", File.dirname(__FILE__))
  end
end
