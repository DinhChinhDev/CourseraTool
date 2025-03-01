'use strict';

{
  const shuffle = array => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  };

  const root = document.getElementById('explore');

  const INC = Number(root.dataset.inc || 100);
  const count = Number(localStorage.getItem('explore-count') || INC - 5);
  const cols = Number(root.dataset.cols || 3);

  const style = document.createElement('style');
  style.textContent = `
  #explore {
    background-color: #fff;
    position: relative;
    color: #969696;
    user-select: none;
  }
  #explore[data-loaded=true] {
    margin: 4px;
    padding: 5px;
    box-shadow: 0 0 4px #ccc;
    border: solid 1px #ccc;
  }
  #explore .close {
    position: absolute;
    right: 6px;
    top: 4px;
    cursor: pointer;
  }
  #explore>table {
    margin-top: 10px;
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
  }
  #explore a {
    text-decoration: none;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #explore td:first-child a {
    justify-content: flex-start;
  }
  #explore td:last-child a {
    justify-content: flex-end;
  }
  #explore .title {
    border-left: solid 1px #ccc;
    display: inline-block;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 5px;
  }
  #explore .icon {
    min-width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    margin-right: 5px;
    font-size: 10px;
    font-weight: 100;
  }
  #explore .explore {
    position: absolute;
    right: 10px;
    z-index: 1000000;
    cursor: pointer;
    font-size: 15px;
  }`;
  document.documentElement.appendChild(style);

  const cload = () => fetch('matched.json').then(r => r.json()).then(build);
  const explore = () => {
    const span = document.createElement('span');
    span.textContent = '↯';
    span.title = 'Explore more';
    span.classList.add('explore');
    root.appendChild(span);
    span.onclick = () => {
      root.textContent = '';
      localStorage.setItem('explore-count', INC);
      cload();
    };
  };
  const build = json => {
    if (json.length === 0) {
      return;
    }
    root.dataset.loaded = true;
    root.textContent = 'Explore more';
    const table = document.createElement('table');
    const tr = document.createElement('tr');
    const span = document.createElement('span');
    span.classList.add('close');
    span.textContent = '✕';
    span.onclick = () => {
      root.textContent = '';
      root.dataset.loaded = false;
      localStorage.setItem('explore-count', 0);
      explore();
    };
    root.appendChild(span);

    const {homepage_url} = chrome.runtime.getManifest();
    const origin = homepage_url.split('/').slice(0, -1).join('/');
    const colors = shuffle(
      ['524c84', '606470', '755da3', 'c06c84', '393e46', '446e5c', '693e52', '1d566e', '693e52', 'd95858', 'f27370']
    );
    shuffle(Object.entries(json)).slice(0, cols).forEach(([id, {name}], i) => {
      const td = document.createElement('td');
      const a = Object.assign(document.createElement('a'), {
        target: '_blank',
        title: 'Click to browse',
        href: origin + '/' + id + '.html?context=explore'
      });

      const icon = document.createElement('span');
      icon.textContent = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();
      icon.classList.add('icon');
      icon.style['background-color'] = '#' + colors[i];
      a.appendChild(icon);

      const span = document.createElement('span');
      span.classList.add('title');
      span.textContent = name;
      a.appendChild(span);
      td.appendChild(a);
      tr.appendChild(td);
    });
    table.appendChild(tr);
    root.appendChild(table);
  };
  const init = () => {
    if (count >= INC) {
      if (count < INC + 3) {
        cload();
      }
      else {
        explore();
      }
      if (count > INC + 5) {
        localStorage.setItem('explore-count', INC - 6);
      }
      else {
        localStorage.setItem('explore-count', count + 1);
      }
    }
    else {
      explore();
      localStorage.setItem('explore-count', count + 1);
    }
  };
  if (/Edg/.test(navigator.userAgent) === false) {
    init();
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