module Jax::Generators::Actions
  def prompt_yn(message, options = {})
    yn = ask(message).downcase[0]
    throw :aborted, "Aborted by user." if yn != ?y
  end
  
  def menu(items, options = {})
    min = 1
    if options[:allow_all]
      say_option 0, "All candidates"
      min = 0
    end
    
    items.each_with_index do |item, index|
      say_option index+1, item
    end
    which = menu_choice(:min => min, :max => items.length)
                    
    if which == -1
      items.each_with_index { |item, index| yield item, index }
    else
      yield items[which], which
    end
  end
  
  def menu_choice(*args)
    options = args.extract_options!
    caption, addl_caption = *args
    caption = "Please select an option, or press ctrl+c to cancel >" unless caption
    
    which = ask("#{addl_caption}#{caption}")
    sel = which.to_i
    # if sel.to_s != which then which is non-numeric
    if sel.to_s != which || options[:min] && sel < options[:min] || options[:max] && sel > options[:max]
      menu_choice(caption, "Invalid choice. ")
    else
      sel - 1
    end
  end
  
  def say_option(which, caption)
    say "\t#{which}\t: #{caption}"
  end
  
  def overwrite(path)
    path = path.to_s
    if File.exist? path
      prompt_yn "Path '#{path}' already exists! Delete it?"
      FileUtils.rm_rf path
    end
  end
end
