'use strict';

define(['lodash', 'cycle-dom', 'Rx'], function (_, CycleDOM, Rx) {
  
  var div = CycleDOM.div;
  var span = CycleDOM.span;
  var li = CycleDOM.li;
  var ul = CycleDOM.ul;
  var a = CycleDOM.a;
  var input = CycleDOM.input;
  
  var enterOnly = function(x){return x === 13;};

  function customizer(obj, fn) {
    if (_.isFunction(fn)) {
      return fn.call(null, obj);
    }
  }

  function patch(diff){
    var patchFn = _.partial(_.mergeWith, _, diff, customizer);
    patchFn.onlyIf = function(conditionFn){
      return function(state, index){
        return conditionFn(state, index) ? patchFn(state) : state;
      };
    };
    patchFn.unless = function(conditionFn){
      return function(state, index){
        return conditionFn(state, index) ? state : patchFn(state);
      };
    };
    return patchFn;
  }

  function each(fn){
    return _.partial(_.map, _, fn);
  }

  function append(){
    return _.partial(_.concat, _, _.toArray(arguments));
  }
  
  function toggle(x){
    return !x;
  }
  
  var actions = {
    addItem: function(text){
      return patch({
        items: append({itemId: _.uniqueId(), done: false, text: text, inEdit: false }),
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
  
  var extractItemId = _.property(['target','attributes', 'data-item-id', 'value']);
  
  return main;

  function main(drivers) {
    
    var intents$ = intent(drivers);
    var initial$ = Rx.Observable.just({url: '/api/todo-list'});
    
    var updates$ = intents$.submit$
      .map(function(text) {
        return {url: '/api/todo-list', method: 'POST', send: {itemId: _.uniqueId(), text: text, done: false}};
      });
      
    
    return {
      DOM: view(model(intents$)),
      HTTP: Rx.Observable.merge(initial$, updates$)
    };
  }

  function intent(sources) {
    
    var DOM = sources.DOM;
    var HTTP = sources.HTTP;
  
    var loadFromServer$ = HTTP
      .filter(function(res) {return res.request.url === '/api/todo-list';})
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
      submit$: debug(input$.sample(enter$)),
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
  
  function model(intents){

    var initialState = {items: [], newItem: ''};
    
    var add$ = intents.submit$.map(actions.addItem);
    var newValue$ = intents.newValue$.map(actions.updateNewItem);
    var toggle$ = intents.toggle$.map(actions.toggleItem);
    var edit$ = intents.edit$.map(actions.editItem);
    var update$ = intents.update$.map(actions.updateItem);
    var loadFromServer$ = intents.loadFromServer$.map(actions.loadItems);
    
    var state$ = Rx.Observable.merge(add$, toggle$, newValue$, edit$, update$, loadFromServer$)
      .startWith(initialState)
      .scan(function(prevModel, action){
        return action(prevModel);
      });
    
    return state$;
  }
    
  function view (model$) {
    
    var theme = {

      panel: function(){
        return div('.panel.panel-default', [div('.panel-body', _.toArray(arguments))]);
      },
      list: function(){
        return ul('.list-group', _.toArray(arguments));
      },
      listItem: function(){
        return li('.list-group-item', _.toArray(arguments));
      },
      textInput: function(value, cls){
        return input('.form-control' + (cls || ''), {type: 'text', value: value});
      },
      checkbox: function(options){
        return input({type: 'checkbox', checked: options.checked, attributes: {'data-item-id': options.id}});
      }

    };
    

    return model$.map(render);
    
    function render(model){
      return theme.panel(
        theme.list(model.items.map(renderListItem)),
        theme.textInput(model.newItem, '.newItem')
      );
    }
    
    function renderListItem(item){
      return item.inEdit ? renderEditedListItem(item) : theme.listItem(
        theme.checkbox({
          checked: item.done,
          id: item.itemId
        }),
        span('.edit', {
          style: {'text-decoration': (item.done ? 'line-through': 'none')},
          attributes: {'data-item-id': item.itemId}
        },[item.text])
      );
    }
    function renderEditedListItem(item){
      return theme.listItem(
        theme.textInput(item.text, '.editedItem')
      );
    }
    
  }
  
  function debug(stream$) {
    return stream$.map(function(x){
      console.log(x);
      return x;
    });
  }
  
});
