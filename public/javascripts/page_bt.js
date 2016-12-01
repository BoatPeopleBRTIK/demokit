
var socket = null
var autoRefreshTimer = null

$('#switch_scan').bootstrapSwitch({
  onSwitchChange: function (e, s) {
    var url = ''

    if (s === true) {
      url = '/bt/scan/on'
    } else if (s === false) {
      url = '/bt/scan/off'
    } else {
      return
    }

    $.ajax({ url: url }).fail(function (err) {
      console.log(err)
      $.notify(err.responseText)
    })
  }
})

$('#switch_autorefresh').bootstrapSwitch({
  onSwitchChange: function (e, s) {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
    }

    if (s === true) {
      autoRefreshTimer = setInterval(refresh, 1000)
      $('#btn_refresh').prop('disabled', true)
      $('#btn_refresh').html('<i class="fa fa-spinner fa-pulse fa-fw"></i> Refresh')
    } else {
      $('#btn_refresh').prop('disabled', false)
      $('#btn_refresh').html('Refresh')
    }
  }
})

function requestBT (cmd, path) {
  $.ajax({
    url: '/bt/control/' + cmd,
    method: 'POST',
    data: { path: path }
  }).fail(function (err) {
    console.log(err)
    $.notify(err.responseText)
  })
}

function appendToDevices (item) {
  console.log(item)
  var row = $('<tr />')
  var name
  var paired = ''
  var connected = ''

  if (item.name) {
    name = item.name
  } else {
    name = item.alias
  }

  if (!item.paired) {
    paired = '<button onclick="requestBT(\'pair\', \'' + item.path + '\')" class="btn btn-default">Pair</a>'
    connected = 'unable'
  } else {
    paired = '<button onclick="requestBT(\'unpair\', \'' + item.path + '\')" class="btn btn-default">Unpair</a>'
    if (item.connected) {
      connected = '<button onclick="requestBT(\'disconn\', \'' + item.path + '\')" class="btn btn-default">Disconnect</a>'
    } else {
      connected = '<button onclick="requestBT(\'conn\', \'' + item.path + '\')" class="btn btn-default">Connect</a>'
    }
  }

  row.append($("<td class='col-xs-3'>" + item.addr + '</td>'))
  row.append($("<td class='col-xs-5'>" + name + '</td>'))
  row.append($("<td class='col-xs-2 text-center'>" + paired + '</td>'))
  row.append($("<td class='col-xs-2 text-center'>" + connected + '</td>'))
  $('#devices > tbody > tr:last').after(row)
}

function refresh () {
  $.ajax({ url: '/bt/refresh' }).fail(function (err) {
    console.log(err)
    $.notify(err.responseText)
  }).done(function (data) {
    var jsonData = JSON.parse(data)
    var tbody = $('#devices > tbody')

    $('#devices > tbody > tr').remove()
    tbody.append('<tr />')
    jsonData.result.forEach(appendToDevices)
  })
}

$('#btn_refresh').on('click', refresh())

$(function () {
  socket = io('/web')

  socket.on('settings', function (msg) {
    console.log(msg)
  })
})

