if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  // ensure globality even if entire library were function wrapped (as in Meteor.js packaging system)
  window.fabric = fabric;
}
