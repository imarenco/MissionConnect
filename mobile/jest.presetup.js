// This file runs before jest-expo's setup to ensure globals are properly initialized
// Fix for: TypeError: Object.defineProperty called on non-object

if (typeof global !== 'undefined') {
  // Ensure global object has required properties
  if (!global.process) {
    global.process = require('process');
  }
  
  // Initialize __DEV__ if not present
  if (typeof global.__DEV__ === 'undefined') {
    global.__DEV__ = true;
  }
  
  // Polyfill FormData for Node.js environments that don't have it
  if (typeof global.FormData === 'undefined') {
    try {
      // Try to use formdata-node or form-data if available
      global.FormData = require('formdata-node').FormData || require('form-data');
    } catch (e) {
      // If no FormData polyfill is available, create a minimal mock
      global.FormData = class FormData {
        constructor() {
          this._data = new Map();
        }
        append(name, value) {
          this._data.set(name, value);
        }
        get(name) {
          return this._data.get(name);
        }
        has(name) {
          return this._data.has(name);
        }
        delete(name) {
          this._data.delete(name);
        }
      };
    }
  }
}

// Patch Object.defineProperty to handle null/undefined targets gracefully
// This is a workaround for jest-expo's setup.js line 122
const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(target, property, attributes) {
  if (target === null || target === undefined || typeof target !== 'object') {
    // If target is invalid, create a new object or skip
    console.warn(`Object.defineProperty called on invalid target: ${target}, property: ${property}`);
    return target;
  }
  return originalDefineProperty.call(this, target, property, attributes);
};

// Ensure NativeModules has required properties before jest-expo tries to use them
try {
  const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
  
  // Ensure UIManager exists and is an object (not null/undefined)
  if (!NativeModules.UIManager || typeof NativeModules.UIManager !== 'object') {
    NativeModules.UIManager = {};
  }
  
  // Ensure NativeUnimoduleProxy exists with viewManagersMetadata
  if (!NativeModules.NativeUnimoduleProxy || typeof NativeModules.NativeUnimoduleProxy !== 'object') {
    NativeModules.NativeUnimoduleProxy = {
      viewManagersMetadata: {},
    };
  } else if (!NativeModules.NativeUnimoduleProxy.viewManagersMetadata || 
             typeof NativeModules.NativeUnimoduleProxy.viewManagersMetadata !== 'object') {
    NativeModules.NativeUnimoduleProxy.viewManagersMetadata = {};
  }
} catch (e) {
  // If react-native modules aren't available yet, that's okay
  // jest-expo will handle initialization
}

