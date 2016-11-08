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
      return this.$http.get('/ftp/dbelec/Results%20-%20State.xml')
        .then(this.getResultsComplete)
        .catch(this.getResultsFailed);
    }

    private getResultsComplete(response: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallback<any> {
      let x2js = new X2JS();
      let json = x2js.xml_str2json(response.data);
      return json;
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
