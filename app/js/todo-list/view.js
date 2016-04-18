'use strict';

define(['cycle-dom', 'lodash'], function (CycleDOM, _) {
  
  return function view(model$) {

    var div = CycleDOM.div;
    var span = CycleDOM.span;
    var li = CycleDOM.li;
    var ul = CycleDOM.ul;
    var input = CycleDOM.input;
    var h4 = CycleDOM.h4;

    var theme = {

      panel: function () {
        return div('.panel.panel-default', [div('.panel-body', _.toArray(arguments))]);
      },
      header: function (text) {
        return h4('.page-header', [text]);
      },
      list: function () {
        return ul('.list-group', _.toArray(arguments));
      },
      listItem: function () {
        return li('.list-group-item', _.toArray(arguments));
      },
      textInput: function (value, cls) {
        return input('.form-control' + (cls || ''), {
          type: 'text',
          value: value
        });
      },
      checkbox: function (options) {
        return input({
          type: 'checkbox',
          style: {'margin-right': '10px'},
          checked: options.checked,
          attributes: {
            'data-item-id': options.id
          }
        });
      }

    };


    return model$.map(render);

    function render(model) {
      return theme.panel(
        theme.header('Things To-Do:'),
        theme.list(model.items.length ? model.items.map(renderListItem) : renderNoItems()),
        theme.textInput(model.newItem, '.newItem')
      );
    }

    function renderNoItems(){
      return theme.listItem(['There are no items. Please, add some using input below!']);
    }
    
    function renderListItem(item) {
      return item.inEdit ? renderEditedListItem(item) : theme.listItem(
        theme.checkbox({
          checked: item.done,
          id: item.itemId
        }),
        span('.edit', {
          style: {
            'text-decoration': (item.done ? 'line-through' : 'none')
          },
          attributes: {
            'data-item-id': item.itemId
          }
        }, [item.text])
      );
    }

    function renderEditedListItem(item) {
      return theme.listItem(
        theme.textInput(item.text, '.editedItem')
      );
    }

  };

});
