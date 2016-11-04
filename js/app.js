var pawdModule;
(function (pawdModule) {
    'use strict';
    angular
        .module('mnen', []);
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
        MnenService.prototype.getResultsFunction = function () {
            return this.$http.get('/Results/MediaResult/20?mediafileid=20')
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
            this.template = "\n      <h1>Election Night in Minnesota</h1>";
        }
        MnenComponent.prototype.controller = function (MnenService) {
            var vm = this;
            vm.races = {};
            vm.$onInit = activate;
            function activate() {
                MnenService.getResults()
                    .then(function (data) {
                    var dataArray = data.split('\n');
                    for (var i = 0; i < dataArray.length; i++) {
                        dataArray[i] = dataArray[i].split(';');
                        var race = dataArray[i][3];
                        if (!vm.races[race])
                            vm.races[race] = {
                                office: dataArray[i][4],
                                precincts: dataArray[i][11]
                            };
                        var candidate = dataArray[i][6];
                        if (!vm.races[race][candidate])
                            vm.races[race][candidate] = {
                                name: dataArray[i][7],
                                party: dataArray[i][10]
                            };
                    }
                    console.log(dataArray);
                    console.log(vm.races);
                });
            }
        };
        return MnenComponent;
    }());
    angular
        .module('mnen')
        .component('mnen', new MnenComponent());
})(mnenComponent || (mnenComponent = {}));
//# sourceMappingURL=app.js.map