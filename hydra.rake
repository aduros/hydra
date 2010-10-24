HYDRA_HOME = File.dirname(__FILE__);

LIBS = [
    HYDRA_HOME + "/closure",
    HYDRA_HOME + "/lib",
    HYDRA_HOME + "/src",
    "./src",
];
EXTERNS = [
    HYDRA_HOME + "/externs"
];

task :soy do
    rm_rf("build/soy");
    mkdir_p("build/soy");

    puts("Compiling templates...");
    system("java -jar '" + HYDRA_HOME + "/tools/SoyToJsSrcCompiler.jar'" +
        " --codeStyle concat --shouldGenerateJsdoc --shouldProvideRequireSoyNamespaces" +
        " --outputPathFormat build/soy/{INPUT_FILE_NAME_NO_EXT}.js" +
        " soy/*.soy");
end

task :css do
    puts("Compressing CSS...");
    system("java -jar '" + HYDRA_HOME + "/tools/yuicompressor.jar' web/static/style.css -o build/deploy/static/style.css");
end

task :js do
    options = {
        "warning_level" => "DEFAULT",
        "compilation_level" => "ADVANCED_OPTIMIZATIONS",
        "output_wrapper" => "/* Built with Hydra */(function(){%output%})()",
        "summary_detail_level" => "3",
    }
    defines = {
        "goog.DEBUG" => DEBUG ? "true" : "false",
    }
    errors = [ "accessControls", "checkRegExp", "checkTypes", "checkVars", "externsValidation",
        "ambiguousFunctionDecl", "invalidCasts", "missingProperties", "strictModuleDepCheck",
        "undefinedVars", "visibility" ]
    warnings = [ "deprecated", "nonStandardJsDocs", "unknownDefines" ]

    if DEBUG
        options["formatting"] = "PRETTY_PRINT";
    end

    LIBS.push("build/soy");
    system(
        "'" + HYDRA_HOME + "/closure/closure/bin/build/closurebuilder.py' --namespace '" + ENTRY_POINT + "'" +
        " " + LIBS.map {|path| "'--root=" + path + "'" }.join(" ") + 
        " -o compiled -c '" + HYDRA_HOME + "/tools/compiler.jar'" +
        " " + options.map {|key, value| "-f '--" + key + "=" + value + "'" }.join(" ") +
        " " + defines.map {|key, value| "-f --define=" + key + "=" + value}.join(" ") +
        " " + errors.map {|error| "-f --jscomp_error=" + error}.join(" ") +
        " " + warnings.map {|warning| "-f --jscomp_warning=" + warning}.join(" ") +
        " " + EXTERNS.map {|dir| FileList.new(dir+"/**/*.js").map {|file| "-f --externs=" + file}.join(" ")}.join(" ") +
        " --output_file=build/deploy/static/app.js"
        );
end

task :clean do
    rm_rf("build");
end

task :prepare => :clean do
    mkdir("build");
    cp_r("web", "build/deploy");
end

task :deploy => [:prepare, :css, :soy, :js]
