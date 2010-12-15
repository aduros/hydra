HYDRA_HOME = File.dirname(__FILE__);

LIBS = [
    HYDRA_HOME + "/closure",
    HYDRA_HOME + "/lib",
    HYDRA_HOME + "/src",
    "./src",
    "./build/soy"
];
EXTERNS = [
    HYDRA_HOME + "/externs"
];

TARGET_NAMES = [
    "unsupported", "webkit", "ff3", "ff4", "ie9", "opera"
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

def run_compiler (defines, entry_point, output_file)
# TODO: Merge in these options instead of replacing...
    options = {
        "warning_level" => "DEFAULT",
        "compilation_level" => "ADVANCED_OPTIMIZATIONS",
        "output_wrapper" => "/* Built with Hydra */(function(){%output%})()",
        "summary_detail_level" => "3",
    }
    defines["goog.DEBUG"] = DEBUG ? "true" : "false";
    errors = [ "accessControls", "checkRegExp", "checkTypes", "checkVars", "externsValidation",
        "ambiguousFunctionDecl", "invalidCasts", "missingProperties", "strictModuleDepCheck",
        "undefinedVars", "visibility" ]
    warnings = [ "deprecated", "nonStandardJsDocs", "unknownDefines" ]

    if DEBUG
        options["formatting"] = "PRETTY_PRINT";
    end

    system(
        "'" + HYDRA_HOME + "/closure/closure/bin/build/closurebuilder.py' --namespace '" + entry_point + "'" +
        " " + LIBS.map {|path| "'--root=" + path + "'" }.join(" ") + 
        " -o compiled -c '" + HYDRA_HOME + "/tools/compiler.jar'" +
        " " + options.map {|key, value| "-f '--" + key + "=" + value + "'" }.join(" ") +
        " " + defines.map {|key, value| "-f \"--define=" + key + "=" + value + "\""}.join(" ") +
        " " + errors.map {|error| "-f --jscomp_error=" + error}.join(" ") +
        " " + warnings.map {|warning| "-f --jscomp_warning=" + warning}.join(" ") +
        " " + EXTERNS.map {|dir| FileList.new(dir+"/**/*.js").map {|file| "-f --externs=" + file}.join(" ")}.join(" ") +
        " '--output_file=" + output_file + "'"
        );
end

def compile_app (target)
    puts("Compiling JS for '" + target + "'...");
    defines = {
        "hydra.platform.COMPILED_TARGET" => String(TARGET_NAMES.index(target)),
        "hydra.APP_NAME" => "'" + String(APP_NAME) + "'", # String defines must be in single quotes, FFS.
    }
    run_compiler(defines, ENTRY_POINT, "build/deploy/static/app-" + target + ".js");
end

task :js do
    compile_app(DEFAULT_TARGET);
end

task :js_all do
    for ii in 0..TARGET_NAMES.length-1 do
        compile_app(TARGET_NAMES[ii]);
    end
end

task :launcher do
    run_compiler({}, "hydra.launcher", "build/deploy/static/launcher.js");
end

task :clean do
    rm_rf("build");
end

task :prepare => :clean do
    mkdir("build");
    cp_r("web", "build/deploy");
end

task :deploy => [:prepare, :css, :soy, :launcher, :js_all]
