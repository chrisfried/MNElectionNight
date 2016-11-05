/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.race.component.ts" />
/// <reference path="mnen.edit.component.ts" />
/// <reference path="mnen.settings.component.ts" />
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
    private updateList: (list: string | number) => void;
    private toggleSelectors: () => void;
    private toggleSettings: () => void;
    private settings: {};

    public template: string = `
      <nav class="navbar navbar-fixed-top navbar-dark bg-inverse">
        <span class="navbar-text float-xs-right countdown">next check <span am-time-ago="$ctrl.nextUpdate"></span></span>
        <a class="navbar-brand" href="#">MN Election Night</a>
        <ul class="nav navbar-nav">
          <li class="nav-item" ng-class="{ 'active': $ctrl.showEdit }">
            <a class="nav-link" href="#" ng-click="$ctrl.toggleSelectors()">Select Races</a>
          </li>
          <li class="nav-item" ng-class="{ 'active': $ctrl.settings }">
            <a class="nav-link" href="#" ng-click="$ctrl.toggleSettings()">Settings</a>
          </li>
        </ul>
      </nav>
      <div class="container-fluid navbar-offset">
        <mnen-edit lists="$ctrl.listsObject" toggle="$ctrl.toggleSelectors" races="$ctrl.races" update="$ctrl.updateList" ng-if="$ctrl.showEdit"></mnen-edit>
        <mnen-settings settings="$ctrl.settings" toggle="$ctrl.toggleSettings" ng-if="$ctrl.showSettings"></mnen-settings>
        <div class="card-columns">
          <mnen-race race="race" settings="$ctrl.settings" class="card" ng-repeat="race in $ctrl.racesArray | filter: { visible: true } | orderBy: 'id' track by race.id"></mnen-race>
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
      vm.toggleSelectors = toggleSelectors;
      vm.toggleSettings = toggleSettings;

      vm.settings = angular.fromJson(localStorage['settings']) || {
        voteCount: true,
        votePercent: false,
        partyText: true,
        threshold: 0
      };

      vm.$onInit = activate;
      vm.updateList = updateList;

      vm.lastUpdate = Date.now();
      vm.nextUpdate = vm.lastUpdate + 300000;

      function activate() {
        for (let i in vm.lists) {
          MnenService.getResults(vm.lists[i])
            .then(function (data: string) {
              updateData(data, vm.lists[i]);
            });
        }
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

      function updateList(list) {
        MnenService.getResults(list)
          .then(function (data: string) {
            updateData(data, list);
          });
      }

      function updateData(data, list) {
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
              list: vm.listsObject[list]
            };

            if (localStorage[race]) vm.races[race].visible = JSON.parse(localStorage[race]);
            else vm.races[race].visible = true;

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
              percentageInt: parseInt(entry[14])
            };
            vm.races[race]['candidatesArray'].push(vm.races[race]['candidates'][candidate]);
          };
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
          }
        }
      }
    }
  }

  angular
    .module('mnen')
    .component('mnen', new MnenComponent());
}