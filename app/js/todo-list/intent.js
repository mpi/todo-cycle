'use strict';

define(['lodash'], function (_) {

  var enterOnly = function (x) {
    return x === 13;
  };
  var extractItemId = _.property(['target', 'attributes', 'data-item-id', 'value']);

  function debug(stream$) {
    return stream$.map(function (x) {
      console.log(x);
      return x;
    });
  }

  return intent;

  function intent(sources) {

    var DOM = sources.DOM;
    var HTTP = sources.HTTP;

    var loadFromServer$ = HTTP
      .filter(function (res) {
        console.log(res);
        return res.request.loadTodoItems;
      })
      .mergeAll()
      .map(_.property('body'));

    var enter$ = DOM
      .select('input[type=text]')
      .events('keyup')
      .map(_.property('which'))
      .filter(enterOnly);
    
    var input$ = DOM
      .select('input.newItem')
      .events('input')
      .map(_.property('target.value'));

    var edit$ = debug(DOM
      .select('span.edit')
      .events('click')
      .map(extractItemId));

    var update$ = DOM
      .select('input.editedItem[type=text]')
      .events('blur')
      .map(_.property('target.value'));


    return {
      submit$: input$.sample(enter$).map(function(text) {return { itemId: _.uniqueId(), text: text };}),
      newValue$: input$,
      edit$: edit$,
      update$: update$,
      loadFromServer$: loadFromServer$,
      toggle$: debug(DOM
        .select('input[type=checkbox]')
        .events('click')
        .map(extractItemId))
    };
  }

});
