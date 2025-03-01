chrome.runtime.onInstalled.addListener(() => {
    // Lưu trạng thái mặc định
    chrome.storage.local.set({ enableButton: false });
  });
  