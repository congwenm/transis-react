/**
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



import React from 'react';
import Transis from 'transis';

import {
  assignTransisIdTo,

  queueUpdate,
  unqueueUpdate,
  logUpdate,
} from './updater';

/** polyfill for PhantomJS equivalent to Object.entries */
const entries = function(obj) {
  const ownProps = Object.keys(obj);
  const resArray = new Array(i); // preallocate the Array
  let i = ownProps.length;

  while (i--) {
    resArray[i] = [ownProps[i], obj[ownProps[i]]];
  }

  return resArray;
};

/** @returns all values of object, similar to Object.keys */
const ObjectValues = obj =>
  entries(obj).map(e => e[1]);

/** @returns {[... values that have duplicates ]} */
const findDuplicate = list => {
  const dups = [];
  const set = new Set;
  for (const index in list) {
    const item = list[index];
    if (set.has(item)) dups.push(item);
    else set.add(item);
  }
  return dups;
};


/**
 * @function bindState, unbindState, bindProps, unbindProps
 * @param {TransisObject} transisObjectVar - transis object attached to some transisObject namespace
 * @param {Array} attrsToWatch - props on the transisObjectVar that the component should watch for
 * @param {func} callback - function to register/deregister when given attrs changes
 */
const bindState = (transisObjectVar, attrsToWatch, callback) => {
  if (transisObjectVar && typeof transisObjectVar.on === 'function') {
    attrsToWatch.forEach(attrPath =>
      transisObjectVar.on(attrPath, callback)
    );
  }
};

const unbindState = (stateVar, attrsToWatch, callback) => {
  if (stateVar && typeof stateVar.off === 'function') {
    attrsToWatch.forEach(attrPath =>
      stateVar.off(attrPath, callback)
    );
  }
};

const bindProps = (propsVar, attrsToWatch, callback) => {
  attrsToWatch.forEach(attrPath =>
    propsVar && propsVar.on(attrPath, callback)
  );
};

const unbindProps = (propsVar, attrsToWatch, callback) => {
  attrsToWatch.forEach(attrPath =>
    propsVar && propsVar.off(attrPath, callback)
  );
};

/** initialize props and states that needs to be synced to the component */
const componentWillMount = function({ transisObject, state, props }) {
  if (state || props) {
    // setting transis id
    assignTransisIdTo(this);

    // setting main update function
    const wrapQueueUpdate = () => { queueUpdate(this); };
    this._transisQueueUpdate = this._transisQueueUpdate || wrapQueueUpdate;
  }

  if (state) {
    // creates method for syncing to core
    this._transisSyncState = () => {
      let stateToUpdate = {};
      for (const k in state) {
        if (this.state[k] !== transisObject[k]) {
          // state variable is out of date, off-sync it
          unbindState(this.state[k], state[k], this._transisQueueUpdate);

          // transisObject state needs to be attached, sync it
          bindState(transisObject[k], state[k], this._transisQueueUpdate);

          stateToUpdate[k] = transisObject[k];
        }
      }

      // invoke change if anything changed
      if (Object.keys(stateToUpdate).length) {
        this.setState(stateToUpdate);
      }
    };

    // initially sync all state variables
    for (const k in state) {
      bindState(transisObject[k], state[k], this._transisQueueUpdate);
    }

    transisObject.on('*', this._transisSyncState);
  }

  // initially sync all prop variables
  if (props) {
    for (const k in props) {
      bindProps(this.props[k], props[k], this._transisQueueUpdate);
    }
  }
};

/**
 * A function to help changing key values of states to avoid props received
 *  from parent components
 */
export const remapStateToAvoidProps = ({ props, state, stateToPropMap }) => {
  let newState = {};
  if (stateToPropMap) {
    for (let k in state) {
      newState[stateToPropMap[k]] = state[k];
    }
  }
  else {
    newState = state;
  }

  if (props && newState) {
    const statePropsConflicts = findDuplicate(
      [...Object.keys(newState), ...Object.keys(props)]
    );
    if (statePropsConflicts.length) {
      throw new Error(`state variable names conflicted with props, please rename the following: "${statePropsConflicts.join(', ')}"`);
    }
  }

  return newState;
};

/** ["foo"] -> { "foo": "foo" } */
const createHashFromArray = arr => arr.reduce(
  (map, next) => ({ ...map, [next]: next }),
  {}
);


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
const transisReact = (
  { transisObject, state, props, stateToPropMap },
  WrappedComponent,
) => {
  if (!transisObject && state) {
    throw new Error("Cannot compose with-state component without global transis object, state: ", state);
  }

  /** Convert Array styled mixin to Hash (Normalize) */
  // e.g. StateMixin({}, 'a', 'b', 'c') -> props {}= { a: [], b: [], c: [] }
  if (({}).toString.call(state).indexOf('Array') !== -1) {
    state = state.reduce((obj, stateName) => {
      obj[stateName] = [];
      return obj;
    }, {});
  }

  if (state && stateToPropMap) {
    const futurePropKeys = ObjectValues(stateToPropMap);
    const propKeys = Object.keys(state);
    const intersect = futurePropKeys.filter(propKey => propKeys.indexOf(propKey) !== -1);

    if (intersect.length) {
      throw new Error(`Cannot rename props due to conflicting names "${intersect.join(', ')}"`);
    }
    stateToPropMap = {
      ...createHashFromArray(propKeys),
      ...stateToPropMap
    };
  }

  const higherOrderComponent = class HigherOrderComponent extends React.Component {
    constructor(propArgs) {
      super(propArgs);
      if (state) {
        this.state = Object.keys(state).reduce((result, key) => {
          result[key] = transisObject[key];
          return result;
        }, {});
      }
      if (props) {
        // sets up the life cycle method to listen for incoming props
        this.componentWillReceiveProps = (nextProps) => {
          for (const k in props) {
            props[k].forEach(prop => {
              if (nextProps[k] !== this.props[k]) {
                if (this.props[k]) {
                  this.props[k].off(prop, this._transisQueueUpdate);
                }
                if (nextProps[k]) {
                  nextProps[k].on(prop, this._transisQueueUpdate);
                }
              }
            });
          }
        };
      }
    }

    componentWillMount = () => {
      return componentWillMount.call(this, {
        transisObject, state, props
      });
    }

    componentDidMount = () => {
      logUpdate(this);
    }
    componentDidUpdate = () => {
      logUpdate(this);
    }

    componentWillUnmount = () => {
      unqueueUpdate(this);
      if (state) {
        for (const k in state) {
          unbindState(this.state[k], state[k], this._transisQueueUpdate);
        }
        transisObject.off('*', this._transisSyncState);
      }
      if (props) {
        for (const k in props) {
          unbindProps(this.props[k], props[k], this._transisQueueUpdate);
        }
      }
    };

    render = () => {
      const stateParams = remapStateToAvoidProps({ props: this.props, state: this.state, stateToPropMap });

      return (
        <WrappedComponent
          ref={core => this.core = core}
          {...this.props}
          {...stateParams}
        />
      );
    }
  };
  return higherOrderComponent;
};

transisReact.Transis = Transis;
// transisReact.updateLog = updateLog;
// transisReact.updateQueue = updateQueue;

export default transisReact;
