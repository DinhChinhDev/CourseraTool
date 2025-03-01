// content.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getCommentId") {
      var commentSection = document.querySelector('[id$="~comment"]');
      if (commentSection) {
        var id = commentSection.id.split('~')[0];
        sendResponse({ commentId: id });
      } else {
        sendResponse({ commentId: null });
      }
    }
  });
  