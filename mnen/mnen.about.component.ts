/// <reference path="mnen.module.ts" />
namespace mnenAboutComponent {
  'use strict';

  class MnenAboutComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      toggle: '<'
    };

    public template: string = `
      <div class="card-block">
        <h5 class="card-title">&#x2139; About</h5>
        <p>This app is meant to save you those precious moments normally spent manually refreshing a few dozen sos tabs on election night.</p>
        <p>Thrown together for Minnesota the weekend before--then hastily ported to Arizona the night before--election day 2016.</p>
        <p>Data is pulled from xml files provided by the Arizona Secretary of State. You can see them <a href="http://press.azsos.gov/" target="_blank">here</a>.</p>
        <p>The code for this project is open source and can be found <a href="https://github.com/chrisfried/MNElectionNight" target="_blank">here</a>.</p>
        <p>Questions, suggestions, and compliments can be directed <a href="https://twitter.com/chrisfried" target="_blank">@chrisfried</a> on Twitter.</p>
        <button type="button" class="btn btn-outline-danger" ng-click="$ctrl.toggle()">Hide About</button>
      </div>`;
  }

  angular
    .module('mnen')
    .component('mnenAbout', new MnenAboutComponent());
}