/// <reference path="mnen.module.ts" />
namespace mnenService {
  'use strict';

  export class MnenService {
    static $inject: Array<string> = ['$http'];
    public getResults: (list: string) => ng.IHttpPromise<any>;

    constructor(private $http: ng.IHttpService) {
      this.getResults = this.getResultsFunction;
    }

    private getResultsFunction(list) {
      let race = '1'; // 2012
    //  let race = '99'; // 2016 Primary
      return this.$http.get('/Results/MediaResult/' + race + '?mediafileid=' + list)
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
