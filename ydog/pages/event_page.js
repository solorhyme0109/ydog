const QUERY_URL = 'http://119.29.240.122:13512/api'

// chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: '查询: %s',
    id: 'ydog_selector',
  }, function(err) {
    console.log(err)
  })

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    console.log(info)
    const {selectionText} = info
    const xhr = new XMLHttpRequest()
    xhr.open('get', `${QUERY_URL}?q=${selectionText}`)
    xhr.onreadystatechange = function() {
      if(xhr.readyState === xhr.DONE && xhr.status === 200) {
        const result = JSON.parse(xhr.responseText)
        chrome.tabs.sendMessage(tab.id, {status: 'finished', body: result}, function(response) {
          console.log(response);
        });
      } else if (xhr.readyState === xhr.DONE){
        console.log(xhr.status)
      }
    }
    xhr.setRequestHeader('Accept', 'application/json')

    chrome.tabs.sendMessage(tab.id, {status: 'fetching', body: null}, function(response) {
      console.log(response);
    });

    xhr.send()
  })
// })



