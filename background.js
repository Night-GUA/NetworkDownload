// Background script - 处理下载请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    const { url, filename } = request;
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] 下载失败:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[Background] 下载已开始, ID:', downloadId);
        sendResponse({ success: true, downloadId: downloadId });
      }
    });
    
    // 返回 true 表示异步响应
    return true;
  }
});
