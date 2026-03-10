<template>
    <WindowFrame v-if="!isInfoOpen" :window-id="windowId" :is-maximized="isMaximized" title="TXT 阅读器"
        @drag-start="(e) => emit('drag-start', e)">
        <template #header>
            <div class="txt-custom-header">
                <div class="txt-top-bar">
                    <div class="top-bar-area">
                        <div class="top-label-area"
                            style="flex: 1; min-width: 0; overflow: hidden; padding-right: 10px; display: flex; flex-wrap: nowrap;">
                            <div v-for="(tab, index) in tabs" :key="tab.id" class="top-label-big"
                                :class="{ 'is-active-tab': activeTabId === tab.id }" :style="getTabStyle(tab.id)"
                                @click="activeTabId = tab.id" @mousedown.stop>
                                <div class="top-label-big-active-line"></div>
                                <div class="top-label-big-left">
                                    <div class="top-label-big-span-container">
                                        <span class="top-label-big-span">{{ tab.title }}</span>
                                    </div>
                                </div>
                                <button class="top-label-big-closeview-btn" @click.stop="closeTab(index)">
                                    <img class="top-label-big-closeview-btn-img" src="icons/Cancel.png">
                                </button>
                            </div>
                            <button class="top-label-big-addbtn" @click.stop="addNewTab" style="flex-shrink: 0;"
                                @mousedown.stop>
                                <img class="top-label-big-addbtn-img" src="icons/Add.png">
                            </button>
                        </div>
                    </div>
                </div>

                <WindowControls style="flex-shrink: 0; width: 132px;" :window-id="windowId"
                    :is-maximized="isMaximized" />
            </div>
        </template>

        <div class="txt-main-wrapper" style="position: relative; width: 100%; height: 100%;">
            <div class="txt-content">
                <div class="txt-content-top">
                    <div class="txt-content-top-left">
                        <button class="txt-content-top-le-btn" @click.stop="toggleMenu">
                            <img class="txt-content-top-le-btn-img" src="icons/Global Navigation Button.png" />
                        </button>

                        <Transition name="menu-fade">
                            <div v-if="isMenuOpen" class="txt-dropdown-menu">
                                <div class="menu-item" @click="handleMenuAction('new')">
                                    <img class="menu-item-icon" src="icons/Add1.png"></img>
                                    <span class="menu-item-label">新建文件</span>
                                </div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Favicon.png" />
                                    <span class="menu-item-label">新建窗口</span>
                                </div>
                                <div class="menu-item" @click="handleMenuAction('open')">
                                    <img class="menu-item-icon" src="icons/Open File.png" />
                                    <span class="menu-item-label">打开文件</span>
                                </div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/History.png" />
                                    <span class="menu-item-label">最近文件</span>
                                </div>
                                <div class="menu-item divider"></div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Save.png" />
                                    <span class="menu-item-label">保存</span>
                                </div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Save As.png" />
                                    <span class="menu-item-label">另存为</span>
                                </div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Save Copy.png" />
                                    <span class="menu-item-label">全部保存</span>
                                </div>
                                <div class="menu-item divider"></div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Search1.png" />
                                    <span class="menu-item-label">查找</span>
                                </div>
                                <div class="menu-item">
                                    <img class="menu-item-icon" src="icons/Search1.png" />
                                    <span class="menu-item-label">替换</span>
                                </div>
                                <div class="menu-item divider"></div>
                                <div class="menu-item" @click="handleMenuAction('info')">
                                    <img class="menu-item-icon" src="icons/Setting.png" />
                                    <span class="menu-item-label">设置</span>
                                </div>
                            </div>
                        </Transition>
                    </div>
                    <div class="txt-content-top-middle">
                        <button class="txt-content-top-middle-btn">
                            <span class="txt-content-top-middle-btn-name">H1</span>
                            <img class="txt-content-mid-img" src="icons/Chevron Down.png" />
                        </button>
                        <button class="txt-content-top-middle-btn">
                            <img class="txt-content-mid-img-2" src="icons/Notepad/Bulleted List.png" />
                            <img class="txt-content-mid-img" src="icons/Chevron Down.png" />
                        </button>
                        <button class="txt-content-top-middle-btn-3">
                            <img class="txt-content-mid-img-2" src="icons/Notepad/Bold.png" />
                        </button>
                        <button class="txt-content-top-middle-btn-3">
                            <img class="txt-content-mid-img-2" src="icons/Notepad/Italic.png" />
                        </button>
                        <button class="txt-content-top-middle-btn-3">
                            <img class="txt-content-mid-img-2" src="icons/Notepad/Link.png" />
                        </button>
                    </div>
                    <div class="txt-content-top-right"></div>
                </div>

                <div class="txt-content-view">
                    <textarea class="txt-editor-area" v-model="activeTab.content" placeholder="在此输入文本..."
                        @input="updateCursorInfo" @click="updateCursorInfo" @keyup="updateCursorInfo"></textarea>
                    <div class="txt-content-view-info">
                        <div class="txt-content-view-info-left">{{ activeTab.title }}</div>
                        <div class="txt-content-view-info-right">
                            <div class="status-bar-item">第 {{ cursorPosition.line }} 行，第 {{ cursorPosition.column }} 列
                            </div>
                            <div class="txt-content-view-info-func1">100%</div>
                            <div class="txt-content-view-info-func1">Windows (CRLF)</div>
                            <div class="txt-content-view-info-func1">UTF-8</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </WindowFrame>

    <WindowFrame v-else :window-id="windowId" :is-maximized="isMaximized" title="设置"
        @drag-start="(e) => emit('drag-start', e)">
        <template #header>
            <div class="txt-custom-header-2">
                <div class="txt-top-bar">
                    <div class="top-bar-area">
                        <div class="info-top-header" style="display: flex;  flex: 1;align-items: center;">
                            <button class="info-back-icon-btn" @click="closeInfoPage">
                                <img src="icons/back1.png"
                                    style="width: 14px;height: 14px; transform: rotate(0deg); filter: grayscale(1); opacity: 0.8;" />
                            </button>
                            <span class="info-top-header-info">设置</span>
                        </div>
                    </div>
                </div>

                <WindowControls style="flex-shrink: 0; width: 132px;" :window-id="windowId"
                    :is-maximized="isMaximized" />
            </div>
        </template>

        <div class="page-info-overlay">
            <div class="page-info-overlay-l">
                <span class="page-info-overlay-l-name">设置</span>
                <div class="page-info-overlay-l-container-name">外观</div>
                <div class="page-info-overlay-l-setting-info">
                    <div class="setting-info-left">
                        <div class="setting-info-left-l">
                            <img class="setting-info-left-l-img" src="icons/Light.png" />
                        </div>
                        <div class="setting-info-left-r">
                            <div class="setting-info-left-r-top">更改模式</div>
                            <div class="setting-info-left-r-low">设置应用默认显示的模式</div>
                        </div>
                    </div>
                    <div class="setting-info-right" style="position: relative; overflow: visible;">
                        <div class="notepad-theme-container">
                            <div class="setting-info-right-modle" @click="toggleThemeDropdown">
                                <span class="selected-mode-text">{{ systemStore.theme === 'light' ? '浅色' : '深色'
                                }}</span>
                                <img class="selected-mode-img" src="icons/Chevron Down.png"
                                    :style="{ transform: showThemeDropdown ? 'rotate(180deg)' : 'none' }" />
                            </div>

                            <div v-if="showThemeDropdown" class="win10-dropdown-menu">
                                <div class="dropdown-item" @click="selectTheme('light')">浅色</div>
                                <div class="dropdown-item" @click="selectTheme('dark')">深色</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="page-info-overlay-r"></div>
        </div>
    </WindowFrame>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted,watch } from 'vue';
import WindowFrame from './WindowFrame.vue';
import WindowControls from './WindowControls.vue';
import { useSystemStore } from '../stores/system';

// 接收系统传递的窗口参数
const props = defineProps<{
    windowId: number;
    isMaximized: boolean;
    title?: string;
    content?: string;
}>();

const systemStore = useSystemStore();
const showThemeDropdown = ref(false);
const toggleThemeDropdown = () => {
    showThemeDropdown.value = !showThemeDropdown.value;
};

const selectTheme = (theme: 'light' | 'dark') => {
    systemStore.setTheme(theme);
    showThemeDropdown.value = false;
};

const emit = defineEmits(['drag-start']);

type PageType = 'home' | 'editor';

interface TabInstance {
    id: number;
    title: string;
    content: string;
    type: PageType;
}

// 初始化为首页
const tabs = ref<TabInstance[]>([
    { 
        id: Date.now(), 
        title: props.title || '无标题.txt', 
        content: props.content || '', 
        type: 'editor' 
    }
]);

const activeTabId = ref<number>(tabs.value[0]!.id);

// 监听 props 变化，支持在已打开的记事本中更新内容
watch(() => props.content, (newContent) => {
    if (newContent !== undefined && activeTab.value) {
        activeTab.value.content = newContent;
    }
});
watch(() => props.title, (newTitle) => {
    if (newTitle !== undefined && activeTab.value) {
        activeTab.value.title = newTitle;
    }
});

const activeTab = computed(() => {
    const found = tabs.value.find(t => t.id === activeTabId.value);
    return found || tabs.value[0] || { id: 0, title: '', content: '', type: 'editor' };
});

const cursorPosition = ref({ line: 1, column: 1 });

// 新建文本页面
const addNewTab = () => {
    const newTab: TabInstance = {
        id: Date.now(),
        title: '无标题.txt', 
        content: '',
        type: 'editor'
    };
    tabs.value.push(newTab);
    activeTabId.value = newTab.id;
};

const closeTab = (index: number) => {
    if (tabs.value.length <= 1) return;

    const tabToClose = tabs.value[index];
    if (!tabToClose) return; 

    const closedTabId = tabToClose.id;

    tabs.value.splice(index, 1);

    if (activeTabId.value === closedTabId) {
        const nextIndex = index >= tabs.value.length ? tabs.value.length - 1 : index;
        const nextTab = tabs.value[nextIndex];
        if (nextTab) {
            activeTabId.value = nextTab.id;
        }
    }
};

const closeTabById = (id: number) => {
    const index = tabs.value.findIndex(t => t.id === id);
    if (index !== -1) closeTab(index);
};

const mockOpenFile = () => {
    addNewTab();
};

const getTabIcon = (type: PageType) => {
    if (type === 'home') return '/publicicons/Home.png';
    return '/publicicons/Page.png';
};

// 动态计算标签样式
const getTabStyle = (id: number) => {
    const isActive = activeTabId.value === id;
    return {
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.648)' : 'rgba(255, 255, 255, 0.328)',
        flex: isActive ? '1 0 170px' : '0 1 170px',
        maxWidth: '170px',
        minWidth: isActive ? '100px' : '35px',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        cursor: 'default'
    };
};

// 更新行列信息的逻辑
const updateCursorInfo = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');

    const lastLine = lines[lines.length - 1] || "";

    cursorPosition.value = {
        line: lines.length,
        column: lastLine.length + 1
    };
};

// 模拟打开文件时重置坐标
const mockOpenFileWithReset = () => {
    mockOpenFile();
    cursorPosition.value = { line: 1, column: 1 };
};

const isMenuOpen = ref(false);
const isInfoOpen = ref(false);
const wordWrap = ref(true);

const toggleMenu = (e: Event) => {
    isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
    isMenuOpen.value = false;
};

// 点击外部关闭菜单
const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.txt-content-top-left')) {
        closeMenu();
    }
};

onMounted(() => {
    window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});

// 菜单操作函数
const handleMenuAction = (action: string) => {
    isMenuOpen.value = false;
    if (action === 'new') addNewTab();
    if (action === 'info') isInfoOpen.value = true;
};

const closeInfoPage = () => {
    isInfoOpen.value = false; 
};
</script>

<style scoped>
.txt-custom-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 40px;
    background: rgba(255, 255, 255, 0.700);
    flex-wrap: nowrap;
}
.txt-top-bar {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    justify-content: space-between;
    height: 40px;
    align-items: flex-start;
    width: 100%;
}
.top-bar-area {
    display: flex;
    flex-direction: row;
    height: 40px;
    width: 100%;
    overflow: hidden;
    background-color: #0076d700;
}
.top-label-area {
    display: flex;
    flex-direction: row;
    gap: 4px;
    margin-left: 18px;
}
.top-label-big {
    display: flex;
    position: relative;
    flex-shrink: 1;
    min-width: 35px;
    height: 32px;
    margin-top: 8px;
    transition: all 0.2s ease;
}
.top-label-big:not(.is-active-tab) {
    container-type: inline-size;
}
/* 定位激活状态顶部的绿色线条 */
.top-label-big-active-line {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #027353;
    z-index: 1;
}
.is-active-tab {
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.100);
}
.is-active-tab .top-label-big-active-line {
    display: block;
}
.top-label-big-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}
.top-label-big-span-container {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 4px;
    display: flex;
    align-items: center;
}
.top-label-big-span {
    display: inline-block;
    vertical-align: middle;
    font-size: 13px;
    text-align: center;
    margin-top: 3px;
    padding-left: 7px;
    color: #333;
}
@container (max-width: 140px) {
    .top-label-big:not(.is-active-tab) .top-label-big-closeview-btn {
        display: none;
    }
}
.top-label-big-closeview-btn {
    display: flex;
    width: 24px;
    height: 24px;
    margin-top: 3px;
    margin-right: 3px;
    border: none;
    align-items: center;
    justify-content: center;
    background-color: #ffffff00;
}
.top-label-big-closeview-btn:hover {
    background-color: #ffffffc4;
}
.top-label-big-closeview-btn-img {
    display: flex;
    width: 10px;
    height: 10px;
}
.top-label-big-addbtn {
    width: 24px;
    height: 24px;
    border: none;
    margin-top: 11px;
    background-color: #ffffff00;
}
.top-label-big-addbtn:hover {
    background-color: #ffffff6b;
}
.top-label-big-addbtn-img {
    width: 10px;
    height: 10px;
}


.txt-content {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0);
    display: flex;
    flex-direction: column;
}
.txt-content-top {
    display: flex;
    width: 100%;
    height: 34px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.86);
}
.txt-content-top-left {
    display: flex;
    flex-direction: row;
    gap: 5px;
    margin-left: 5px;
    height: 30px;
    width: 30px;
    align-items: center;
}
.txt-content-top-left {
    position: relative;
}
.txt-content-top-le-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    height: 24px;
    width: 24px;
    background-color: #107c1000;
}
.txt-content-top-le-btn:hover {
    background-color: #a4a4a4;
}
.txt-content-top-le-btn-img {
    display: flex;
    width: 16px;
    height: 16px;
    background-color: #107c1000;
}


.txt-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 170px;
    background-color: rgba(255, 255, 255, 1);
    backdrop-filter: blur(20px);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    padding: 3px;
    display: flex;
    flex-direction: column;
}
.menu-item {
    display: flex;
    align-items: center;
    padding: 1px 8px;
    height: 30px;
    cursor: default;
    user-select: none;
    font-size: 12px;
    color: #000;
}
.menu-item:hover {
    background-color: rgba(219, 219, 219, 0.425);
}
.menu-item.divider {
    height: 1px;
    background-color: #d0d0d0;
    margin: 3px 1px;
    padding: 0;
}
.menu-item-icon {
    width: 14px;
    height: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 8px;
    font-size: 14px;
}
.menu-item-label {
    flex: 1;
    margin-left: 5px;
    font-size: 14px;
}


.txt-content-top-middle {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    height: 34px;
    background-color: #107c1000;
}
.txt-content-top-middle-btn {
    display: flex;
    flex-direction: row;
    width: 36px;
    height: 24px;
    border: none;
    align-items: center;
    gap: 4px;
    background-color: #0076d700;
}
.txt-content-top-middle-btn-3 {
    display: flex;
    flex-direction: row;
    width: auto;
    height: 24px;
    border: none;
    align-items: center;
    gap: 4px;
    background-color: #0076d700;
}
.txt-content-top-middle-btn-name {
    font-size: 14px;
}
.txt-content-top-middle-btn-2 {
    display: flex;
    border: none;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: #0076d700;
}
.txt-content-mid-img {
    display: flex;
    width: 10px;
    height: 10px;
    background-color: rgba(255, 228, 196, 0);
}
.txt-content-mid-img-2 {
    display: flex;
    width: 17px;
    height: 17px;
    height: 17px;
    /* background-color: aqua; */
    align-items: center;
    justify-content: center;
}
.txt-content-mid-img-3 {
    display: flex;
    width: 20px;
    height: 20px;
    /* background-color: aqua; */
    align-items: center;
    justify-content: center;
}
.txt-content-top-right {
    display: flex;
    margin-right: 5px;
}


.txt-content-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 34px);
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.64);
}
.txt-editor-area {
    width: auto;
    height: calc(100% - 30px);
    border: none;
    outline: none;
    resize: none;
    padding: 10px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    background-color: #ffffff98;
    margin-top: 12px;
    margin-left: 12px;
    margin-right: 12px;
}
.txt-content-view-info {
    height: 30px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 12px;
    background-color: #ffffff00;
    font-size: 12px;
}
.txt-content-view-info-left {
    display: flex;
    width: 130px;
    height: 30px;
    font-size: 12px;
    align-items: center;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #0076d700;
}
.txt-content-view-info-right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
    overflow: hidden;
    margin-right: 12px;
}
.status-bar-item {
    display: flex;
    background-color: #0076d700;
    font-size: 12px;
}
.txt-content-view-info-func1 {
    background-color: #107c1000;
    font-size: 12px;
}


.txt-custom-header-2 {
    width: 100%;
    display: flex;
    flex-direction: row;
    height: 40px;
    background: rgba(255, 255, 255, 0.875);
    flex-wrap: nowrap;
}
.info-top-header {
    animation: menuAppear 0.2s ease-out;
}
.info-back-icon-btn {
    justify-content: center;
    border: none;
    background: transparent;
    display: flex;
    padding: 0 12px;
    width: 58px;
    height: 40px;
    cursor: pointer;
    align-items: center
}
.info-back-icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.1) !important;
}
.info-top-header-info {
    font-size: 13px;
    margin-left: 12px;
    color: #333;
}


.page-info-overlay {
    z-index: 10;
    background: rgba(255, 255, 255, 0.875);
    display: flex;
    flex-direction: row;
    position: relative;
    width: 100%;
    height: 100%;
}
.page-info-overlay-l {
    display: flex;
    width: 70%;
    height: 100%;
    background-color: #02735300;
    flex-direction: column;
}
.page-info-overlay-l-name {
    display: flex;
    font-size: 24px;
    margin-top: 20px;
    margin-left: 40px;
}
.page-info-overlay-l-container-name {
    display: flex;
    font-size: 14px;
    margin-top: 15px;
    margin-left: 40px;
}
.page-info-overlay-l-setting-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: auto;
    height: 54px;
    align-items: center;
    background-color: #fafcfc;
    position: relative;
    z-index: 2;
    margin-left: 40px;
    margin-right: 40px;
    margin-top: 10px;
}
.setting-info-left {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 54px;
    background-color: rgba(0, 255, 255, 0);
}
.setting-info-left-l {
    display: flex;
    width: 48px;
    height: 54px;
    align-items: center;
    padding-left: 12px;
    background-color: rgba(214, 218, 127, 0);
}
.setting-info-left-l-img {
    display: flex;
    width: 24px;
    height: 24px;
    align-items: center;
    background-color: #5fb3a900;
}
.setting-info-left-r {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 54px;
    margin-left: 12px;
    background-color: rgba(220, 183, 134, 0);
}
.setting-info-left-r-top {
    display: flex;
    width: 100px;
    height: 27px;
    font-size: 14px;
    padding-top: 8px;
    background-color: rgba(185, 129, 109, 0);
}
.setting-info-left-r-low {
    display: flex;
    width: 1;
    height: 27px;
    font-size: 12px;
    padding-top: 2px;
    color: #0000007b;
    background-color: rgba(223, 134, 134, 0);
    white-space: nowrap;
}
.setting-info-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex-shrink: 0;
    width: 230px;
    height: 54px;
    background-color: rgba(165, 42, 42, 0);
    overflow: visible !important;
}
.notepad-theme-container {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
    margin-right: 20px;
}
.setting-info-right-modle {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    border: 1.5px solid #33333384;
    background-color: #fff;
    height: 24px;
    width: 82px;
    padding: 0 8px;
    cursor: pointer;
    transition: border-color 0.2s;
    box-sizing: border-box;
}
.setting-info-right-modle:hover {
    border-color: #333;
}
.selected-mode-text {
    font-size: 12px;
    color: #333;
    user-select: none;
}
.selected-mode-img {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
}
.win10-dropdown-menu {
    position: absolute;
    top: 30px;
    left: 0;
    width: 100%;
    background: white;
    border: 1.5px solid #33333384;
    z-index: 100;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
}
.dropdown-item {
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.1s;
    color: #333;
}
.dropdown-item:hover {
    background-color: #e5e5e5;
}
.page-info-overlay-r {
    display: flex;
    width: 30%;
    height: 100%;
}
</style>