/// <reference path="mnen.module.ts" />
namespace mnenAggregateComponent {
  'use strict';

  class MnenAggregateComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      lists: '<',
      visible: '<'
    };

    private lists = {};
    private aggregates: {
      id: number,
      name: string,
      list?: {},
      visibility?: {}
    }[];
    private $onInit: () => void;
    private visible;

    public template: string = `
      <div class="card" ng-if="aggregate.visibility.visible && aggregate.list.leaderboard" ng-class="{'card-inverse': aggregate.list.completePerc === 100}" ng-repeat="aggregate in $ctrl.aggregates">
        <div class="card-block">
          <div class="fill-bar precincts" style="width: {{aggregate.list.completePerc}}%"></div>
          <h5 class="card-title">{{::aggregate.name}}</h5>
          <h6 class="card-subtitle text-muted" ng-class="{'incomplete': aggregate.list.completePerc < 100}">{{aggregate.list.complete}} of {{aggregate.list.total}} Seats with All Precincts Reporting</h6>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item" ng-repeat="party in aggregate.list.leaderboardArray | orderBy: '-total'">
            <span class="float-xs-right">
              <span>
                <span ng-if="party.complete > 0">Won {{party.complete}}</span>
                <span ng-if="party.complete > 0 && party.incomplete > 0">, </span>
                <span ng-if="party.incomplete > 0">Leading {{party.incomplete}}</span>
              </span>
            </span>
            <div class="fill-bar complete" style="width: {{party.completePerc}}%" ng-class="{'dfl': party.name === 'DFL','gop': party.name === 'R'}"></div>
            <div class="fill-bar incomplete" style="width: {{party.incompletePerc}}%; left: {{party.completePerc}}%" ng-class="{'dfl': party.name === 'DFL','gop': party.name === 'R'}"></div>
            <span>{{::party.name}}</span>
          </li>
        </ul>
      </div>`;

    public controller(): void {
      let vm = this;

      vm.$onInit = activate;

      vm.aggregates = [
        {
          id: 24,
          name: 'U.S. Congressional Seats'
        },
        {
          id: 30,
          name: 'MN State Senate Seats'
        },
        {
          id: 20,
          name: 'MN State Representative Seats'
        }
      ];

      function activate() {
        for (let i in vm.aggregates) {
          let id = vm.aggregates[i].id;
          if (!vm.lists[id]) vm.lists[id] = {
            races: [],
            visible: false
          }
          vm.aggregates[i].list = vm.lists[id];
          if (!vm.visible['agg' + id]) {
            vm.visible['agg' + id] = {
              visible: true
            }
            localStorage['mnen-races'] = angular.toJson(vm.visible);
          }
          vm.aggregates[i].visibility = vm.visible['agg' + id];
        }
      }

    }
  }

  angular
    .module('mnen')
    .component('mnenAggregate', new MnenAggregateComponent());
}