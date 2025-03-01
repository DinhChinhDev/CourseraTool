/* global utils, app */
'use strict';

// delete history when it is disabled
chrome.storage.onChanged.addListener(prefs => {
  if (prefs['history-enabled'] && prefs['history-enabled'].newValue === false) {
    chrome.storage.local.set({
      'history-cache': {}
    });
  }
});

//
chrome.commands.onCommand.addListener(command => {
  if (command === 'ckey_highlight') {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      if (tabs.length) {
        const tab = tabs[0];
        chrome.storage.local.get(utils.prefs, prefs => {
          const ckey = utils.ckey(prefs['history-mode'], tab.url);

          const v = prefs['history-cache'][ckey];
          if (v && prefs['history-enabled']) {
            utils.inject(prefs.colors).then(async () => {
              await app.tabs.inject.js({
                file: '/data/inject/control.js'
              });
              const port = app.runtime.connect(tab.id, {
                name: 'highlight'
              });
              port.post({
                method: 'search',
                query: v.query,
                separator: prefs.separator,
                prefs,
                origin: 'background'
              });
            });
          }
        });
      }
    });
  }
  else if (command === 'remove_highlight') {
    chrome.storage.local.get(utils.prefs, prefs => {
      utils.inject(prefs.colors).then(() => {
        app.tabs.inject.js({
          file: '/data/inject/mark.es6.js'
        }).then(() => app.tabs.inject.js({
          code: `{
            const instance = new Mark(document.body);
            delete window.cache;
            delete window.query;
            delete window.offset;
            delete window.total;
            instance.unmark();
          }`
        }));
      });
    });
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
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