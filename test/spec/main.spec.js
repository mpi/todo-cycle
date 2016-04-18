'use strict';

describe('main', function () {

  var Cycle, CycleDOM, CycleHTTP, Rx, _;
  var model, view, intent;

  beforeEach(function (done) {
    require(['cycle-js', 'cycle-dom', 'cycle-http', 'lodash', 'Rx'],
            function (Cycle_, CycleDOM_, CycleHTTP_, __, Rx_) {
      CycleDOM = CycleDOM_;
      CycleHTTP = CycleHTTP_;
      _ = __;
      Rx = Rx_;
      Cycle = Cycle_;
      done();
    });
  });

  beforeEach(function (done) {
    require(['todo-list/model', 'todo-list/view', 'todo-list/intent'],
            function (model_, view_, intent_) {
      model = model_;
      view = view_;
      intent = intent_;
      done();
    });
  });

  it('should do sth', function(){
    
    // given:
    var intents = {
      submit$: Rx.Observable.just('new item')
    };
    
    // when:
    var state$ = model(intents);
    
    // then:
    expect(get(state$)).toEqual({
      items: [{itemId: '1', text: 'new item', done: false, inEdit: false}],
      newItem: ''
    });
    
  });
  
  it('should emit intents on action', function(done){
    
    // given:
    var state$ = Rx.Observable.just({
      items: [{itemId: '1', text: 'new item', done: false, inEdit: false}],
      newItem: ''
    });
    
    // when:
    var intents = test(state$, function(el){
      el.find('span.edit').click();
    });
     
    // then:
    intents.edit$.subscribe(function(itemId){
      expect(itemId).toEqual('1');
      done();
    });

  });
  
  function test(state$, ready){
    
    var intents;
    
    function testMain(sources){
      
      intents = intent(sources);
      var view$ = view(state$);
      sources.DOM.observable.last().subscribe(function(x){
          console.log('rendered HTML: ', x);
          ready($(x));
      });
      return {
        DOM: view$,
        HTTP: Rx.Observable.empty()
      };
    }
    Cycle.run(testMain, {
      DOM: CycleDOM.makeDOMDriver($('<div/>').get(0)),
      HTTP: CycleHTTP.makeHTTPDriver()
    });
    return intents;
  }
  
  function get(stream$) {

    var result;
    stream$.subscribe(function (last) {
      result = last;
    });
    return result;
  }

});
