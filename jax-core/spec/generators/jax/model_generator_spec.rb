require 'spec_helper'

describe "jax:model" do
  with_args 'post', 'subject:string', 'body:text' do
    it "should generate coffee file" do
      subject.should generate("app/assets/jax/models/post.js.coffee")
    end
    
    it "should generate coffee spec" do
      subject.should generate("spec/javascripts/jax/models/post_spec.js.coffee") { |fi|
        fi.should =~ /expect\(model.subject\)/
        fi.should =~ /expect\(model.body\)/
      }
    end

    it "should not generate JS file" do
      subject.should_not generate("app/assets/jax/models/post.js")
    end
    
    it "should not generate JS spec" do
      subject.should_not generate("spec/javascripts/jax/models/post_spec.js")
    end
    
    it "should generate resource file" do
      subject.should generate("app/assets/jax/resources/posts/default.js.coffee") { |f|
        f.should =~ /subject:/
        f.should =~ /body:/
      }
    end
  end
  
  with_args 'post', 'subject:string', 'body:text', '-j' do
    it "should not generate coffee file" do
      subject.should_not generate("app/assets/jax/models/post.js.coffee")
    end
    
    it "should not generate coffee spec" do
      subject.should_not generate("spec/javascripts/jax/models/post_spec.js.coffee")
    end

    it "should generate JS file" do
      subject.should generate("app/assets/jax/models/post.js")
    end
    
    it "should generate JS spec" do
      subject.should generate("spec/javascripts/jax/models/post_spec.js") { |fi|
        fi.should =~ /expect\(model.subject\)/
        fi.should =~ /expect\(model.body\)/
      }
    end

    it "should generate resource file" do
      subject.should generate("app/assets/jax/resources/posts/default.js.coffee") { |f|
        f.should =~ /subject:/
        f.should =~ /body:/
      }
    end
  end
  
  with_args 'post', 'subject:string', 'body:text', '--rails' do
    it "should generate rails model" do
      subject.should generate('app/models/post.rb')
    end

    it "should generate resource file" do
      subject.should generate("app/assets/jax/resources/posts/default.js.coffee") { |f|
        f.should =~ /subject:/
        f.should =~ /body:/
      }
    end
  end
end
