// background service of the extension that checks the subscribed playlists of the account at some set interval
const CHECK_SUBSCRIPTIONS_ALARM = "checkSubscriptions";
const CHECK_SUBSCRIPTIONS_RETRY_ALARM = "checkSubscriptionsRetry";
const CHECK_SUBSCRIPTIONS_OPTIONS = { delayInMinutes: 5, periodInMinutes: 40 };
const MAX_RETRY_ATTEMPTS = 10;
// Chrome clamps alarm delays below one minute up to one minute in stable builds.
const RETRY_DELAY_MINUTES = 1;

function scheduleSubscriptionChecks() {
  chrome.alarms.create(CHECK_SUBSCRIPTIONS_ALARM, CHECK_SUBSCRIPTIONS_OPTIONS);
}

function ensureSubscriptionChecks() {
  chrome.alarms.get(CHECK_SUBSCRIPTIONS_ALARM, alarm => {
    if (!alarm) scheduleSubscriptionChecks();
  });
}

function scheduleSubscriptionRetry(attempt) {
  if (attempt > MAX_RETRY_ATTEMPTS) {
    clearSubscriptionRetry();
    return;
  }

  chrome.storage.local.set({ abs_retryAttempt: attempt }, () => {
    chrome.alarms.create(CHECK_SUBSCRIPTIONS_RETRY_ALARM, {
      delayInMinutes: RETRY_DELAY_MINUTES
    });
  });
}

function clearSubscriptionRetry() {
  chrome.alarms.clear(CHECK_SUBSCRIPTIONS_RETRY_ALARM);
  chrome.storage.local.remove('abs_retryAttempt');
}

function startSubscriptionCheck(attempt) {
  chrome.storage.local.get('abs_account', result => {
    if (result.abs_account !== undefined) checkSubscriptions(result.abs_account, attempt);
    else console.log(`${new Date().toLocaleTimeString()} : account is undefined, fetch call cancelled`);
  });
}

chrome.runtime.onInstalled.addListener(scheduleSubscriptionChecks);
chrome.runtime.onStartup.addListener(scheduleSubscriptionChecks);
ensureSubscriptionChecks();

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === CHECK_SUBSCRIPTIONS_ALARM) {
    clearSubscriptionRetry();
    startSubscriptionCheck(1);
  } else if (alarm.name === CHECK_SUBSCRIPTIONS_RETRY_ALARM) {
    chrome.storage.local.get('abs_retryAttempt', result => {
      const attempt = result.abs_retryAttempt || 1;
      startSubscriptionCheck(attempt);
    });
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "checkSubscriptions") {
    clearSubscriptionRetry();
    startSubscriptionCheck(1);
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
  let hadFailure = false;

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
        const { add, update, remove } = data;

        // add = new content that needs to be added into the playlist
        if(add.length > 0) {
          for(let j = 0; j < add.length; j++) {
            account.playlists[i].contents.push(add[j]);
          }
        }
        
        // update = existing content where the title of content has been changed
        if(update.length > 0) {
          for(let j = 0; j < update.length; j++) {
            for(let k = 0; k < account.playlists[i].contents.length; k++) {
              if(update[j].url === account.playlists[i].contents[k].url) {
                // eventually, we need a change log of the playlist to record these updates
                account.playlists[i].contents[k].title = update[j].title;
                break;
              }
            }
          }
        }

        // remove = content that exists in the user playlist that is no longer contained in the creator's playlist
        if(remove.length > 0) {
          for(let j = 0; j < remove.length; j++) {
            for(let k = 0; k < account.playlists[i].contents.length; k++) {
              if(remove[j].url === account.playlists[i].contents[k].url) {
                account.playlists[i].contents.splice(k, 1);
                // eventually, we need a change log of the playlist to record these removes
                break;
              }
            }
          }
        }
      }
    }).catch(error => {
      console.error(`${new Date().toLocaleTimeString()} : Attempt#${attempt}: ${error}`);
      hadFailure = true;
    }); 
    promises.push(promise);
  }

  Promise.all(promises).then(() => {
    if (hadFailure) {
      scheduleSubscriptionRetry(attempt + 1);
    } else {
      clearSubscriptionRetry();
    }

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
    } else if (!hadFailure) {
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
