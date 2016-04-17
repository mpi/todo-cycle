'use strict';

define(['lodash', 'cycle-dom', 'Rx'], function (_, CycleDOM, Rx) {
  
  var span = CycleDOM.span;

  return main;

  function main() {
    
    return {
      DOM: Rx.Observable.just(span(_.join(['Hello', 'World!'], ' ')))
    };
  }

});
