// Copyright 2017 Telefónica Digital España S.L.
// 
// This file is part of UrboCore WWW.
// 
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
// 
// For those usages not covered by this license please contact with
// iot_support at tid dot es

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