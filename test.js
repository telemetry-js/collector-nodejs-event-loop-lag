'use strict'

const test = require('tape')
const crypto = require('crypto')
const plugin = require('.')

test('basic', async function (t) {
  t.plan(9)

  const collector = plugin()

  await start(collector)
  await slowTicks(10)

  const metrics1 = await collect(collector)

  t.is(metrics1.length, 1, 'emits one metric')
  t.ok(metrics1[0].stats.sum > 0, 'has sum')
  t.ok(metrics1[0].stats.max > 0, 'has max')
  t.ok(metrics1[0].stats.count > 0, 'has count')

  await slowTicks(10)

  const metrics2 = await collect(collector)

  t.is(metrics2.length, 1, 'emits one metric on second ping')
  t.ok(metrics2[0] !== metrics1[0], 'metric is a new object')
  t.ok(metrics2[0].stats.sum > 0, 'has sum on second ping')
  t.ok(metrics2[0].stats.max > 0, 'has max on second ping')
  t.ok(metrics2[0].stats.count > 0, 'has count on second ping')
})

function start (collector) {
  return new Promise((resolve, reject) => {
    collector.start((err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

function collect (collector) {
  return new Promise((resolve, reject) => {
    const metrics = []
    const push = metrics.push.bind(metrics)

    collector.on('metric', push)

    collector.ping((err) => {
      collector.removeListener('metric', push)
      if (err) reject(err)
      else resolve(metrics.map(simplify))
    })
  })
}

function slowTicks (ticks) {
  let n = 0

  return new Promise((resolve) => {
    function next () {
      if (n++ >= ticks) return resolve()
      crypto.randomFillSync(Buffer.alloc(1e6))
      setImmediate(next)
    }

    next()
  })
}

function simplify (metric) {
  delete metric.date
  delete metric.statistic

  return metric
}
