import angular from 'angular'
window.angular = angular

import { BeatNote } from './models/note'
import { BeatSong } from './models/song'

import './sass/styles.scss'

const app = angular.module('bstm', []);
app.controller('MainController', [
  '$scope',
  '$q',
  '$timeout',
  function ($scope, $q, $timeout) {
    const vm = this
    vm.audioSrcName = 'Choose a Song'
    vm.beatfileName = 'Choose a Beatfile'
    vm.start = false
    vm.quantize = true
    vm.bpm = 152
    vm.precision = .25
    vm.precisions = [
      { value: 1, label: 'Whole Notes' },
      { value: .5, label: 'Half Notes' },
      { value: .25, label: 'Quarter Notes' },
      { value: .125, label: 'Eighth Notes' },
      { value: .0625, label: 'Sixteenth Notes' },
    ]
    vm.beatfile = new BeatSong({ _beatsPerMinute: vm.bpm })
    vm.notes = []
    vm.legalKeys = [
      { x: 0, y: 2, key: 'r', which: 114 },
      { x: 1, y: 2, key: 't', which: 116 },
      { x: 2, y: 2, key: 'y', which: 121 },
      { x: 3, y: 2, key: 'u', which: 117 },
      { x: 0, y: 1, key: 'f', which: 102 },
      { x: 1, y: 1, key: 'g', which: 103 },
      { x: 2, y: 1, key: 'h', which: 104 },
      { x: 3, y: 1, key: 'j', which: 106 },
      { x: 0, y: 0, key: 'v', which: 118 },
      { x: 1, y: 0, key: 'b', which: 98 },
      { x: 2, y: 0, key: 'n', which: 110 },
      { x: 3, y: 0, key: 'm', which: 109 },
    ]

    const legalKeysWhich = vm.legalKeys.map(x => x.which)


    vm.onKeypress = e => {
      if (!vm.start) {
        return
      }
      if (legalKeysWhich.includes(e.which)) {
        vm.recordNote(e.which)
      }
    }

    vm.recordNote = which => {
      const item = vm.legalKeys.filter(x => x.which === which)[0]
      vm.noteAnimation(item)
      vm.notes.push({
        position: item,
        time: Date.now(),
      })
    }

    vm.startListening = () => {
      vm.start = true
      if ($scope.audioPlayer[0].src) {
        $scope.audioPlayer[0].play();
      }
      vm.startTime = Date.now()
    }

    vm.stopListener = () => {
      vm.start = false
      if ($scope.audioPlayer[0].src) {
        $scope.audioPlayer[0].pause();
      }
      vm.convertNotes(vm.notes)
      vm.startTime = null
      vm.beatfile._beatsPerMinute = vm.bpm
      vm.combineNotes(vm.notes)
      vm.notesJson = JSON.stringify(vm.beatfile)
    }

    vm.combineNotes = notes => {
      notes.forEach(note => vm.beatfile._notes.push(note))
      vm.notes = []
      vm.beatfile._notes.sort((a, b) => a._time - b._time)
      vm.beatfile._notes.forEach(note => {
        const results = vm.beatfile._notes.filter(n => n._time === note._time && n._lineIndex === note._lineIndex && n._lineLayer === note._lineLayer)
        if (results.length > 1) {
          // todo: remove all results except one
        }
      })
    }

    vm.noteAnimation = item => {
      return $q(resolve => {
        if (item.cancel) {
          $timeout.cancel(item.cancel)
          item.css = ''
          item.cancel = null
        }
        $timeout(() => item.css = `ping-${item.x > 1 ? 'blue' : 'red'}`, 1)
        item.cancel = $timeout(() => {
          item.css = ''
          item.cancel = null
        }, 500)
        resolve()
      })
    }

    vm.convertNotes = notes => {
      const millisecondsBetweenBeats = Math.round(60000 / vm.bpm)
      const millisecondsBetweenQuantums = Math.round(60000 * vm.precision / vm.bpm)
      vm.notes = notes.map((note, index) => {
        const newNote = new BeatNote
        let time = note.time - vm.startTime
        const beat = Math.floor(time / millisecondsBetweenBeats)
        let part = (time % millisecondsBetweenBeats) / millisecondsBetweenBeats
        newNote._time = beat + part

        if (vm.quantize) {
          const mod = note.time % millisecondsBetweenQuantums
          if (mod !== 0) {
            time = time - mod
            if (mod > millisecondsBetweenQuantums / 2) {
              time = time + millisecondsBetweenQuantums
            }
          }
          part = Math.floor((time % millisecondsBetweenBeats) / millisecondsBetweenQuantums)
          newNote._time = beat + (part * vm.precision)
        }

        newNote._type = note.position.x > 1 ? 1 : 0
        newNote._lineIndex = note.position.x
        newNote._lineLayer = note.position.y
        return newNote
      })
    }

    $scope.onAudioChange = (src, name) => {
      $scope.audioPlayer[0].src = src
      vm.audioSrcName = name
      vm.audioLoaded = true
      $scope.$digest()
    };

    $scope.onBeatfileChange = json => {
      vm.beatfile = new BeatSong(json)
      vm.beatfileLoaded = true
      $scope.$digest()
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
            $scope.onAudioChange(file, this.files[0].name)
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

angular.module('bstm').directive('bstmBeatfile', [
  '$http',
  function ($http) {
    return {
      restrict: 'A',
      link: ($scope, element, attrs) => {
        element.on('change', function () {
          if (this.files[0]) {
            const file = URL.createObjectURL(this.files[0]);
            $http.get(file).then(response => $scope.onBeatfileChange(response.data))
          }
        })
      }
    };
  }
]);
