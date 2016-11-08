var mnenModule;
(function (mnenModule) {
    'use strict';
    angular
        .module('mnen', [
        'angularMoment'
    ]);
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
            this.template = "\n      <div class=\"card-block\">\n        <h5 class=\"card-title\">&#x2139; About</h5>\n        <p>This app is meant to save you those precious moments normally spent manually refreshing a few dozen sos tabs on election night.</p>\n        <p>Thrown together for Minnesota the weekend before--then hastily ported to Arizona the night before--election day 2016.</p>\n        <p>Data is pulled from xml files provided by the Arizona Secretary of State. You can see them <a href=\"http://press.azsos.gov/\" target=\"_blank\">here</a>.</p>\n        <p>The code for this project is open source and can be found <a href=\"https://github.com/chrisfried/MNElectionNight\" target=\"_blank\">here</a>.</p>\n        <p>Questions, suggestions, and compliments can be directed <a href=\"https://twitter.com/chrisfried\" target=\"_blank\">@chrisfried</a> on Twitter.</p>\n        <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide About</button>\n      </div>";
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
        MnenService.prototype.getResultsFunction = function () {
            return this.$http.get('/ftp/dbelec/Results%20-%20State.xml')
                .then(this.getResultsComplete)
                .catch(this.getResultsFailed);
        };
        MnenService.prototype.getResultsComplete = function (response) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(response.data);
            return json;
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
            this.template = "\n      <div ng-if=\"$ctrl.race._key === '590'\" class=\"card-header text-muted\">Arizona Presidential Results</div>\n      <div class=\"card-block\">\n        <div class=\"fill-bar precincts\" style=\"width: {{$ctrl.race._precinctsReportingPercent}}%\"></div>\n        <h5 class=\"card-title\">{{::$ctrl.race._contestLongName}}</h5>\n        <h6 class=\"card-subtitle text-muted\" ng-class=\"{'incomplete': $ctrl.race._precinctsReportingPercent < 100}\">{{$ctrl.race._precinctsReported}} of {{::$ctrl.race._precinctsParticipating}} Precincts Reporting<span ng-if=\"$ctrl.race._precinctsReportingPercent !== 100\"></span><span ng-if=\"$ctrl.race._numberToElect > 1\">, {{$ctrl.race._numberToElect}} to Elect</span></h6>\n      </div>\n      <ul class=\"list-group list-group-flush\">\n        <li class=\"list-group-item\" ng-repeat=\"candidate in $ctrl.race.choices.choice | orderBy: '-_totalVotes' track by candidate._key\">\n          <span class=\"float-xs-right\">\n            <span ng-if=\"$ctrl.settings.votePercent\">{{candidate.percentage}}%</span>\n            <span ng-if=\"$ctrl.settings.voteCount && $ctrl.settings.votePercent\"> - </span>\n            <span ng-if=\"$ctrl.settings.voteCount\">{{candidate._totalVotes}}</span>\n          </span>\n          <div class=\"fill-bar\" style=\"width: {{candidate.percentage}}%\" ng-class=\"{'dfl': candidate._party === 'DEM','gop': candidate._party === 'REP'}\"></div>\n          <span ng-class=\"{'winner': $first && $ctrl.race._precinctsReportingPercent === 100}\">\n            <span class=\"capitalize\">{{::candidate._choiceName | lowercase}}</span>\n            <span ng-if=\"$ctrl.settings.partyText\"> - {{::candidate._party}}</span>\n          </span>\n        </li>\n      </ul>\n      <div class=\"card-footer text-muted\">\n        Total Votes Cast\n        <span class=\"float-xs-right\">{{$ctrl.race.votes}}</span>\n      </div>";
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
                races: '<',
                toggle: '<',
                visible: '<'
            };
            this.template = "\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h5 class=\"card-title\">&#x1F3C1; Select Races</h5>\n            <p><h6 class=\"card-subtitle text-muted\">Choose which elections to watch.</h6></p>\n            <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide Selectors</button>\n          </div>\n        </div>\n        <div class=\"card\" ng-repeat=\"option in $ctrl.options track by option.id\">\n          <div class=\"card-block\">\n            <h6>{{::option.name}}</h6>\n            <p><div ng-if=\"$ctrl.lists[option.id].races.length > 1\" class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectAll(option.id)\">All</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-click=\"$ctrl.selectNone(option.id)\">None</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.lists[option.id].visible}\" ng-click=\"$ctrl.toggleList(option.id)\">\n                {{ $ctrl.lists[option.id].visible ? 'Hide List' : 'Show List' }}\n              </button>\n            </div></p>\n            <div class=\"btn-group-vertical\" ng-if=\"$ctrl.lists[option.id].visible || $ctrl.lists[option.id].races.length < 2\">\n              <button ng-repeat=\"race in $ctrl.lists[option.id].races\" type=\"button\" class=\"btn btn-outline-success\" ng-class=\"{'active': race.visible}\" ng-click=\"$ctrl.toggleRace(race.contest._key)\">{{::race.contest._contestLongName}}</button>\n            </div>\n          </div>\n        </div>";
        }
        MnenEditComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
            vm.toggleList = toggleList;
            vm.toggleRace = toggleRace;
            vm.selectAll = selectAll;
            vm.selectNone = selectNone;
            vm.options = [
                {
                    id: 0,
                    name: 'Races'
                }
            ];
            function toggleList(listId) {
                vm.lists[listId].visible = !vm.lists[listId].visible;
            }
            function selectAll(listId) {
                for (var i in vm.lists[listId].races) {
                    vm.lists[listId].races[i].contest.visible = true;
                    vm.visible[vm.lists[listId].races[i].contest._key].visible = true;
                    localStorage['mnen-races'] = angular.toJson(vm.visible);
                }
            }
            function selectNone(listId) {
                for (var i in vm.lists[listId].races) {
                    vm.lists[listId].races[i].contest.visible = false;
                    vm.visible[vm.lists[listId].races[i].contest._key].visible = false;
                    localStorage['mnen-races'] = angular.toJson(vm.visible);
                }
            }
            function toggleRace(raceId) {
                vm.races[raceId].visible = !vm.races[raceId].visible;
                vm.visible[raceId].visible = vm.races[raceId].visible;
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
            this.template = "\n      <div class=\"card-columns\">\n\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h5 class=\"card-title\">&#9881; Settings</h5>\n            <p><h6 class=\"card-subtitle text-muted\">Toggles for days!</h6></p>\n            <button type=\"button\" class=\"btn btn-outline-danger\" ng-click=\"$ctrl.toggle()\">Hide Settings</button>\n          </div>\n        </div>\n\n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Candidate Votes</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.voteCount}\" ng-click=\"$ctrl.toggleSetting('voteCount')\">Count</button>\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.votePercent}\" ng-click=\"$ctrl.toggleSetting('votePercent')\">Percent</button>\n            </div></p>\n          </div>\n        </div>\n        \n        <div class=\"card\">\n          <div class=\"card-block\">\n            <h6>Party Initials</h6>\n            <p><div class=\"btn-group\" role=\"group\">\n              <button type=\"button\" class=\"btn btn-outline-primary\" ng-class=\"{'active': $ctrl.settings.partyText}\" ng-click=\"$ctrl.toggleSetting('partyText')\">Display</button>\n            </div></p>\n          </div>\n        </div>\n\n      </div>";
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
/// <reference path="mnen.about.component.ts" />
var mnenComponent;
(function (mnenComponent) {
    'use strict';
    var MnenComponent = (function () {
        function MnenComponent() {
            this.template = "\n      <nav class=\"navbar navbar-fixed-top navbar-dark bg-inverse\">\n        <span class=\"navbar-text float-xs-right countdown\">auto refresh <span am-time-ago=\"$ctrl.nextUpdate\"></span></span>\n        <a class=\"navbar-brand\" href=\"#\">AZ Election Night</a>\n        <ul class=\"nav navbar-nav\">\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showEdit }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleSelectors()\">&#x1F3C1;</a>\n          </li>\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showSettings }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleSettings()\">&#9881;</a>\n          </li>\n          <li class=\"nav-item\" ng-class=\"{ 'active': $ctrl.showAbout }\">\n            <a class=\"nav-link\" href=\"#\" ng-click=\"$ctrl.toggleAbout()\">&#x2139;</a>\n          </li>\n        </ul>\n      </nav>\n      <div class=\"container-fluid navbar-offset\">\n        <mnen-edit lists=\"$ctrl.listsObject\" visible=\"$ctrl.visibleRaces\" toggle=\"$ctrl.toggleSelectors\" races=\"$ctrl.races\" ng-if=\"$ctrl.showEdit\"></mnen-edit>\n        <mnen-settings settings=\"$ctrl.settings\" toggle=\"$ctrl.toggleSettings\" ng-if=\"$ctrl.showSettings\"></mnen-settings>\n        <div class=\"card-columns\">\n          <mnen-about toggle=\"$ctrl.toggleAbout\" ng-if=\"$ctrl.showAbout\" class=\"card\"></mnen-about>\n          <mnen-race race=\"race.contest\" settings=\"$ctrl.settings\" class=\"card\" ng-class=\"{'card-inverse': race.contest._precinctsReportingPercent === 100}\" ng-repeat=\"race in $ctrl.racesArray | filter: { visible: true } track by race.contest._key\"></mnen-race>\n        </div>\n      </div>";
        }
        MnenComponent.prototype.controller = function (MnenService, $timeout) {
            var vm = this;
            vm.listsObject = {};
            vm.races = {};
            vm.racesArray = [];
            vm.showEdit = false;
            vm.showSettings = false;
            vm.showAbout = false;
            vm.toggleSelectors = toggleSelectors;
            vm.toggleSettings = toggleSettings;
            vm.toggleAbout = toggleAbout;
            vm.settings = angular.fromJson(localStorage['mnen-settings']) || {
                voteCount: true,
                votePercent: false,
                partyText: true
            };
            vm.visibleRaces = angular.fromJson(localStorage['mnen-races']) || {};
            vm.$onInit = activate;
            vm.lastUpdate = Date.now();
            vm.nextUpdate = vm.lastUpdate + 300000;
            function activate() {
                MnenService.getResults()
                    .then(function (data) {
                    updateData(data);
                });
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
            function toggleAbout() {
                vm.showAbout = !vm.showAbout;
            }
            function updateData(data) {
                if (!vm.listsObject[0]) {
                    vm.listsObject[0] = {
                        races: [],
                        visible: false
                    };
                }
                var contests = data.electionResult.contests.contest;
                for (var i in contests) {
                    var contest = contests[i];
                    var race = contest._key;
                    contest._precinctsParticipating = parseInt(contest._precinctsParticipating);
                    contest._precinctsReported = parseInt(contest._precinctsReported);
                    contest._precinctsReportingPercent = parseFloat(contest._precinctsReportingPercent);
                    contest._numberToElect = parseInt(contest._numberToElect);
                    if (!angular.isArray(contest.choices.choice)) {
                        contest.choices.choice = [contest.choices.choice];
                    }
                    contest.votes = 0;
                    for (var j in contest.choices.choice) {
                        var choice = contest.choices.choice[j];
                        choice._totalVotes = parseInt(choice._totalVotes);
                        contest.votes += choice._totalVotes;
                    }
                    for (var j in contest.choices.choice) {
                        var choice = contest.choices.choice[j];
                        if (choice._totalVotes < 1) {
                            choice.percentage = 0;
                        }
                        else {
                            choice.percentage = (choice._totalVotes / contest.votes * 100).toFixed(2);
                        }
                    }
                    if (!vm.races[race]) {
                        vm.races[race] = {
                            contest: contest
                        };
                        vm.racesArray.push(vm.races[race]);
                        vm.listsObject[0]['races'].push(vm.races[race]);
                    }
                    else
                        vm.races[race].contest = contest;
                    if (vm.visibleRaces[race])
                        vm.races[race].visible = vm.visibleRaces[race].visible;
                    else {
                        vm.races[race].visible = true;
                        vm.visibleRaces[race] = {
                            visible: true
                        };
                        localStorage['mnen-races'] = angular.toJson(vm.visibleRaces);
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