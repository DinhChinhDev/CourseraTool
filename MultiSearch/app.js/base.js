'use strict';

const app = {};
window.app = app;

/* runtime */
app.runtime = {
  on(e, callback) {
    if (e === 'start') {
      chrome.runtime.onStartup.addListener(callback);
      chrome.runtime.onInstalled.addListener(callback);
    }
  },
  get manifest() {
    return chrome.runtime.getManifest();
  },
  connect(tabId, connectInfo) {
    let port;
    if (typeof tabId === 'object') {
      port = chrome.runtime.connect(tabId);
    }
    else {
      port = chrome.tabs.connect(tabId, connectInfo);
    }
    return {
      on(e, callback) {
        if (e === 'message') {
          port.onMessage.addListener(callback);
        }
      },
      post(msg) {
        port.postMessage(msg);
      }
    };
  }
};

/* storage */
app.storage = {
  get(prefs, type = 'managed') {
    return new Promise(resolve => {
      if (type === 'managed') {
        chrome.storage.managed.get(prefs, ps => {
          chrome.storage.local.get(chrome.runtime.lastError ? prefs : ps || prefs, resolve);
        });
      }
      else {
        chrome.storage[type].get(prefs, resolve);
      }
    });
  },
  set(prefs, type = 'managed') {
    return new Promise(resolve => {
      chrome.storage[type === 'remote' ? 'remote' : 'local'].set(prefs, resolve);
    });
  },
  on(e, callback) {
    if (e === 'changed') {
      chrome.storage.onChanged.addListener(callback);
    }
  }
};

/* button */
app.button = {
  set({
    popup
  }, tabId) {
    if (popup !== undefined) {
      chrome.browserAction.setPopup({
        tabId,
        popup
      });
    }
  },
  on(e, callback) {
    if (e === 'clicked') {
      chrome.browserAction.onClicked.addListener(callback);
    }
  }
};

/* tab */
app.tabs = {
  open({
    url
  }) {
    return new Promise(resolve => chrome.tabs.create({url}, resolve));
  },
  current() {
    return new Promise(resolve => chrome.tabs.query({
      active: true,
      currentWindow: true
    }, (tabs = []) => resolve(tabs[0])));
  },
  inject: {
    js(tabId, details) {
      if (typeof tabId === 'object') {
        details = tabId;
        tabId = undefined;
      }
      return new Promise((resolve, reject) => {
        chrome.tabs.executeScript(tabId, Object.assign({
          runAt: 'document_start'
        }, details), results => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            reject(lastError);
          }
          else {
            resolve(results);
          }
        });
      });
    },
    css(tabId, details) {
      if (typeof tabId === 'object') {
        details = tabId;
        tabId = undefined;
      }
      return new Promise((resolve, reject) => {
        chrome.tabs.insertCSS(tabId, Object.assign({
          runAt: 'document_start'
        }, details), results => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            reject(lastError);
          }
          else {
            resolve(results);
          }
        });
      });
    }
  }
};

/* window */
app.windows = {
  open({url, left, top, width, height, type}) {
    width = width || 700;
    height = height || 500;
    if (left === undefined) {
      left = screen.availLeft + Math.round((screen.availWidth - width) / 2);
    }
    if (top === undefined) {
      top = screen.availTop + Math.round((screen.availHeight - height) / 2);
    }
    return new Promise(resolve => chrome.windows.create(
      {url, width, height, left, top, type: type || 'popup'},
      resolve
    ));
  }
};

/* menus */
app.menus = {
  add(...items) {
    for (const item of items) {
      chrome.contextMenus.create(Object.assign({
        contexts: item.contexts || ['browser_action']
      }, item));
    }
  },
  on(e, callback) {
    if (e === 'clicked') {
      chrome.contextMenus.onClicked.addListener(callback);
    }
  }
};


// let intervalId;

// // Hàm thực hiện việc click tự động vào các kết quả được highlight
// const autoClickHighlightedResults = () => {
//   console.log('autoClickHighlightedResults function called');
//   // Lấy tất cả các phần tử đã được highlight
//   const highlightedResults = document.querySelectorAll('mark[data-markjs="true"]');
//   console.log('Number of highlighted results:', highlightedResults.length);
//   let index = 0;

//   // Hàm thực hiện việc click vào kết quả tiếp theo
//   const clickNextResult = () => {
//       console.log('clickNextResult function called');
//       // Kiểm tra xem có phải là phần tử cuối cùng không
//       if (index < highlightedResults.length) {
//           // Thực hiện click vào phần tử tiếp theo
//           highlightedResults[index].click();
//           console.log('Clicked on highlighted result at index:', index);
//           // Cộng dồn biến index
//           index++;
//       } else {
//           // Nếu đã click vào tất cả các phần tử, dừng interval
//           clearInterval(intervalId);
//           console.log('Interval cleared');
//       }
//   };

//   // Gọi hàm click lần đầu tiên trước khi thiết lập interval
//   clickNextResult();

//   // Thiết lập interval để tự động click vào các phần tử tiếp theo
//   intervalId = setInterval(clickNextResult, 100);
// };

// // Gọi hàm tự động click khi trang được tải
// window.addEventListener('DOMContentLoaded', () => {
//   console.log('Window DOMContentLoaded event fired');
//   setTimeout(autoClickHighlightedResults, 5000); // Chờ 5 giây trước khi bắt đầu tự động click
// });