# 网易云音乐一键下载

为方便下载网易云音乐歌曲而制作的浏览器扩展。

## 背景

网易云音乐网页版虽然提供了音乐播放功能，但下载功能受限。本扩展旨在简化下载流程，让用户能够一键获取歌曲下载链接。

## 功能特性

- 🔍 自动识别网易云音乐歌曲页面
- 📋 一键复制歌曲下载链接
- ⬇️ 自动触发浏览器下载
- 🎵 支持标准音质 MP3 下载

## 如何安装

### 方法一：开发者模式安装（推荐）

1. 下载本仓库代码到本地
2. 打开 Chrome/Edge 浏览器，进入扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

### 方法二：Chrome 网上应用店（待发布）

## 如何使用

1. 安装扩展后，打开 [网易云音乐网页版](https://music.163.com)
2. 进入任意歌曲详情页面
3. 点击浏览器工具栏上的扩展图标
4. 点击"复制下载链接"按钮
5. 链接会自动复制到剪贴板，并触发下载

## 屏幕截图

> 截图待添加

## 实现原理

通过解析网易云音乐网页版 URL 中的歌曲 ID，拼接外链下载地址：

```
http://music.163.com/song/media/outer/url?id={歌曲ID}.mp3
```

## 局限性

- ⚠️ 仅支持标准音质（128kbps MP3）
- ⚠️ 部分版权受限歌曲可能无法下载
- ⚠️ 需要登录网易云音乐账号才能下载部分歌曲
- ⚠️ 下载成功率受网易云音乐服务器限制影响

## 维护说明

这个仓库的代码支持是尽力而为的，如果您有更好的建议或者提案请随时提交 Issue 或 PR :)

## 法律责任豁免条款

请勿将此代码用于违反相关法律法规的活动。

您利用此代码，包括但不限于使用、复制、传播、分发等，即代表您已阅读、理解并同意：开发者无法预测您的行为，您必须为滥用脚本而违反相关法律法规的行为负有全部法律责任。

## 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可证。

```
NetworkDownload - 网易云音乐一键下载
Copyright (C) 2024  

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
