<template>
    <div class="win-about" :class="{ 'dark-theme': systemStore.theme === 'dark' }">
        <div class="about-container">
            <!-- 顶部 Logo 和 标题 -->
            <div class="about-hero">
                <div class="hero-logo-wrapper">
                    <img src="icons/system/Windows 10.png" class="hero-logo" alt="Windows Logo" />
                </div>
                <div class="hero-text">
                    <h1 class="project-name">Windows 10 Web Edition</h1>
                    <div class="version-badge">Version 26H2 (Concept)</div>
                </div>
            </div>

            <div class="about-content">
                <!-- 系统信息卡片 -->
                <div class="info-card">
                    <div class="card-header">
                        <i class="icon-system"></i>
                        <span>系统摘要</span>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">内核版本</span>
                            <span class="value">Vue 3.x + Vite + Pinia</span>
                        </div>
                        <div class="info-item">
                            <span class="label">渲染引擎</span>
                            <span class="value">Modern Browser Engine</span>
                        </div>
                        <div class="info-item">
                            <span class="label">体验</span>
                            <span class="value">Windows Feature Experience Pack</span>
                        </div>
                    </div>
                </div>

                <!-- 开发团队 -->
                <div class="section-group">
                    <h2 class="group-title">开发团队</h2>
                    <div class="team-grid">
                        <div class="member-card" @click="openLink('https://space.bilibili.com/471197002?spm_id_from=333.788.upinfo.head.click')">
                            <div class="member-avatar">
                                <img src="/Develope/1.png" alt="戌犬·朱狼" class="member-avatar-img"/>
                            </div>
                            <div class="member-details">
                                <div class="name">戌犬 · 朱狼</div>
                                <div class="role">UI / 概念设计</div>
                                <div class="social-links">
                                    <span class="social-item">B站: 戌犬朱狼_Lipus</span>
                                </div>
                            </div>
                        </div>
                        <div class="member-card" @click="openLink('https://v.douyin.com/mC0OAyLApVg/ 4@9.com :3pm')">
                            <div class="member-avatar">
                                <img src="/Develope/2.png" alt="花尾鸽" class="member-avatar-img"/>
                            </div>
                            <div class="member-details">
                                <div class="name">花尾鸽</div>
                                <div class="role">项目主开发</div>
                                <div class="social-links">
                                    <span class="social-item">抖音: 花尾鸽</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 法律与版权 -->
                <div class="legal-section">
                    <div class="legal-item">
                        <h3 class="legal-title">开源许可</h3>
                        <p class="legal-text">本项目采用 Apache License 2.0 协议。您可以自由使用、修改和分发，但请务必在显著位置保留原作者署名信息。</p>
                    </div>
                    <div class="legal-item">
                        <h3 class="legal-title">免责声明</h3>
                        <p class="legal-text">本项目仅用于个人技术研究与 UI 设计交流。所有涉及 Microsoft、Windows 的商标、图标及视觉设计的所有权均归 Microsoft Corporation 所有。</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="about-footer">
            <div class="copyright">© 2024-2026 Windows on Web Team</div>
            <button class="win-close-btn" @click="closeWindow">确定</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/stores/system";

const props = defineProps<{
    windowId: number;
}>();

const systemStore = useSystemStore();

const closeWindow = () => {
    systemStore.closeWindow(props.windowId);
};

const openLink = (url: string) => {
    window.open(url, '_blank');
};
</script>

<style scoped>
.win-about {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f3f3f3;
    color: #000;
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    user-select: none;
}

.about-container {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none; 
    -ms-overflow-style: none; 
}

.about-container::-webkit-scrollbar {
    display: none; 
}
/* 顶部英雄区 */
.about-hero {
    padding: 40px 30px;
    background: linear-gradient(135deg, #0078d7 0%, #005a9e 100%);
    color: white;
    display: flex;
    align-items: center;
    gap: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-logo-wrapper {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-logo {
    width: 50px;
    height: 50px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

.hero-text .project-name {
    margin: 0;
    font-size: 24px;
    font-weight: 300;
    letter-spacing: 0.5px;
}

.version-badge {
    margin-top: 8px;
    display: inline-block;
    padding: 2px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 内容区 */
.about-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e5e5;
}

.card-header {
    font-size: 14px;
    font-weight: 600;
    color: #0078d7;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-grid {
    display: grid;
    gap: 12px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item .label {
    color: #666;
}

.info-item .value {
    font-weight: 500;
}

/* 分组标题 */
.group-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
}

.team-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.member-card {
    background: white;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    gap: 12px;
    border: 1px solid #e5e5e5;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.member-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.member-avatar {
    width: 48px;
    height: 48px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.member-avatar img {
    width: 48px;
    height: 48px;
    opacity: 0.6;
    border-radius: 50%;
}

.member-details .name {
    font-weight: 600;
    font-size: 14px;
}

.member-details .role {
    font-size: 12px;
    color: #0078d7;
    margin-top: 2px;
}

.social-links {
    margin-top: 8px;
    font-size: 11px;
    color: #888;
}

/* 法律信息 */
.legal-section {
    background: rgba(0, 120, 215, 0.05);
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #0078d7;
}

.legal-item + .legal-item {
    margin-top: 16px;
}

.legal-title {
    font-size: 14px;
    margin: 0 0 4px 0;
    font-weight: 600;
}

.legal-text {
    font-size: 12px;
    line-height: 1.6;
    color: #555;
    margin: 0;
}

/* 页脚 */
.about-footer {
    padding: 16px 24px;
    background: white;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.copyright {
    font-size: 12px;
    color: #888;
}

.win-close-btn {
    padding: 6px 32px;
    background: #1179db;
    border: 1px solid #9f9e9e;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.win-close-btn:hover {
    background: #229cd9;
}

.win-close-btn:active {
    background: #bbb;
    transform: scale(0.98);
}

/* 深色模式适配 */
.dark-theme {
    background-color: #1a1a1a;
    color: #fff;
}

.dark-theme .info-card,
.dark-theme .member-card {
    background-color: #252525;
    border-color: #333;
}

.dark-theme .info-item {
    border-color: #333;
}

.dark-theme .info-item .label {
    color: #aaa;
}

.dark-theme .member-avatar {
    background: #333;
}

.dark-theme .legal-section {
    background: rgba(0, 120, 215, 0.1);
    border-color: #0078d7;
}

.dark-theme .legal-text {
    color: #bbb;
}

.dark-theme .about-footer {
    background-color: #202020;
    border-color: #333;
}

.dark-theme .win-close-btn {
    background: #333;
    border-color: #444;
    color: #fff;
}

.dark-theme .win-close-btn:hover {
    background: #444;
}
</style>