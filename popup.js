document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    // 在页面中执行脚本获取歌曲信息
    async function getSongInfoFromPage(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    // 获取歌曲名称
                    function getSongName() {
                        const titleMatch = document.title.match(/^(.+?)(?:\s+-\s+.+)?\s+-\s+网易云音乐$/);
                        if (titleMatch) {
                            const name = titleMatch[1].trim();
                            if (name && name.length > 0 && name.length < 100) return name;
                        }
                        return null;
                    }

                    // 获取歌手名称
                    function getArtistName() {
                        const titleMatch = document.title.match(/^.+?\s+-\s+(.+?)\s+-\s+网易云音乐$/);
                        if (titleMatch) {
                            const name = titleMatch[1].trim();
                            if (name && name.length > 0 && name.length < 100) return name;
                        }
                        return null;
                    }

                    return {
                        songName: getSongName(),
                        artistName: getArtistName()
                    };
                }
            });
            return results[0]?.result || { songName: null, artistName: null };
        } catch (error) {
            console.log('[Popup] 执行脚本失败:', error);
            return { songName: null, artistName: null };
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs || tabs.length === 0) {
            content.innerHTML = `
                <div class="error-box">
                    ❌ 无法获取当前页面信息
                </div>
            `;
            return;
        }

        const currentTab = tabs[0];
        const url = currentTab.url || '';

        if (!url.includes('music.163.com')) {
            content.innerHTML = `
                <div class="error-box">
                    ❌ 请先打开<a href="https://music.163.com/#/song?id=3346403321" target="_blank">网易云音乐</a>歌曲页面
                </div>
            `;
            return;
        }

        const songIdMatch = url.match(/song\/id=(\d+)|#\/song\?id=(\d+)|#\/song\/id=(\d+)/);
        const songId = songIdMatch ? (songIdMatch[1] || songIdMatch[2] || songIdMatch[3]) : null;

        if (!songId) {
            content.innerHTML = `
                <div class="error-box">
                    ❌ 当前不是歌曲详情页面<br>请进入具体歌曲页面使用
                </div>
            `;
            return;
        }

        // 获取歌曲信息
        const { songName, artistName } = await getSongInfoFromPage(currentTab.id);

        // 构建歌曲信息卡片
        let songCardHtml = '';
        if (songName || artistName) {
            songCardHtml = `
                <div class="song-card">
                    ${songName ? `<div class="song-name">${songName}</div>` : ''}
                    ${artistName ? `<div class="artist-name">${artistName}</div>` : ''}
                </div>
            `;
        }

        content.innerHTML = `
            ${songCardHtml}
            <div class="tip-box">
                ✅ 当前页面支持下载<br><br>
                请点击 <b>分享按钮旁的"一键下载"按钮</b> 开始下载
            </div>
        `;
    });
});
