import angular from 'angular'
window.angular = angular
import moment from 'moment'
window.moment = moment

import './sass/styles.scss'

const app = angular.module('bstm', []);
app.controller('MainController', [
  '$scope',
  function ($scope) {
    const vm = this
    vm.onKeypress = e => {
      vm.text = e.which
      vm.time = moment().format('x')
    }
  }
])
