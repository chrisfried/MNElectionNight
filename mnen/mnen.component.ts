/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.edit.component.ts" />
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
    private edit: boolean;
    private updateList: (list: string | number) => void;
    private toggleSettings: () => void;

    public template: string = `
      <div class="container-fluid">
        <h1>Election Night in Minnesota</h1>
        Checks for new data every five minutes. Next check <span am-time-ago="$ctrl.nextUpdate"></span>
        <button type="button" class="btn btn-outline-primary" ng-click="$ctrl.toggleSettings()">Settings</button>
        <mnen-edit lists="$ctrl.listsObject" toggle="$ctrl.toggleSettings" races="$ctrl.races" update="$ctrl.updateList" ng-if="$ctrl.edit"></mnen-edit>
        <div class="card-columns">
          <div ng-repeat="race in $ctrl.racesArray | filter: { visible: true } | orderBy: 'id' track by race.id" class="card">
            <div class="card-block">
              <div class="fill-bar precincts" style="width: {{race.percentageReporting}}%"></div>
              <h5 class="card-title">{{race.office}}</h5>
              <h6 class="card-subtitle text-muted">{{race.reporting}} of {{::race.precincts}} Precincts Reporting</h6>
              <span ng-if="race.percentageReporting !== 100" Updated <span am-time-ago="race.updated"></span></span>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" ng-repeat="candidate in race.candidatesArray | orderBy: '-votesInt' track by candidate.id">
                <span class="float-xs-right">{{candidate.votes}}</span>
                <div class="fill-bar" style="width: {{candidate.percentage}}%" ng-class="{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}"></div>
                {{candidate.name}} - {{candidate.party}}
              </li>
            </ul>
            <div class="card-footer text-muted">
              Total Votes Cast
              <span class="float-xs-right">{{race.votes}}</span>
            </div>
          </div>
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
      vm.edit = false;
      vm.toggleSettings = toggleSettings;

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
        console.log(vm.lastUpdate);
        $timeout(activate, 300000);
      }

      function toggleSettings() {
        vm.edit = !vm.edit;
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
              visible: true,
              list: vm.listsObject[list] 
            };
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
              percentage: entry[14]
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