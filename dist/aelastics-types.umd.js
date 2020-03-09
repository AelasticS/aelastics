(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.aelasticsTypes = factory())
}(this, (function() {
  'use strict'

  // Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...
  class DummyClass {
  }

  return DummyClass

})))
//# sourceMappingURL=aelastics-types.umd.js.map
