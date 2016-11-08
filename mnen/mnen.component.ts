/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.race.component.ts" />
/// <reference path="mnen.edit.component.ts" />
/// <reference path="mnen.settings.component.ts" />
/// <reference path="mnen.about.component.ts" />
namespace mnenComponent {
  'use strict';

  class MnenComponent implements ng.IComponentOptions {
    private $onInit: () => void;
    private listsObject: {};
    private races: {};
    private racesArray: {}[];
    private lastUpdate: number;
    private nextUpdate: number;
    private showEdit: boolean;
    private showSettings: boolean;
    private showAbout: boolean;
    private toggleSelectors: () => void;
    private toggleSettings: () => void;
    private toggleAbout: () => void;
    private settings: {};
    private visibleRaces: {};

    public template: string = `
      <nav class="navbar navbar-fixed-top navbar-dark bg-inverse">
        <span class="navbar-text float-xs-right countdown">auto refresh <span am-time-ago="$ctrl.nextUpdate"></span></span>
        <a class="navbar-brand" href="#">AZ Election Night</a>
        <ul class="nav navbar-nav">
          <li class="nav-item" ng-class="{ 'active': $ctrl.showEdit }">
            <a class="nav-link" href="#" ng-click="$ctrl.toggleSelectors()">&#x1F3C1;</a>
          </li>
          <li class="nav-item" ng-class="{ 'active': $ctrl.showSettings }">
            <a class="nav-link" href="#" ng-click="$ctrl.toggleSettings()">&#9881;</a>
          </li>
          <li class="nav-item" ng-class="{ 'active': $ctrl.showAbout }">
            <a class="nav-link" href="#" ng-click="$ctrl.toggleAbout()">&#x2139;</a>
          </li>
        </ul>
      </nav>
      <div class="container-fluid navbar-offset">
        <mnen-edit lists="$ctrl.listsObject" visible="$ctrl.visibleRaces" toggle="$ctrl.toggleSelectors" races="$ctrl.races" ng-if="$ctrl.showEdit"></mnen-edit>
        <mnen-settings settings="$ctrl.settings" toggle="$ctrl.toggleSettings" ng-if="$ctrl.showSettings"></mnen-settings>
        <div class="card-columns">
          <mnen-about toggle="$ctrl.toggleAbout" ng-if="$ctrl.showAbout" class="card"></mnen-about>
          <mnen-race race="race.contest" settings="$ctrl.settings" class="card" ng-class="{'card-inverse': race.contest._precinctsReportingPercent === 100}" ng-repeat="race in $ctrl.racesArray | filter: { visible: true } track by race.contest._key"></mnen-race>
        </div>
      </div>`;

    public controller(MnenService: mnenService.MnenService, $timeout: ng.ITimeoutService): void {
      let vm = this;

      vm.listsObject = {};
      vm.races = {};
      vm.racesArray = [];
      vm.showEdit = false;
      vm.showSettings = false;
      vm.showAbout = false;
      vm.toggleSelectors = toggleSelectors;
      vm.toggleSettings = toggleSettings;
      vm.toggleAbout = toggleAbout;

      vm.settings = angular.fromJson(localStorage['mnen-settings']) || {
        voteCount: true,
        votePercent: false,
        partyText: true
      };

      vm.visibleRaces = angular.fromJson(localStorage['mnen-races']) || {};
      vm.$onInit = activate;

      vm.lastUpdate = Date.now();
      vm.nextUpdate = vm.lastUpdate + 300000;

      function activate() {
        MnenService.getResults()
          .then(function (data: string) {
            updateData(data);
          });
        vm.lastUpdate = Date.now();
        vm.nextUpdate = vm.lastUpdate + 300000;
        $timeout(activate, 300000);
      }

      function toggleSelectors() {
        vm.showEdit = !vm.showEdit;
      }

      function toggleSettings() {
        vm.showSettings = !vm.showSettings;
      }

      function toggleAbout() {
        vm.showAbout = !vm.showAbout;
      }

      function updateData(data) {
        if (!vm.listsObject[0]) {
          vm.listsObject[0] = {
            races: [],
            visible: false
          };
        }
        let contests = data.electionResult.contests.contest;
        for (let i in contests) {
          let contest = contests[i];
          let race = contest._key;

          contest._precinctsParticipating = parseInt(contest._precinctsParticipating);
          contest._precinctsReported = parseInt(contest._precinctsReported);
          contest._precinctsReportingPercent = parseFloat(contest._precinctsReportingPercent);
          contest._numberToElect = parseInt(contest._numberToElect);

          if (!angular.isArray(contest.choices.choice)) {
            contest.choices.choice = [contest.choices.choice];
          }

          contest.votes = 0;

          for (let j in contest.choices.choice) {
            let choice = contest.choices.choice[j];
            choice._totalVotes = parseInt(choice._totalVotes);
            contest.votes += choice._totalVotes;
          }

          for (let j in contest.choices.choice) {
            let choice = contest.choices.choice[j];
            if (choice._totalVotes < 1) {
              choice.percentage = 0;
            } else {
              choice.percentage = (choice._totalVotes / contest.votes * 100).toFixed(2);
            }
          }

          if (!vm.races[race]) {
            vm.races[race] = {
              contest: contest
            }
            vm.racesArray.push(vm.races[race]);
            vm.listsObject[0]['races'].push(vm.races[race]);
          }
          else vm.races[race].contest = contest;

          if (vm.visibleRaces[race]) vm.races[race].visible = vm.visibleRaces[race].visible;
          else {
            vm.races[race].visible = true;
            vm.visibleRaces[race] = {
              visible: true
            }
            localStorage['mnen-races'] = angular.toJson(vm.visibleRaces);
          }
        }
      }

    }
  }

  angular
    .module('mnen')
    .component('mnen', new MnenComponent());
}