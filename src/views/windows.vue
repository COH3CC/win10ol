<template>
    <div class="windows-wrapper" :style="globalBrightnessStyle" @dragover.prevent @drop.prevent="handleDrop">
        <!-- 预加载壁纸以防止切换闪烁 -->
        <div style="display: none;">
            <img v-for="wall in systemStore.wallOptions" :key="wall" :src="wall" />
            <img v-for="lock in systemStore.lockOptions" :key="lock" :src="lock" />
        </div>
        <Transition name="lock-to-home">
            <div v-if="isLocked" key="lock-screen" class="lock-view" @click="handleSystemLockScreenClick"
                :style="systemStore.lockScreenStyle" :class="{ 'is-blurred': showLogin }" @contextmenu.prevent
                @selectstart.prevent @dragstart.prevent>
                <div class="lock-content">
                    <Transition name="slide-up" mode="out-in">
                        <div v-if="!showLogin" key="time-view">
                            <div class="lock-time">{{ timeDisplay }}</div>
                            <div class="lock-date">{{ dateDisplayLock }}</div>
                        </div>

                        <div v-else class="login-box" @click.stop key="login-view">
                            <div class="user-avatar">
                                <img src="icons/system/Contact.png" alt="User"></img>
                            </div>
                            <div class="user-name">Admin</div>
                            <button class="login-button" @click="handleSystemLogin">登录</button>
                            <div @click="systemStore.setShowLogin(false)"
                                style="margin-top: 20px; cursor: pointer; font-size: 14px; opacity: 0.7;">
                                返回
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>

            <div v-else key="home-screen" class="home-view" @contextmenu.prevent @selectstart.prevent
                :style="systemStore.desktopStyle">

                <div class="home-view-window" @click="handleOutsideClick" @mousedown="handleOutsideClick"
                    @contextmenu.prevent="handleContextMenu($event, 'desktop')">

                    <div class="desktop-icons" @contextmenu.stop="handleContextMenu($event, 'desktop')"
                        :class="{ 'refreshing-effect': isRefreshing }">
                        <div v-for="(item, index) in (combinedDesktopIcons as any[])" :key="item.id"
                            class="desktop-icon" :style="getIconStyle(item, index)"
                            @contextmenu.stop.prevent="(e) => handleContextMenu(e as MouseEvent, 'icon', item.id)"
                            @mousedown="($event) => startIconDrag(item, $event)"
                            @dblclick="desktopStore.handleDesktopIconDblClick(item)">
                            <img class="desktop-icon-img" :src="item.icon" @dragstart.prevent></img>
                            <div class="desktop-icon-name">
                                <template v-if="menuStore.renamingId === item.id">
                                    <input v-model="menuStore.renameValue" class="rename-input"
                                        @blur="menuStore.finishRename" @keyup.enter="menuStore.finishRename" v-focus />
                                </template>
                                <template v-else>
                                    {{ item.title }}
                                </template>
                            </div>
                        </div>
                    </div>

                    <Teleport to="body">
                        <Transition name="context-menu-fade">
                            <div v-if="menuVisible" class="custom-context-menu"
                                :class="{ 'is-dark': systemStore.theme === 'dark' }" @contextmenu.prevent
                                @selectstart.prevent :style="{
                                    top: menuPosition.y + 'px',
                                    left: menuPosition.x + 'px',
                                    width: menuSize.width + 'px',
                                    height: menuSize.height + 'px',
                                    zIndex: 99999
                                }">
                                <template v-for="(item, index) in currentMenuItems" :key="index">
                                    <div v-if="item.type === 'divider'" class="menu-item divider"></div>

                                    <div v-else class="menu-item" @click="item.action && executeMenuAction(item.action)">
                                        <div class="menu-item-icon" :class="{ 'is-app-icon': item.isApp }">
                                            <img v-if="item.icon" :src="item.icon" alt="" />
                                        </div>
                                        <span class="menu-item-label">{{ item.label }}</span>
                                    </div>
                                </template>
                            </div>
                        </Transition>
                    </Teleport>

                    <TransitionGroup name="window-fade">
                        <div class="app-window" v-for="win in openWindows" :key="win.id" :style="{
                            top: win.top + 'px',
                            left: win.left + 'px',
                            zIndex: win.zIndex,
                            width: win.width + 'px',
                            height: win.height + 'px',
                        }" @click="!menuVisible && systemStore.bringToFront(win.id)"
                            @contextmenu.prevent.stop="(e) => handleWindowContextMenu(e, win)" v-show="!win.isMinimized"
                            :class="{
                                'is-active': win.zIndex === zIndex,
                                'is-maximized': win.isMaximized,
                                'is-dragging': (systemStore as any).dragState?.id === win.id || (systemStore as any).resizeState?.id === win.id
                            }">

                            <component :is="win.component" :window-id="win.id" :is-maximized="win.isMaximized"
                                v-bind="win.props" @drag-start="(e: MouseEvent) => startDrag(win.id, e)" />
                            <div class="window-resizers" v-if="!win.isMaximized">
                                <div class="resizer top" @mousedown.stop="startResize(win.id, 'top', $event)"></div>
                                <div class="resizer bottom" @mousedown.stop="startResize(win.id, 'bottom', $event)"></div>
                                <div class="resizer left" @mousedown.stop="startResize(win.id, 'left', $event)"></div>
                                <div class="resizer right" @mousedown.stop="startResize(win.id, 'right', $event)"></div>
                                <div class="resizer top-left" @mousedown.stop="startResize(win.id, 'top-left', $event)">
                                </div>
                                <div class="resizer top-right" @mousedown.stop="startResize(win.id, 'top-right', $event)">
                                </div>
                                <div class="resizer bottom-left"
                                    @mousedown.stop="startResize(win.id, 'bottom-left', $event)"></div>
                                <div class="resizer bottom-right"
                                    @mousedown.stop="startResize(win.id, 'bottom-right', $event)"></div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

                <div class="start-menu-wrapper">
                    <Transition name="start-menu-anim">
                        <div class="start-menu" v-if="showStartMenu" @click.stop @contextmenu.prevent
                            :class="{ 'is-dark': systemStore.theme === 'dark' }" :style="{
                                width: startMenuWidth + 'px',
                                height: startMenuHeight + 'px',
                                bottom: '0'
                            }">
                            <div style="position: absolute; top: -3px; left: 0; right: 0; height: 3px; cursor: ns-resize; z-index: 100;"
                                @mousedown.stop.prevent="systemStore.startResizeStartMenu('top', $event)"></div>
                            <div style="position: absolute; top: 0; right: -3px; bottom: 0; width: 3px; cursor: ew-resize; z-index: 100;"
                                @mousedown.stop.prevent="systemStore.startResizeStartMenu('right', $event)"></div>
                            <div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; cursor: nesw-resize; z-index: 101;"
                                @mousedown.stop.prevent="systemStore.startResizeStartMenu('top-right', $event)"></div>

                            <div class="start-menu-left" @mouseenter="systemStore.handleLeftMenuMouseEnter"
                                @mouseleave="systemStore.handleLeftMenuMouseLeave">
                                <div class="start-menu-left-top">
                                    <button v-if="topButton" class="star-menu-open-button"
                                        @click.stop="systemStore.executeAction(topButton.actionName)">
                                        <img class="star-menu-open-button-img" :src="topButton.icon" />
                                    </button>
                                </div>

                                <div class="start-menu-left-low">
                                    <button v-for="btn in bottomButtons" :key="btn.id" class="star-menu-open-button"
                                        @click="systemStore.executeAction(btn.actionName)">
                                        <img class="star-menu-open-button-img" :src="btn.icon" />
                                    </button>
                                </div>

                                <div class="sub-menu" v-if="showSubMenu"
                                    @mouseenter="systemStore.handleSubMenuMouseEnter"
                                    @mouseleave="systemStore.handleSubMenuMouseLeave">
                                    <div class="sub-menu-content">
                                        <div class="sub-menu-content-top">
                                            <button v-if="topButton" class="sub-menu-open-button"
                                                @click.stop="systemStore.executeAction(topButton.actionName)">
                                                <img class="sub-menu-open-button-img" :src="topButton.icon">
                                                <div class="sub-menu-open-button-name">{{ topButton.name }}</div>
                                            </button>
                                        </div>

                                        <div class="sub-menu-content-low">
                                            <button v-for="btn in bottomButtons" :key="btn.id"
                                                class="sub-menu-open-button"
                                                @click="systemStore.executeAction(btn.actionName)">
                                                <img class="sub-menu-open-button-img" :src="btn.icon">
                                                <div class="sub-menu-open-button-name">{{ btn.name }}</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="start-menu-middle">
                                <AppList />
                            </div>

                            <div class="start-menu-right">
                                <Tile />
                            </div>
                        </div>
                    </Transition>
                </div>

                <Transition name="taskbar-slide-up" appear>
                    <div v-if="!isLocked" class="home-view-tibar" :class="{ 'is-dark': systemStore.theme === 'dark' }"
                        @contextmenu.prevent="handleContextMenu($event, 'taskbar')">
                        <div class="tibar-left">
                            <button v-for="btn in tibarLeftButtons" :key="btn.id" class="tibar-left-button"
                                :class="[btn.class, { 'is-active': isHovered(btn) }]" @click.stop="systemStore.executeAction(btn.actionName)"
                                @mouseenter="hoveredBtnId = btn.id" @mouseleave="hoveredBtnId = null">
                                <img :src="getTibarLeftBtnIcon(btn)" class="tibar-left-button-picture"
                                    :style="getTibarLeftBtnIconStyle(btn)" />
                            </button>
                        </div>

                        <div class="tibar-middle">
                            <TransitionGroup name="taskbar-item-anim">
                                <button class="tibar-middle-button" v-for="item in taskbarItems"
                                    :key="item.componentName" @click="systemStore.handleTaskbarClick(item)"
                                    @contextmenu.stop="handleContextMenu($event, 'taskbar', item)" :class="{
                                        'taskbar-active': item.state === 'open' && item.id === activeWindowId,
                                        'taskbar-open': item.state === 'open' && item.id !== activeWindowId,
                                        'taskbar-minimized': item.state === 'minimized',
                                        'taskbar-closed': item.state === 'closed'
                                    }">
                                    <img class="tibar-middle-button-img"
                                        :src="systemStore.getAppIcon(item.componentName)" />

                                    <Transition name="line-fade">
                                        <div v-if="item.state === 'open'" class="tibar-middle-button-line"></div>
                                    </Transition>
                                </button>
                            </TransitionGroup>
                        </div>

                        <div class="tibar-right">
                            <template v-for="btn in tibarRightButtons" :key="btn.id">
                                <button v-if="btn.isCustom" :class="btn.class"
                                    @click.stop="systemStore.executeAction(btn.actionName)">
                                    <div class="tibar-right-infoview-box">
                                        <img class="tibar-right-infoview-img" src="icons/system/Wifi.png">
                                        <img class="tibar-right-infoview-img" src="icons/system/Volume 3.png">
                                        <img class="tibar-right-infoview-img" src="icons/system/Battery 10.png">
                                    </div>
                                </button>

                                <div v-else-if="btn.isTime" :class="btn.class"
                                    @click.stop="systemStore.executeAction(btn.actionName)" style="cursor: pointer;">
                                    <div class="tibar-right-time-time">{{ timeDisplay }}</div>
                                    <div class="tibar-right-time-date">{{ dateDisplayTaskbar }}</div>
                                </div>

                                <button v-else :class="btn.class"
                                    @click.stop="systemStore.executeAction(btn.actionName)"
                                    @mouseenter="hoveredBtnId = btn.id" @mouseleave="hoveredBtnId = null">
                                    <img :class="btn.imgClass" :src="getTibarRightBtnIcon(btn)">
                                </button>
                            </template>
                        </div>
                    </div>
                </Transition>

                <div class="taskbar-popups-wrapper">
                    <Transition name="calendar-anim">
                        <div class="info-popup-menu" v-if="showInfoMenu" @click.stop>
                            <InfoMenu />
                        </div>
                    </Transition>

                    <Transition name="calendar-anim">
                        <div class="time-popup-menu" v-if="showTimeMenu" @click.stop>
                            <Calendar />
                        </div>
                    </Transition>

                    <Transition name="calendar-anim">
                        <div class="ai-popup-menu" v-if="showAiMenu" @click.stop>
                            <div class="ai-menu-content">
                                <p style="padding: 20px; color: #666;">AI 助手(小娜)</p>
                                <p style="padding: 20px; color: #666;">开发中...</p>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { storeToRefs } from 'pinia';

import Calendar from '../components/Calendar.vue';
import AppList from '../components/AppList.vue';
import Tile from '../components/Tile.vue';
import InfoMenu from '../components/InfoMenu.vue';

import { useFileSystemStore } from '../stores/fileSystem';
import { useSystemStore, } from '../stores/system';
import { useMenuStore } from '../stores/menu';
import { useDesktopStore } from '../stores/desktop';


const fileStore = useFileSystemStore();
const systemStore = useSystemStore();
const desktopStore = useDesktopStore();
const menuStore = useMenuStore();

const {
    combinedDesktopIcons,
} = storeToRefs(desktopStore);

const {
    isLocked,
    openWindows,
    zIndex,
    activeWindowId,
    showLogin,
    showInfoMenu,
    showTimeMenu,
    showAiMenu,
    showStartMenu,
    showSubMenu,
    tibarLeftButtons,
    tibarRightButtons,
    timeDisplay,
    dateDisplayTaskbar,
    dateDisplayLock,
    startMenuWidth,
    startMenuHeight,
    topButton,
    bottomButtons,
    isRefreshing,
    taskbarItems,
    globalBrightnessStyle
} = storeToRefs(systemStore);

const {
    menuVisible,
    menuPosition,
    currentMenuItems,
    menuSize,
} = storeToRefs(menuStore);

// --- 任务栏左侧按钮 hover 图标 ---
const hoveredBtnId = ref<string | null>(null);
const isHovered = (btn: any) =>
    (btn.id === 'start' && showStartMenu.value) ||
    (btn.id === 'aibtn' && showAiMenu.value) ||
    hoveredBtnId.value === btn.id;

const getTibarLeftBtnIcon = (btn: any) => {
    if (isHovered(btn)) return btn.hoverIcon || btn.icon;
    return btn.icon;
};

const getTibarRightBtnIcon = (btn: any) => {
    if (isHovered(btn)) return btn.hoverIcon || btn.icon;
    if (systemStore.theme === 'dark' && btn.darkIcon) return btn.darkIcon;
    return btn.icon;
};
const getTibarLeftBtnIconStyle = (btn: any) => {
    const size = isHovered(btn)
        ? (btn.hoverIconSize ?? btn.iconSize ?? 18)
        : (btn.iconSize ?? 18);
    return { width: size + 'px', height: size + 'px' };
};

// --- 锁屏逻辑 ---
const handleSystemLockScreenClick = () => {
    systemStore.handleLockScreenClick()
}
const handleSystemLogin = () => {
    systemStore.login();
};

// --- 桌面应用排版与拖拽 ---
const getIconStyle = (item: any, index: number) => {
    return desktopStore.getIconStyle(item, index);
};
const startIconDrag = (item: any, e: MouseEvent) => {
    desktopStore.handleIconDrag(item, e, menuStore.renamingId);
};

// --- 窗口操作 ---
const startDrag = (id: number, e: MouseEvent) => {
    systemStore.startDrag(id, e);
};
const startResize = (id: number, direction: string, e: MouseEvent) => {
    systemStore.startResize(id, direction, e);
};
provide('windowActions', systemStore.windowActions);

const handleOutsideClick = () => {
    systemStore.closeAllPopups();
    menuStore.closeMenu();
};

// --- 右键菜单 ---
const handleContextMenu = (e: MouseEvent, type: 'desktop' | 'icon' | 'taskbar', target?: any) => {
    e.preventDefault();
    e.stopPropagation();
    menuStore.openMenu(e, type, {
        targetId: target,
        taskbarItem: target,
        handleDblClick: desktopStore.handleDesktopIconDblClick,
        combinedIcons: combinedDesktopIcons.value,
        handleTaskbarClick: systemStore.handleTaskbarClick
    });
};

// 应用窗口右键菜单处理：根据应用绑定的菜单类型决定是否打开菜单
const handleWindowContextMenu = (e: MouseEvent, win: any) => {
    if (!win.contextMenuType) {
        // 该应用不支持右键菜单，仅阻止默认行为，不打开任何菜单
        return;
    }
    menuStore.openMenu(e, 'window', {
        windowContextMenuType: win.contextMenuType,
        windowId: win.id,
    });
};
const executeMenuAction = (action: () => void) => {
    menuStore.executeAction(action);
};

// --- 文件拖放处理 ---
const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer?.items) return;

    const items = e.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === 'file') {
            const entry = (item as any).webkitGetAsEntry();
            if (entry) {
                await processEntry(entry, 'desktop');
            }
        }
    }
};

const processEntry = async (entry: any, parentId: string): Promise<void> => {
    if (entry.isFile) {
        await new Promise<void>((resolve) => {
            entry.file((file: File) => {
                fileStore.importFile(file, parentId).finally(resolve);
            });
        });
    } else if (entry.isDirectory) {
        const newFolder = await fileStore.importFolder(entry.name, parentId);
        if (newFolder) {
            const dirReader = entry.createReader();
            const readAllEntries = (): Promise<any[]> => {
                return new Promise((resolve, reject) => {
                    const allEntries: any[] = [];
                    const readBatch = () => {
                        dirReader.readEntries((entries: any[]) => {
                            if (entries.length > 0) {
                                allEntries.push(...entries);
                                readBatch();
                            } else {
                                resolve(allEntries);
                            }
                        }, reject);
                    };
                    readBatch();
                });
            };

            const entries = await readAllEntries();
            for (const childEntry of entries) {
                await processEntry(childEntry, newFolder.id);
            }
        }
    }
};

// --- 自定义指令 ---
const vFocus = { mounted: (el: HTMLInputElement) => el.focus() };

</script>

<style scoped>
/* 页面整体容器 */
.windows-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: rgb(0, 0, 0);
}

/* 锁屏 & 主桌面 通用布局 */
.lock-view,
.home-view {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
}

/* 锁屏 */
.lock-view {
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-family: 'Segoe UI', sans-serif;
    z-index: 1000;
}
.lock-view::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    transition: all 0.5s ease;
    z-index: -1;
}
.lock-view.is-blurred::before {
    filter: blur(20px) brightness(0.8);
    transform: scale(1.1);
}
.lock-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
}
.lock-time {
    font-size: 80px;
    font-weight: 200;
}
.lock-date {
    font-size: 24px;
    margin-bottom: 50px;
}
.login-box {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    padding: 40px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.user-avatar {
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
}
.user-avatar img {
    width: 60px;
    height: 60px;
}
.user-name {
    font-size: 28px;
    margin-bottom: 20px;
}
.login-button {
    padding: 8px 40px;
    background-color: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.3s;
}
.login-button:hover {
    background-color: rgba(255, 255, 255, 0.4);
}
/* 锁屏动画 */
.slide-up-enter-from {
    opacity: 0;
    transform: translateY(30px);
}
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-50px);
}
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s ease-out;
}
/* 锁屏到桌面的切换动画 */
.lock-to-home-enter-active {
    animation: desktop-zoom-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    z-index: 1;
}
.lock-to-home-leave-active {
    transition: opacity 0.8s ease;
    z-index: 1001;
    position: absolute;
    width: 100%;
    height: 100%;
}
.lock-to-home-leave-to {
    opacity: 0;
}
@keyframes desktop-zoom-in {
    0% {
        opacity: 0;
        transform: scale(1.15);
        filter: blur(5px);
    }

    100% {
        opacity: 1;
        transform: scale(1);
        filter: blur(0);
    }
}


/* 主页面 */
.home-view {
    display: flex;
    flex-direction: column;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    user-select: none;
    -webkit-user-select: none;
}
.home-view-window {
    display: flex;
    flex: 1;
    width: 100%;
    z-index: 1;
}

/* 图标 */
.desktop-icons {
    position: relative;
    width: 100%;
    height: 100%;
    animation: icons-fade-in 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 1.2s;
    opacity: 0;
}
@keyframes icons-fade-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.desktop-icon {
    position: absolute;
    width: 80px;
    height: 90px;
    display: flex;
    margin-top: 10px;
    margin-left: 10px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: default;
    transition: background 0.2s;
}
.desktop-icon:hover {
    background-color: rgba(255, 255, 255, 0.2);
}
.desktop-icon-img {
    width: 45px;
    height: 45px;
    margin-top: 8px;
}
.desktop-icon-name {
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    margin-top: 4px;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding: 0 2px;
    min-height: 1.2em;
}
.rename-input {
    width: 90%;
    text-align: center;
    font-size: 12px;
    outline: none;
    border: 1px solid #0078d7;
    background: white;
    color: black;
    padding: 0;
}
/* 刷新效果 */
.refreshing-effect .desktop-icon {
    animation: refresh-blink 0.3s ease-in-out;
}
@keyframes refresh-blink {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}


/* 右键菜单 */
.custom-context-menu {
    position: fixed;
    background: rgba(255, 255, 255, 0.750);
    backdrop-filter: blur(10px);
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    padding: 3px;
    z-index: 9999;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    /* 允许通过 transform 进行动画 */
    transform-origin: top left;
}

/* 右键菜单动画 */
.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
    transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.22, 1, 0.36, 1);
}

.context-menu-fade-enter-from,
.context-menu-fade-leave-to {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
}
.menu-item {
    display: flex;
    align-items: center;
    padding: 4px 5px;
    font-size: 14px;
    height: 30px;
    margin-top: 3px;
    color: #333;
    cursor: default;
    transition: background 0.1s;
    /* background-color: rebeccapurple; */
}
.menu-item-icon {
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
}
.menu-item-icon.is-app-icon {
    /* background-color: rgba(0, 0, 0, 0.05); */
    border-radius: 2px;
}
.menu-item-icon img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}
.menu-item-label {
    flex: 1;
    padding-right: 20px;
}
/* 分隔线 */
.menu-item:not(.divider):hover {
    background-color: rgba(255, 255, 255, 0.750);
}
.menu-item.divider {
    height: 1px;
    background-color: #bbbbbbc2;
    margin-top: 2px;
    margin-left: 10px;
    margin-right: 10px;
    padding: 0;
    cursor: default;
    transition: none;
}
/* 右键菜单深色主题 */
.custom-context-menu.is-dark {
    background: #202020d9;
    color: white;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
}
.custom-context-menu.is-dark .menu-item {
    color: #eee;
}
.custom-context-menu.is-dark .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.custom-context-menu.is-dark .menu-item.divider {
    background-color: rgba(255, 255, 255, 0.15);
}
.custom-context-menu.is-dark .menu-item-icon:not(.is-app-icon) img {
    filter: invert(0.9);
}


/* 应用程序窗口 */
.app-window {
    position: absolute;
    background-color: rgba(255, 255, 255, 0);
    display: flex;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 10;
    /* 添加过渡效果用于最大化和还原 */
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1), z-index 0s;
    overflow: hidden;
}
.app-window.is-dragging {
    /* 拖拽时禁用过渡以保证流畅度 */
    transition: none;
}
.app-window.is-active {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.app-window.is-maximized {
    border: none;
    box-shadow: none;
}

/* 窗口打开/关闭/最小化/还原动画 */
.window-fade-enter-active,
.window-fade-leave-active {
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1) !important;
}

.window-fade-enter-from,
.window-fade-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}

/* 针对最小化到任务栏的特殊处理 */
.window-fade-leave-to {
    transform: scale(0.8) translateY(50px);
}
/* 窗口拖放 */
.resizer {
    position: absolute;
    z-index: 100;
}
.resizer.top {
    top: -5px;
    left: 0;
    width: 100%;
    height: 10px;
    cursor: n-resize;
}
.resizer.bottom {
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 10px;
    cursor: s-resize;
}
.resizer.left {
    top: 0;
    left: -5px;
    width: 10px;
    height: 100%;
    cursor: w-resize;
}
.resizer.right {
    top: 0;
    right: -5px;
    width: 10px;
    height: 100%;
    cursor: e-resize;
}
.resizer.top-left {
    top: -5px;
    left: -5px;
    width: 15px;
    height: 15px;
    cursor: nw-resize;
    z-index: 101;
}
.resizer.top-right {
    top: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    cursor: ne-resize;
    z-index: 101;
}
.resizer.bottom-left {
    bottom: -5px;
    left: -5px;
    width: 15px;
    height: 15px;
    cursor: sw-resize;
    z-index: 101;
}
.resizer.bottom-right {
    bottom: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    cursor: se-resize;
    z-index: 101;
}


/* 开始菜单 */
.start-menu-wrapper {
    position: absolute;
    left: 0;
    bottom: 42px;
    width: 100%;
    height: calc(100% - 42px);
    overflow: hidden;
    pointer-events: none;
    z-index: 9900;
}
.start-menu {
    display: flex;
    position: absolute;
    left: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.60);
    backdrop-filter: blur(20px);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    gap: 5px;
    flex-direction: row;
    overflow: visible;
    pointer-events: auto;
}
/* 开始菜单动画 */
.start-menu-anim-enter-active,
.start-menu-anim-leave-active,
.calendar-anim-enter-active,
.calendar-anim-leave-active {
    transition: all 0.3s cubic-bezier(0.1, 0.9, 0.2, 1);
}
.start-menu-anim-enter-from,
.start-menu-anim-leave-to,
.calendar-anim-enter-from,
.calendar-anim-leave-to {
    transform: translateY(30px);
    opacity: 0;
}
.start-menu-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 48px;
    height: 100%;
}
.start-menu-left-top {
    display: flex;
    flex-direction: column;
    width: 48px;
    height: 100px;
    padding-top: 5px;
    /* background-color: #0078d4; */
}
.star-menu-open-button {
    width: 48px;
    height: 48px;
    border: none;
    background-color: rgba(255, 255, 255, 0);
    color: white;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
}
.star-menu-open-button:hover {
    background-color: rgba(255, 255, 255, 0.394);
}
.star-menu-open-button-img {
    width: 18px;
    height: 18px;
    margin-left: 15px;
}
.start-menu-left-low {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: end;
    /* background-color: #ff4d4d; */
}
/* 开始菜单深色主题 */
.start-menu.is-dark {
    background: rgb(61, 61, 61);
    color: white;
}
.start-menu.is-dark .start-menu-left,
.start-menu.is-dark .start-menu-middle {
    background-color: transparent;
}
.start-menu.is-dark .sub-menu {
    background-color: rgba(30, 30, 30, 0.98);
}
.start-menu.is-dark .star-menu-open-button:hover,
.start-menu.is-dark .sub-menu-open-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.start-menu.is-dark .sub-menu-open-button-name {
    color: white;
}
.start-menu.is-dark .star-menu-open-button-img,
.start-menu.is-dark .sub-menu-open-button-img {
    filter: invert(1);
}
.home-view-tibar.is-dark .tibar-right-infoview-img {
    filter: invert(1);
}


/* 小菜单 */
.sub-menu {
    position: absolute;
    height: 100%;
    bottom: 0;
    width: 200px;
    background-color: rgba(255, 255, 255, 0.976);
    z-index: 30;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.3);
}
.sub-menu-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0);
}
.sub-menu-content-top {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100px;
    margin-top: 5px;
    /* background-color: rgba(255, 255, 255, 0.394); */
}
.sub-menu-open-button {
    width: 100%;
    height: 48px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    background-color: rgba(255, 255, 255, 0);
    display: flex;
    flex-direction: row;
    align-items: center;
}
.sub-menu-open-button-img {
    width: 18px;
    height: 18px;
    margin-left: 15px;
}
.sub-menu-open-button-name {
    margin-left: 15px;
    font-size: 14px;
    display: flex;
    align-items: center;
}
.sub-menu-content-low {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: end;
    /* background-color: cornsilk; */
}


/* 开始菜单应用列表和磁贴区域 */
.start-menu-middle {
    width: 250px;
    height: 100%;
    overflow-y: auto;
}
.start-menu-right {
    flex: 1;
    background-color: transparent;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}


/* 底部任务栏 */
.home-view-tibar {
    display: flex;
    flex-direction: row;
    /* background-color: #d9ede3; */
    background-color: #ffffffd8;
    width: 100%;
    height: 42px;
    align-items: center;
    z-index: 9950;
    position: relative;
}
/* 任务栏左侧按钮 */
.tibar-left {
    display: flex;
    flex-direction: row;
    background-color: rgba(255, 255, 255, 0);
}
.tibar-left-button {
    display: flex;
    width: 48px;
    height: 42px;
    border: none;
    background-color: rgba(255, 255, 255, 0);
    cursor: pointer;
    font-weight: bold;
    align-items: center;
    justify-content: center;
}
.tibar-left-button:hover {
    background-color: rgba(255, 255, 255, 0.615);
}
.tibar-left-button-picture {
    display: block;
    object-fit: contain;
}


/* 任务栏应用 */
.tibar-middle {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex: 1;
    gap: 5px;
    height: 100%;
}
.tibar-middle-button {
    width: 48px;
    height: 42px;
    border: none;
    /* background-color:cornflowerblue; */
    color: black;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    padding: 0;
    background-color: transparent;
    opacity: 0.8;
    transition: background-color 0.2s, opacity 0.2s;
    transition: background-color 0.2s, transform 0.1s active;
}
.tibar-middle-button:hover {
    background-color: rgba(255, 255, 255, 0.615);
    opacity: 1;
}
.tibar-middle-button:active {
    transform: scale(0.9);
}
.tibar-middle-button.taskbar-active {
    background-color: rgba(255, 255, 255, 0.715);
    opacity: 1;
}
.tibar-middle-button.taskbar-open {
    background-color: rgba(255, 255, 255, 0.375);
    opacity: 1;
}
.tibar-middle-button.taskbar-minimized {
    background-color: rgba(255, 255, 255, 0.375);
    opacity: 0.6;
}
.tibar-middle-button-img {
    display: block;
    width: 24px;
    height: 24px;
    /* background-color: #0078d4; */
    margin-top: 9px;
    margin-left: 13px;
}
.tibar-middle-button-line {
    display: flex;
    width: 18px;
    height: 4px;
    /* background-color: #00a8f7; */
    margin-left: 16px;
    margin-top: 5px;
}


/* 任务栏右侧 */
.tibar-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 250px;
    height: 100%;
}
.tibar-right-infoview,
.tibar-right-aibtn {
    display: flex;
    width: 86px;
    height: 42px;
    background-color: rgba(255, 255, 255, 0);
    border: none;
}
.tibar-right-aibtn {
    width: 44px;
}
.tibar-right-aibtn:hover {
    background-color: rgba(255, 255, 255, 0.615);
}
.tibar-right-infoview:hover {
    background-color: rgba(255, 255, 255, 0.615);
}
.tibar-right-infoview-box {
    display: flex;
    flex-direction: row;
    width: 86px;
    height: 18px;
    margin-top: 12px;
}
.tibar-right-infoview-img {
    display: flex;
    width: 18px;
    height: 18px;
    border: none;
    margin-left: 8px;
}
.tibar-right-time {
    display: flex;
    width: 80px;
    height: 42px;
    flex-direction: column;
}
.tibar-right-time:hover {
    background-color: rgba(255, 255, 255, 0.615);
}
.tibar-right-time-date,
.tibar-right-time-time {
    display: flex;
    width: 100%;
    height: 50%;
    justify-content: center;
    font-size: 13px;
    align-items: center;
}
.tibar-right-aibtn-img {
    display: flex;
    width: 18px;
    height: 18px;
    margin-top: 12px;
    margin-left: 13px;
    /* background-color: #0078d4; */
}


/* 任务栏功能菜单 */
.taskbar-popups-wrapper {
    position: absolute;
    left: 0;
    bottom: 42px;
    width: 100%;
    height: calc(100% - 42px);
    overflow: hidden;
    pointer-events: none;
    z-index: 9940;
}
.taskbar-popups-wrapper>* {
    pointer-events: auto;
}
.info-popup-menu {
    width: 330px;
    height: 460px;
    margin-right: 0;
    margin-bottom: 0;
}
.time-popup-menu {
    width: 360px;
    height: auto;
    margin-right: 0;
    border: none;
    background: transparent;
    box-shadow: none;
}
.info-popup-menu,
.time-popup-menu {
    position: absolute;
    bottom: 0;
    right: 0;
    /* background-color: rgba(255, 255, 255, 0.435); */
    backdrop-filter: blur(10px);
    color: white;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    z-index: 25;
    display: flex;
    flex-direction: column;
}
.ai-popup-menu {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 250px;
    height: 500px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 50;
    /* border-top-left-radius: 8px; */
    display: flex;
    flex-direction: column;
}
.ai-menu-content {
    width: 100%;
    height: 100%;
}
/* 任务栏项进入/离开动画 */
.taskbar-item-anim-enter-active,
.taskbar-item-anim-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.taskbar-item-anim-enter-from,
.taskbar-item-anim-leave-to {
    opacity: 0;
}
/* 底部蓝色选中条的切换动画 */
.line-fade-enter-active,
.line-fade-leave-active {
    transition: all 0.2s ease;
}
.line-fade-enter-from,
.line-fade-leave-to {
    opacity: 0;
    transform: scaleX(0);
}
/* 任务栏平滑上移动画 */
.taskbar-slide-up-enter-active {
    transition: transform 1.0s cubic-bezier(0.22, 1, 0.36, 1),
        opacity 1.0s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: 1.2s;
}
.taskbar-slide-up-enter-from {
    transform: translateY(60px);
    opacity: 0;
}
.taskbar-slide-up-enter-to {
    transform: translateY(0);
    opacity: 1;
}
/* 任务栏深色主题 */
.home-view-tibar.is-dark {
    background-color: #232120;
    color: white;
}
.home-view-tibar.is-dark .tibar-left-button:hover,
.home-view-tibar.is-dark .tibar-middle-button:hover,
.home-view-tibar.is-dark .tibar-right-infoview:hover,
.home-view-tibar.is-dark .tibar-right-aibtn:hover,
.home-view-tibar.is-dark .tibar-right-time:hover {
    background-color: rgba(255, 255, 255, 0.15);
}
.home-view-tibar.is-dark .tibar-left-button:not(.is-active) .tibar-left-button-picture {
    filter: brightness(0) invert(1);
}
.home-view-tibar.is-dark .tibar-middle-button {
    color: white;
}
.home-view-tibar.is-dark .tibar-middle-button.taskbar-active {
    background-color: rgba(255, 255, 255, 0.2);
}
.home-view-tibar.is-dark .tibar-middle-button.taskbar-open {
    background-color: rgba(255, 255, 255, 0.1);
}
.home-view-tibar.is-dark .tibar-middle-button.taskbar-minimized {
    background-color: rgba(255, 255, 255, 0.05);
}
.home-view-tibar.is-dark .tibar-right-time-time,
.home-view-tibar.is-dark .tibar-right-time-date {
    color: white;
}
</style>