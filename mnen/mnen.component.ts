/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
namespace mnenComponent {
  'use strict';

  class MnenComponent implements ng.IComponentOptions {
    private $onInit: () => void;
    private races: {};

    public template: string = `
      <div class="container-fluid">
        <h1>Election Night in Minnesota</h1>
        
        <div class="card-columns">
          <div ng-repeat="race in $ctrl.races" class="card">
            <div class="card-block">
              <h5 class="card-title">{{race.office}}</h5>
              <h6 class="card-subtitle text-muted">{{race.reporting}} of {{::race.precincts}} Precincts Reporting</h6>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item" ng-repeat="candidate in race.candidates">{{candidate.name}} - {{candidate.party}}</li>
            </ul>
          </div>
        </div>
      </div>`;

    public controller(MnenService: mnenService.MnenService): void {
      let vm = this;

      vm.races = {};
      vm.$onInit = activate;

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
      }

      function updateData(data) {
        let dataArray: any[] = data.split('\n');
        for (let i = 0; i < dataArray.length; i++) {
          let entry = dataArray[i].split(';');
          let race = entry[3];
          if (!race || race == '&nbsp' || race.length < 2) continue;
          if (!vm.races[race]) vm.races[race] = {
            office: entry[4],
            district: entry[5],
            reporting: entry[11],
            precincts: entry[12],
            votes: entry[15],
            candidates: {},
            updated: Date.now()
          };
          let candidate = entry[6];
          if (!vm.races[race]['candidates'][candidate]) vm.races[race]['candidates'][candidate] = {
            name: entry[7],
            party: entry[10],
            votes: entry[13],
            percentage: entry[14]
          };
          if (vm.races[race].reporting !== entry[11] ||
              vm.races[race].votes !== entry[15] ||
              vm.races[race]['candidates'][candidate].votes !== entry[13] ||
              vm.races[race]['candidates'][candidate].percentage !== entry[14]) {
                vm.races[race].reporting = entry[11];
                vm.races[race].votes = entry[15];
                vm.races[race]['candidates'][candidate].votes = entry[13];
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