require "haml"

STROPHE = {
  :url => "/strophejs/",
  :core => "../strophejs/src/",
  :plugins => "../strophejs/plugins/"
}

JS = {
  :jquery => FileList['**/jquery*.js'].sort,
  :strophe => {
    :core => FileList[STROPHE[:core] + "*.js"].sort,
    :plugins => FileList[STROPHE[:plugins] + "*.js"].exclude(/flxhr/).sort
  },
  :soashable => FileList["**/soashable*.js"]
}

CSS = FileList["**/*.css"]

task :haml do
  FileList['**/*.haml'].each do |filename|
    File.open(File.dirname(filename) + "/" + File.basename(filename, "haml") + "html", "w") do |file|
      template = Haml::Engine.new(File.read(filename))
      file.puts template.render(Object.new, {:javascript => JS, :strophe_url => STROPHE[:url], :css => CSS})
    end
  end
end

task :default => [:haml]
