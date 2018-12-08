import angular from 'angular'
window.angular = angular

import { BeatNote } from './models/note'

import './sass/styles.scss'

const app = angular.module('bstm', []);
app.controller('MainController', [
  '$scope',
  function ($scope) {
    const vm = this
    vm.start = false
    vm.bpm = 152
    vm.precision = .25
    vm.notes = []

    vm.onKeypress = e => {
      console.log(e.which)
      if (!vm.start) {
        return
      }
      if (e.which === 98) {
        vm.notes.push({
          which: e.which,
          time: Date.now(),
        })
      }
    }

    vm.startListening = () => {
      vm.start = true
      $scope.audioPlayer[0].play();
      vm.startTime = Date.now()
    }

    vm.stopListener = () => {
      vm.start = false
      vm.convertNotes(vm.notes)
      vm.startTime = null
      console.log(vm.notes)
      vm.notesJson = JSON.stringify(vm.notes)
      vm.notes = []
    }

    vm.convertNotes = notes => {
      const millisecondsBetweenBeats = Math.round(60000 / vm.bpm)
      const millisecondsBetweenQuantums = Math.round(60000 * vm.precision / vm.bpm)
      vm.notes = notes.map((note, index) => {
        let time = note.time - vm.startTime
        const mod = note.time % millisecondsBetweenQuantums
        if (mod !== 0) {
          time = time - mod
          if (mod > millisecondsBetweenQuantums / 2) {
            time = time + millisecondsBetweenQuantums
          }
        }
        const beat = Math.floor(time / millisecondsBetweenBeats)
        const part = Math.floor((time % millisecondsBetweenBeats) / millisecondsBetweenQuantums)
        const newNote = new BeatNote
        newNote._time = beat + (part * vm.precision)
        newNote._type = index % 2
        newNote._lineIndex = (index % 2) * 4
        return newNote
      })
    }

    $scope.onAudioChange = src => {
      $scope.audioPlayer[0].src = src
    };
  }
])

angular.module('bstm').directive('bstmAudio', [
  function () {
    return {
      restrict: 'A',
      link: ($scope, element, attrs) => {
        element.on('change', function () {
          if (this.files[0]) {
            const file = URL.createObjectURL(this.files[0]);
            $scope.onAudioChange(file)
          }
        })
      }
    };
  }
]);

angular.module('bstm').directive('bstmAudioPlayer', [
  function () {
    return {
      restrict: 'A',
      link: ($scope, element, attrs) => {
        $scope.audioPlayer = element
      }
    };
  }
]);
