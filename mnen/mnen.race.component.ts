/// <reference path="mnen.module.ts" />
namespace mnenRaceComponent {
  'use strict';

  class MnenRaceComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      race: '<',
      settings: '<'
    };

    public template: string = `
      <div ng-if="$ctrl.race._key === '590'" class="card-header text-muted">Arizona Presidential Results</div>
      <div class="card-block">
        <div class="fill-bar precincts" style="width: {{$ctrl.race._precinctsReportingPercent}}%"></div>
        <h5 class="card-title">{{::$ctrl.race._contestLongName}}</h5>
        <h6 class="card-subtitle text-muted" ng-class="{'incomplete': $ctrl.race._precinctsReportingPercent < 100}">{{$ctrl.race._precinctsReported}} of {{::$ctrl.race._precinctsParticipating}} Precincts Reporting<span ng-if="$ctrl.race._precinctsReportingPercent !== 100"></span><span ng-if="$ctrl.race._numberToElect > 1">, {{$ctrl.race._numberToElect}} to Elect</span></h6>
      </div>
      <ul class="list-group list-group-flush">
        <li class="list-group-item" ng-repeat="candidate in $ctrl.race.choices.choice | orderBy: '-_totalVotes' track by candidate._key">
          <span class="float-xs-right">
            <span ng-if="$ctrl.settings.votePercent">{{candidate.percentage}}%</span>
            <span ng-if="$ctrl.settings.voteCount && $ctrl.settings.votePercent"> - </span>
            <span ng-if="$ctrl.settings.voteCount">{{candidate._totalVotes}}</span>
          </span>
          <div class="fill-bar" style="width: {{candidate.percentage}}%" ng-class="{'dfl': candidate._party === 'DEM','gop': candidate._party === 'REP'}"></div>
          <span ng-class="{'winner': $first && $ctrl.race._precinctsReportingPercent === 100}">
            <span class="capitalize">{{::candidate._choiceName | lowercase}}</span>
            <span ng-if="$ctrl.settings.partyText"> - {{::candidate._party}}</span>
          </span>
        </li>
      </ul>
      <div class="card-footer text-muted">
        Total Votes Cast
        <span class="float-xs-right">{{$ctrl.race.votes}}</span>
      </div>`;
  }

  angular
    .module('mnen')
    .component('mnenRace', new MnenRaceComponent());
}
