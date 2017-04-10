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

const akcdata = require('../libs/akcdatactrl')
const settings = require('../libs/settings')
const rtsp = require('../libs/playrtsp')

const rtspProxy = new akcdata.WS(settings.config.artikcloud.devices.rtsp)

rtsp.on('added', (name, url) => {
  rtspProxy.sendMessage({ added: { name: name, url: url } }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

rtsp.on('removed', (name) => {
  rtspProxy.sendMessage({ removed: name }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

rtsp.on('start', () => {
  rtspProxy.sendMessage({ state: 'start' }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

rtsp.on('stop', () => {
  rtspProxy.sendMessage({ state: 'stop' }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

rtspProxy.on('connect', () => {
  console.log('RTSP proxy for ARTIK Cloud connected')
})

rtspProxy.on('actions', (data) => {
  console.log('RTSP proxy action received from ARTIK Cloud: ', data)
  if (data.actions == null || data.actions.length === 0) {
    return
  }

  const cmd = data.actions[0].name
  if (cmd === 'start') {
    console.log('url: ', data.actions[0].parameters.url)
    rtsp.start(data.actions[0].parameters.url)
  } else if (cmd === 'stop') {
    rtsp.stop()
  } else if (cmd === 'next') {
    rtsp.toggle()
  }
})
