//  replication of existing Transis Mixins are required so that transisReact factory can know about its _transisId.
//  NOTE: should be removed after migrating to React 16.
import {
  assignTransisIdTo,
  queueUpdate,
  unqueueUpdate,
  logUpdate,
} from "./updater";

// Legacy Prop Mixin
export const PropsMixin = function(props) {
  return {
    componentWillMount: function() {
      assignTransisIdTo(this);
      this._transisQueueUpdate =
        this._transisQueueUpdate ||
        (() => {
          queueUpdate(this);
        });

      for (const k in props) {
        props[k].forEach(function(prop) {
          if (this.props[k]) {
            this.props[k].on(prop, this._transisQueueUpdate);
          }
        }, this);
      }
    },

    componentDidMount: function() {
      logUpdate(this);
    },

    componentDidUpdate: function() {
      logUpdate(this);
    },

    componentWillUnmount: function() {
      unqueueUpdate(this);
      for (const k in props) {
        props[k].forEach(function(prop) {
          if (this.props[k]) {
            this.props[k].off(prop, this._transisQueueUpdate);
          }
        }, this);
      }
    },

    componentWillReceiveProps: function(nextProps) {
      for (const k in props) {
        props[k].forEach(function(prop) {
          if (nextProps[k] !== this.props[k]) {
            if (this.props[k]) {
              this.props[k].off(prop, this._transisQueueUpdate);
            }
            if (nextProps[k]) {
              nextProps[k].on(prop, this._transisQueueUpdate);
            }
          }
        }, this);
      }
    }
  };
};

// Legacy State Mixin
export const StateMixin = function(...args) {
  let [object, props] = args;
  if (typeof props !== "object") {
    props = [].slice.call(args, 1).reduce((acc, prop) => {
      acc[prop] = [];
      return acc;
    }, {});
  }

  return {
    getInitialState: function() {
      let state = {};
      for (const k in props) {
        state[k] = object[k];
      }
      return state;
    },

    componentWillMount: function() {
      assignTransisIdTo(this);
      this._transisQueueUpdate =
        this._transisQueueUpdate ||
        (() => {
          queueUpdate(this);
        });

      this._transisSyncState = () => {
        let state = {};

        for (const k in props) {
          if (this.state[k] !== object[k]) {
            if (this.state[k] && typeof this.state[k].off === "function") {
              props[k].forEach(path => {
                this.state[k].off(path, this._transisQueueUpdate);
              });
            }

            if (object[k] && typeof object[k].on === "function") {
              props[k].forEach(path => {
                object[k].on(path, this._transisQueueUpdate);
              });
            }

            state[k] = object[k];
          }
        }

        if (Object.keys(state).length) {
          this.setState(state);
        }
      };

      for (const k in props) {
        if (object[k] && typeof object[k].on === "function") {
          props[k].forEach(path => {
            object[k].on(path, this._transisQueueUpdate);
          });
        }
      }

      object.on("*", this._transisSyncState);
    },

    componentDidMount: function() {
      logUpdate(this);
    },

    componentDidUpdate: function() {
      logUpdate(this);
    },

    componentWillUnmount: function() {
      for (const k in props) {
        if (this.state[k] && typeof this.state[k].off === "function") {
          props[k].forEach(path => {
            this.state[k].off(path, this._transisQueueUpdate);
          });
        }
      }

      object.off("*", this._transisSyncState);
    }
  };
};
