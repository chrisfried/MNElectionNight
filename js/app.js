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
/// <reference path="mnen.service.ts" />
var mnenComponent;
(function (mnenComponent) {
    'use strict';
    var MnenComponent = (function () {
        function MnenComponent() {
            this.template = "\n      <div class=\"container-fluid\">\n        <h1>Election Night in Minnesota</h1>\n        Checks for new data every five minutes. Next check <span am-time-ago=\"$ctrl.nextUpdate\"></span>\n        <div class=\"card-columns\">\n          <div ng-repeat=\"race in $ctrl.racesArray | orderBy: '-updated' track by race.id\" class=\"card\">\n            <div class=\"card-block\">\n              <h5 class=\"card-title\">{{race.office}}</h5>\n              <h6 class=\"card-subtitle text-muted\">{{race.reporting}} of {{::race.precincts}} Precincts Reporting</h6>\n              Updated <span am-time-ago=\"race.updated\"></span>\n            </div>\n            <ul class=\"list-group list-group-flush\">\n              <li class=\"list-group-item\" ng-repeat=\"candidate in race.candidatesArray | orderBy: '-votesInt' track by candidate.id\">\n                <div class=\"fill-bar\" style=\"width: {{candidate.percentage}}%\" ng-class=\"{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}\"></div>\n                {{candidate.name}} - {{candidate.party}}\n                <span class=\"float-xs-right\">{{candidate.votes}}</span>\n              </li>\n            </ul>\n            <div class=\"card-footer text-muted\">\n              Total Votes Cast\n              <span class=\"float-xs-right\">{{race.votes}}</span>\n            </div>\n          </div>\n        </div>\n      </div>";
        }
        MnenComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
            vm.races = {};
            vm.racesArray = [];
            vm.$onInit = activate;
            vm.lastUpdate = Date.now();
            vm.nextUpdate = vm.lastUpdate + 300000;
            function activate() {
                MnenService.getResults('20') // State House
                    .then(function (data) {
                    updateData(data);
                });
                MnenService.getResults('22') // Presidential
                    .then(function (data) {
                    updateData(data);
                });
                MnenService.getResults('24') // US House
                    .then(function (data) {
                    updateData(data);
                });
                MnenService.getResults('30') // State Senate
                    .then(function (data) {
                    updateData(data);
                });
                MnenService.getResults('37') // MN Supreme Court
                    .then(function (data) {
                    updateData(data);
                });
                MnenService.getResults('66') // Amendment
                    .then(function (data) {
                    updateData(data);
                });
                vm.lastUpdate = Date.now();
                vm.nextUpdate = vm.lastUpdate + 300000;
                console.log(vm.lastUpdate);
                $timeout(activate, 300000);
            }
            function updateData(data) {
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
                            updated: Date.now()
                        };
                        vm.racesArray.push(vm.races[race]);
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
                        vm.races[race].votes = entry[15];
                        vm.races[race]['candidates'][candidate].votes = entry[13];
                        vm.races[race]['candidates'][candidate].votesInt = parseInt(entry[13]);
                        vm.races[race]['candidates'][candidate].percentage = entry[14];
                        vm.races[race].updated = Date.now();
                    }
                }
                console.log(vm.races);
            }
        };
        return MnenComponent;
    }());
    angular
        .module('mnen')
        .component('mnen', new MnenComponent());
})(mnenComponent || (mnenComponent = {}));
//# sourceMappingURL=app.js.map