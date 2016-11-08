var mnenModule;
(function (mnenModule) {
    'use strict';
    angular
        .module('mnen', []);
})(mnenModule || (mnenModule = {}));
/// <reference path="mnen.module.ts" />
var mnenAboutComponent;
(function (mnenAboutComponent) {
    'use strict';
    var MnenAboutComponent = (function () {
        function MnenAboutComponent() {
            this.bindings = {
                toggle: '<'
            };
            this.template = "\n      <div class=\"card-block\">\n        <h5 class=\"card-title\">&#x2139; About</h5>\n        <p>This app is meant to save you those precious moments normally spent manually refreshing a few dozen sos.state.mn.us tabs on election night.</p>\n        <p>Thrown together the weekend before election day 2016 by Chris Fried.</p>\n        <p>Data is pulled from text files provided by the Minnesota Secretary of State. You can see them <a href=\"http://electionresults.sos.state.mn.us/Select/Download/100\" target=\"_blank\">here</a>.</p>\n        <p>The code for this project is open source and can be found <a href=\"https://github.com/chrisfried/MNElectionNight\" target=\"_blank\">here</a>.</p>\n        <p>Questions, suggestions, and compliments can be directed <a href=\"https://twitter.com/chrisfried\" target=\"_blank\">@chrisfried</a> on Twitter.</p>\n        <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide About</button>\n      </div>";
        }
        return MnenAboutComponent;
    }());
    angular
        .module('mnen')
        .component('mnenAbout', new MnenAboutComponent());
})(mnenAboutComponent || (mnenAboutComponent = {}));
/// <reference path="mnen.module.ts" />
var mnenAggregateComponent;
(function (mnenAggregateComponent) {
    'use strict';
    var MnenAggregateComponent = (function () {
        function MnenAggregateComponent() {
            this.bindings = {
                lists: '<',
                visible: '<'
            };
            this.lists = {};
            this.template = "\n      <div class=\"card\" ng-if=\"aggregate.visibility.visible && aggregate.list.leaderboard\" ng-class=\"{'card-inverse': aggregate.list.completePerc === 100}\" ng-repeat=\"aggregate in $ctrl.aggregates\">\n        <div class=\"card-block\">\n          <div class=\"fill-bar precincts\" style=\"width: {{aggregate.list.completePerc}}%\"></div>\n          <h5 class=\"card-title\">{{::aggregate.name}}</h5>\n          <h6 class=\"card-subtitle text-muted\" ng-class=\"{'incomplete': aggregate.list.completePerc < 100}\">{{aggregate.list.complete}} of {{aggregate.list.total}} Seats with All Precincts Reporting</h6>\n        </div>\n        <ul class=\"list-group list-group-flush\">\n          <li class=\"list-group-item\" ng-repeat=\"party in aggregate.list.leaderboardArray | orderBy: '-total'\">\n            <span class=\"float-xs-right\">\n              <span>\n                <span ng-if=\"party.complete > 0\">Won {{party.complete}}</span>\n                <span ng-if=\"party.complete > 0 && party.incomplete > 0\">, </span>\n                <span ng-if=\"party.incomplete > 0\">Leading {{party.incomplete}}</span>\n              </span>\n            </span>\n            <div class=\"fill-bar complete\" style=\"width: {{party.completePerc}}%\" ng-class=\"{'dfl': party.name === 'DFL','gop': party.name === 'R'}\"></div>\n            <div class=\"fill-bar incomplete\" style=\"width: {{party.incompletePerc}}%; left: {{party.completePerc}}%\" ng-class=\"{'dfl': party.name === 'DFL','gop': party.name === 'R'}\"></div>\n            <span>{{::party.name}}</span>\n          </li>\n        </ul>\n      </div>";
        }
        MnenAggregateComponent.prototype.controller = function () {
            var vm = this;
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
                for (var i in vm.aggregates) {
                    var id = vm.aggregates[i].id;
                    if (!vm.lists[id])
                        vm.lists[id] = {
                            races: [],
                            visible: false
                        };
                    vm.aggregates[i].list = vm.lists[id];
                    if (!vm.visible['agg' + id]) {
                        vm.visible['agg' + id] = {
                            visible: true
                        };
                        localStorage['mnen-races'] = angular.toJson(vm.visible);
                    }
                    vm.aggregates[i].visibility = vm.visible['agg' + id];
                }
            }
        };
        return MnenAggregateComponent;
    }());
    angular
        .module('mnen')
        .component('mnenAggregate', new MnenAggregateComponent());
})(mnenAggregateComponent || (mnenAggregateComponent = {}));
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
            //  let race = '1'; // 2012 General
            //  let race = '99'; // 2016 Primary
            var race = '100'; // 2016 General
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
var mnenRaceComponent;
(function (mnenRaceComponent) {
    'use strict';
    var MnenRaceComponent = (function () {
        function MnenRaceComponent() {
            this.bindings = {
                race: '<',
                settings: '<'
            };
            this.template = "\n      <div ng-if=\"$ctrl.race.id === '0101'\" class=\"card-header text-muted\">Minnesota Presidential Results</div>\n      <div class=\"card-block\">\n        <div class=\"fill-bar precincts\" style=\"width: {{$ctrl.race.percentageReporting}}%\"></div>\n        <h5 class=\"card-title\">{{::$ctrl.race.office}}</h5>\n        <h6 class=\"card-subtitle text-muted\" ng-class=\"{'incomplete': $ctrl.race.percentageReporting < 100}\">{{$ctrl.race.reporting}} of {{::$ctrl.race.precincts}} Precincts Reporting<span ng-if=\"$ctrl.race.percentageReporting !== 100\"> @ {{ $ctrl.race.updated | date:'h:mma'}}</span></h6>\n      </div>\n      <ul class=\"list-group list-group-flush\">\n        <li ng-if=\"candidate.percentageInt >= $ctrl.settings.threshold\" class=\"list-group-item\" ng-repeat=\"candidate in $ctrl.race.candidatesArray | orderBy: '-votesInt' track by candidate.id\">\n          <span class=\"float-xs-right\">\n            <span ng-if=\"$ctrl.settings.votePercent\">{{candidate.percentage}}%</span>\n            <span ng-if=\"$ctrl.settings.voteCount && $ctrl.settings.votePercent\"> - </span>\n            <span ng-if=\"$ctrl.settings.voteCount\">{{candidate.votes}}</span>\n          </span>\n          <div class=\"fill-bar\" style=\"width: {{candidate.percentage}}%\" ng-class=\"{'dfl': candidate.party === 'DFL','gop': candidate.party === 'R'}\"></div>\n          <span ng-class=\"{'winner': $first && $ctrl.race.percentageReporting === 100}\">\n            <span class=\"capitalize\">{{::candidate.name | lowercase}}</span>\n            <span class=\"tag tag-default\" ng-if=\"$ctrl.settings.partyText && candidate.party !== 'WI' && candidate.party !== 'NP'\" ng-class=\"{'tag-primary': candidate.party === 'DFL','tag-danger': candidate.party === 'R', 'tag-success': candidate.party === 'GP', 'tag-warning': candidate.party === 'LIB'}\" >{{::candidate.party}}</span>\n          </span>\n        </li>\n      </ul>\n      <div class=\"card-footer text-muted\">\n        Total Votes Cast\n        <span class=\"float-xs-right\">{{$ctrl.race.votes}}</span>\n      </div>";
        }
        return MnenRaceComponent;
    }());
    angular
        .module('mnen')
        .component('mnenRace', new MnenRaceComponent());
})(mnenRaceComponent || (mnenRaceComponent = {}));
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
                toggle: '<',
                visible: '<'
            };
            this.template = "\n      <div class=\"card-columns\">\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h5 class=\"card-title\">&#x1F3C1; Select Races</h5>\n            <p><h6 class=\"card-subtitle text-muted\">Choose which elections to watch.</h6></p>\n            <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide Selectors</button>\n          </div>\n        </div>\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6 class=\"card-title\">Seat Counts</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.visible['agg24'].visible}\" ng-click=\"$ctrl.toggleAggregate('24')\">U.S. House</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.visible['agg30'].visible}\" ng-click=\"$ctrl.toggleAggregate('30')\">MN Senate</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.visible['agg20'].visible}\" ng-click=\"$ctrl.toggleAggregate('20')\">MN Reps</button>\n            </div></p>\n          </div>\n        </div>\n        <div class=\"card\" ng-repeat=\"option in $ctrl.options track by option.id\">\n          <div class=\"card-block\">\n            <h6>{{::option.name}}</h6>\n            <p><div ng-if=\"$ctrl.lists[option.id].races.length > 1\" class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectAll(option.id)\">All</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectNone(option.id)\">None</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.lists[option.id].visible}\" ng-click=\"$ctrl.toggleList(option.id)\">\n                {{ $ctrl.lists[option.id].visible ? 'Hide List' : 'Show List' }}\n              </button>\n            </div></p>\n            <div class=\"btn-group-vertical\" ng-if=\"$ctrl.lists[option.id].visible || $ctrl.lists[option.id].races.length < 2\">\n              <button ng-repeat=\"race in $ctrl.lists[option.id].races\" type=\"button\" class=\"btn btn-outline-success\" ng-class=\"{'active': race.visible}\" ng-click=\"$ctrl.toggleRace(race.id)\">{{::race.office}}</button>\n            </div>\n          </div>\n        </div>\n      </div>";
        }
        MnenEditComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
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
                if (vm.lists[listId])
                    vm.lists[listId].visible = !vm.lists[listId].visible;
                else
                    vm.update(listId);
            }
            function selectAll(listId) {
                for (var i in vm.lists[listId].races) {
                    vm.lists[listId].races[i].visible = true;
                    vm.visible[vm.lists[listId].races[i].id].visible = true;
                    localStorage['mnen-races'] = angular.toJson(vm.visible);
                }
            }
            function selectNone(listId) {
                for (var i in vm.lists[listId].races) {
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
        };
        return MnenEditComponent;
    }());
    angular
        .module('mnen')
        .component('mnenEdit', new MnenEditComponent());
})(mnenEditComponent || (mnenEditComponent = {}));
/// <reference path="mnen.module.ts" />
var mnenSettingsComponent;
(function (mnenSettingsComponent) {
    'use strict';
    var MnenSettingsComponent = (function () {
        function MnenSettingsComponent() {
            this.bindings = {
                toggle: '<',
                settings: '<'
            };
            this.template = "\n      <div class=\"card-columns\">\n\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h5 class=\"card-title\">&#9881; Settings</h5>\n            <p><h6 class=\"card-subtitle text-muted\">Toggles for days!</h6></p>\n            <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide Settings</button>\n          </div>\n        </div>\n\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Candidate Votes</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.voteCount}\" ng-click=\"$ctrl.toggleSetting('voteCount')\">Count</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.votePercent}\" ng-click=\"$ctrl.toggleSetting('votePercent')\">Percent</button>\n            </div></p>\n          </div>\n        </div>\n        \n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Party Initials</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.partyText}\" ng-click=\"$ctrl.toggleSetting('partyText')\">Display</button>\n            </div></p>\n          </div>\n        </div>\n        \n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Countdown Timer</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.countdown}\" ng-click=\"$ctrl.toggleSetting('countdown')\">Display</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.minicountdown}\" ng-click=\"$ctrl.toggleSetting('minicountdown')\">Minimal</button>\n            </div></p>\n          </div>\n        </div>\n        \n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Hide By Vote Threshold</h6>\n            <p><div class=\"input-group\">\n              <input type=\"number\" min=\"0\" max=\"100\" step=\"0.1\"class=\"form-control\" ng-model=\"$ctrl.settings.threshold\" ng-change=\"$ctrl.saveSettings()\">\n              <span class=\"input-group-addon\">%</span>\n            </div></p>\n          </div>\n        </div>\n\n      </div>";
        }
        MnenSettingsComponent.prototype.controller = function () {
            var vm = this;
            vm.toggleSetting = toggleSetting;
            vm.saveSettings = saveSettings;
            function toggleSetting(setting) {
                vm.settings[setting] = !vm.settings[setting];
                saveSettings();
            }
            function saveSettings() {
                localStorage['mnen-settings'] = angular.toJson(vm.settings);
            }
        };
        return MnenSettingsComponent;
    }());
    angular
        .module('mnen')
        .component('mnenSettings', new MnenSettingsComponent());
})(mnenSettingsComponent || (mnenSettingsComponent = {}));
/// <reference path="mnen.module.ts" />
/// <reference path="mnen.service.ts" />
/// <reference path="mnen.race.component.ts" />
/// <reference path="mnen.edit.component.ts" />
/// <reference path="mnen.settings.component.ts" />
/// <reference path="mnen.aggregate.component.ts" />
/// <reference path="mnen.about.component.ts" />
var mnenComponent;
(function (mnenComponent) {
    'use strict';
    var MnenComponent = (function () {
        function MnenComponent() {
            this.template = "\n      <nav class=\"navbar navbar-fixed-top navbar-dark bg-inverse\">\n        <span class=\"navbar-text float-xs-right countdown\">\n          <div class=\"spinner\" ng-if=\"$ctrl.updating\" ng-class=\"{'mini': $ctrl.settings.minicountdown}\"><div class=\"double-bounce1\"></div><div class=\"double-bounce2\"></div></div>\n          <span ng-if=\"!$ctrl.settings.minicountdown\"><span ng-if=\"$ctrl.settings.countdown\">auto refresh in {{ $ctrl.countdown }} seconds, </span>updated {{ $ctrl.lastUpdate | date:'h:mma'}}</span>\n          <span ng-if=\"$ctrl.settings.countdown && $ctrl.settings.minicountdown && !$ctrl.updating && $ctrl.countdown > 0\">{{ $ctrl.countdown }}</span>\n        </span>\n        <a class=\"navbar-brand\" href=\"#\">MN Election Night</a>\n        <ul class=\"nav navbar-nav\">\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showEdit }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleSelectors()\">&#x1F3C1;</a>\n          </li>\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showSettings }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleSettings()\">&#9881;</a>\n          </li>\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showAbout }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleAbout()\">&#x2139;</a>\n          </li>\n        </ul>\n      </nav>\n      <div class=\"container-fluid navbar-offset\">\n        <mnen-edit lists=\"$ctrl.listsObject\" visible=\"$ctrl.visibleRaces\" toggle=\"$ctrl.toggleSelectors\" races=\"$ctrl.races\" update=\"$ctrl.updateList\" ng-if=\"$ctrl.showEdit\"></mnen-edit>\n        <mnen-settings settings=\"$ctrl.settings\" toggle=\"$ctrl.toggleSettings\" ng-if=\"$ctrl.showSettings\"></mnen-settings>\n        <div class=\"card-columns\">\n          <mnen-about toggle=\"$ctrl.toggleAbout\" ng-if=\"$ctrl.showAbout\" class=\"card\"></mnen-about>\n          <mnen-aggregate visible=\"$ctrl.visibleRaces\" lists=\"$ctrl.listsObject\"></mnen-aggregate>\n          <mnen-race race=\"race\" settings=\"$ctrl.settings\" class=\"card\" ng-class=\"{'card-inverse': race.percentageReporting === 100}\" ng-repeat=\"race in $ctrl.racesArray | filter: { visible: true } | orderBy: 'id' track by race.id\"></mnen-race>\n        </div>\n      </div>";
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
            var countdownStarted = false;
            function activate() {
                vm.updating = true;
                if (!countdownStarted) {
                    countdownStarted = true;
                    updateCountdown();
                }
                var loadedCount = 0;
                var _loop_1 = function(i) {
                    MnenService.getResults(vm.lists[i])
                        .then(function (data) {
                        updateData(data, vm.lists[i]);
                        loadedCount++;
                        if (loadedCount === vm.lists.length) {
                            vm.updating = false;
                            vm.lastUpdate = Date.now();
                            vm.nextUpdate = vm.lastUpdate + 30000;
                            $timeout(activate, 30000);
                        }
                    });
                };
                for (var i in vm.lists) {
                    _loop_1(i);
                }
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
                    .then(function (data) {
                    updateData(data, list);
                });
            }
            function updateData(data, list) {
                var leaderUpdates = {};
                var leaderboardUpdate = false;
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
                            list: vm.listsObject[list],
                            leader: '',
                            leaderVotes: 0
                        };
                        if (vm.visibleRaces[race])
                            vm.races[race].visible = vm.visibleRaces[race].visible;
                        else {
                            vm.races[race].visible = true;
                            vm.visibleRaces[race] = {
                                visible: true
                            };
                            localStorage['mnen-races'] = angular.toJson(vm.visibleRaces);
                        }
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
                            percentage: entry[14],
                            percentageInt: parseFloat(entry[14])
                        };
                        vm.races[race]['candidatesArray'].push(vm.races[race]['candidates'][candidate]);
                    }
                    ;
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
                var leaderboardChange = false;
                for (var i in races) {
                    var race = vm.races[i];
                    var leader = race.leader;
                    var leaderVotes = race.leaderVotes;
                    for (var j in race.candidates) {
                        var candidate = race.candidates[j];
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
                if (leaderboardChange && (listId === '20' || listId === '24' || listId === '30'))
                    updateLeaderboards(listId);
            }
            function updateLeaderboards(listId) {
                var list = vm.listsObject[listId];
                var counts = {
                    novotes: {
                        name: 'No Results',
                        complete: 0,
                        completePerc: 0,
                        incomplete: 0,
                        incompletePerc: 0,
                        total: 0
                    }
                };
                var totalComplete = 0;
                for (var i in list.races) {
                    var race = list.races[i];
                    var leader = race.candidates[race.leader];
                    if (leader && !counts[leader.party])
                        counts[leader.party] = {
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
                for (var j in counts) {
                    counts[j].completePerc = counts[j].complete / list.races.length * 100;
                    counts[j].incompletePerc = counts[j].incomplete / list.races.length * 100;
                    list.leaderboardArray.push(counts[j]);
                }
                list.leaderboard = counts;
                list.complete = totalComplete;
                list.total = list.races.length;
                list.completePerc = totalComplete / list.races.length * 100;
            }
        };
        return MnenComponent;
    }());
    angular
        .module('mnen')
        .component('mnen', new MnenComponent());
})(mnenComponent || (mnenComponent = {}));
//# sourceMappingURL=app.js.map