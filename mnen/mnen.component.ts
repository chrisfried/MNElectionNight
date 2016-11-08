/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.race.component.ts" />
/// <reference path="mnen.edit.component.ts" />
/// <reference path="mnen.settings.component.ts" />
/// <reference path="mnen.aggregate.component.ts" />
/// <reference path="mnen.about.component.ts" />
namespace mnenComponent {
  'use strict';

  class MnenComponent implements ng.IComponentOptions {
    private $onInit: () => void;
    private lists: string[];
    private listsObject: {};
    private races: {};
    private racesArray: {}[];
    private lastUpdate: number;
    private nextUpdate: number;
    private showEdit: boolean;
    private showSettings: boolean;
    private showAbout: boolean;
    private updateList: (list: string | number) => void;
    private toggleSelectors: () => void;
    private toggleSettings: () => void;
    private toggleAbout: () => void;
    private settings: {};
    private visibleRaces: {};
    private countdown: number;
    private updating: boolean;

    public template: string = `
      <nav class="navbar navbar-fixed-top navbar-dark bg-inverse">
        <span class="navbar-text float-xs-right countdown">
          <div class="spinner" ng-if="$ctrl.updating" ng-class="{'mini': $ctrl.settings.minicountdown}"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>
          <span ng-if="!$ctrl.settings.minicountdown"><span ng-if="$ctrl.settings.countdown">auto refresh in {{ $ctrl.countdown }} seconds, </span>updated {{ $ctrl.lastUpdate | date:'h:mma'}}</span>
          <span ng-if="$ctrl.settings.countdown && $ctrl.settings.minicountdown && !$ctrl.updating && $ctrl.countdown > 0">{{ $ctrl.countdown }}</span>
        </span>
        <a class="navbar-brand" href="#">MN Election Night</a>
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
        <mnen-edit lists="$ctrl.listsObject" visible="$ctrl.visibleRaces" toggle="$ctrl.toggleSelectors" races="$ctrl.races" update="$ctrl.updateList" ng-if="$ctrl.showEdit"></mnen-edit>
        <mnen-settings settings="$ctrl.settings" toggle="$ctrl.toggleSettings" ng-if="$ctrl.showSettings"></mnen-settings>
        <div class="card-columns">
          <mnen-about toggle="$ctrl.toggleAbout" ng-if="$ctrl.showAbout" class="card"></mnen-about>
          <mnen-aggregate visible="$ctrl.visibleRaces" lists="$ctrl.listsObject"></mnen-aggregate>
          <mnen-race race="race" settings="$ctrl.settings" class="card" ng-class="{'card-inverse': race.percentageReporting === 100}" ng-repeat="race in $ctrl.racesArray | filter: { visible: true } | orderBy: 'id' track by race.id"></mnen-race>
        </div>
      </div>`;

    public controller(MnenService: mnenService.MnenService, $timeout: ng.ITimeoutService): void {
      let vm = this;

      vm.lists = [
        '20', // State House
        '22', // President
        '24', // US House
        '30', // State Senate
        '37', // MN Supreme Court
        '66' // Amendment
      ]
      vm.listsObject = {};
      vm.races = {};
      vm.racesArray = [];
      vm.showEdit = false;
      vm.showSettings = false;
      vm.showAbout = false;
      vm.toggleSelectors = toggleSelectors;
      vm.toggleSettings = toggleSettings;
      vm.toggleAbout = toggleAbout;
      vm.countdown = 0;
      vm.updating = false;

      vm.settings = angular.fromJson(localStorage['mnen-settings']) || {
        voteCount: true,
        votePercent: false,
        partyText: true,
        threshold: 0,
        countdown: true,
        minicountdown: false
      };

      vm.visibleRaces = angular.fromJson(localStorage['mnen-races']) || {};
      vm.$onInit = activate;
      vm.updateList = updateList;

      vm.lastUpdate = Date.now();
      vm.nextUpdate = vm.lastUpdate + 30000;

      let countdownStarted = false;

      function activate() {
        vm.updating = true;
        if (!countdownStarted) {
          countdownStarted = true;
          updateCountdown();
        }

        for (let i in vm.lists) {
          MnenService.getResults(vm.lists[i])
            .then(function (data: string) {
              updateData(data, vm.lists[i]);
              vm.updating = false;
            });
        }
        vm.lastUpdate = Date.now();
        vm.nextUpdate = vm.lastUpdate + 30000;
        $timeout(activate, 30000);
      }

      function updateCountdown() {
        vm.countdown = Math.floor((vm.nextUpdate - Date.now()) / 1000);
        $timeout(updateCountdown, 1000);
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

      function updateList(list) {
        MnenService.getResults(list)
          .then(function (data: string) {
            updateData(data, list);
          });
      }

      function updateData(data, list) {
        let leaderUpdates = {};
        let leaderboardUpdate = false;
        if (!vm.listsObject[list]) {
          vm.listsObject[list] = {
            races: [],
            visible: false
          };
        }
        let dataArray: any[] = data.split('\n');
        for (let i = 0; i < dataArray.length; i++) {
          let entry = dataArray[i].split(';');
          let race = entry[3];
          if (!race || race == '&nbsp' || race.length < 2) continue;
          if (!vm.races[race]) {
            vm.races[race] = {
              id: race,
              office: entry[4],
              district: entry[5],
              reporting: entry[11],
              precincts: entry[12],
              votes: entry[15],
              candidates: {},
              candidatesArray: [],
              percentageReporting: parseInt(entry[11]) / parseInt(entry[12]) * 100,
              updated: Date.now(),
              list: vm.listsObject[list],
              leader: '',
              leaderVotes: 0
            };

            if (vm.visibleRaces[race]) vm.races[race].visible = vm.visibleRaces[race].visible;
            else {
              vm.races[race].visible = true;
              vm.visibleRaces[race] = {
                visible: true
              }
              localStorage['mnen-races'] = angular.toJson(vm.visibleRaces);
            }

            vm.racesArray.push(vm.races[race]);
            vm.listsObject[list]['races'].push(vm.races[race]);
          };
          let candidate = entry[6];
          if (!vm.races[race]['candidates'][candidate]) {
            vm.races[race]['candidates'][candidate] = {
              id: candidate,
              name: entry[7],
              party: entry[10],
              votes: entry[13],
              votesInt: parseInt(entry[13]),
              percentage: entry[14],
              percentageInt: parseFloat(entry[14])
            };
            vm.races[race]['candidatesArray'].push(vm.races[race]['candidates'][candidate]);
          };
          if (!vm.races[race].leader) {
            leaderUpdates[race] = true;
          }
          if (vm.races[race].reporting !== entry[11] ||
              vm.races[race]['candidates'][candidate].votes !== entry[13] ||
              vm.races[race]['candidates'][candidate].percentage !== entry[14]) {
                vm.races[race].reporting = entry[11];
                vm.races[race].percentageReporting = parseInt(entry[11]) / parseInt(entry[12]) * 100;
                vm.races[race].votes = entry[15];
                vm.races[race]['candidates'][candidate].votes = entry[13];
                vm.races[race]['candidates'][candidate].votesInt = parseInt(entry[13]);
                vm.races[race]['candidates'][candidate].percentage = entry[14];
                vm.races[race].updated = Date.now();
                leaderUpdates[race] = true;
          }
        }
        updateLeaders(leaderUpdates, list);
      }

      function updateLeaders(races, listId) {
        let leaderboardChange = false;
        for (let i in races) {
          let race = vm.races[i];
          let leader = race.leader;
          let leaderVotes = race.leaderVotes;
          for (let j in race.candidates) {
            let candidate = race.candidates[j];
            if (candidate.votesInt > leaderVotes) {
              leader = candidate.id;
              leaderVotes = candidate.votesInt;
            }
          }
          race.leaderVotes = leaderVotes;
          if (race.leader !== leader) {
            leaderboardChange = true;
            race.leader = leader;
          }
        }
        if (leaderboardChange && (listId === '20' || listId === '24' || listId === '30')) updateLeaderboards(listId);
      }

      function updateLeaderboards(listId) {
        let list = vm.listsObject[listId];
        let counts = {
          novotes: {
            name: 'No Results',
            complete: 0,
            completePerc: 0,
            incomplete: 0,
            incompletePerc: 0,
            total: 0
          }
        };
        let totalComplete = 0;
        for (let i in list.races) {
          let race = list.races[i];
          let leader = race.candidates[race.leader];
          if (leader && !counts[leader.party]) counts[leader.party] = {
            name: leader.party,
            complete: 0,
            completePerc: 0,
            incomplete: 0,
            incompletePerc: 0,
            total: 0
          };
          if (!leader) {
            counts.novotes.incomplete++;
            counts.novotes.total++;
          }
          else if (race.percentageReporting < 100) {
            counts[leader.party]['incomplete']++;
            counts[leader.party]['total']++;
          }
          else {
            totalComplete++;
            counts[leader.party]['complete']++;
            counts[leader.party]['total']++;
          }
        }
        list.leaderboardArray = [];
        for (let j in counts) {
          counts[j].completePerc = counts[j].complete / list.races.length * 100;
          counts[j].incompletePerc = counts[j].incomplete / list.races.length * 100;
          list.leaderboardArray.push(counts[j])
        }
        list.leaderboard = counts;
        list.complete = totalComplete;
        list.total = list.races.length;
        list.completePerc = totalComplete / list.races.length * 100;
      }
    }
  }

  angular
    .module('mnen')
    .component('mnen', new MnenComponent());
}