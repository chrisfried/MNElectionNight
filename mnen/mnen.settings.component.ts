/// <reference path="mnen.module.ts" />
namespace mnenSettingsComponent {
  'use strict';

  class MnenSettingsComponent implements ng.IComponentOptions {

    public bindings: { [binding: string]: string } = {
      toggle: '<',
      settings: '<'
    };

    private settings: {};
    private toggleSetting: (setting: string) => void;
    private saveSettings: () => void;

    public template: string = `
      <div class="card-columns">

        <div class="card">
          <div class="card-block">
            <h5 class="card-title">Settings</h5>
            <p><h6 class="card-subtitle text-muted">Toggles for days!</h6></p>
            <button type="button" class="btn btn-outline-danger" ng-click="$ctrl.toggle()">Hide Settings</button>
          </div>
        </div>

        <div class="card">
          <div class="card-block">
            <h6>Candidate Votes</h6>
            <p><div class="btn-group" role="group">
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.settings.voteCount}" ng-click="$ctrl.toggleSetting('voteCount')">Count</button>
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.settings.votePercent}" ng-click="$ctrl.toggleSetting('votePercent')">Percent</button>
            </div></p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-block">
            <h6>Party Initials</h6>
            <p><div class="btn-group" role="group">
              <button type="button" class="btn btn-outline-primary" ng-class="{'active': $ctrl.settings.partyText}" ng-click="$ctrl.toggleSetting('partyText')">Display</button>
            </div></p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-block">
            <h6>Hide By Vote Threshold</h6>
            <p><div class="input-group">
              <input type="text" class="form-control" ng-model="$ctrl.settings.threshold" ng-change="$ctrl.saveSettings()">
              <span class="input-group-addon">%</span>
            </div></p>
          </div>
        </div>

      </div>`;

    public controller(): void {
      let vm = this;

      vm.toggleSetting = toggleSetting;
      vm.saveSettings = saveSettings;

      function toggleSetting(setting) {
        vm.settings[setting] = !vm.settings[setting];
        saveSettings();
      }

      function saveSettings() {
        localStorage['settings'] = angular.toJson(vm.settings);
      }
    }
  }

  angular
    .module('mnen')
    .component('mnenSettings', new MnenSettingsComponent());
}