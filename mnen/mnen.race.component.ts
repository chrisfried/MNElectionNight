/// <reference path="mnen.module.ts" />
namespace mnenRaceComponent {
  'use strict';

  class MnenRaceComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      race: '<',
      settings: '<'
    };

    public template: string = `
      <div ng-if="$ctrl.race.id === '0101'" class="card-header text-muted">Minnesota Presidential Results</div>
      <div class="card-block">
        <div class="fill-bar precincts" style="width: {{$ctrl.race.percentageReporting}}%"></div>
        <h5 class="card-title">{{::$ctrl.race.office}}</h5>
        <h6 class="card-subtitle text-muted" ng-class="{'incomplete': $ctrl.race.percentageReporting < 100}">{{$ctrl.race.reporting}} of {{::$ctrl.race.precincts}} Precincts Reporting<span ng-if="$ctrl.race.percentageReporting !== 100"> @ {{ $ctrl.race.updated | date:'h:mma'}}</span></h6>
      </div>
      <ul class="list-group list-group-flush">
        <li ng-if="candidate.percentageInt >= $ctrl.settings.threshold" class="list-group-item" ng-repeat="candidate in $ctrl.race.candidatesArray | orderBy: '-votesInt' track by candidate.id">
          <span class="float-xs-right">
            <span ng-if="$ctrl.settings.votePercent">{{candidate.percentage}}%</span>
            <span ng-if="$ctrl.settings.voteCount && $ctrl.settings.votePercent"> - </span>
            <span ng-if="$ctrl.settings.voteCount">{{candidate.votes}}</span>
          </span>
          <div class="fill-bar" style="width: {{candidate.percentage}}%" ng-class="{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}"></div>
          <span ng-class="{'winner': $first && $ctrl.race.percentageReporting === 100}">
            <span class="capitalize">{{::candidate.name | lowercase}}</span>
            <span class="tag tag-default" ng-if="$ctrl.settings.partyText && candidate.party !== 'WI' && candidate.party !== 'NP'" ng-class="{'tag-primary': candidate.party === 'DFL','tag-danger': candidate.party === 'R', 'tag-success': candidate.party === 'GP', 'tag-warning': candidate.party === 'LIB'}" >{{::candidate.party}}</span>
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
