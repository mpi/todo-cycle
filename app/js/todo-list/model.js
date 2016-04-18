'use strict';

define(['lodash', 'Rx'], function (_, Rx) {

  var actions = {
    addItem: function(text, itemId){
      return patch({
        items: append({itemId: itemId, done: false, text: text, inEdit: false }),
        newItem: ''
      });
    },
    updateNewItem: function (newValue) {
        return patch({
          newItem: newValue
        });
    },
    editItem: function (itemId) {
        return patch({
          items: each(function(x){ return patch({inEdit: x.itemId === itemId})(x);})
        });
    },
    updateItem: function (text) {
        return patch({
          items: each(patch({text: text, inEdit: false}).onlyIf(_.property('inEdit')))
        });
    },
    loadItems: function (items) {
        return patch({
          items: items
        });
    },
    toggleItem: function(itemId){
        var isItemWithId = function(x){return _.matches({itemId: x});};
        return patch({
          items: each(patch({done: toggle}).onlyIf(isItemWithId(itemId)))
        });
    }
  };
  
  return model;

  function customizer(obj, fn) {
    if (_.isFunction(fn)) {
      return fn.call(null, obj);
    }
  }

  function patch(diff) {
    var patchFn = _.partial(_.mergeWith, _, diff, customizer);
    patchFn.onlyIf = function (conditionFn) {
      return function (state, index) {
        return conditionFn(state, index) ? patchFn(state) : state;
      };
    };
    patchFn.unless = function (conditionFn) {
      return function (state, index) {
        return conditionFn(state, index) ? state : patchFn(state);
      };
    };
    return patchFn;
  }

  function each(fn) {
    return _.partial(_.map, _, fn);
  }

  function append() {
    return _.partial(_.concat, _, _.toArray(arguments));
  }

  function toggle(x) {
    return !x;
  }

  function model(intents) {

    var empty = Rx.Observable.empty;
    
    intents = _.defaults(intents, {
      submit$: empty(),
      newValue$: empty(),
      toggle$: empty(),
      edit$: empty(),
      update$: empty(),
      loadFromServer$: empty()
    });
    
    var initialState = {
      items: [],
      newItem: ''
    };

    var add$ = intents.submit$.map(function(item) { return actions.addItem(item.text, item.itemId);});
    var newValue$ = intents.newValue$.map(actions.updateNewItem);
    var toggle$ = intents.toggle$.map(actions.toggleItem);
    var edit$ = intents.edit$.map(actions.editItem);
    var update$ = intents.update$.map(actions.updateItem);
    var loadFromServer$ = intents.loadFromServer$.map(actions.loadItems);

    var state$ = Rx.Observable.merge(add$, toggle$, newValue$, edit$, update$, loadFromServer$)
      .startWith(initialState)
      .scan(function (prevModel, action) {
        return action(prevModel);
      });

    return state$;
  }

});
