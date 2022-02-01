'use strict';

var webdriverConfig = {
    hostname: 'fe.nhnent.com',
    port: 4444,
    remoteHost: true
};

/**
 * manipulate config by server
 * @param {Object} defaultConfig - base configuration
 * @param {'ne'|null|undefined} server - ne: team selenium grid, null or undefined: local machine
 */
function setConfig(defaultConfig, server) {
    if (server === 'ne') {
        defaultConfig.customLaunchers = {
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '8'
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '9'
            },
            'IE10': {
                base: 'WebDriver',
                browserName: 'internet explorer',
                config: webdriverConfig,
                version: '10'
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: '11'
            },
            'Edge': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'MicrosoftEdge'
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            }
            // 'Safari-WebDriver': {
            //     base: 'WebDriver',
            //     config: webdriverConfig,
            //     browserName: 'safari'
            // }
        };
        defaultConfig.browsers = [
            // @FIXME: localStorage mocking 버그. 이후 수정 필요
            // 'IE8',
            'IE9',
            'IE10',
            // 'IE11',
            // 'Edge',
            'Chrome-WebDriver',
            'Firefox-WebDriver'
            // 'Safari-WebDriver'
        ];
        defaultConfig.reporters.push('coverage');
        defaultConfig.reporters.push('junit');
        defaultConfig.coverageReporter = {
            dir: 'report/coverage/',
            reporters: [{
                type: 'html',
                subdir: function(browser) {
                    return 'report-html/' + browser;
                }
            },
            {
                type: 'cobertura',
                subdir: function(browser) {
                    return 'report-cobertura/' + browser;
                },
                file: 'cobertura.txt'
            }
            ]
        };
        defaultConfig.junitReporter = {
            outputDir: 'report/junit',
            suite: ''
        };
    } else {
        defaultConfig.browsers = [
            'ChromeHeadless'
        ];
    }
}

module.exports = function(config) {
    var defaultConfig = {
        basePath: './',
        frameworks: ['jasmine'],
        files: [
            'test/*.test.js'
        ],
        preprocessors: {
            './test/*.test.js': ['webpack', 'sourcemap']
        },
        reporters: ['dots'],
        webpack: {
            devtool: 'inline-source-map',
            module: {
                preLoaders: [
                    {
                        test: /\.js$/,
                        exclude: /(test|bower_components|node_modules)/,
                        loader: 'istanbul-instrumenter'
                    },
                    {
                        test: /\.js$/,
                        exclude: /(bower_components|node_modules)/,
                        loader: 'eslint-loader'
                    }
                ]
            }
        },

        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: true
    };

    /* eslint-disable */
    setConfig(defaultConfig, process.env.KARMA_SERVER);
    config.set(defaultConfig);
};
