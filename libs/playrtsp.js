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

const spawn = require('child_process').spawn
const ipc = require('./ipc_server')
const EventEmitter = require('events')
const util = require('util')

function RtspPlayer () {
  EventEmitter.call(this)

  this.list = new Map()
  this.iter = this.list.entries()
  this.camplayer = null
}

util.inherits(RtspPlayer, EventEmitter)

RtspPlayer.prototype.start = function start (url) {
  if (this.camplayer) {
    console.log('already started')
    return
  }

  if (url === undefined) {
    this.iter = this.list.entries()
    let item = this.iter.next()
    url = item.value[1]
  }

  const args = [ '-e', 'rtspsrc',
    'location=' + url, 'latency=0',
    '!', 'rtph264depay',
    '!', 'h264parse',
    '!', 'nxvideodec', 'buffer-type=0',
    '!', 'videoflip', 'method=3',
    '!', 'nxvideosink', 'dst-x=180', 'dst-y=320'
  ]

  ipc.sendLog('play from ', url)
  this.camplayer = spawn('gst-launch-1.0', args)
  this.camplayer.on('error', function (err) {
    console.log(err)
  })
  this.camplayer.on('close', function (code, signal) {
    console.log('closed:', code, signal)
  })
  this.emit('start')
}

RtspPlayer.prototype.stop = function stop () {
  if (this.camplayer == null) {
    console.log('already stopped')
    return
  }

  this.camplayer.kill('SIGHUP')
  this.camplayer = null
  this.emit('stop')
}

RtspPlayer.prototype.toggle = function toggle () {
  let item = this.iter.next()
  if (item.done) {
    this.iter = this.list.entries()
    item = this.iter.next()
  }

  if (this.camplayer) {
    this.stop()
  }

  this.start(item.value[1])
}

RtspPlayer.prototype.setTrigger = function (src) {
  src.on('on', () => {
    RtspPlayer.prototype.toggle.call(rp)
  })
}

RtspPlayer.prototype.add = function (name, url) {
  if (this.list.get(name)) {
    return
  }

  if (name === 'ArtikCam') {
    url += '/test'
  }

  if (name[0] === 'S') {
    let tmp = url.split('//')[1]
    let ip = tmp.split(':')[0]
    url = 'rtsp://admin:1234@' + ip + '/profile4/media.smp'
  }

  this.list.set(name, url)
  ipc.sendLog('RTSP Server added: ', name, url)
  this.emit('added', name, url)
}

RtspPlayer.prototype.remove = function (name) {
  if (this.list.get(name) == null) {
    return
  }

  this.list.delete(name)
  ipc.sendLog('RTSP Server removed: ', name)
  this.emit('removed', name)
}

const rp = new RtspPlayer()

module.exports = rp
