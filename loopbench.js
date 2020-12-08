'use strict'

// Adapted from mcollina/loopbench (MIT, copyright Matteo Collina 2015).
module.exports = function loopbench (opts, emitValue) {
  const sampleInterval = opts.sampleInterval || 5
  const timer = setInterval(checkLag, sampleInterval)
  const stop = clearInterval.bind(null, timer)

  timer.unref()
  let last = now()

  return stop

  function checkLag () {
    const toCheck = now()
    const lag = toCheck - last - sampleInterval

    last = toCheck
    emitValue(lag)
  }

  function now () {
    const ts = process.hrtime()
    return (ts[0] * 1e3) + (ts[1] / 1e6)
  }
}
