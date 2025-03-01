document.getElementById('enable-button').addEventListener('change', async (event) => {
    const isEnabled = event.target.checked;
  
    // Lưu trạng thái của checkbox vào local storage
    chrome.storage.local.set({ enableButton: isEnabled });
  
    // Cập nhật trạng thái của nút "Run Scripts"
    if (isEnabled) {
      // Tạo nút "Run Scripts" trên trang
      chrome.scripting.executeScript({
        target: { tabId: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id },
        func: addRunButton
      });
    } else {
      // Xóa nút "Run Scripts" khỏi trang
      chrome.scripting.executeScript({
        target: { tabId: (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id },
        func: removeRunButton
      });
    }
  });
  
  // Hàm thêm nút "Run Scripts" vào trang
  function addRunButton() {
    if (!document.getElementById('run-script-btn')) {
      const button = document.createElement('button');
      button.id = 'run-script-btn';
      button.className = 'run-btn';
      button.innerText = 'Run Script';
      button.style.position = 'fixed';
      button.style.top = '20px';
      button.style.left = '20px';
      document.body.appendChild(button);
  
      // Cho phép kéo thả nút
      button.addEventListener('mousedown', dragMouseDown);
  
      button.addEventListener('click', () => {
        runScript();
      });
    }
  }
  
  // Hàm loại bỏ nút "Run Scripts"
  function removeRunButton() {
    const button = document.getElementById('run-script-btn');
    if (button) {
      button.remove();
    }
  }
  
  // Hàm chạy khi nhấn nút "Run Script"
  function runScript() {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = video.duration * 0.95;
      video.play();
      console.log('Đã tua đến 95% và đảm bảo video luôn chạy.');
    } else {
      const markCompleteButton = document.querySelector('button[data-testid="mark-complete"]');
      if (markCompleteButton && !markCompleteButton.disabled) {
        markCompleteButton.click();
        console.log('Đã nhấn nút "Mark as completed".');
      }
    }
  }
  
  // Hàm xử lý sự kiện kéo thả nút
  function dragMouseDown(e) {
    e.preventDefault();
    let pos1 = e.clientX;
    let pos2 = e.clientY;
  
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  
    function elementDrag(e) {
      e.preventDefault();
      let pos3 = pos1 - e.clientX;
      let pos4 = pos2 - e.clientY;
      pos1 = e.clientX;
      pos2 = e.clientY;
      button.style.top = (button.offsetTop - pos4) + "px";
      button.style.left = (button.offsetLeft - pos3) + "px";
    }
  
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  