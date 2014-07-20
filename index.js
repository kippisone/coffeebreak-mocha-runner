var path = require('path'),
    fs = require('fs'),
    Mocha = require('mocha'),
    extend = require('node.extend');

/**
 * Runs node.js tests using Mocha
 */
module.exports = function(coffeeBreak) {
	"use strict";

	coffeeBreak.registerTask('test', function(conf, logger, done) {
		// console.log('Node.JS test runner', conf);

        if (conf.browser) {
            logger.dev('Skipping browser tests in Mocha runner');
            done();
            return;
        }

        //Expect bubndle
        process.stdout.write('\n  \u001b[1;4;38;5;246mRun node.js testst of project ' + conf.project + ' using Mocha\u001b[m\n\n');
        var expectBundle = path.join(coffeeBreak.baseDir, 'node_modules/coffeebreak-expect-bundle');
        if (fs.existsSync(expectBundle)) {
            require(expectBundle);
        }

        //Load requires
         if (conf.require) {
            if (!Array.isArray(conf.require)) {
                conf.require = conf.require.split(/\s+/);
            }

            conf.require.forEach(function(mod) {
                require(mod);
            });
        }

        extend(process.env, {
            'NODE_ENV': 'test'
        });

        var mocha = new Mocha({
            ui: 'bdd',
            reporter: 'spec'
        });
        
        var files = conf.tests;


        files.forEach(function(file) {
            logger.dev('Add file to mocha:' + path.join(conf.cwd, file));
            mocha.addFile(path.join(conf.cwd, file));
        }.bind(this));

        var runner = mocha.run();
        runner.on('end', function() {
            if (typeof __coverage__ === 'object') {
                logger.dev('Write coverage report', __coverage__);
                fs.writeFileSync(conf.cwd + '/mocha-coverage.json', JSON.stringify(__coverage__));
            }

            done();
        });
	});
};