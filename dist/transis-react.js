(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("transis"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["transis", "react"], factory);
	else if(typeof exports === 'object')
		exports["transis-react"] = factory(require("transis"), require("react"));
	else
		root["transis-react"] = factory(root["transis"], root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLog = exports.updateQueue = exports.logUpdate = exports.unqueueUpdate = exports.queueUpdate = exports.assignTransisIdTo = exports.componentComparison = undefined;

var _transis = __webpack_require__(1);

var _transis2 = _interopRequireDefault(_transis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nextId = 1;
var getId = function getId() {
  return nextId++;
};

/** incrementally adds a {_transisId} onto the {component} */
var assignTransisIdTo = function assignTransisIdTo(component) {
  component._transisId = component._transisId || getId();
};

/* Update Log */
// used to keep track of what's been updated
var updateLog = new Set();

var logUpdate = function logUpdate(component) {
  return updateLog.add(component);
};

/* Update Queue */
// used as a register for components that needs update
// TODO: optimize this with usage of a `Set`
var updateQueue = {};

var queueUpdate = function queueUpdate(component) {
  console.info('update queued', component);
  updateQueue[component._transisId] = component;
};

var unqueueUpdate = function unqueueUpdate(component) {
  delete updateQueue[component._transisId];
};

var componentComparison = exports.componentComparison = function componentComparison(a, b) {
  return a._transisId - b._transisId;
};

// registers preFlush to be invoked before the next flush cycle
var registerDelayPreFlush = function registerDelayPreFlush() {
  return _transis2.default.Object.delayPreFlush(function preFlush() {
    updateLog.clear();
    registerDelayPostFlush(); // registers postFlush to be invoked after next flush cycle
  });
};

var registerDelayPostFlush = function registerDelayPostFlush() {
  return _transis2.default.Object.delay(function postFlush() {
    var componentsToUpdate = Object.keys(updateQueue).map(function (k) {
      return updateQueue[k];
    });
    exports.updateQueue = updateQueue = {};

    // Sort the componentsToUpdate by their assigned _transisId. Since componentsToUpdate get mounted from the top
    // down, this should ensure that parent componentsToUpdate are force updated before any descendent
    // componentsToUpdate that also need an update. This avoids the case where we force update a component
    // and then force update one of its ancestors, which may unnecessarily render the component
    // again.
    componentsToUpdate.sort(componentComparison).forEach(function (component) {
      if (!updateLog.has(component)) {
        component.forceUpdate();
      }
    });

    registerDelayPreFlush();
  });
};

// first register to kick off the cycle
registerDelayPreFlush();

exports.assignTransisIdTo = assignTransisIdTo;
exports.queueUpdate = queueUpdate;
exports.unqueueUpdate = unqueueUpdate;
exports.logUpdate = logUpdate;
exports.updateQueue = updateQueue;
exports.updateLog = updateLog;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateMixin = exports.PropsMixin = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //  replication of existing Transis Mixins are required so that transisReact factory can know about its _transisId.
//  NOTE: should be removed after migrating to React 16.


var _updater = __webpack_require__(0);

// Legacy Prop Mixin
var PropsMixin = exports.PropsMixin = function PropsMixin(props) {
  return {
    componentWillMount: function componentWillMount() {
      var _this = this;

      (0, _updater.assignTransisIdTo)(this);
      this._transisQueueUpdate = this._transisQueueUpdate || function () {
        (0, _updater.queueUpdate)(_this);
      };

      var _loop = function _loop(k) {
        props[k].forEach(function (prop) {
          if (this.props[k]) {
            this.props[k].on(prop, this._transisQueueUpdate);
          }
        }, _this);
      };

      for (var k in props) {
        _loop(k);
      }
    },

    componentDidMount: function componentDidMount() {
      (0, _updater.logUpdate)(this);
    },

    componentDidUpdate: function componentDidUpdate() {
      (0, _updater.logUpdate)(this);
    },

    componentWillUnmount: function componentWillUnmount() {
      var _this2 = this;

      (0, _updater.unqueueUpdate)(this);

      var _loop2 = function _loop2(k) {
        props[k].forEach(function (prop) {
          if (this.props[k]) {
            this.props[k].off(prop, this._transisQueueUpdate);
          }
        }, _this2);
      };

      for (var k in props) {
        _loop2(k);
      }
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      var _this3 = this;

      var _loop3 = function _loop3(k) {
        props[k].forEach(function (prop) {
          if (nextProps[k] !== this.props[k]) {
            if (this.props[k]) {
              this.props[k].off(prop, this._transisQueueUpdate);
            }
            if (nextProps[k]) {
              nextProps[k].on(prop, this._transisQueueUpdate);
            }
          }
        }, _this3);
      };

      for (var k in props) {
        _loop3(k);
      }
    }
  };
};

// Legacy State Mixin
var StateMixin = exports.StateMixin = function StateMixin() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var object = args[0],
      props = args[1];

  if ((typeof props === "undefined" ? "undefined" : _typeof(props)) !== "object") {
    props = [].slice.call(args, 1).reduce(function (acc, prop) {
      acc[prop] = [];
      return acc;
    }, {});
  }

  return {
    getInitialState: function getInitialState() {
      var state = {};
      for (var k in props) {
        state[k] = object[k];
      }
      return state;
    },

    componentWillMount: function componentWillMount() {
      var _this4 = this;

      (0, _updater.assignTransisIdTo)(this);
      this._transisQueueUpdate = this._transisQueueUpdate || function () {
        (0, _updater.queueUpdate)(_this4);
      };

      this._transisSyncState = function () {
        var state = {};

        var _loop4 = function _loop4(k) {
          if (_this4.state[k] !== object[k]) {
            if (_this4.state[k] && typeof _this4.state[k].off === "function") {
              props[k].forEach(function (path) {
                _this4.state[k].off(path, _this4._transisQueueUpdate);
              });
            }

            if (object[k] && typeof object[k].on === "function") {
              props[k].forEach(function (path) {
                object[k].on(path, _this4._transisQueueUpdate);
              });
            }

            state[k] = object[k];
          }
        };

        for (var k in props) {
          _loop4(k);
        }

        if (Object.keys(state).length) {
          _this4.setState(state);
        }
      };

      var _loop5 = function _loop5(k) {
        if (object[k] && typeof object[k].on === "function") {
          props[k].forEach(function (path) {
            object[k].on(path, _this4._transisQueueUpdate);
          });
        }
      };

      for (var k in props) {
        _loop5(k);
      }

      object.on("*", this._transisSyncState);
    },

    componentDidMount: function componentDidMount() {
      (0, _updater.logUpdate)(this);
    },

    componentDidUpdate: function componentDidUpdate() {
      (0, _updater.logUpdate)(this);
    },

    componentWillUnmount: function componentWillUnmount() {
      var _this5 = this;

      var _loop6 = function _loop6(k) {
        if (_this5.state[k] && typeof _this5.state[k].off === "function") {
          props[k].forEach(function (path) {
            _this5.state[k].off(path, _this5._transisQueueUpdate);
          });
        }
      };

      for (var k in props) {
        _loop6(k);
      }

      object.off("*", this._transisSyncState);
    }
  };
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remapStateToAvoidProps = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = __webpack_require__(5);

var _react2 = _interopRequireDefault(_react);

var _transis = __webpack_require__(1);

var _transis2 = _interopRequireDefault(_transis);

var _updater = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * This module should allow us to use the ES6 syntax react components with Transis.
                                                                                                                                                                                                     *
                                                                                                                                                                                                     * ```js
                                                                                                                                                                                                     *
                                                                                                                                                                                                     *  const PersonName = transisReact({
                                                                                                                                                                                                     *    transisObject: appState,
                                                                                                                                                                                                     *    state: {
                                                                                                                                                                                                     *      person: ['name']
                                                                                                                                                                                                     *    },
                                                                                                                                                                                                     *    props: {
                                                                                                                                                                                                     *      task: ['*']
                                                                                                                                                                                                     *    }
                                                                                                                                                                                                     *  }, ({ person, task }) =>
                                                                                                                                                                                                     *    <div>
                                                                                                                                                                                                     *      name: {person.name}
                                                                                                                                                                                                     *      task: {task}
                                                                                                                                                                                                     *    </div>
                                                                                                                                                                                                     *  )
                                                                                                                                                                                                     * ```
                                                                                                                                                                                                     */

/** polyfill for PhantomJS equivalent to Object.entries */
var entries = function entries(obj) {
  var ownProps = Object.keys(obj);
  var resArray = new Array(i); // preallocate the Array
  var i = ownProps.length;

  while (i--) {
    resArray[i] = [ownProps[i], obj[ownProps[i]]];
  }

  return resArray;
};

/** @returns all values of object, similar to Object.keys */
var ObjectValues = function ObjectValues(obj) {
  return entries(obj).map(function (e) {
    return e[1];
  });
};

/** @returns {[... values that have duplicates ]} */
var findDuplicate = function findDuplicate(list) {
  var dups = [];
  var set = new Set();
  for (var index in list) {
    var item = list[index];
    if (set.has(item)) dups.push(item);else set.add(item);
  }
  return dups;
};

/**
 * @function bindState, unbindState, bindProps, unbindProps
 * @param {TransisObject} transisObjectVar - transis object attached to some transisObject namespace
 * @param {Array} attrsToWatch - props on the transisObjectVar that the component should watch for
 * @param {func} callback - function to register/deregister when given attrs changes
 */
var bindState = function bindState(transisObjectVar, attrsToWatch, callback) {
  if (transisObjectVar && typeof transisObjectVar.on === 'function') {
    attrsToWatch.forEach(function (attrPath) {
      return transisObjectVar.on(attrPath, callback);
    });
  }
};

var unbindState = function unbindState(stateVar, attrsToWatch, callback) {
  if (stateVar && typeof stateVar.off === 'function') {
    attrsToWatch.forEach(function (attrPath) {
      return stateVar.off(attrPath, callback);
    });
  }
};

var bindProps = function bindProps(propsVar, attrsToWatch, callback) {
  attrsToWatch.forEach(function (attrPath) {
    return propsVar && propsVar.on(attrPath, callback);
  });
};

var unbindProps = function unbindProps(propsVar, attrsToWatch, callback) {
  attrsToWatch.forEach(function (attrPath) {
    return propsVar && propsVar.off(attrPath, callback);
  });
};

/** initialize props and states that needs to be synced to the component */
var componentWillMount = function componentWillMount(_ref) {
  var _this = this;

  var transisObject = _ref.transisObject,
      state = _ref.state,
      props = _ref.props;

  if (state || props) {
    // setting transis id
    (0, _updater.assignTransisIdTo)(this);

    // setting main update function
    var wrapQueueUpdate = function wrapQueueUpdate() {
      (0, _updater.queueUpdate)(_this);
    };
    this._transisQueueUpdate = this._transisQueueUpdate || wrapQueueUpdate;
  }

  if (state) {
    // creates method for syncing to core
    this._transisSyncState = function () {
      var stateToUpdate = {};
      for (var k in state) {
        if (_this.state[k] !== transisObject[k]) {
          // state variable is out of date, off-sync it
          unbindState(_this.state[k], state[k], _this._transisQueueUpdate);

          // transisObject state needs to be attached, sync it
          bindState(transisObject[k], state[k], _this._transisQueueUpdate);

          stateToUpdate[k] = transisObject[k];
        }
      }

      // invoke change if anything changed
      if (Object.keys(stateToUpdate).length) {
        _this.setState(stateToUpdate);
      }
    };

    // initially sync all state variables
    for (var k in state) {
      bindState(transisObject[k], state[k], this._transisQueueUpdate);
    }

    transisObject.on('*', this._transisSyncState);
  }

  // initially sync all prop variables
  if (props) {
    for (var _k in props) {
      bindProps(this.props[_k], props[_k], this._transisQueueUpdate);
    }
  }
};

/**
 * A function to help changing key values of states to avoid props received
 *  from parent components
 */
var remapStateToAvoidProps = exports.remapStateToAvoidProps = function remapStateToAvoidProps(_ref2) {
  var props = _ref2.props,
      state = _ref2.state,
      stateToPropMap = _ref2.stateToPropMap;

  var newState = {};
  if (stateToPropMap) {
    for (var k in state) {
      newState[stateToPropMap[k]] = state[k];
    }
  } else {
    newState = state;
  }

  if (props && newState) {
    var statePropsConflicts = findDuplicate([].concat(_toConsumableArray(Object.keys(newState)), _toConsumableArray(Object.keys(props))));
    if (statePropsConflicts.length) {
      throw new Error('state variable names conflicted with props, please rename the following: "' + statePropsConflicts.join(', ') + '"');
    }
  }

  return newState;
};

/** ["foo"] -> { "foo": "foo" } */
var createHashFromArray = function createHashFromArray(arr) {
  return arr.reduce(function (map, next) {
    return _extends({}, map, _defineProperty({}, next, next));
  }, {});
};

/**
 * Bootstrap the component to handle props and state updates from the config
 *  or parent component
 * @param {config object} - An object with schema:
 *    {
 *      transisObject: CMM.appState,
 *      props: <What we give to prop mixin>,
 *      state: <What we give to state mixin>
 *    }
 * @param {Component} - a React Component
 * @return {Component} - a React Component that is aware of changes specified.
 */
var transisReact = function transisReact(_ref3, WrappedComponent) {
  var transisObject = _ref3.transisObject,
      state = _ref3.state,
      props = _ref3.props,
      stateToPropMap = _ref3.stateToPropMap;

  if (!transisObject && state) {
    throw new Error("Cannot compose with-state component without global transis object, state: ", state);
  }

  /** Convert Array styled mixin to Hash (Normalize) */
  // e.g. StateMixin({}, 'a', 'b', 'c') -> props {}= { a: [], b: [], c: [] }
  if ({}.toString.call(state).indexOf('Array') !== -1) {
    state = state.reduce(function (obj, stateName) {
      obj[stateName] = [];
      return obj;
    }, {});
  }

  if (state && stateToPropMap) {
    var futurePropKeys = ObjectValues(stateToPropMap);
    var propKeys = Object.keys(state);
    var intersect = futurePropKeys.filter(function (propKey) {
      return propKeys.indexOf(propKey) !== -1;
    });

    if (intersect.length) {
      throw new Error('Cannot rename props due to conflicting names "' + intersect.join(', ') + '"');
    }
    stateToPropMap = _extends({}, createHashFromArray(propKeys), stateToPropMap);
  }

  var higherOrderComponent = function (_React$Component) {
    _inherits(HigherOrderComponent, _React$Component);

    function HigherOrderComponent(propArgs) {
      _classCallCheck(this, HigherOrderComponent);

      var _this2 = _possibleConstructorReturn(this, (HigherOrderComponent.__proto__ || Object.getPrototypeOf(HigherOrderComponent)).call(this, propArgs));

      _this2.componentWillMount = function () {
        return componentWillMount.call(_this2, {
          transisObject: transisObject, state: state, props: props
        });
      };

      _this2.componentDidMount = function () {
        (0, _updater.logUpdate)(_this2);
      };

      _this2.componentDidUpdate = function () {
        (0, _updater.logUpdate)(_this2);
      };

      _this2.componentWillUnmount = function () {
        (0, _updater.unqueueUpdate)(_this2);
        if (state) {
          for (var k in state) {
            unbindState(_this2.state[k], state[k], _this2._transisQueueUpdate);
          }
          transisObject.off('*', _this2._transisSyncState);
        }
        if (props) {
          for (var _k2 in props) {
            unbindProps(_this2.props[_k2], props[_k2], _this2._transisQueueUpdate);
          }
        }
      };

      _this2.render = function () {
        var stateParams = remapStateToAvoidProps({ props: _this2.props, state: _this2.state, stateToPropMap: stateToPropMap });

        return _react2.default.createElement(WrappedComponent, _extends({
          ref: function ref(core) {
            return _this2.core = core;
          }
        }, _this2.props, stateParams));
      };

      if (state) {
        _this2.state = Object.keys(state).reduce(function (result, key) {
          result[key] = transisObject[key];
          return result;
        }, {});
      }
      if (props) {
        // sets up the life cycle method to listen for incoming props
        _this2.componentWillReceiveProps = function (nextProps) {
          var _loop = function _loop(k) {
            props[k].forEach(function (prop) {
              if (nextProps[k] !== _this2.props[k]) {
                if (_this2.props[k]) {
                  _this2.props[k].off(prop, _this2._transisQueueUpdate);
                }
                if (nextProps[k]) {
                  nextProps[k].on(prop, _this2._transisQueueUpdate);
                }
              }
            });
          };

          for (var k in props) {
            _loop(k);
          }
        };
      }
      return _this2;
    }

    return HigherOrderComponent;
  }(_react2.default.Component);
  return higherOrderComponent;
};

transisReact.Transis = _transis2.default;
// transisReact.updateLog = updateLog;
// transisReact.updateQueue = updateQueue;

exports.default = transisReact;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PropsMixin = exports.StateMixin = undefined;

var _transisReact = __webpack_require__(3);

var _transisReact2 = _interopRequireDefault(_transisReact);

var _TransisReactMixin = __webpack_require__(2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _transisReact2.default;
exports.StateMixin = _TransisReactMixin.StateMixin;
exports.PropsMixin = _TransisReactMixin.PropsMixin;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ })
/******/ ]);
});