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

const gpioctrl = require('./gpioctrl')
const settings = require('./settings')

function linkSwitchToLED () {
  gpioctrl.SW403.on('pressed', () => gpioctrl.LED400.setOn())
  gpioctrl.SW403.on('released', () => gpioctrl.LED400.setOff())
  gpioctrl.SW404.on('pressed', () => gpioctrl.LED401.setOn())
  gpioctrl.SW404.on('released', () => gpioctrl.LED401.setOff())
}

module.exports.setupMaster = function () {
  const ipc = require('./ipc_server')

  linkSwitchToLED()

  /* Real GPIO event --> Update Webpage */
  gpioctrl.LED400.on('on', () => ipc.emitGpioEvent('LED400', 1))
  gpioctrl.LED400.on('off', () => ipc.emitGpioEvent('LED400', 0))
  gpioctrl.LED401.on('on', () => ipc.emitGpioEvent('LED401', 1))
  gpioctrl.LED401.on('off', () => ipc.emitGpioEvent('LED401', 0))

  /* Webpage Fake GPIO event --> Real GPIO control */
  ipc.setFakeGpioHandler({
    SW403: function (status) {
      gpioctrl.LED400.setStatus(status)
    },
    SW404: function (status) {
      gpioctrl.LED401.setStatus(status)
    }
  })

  /* Slave node GPIO event --> Update Webpage */
  ipc.setSlaveGpioHandler({
    LED400: function (status) {
      gpioctrl.SlaveGpio.LED400.setStatus(status)
    },
    LED401: function (status) {
      gpioctrl.SlaveGpio.LED401.setStatus(status)
    }
  })

  if (settings.config.option.scenario_mode === 1) {
    const micRecorder = require('./micrecorder')
    micRecorder.setTrigger(gpioctrl.LED400)

    const rtspPlayer = require('./playrtsp')
    rtspPlayer.setTrigger(gpioctrl.LED401)

    const dingdong = require('./dingdong')
    dingdong.setTrigger(gpioctrl.SlaveGpio.LED400)

    const hue = require('./huectrl')
    hue.setTrigger(gpioctrl.SlaveGpio.LED400)
  }
}

module.exports.setupSlave = function () {
  const ipc = require('./ipc_slave')

  linkSwitchToLED()

  /* Real GPIO event --> Send to Master node */
  gpioctrl.LED400.on('on', () => ipc.emitGpioEvent('LED400', 1))
  gpioctrl.LED400.on('off', () => ipc.emitGpioEvent('LED400', 0))
  gpioctrl.LED401.on('on', () => ipc.emitGpioEvent('LED401', 1))
  gpioctrl.LED401.on('off', () => ipc.emitGpioEvent('LED401', 0))

  /* Event from Webpage(Fake GPIO) */
  ipc.setFakeGpioHandler({
    SW403: function (status) {
      gpioctrl.LED400.setStatus(status)
    },
    SW404: function (status) {
      gpioctrl.LED401.setStatus(status)
    }
  })
}
