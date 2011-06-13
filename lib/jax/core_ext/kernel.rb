module Kernel
  def detect_caller
    # Remove the line number from backtraces making sure we don't leave anything behind
    call_stack = caller.map { |p| p.sub(/:\d+.*/, '') }
    File.dirname(call_stack.detect { |p| p !~ %r[jax[\w.-]*/lib/jax] })
  end
end
