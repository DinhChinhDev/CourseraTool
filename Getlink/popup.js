// popup.js
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('transformButton').addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getCommentId" }, function(response) {
          if (response && response.commentId) {
            var transformedLink = transformLink(tabs[0].url, response.commentId);
            updateResult(transformedLink);
          } else {
            console.log("Comment ID not found");
          }
        });
      });
    });
  });
  
  function transformLink(originalLink, commentId) {
    return originalLink.replace(/\/submit$/, "/review/" + commentId);
  }
  
  function updateResult(transformedLink) {
    document.getElementById('result').innerHTML = `
      Transformed Link: <a href="${transformedLink}" target="_blank">${transformedLink}</a>
      <button id="copyButton">Copy</button>
    `;
    
    document.getElementById('copyButton').addEventListener('click', function() {
      copyToClipboard(transformedLink);
    });
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
      console.log('Link copied to clipboard!');
    }, function(err) {
      console.error('Unable to copy to clipboard', err);
    });
  }
  