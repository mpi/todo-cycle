'use strict';

describe('main', function () {

  var main, span;

  beforeEach(function (done) {
    require(['todo-list/main', 'cycle-dom'], function (_main, CycleDOM) {
      main = _main;
      span = CycleDOM.span;
      done();
    });
  });

  it('should greet', function () {

    var sinks = main({});

    var vdom = get(sinks.DOM.last());

    expect(vdom).toEqual(span(['Hello World!']));
  });

  function get(stream$) {

    var result;
    stream$.subscribe(function (last) {
      result = last;
    });
    return result;
  }

});
