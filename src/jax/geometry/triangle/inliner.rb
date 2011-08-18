src = File.read("tri_tri_intersect.js")

# build list of inline functions
inlines = []
signature_rx = /function\s*\/\*\s*inline\s*\*\/\s*([a-zA-Z0-9_$]+)\s*\((.*?)\)\s*\{/m

while src =~ signature_rx
  function_definition_offset = $~.offset(0)[0]
  function_body_offset_start = $~.offset(0)[1]
  function_body_offset_end = function_body_offset_start
  function_name = $1
  params_list = $2.split(/,/)
  puts "Inline: #{function_name}(#{params_list}) (beginning at offset #{function_body_offset_start})"
  
  scope_depth = 1
  for i in function_body_offset_start...src.length
    case src[i]
      when ?{
        scope_depth += 1
      when ?}
        scope_depth -= 1
        if scope_depth == 0 # function body end
          function_body_offset_end = i
          break
        end
    end
  end
  if scope_depth > 0
    raise "Couldn't find a closing curly brace for inline function #{function_name}!"
  end
  
  function_body = src[function_body_offset_start...function_body_offset_end]
  
  src = (src[0...function_definition_offset].to_s + src[(function_body_offset_end+1)..-1].to_s).strip

  # last step: make sure param names are unique to this function
  params_list.collect! do |name|
    new_name = "#{function_name}_#{name}"
    # function_body.gsub! /#{Regexp::escape name}/, new_name
    function_body.gsub! /([^a-zA-Z0-9_$])#{Regexp::escape name}([^a-zA-Z0-9_$])/, "\\1#{new_name}\\2"
    new_name
  end

  inlines << { :name => function_name, :params => params_list, :body => function_body }
end

# parse src and replace funcalls to inline functions
again = true
while again
  again = false
  inlines.each do |inline|
    if src =~ /#{inline[:name]}\s*\(/
      function_call_start = $~.offset(0)[0]
      function_params_start = $~.offset(0)[1]
      function_params_end = function_params_start
      parens_depth = 1
      for i in function_params_start...src.length
        case src[i]
        when ?(
          parens_depth += 1
        when ?)
          parens_depth -= 1
          if parens_depth == 0 # params end
            # see if there's (optionally, white space, followed by) a semicolon
            # if there is, it's superfluous; get rid of it.
            if src[(i+1)..-1] =~ /\A([\s\n\t]*;)/m
              src[(i+1)..(i+$1.length)] = ""
            end
            function_params_end = i
            break
          end
        end
      end
      params = src[function_params_start...function_params_end].split(/,/)
      puts "Discovered call to #{inline[:name]} with params: #{params.inspect}"
    
      if params.length != inline[:params].length
        raise "Incorrect params length: #{params.length} for #{inline[:params].length}\n\t\t\t(expected params are: #{inline[:params].inspect})"
      end
      inline_body = inline[:body].dup
      for i in 0...params.length
        inline_body.gsub! /([^a-zA-Z0-9_$])#{Regexp::escape inline[:params][i]}([^a-zA-Z0-9_$])/, "\\1#{params[i]}\\2"
      end
    
      inline_body = "/* (inline function #{inline[:name]}) */\n#{inline_body}"
      src[function_call_start..function_params_end] = inline_body
      again = true
    end
  end
end

dst = File.open("tri_tri_intersect_optimized.js", "w") do |f|
  f.puts src
end
