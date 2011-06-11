require 'thor/shell/basic'

class SpecShell < Thor::Shell::Basic
  attr_reader :stdin, :stdout, :stderr
  alias input stdin
  alias output stdout
  
  def initialize(options = { })
    super()
    @stdin  = StringIO.new(options[:in ] || '')
    @_stdout = options[:out] || ''
    @stdout = StringIO.new(@_stdout.dup)
    @stderr = StringIO.new(options[:err] || '')
  end
  
  def clear
    @stdout = StringIO.new(@_stdout.dup)
  end

  def ask(statement, color=nil)
    say("#{statement} ", color)
    @stdin.gets.strip
  end

  def say(message="", color=nil, force_new_line=(message.to_s !~ /( |\t)$/))
    message = message.to_s
    message = set_color(message, color) if color

    spaces = "  " * padding

    if force_new_line
      @stdout.puts(spaces + message)
    else
      @stdout.print(spaces + message)
    end
    @stdout.flush
  end

  def say_status(status, message, log_status=true)
    return if quiet? || log_status == false
    spaces = "  " * (padding + 1)
    color  = log_status.is_a?(Symbol) ? log_status : :green

    status = status.to_s.rjust(12)
    status = set_color status, color, true if color

    @stdout.puts "#{status}#{spaces}#{message}"
    @stdout.flush
  end

  def print_table(table, options={})
    return if table.empty?

    formats, ident, colwidth = [], options[:ident].to_i, options[:colwidth]
    options[:truncate] = terminal_width if options[:truncate] == true

    formats << "%-#{colwidth + 2}s" if colwidth
    start = colwidth ? 1 : 0

    start.upto(table.first.length - 2) do |i|
      maxima ||= table.max{|a,b| a[i].size <=> b[i].size }[i].size
      formats << "%-#{maxima + 2}s"
    end

    formats[0] = formats[0].insert(0, " " * ident)
    formats << "%s"

    table.each do |row|
      sentence = ""

      row.each_with_index do |column, i|
        sentence << formats[i] % column.to_s
      end

      sentence = truncate(sentence, options[:truncate]) if options[:truncate]
      @stdout.puts sentence
    end
  end

  def print_wrapped(message, options={})
    ident = options[:ident] || 0
    width = terminal_width - ident
    paras = message.split("\n\n")

    paras.map! do |unwrapped|
      unwrapped.strip.gsub(/\n/, " ").squeeze(" ").
      gsub(/.{1,#{width}}(?:\s|\Z)/){($& + 5.chr).
      gsub(/\n\005/,"\n").gsub(/\005/,"\n")}
    end

    paras.each do |para|
      para.split("\n").each do |line|
        @stdout.puts line.insert(0, " " * ident)
      end
      @stdout.puts unless para == paras.last
    end
  end

  def error(statement)
    @stderr.puts statement
  end
end