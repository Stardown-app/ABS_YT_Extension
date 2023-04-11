// background service of the extension that checks the subscribed playlists of the account at some set interval
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("checkSubscriptions", { delayInMinutes: 5, periodInMinutes: 40 });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "checkSubscriptions") {
    chrome.storage.local.get('abs_account', result => { 
      if(result.abs_account !== undefined) checkSubscriptions(result.abs_account, 1);
      else console.error(`${new Date().toLocaleTimeString()} : account is undefined, fetch call cancelled`);
    });
  }
});

function notificationMessage(newContent) {
  let msg = "New content for: ";
  for(let i = 0; i < newContent.length; i++) {
    msg += i > 0 ? ', ' : '';
    msg += newContent[i];
  }
  return msg;
}

function checkSubscriptions(account, attempt) {
  let newContent = [];
  let promises = [];

  for(let i = 0; i < account.playlists.length; i++) {
    let promise = fetch('http://chuadevs.com:12312/v1/api/youtube', {
      method: "PUT",
      body:JSON.stringify(account.playlists[i]),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if(response.status === 200) return response.json();
      else if(response.status === 204) return;
      else throw new Error(`status:${response.status}, message:${response.statusText}`);
    }).then(data => {
      if(data) {
        newContent.push(`${account.playlists[i].playlist_title}`);
        for(let j = 0; j < data.length; j++) {
          account.playlists[i].contents.push(data[j]);
        }
      }
    }).catch(error => {
      console.error(`${new Date().toLocaleTimeString()} : Attempt#${attempt}: ${error}`);
      if(attempt <= 10) {
        setTimeout(() => {
          chrome.storage.local.get('abs_account', result => { 
            account = result.abs_account;
            checkSubscriptions(account, ++attempt);
          });
        }, 6000);
      }
    }); 
    promises.push(promise);
  }

  Promise.all(promises).then(() => {
    if(newContent.length) {
      chrome.storage.local.set({'abs_newData': true}, () => {
        chrome.storage.local.set({'abs_account': account}, () => {
          let message = notificationMessage(newContent);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: '../assets/img/active/playlist_tracker_icon_128.png',
            title: 'A Better Subscription Service',
            message: message
          });
        });
      });
    } else {
      chrome.storage.local.get('abs_fetchLog', result => {
        let log = result.abs_fetchLog;
        let msg = 'checked subscriptions, no new content'
        if(log !== undefined) log.push(`${new Date().toLocaleTimeString()} : ${msg}`);
        else log = [`${new Date().toLocaleTimeString()} : ${msg}`];
        chrome.storage.local.set({'abs_fetchLog': log});
      });
    }
  });
}


