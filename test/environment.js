'use strict';

describe('Environment', function(){


  it('getIacStr: good -> bueno', function(){
    var good = App.Environment.getIacStr('good');
    expect(good).to.equal('bueno');
  });

  it('getWeatherTypeStr: sunnyday -> Soleado', function(){
    var sunnyday = App.Environment.getWeatherTypeStr('sunnyday');
    expect(sunnyday).to.equal('Soleado');
  });

  it('getVisibilityStr: moderate -> Moderada', function(){
    var good = App.Environment.getVisibilityStr('moderate');
    expect(good).to.equal('Moderada');
  });

  it('getNoisePressureDayClassStr: day -> 24 horas', function(){
    var good = App.Environment.getNoisePressureDayClassStr('day');
    expect(good).to.equal('24 horas');
  });

});