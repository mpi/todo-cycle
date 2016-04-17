'use strict';

var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/\.spec\.js$/.test(file));
});

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/app/bower_components',

  paths: {
    'todo-list': '../js/todo-list',
    'cycle-js': 'cycle/dist/cycle',
    'cycle-dom': 'cycle-dom/dist/cycle-dom',
    'cycle-http': 'cycle-http/dist/cycle-http-driver',
    'Rx': 'rxjs/dist/rx.all',
    'lodash': 'lodash/dist/lodash'
  },
  shim: {
    'cycle-js': { deps: ['Rx'] },
    'cycle-dom': { deps: ['Rx'] },
    'cycle-http': { deps: ['Rx'] }
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
