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
const avs = require('../libs/avs')
const micrecorder = require('../libs/micrecorder')

const avsProxy = new akcdata.MQTT(settings.config.artikcloud.devices.avs)

avsProxy.on('connect', function () {
  console.log('avs proxy for ARTIK Cloud connected (MQTT)')
})

avsProxy.on('actions', function (data) {
  console.log('shell proxy action received from ARTIK Cloud: ', data)
  if (data.actions == null || data.actions.length === 0) {
    return
  }

  const cmd = data.actions[0].name
  if (cmd === 'startRecording') {
    micrecorder.startRecording()
  } else if (cmd === 'stopRecording') {
    micrecorder.stopRecording()
  } else if (cmd === 'sendTTS') {
    console.log('text: ', data.actions[0].parameters.text)

    avs.TTS(data.actions[0].parameters.text, 'out.wav').then((result) => {
      return avs.sendWav('out.wav')
    }).then((result) => {
      console.log('success')
    }).catch((err) => {
      console.log(err)
    })
  }
})
