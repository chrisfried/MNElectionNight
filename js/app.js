var pawdModule;
(function (pawdModule) {
    'use strict';
    angular
        .module('mnen', [
        'angularMoment'
    ]);
})(pawdModule || (pawdModule = {}));
/// <reference path="mnen.module.ts" />
var mnenService;
(function (mnenService) {
    'use strict';
    var MnenService = (function () {
        function MnenService($http) {
            this.$http = $http;
            this.getResults = this.getResultsFunction;
        }
        MnenService.prototype.getResultsFunction = function (list) {
            var race = '1'; // 2012
            //  let race = '99'; // 2016 Primary
            return this.$http.get('/Results/MediaResult/' + race + '?mediafileid=' + list)
                .then(this.getResultsComplete)
                .catch(this.getResultsFailed);
        };
        MnenService.prototype.getResultsComplete = function (response) {
            return response.data;
        };
        MnenService.prototype.getResultsFailed = function (error) {
            console.error(error);
            return;
        };
        MnenService.$inject = ['$http'];
        return MnenService;
    }());
    mnenService.MnenService = MnenService;
    angular
        .module('mnen')
        .service('MnenService', MnenService);
})(mnenService || (mnenService = {}));
/// <reference path="mnen.module.ts" />
var mnenEditComponent;
(function (mnenEditComponent) {
    'use strict';
    var MnenEditComponent = (function () {
        function MnenEditComponent() {
            this.bindings = {
                lists: '<',
                update: '<',
                races: '<',
                toggle: '<'
            };
            this.template = "\n        <div class=\"card-columns\">\n          <div class=\"card\">\n            <div class=\"card-block\">\n              <h5 class=\"card-title\">Select Races</h5>\n              <p><h6 class=\"card-subtitle text-muted\">Choose which elections to watch.</h6></p>\n              <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide Selector</button>\n            </div>\n          </div>\n          <div class=\"card\" ng-repeat=\"option in $ctrl.options track by option.id\">\n            <div class=\"card-block\">\n              <h6>{{::option.name}}</h6>\n              <p><div ng-if=\"$ctrl.lists[option.id].races.length > 1\" class=\"btn-group\" role=\"group\" aria-label=\"Basic example\">\n                <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectAll(option.id)\">All</button>\n                <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectNone(option.id)\">None</button>\n                <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.lists[option.id].visible}\" ng-click=\"$ctrl.toggleList(option.id)\">\n                  {{ $ctrl.lists[option.id].visible ? 'Hide List' : 'Show List' }}\n                </button>\n              </div></p>\n              <div class=\"btn-group-vertical\" ng-if=\"$ctrl.lists[option.id].visible || $ctrl.lists[option.id].races.length < 2\">\n                <button ng-repeat=\"race in $ctrl.lists[option.id].races\" type=\"button\" class=\"btn btn-outline-success\" ng-class=\"{'active': race.visible}\" ng-click=\"$ctrl.toggleRace(race.id)\">{{race.office}}</button>\n              </div>\n            </div>\n          </div>\n        </div>\n      ";
        }
        MnenEditComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
            vm.toggleList = toggleList;
            vm.toggleRace = toggleRace;
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
                if (vm.lists[listId])
                    vm.lists[listId].visible = !vm.lists[listId].visible;
                else
                    vm.update(listId);
                console.log(listId);
            }
            function selectAll(listId) {
                for (var i in vm.lists[listId].races) {
                    vm.lists[listId].races[i].visible = true;
                    localStorage[vm.lists[listId].races[i].id] = vm.lists[listId].races[i].visible;
                }
            }
            function selectNone(listId) {
                for (var i in vm.lists[listId].races) {
                    console.log();
                    vm.lists[listId].races[i].visible = false;
                    localStorage[vm.lists[listId].races[i].id] = vm.lists[listId].races[i].visible;
                }
            }
            function toggleRace(raceId) {
                vm.races[raceId].visible = !vm.races[raceId].visible;
                localStorage[raceId] = vm.races[raceId].visible;
            }
            console.log(vm.lists);
            console.log(vm.options);
        };
        return MnenEditComponent;
    }());
    angular
        .module('mnen')
        .component('mnenEdit', new MnenEditComponent());
})(mnenEditComponent || (mnenEditComponent = {}));
/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.edit.component.ts" />
var mnenComponent;
(function (mnenComponent) {
    'use strict';
    var MnenComponent = (function () {
        function MnenComponent() {
            this.template = "\n      <div class=\"container-fluid\">\n        <h1>Election Night in Minnesota</h1>\n        <p class=\"lead\">\n          Checks for new data every five minutes. Next check <span am-time-ago=\"$ctrl.nextUpdate\"></span>. \n          <button ng-if=\"!$ctrl.edit\" type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.toggleSettings()\">Select Races</button>\n        </p>\n        <mnen-edit lists=\"$ctrl.listsObject\" toggle=\"$ctrl.toggleSettings\" races=\"$ctrl.races\" update=\"$ctrl.updateList\" ng-if=\"$ctrl.edit\"></mnen-edit>\n        <div class=\"card-columns\">\n          <div ng-repeat=\"race in $ctrl.racesArray | filter: { visible: true } | orderBy: 'id' track by race.id\" class=\"card\">\n            <div class=\"card-block\">\n              <div class=\"fill-bar precincts\" style=\"width: {{race.percentageReporting}}%\"></div>\n              <h5 class=\"card-title\">{{race.office}}</h5>\n              <h6 class=\"card-subtitle text-muted\">{{race.reporting}} of {{::race.precincts}} Precincts Reporting</h6>\n              <span ng-if=\"race.percentageReporting !== 100\" Updated <span am-time-ago=\"race.updated\"></span></span>\n            </div>\n            <ul class=\"list-group list-group-flush\">\n              <li class=\"list-group-item\" ng-repeat=\"candidate in race.candidatesArray | orderBy: '-votesInt' track by candidate.id\">\n                <span class=\"float-xs-right\">{{candidate.votes}}</span>\n                <div class=\"fill-bar\" style=\"width: {{candidate.percentage}}%\" ng-class=\"{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}\"></div>\n                {{candidate.name}} - {{candidate.party}}\n              </li>\n            </ul>\n            <div class=\"card-footer text-muted\">\n              Total Votes Cast\n              <span class=\"float-xs-right\">{{race.votes}}</span>\n            </div>\n          </div>\n        </div>\n      </div>";
        }
        MnenComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
            vm.lists = [
                '20',
                '22',
                '24',
                '30',
                '37',
                '66' // Amendment
            ];
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
                var _loop_1 = function(i) {
                    MnenService.getResults(vm.lists[i])
                        .then(function (data) {
                        updateData(data, vm.lists[i]);
                    });
                };
                for (var i in vm.lists) {
                    _loop_1(i);
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
                    .then(function (data) {
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
                var dataArray = data.split('\n');
                for (var i = 0; i < dataArray.length; i++) {
                    var entry = dataArray[i].split(';');
                    var race = entry[3];
                    if (!race || race == '&nbsp' || race.length < 2)
                        continue;
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
                        if (localStorage[race])
                            vm.races[race].visible = JSON.parse(localStorage[race]);
                        else
                            vm.races[race].visible = true;
                        vm.racesArray.push(vm.races[race]);
                        vm.listsObject[list]['races'].push(vm.races[race]);
                    }
                    ;
                    var candidate = entry[6];
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
                    }
                    ;
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
        };
        return MnenComponent;
    }());
    angular
        .module('mnen')
        .component('mnen', new MnenComponent());
})(mnenComponent || (mnenComponent = {}));
//# sourceMappingURL=app.js.map