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

module.exports.setup = function (btn, device) {
  const bp = new akcdata.MQTT(device)

  console.log('Setup button proxy: ', device)

  bp.on('connect', function () {
    console.log('button proxy for ARTIK Cloud connected (MQTT)')
  })

  bp.on('actions', function (data) {
    console.log('button proxy action received from ARTIK Cloud: ', data)
    if (data.actions == null || data.actions.length === 0) {
      return
    }
  })

  btn.on('pressed', () => {
    console.log('send button proxy event (pressed)')
    bp.sendMessage({ state: 'pressed' }, (err) => {
      if (err) {
        console.log('error:', err)
      }
    })
  })

  btn.on('on', () => {
    console.log('send button proxy event (pressed)')
    bp.sendMessage({ state: 'pressed' }, (err) => {
      if (err) {
        console.log('error:', err)
      }
    })
  })

  btn.on('released', () => {
    console.log('send button proxy event (released)')
    bp.sendMessage({ state: 'released' }, (err) => {
      if (err) {
        console.log('error:', err)
      }
    })
  })

  btn.on('off', () => {
    console.log('send button proxy event (released)')
    bp.sendMessage({ state: 'released' }, (err) => {
      if (err) {
        console.log('error:', err)
      }
    })
  })
}
