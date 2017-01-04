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

const settings = require('./settings')

const EventEmitter = require('events')
const util = require('util')
const Hue = require('node-hue-api')

let light_id = 1

function updateHueApi (obj) {
  if (obj.ip == null) {
    return
  }

  if (settings.config.hue.username == null) {
    return
  }

  if (obj.api) {
    return
  }

  settings.data.hue = obj.ip
  obj.api = new Hue.HueApi(obj.ip, settings.config.hue.username)
  obj.api.getFullState().then(function(result) {
    console.log('Hue Lights:', result.lights)
    for (var name in result.lights) {
      console.log('Hue Light id:', name)
      light_id = name;
      break;
    }

    obj.api.setLightState(light_id, obj.lightstate.off(), (err, lights) => {
      if (err) {
        console.log(err)
      } else {
        console.log(lights)
      }
    })
  }).done()
}

function searchUpnp (self) {
  console.log('try Hue bridge search by upnp')
  Hue.upnpSearch(3000).then((bridge) => {
    if (bridge.length === 0) {
      console.log("upnp: can't find hue bridge")
      self.emit('notfound', null)
      return
    }

    console.log('upnp: Hue bridge found: ', bridge)
    self.ip = bridge[0].ipaddress
    self.emit('found', self.ip)
    updateHueApi(self)
  }).catch((err) => {
    console.log(err)
    self.emit('notfound', null)
  }).done()
}

function HueBridge () {
  EventEmitter.call(this)

  this.ip = null
  this.api = null
  this.lightstate = Hue.lightState.create()
}

util.inherits(HueBridge, EventEmitter)

HueBridge.prototype.Search = function () {
  const self = this

  Hue.nupnpSearch((err, bridge) => {
    if (err) {
      console.log(err)
      searchUpnp(self)
      return
    }

    if (bridge.length === 0) {
      console.log("can't find hue bridge")
      searchUpnp(self)
      return
    }

    console.log('Hue bridge found: ', bridge)
    self.ip = bridge[0].ipaddress
    self.emit('found', self.ip)
    updateHueApi(self)
  })
}

HueBridge.prototype.getUsername = function (cb) {
  if (this.ip == null) {
    cb(new Error("can't find hue bridge"))
    return
  }

  const self = this

  const api = new Hue.HueApi()
  api.registerUser(this.ip, 'demokit').then((result) => {
    console.log(result)
    cb(null, result)
    updateHueApi(self)
  }).catch((err) => {
    console.log(err)
    cb(err)
  })
}

HueBridge.prototype.setAlert = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.setLightState(light_id, { 'on': true, 'bri': 64, 'alert': 'lselect' }, (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

HueBridge.prototype.setOn = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  //  this.api.setLightState(light_id, this.lightstate.on(), (err, lights) => {
  this.api.setLightState(light_id, { 'on': true, 'bri': 64, 'alert': 'none' }, (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

HueBridge.prototype.setOff = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.setLightState(light_id, this.lightstate.off(), (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

HueBridge.prototype.getStatus = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.lightStatus(light_id, (err, result) => {
    console.log(result)
    cb(err, result)
  })
}

HueBridge.prototype.setTrigger = function (src) {
  src.on('on', () => {
    hb.setAlert((err) => {
      if (err) {
        console.log(err)
      }
    })
  })
}

const hb = new HueBridge()

hb.on('notfound', function () {
  console.log('retry hue search')
  setTimeout(function () {
    hb.Search()
  }, 1000)
})

hb.Search()

module.exports = hb
