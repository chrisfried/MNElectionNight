/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
namespace mnenComponent {
  'use strict';

  class MnenComponent implements ng.IComponentOptions {
    private $onInit: () => void;
    private races: {};

    public template: string = `
      <h1>Election Night in Minnesota</h1>`;

    public controller(MnenService: mnenService.MnenService): void {
      let vm = this;

      vm.races = {};
      vm.$onInit = activate;

      function activate() {
        MnenService.getResults()
          .then(function (data: string) {
            let dataArray: any[] = data.split('\n');
            for (let i = 0; i < dataArray.length; i++) {
              dataArray[i] = dataArray[i].split(';');
              let race = dataArray[i][3];
              if (!vm.races[race]) vm.races[race] = {
                office: dataArray[i][4],
                precincts: dataArray[i][11]
              };
              let candidate = dataArray[i][6];
              if (!vm.races[race][candidate]) vm.races[race][candidate] = {
                name: dataArray[i][7],
                party: dataArray[i][10]
              };
            }
            console.log(dataArray);
            console.log(vm.races);
          });
      }
    }
  }

  angular
    .module('mnen')
    .component('mnen', new MnenComponent());
}