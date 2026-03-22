document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    const tip = document.getElementById('tip');
  
    downloadBtn.disabled = true;
    tip.textContent = '🔍 正在检测页面...';

    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        tip.textContent = '❌ 无法获取当前标签页';
        tip.className = 'error';
        return;
      }
  
      const currentTab = tabs[0];
      const url = currentTab.url || '';
      const songIdMatch = url.match(/song\/id=(\d+)|#\/song\?id=(\d+)|#\/song\/id=(\d+)/);
      const songId = songIdMatch ? (songIdMatch[1] || songIdMatch[2] || songIdMatch[3]) : null;
  
      if (!url.includes('music.163.com') || !songId) {
        downloadBtn.disabled = true;
        tip.innerHTML = '❌ 请先打开<a href="https://music.163.com/#/song?id=3346403321" target="_blank">网易云音乐歌曲</a>页面';
        tip.className = 'error';
        return;
      }
  
      downloadBtn.disabled = false;
      tip.textContent = '✅ 点击复制MP3文件链接并一键下载';
      tip.className = '';
  
      downloadBtn.addEventListener('click', async () => {
        try {
          const downloadUrl = `http://music.163.com/song/media/outer/url?id=${songId}.mp3`;
          // 复制到剪贴板
          await navigator.clipboard.writeText(downloadUrl);
          
          tip.innerHTML = '✅ 链接已复制并尝试下载！<br>若失败，请使用下载链接';
          tip.className = '';
  
          // 可选：自动打开外链页面（辅助用户）
          // chrome.tabs.create({ url: downloadUrl });
          // downloadFile(downloadUrl, songId + ".mp3")
          chrome.downloads.download({
            url: downloadUrl,
            filename: songId + ".mp3",
            conflictAction: 'uniquify'
          });

        } catch (error) {
          tip.textContent = `❌ 复制失败：${error.message}`;
          tip.className = 'error';
          console.error(error);
        }
      });
    });
  });
  