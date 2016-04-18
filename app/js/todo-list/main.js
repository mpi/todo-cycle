'use strict';

define(['lodash', 'Rx', './model', './view', './intent'], function (_, Rx, model, view, intent) {
  
  return main;

  function main(drivers) {
    
    var intents$ = intent(drivers);
    var initial$ = Rx.Observable.just({url: '/api/todo-list', loadTodoItems: true});
    
    var updates$ = intents$.submit$
      .map(function(item) {
        return {url: '/api/todo-list', method: 'POST', send: {itemId: item.itemId, text: item.text, done: false}};
      });
      
    
    return {
      DOM: view(model(intents$)),
      HTTP: Rx.Observable.merge(initial$, updates$)
    };
  }
  
});
