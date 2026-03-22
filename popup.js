document.addEventListener('DOMContentLoaded', () => {
    const tip = document.getElementById('tip');

    // 在页面中执行脚本获取歌曲信息
    async function getSongInfoFromPage(tabId) {
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    // 获取歌曲名称
                    function getSongName() {
                        // 优先从页面 title 获取（最可靠）
                        // title 格式：歌曲名 - 歌手 - 网易云音乐
                        const titleMatch = document.title.match(/^(.+?)(?:\s+-\s+.+)?\s+-\s+网易云音乐$/);
                        if (titleMatch) {
                            const name = titleMatch[1].trim();
                            if (name && name.length > 0 && name.length < 100) return name;
                        }
                        
                        // 备选：使用 DOM 选择器
                        const selectors = [
                            '.m-lycifo .tit h1 em',
                            '.m-lycifo .tit h1',
                            '.g-mn4 .tit h1 em',
                            '.g-mn4 .tit h1',
                            '.cnt .tit h1 em',
                            '.cnt .tit h1',
                            '.song_info h1'
                        ];
                        for (const selector of selectors) {
                            const el = document.querySelector(selector);
                            if (el && el.textContent) {
                                const name = el.textContent.trim();
                                if (name && name.length > 0 && name.length < 100) return name;
                            }
                        }
                        return null;
                    }

                    // 获取歌手名称
                    function getArtistName() {
                        // 优先从页面 title 获取
                        // title 格式：歌曲名 - 歌手 - 网易云音乐
                        const titleMatch = document.title.match(/^.+?\s+-\s+(.+?)\s+-\s+网易云音乐$/);
                        if (titleMatch) {
                            const name = titleMatch[1].trim();
                            if (name && name.length > 0 && name.length < 100) return name;
                        }
                        
                        // 备选：使用 DOM 选择器
                        const selectors = [
                            '.m-lycifo .des a[href*="artist"]',
                            '.m-lycifo .des a[href*="singer"]',
                            '.g-mn4 .des a[href*="artist"]',
                            '.g-mn4 .des a[href*="singer"]',
                            '.cnt .des a[href*="artist"]',
                            '.cnt .des a[href*="singer"]',
                            '.song_info .artist a'
                        ];
                        for (const selector of selectors) {
                            const els = document.querySelectorAll(selector);
                            if (els.length > 0) {
                                const artists = [];
                                els.forEach(el => {
                                    const name = el.textContent?.trim();
                                    if (name && name.length > 0 && name.length < 50 && !artists.includes(name)) {
                                        artists.push(name);
                                    }
                                });
                                if (artists.length > 0) {
                                    return artists.join('/');
                                }
                            }
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
            tip.innerHTML = '❌ 无法获取当前页面信息';
            tip.className = 'error';
            return;
        }

        const currentTab = tabs[0];
        const url = currentTab.url || '';

        if (!url.includes('music.163.com')) {
            tip.innerHTML = '❌ 请先打开<a href="https://music.163.com/#/song?id=3346403321" target="_blank">网易云音乐</a>歌曲页面';
            tip.className = 'error';
            return;
        }

        const songIdMatch = url.match(/song\/id=(\d+)|#\/song\?id=(\d+)|#\/song\/id=(\d+)/);
        const songId = songIdMatch ? (songIdMatch[1] || songIdMatch[2] || songIdMatch[3]) : null;

        if (!songId) {
            tip.innerHTML = '❌ 当前不是歌曲详情页面<br>请进入具体歌曲页面使用';
            tip.className = 'error';
            return;
        }

        // 获取歌曲信息
        const { songName, artistName } = await getSongInfoFromPage(currentTab.id);

        // 显示歌曲信息
        let html = '✅ <b>当前歌曲</b><br>';
        if (songName) {
            html += `🎵 ${songName}<br>`;
        }
        if (artistName) {
            html += `🎤 ${artistName}<br>`;
        }
        html += '<br>请点击<b>分享按钮旁的"一键下载"按钮</b>';

        tip.innerHTML = html;
        tip.className = 'success';
    });
});
