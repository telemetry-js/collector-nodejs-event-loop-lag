'use strict'

const loopbench = require('./loopbench')
const summary = require('@telemetry-js/metric').summary
const EventEmitter = require('events').EventEmitter

module.exports = function plugin () {
  return new EventLoopLagCollector()
}

class EventLoopLagCollector extends EventEmitter {
  constructor () {
    super()

    this._stopCheck = null
    this._metricOptions = { unit: 'milliseconds' }
    this._reset()
  }

  _reset () {
    this._summary = summary('telemetry.nodejs.event_loop.lag.ms', this._metricOptions)
  }

  start (callback) {
    this._reset()

    // Note that `_summary` is a dynamic property of `this`, so don't use `bind()`
    this._stopCheck = loopbench({}, (value) => {
      this._summary.record(value)
    })

    process.nextTick(callback)
  }

  stop (callback) {
    this._reset()
    this._stopCheck()

    process.nextTick(callback)
  }

  ping (callback) {
    const metric = this._summary
    metric.touch()

    this._reset()
    this.emit('metric', metric)

    // No need to dezalgo ping()
    callback()
  }
}
