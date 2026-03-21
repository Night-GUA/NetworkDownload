// 在页面上下文中执行，确保可以访问页面元素
(function() {
  'use strict';

  // 防止重复注入
  if (window.__musicDownloadExtensionInjected) return;
  window.__musicDownloadExtensionInjected = true;

  console.log('[音乐下载插件] 脚本已加载，当前页面:', window.location.href);

  // 创建提示框元素（如果不存在）
  function createTipElement() {
    if (document.getElementById('custom-download-tip')) return;
    const tip = document.createElement('div');
    tip.id = 'custom-download-tip';
    tip.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: rgba(0,0,0,0.85);
      color: white;
      border-radius: 6px;
      z-index: 999999;
      display: none;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(tip);
  }

  // 显示提示
  function showTip(message, duration = 3000) {
    const tip = document.getElementById('custom-download-tip');
    if (!tip) {
      createTipElement();
      return showTip(message, duration);
    }
    tip.textContent = message;
    tip.style.display = 'block';
    if (duration > 0) {
      setTimeout(() => {
        tip.style.display = 'none';
      }, duration);
    }
  }

  // 获取歌曲ID
  function getSongId() {
    const url = window.location.href;
    // 支持多种URL格式
    const patterns = [
      /song\?id=(\d+)/,
      /song\/(\d+)/,
      /#\/song\?id=(\d+)/,
      /#\/song\/(\d+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // 查找目标容器
  function findTargetContainer() {
    // 按优先级尝试多个可能的容器选择器
    const selectors = [
      '.m-lycifo .opt',      // 歌曲信息区操作栏（经典布局）
      '.m-lycifo .btns',     // 歌曲信息区按钮区
      '.g-mn4 .opt',         // 主内容区操作栏
      '.g-mn4 .btns',        // 主内容区按钮区
      '.cnt .opt',           // 内容区操作栏
      '.cnt .btns',          // 内容区按钮区
      '.song_info .opt',     // 歌曲信息操作栏
      '.song_info .btns',    // 歌曲信息按钮区
      '.info .opt',          // 信息区操作栏
      '.info .btns',         // 信息区按钮区
      '.btns',               // 通用按钮区
      '.ops',                // 操作区
      '.oper',               // 底部播放条操作区
      '.ctrl'                // 另一种底部操作区
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container && container.isConnected) {
        console.log('[音乐下载插件] 找到目标容器:', selector);
        return container;
      }
    }
    return null;
  }

  // 劫持原生下载按钮
  function hijackNativeDownloadButton(songId) {
    // 查找原生下载按钮
    const nativeBtn = document.querySelector('a[data-res-action="download"]');
    if (nativeBtn && !nativeBtn.__hijacked) {
      // 标记已劫持
      nativeBtn.__hijacked = true;

      // 修改按钮文字
      const btnText = nativeBtn.querySelector('i');
      if (btnText) {
        btnText.textContent = '一键下载';
      }

      // 直接覆盖 onclick，不克隆节点（避免触发 DOM 变化）
      nativeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        downloadMusic(songId);
        return false;
      };

      console.log('[音乐下载插件] 已劫持原生下载按钮');
      return true;
    }
    return false;
  }

  // 初始化下载按钮
  function initDownloadButton() {
    const songId = getSongId();
    if (!songId) {
      console.log('[音乐下载插件] 未找到歌曲ID');
      return;
    }

    // 尝试劫持原生下载按钮
    if (hijackNativeDownloadButton(songId)) {
      createTipElement();
    }
  }

  // 获取歌曲名称
  function getSongName() {
    // 尝试多个可能的选择器
    const selectors = [
      '.f-thide.name',           // 底部播放条歌曲名
      '.m-lycifo .tit em',       // 歌曲详情页标题
      '.g-mn4 .tit em',          // 主内容区标题
      '.cnt .tit em',            // 内容区标题
      '[class*="song"] h1',      // 歌曲标题
      '.song_info .name',        // 歌曲信息区
      'h1.f-thide',              // 通用标题
      '.name.fc1'                // 另一种歌曲名
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent) {
        const name = el.textContent.trim();
        if (name) return name;
      }
    }
    return null;
  }

  // 获取歌手名称
  function getArtistName() {
    // 尝试多个可能的选择器
    const selectors = [
      '.by.f-thide a',           // 底部播放条歌手（精确匹配）
      '.m-lycifo .des a',        // 歌曲详情页歌手
      '.g-mn4 .des a',           // 主内容区歌手
      '.cnt .des a',             // 内容区歌手
      '.song_info .artist a',    // 歌曲信息区歌手
      '.j-flag.words .by a'      // 播放条歌手区域
    ];

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        // 收集所有歌手名，用 / 分隔
        const artists = [];
        els.forEach(el => {
          const name = el.textContent?.trim();
          // 过滤掉空值和歌曲名（歌手名通常比较短，且链接包含 artist）
          if (name && !artists.includes(name) && name.length < 50) {
            // 检查链接是否是歌手页面
            const href = el.getAttribute('href') || '';
            if (href.includes('artist') || href.includes('singer')) {
              artists.push(name);
            }
          }
        });
        if (artists.length > 0) {
          return artists.join('/');
        }
      }
    }
    return null;
  }

  // 清理文件名中的非法字符
  function sanitizeFilename(name) {
    // 替换 Windows 和 Unix 的非法字符
    return name.replace(/[\\/:*?"<>|]/g, '&');
  }

  // 下载核心逻辑 - 通过 background script 下载
  function downloadMusic(songId) {
    const downloadUrl = `http://music.163.com/song/media/outer/url?id=${songId}.mp3`;

    // 获取歌曲名称和歌手名
    const songName = getSongName();
    const artistName = getArtistName();

    // 构建文件名并清理非法字符
    let filename;
    if (songName && artistName) {
      filename = `${sanitizeFilename(songName)} - ${sanitizeFilename(artistName)}.mp3`;
    } else if (songName) {
      filename = `${sanitizeFilename(songName)}.mp3`;
    } else {
      filename = `网易云歌曲_${songId}.mp3`;
    }

    showTip(`开始下载: ${filename}`);

    // 发送消息给 background script 处理下载
    chrome.runtime.sendMessage({
      action: 'download',
      url: downloadUrl,
      filename: filename
    }, (response) => {
      if (response && response.success) {
        showTip('✅ 下载已开始！');
      } else {
        showTip('❌ 下载失败: ' + (response?.error || '未知错误'));
      }
    });
  }

  // 主函数：初始化
  function init() {
    // 检查是否在正确的域名
    if (!window.location.href.includes('music.163.com')) {
      return;
    }

    console.log('[音乐下载插件] 初始化中...');

    // 创建提示框
    createTipElement();

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
      // 只在歌曲页面初始化按钮
      if (getSongId()) {
        initDownloadButton();
      }
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 立即尝试初始化按钮（如果页面已加载）
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      if (getSongId()) {
        initDownloadButton();
      }
    }

    // 监听 URL 变化（SPA 路由）
    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('[音乐下载插件] URL变化:', currentUrl);
        // 延迟一下等待新页面内容加载
        setTimeout(() => {
          if (getSongId()) {
            initDownloadButton();
          }
        }, 500);
      }
    });
    urlObserver.observe(document.body, { childList: true, subtree: true });
  }

  // 启动插件
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
