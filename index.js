var path = require('path'),
    fs = require('fs'),
    Mocha = require('mocha'),
    spawn = require('child_process').spawn,
    extend = require('node.extend');

/**
 * Runs node.js tests using Mocha
 */
module.exports = function(coffeeBreak) {
	"use strict";

	coffeeBreak.registerTask('test', function(conf, logger, done) {
		console.log('Node.JS test runner', conf);

        if (conf.browser) {
            console.log('Skipping browser tests in mocha runner');
            done();
            return;
        }

        process.stdout.write('\n  \u001b[1;4;38;5;246mRun node.js testst of project ' + conf.project + ' using Mocha\u001b[m\n\n');
        var files = conf.tests;

        var mocha = new Mocha({
            ui: 'bdd',
            reporter: 'list'
        });

        logger.dev('Files in ' + conf.cwd, files);
        files.forEach(function(file) {
            logger.dev('Add file to mocha:' + path.join(conf.cwd, file));
            mocha.addFile(path.join(conf.cwd, file));
        }.bind(this));

        var command = path.join(__dirname, 'node_modules/.bin/mocha');
        
        var args = [
            '-R',
            'list',
            '--colors'
        ];

        console.log('CB', coffeeBreak.baseDir);
        var expectBundle = path.join(coffeeBreak.baseDir, 'node_modules/coffeebreak-expect-bundle');
        if (fs.existsSync(expectBundle)) {
            args.push('-r', expectBundle);
        }

        if (conf.require) {
            if (!Array.isArray(conf.require)) {
                conf.require = conf.require.split(/\s+/);
            }

            conf.require.forEach(function(mod) {
                args.push('-r', mod);
            });
        }

        args = args.concat(conf.tests);

        var options = {
            cwd: conf.cwd,
            env: extend(process.env, {
                'NODE_ENV': 'test'
            })
        };

        var child = spawn(command, args, options);
        child.stdout.on('data', function (data) {
            process.stdout.write(data);
        });

        child.stderr.on('data', function (data) {
            process.stdout.write(data);
        });

        child.on('close', function (code) {
            if (code) {
                console.log('Child process exited with code ' + code);
            }

            var statusCode = code === 0 ? true : false;
            done(null, statusCode);
        });

		done();
	});
};