'use strict';

describe('Utils', function(){

  var jsonTest = {
    a: 14,
    b: { r: 12, t: 'tre' },
    c: [ 'a', 3, {t: 12}]
  }

  it('App.Utils defined', function(){
    expect(App.Utils).to.be.defined;
  });

  it('App.Utils.getStepHours', function(){
    var hours = App.Utils.getStepHours('7d');
    expect(hours).to.equal(168);

    var hours = App.Utils.getStepHours('3d');
    expect(hours).to.equal(72);

    var hours = App.Utils.getStepHours('2d');
    expect(hours).to.equal(48);

    var hours = App.Utils.getStepHours('1d');
    expect(hours).to.equal(24);

    var hours = App.Utils.getStepHours('12h');
    expect(hours).to.equal(12);

    var hours = App.Utils.getStepHours('4h');
    expect(hours).to.equal(4);

    var hours = App.Utils.getStepHours('14d');
    expect(hours).to.equal(-1);

  });

});