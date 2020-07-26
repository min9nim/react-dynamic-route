"use strict";

require("core-js/modules/es.promise");

require("core-js/modules/es.string.starts-with");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AsyncComponent = AsyncComponent;
exports.default = DynamicRoute;

var _jsxRuntime = require("custom-jsx-library/jsx-runtime");

var _react = _interopRequireWildcard(require("react"));

var _reactRouterDom = require("react-router-dom");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function AsyncComponent(props) {
  const [Component, setComponent] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    let cleanedUp = false;
    props.module.then(component => {
      if (cleanedUp) {
        return;
      }

      setComponent(() => component);
    }).catch(e => {
      console.info(e);

      if (cleanedUp) {
        return;
      }

      setComponent(null);

      if (e.message.startsWith('Cannot find module')) {
        if (typeof props.onNotFound === 'function') {
          props.onNotFound();
        }
      }
    });
    return () => {
      setComponent(null);
      cleanedUp = true;
    };
  }, [props]);
  return Component ? _react.default.createElement(Component, props) : props.loading || 'Loading..';
}

function DynamicRoute(props) {
  return (0, _jsxRuntime.jsx)(_reactRouterDom.BrowserRouter, {
    children: (0, _jsxRuntime.jsx)(_reactRouterDom.Route, {
      path: "/",
      render: (_ref) => {
        let {
          history,
          location
        } = _ref;
        const module = typeof props.loader === 'function' ? props.loader(location.pathname) : Promise.resolve("".concat('./pages' + location.pathname)).then(s => _interopRequireWildcard(require(s))).then(module => module.default);
        const loading = props.loading || 'Loading ' + location.pathname;
        return (0, _jsxRuntime.jsx)(AsyncComponent, _objectSpread({
          module: module,
          loading: loading,
          onNotFound: () => {
            history.push('/404');
          }
        }, props));
      }
    })
  });
}