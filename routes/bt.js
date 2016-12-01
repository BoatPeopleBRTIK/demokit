/*
 * Copyright (c) 2016 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

const settings = require('../libs/settings')
const express = require('express')
const router = express.Router()

const dbus = require('dbus-native')
const bus = dbus.systemBus()

function devprop2json (propArray) {
  let dev = { }
  propArray.forEach((attr) => {
    if (attr[0] === 'Address') {
      dev.addr = attr[1][1][0]
    } else if (attr[0] === 'Name') {
      dev.name = attr[1][1][0]
    } else if (attr[0] === 'Alias') {
      dev.alias = attr[1][1][0]
    } else if (attr[0] === 'Paired') {
      dev.paired = attr[1][1][0]
    } else if (attr[0] === 'Connected') {
      dev.connected = attr[1][1][0]
    }
  })

  return dev
}

router.get('/', function (req, res, next) {
  res.render('bt', {
    demokit: settings,
    active_menu: '/bt'
  })
})

router.get('/scan/on', (req, res) => {
  bus.invoke({
    destination: 'org.bluez',
    path: '/org/bluez/hci0',
    interface: 'org.bluez.Adapter1',
    member: 'StartDiscovery'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

router.get('/scan/off', (req, res) => {
  bus.invoke({
    destination: 'org.bluez',
    path: '/org/bluez/hci0',
    interface: 'org.bluez.Adapter1',
    member: 'StopDiscovery'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

router.get('/refresh', (req, res) => {
  bus.invoke({
    destination: 'org.bluez',
    path: '/',
    interface: 'org.freedesktop.DBus.ObjectManager',
    member: 'GetManagedObjects'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
    } else {
      let list = []
      result.forEach((item) => {
        item[1].forEach((iface) => {
          if (iface[0] === 'org.bluez.Device1') {
            let dev = devprop2json(iface[1])
            dev.path = item[0]
            console.log(dev)
            list.push(dev)
          }
        })
      })
      res.end(JSON.stringify({ result: list }))
    }
  })
})

router.post('/control/pair', (req, res) => {
  console.log(req.body.path)
  bus.invoke({
    destination: 'org.bluez',
    path: req.body.path,
    interface: 'org.bluez.Device1',
    member: 'Pair'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

router.post('/control/unpair', (req, res) => {
  console.log(req.body.path)
  bus.invoke({
    destination: 'org.bluez',
    path: '/org/bluez/hci0',
    interface: 'org.bluez.Adapter1',
    member: 'RemoveDevice',
    signature: 'o',
    body: [ req.body.path ]
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

router.post('/control/conn', (req, res) => {
  console.log(req.body.path)
  bus.invoke({
    destination: 'org.bluez',
    path: req.body.path,
    interface: 'org.bluez.Device1',
    member: 'Connect'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

router.post('/control/disconn', (req, res) => {
  console.log(req.body.path)
  bus.invoke({
    destination: 'org.bluez',
    path: req.body.path,
    interface: 'org.bluez.Device1',
    member: 'Disconnect'
  }, function (err, result) {
    if (err) {
      console.log('error:', err)
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

module.exports = router
