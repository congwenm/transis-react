import Transis from "transis";

let nextId = 1;
const getId = () => nextId++;

/** incrementally adds a {_transisId} onto the {component} */
const assignTransisIdTo = component => {
  component._transisId = component._transisId || getId();
};


/* Update Log */
// used to keep track of what's been updated
const updateLog = new Set();

const logUpdate = component => updateLog.add(component);


/* Update Queue */
// used as a register for components that needs update
// TODO: optimize this with usage of a `Set`
let updateQueue = {};

const queueUpdate = component => {
  console.info('update queued', component)
  updateQueue[component._transisId] = component;
};

const unqueueUpdate = component => {
  delete updateQueue[component._transisId];
};


export const componentComparison = (a, b) => {
  return a._transisId - b._transisId;
};

// registers preFlush to be invoked before the next flush cycle
const registerDelayPreFlush = () =>
  Transis.Object.delayPreFlush(function preFlush() {
    updateLog.clear();
    registerDelayPostFlush(); // registers postFlush to be invoked after next flush cycle
  });

const registerDelayPostFlush = () =>
  Transis.Object.delay(function postFlush() {
    const componentsToUpdate =
      Object.keys(updateQueue).map(k => updateQueue[k]);
    updateQueue = {};

    // Sort the componentsToUpdate by their assigned _transisId. Since componentsToUpdate get mounted from the top
    // down, this should ensure that parent componentsToUpdate are force updated before any descendent
    // componentsToUpdate that also need an update. This avoids the case where we force update a component
    // and then force update one of its ancestors, which may unnecessarily render the component
    // again.
    componentsToUpdate.sort(componentComparison).forEach(component => {
      if (!updateLog.has(component)) {
        component.forceUpdate();
      }
    });

    registerDelayPreFlush();
  });


// first register to kick off the cycle
registerDelayPreFlush();

export {
  assignTransisIdTo,
  queueUpdate,
  unqueueUpdate,
  logUpdate,

  updateQueue,
  updateLog
};
