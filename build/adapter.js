'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.adapterFactory = exports.MochaAdapter = undefined;

var _isExtensible = require('babel-runtime/core-js/object/is-extensible');

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mocha = require('mocha');

var _mocha2 = _interopRequireDefault(_mocha);

var _wdioSync = require('wdio-sync');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INTERFACES = {
    bdd: ['before', 'beforeEach', 'it', 'after', 'afterEach'],
    tdd: ['suiteSetup', 'setup', 'test', 'suiteTeardown', 'teardown'],
    qunit: ['before', 'beforeEach', 'test', 'after', 'afterEach']
};

var EVENTS = {
    'suite': 'suite:start',
    'suite end': 'suite:end',
    'test': 'test:start',
    'test end': 'test:end',
    'hook': 'hook:start',
    'hook end': 'hook:end',
    'pass': 'test:pass',
    'fail': 'test:fail',
    'pending': 'test:pending'
};

var NOOP = function NOOP() {};
var SETTLE_TIMEOUT = 5000;

/**
 * Mocha runner
 */

var MochaAdapter = function () {
    function MochaAdapter(cid, config, specs, capabilities) {
        (0, _classCallCheck3.default)(this, MochaAdapter);

        /**
         * rename requires option to stay backwards compatible
         * ToDo remove with next major release
         */
        if (config.mochaOpts && config.mochaOpts.requires) {
            if (Array.isArray(config.mochaOpts.require)) {
                config.mochaOpts.require.push(config.mochaOpts.requires);
            } else {
                config.mochaOpts.require = config.mochaOpts.requires;
            }
        }

        this.cid = cid;
        this.capabilities = capabilities;
        this.specs = specs;
        this.config = (0, _assign2.default)({
            mochaOpts: {}
        }, config);
        this.runner = {};

        this.sentMessages = 0; // number of messages sent to the parent
        this.receivedMessages = 0; // number of messages received by the parent
        this.messageCounter = 0;
        this.messageUIDs = {
            suite: {},
            hook: {},
            test: {}
        };
    }

    (0, _createClass3.default)(MochaAdapter, [{
        key: 'options',
        value: function options(_options, context) {
            var _options$require = _options.require,
                require = _options$require === undefined ? [] : _options$require,
                _options$compilers = _options.compilers,
                compilers = _options$compilers === undefined ? [] : _options$compilers;

            if (typeof require === 'string') {
                require = [require];
            }

            this.requireExternalModules([].concat((0, _toConsumableArray3.default)(require), (0, _toConsumableArray3.default)(compilers)), context);
        }
    }, {
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var _this = this;

                var mochaOpts, mocha, result;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                mochaOpts = this.config.mochaOpts;


                                if (typeof mochaOpts.ui !== 'string' || !_get__('INTERFACES')[mochaOpts.ui]) {
                                    mochaOpts.ui = 'bdd';
                                }

                                mocha = new (_get__('Mocha'))(mochaOpts);

                                mocha.loadFiles();
                                mocha.reporter(_get__('NOOP'));
                                mocha.fullTrace();
                                this.specs.forEach(function (spec) {
                                    return mocha.addFile(spec);
                                });

                                _get__('wrapCommands')(global.browser, this.config.beforeCommand, this.config.afterCommand);

                                mocha.suite.on('pre-require', function (context, file, mocha) {
                                    _this.options(mochaOpts, {
                                        context: context, file: file, mocha: mocha, options: mochaOpts
                                    });

                                    _get__('INTERFACES')[mochaOpts.ui].forEach(function (fnName) {
                                        var testCommand = _get__('INTERFACES')[mochaOpts.ui][2];

                                        _get__('runInFiberContext')([testCommand, testCommand + '.only'], _this.config.beforeHook, _this.config.afterHook, fnName);
                                    });
                                });

                                _context.next = 11;
                                return _get__('executeHooksWithArgs')(this.config.before, [this.capabilities, this.specs]);

                            case 11:
                                _context.next = 13;
                                return new _promise2.default(function (resolve, reject) {
                                    _this.runner = mocha.run(resolve);

                                    (0, _keys2.default)(_get__('EVENTS')).forEach(function (e) {
                                        return _this.runner.on(e, _this.emit.bind(_this, _get__('EVENTS')[e]));
                                    });

                                    _this.runner.suite.beforeAll(_this.wrapHook('beforeSuite'));
                                    _this.runner.suite.beforeEach(_this.wrapHook('beforeTest'));
                                    _this.runner.suite.afterEach(_this.wrapHook('afterTest'));
                                    _this.runner.suite.afterAll(_this.wrapHook('afterSuite'));
                                });

                            case 13:
                                result = _context.sent;
                                _context.next = 16;
                                return _get__('executeHooksWithArgs')(this.config.after, [result, this.capabilities, this.specs]);

                            case 16:
                                _context.next = 18;
                                return this.waitUntilSettled();

                            case 18:
                                return _context.abrupt('return', result);

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function run() {
                return _ref.apply(this, arguments);
            }

            return run;
        }()

        /**
         * Hooks which are added as true Mocha hooks need to call done() to notify async
         */

    }, {
        key: 'wrapHook',
        value: function wrapHook(hookName) {
            var _this2 = this;

            return function () {
                return _get__('executeHooksWithArgs')(_this2.config[hookName], _this2.prepareMessage(hookName)).catch(function (e) {
                    console.log('Error in ' + hookName + ' hook', e.stack);
                });
            };
        }
    }, {
        key: 'prepareMessage',
        value: function prepareMessage(hookName) {
            var params = { type: hookName };

            switch (hookName) {
                case 'beforeSuite':
                case 'afterSuite':
                    params.payload = this.runner.suite.suites[0];
                    break;
                case 'beforeTest':
                case 'afterTest':
                    params.payload = this.runner.test;
                    break;
            }

            params.err = this.runner.lastError;
            delete this.runner.lastError;
            return this.formatMessage(params);
        }
    }, {
        key: 'formatMessage',
        value: function formatMessage(params) {
            var message = {
                type: params.type
            };

            if (params.err) {
                message.err = {
                    message: params.err.message,
                    stack: params.err.stack,
                    type: params.err.type || params.err.name,
                    expected: params.err.expected,
                    actual: params.err.actual
                };
            }

            if (params.payload) {
                message.title = params.payload.title;
                message.parent = params.payload.parent ? params.payload.parent.title : null;

                /**
                 * get title for hooks in root suite
                 */
                if (message.parent === '' && params.payload.parent && params.payload.parent.suites) {
                    message.parent = params.payload.parent.suites[0].title;
                }

                message.fullTitle = params.payload.fullTitle ? params.payload.fullTitle() : message.parent + ' ' + message.title;
                message.pending = params.payload.pending || false;
                message.file = params.payload.file;

                // Add the current test title to the payload for cases where it helps to
                // identify the test, e.g. when running inside a beforeEach hook
                if (params.payload.ctx && params.payload.ctx.currentTest) {
                    message.currentTest = params.payload.ctx.currentTest.title;
                }

                if (params.type.match(/Test/)) {
                    message.passed = params.payload.state === 'passed';
                    message.duration = params.payload.duration;
                }
            }

            return message;
        }
    }, {
        key: 'requireExternalModules',
        value: function requireExternalModules(modules, context) {
            var _this3 = this;

            modules.forEach(function (module) {
                if (module) {
                    module = module.replace(/.*:/, '');

                    if (module.substr(0, 1) === '.') {
                        module = _get__('path').join(process.cwd(), module);
                    }

                    _this3.load(module, context);
                }
            });
        }
    }, {
        key: 'emit',
        value: function emit(event, payload, err) {
            var _this4 = this;

            // For some reason, Mocha fires a second 'suite:end' event for the root suite,
            // with no matching 'suite:start', so this can be ignored.
            if (payload.root) return;

            var message = this.formatMessage({ type: event, payload: payload, err: err });

            message.cid = this.cid;
            message.specs = this.specs;
            message.event = event;
            message.runner = {};
            message.runner[this.cid] = this.capabilities;

            if (err) {
                this.runner.lastError = err;
            }

            var _generateUID = this.generateUID(message),
                uid = _generateUID.uid,
                parentUid = _generateUID.parentUid;

            message.uid = uid;
            message.parentUid = parentUid;

            // When starting a new test, propagate the details to the test runner so that
            // commands, results, screenshots and hooks can be associated with this test
            if (event === 'test:start') {
                this.sendInternal(event, message);
            }

            this.send(message, null, {}, function () {
                return ++_this4.receivedMessages;
            });
            this.sentMessages++;
        }
    }, {
        key: 'generateUID',
        value: function generateUID(message) {
            var uid, parentUid;

            switch (message.type) {
                case 'suite:start':
                    uid = this.getUID(message.title, 'suite', true);
                    parentUid = uid;
                    break;

                case 'suite:end':
                    uid = this.getUID(message.title, 'suite');
                    parentUid = uid;
                    break;

                case 'hook:start':
                    uid = this.getUID(message.title, 'hook', true);
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'hook:end':
                    uid = this.getUID(message.title, 'hook');
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'test:start':
                    uid = this.getUID(message.title, 'test', true);
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                case 'test:pending':
                case 'test:end':
                case 'test:pass':
                case 'test:fail':
                    uid = this.getUID(message.title, 'test');
                    parentUid = this.getUID(message.parent, 'suite');
                    break;

                default:
                    throw new Error('Unknown message type : ' + message.type);
            }

            return {
                uid: uid,
                parentUid: parentUid
            };
        }
    }, {
        key: 'getUID',
        value: function getUID(title, type, start) {
            if (start !== true && this.messageUIDs[type][title]) {
                return this.messageUIDs[type][title];
            }

            var uid = title + this.messageCounter++;

            this.messageUIDs[type][title] = uid;

            return uid;
        }
    }, {
        key: 'sendInternal',
        value: function sendInternal(event, message) {
            process.emit(event, message);
        }

        /**
         * reset globals to rewire it out in tests
         */

    }, {
        key: 'send',
        value: function send() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return process.send.apply(process, args);
        }

        /**
         * wait until all messages were sent to parent
         */

    }, {
        key: 'waitUntilSettled',
        value: function waitUntilSettled() {
            var _this5 = this;

            return new _promise2.default(function (resolve) {
                var start = new Date().getTime();
                var interval = setInterval(function () {
                    var now = new Date().getTime();

                    if (_this5.sentMessages !== _this5.receivedMessages && now - start < _get__('SETTLE_TIMEOUT')) return;
                    clearInterval(interval);
                    resolve();
                }, 100);
            });
        }
    }, {
        key: 'load',
        value: function load(name, context) {
            try {
                module.context = context;

                require(name);
            } catch (e) {
                throw new Error('Module ' + name + ' can\'t get loaded. Are you sure you have installed it?\n' + 'Note: if you\'ve installed WebdriverIO globally you need to install ' + 'these external modules globally too!');
            }
        }
    }]);
    return MochaAdapter;
}();

var _MochaAdapter = _get__('MochaAdapter');
var adapterFactory = {};

_get__('adapterFactory').run = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(cid, config, specs, capabilities) {
        var adapter;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        adapter = new (_get__('_MochaAdapter'))(cid, config, specs, capabilities);
                        _context2.next = 3;
                        return adapter.run();

                    case 3:
                        return _context2.abrupt('return', _context2.sent);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x, _x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
    };
}();

exports.default = _get__('adapterFactory');
exports.MochaAdapter = MochaAdapter;
exports.adapterFactory = adapterFactory;

var _RewiredData__ = (0, _create2.default)(null);

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
var _RewireAPI__ = {};

(function () {
    function addPropertyToAPIObject(name, value) {
        (0, _defineProperty2.default)(_RewireAPI__, name, {
            value: value,
            enumerable: false,
            configurable: true
        });
    }

    addPropertyToAPIObject('__get__', _get__);
    addPropertyToAPIObject('__GetDependency__', _get__);
    addPropertyToAPIObject('__Rewire__', _set__);
    addPropertyToAPIObject('__set__', _set__);
    addPropertyToAPIObject('__reset__', _reset__);
    addPropertyToAPIObject('__ResetDependency__', _reset__);
    addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
    if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
        return _get_original__(variableName);
    } else {
        var value = _RewiredData__[variableName];

        if (value === INTENTIONAL_UNDEFINED) {
            return undefined;
        } else {
            return value;
        }
    }
}

function _get_original__(variableName) {
    switch (variableName) {
        case 'INTERFACES':
            return INTERFACES;

        case 'Mocha':
            return _mocha2.default;

        case 'NOOP':
            return NOOP;

        case 'wrapCommands':
            return _wdioSync.wrapCommands;

        case 'runInFiberContext':
            return _wdioSync.runInFiberContext;

        case 'executeHooksWithArgs':
            return _wdioSync.executeHooksWithArgs;

        case 'EVENTS':
            return EVENTS;

        case 'path':
            return _path2.default;

        case 'SETTLE_TIMEOUT':
            return SETTLE_TIMEOUT;

        case 'MochaAdapter':
            return MochaAdapter;

        case 'adapterFactory':
            return adapterFactory;

        case '_MochaAdapter':
            return _MochaAdapter;
    }

    return undefined;
}

function _assign__(variableName, value) {
    if (_RewiredData__ === undefined || _RewiredData__[variableName] === undefined) {
        return _set_original__(variableName, value);
    } else {
        return _RewiredData__[variableName] = value;
    }
}

function _set_original__(variableName, _value) {
    switch (variableName) {}

    return undefined;
}

function _update_operation__(operation, variableName, prefix) {
    var oldValue = _get__(variableName);

    var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

    _assign__(variableName, newValue);

    return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
    if ((typeof variableName === 'undefined' ? 'undefined' : (0, _typeof3.default)(variableName)) === 'object') {
        (0, _keys2.default)(variableName).forEach(function (name) {
            _RewiredData__[name] = variableName[name];
        });
    } else {
        if (value === undefined) {
            _RewiredData__[variableName] = INTENTIONAL_UNDEFINED;
        } else {
            _RewiredData__[variableName] = value;
        }

        return function () {
            _reset__(variableName);
        };
    }
}

function _reset__(variableName) {
    delete _RewiredData__[variableName];
}

function _with__(object) {
    var rewiredVariableNames = (0, _keys2.default)(object);
    var previousValues = {};

    function reset() {
        rewiredVariableNames.forEach(function (variableName) {
            _RewiredData__[variableName] = previousValues[variableName];
        });
    }

    return function (callback) {
        rewiredVariableNames.forEach(function (variableName) {
            previousValues[variableName] = _RewiredData__[variableName];
            _RewiredData__[variableName] = object[variableName];
        });
        var result = callback();

        if (!!result && typeof result.then == 'function') {
            result.then(reset).catch(reset);
        } else {
            reset();
        }

        return result;
    };
}

var _typeOfOriginalExport = typeof adapterFactory === 'undefined' ? 'undefined' : (0, _typeof3.default)(adapterFactory);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty2.default)(adapterFactory, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(adapterFactory)) {
    addNonEnumerableProperty('__get__', _get__);
    addNonEnumerableProperty('__GetDependency__', _get__);
    addNonEnumerableProperty('__Rewire__', _set__);
    addNonEnumerableProperty('__set__', _set__);
    addNonEnumerableProperty('__reset__', _reset__);
    addNonEnumerableProperty('__ResetDependency__', _reset__);
    addNonEnumerableProperty('__with__', _with__);
    addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;