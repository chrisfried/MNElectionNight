/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
namespace mnenComponent {
  'use strict';

  class MnenComponent implements ng.IComponentOptions {
    private $onInit: () => void;
    private races: {};
    private racesArray: {}[];
    private lastUpdate: number;
    private nextUpdate: number;

    public template: string = `
      <div class="container-fluid">
        <h1>Election Night in Minnesota</h1>
        Checks for new data every five minutes. Next check <span am-time-ago="$ctrl.nextUpdate"></span>
        <div class="card-columns">
          <div ng-repeat="race in $ctrl.racesArray | orderBy: '-updated' track by race.id" class="card">
            <div class="card-block">
              <h5 class="card-title">{{race.office}}</h5>
              <h6 class="card-subtitle text-muted">{{race.reporting}} of {{::race.precincts}} Precincts Reporting</h6>
              Updated <span am-time-ago="race.updated"></span>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" ng-repeat="candidate in race.candidatesArray | orderBy: '-votesInt' track by candidate.id">
                <div class="fill-bar" style="width: {{candidate.percentage}}%" ng-class="{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}"></div>
                {{candidate.name}} - {{candidate.party}}
                <span class="float-xs-right">{{candidate.votes}}</span>
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

      vm.races = {};
      vm.racesArray = [];
      vm.$onInit = activate;
      vm.lastUpdate = Date.now();
      vm.nextUpdate = vm.lastUpdate + 300000;

      function activate() {
        MnenService.getResults('20') // State House
          .then(function (data: string) {
            updateData(data);
          });
        MnenService.getResults('22') // Presidential
          .then(function (data: string) {
            updateData(data);
          });
        MnenService.getResults('24') // US House
          .then(function (data: string) {
            updateData(data);
          });
        MnenService.getResults('30') // State Senate
          .then(function (data: string) {
            updateData(data);
          });
        MnenService.getResults('37') // MN Supreme Court
          .then(function (data: string) {
            updateData(data);
          });
        MnenService.getResults('66') // Amendment
          .then(function (data: string) {
            updateData(data);
          });
        vm.lastUpdate = Date.now();
        vm.nextUpdate = vm.lastUpdate + 300000;
        console.log(vm.lastUpdate);
        $timeout(activate, 300000);
      }

      function updateData(data) {
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
              updated: Date.now()
            };
            vm.racesArray.push(vm.races[race]);
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
                vm.races[race].votes = entry[15];
                vm.races[race]['candidates'][candidate].votes = entry[13];
                vm.races[race]['candidates'][candidate].votesInt = parseInt(entry[13]);
                vm.races[race]['candidates'][candidate].percentage = entry[14];
                vm.races[race].updated = Date.now();
          }
        }
        console.log(vm.races);
      }
    }
  }

  angular
    .module('mnen')
    .component('mnen', new MnenComponent());
}