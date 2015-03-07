"use strict";
var directories, fs, logger, path, register, runVolo, volo, wrench,
  __slice = [].slice;

path = require('path');

fs = require('fs');

volo = require('volo');

wrench = require('wrench');

logger = require('logmimosa');

exports.registerCommand = function(program, retrieveConfig) {
  return register(program, function() {
    var args, opts, retrieveConfigOpts;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (typeof args[0] !== 'string') {
      return logger.error("You must provide a name of a library to import.");
    }
    args.unshift('add');
    opts = args.pop();
    if (!opts.noamd) {
      args.push('-amd');
    }
    args.push('-f');
    retrieveConfigOpts = {
      mdebug: !!opts.mdebug,
      buildFirst: false
    };
    return retrieveConfig(retrieveConfigOpts, function(config) {
      var dirs;
      logger = config.log;
      dirs = directories(config);
      logger.debug("All directories found:\n" + (dirs.join('\n')));
      logger.green("\n  Into which directory would you like to import this library? \n");
      return program.choose(dirs, (function(_this) {
        return function(i) {
          var currentDir, desiredDir, done, fullDesiredDir;
          logger.blue("\n  You chose " + dirs[i] + ". \n");
          logger.info("Beginning import...");
          currentDir = process.cwd();
          desiredDir = dirs[i];
          fullDesiredDir = path.join(config.watch.sourceDir, desiredDir);
          logger.debug("Changing directory to [[ " + fullDesiredDir + " ]]");
          process.chdir(fullDesiredDir);
          done = function() {
            logger.debug("Removing package.json placed in [[ " + fullDesiredDir + " ]]");
            if (fs.existsSync('package.json')) {
              fs.unlinkSync('package.json');
            }
            logger.debug("And changing directory back to [[ " + currentDir + " ]]");
            process.chdir(currentDir);
            return process.exit(0);
          };
          return runVolo(args, desiredDir, config.watch.javascriptDir, done);
        };
      })(this));
    });
  });
};

runVolo = function(args, destDirectory, jsDir, callback) {
  logger.debug("Running volo with the following args:\n" + (JSON.stringify(args, null, 2)));
  return volo(args).then(function(okText) {
    var dependencyName;
    dependencyName = destDirectory.replace(jsDir, '').replace(path.sep, '');
    okText = okText.replace(/\s+at\s+([^\s]+)/g, function(a, b) {
      return " at " + (path.join(destDirectory, b));
    });
    okText = okText.replace(/\s+name:\s+([^\s]+)/g, function(a, b) {
      return " name: " + (path.join(dependencyName, b));
    });
    logger.success(okText + "\nImport Complete!");
    return callback();
  }, function(errText) {
    logger.error(errText);
    return callback();
  });
};

directories = function(config) {
  var items;
  items = wrench.readdirSyncRecursive(config.watch.sourceDir);
  return items.filter(function(f) {
    var fullPath;
    fullPath = path.join(config.watch.sourceDir, f);
    return fs.statSync(fullPath).isDirectory() && f.indexOf(config.watch.javascriptDir) >= 0;
  }).sort();
};

register = (function(_this) {
  return function(program, logger, callback) {
    return program.command('import').description("import libraries from github via the command line using volo").option("-n, --noamd", "will load the non-amd version").option("-D, --mdebug", "run in debug mode").action(callback).on('--help', function() {
      logger.green('  This command exposes basic volo (http://volojs.org/) functionality to import and install');
      logger.green('  libraries from GitHub.  Mimosa will ask you where you\'d like to import the library.  Then');
      logger.green('  your library will be fetched from GitHub and placed in the directory you chose.  Mimosa');
      logger.green('  will also fetch any dependent libraries.  For instance, if you import Backbone it will');
      logger.green('  also import jquery and underscore.');
      logger.blue('\n    $ mimosa import backbone\n');
      logger.green('  Mimosa assumes you want an AMD version of the library you are attempting to fetch and will');
      logger.green('  attempt to find that.  Should a non-AMD library be found, you will be asked to provide details');
      logger.green('  regarding dependencies and and export information.\n');
      logger.green('  Should you not want an AMD version, you can provide the \'import\' command with a --noamd');
      logger.green('  flag.  In this case an AMD version will not be sought, and a non-AMD version will not trigger ');
      logger.green('  a list of questions.');
      logger.blue('\n    $ mimosa import backbone --noamd');
      return logger.blue('    $ mimosa import backbone -n\n');
    });
  };
})(this);
