// background service of the extension that checks the subscribed playlists of the account at some set interval

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
    // makes an api call with all the user's subscribed playlists
}

setInterval(checkSubscriptions, 60000); // checks subscriptions every 60 seconds