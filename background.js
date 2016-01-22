chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({
    url: 'index.html'
  }, function(tab) {
    console.log('Tab created');
  });
});