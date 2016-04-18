'use strict';

requirejs.config({
  baseUrl: 'bower_components',
  urlArgs: 'ts=' + (new Date()).getTime(),
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
  }
});

require(
  [
    'cycle-js',
    'cycle-dom',
    'cycle-http',
    'todo-list/main'
  ],

  function(Cycle, CycleDOM, CycleHTTP, main) {
    
    Cycle.run(main, {
      HTTP: CycleHTTP.makeHTTPDriver({eager: true}),
      DOM: CycleDOM.makeDOMDriver('#todo-list')
    });
    
  }
);
