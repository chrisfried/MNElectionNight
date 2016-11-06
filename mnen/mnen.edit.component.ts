/// <reference path="mnen.module.ts" />
namespace mnenEditComponent {
  'use strict';

  class MnenEditComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      lists: '<',
      update: '<',
      races: '<',
      toggle: '<',
      visible: '<'
    };

    private $onInit: () => void;
    private lists: {};
    private races: {};
    private update: (list: string) => void;
    private options: {}[];
    private toggleList: (listId: string | number) => void;
    private toggleRace: (raceId: string | number) => void;
    private toggleAggregate: (aggId: string | number) => void;
    private selectAll: (listId: string | number) => void;
    private selectNone: (listId: string | number) => void;
    private visible: {};

    public template: string = `
      <div class="card-columns">
        <div class="card">
          <div class="card-block">
            <h5 class="card-title">&#x1F3C1; Select Races</h5>
            <p><h6 class="card-subtitle text-muted">Choose which elections to watch.</h6></p>
            <button type="button" class="btn btn-outline-danger" ng-click="$ctrl.toggle()">Hide Selectors</button>
          </div>
        </div>
        <div class="card">
          <div class="card-block">
            <h6 class="card-title">Seat Counts</h6>
            <p><div class="btn-group" role="group">
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.visible['agg24'].visible}" ng-click="$ctrl.toggleAggregate('24')">U.S. House</button>
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.visible['agg30'].visible}" ng-click="$ctrl.toggleAggregate('30')">MN Senate</button>
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.visible['agg20'].visible}" ng-click="$ctrl.toggleAggregate('20')">MN Reps</button>
            </div></p>
          </div>
        </div>
        <div class="card" ng-repeat="option in $ctrl.options track by option.id">
          <div class="card-block">
            <h6>{{::option.name}}</h6>
            <p><div ng-if="$ctrl.lists[option.id].races.length > 1" class="btn-group" role="group">
              <button type="button" class="btn btn-outline-primary" ng-click="$ctrl.selectAll(option.id)">All</button>
              <button type="button" class="btn btn-outline-primary" ng-click="$ctrl.selectNone(option.id)">None</button>
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.lists[option.id].visible}" ng-click="$ctrl.toggleList(option.id)">
                {{ $ctrl.lists[option.id].visible ? 'Hide List' : 'Show List' }}
              </button>
            </div></p>
            <div class="btn-group-vertical" ng-if="$ctrl.lists[option.id].visible || $ctrl.lists[option.id].races.length < 2">
              <button ng-repeat="race in $ctrl.lists[option.id].races" type="button" class="btn btn-outline-success" ng-class="{'active': race.visible}" ng-click="$ctrl.toggleRace(race.id)">{{::race.office}}</button>
            </div>
          </div>
        </div>
      </div>`;

    public controller(MnenService: mnenService.MnenService, $timeout: ng.ITimeoutService): void {
      let vm = this;

      vm.toggleList = toggleList;
      vm.toggleRace = toggleRace;
      vm.toggleAggregate = toggleAggregate;
      vm.selectAll = selectAll;
      vm.selectNone = selectNone;

      vm.options = [
        {
          id: 22,
          name: 'U.S. Presidential Race'
        },
        {
          id: 24,
          name: 'U.S. Congressional Races'
        },
        {
          id: 30,
          name: 'MN State Senate Races'
        },
        {
          id: 20,
          name: 'MN State Representative Races'
        },
        {
          id: 66,
          name: 'MN Constitutional Amendments'
        },
        {
          id: 37,
          name: 'MN Judicial Races'
        }
      ];

      function toggleList(listId) {
        if (vm.lists[listId]) vm.lists[listId].visible = !vm.lists[listId].visible;
        else vm.update(listId);
      }

      function selectAll(listId) {
        for (let i in vm.lists[listId].races) {
          vm.lists[listId].races[i].visible = true;
          vm.visible[vm.lists[listId].races[i].id].visible = true;
          localStorage['mnen-races'] = angular.toJson(vm.visible);
        }
      }

      function selectNone(listId) {
        for (let i in vm.lists[listId].races) {
          vm.lists[listId].races[i].visible = false;
          vm.visible[vm.lists[listId].races[i].id].visible = false;
          localStorage['mnen-races'] = angular.toJson(vm.visible);
        }
      }

      function toggleRace(raceId) {
        vm.races[raceId].visible = !vm.races[raceId].visible;
        vm.visible[raceId].visible = vm.races[raceId].visible;
        localStorage['mnen-races'] = angular.toJson(vm.visible);
      }

      function toggleAggregate(id) {
        vm.visible['agg' + id].visible = !vm.visible['agg' + id].visible;
        localStorage['mnen-races'] = angular.toJson(vm.visible);
      }
    }
  }

  angular
    .module('mnen')
    .component('mnenEdit', new MnenEditComponent());
}