<template>
    <WindowFrame :window-id="windowId" :is-maximized="isMaximized" @drag-start="onDragStart" @drop.stop.prevent @dragover.stop.prevent>
        <template #header>
            <div class="explorer-custom-header" :class="{ 'dark-theme': systemStore.theme === 'dark' }"
                :style="{ backgroundColor: systemStore.theme === 'dark' ? '#1f1f1f' : '' }">
                <div class="explorer-top-bar"
                    :style="{ backgroundColor: systemStore.theme === 'dark' ? 'transparent' : '' }">
                    <div class="top-bar-area-line"></div>
                    <div class="top-bar-area">
                        <div class="top-label-line"></div>
                        <div class="top-label-area"
                            style="flex: 1; min-width: 0; overflow: hidden; padding-right: 10px; display: flex; flex-wrap: nowrap;">
                            <div v-for="(tab, index) in store.tabs" :key="tab.id" class="top-label-big"
                                :class="{ 'is-active-tab': store.activeTabId === tab.id }"
                                :style="[store.getTabStyle(tab.id), systemStore.theme === 'dark' && store.activeTabId === tab.id ? { backgroundColor: '#414040' } : {}]"
                                @click="store.setActiveTab(tab.id)">
                                <div class="top-label-big-left">
                                    <img class="top-label-big-img" :src="store.getTabIcon(tab)"></img>
                                    <div class="top-label-big-span-container">
                                        <span class="top-label-big-span">{{ store.getTabName(tab) }}</span>
                                    </div>
                                </div>
                                <button class="top-label-big-closeview-btn" @click.stop="store.closeTab(index)">
                                    <img class="top-label-big-closeview-btn-img" src="icons/Cancel.png"></img>
                                </button>
                            </div>

                            <button class="top-label-big-addbtn" @click="store.addNewTab" style="flex-shrink: 0;">
                                <img class="top-label-big-addbtn-img" src="/publicicons/Add.png"></img>
                            </button>
                        </div>
                    </div>
                </div>
                <WindowControls
                    :style="{ flexShrink: 0, width: '132px', backgroundColor: systemStore.theme === 'dark' ? 'transparent' : 'rgba(255, 255, 255, 0.74)' }"
                    :window-id="windowId" :is-maximized="isMaximized" />
            </div>
        </template>

        <div class="explorer-body" :class="{ 'dark-theme': systemStore.theme === 'dark' }">
            <div class="toolbar" :class="{ 'dark-theme': systemStore.theme === 'dark' }">
                <div class="toolbar-left">
                    <button v-for="btn in store.navigationButtons" :key="btn.name" class="toolbar-left-button"
                        :title="btn.title" :disabled="btn.disabled" @click="btn.handler">
                        <img class="toolbar-left-button-img" :src="btn.icon" :alt="btn.title" />
                    </button>
                    <div class="content-view-top-left-stop">
                        <img class="content-view-top-left-stop-img" src="icons/file-explorer/buttonicon/picture.png">
                    </div>
                </div>
                <div class="toolbar-middle" ref="addressBarRef" @click.self="store.startEditingPath">
                    <img class="toolbar-middle-img" :src="store.getFileIcon(store.currentNode)"
                        @click="store.startEditingPath"></img>
                    <img class="toolbar-middle-span-img-2" src="icons/Chevron Right1.png"
                        @click="store.startEditingPath"></img>

                    <div class="toolbar-middle-address"
                        @click.self="store.startEditingPath">
                        <template v-if="!uiState.addressBar.isEditing">
                            <template v-for="(crumb, index) in store.breadcrumbs" :key="crumb.id">
                                <span class="toolbar-middle-span" v-if="index > 0">
                                    <img class="toolbar-middle-span-img" src="icons/Chevron Right1.png"></img>
                                </span>
                                <span class="toolbar-middle-add-name" @click.stop="store.navigateTo(crumb.id)"
                                    style="cursor: pointer; width: auto; padding: 0 8px;">
                                    {{ crumb.name }}
                                </span>
                            </template>
                            <div style="flex: 1; height: 100%; cursor: text;" @click.stop="store.startEditingPath">
                            </div>
                        </template>

                        <input v-else v-model="uiState.addressBar.inputValue" class="path-edit-input"
                            @keyup.enter="store.submitPath" @keyup.esc="store.cancelEditingPath" v-focus
                            style="width: 100%; height: 26px; border: none; outline: none; font-size: 12px; padding-left: 5px;" />
                    </div>
                </div>
                <div class="toolbar-right">
                    <button class="toolbar-right-search">
                        <img class="toolbar-right-search-img"
                            src="icons/file-explorer/navigaticon/Search.png"></img>
                    </button>
                </div>
            </div>

            <div class="main-view">
                <div class="sidebar">
                    <div class="sidebar-container">
                        <div class="sidebar-container-top" @click="store.navigateTo('home')"
                            :class="{ 'is-active': store.isNodeActive('home') }">
                            <div v-if="activeTab.currentPathId === 'home'" class="sidebar-container-top-line"></div>
                            <img class="sidebar-container-top-img" src="icons/Home1.png"></img>
                            <div class="sidebar-container-top-name">主页</div>
                        </div>

                        <div class="sidebar-container-below">
                            <template v-for="(group, index) in store.sidebarGroups" :key="group.id">
                                <div class="sidebar-container-middle">
                                    <div class="sidebar-container-middle-tpn">{{ group.title }}</div>
                                </div>

                                <div class="sidebar-container-below-tab" v-for="item in group.items" :key="item.id"
                                    :class="{ 'is-active': store.isNodeActive(item.id) }"
                                    @click="store.navigateTo(item.id)">
                                    <div v-if="store.isNodeActive(item.id)" class="sidebar-container-top-line"></div>
                                    <img class="sidebar-container-below-tab-img" :src="store.getFileIcon(item)"></img>
                                    <div class="sidebar-container-below-tab-name">{{ item.name }}</div>
                                    <img class="sidebar-container-below-tab-img2" src="icons/005.png"></img>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="content-view">
                    <div class="content-view-top">
                        <div class="content-view-top-left">
                            <div :class="store.newButton?.class">
                                <button class="content-view-top-left-button" @click="store.newButton?.handler">
                                    <img class="content-view-top-left-button-img1" :src="store.newButton?.icon" />
                                    <div class="content-view-top-left-button-name">{{ store.newButton?.title }}</div>
                                </button>
                                <img class="content-view-top-left-button-img2" src="icons/Chevron Down.png" />
                            </div>
                            <div class="content-view-top-left-stop">
                                <img class="content-view-top-left-stop-img"
                                    src="icons/file-explorer/buttonicon/picture.png">
                            </div>
                            <div class="content-view-top-left-2">
                                <button v-for="btn in store.toolbarActionButtons" :key="btn.name"
                                    class="content-view-top-left-2-button" :title="btn.title" :style="btn.style"
                                    @click.stop="btn.handler">
                                    <img class="content-view-top-left-2-button-img" :src="btn.icon" />
                                </button>
                            </div>
                            <div class="content-view-top-left-stop">
                                <img class="content-view-top-left-stop-img"
                                    src="icons/file-explorer/buttonicon/picture.png">
                            </div>
                            <template v-for="(btn, index) in store.toolbarDropdownButtons.slice(1)" :key="btn.id">
                                <div :class="btn.class" style="position: relative;">
                                    <button class="content-view-top-left-button" @click="btn.handler">
                                        <img class="content-view-top-left-button-img1" :src="btn.icon"></img>
                                        <div class="content-view-top-left-button-name">{{ btn.title }}</div>
                                    </button>
                                    <img src="icons/Chevron Down.png"
                                        class="content-view-top-left-button-img2"></img>

                                    <div v-if="uiState.openMenu === btn.menuKey" class="view-popup-menu">
                                        <button v-for="item in btn.subItems" :key="item.label" class="view-menu-item"
                                            @click="item.action">
                                            <span class="view-menu-item-text">{{ item.label }}</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="content-view-top-left-stop-2"></div>
                            </template>
                        </div>
                        <div class="content-view-top-right">
                            <div class="content-view-top-right-name">详细信息</div>
                        </div>
                    </div>

                    <div class="content-view-view" @dragover.stop.prevent @dragenter.stop.prevent @dragleave.stop.prevent @drop.stop.prevent="handleDrop">
                        <template v-if="store.isNodeActive('home')">
                            <template v-for="group in store.homeViewGroups" :key="group.id">
                                <div class="content-view-view-top">
                                    <button class="content-view-view-top-btn" @click="toggleGroup(group.id)">
                                        <div class="content-view-view-top-name">{{ group.title }}</div>
                                    </button>
                                    <img src="icons/Chevron Left.png" class="content-view-view-top-img"
                                        :style="{ transform: uiState.collapsedGroups.has(group.id) ? 'rotate(-90deg)' : 'rotate(0deg)' }"></img>
                                </div>

                                <div class="content-view-view-file-area"
                                    :class="{ 'collapsed-area': uiState.collapsedGroups.has(group.id) }">
                                    <div class="content-view-view-file-area-file" v-for="file in group.items"
                                        :key="file.id"
                                        :class="{ 'is-selected': store.selectionState.selectedItemId === file.id }"
                                        @click="handleItemClick(file)" @dblclick="handleItemDbClick(file)">
                                        <img class="content-view-view-file-area-file-left"
                                            :src="getFileIcon(file)"></img>
                                        <div class="content-view-view-file-area-file-middle">
                                            <template v-if="store.renameState.editingNodeId === file.id">
                                                <input v-model="store.renameState.inputValue" class="rename-input"
                                                    @keyup.enter="confirmRename" @blur="confirmRename" v-focus
                                                    @click.stop />
                                            </template>

                                            <template v-else>
                                                <div class="content-view-view-file-area-file-middle-name">{{ file.name
                                                }}</div>
                                                <div class="content-view-view-file-area-file-middle-path">{{
                                                    store.getDisplayPath(file) }}</div>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </template>

                        <div v-else class="page-two-container" @contextmenu.self="store.handleContextMenu($event)">
                            <div class="page-two-container-view" :class="{
                                'is-details-mode': uiState.viewMode === 'details',
                                'is-tiles-mode': uiState.viewMode === 'largeIcons'
                            }" @contextmenu="store.handleContextMenu($event)">
                                <div v-if="uiState.viewMode === 'details'" class="view-mode-details-wrapper">
                                    <div class="dv-header">
                                        <div class="dv-header-spacer"></div>
                                        <div class="dv-col-name">名称</div>
                                        <div class="dv-col-date">修改日期</div>
                                        <div class="dv-col-type">类型</div>
                                    </div>

                                    <template v-if="store.sortedCurrentChildren.length > 0">
                                        <div class="dv-row-item" v-for="file in store.sortedCurrentChildren"
                                            :key="'det-' + file.id"
                                            :class="{ 'is-selected': store.selectionState.selectedItemId === file.id }"
                                            @click="handleItemClick(file)" @dblclick="handleItemDbClick(file)"
                                            @contextmenu="store.handleContextMenu($event, file)">
                                            <img class="dv-row-icon" :src="getFileIcon(file)"></img>
                                            <div class="dv-row-name-area">
                                                <input v-if="store.renameState.editingNodeId === file.id"
                                                    v-model="store.renameState.inputValue" class="dv-rename-input"
                                                    @keyup.enter="confirmRename" @blur="confirmRename" v-focus
                                                    @click.stop />
                                                <div v-else class="dv-row-name-text">{{ file.name }}</div>
                                            </div>
                                            <div class="dv-col-date-val">{{ file.updatedAt || '2026/3/9 21:00' }}</div>
                                            <div class="dv-col-type-val">{{ store.getFileDisplayType(file) }}</div>
                                        </div>
                                    </template>

                                    <div v-else class="empty-folder-hint">此文件夹为空</div>
                                </div>

                                <div v-else class="view-mode-tiles-wrapper">
                                    <template v-if="store.sortedCurrentChildren.length > 0">
                                        <div class="tv-item" v-for="file in store.sortedCurrentChildren"
                                            :key="'tile-' + file.id"
                                            :class="{ 'is-selected': store.selectionState.selectedItemId === file.id }"
                                            @click="handleItemClick(file)" @dblclick="handleItemDbClick(file)"
                                            @contextmenu="store.handleContextMenu($event, file)">
                                            <img class="tv-item-icon" :src="getTileIcon(file)"></img>
                                            <div class="tv-item-info">
                                                <div class="tv-item-name-row">
                                                    <input v-if="store.renameState.editingNodeId === file.id"
                                                        v-model="store.renameState.inputValue" class="tv-rename-input"
                                                        @keyup.enter="confirmRename" @blur="confirmRename" v-focus
                                                        @click.stop />
                                                    <div v-else class="tv-item-name-text">{{ file.name }}</div>
                                                </div>
                                                <div class="tv-item-desc-row">{{ store.getFileDisplayType(file) }}</div>
                                            </div>
                                            <img v-if="file.type !== 'file' && file.type !== 'app'"
                                                class="tv-item-arrow" src="icons/005.png"></img>
                                        </div>
                                    </template>
                                    <div v-else class="empty-folder-hint">此文件夹为空</div>
                                </div>
                            </div>
                        </div>

                        <Teleport to="body">
                            <Transition name="context-menu-fade">
                                <div v-if="store.contextMenuState.show" class="custom-context-menu"
                                    :class="{ 'dark-theme': systemStore.theme === 'dark' }"
                                    :style="{ top: store.contextMenuState.y + 'px', left: store.contextMenuState.x + 'px' }">
                                    <template v-for="(item, index) in store.activeMenuOptions" :key="index">
                                        <div v-if="item.isDivider" class="menu-item divider"></div>
                                        <div v-else class="menu-item" :class="{ 'disabled': item.disabled }"
                                            :style="item.style"
                                            @click="(!item.disabled && item.action) ? store.handleMenuAction(item.action, handleItemDbClick) : null">
                                            <div class="menu-item-icon" :class="{ 'is-app-icon': item.isApp }">
                                                <img v-if="item.icon" :src="item.icon" />
                                            </div>
                                            <span class="menu-item-label">{{ item.label }}</span>
                                        </div>
                                    </template>
                                </div>
                            </Transition>
                        </Teleport>
                    </div>
                </div>
            </div>
        </div>
    </WindowFrame>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import WindowFrame from './WindowFrame.vue';
import WindowControls from './WindowControls.vue';
import { useFileSystemStore, type FileSystemNode } from '../stores/fileSystem';
import { useSystemStore } from '../stores/system';
import { storeToRefs } from 'pinia';

const store = useFileSystemStore();
const systemStore = useSystemStore();
const { uiState,
    activeTab,

} = storeToRefs(store);
const props = defineProps<{
    windowId: number;
    isMaximized: boolean;
    initialPathId?: string;
}>();
const emit = defineEmits(['drag-start']);
const onDragStart = (e: MouseEvent) => {
    emit('drag-start', e);
};
const getFileIcon = store.getFileIcon;

// 获取平铺视图图标（区分空文件夹和非空文件夹）
const getTileIcon = (file: FileSystemNode) => {
    const icon = getFileIcon(file);
    // 只有当图标是默认空文件夹图标，且文件夹内有内容时，才替换为非空文件夹图标
    // 这样可以保留特殊文件夹（如下载、文档等）的自定义图标
    if (icon.includes('emptyfile.png') && file.children && file.children.length > 0) {
        return 'icons/file-explorer/fileicon/162.png';
    }
    return icon;
};

const addressBarRef = ref<HTMLElement | null>(null);
const handleClickOutsideEnhanced = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // 处理地址栏失去焦点：点击非地址栏区域时提交路径
    if (uiState.value.addressBar.isEditing && addressBarRef.value && !addressBarRef.value.contains(target)) {
        store.submitPath();
    }

    // 处理菜单关闭
    if (uiState.value.openMenu) {
        const menuClassMap = { sort: 'top-left-3', view: 'top-left-4', more: 'top-left-5' };
        const activeClass = menuClassMap[uiState.value.openMenu as keyof typeof menuClassMap];
        const btn = document.querySelector(`.content-view-top-left-${activeClass}`);
        if (btn && !btn.contains(target)) {
            store.setOpenMenu(null);
        }
    }

    // 重命名输入框处理
    if (store.renameState.editingNodeId) {
        const inputEl = document.querySelector('.rename-input, .dv-rename-input, .tv-rename-input');
        if (inputEl && !inputEl.contains(target)) {
            store.submitRename();
        }
    }

    // 空白处点击取消选中 & 关闭右键菜单 
    const isFileItem = target.closest('.content-view-view-file-area-file, .dv-row-item, .tv-item');
    const isToolbar = target.closest('.content-view-top');
    const isContextMenu = target.closest('.custom-context-menu');
    if (!isFileItem && !isToolbar && !isContextMenu) {
        store.setSelection(null);
    }
    if (!isContextMenu) {
        store.closeContextMenu();
    }
};
const vFocus = {
    mounted: (el: HTMLElement) => el.focus()
};

// 拖拽上传
const handleDrop = async (event: DragEvent) => {
    const items = event.dataTransfer?.items;
    if (!items) return;

    const currentPathId = activeTab.value.currentPathId;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                processEntry(entry, currentPathId);
            }
        }
    }
};

const processEntry = async (entry: any, parentId: string) => {
    if (entry.isFile) {
        await new Promise<void>((resolve) => {
            entry.file((file: File) => {
                store.importFile(file, parentId).finally(resolve);
            });
        });
    } else if (entry.isDirectory) {
        const newFolder = await store.importFolder(entry.name, parentId);
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



//文件视图
const handleItemClick = (item: FileSystemNode) => {
    store.setSelection(item.id);
};
const handleItemDbClick = (item: FileSystemNode) => {
    if (item.type === 'folder' || item.type === 'drive') {
        store.navigateTo(item.id);
    } else if (item.type === 'app') {
        // 如果是应用类型，根据其 id 打开对应窗口 (id 与 APP_IDS 对应)
        systemStore.openWindow(item.id as any, item.name);
    } else if (item.type === 'file') {
        if (item.name.toLowerCase().endsWith('.txt')) {
            systemStore.openWindow('Txtreader', item.name, {
                title: item.name,
                content: item.content || ""
            });
        } else {
            console.log('Open:', item.name);
        }
    } else {
        console.log('Open:', item.name);
    }
};
const toggleGroup = (groupId: string) => {
    store.toggleGroupCollapse(groupId);
};
const confirmRename = () => {
    store.submitRename();
};

// 监听 props 变化，支持外部导航
onMounted(() => {
    document.addEventListener('mousedown', handleClickOutsideEnhanced);
    if (props.initialPathId) {
        store.navigateTo(props.initialPathId);
    }
    store.loadUserFiles();
});
onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutsideEnhanced);
});
watch(() => props.initialPathId, (newId) => {
    if (newId) store.navigateTo(newId);
});


</script>

<style scoped>
.explorer-custom-header {
    background-color: rgba(255, 255, 255, 0);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    flex-wrap: nowrap;
    background-color: #197aca00;
}
.explorer-top-bar {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    justify-content: space-between;
    height: 40px;
    align-items: flex-start;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.74);
}
:deep(.window-controls) {
    flex-shrink: 0 !important;
    width: 132px;
    z-index: 10;
    /* background-color: #1979ca;  */
}


.top-bar-area-line {
    display: flex;
    width: 100%;
    height: 10px;
}
.top-bar-area {
    display: flex;
    flex-direction: row;
    height: 30px;
    width: 100%;
    align-items: flex-end;
    overflow: hidden;
}
.top-label-line {
    width: 18px;
    height: 30px;
}
.top-label-area {
    display: flex;
    flex-direction: row;
    gap: 4px;
}
.top-label-big {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 1;
    min-width: 35px;
    transition: all 0.2s ease;
}
.is-active-tab {
    flex-shrink: 0;
}
.top-label-big:not(.is-active-tab) {
    container-type: inline-size;
}
.top-label-big-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}
.top-label-big-img {
    display: flex;
    height: 18px;
    width: 18px;
    margin-top: 0px;
    margin-left: 10px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
}
.top-label-big-span-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 4px;
}
.top-label-big-span {
    font-size: 14px;
    text-align: left;
    margin-top: 0px;
    padding-left: 7px;
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
    margin-top: 0px;
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
    border: none;
    align-items: center;
    justify-content: center;
}
.top-label-big-addbtn {
    width: 24px;
    height: 24px;
    border: none;
    margin-top: 0px;
    margin-left: 0px;
    background-color: #ffffff00;
}
.top-label-big-addbtn:hover {
    background-color: #ffffff6b;
}
.top-label-big-addbtn-img {
    width: 10px;
    height: 10px;
    border: none;
}


.explorer-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    /* background-color: rgba(255, 255, 255, 0.675); */
}
.toolbar {
    display: flex;
    flex-direction: row;
    height: 42px;
    background-color: rgba(255, 255, 255, 0.900);
    /* border-bottom: 1px solid #d9d9d9; */
    align-items: center;
}
.toolbar-left {
    display: flex;
    flex-direction: row;
    height: 42px;
    width: auto;
    background-color: rgba(255, 255, 255, 0);
    align-items: center;
    justify-content: flex-start;
    padding: 6px 6px;
    gap: 6px;
}
.toolbar-left-button {
    height: 30px;
    width: 30px;
    border: none;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0);
}
.toolbar-left-button:hover {
    background-color: rgba(255, 255, 255, 0.648);
}
.toolbar-left-button-img {
    height: 14px;
    width: 14px;
    border: none;
    margin-top: 6px;
}

.toolbar-middle {
    display: flex;
    flex-direction: row;
    flex: 1;
    height: 42px;
    background-color: rgba(255, 255, 255, 0);
    overflow: hidden;
}
.toolbar-middle-img {
    display: flex;
    width: 18px;
    height: 18px;
    border: none;
    /* background-color: blueviolet; */
    margin-top: 12px;
}
.toolbar-middle-span-img-2 {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    margin-top: 16px;
    margin-left: 5px;
}
.toolbar-middle-address {
    width: 100%; 
    display: flex; 
    align-items: center; 
    height: 100%;
}
.toolbar-middle-span {
    display: flex;
    align-items: center;
    justify-content: center;
    /* background-color: aqua; */
    width: 15px;
    height: 30px;
    flex-shrink: 0;
}
.toolbar-middle-span-img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
}
.toolbar-middle-add-name {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: rgba(255, 255, 255, 0);
    font-size: 12px;
    flex-shrink: 0;
    margin-left: 3px;
}
.toolbar-middle-add-name:hover {
    background-color: #91919195;
}
.path-edit-input {
    background: transparent;
    color: rgb(0, 0, 0);
}

.toolbar-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    height: 42px;
    width: 50px;
    padding-top: 6px;
    padding-right: 6px;
    /* background-color: rgba(255, 255, 255, 0.648); */
}
.toolbar-right-search {
    display: flex;
    height: 30px;
    width: 30px;
    border: none;
    background-color: #ffffff00;
}
.toolbar-right-search-img {
    display: flex;
    height: 14px;
    width: 14px;
    border: none;
    margin-top: 8px;
    margin-left: 8px;
}


.main-view {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-width: 0;
}

.sidebar {
    width: 200px;
    min-width: 200px;
    background-color: rgba(255, 255, 255, 0.7);
    /* border-right: 1px solid #f0f0f0; */
    padding: 8px 15px;
    overflow-x: hidden;
    flex-shrink: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.sidebar-container {
    display: flex;
    flex-direction: column;
    width: 170px;
    height: 100%;
    /* background-color: chocolate; */
}
.sidebar-container-top {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 170px;
    height: 30px;
    flex-shrink: 0;
    /* background-color: #3cda90; */
}
.sidebar-container-top:hover {
    background-color: #ffffff87;
}
.sidebar-container-top.is-active,
.sidebar-container-below-tab.is-active {
    background-color: rgba(255, 255, 255, 0.648) !important;
}
.sidebar-container-top,
.sidebar-container-below-tab {
    cursor: pointer;
    position: relative;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
}
.sidebar-container-top-line {
    display: flex;
    width: 4px;
    height: 18px;
    background-color: #068b64;
    position: absolute;
    left: 0;
}
.sidebar-container-top-img {
    display: flex;
    height: 18px;
    width: 18px;
    margin-top: 0px;
    margin-left: 10px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
}
.sidebar-container-top-img,
.sidebar-container-below-tab-img {
    margin-left: 12px;
}
.sidebar-container-top-name {
    font-size: 14px;
    text-align: center;
    padding-left: 7px;
}
.sidebar-container-below {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 80%;
    /* background-color: deeppink; */
    gap: 4px;
    margin-top: 5px;
}
.sidebar-container-middle {
    display: flex;
    width: 170px;
    height: 30px;
    flex-shrink: 0;
    /* background-color: #3c9bda; */
    font-size: 14px;
}
.sidebar-container-middle-tpn {
    font-size: 13px;
    text-align: center;
    margin-top: 5px;
    padding-left: 8px;
}
.sidebar-container-below-tab {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 170px;
    height: 30px;
    flex-shrink: 0;
    /* background-color: #3eebc6; */
    padding-right: 5px;
    box-sizing: border-box;
}
.sidebar-container-below-tab:hover {
    background-color: rgba(255, 255, 255, 0.520);
}
.sidebar-container-below-tab-img {
    display: flex;
    height: 24px;
    width: 24px;
    margin-top: 3px;
    margin-left: 10px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
}
.sidebar-container-below-tab-name {
    font-size: 14px;
    text-align: center;
    margin-top: 0px;
    padding-left: 7px;
}
.sidebar-container-below-tab-img2 {
    display: flex;
    width: 24px;
    height: 24px;
    margin-left: auto;
}


.content-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    /* background-color: rgba(255, 255, 255, 0.459); */
    min-width: 0;
}
.content-view-top {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 38px;
    justify-content: space-between;
    background-color: rgba(247, 247, 247, 0.88);
    overflow: visible !important;
    min-width: 0;
    box-shadow: 0 4px 6px -2px rgba(176, 176, 176, 0.2);
}

.content-view-top-left {
    display: flex;
    flex-direction: row;
    height: 38px;
    width: 582px;
    /* background-color: rgb(12, 76, 203); */
    flex-shrink: 0;
    overflow: visible !important;
}
.content-view-top-left-button {
    display: flex;
    flex-direction: row;
    width: 64px;
    height: 28px;
    border: none;
    margin-top: 5px;
    margin-left: 8px;
    background-color: #ffffff00;
}
.content-view-top-left-button:hover {
    background-color: rgba(255, 255, 255, 0.648);
}
.content-view-top-left-button-img1 {
    display: flex;
    height: 18px;
    width: 18px;
    margin-top: 5px;
    margin-left: 5px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
    /* background-color: darkkhaki; */
}
.content-view-top-left-button-name {
    text-align: center;
    margin-top: 3px;
    padding-left: 5px;
}
.content-view-top-left-button-img2 {
    display: flex;
    height: 12px;
    width: 12px;
    margin-top: 13px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
    /* background-color: darkkhaki; */
}
.content-view-top-left-stop {
    display: flex;
    width: 8px;
    height: 38px;
    justify-content: center;
    align-items: center;
    /* background-color: rgba(255, 255, 255, 0.675); */
}
.content-view-top-left-stop-img {
    display: flex;
    width: 1px;
    height: 16px;
}
.content-view-top-left-2 {
    display: flex;
    flex-direction: row;
    height: 38px;
    width: 168px;
    /* background-color: rgb(226, 103, 16); */
}
.content-view-top-left-2-button {
    display: flex;
    width: 24px;
    height: 24px;
    border: none;
    margin-left: 8px;
    margin-top: 7px;
    background-color: #ffffff00;
}
.content-view-top-left-2-button:hover {
    background-color: rgba(255, 255, 255, 0.648);
}
.content-view-top-left-2-button-img {
    display: flex;
    width: 18px;
    height: 18px;
    border: none;
    margin-left: 3px;
    margin-top: 3px;
}
.view-popup-menu {
    position: absolute;
    top: 38px;
    left: 0px;
    z-index: 9999;
    background-color: rgba(255, 255, 255, 0.870);
    /* border: 1px solid #d0d0d0; */
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    width: 94px;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    padding: 4px 0;
}
.view-menu-item {
    height: 32px;
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    padding: 0 12px;
    cursor: pointer;
    text-align: left;
}
.view-menu-item:hover {
    background-color: #e5f3ff;
}
.view-menu-item-text {
    font-size: 13px;
    color: #333;
}
.content-view-top-left-stop-2 {
    display: flex;
    width: 4px;
    height: 38px;
    justify-content: center;
    align-items: center;
    /* background-color: rgb(255, 255, 255); */
}
.content-view-top-right {
    display: flex;
    flex-direction: row;
    height: 38px;
    width: 100px;
    /* background-color: coral; */
    flex-shrink: 0;
}
.content-view-top-right-name {
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
    padding-left: 5px;
}
.content-view-top-left-3,
.content-view-top-left-4,
.content-view-top-left-5,
.content-view-top-left-1 {
    display: flex;
    flex-direction: row;
    height: 38px;
    width: 94px;
}


.content-view-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    background-color: rgba(255, 255, 255, 0.790);
}
.content-view-view::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}
.content-view-view-top {
    display: flex;
    height: 30px;
    /* background-color: rgba(255, 255, 255, 0.450); */
    margin-left: 8px;
    margin-right: 15px;
    flex-direction: row;
    margin-top: 5px;
    flex-shrink: 0;
}
.content-view-view-top:not(:first-child) {
    margin-top: 6px;
}
.content-view-view-top-btn {
    display: flex;
    flex-direction: row;
    width: 64px;
    height: 24px;
    border: none;
    margin-top: 3px;
    margin-left: 8px;
    background-color: #ffffff00;
}
.content-view-view-top-btn:hover {
    background-color: #ffffff8e;
}
.content-view-view-top-name {
    text-align: center;
    margin-top: 1px;
    padding-left: 5px;
}
.content-view-view-top-img {
    display: flex;
    height: 12px;
    width: 12px;
    margin-top: 9px;
    border: none;
    outline: 0;
    outline: none;
    object-fit: contain;
    justify-content: flex-start;
    /* background-color: darkkhaki; */
    transition: transform 0.3s ease;
}
.content-view-view-file-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    min-width: 185px;
    max-width: 740px;
    column-gap: 15px;
    row-gap: 4px;
    /* background-color: #c9eb3e; */
    margin-left: 20px;
    margin-right: 15px;
    transition: height 0.3s ease, margin-top 0.3s ease;
}
.content-view-view-file-area.collapsed-area {
    height: 0px;
    margin-top: 0px !important;
    overflow: hidden;
    display: none;
}
.content-view-view-file-area-file {
    /* background-color: deeppink; */
    display: flex;
    flex-direction: row;
    width: 170px;
    height: 60px;
    color: white;
}
.content-view-view-file-area-file:hover {
    background-color: #ffffff92;
}
.content-view-view-file-area-file.is-selected {
    background-color: rgba(0, 120, 215, 0.3) !important;
    /* outline: 1px solid #0078d7; */
}
.content-view-view-file-area-file-left {
    display: flex;
    height: 54px;
    width: 54px;
    margin-top: 3px;
    margin-left: 10px;
}
.content-view-view-file-area-file-middle {
    display: flex;
    flex-direction: column;
    width: 72px;
    height: 40px;
    margin-top: 10px;
}
.rename-input {
    width: 90%;
    font-size: 12px;
    border: 1px solid #0078d7;
    outline: none;
    padding: 0 2px;
    height: 18px;
    background: rgb(255, 255, 255);
    color: black;
}
.content-view-view-file-area-file-middle-name {
    font-size: 14px;
    display: flex;
    padding-left: 5px;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}
.content-view-view-file-area-file-middle-path {
    font-size: 14px;
    display: flex;
    text-align: center;
    padding-left: 7px;
    color: #403f3fc8;
}
.content-view-view-file-area-file-middle-low,
.content-view-view-file-area-file-middle-top {
    display: flex;
    width: 70px;
    height: 20px;
    overflow: hidden;
    align-items: center;
}
.content-view-view-file-area-file-right {
    display: flex;
    width: 24px;
    height: 24px;
    margin-top: 18px;
    margin-left: 17px;
}

/* 公共容器 */
.page-two-container {
    width: 100%;
    height: 100%;
    background-color: transparent;
    padding-top: 15px;
}
.page-two-container-view {
    display: flex;
    width: auto;
    height: 100%;
}

/* --- 详细信息视图 专用 --- */
.page-two-container-view.is-details-mode {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
}
.view-mode-details-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 15px;
    margin-right: 15px;
    gap: 10px;
}
.dv-header {
    display: flex;
    padding: 0 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    height: 30px;
    align-items: center;
    font-size: 12px;
    color: #666;
    width: 100%;
    white-space: nowrap;
}
.dv-header-spacer {
    width: 30px;
    flex-shrink: 0;
}
.dv-col-name,
.dv-row-name-area {
    flex: 4;
    min-width: 0;
    overflow: hidden;
    padding-right: 0px;
    flex-shrink: 0;
}
.dv-col-date,
.dv-col-date-val {
    flex: 2;
    min-width: 120px;
    font-size: 12px;
    color: #666;
}
.dv-col-type,
.dv-col-type-val {
    flex: 1;
    min-width: 80px;
    font-size: 12px;
    color: #666;
}
.dv-row-item {
    display: flex;
    align-items: center;
    width: 100%;
    height: 35px;
    padding: 0 10px;
    transition: background 0.1s;
}
.dv-row-item:hover {
    background-color: rgba(255, 255, 255, 0.52);
}
.dv-row-item.is-selected {
    background-color: rgba(0, 120, 215, 0.3) !important;
}
.dv-row-icon {
    height: 20px;
    width: 20px;
    margin-right: 10px;
    flex-shrink: 0;
}
.dv-rename-input {
    width: 90%;
    font-size: 12px;
    border: 1px solid #0078d7;
    background: white;
}
.dv-row-name-text {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}
.empty-folder-hint {
    padding: 20px;
    color: #666;
}

/* --- 平铺视图 专用 --- */
.page-two-container-view.is-tiles-mode {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    min-width: 185px;
    max-width: 740px;
    column-gap: 15px;
    row-gap: 10px;
    height: auto;
}
.view-mode-tiles-wrapper {
    display: contents;
}
.tv-item {
    display: flex;
    flex-direction: row;
    width: 170px;
    height: 60px;
    align-items: center;
    padding-left: 10px;
    margin-left: 15px;
}
.tv-item:hover {
    background-color: #ffffff92;
}
.tv-item.is-selected {
    background-color: rgba(0, 120, 215, 0.3) !important;
}
.tv-item-icon {
    height: 48px;
    width: 48px;
    margin-right: 8px;
}
.tv-item-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    min-width: 0;
}
.tv-item-name-row {
    height: 20px;
    overflow: hidden;
}
.tv-rename-input {
    width: 100%;
    font-size: 12px;
    border: 1px solid #0078d7;
    background: white;
}
.tv-item-name-text {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}
.tv-item-desc-row {
    height: 18px;
    font-size: 12px;
    color: #403f3fc8;
}
.tv-item-arrow {
    width: 20px;
    height: 20px;
    margin-left: auto;
    margin-right: 5px;
}


/* 右键菜单样式 */
.custom-context-menu {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.750);
    backdrop-filter: blur(10px);
    border: 1px solid #bababa;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    padding: 3px;
    min-width: 170px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
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
    /* 减小整体内边距 */
    font-size: 14px;
    height: 30px;
    margin-top: 3px;
    color: #333;
    cursor: default;
    transition: background 0.1s;
}
.menu-item:hover {
    background-color: rgba(255, 255, 255, 0.648);
}
.menu-item.divider {
    height: 1px;
    background-color: #ccc;
    margin: 4px 0;
    padding: 0;
    cursor: default;
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
.menu-item.divider:hover {
    background-color: #ccc;
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
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
}
.menu-item-icon img {
    width: 16px;
    /* Windows 标准小图标尺寸 */
    height: 16px;
    object-fit: contain;
}
.menu-item-label {
    flex: 1;
    font-size: 12px;
    color: #000;
}


.dark-theme .top-label-big-closeview-btn-img,
.dark-theme .top-label-big-addbtn-img,
.dark-theme :deep(.control-btn-img) {
    filter: brightness(0) invert(1);
}
.dark-theme .top-label-big-span {
    color: white;
}


.toolbar.dark-theme {
    background-color: #403f40 !important;
}
.toolbar.dark-theme .toolbar-left-button-img,
.toolbar.dark-theme .toolbar-middle-span-img,
.toolbar.dark-theme .toolbar-middle-span-img-2,
.toolbar.dark-theme .toolbar-right-search-img {
    filter: brightness(0) invert(1);
}
.toolbar.dark-theme .toolbar-middle-add-name,
.toolbar.dark-theme .path-edit-input {
    color: white;
}
.explorer-body.dark-theme .sidebar {
    background-color: #201f1f;
    color: white;
}
.explorer-body.dark-theme .content-view-top {
    background-color: #353435;
    color: white;
}
.explorer-body.dark-theme .content-view-view {
    background-color: #2a2a2a;
    color: white;
}
.explorer-body.dark-theme .sidebar-container-top.is-active,
.explorer-body.dark-theme .sidebar-container-below-tab.is-active {
    background-color: #404040 !important;
}
.explorer-body.dark-theme .sidebar-container-top-line {
    background-color: #785f3b;
}
.explorer-body.dark-theme .content-view-top-left-stop-img {
    filter: brightness(0) invert(1);
}
.explorer-body.dark-theme .content-view-top-left-button-name,
.explorer-body.dark-theme .content-view-top-right-name,
.explorer-body.dark-theme .content-view-view-top-name,
.explorer-body.dark-theme .sidebar-container-top-name,
.explorer-body.dark-theme .sidebar-container-below-tab-name,
.explorer-body.dark-theme .sidebar-container-middle-tpn,
.explorer-body.dark-theme .tv-item-name-text,
.explorer-body.dark-theme .dv-row-name-text,
.explorer-body.dark-theme .content-view-view-file-area-file-middle-name {
    color: white;
}
.explorer-body.dark-theme .content-view-view-file-area-file-middle-path,
.explorer-body.dark-theme .tv-item-desc-row,
.explorer-body.dark-theme .dv-col-date,
.explorer-body.dark-theme .dv-col-date-val,
.explorer-body.dark-theme .dv-col-type,
.explorer-body.dark-theme .dv-col-type-val,
.explorer-body.dark-theme .dv-header {
    color: #ccc;
}
.explorer-body.dark-theme .content-view-top-left-button-img1,
.explorer-body.dark-theme .content-view-top-left-button-img2,
.explorer-body.dark-theme .content-view-top-left-2-button-img,
.explorer-body.dark-theme .content-view-view-top-img,
.explorer-body.dark-theme .sidebar-container-below-tab-img2 {
    filter: brightness(0) invert(1);
}


.custom-context-menu.dark-theme {
    background-color: #202020d9;
    color: white;
}
.custom-context-menu.dark-theme .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.custom-context-menu.dark-theme .menu-item-label {
    color: white;
}
.custom-context-menu.dark-theme .menu-item-icon.is-app-icon {
    background-color: rgba(255, 255, 255, 0.15);
}
.custom-context-menu.dark-theme .menu-item-icon:not(.is-app-icon) img {
    filter: brightness(0) invert(1);
}
</style>