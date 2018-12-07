import angular from 'angular'
window.angular = angular
import moment from 'moment'
window.moment = moment

import { BeatNote } from './models/note'

import './sass/styles.scss'

const app = angular.module('bstm', []);
app.controller('MainController', [
  '$interval',
  function ($interval) {
    const vm = this
    vm.bpm = 152
    vm.precision = .125
    vm.notes = []

    vm.onKeypress = e => {
      if (e.which === 98) {
        if (!!vm.startTime) {
          vm.notes.push({
            which: e.which,
            time: Date.now(),
          })
        } else {
          vm.startTime = Date.now()
        }
      }
    }

    vm.startListening = () => {
      // vm.startTime = Date.now()
      // vm.lastTime = Date.now()
      // const millisecondsBetweenBeats = Math.round(60000 / vm.bpm)
      // vm.reset = $interval(() => {
      //   console.log(Date.now() - vm.lastTime)
      //   vm.lastTime = Date.now()
      //   // console.log(vm.lastTime - vm.startTime)
      // }, millisecondsBetweenBeats)
    }

    vm.stopListener = () => {
      // $interval.cancel(vm.reset)
      vm.convertNotes(vm.notes)
      vm.startTime = null
      console.log(vm.notes)
      vm.notesJson = JSON.stringify(vm.notes)
      vm.notes = []
    }

    vm.convertNotes = notes => {
      const millisecondsBetweenBeats = Math.round(60000 / vm.bpm)
      const millisecondsBetweenQuantums = Math.round(60000 * vm.precision / vm.bpm)
      vm.notes = notes.map(note => {
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
        return newNote
      })
    }
  }
])
