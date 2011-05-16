#require 'active_support/core_ext/object/inclusion'
#   above file isn't in release yet, so we'll re-code it here -- it's only 1 method
class Object
  # Returns true if this object is included in the argument. Argument must be
  # any object which responds to +#include?+. Usage:
  #
  #   characters = ["Konata", "Kagami", "Tsukasa"]
  #   "Konata".in?(characters) # => true
  #
  # This will throw an ArgumentError if the argument doesn't respond
  # to +#include?+.
  def in?(another_object)
    another_object.include?(self)
  rescue NoMethodError
    raise ArgumentError.new("The parameter passed to #in? must respond to #include?")
  end
end

require File.join(File.dirname(__FILE__), 'common')

module JaxGuides
  module TextileExtensions
    def notestuff(body)
      body.gsub!(/^(IMPORTANT|CAUTION|WARNING|NOTE|INFO)[.:](.*)$/) do |m|
        css_class = $1.downcase
        css_class = 'warning' if css_class.in?(['caution', 'important'])

        result = "<div class='#{css_class}'><p>"
        result << $2.strip
        result << '</p></div>'
        result
      end
    end

    def tip(body)
      body.gsub!(/^TIP[.:](.*)$/) do |m|
        result = "<div class='info'><p>"
        result << $1.strip
        result << '</p></div>'
        result
      end
    end

    def plusplus(body)
      body.gsub!(/\+(.*?)\+/) do |m|
        "<notextile><tt>#{$1}</tt></notextile>"
      end

      # The real plus sign
      body.gsub!('<plus>', '+')
    end

    def code(body)
      body.gsub!(%r{<(#{JaxGuides.code_aliases})>(.*?)</\1>}m) do |m|
        es = ERB::Util.h($2)
        css_class = $1.in?(['erb', 'shell']) ? 'html' : $1
        %{<notextile><div class="code_container"><code class="#{css_class}">#{es}</code></div></notextile>}
      end
    end
  end
end
