/// <reference path="mnen.module.ts" />
namespace mnenService {
  'use strict';

  export class MnenService {
    static $inject: Array<string> = ['$http'];
    public getResults: () => ng.IHttpPromise<any>;

    constructor(private $http: ng.IHttpService) {
      this.getResults = this.getResultsFunction;
    }

    private getResultsFunction() {
      return this.$http.get('/Results/MediaResult/20?mediafileid=20')
        .then(this.getResultsComplete)
        .catch(this.getResultsFailed);
    }

    private getResultsComplete(response: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallback<any> {
      return response.data;
    }

    private getResultsFailed(error: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallback<any> {
      console.error(error);
      return;
    }
  }

  angular
    .module('mnen')
    .service('MnenService', MnenService);
}
