// background service of the extension that checks the subscribed playlists of the account at some set interval
const subcriptionTime = 60*60000; // 60 minutes
const accountTime = 15*60000 // 15 minutes
var account;
chrome.storage.local.get('abs_account', function(result) { account = result.abs_account; });

const playlist = {
  url: "https://www.youtube.com/playlist?list=PLSMETuURtTXClX140WdPx9LX8dQts6c1x",
  plid: "PLSMETuURtTXClX140WdPx9LX8dQts6c1x",
  contents: [
          {
              title: "Survival Logic Trailer",
              url: "https://www.youtube.com/watch?v=qip-dyjIj4s",
              viewed: false
          },
          {
              title: "First day playing a survival game",
              url: "https://www.youtube.com/watch?v=XRBE1z8qvSc",
              viewed: false
          },
          {
              title: "Crafting your first item in a survival game",
              url: "https://www.youtube.com/watch?v=W0nRSmZ2UXo",
              viewed: false
          },
          {
              title: "Tedious health meters in survival games",
              url: "https://www.youtube.com/watch?v=7Gg9iQHfV5A",
              viewed: false
          }
      ]
}

function messageHandler(request, sender, sendResponse) {
  if (request.action === 'get_data') {
    // Make an API call using the fetch to scraper service
    fetch('http://localhost:1583')
      .then(response => response.json())
      .then(data => {
        // Send the data back to the content script
        sendResponse({data: data});
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
}

chrome.runtime.onMessage.addListener(messageHandler);

function checkSubscriptions() {
  console.log(`checking subscriptions at: ${new Date().toLocaleTimeString()}`);
  let newContent = false;
  let status = 0;
  for(let i = 0; i < account.playlists.length; i++) {
    fetch('http://chuadevs.com:12312/v1/api/youtube', {
      method: "PUT",
      body:JSON.stringify(account.playlists[i]),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      status = response.status;
      if(response.status === 200) return response.json();
      else if(response.status === 204) return;
      else throw new Error("unexpected status code");
    }).then(data => {
      if(data) {
        newContent = true;
        for(let j = 0; j < data.length; j++) {
          account.playlists[i].contents.push(data[j]);
        }
      }
    }).catch(error => console.error(`ERROR: ${error}`)); 
    if(newContent) {
      chrome.storage.local.set({ "abs_account": account });
      chrome.storage.local.set({ 'abs_newData' : account });
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/img/active/playlist_tracker_icon_128.png',
        title: 'A Better Subscription Service',
        message: `You have new content to view`
      });
    } 
  }
}

function syncAccount() {
  chrome.storage.local.get('abs_account', function(result) { account = result.abs_account; });
  console.log(account);
  if(account !== undefined) {
    fetch('http://chuadevs.com:12312/v1/account/sync', {
      method: "PUT",
      body:JSON.stringify(account),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => { 
      if(response.ok)
        console.log(`Background Sync Status: ${response.status}`);
    }).catch(error => console.error(`ERROR: ${error.message}`)); 
  }
}

setInterval(checkSubscriptions, subcriptionTime); // checks subscriptions every 60 minutes
// setInterval(syncAccount, accountTime); // sync user data with database every 30 minutes