import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useSystemStore, type AppComponentName } from "./system";
import { useFileSystemStore } from "./fileSystem";

import type { ComputedRef } from "vue";

export interface MenuItem {
    label?: any;
    icon?: string | ComputedRef<string>;
    type?: "divider";
    action?: () => void;
    isApp?: boolean;
}

export const useMenuStore = defineStore("menu", () => {
    const systemStore = useSystemStore();
    const fileStore = useFileSystemStore();
    const menuVisible = ref(false);
    const menuPosition = ref({ x: 0, y: 0 });
    const currentMenuItems = ref<MenuItem[]>([]);
    const contextMenuTargetId = ref<string | null>(null);
    const menuSize = ref({ width: 170, height: 315 });

    // --- 菜单内容定义 ---
    const getDesktopMenu = (): MenuItem[] => [
        {
            label: "查看",
            icon: "icons/menu/View.png",
            action: () => console.log("查看"),
        },
        {
            label: "排序方式",
            icon: "icons/menu/Sort.png",
            action: () => console.log("排序"),
        },
        {
            label: "刷新",
            icon: "icons/menu/Refresh.png",
            action: () => systemStore.triggerRefresh(),
        },
        { type: "divider" },
        {
            label: "新建",
            icon: "icons/menu/Add To1.png",
            action: () => console.log("新建"),
        },
        { type: "divider" },
        {
            label: "显示设置",
            icon: "icons/menu/System.png",
            action: () => systemStore.openWindow("WinSetting", "设置"),
        },
        {
            label: "个性化",
            icon: "icons/menu/Personalize.png",
            action: () => console.log("个性化"),
        },
        { type: "divider" },
        {
            label: "新建文件夹",
            icon: "icons/menu/Add1.png",
            action: () => {
                const newFolder = fileStore.createNewFolder("desktop");
                if (newFolder) {
                    renamingId.value = newFolder.id;
                    renameValue.value = newFolder.name;
                }
            },
        },
        {
            label: "在终端打开",
            icon: "icons/menu/Windows Terminal.png",
            action: () => console.log("在终端打开"),
        },
        { type: "divider" },
        {
            label: "更多选项",
            icon: "icons/menu/More.png",
            action: () => console.log("更多"),
        },
    ];
    const getIconMenu = (
        handleDblClick: (item: any) => void,
        combinedIcons: any[],
    ): MenuItem[] => [
            {
                label: "打开",
                isApp: true,
                icon: computed(() => {
                    const node = fileStore.findNodeById(contextMenuTargetId.value || "");
                    if (node && node.type === "app") {
                        return systemStore.getAppIcon(node.id) || "icons/menu/Open File.png";
                    }
                    return "icons/menu/Open File.png";
                }),
                action: () => {
                    const item = combinedIcons.find(
                        (i) => i.id === contextMenuTargetId.value,
                    );
                    if (item) handleDblClick(item);
                },
            },
            {
                label: "重命名",
                icon: "icons/menu/Rename1.png",
                action: () => {
                    if (contextMenuTargetId.value) {
                        const node = fileStore.findNodeById(contextMenuTargetId.value);
                        if (node) {
                            renamingId.value = node.id;
                            renameValue.value = node.name;
                        }
                    }
                },
            },
            {
                label: "管理员身份运行",
                icon: "icons/menu/Admin.png",
                action: () => console.log("管理员运行"),
            },
            { type: "divider" },
            {
                label: computed(() => {
                    const node = fileStore.findNodeById(contextMenuTargetId.value || "");
                    return node && systemStore.isAppFixed(node.id)
                        ? "任务栏取消固定"
                        : "固定到任务栏";
                }),
                icon: computed(() => {
                    const node = fileStore.findNodeById(contextMenuTargetId.value || "");
                    return node && systemStore.isAppFixed(node.id)
                        ? "icons/menu/Unpin.png"
                        : "icons/menu/New File.png";
                }),
                action: () => {
                    if (contextMenuTargetId.value)
                        systemStore.togglePinApp(contextMenuTargetId.value);
                },
            },
            { type: "divider" },
            {
                label: "删除",
                icon: "icons/menu/Delete.png",
                action: () => {
                    if (contextMenuTargetId.value) {
                        fileStore.deleteNode(contextMenuTargetId.value);
                        contextMenuTargetId.value = null;
                    }
                },
            },
            {
                label: "属性",
                icon: "icons/menu/Info.png",
                action: () => console.log("属性"),
            },
        ];
    const getTaskbarMenu = (
        item: any,
        handleTaskbarClick: (item: any) => void,
    ): MenuItem[] => [
            {
                label: "打开",
                isApp: true,
                icon: systemStore.getAppIcon(item.componentName) || "icons/menu/Open File.png",
                action: () => handleTaskbarClick(item),
            },
            {
                label: systemStore.isAppFixed(item.componentName)
                    ? "任务栏取消固定"
                    : "固定到任务栏",
                icon: systemStore.isAppFixed(item.componentName)
                    ? "icons/menu/Unpin.png"
                    : "icons/menu/New File.png",
                action: () => systemStore.togglePinApp(item.componentName),
            },
            {
                label: "关闭",
                icon: "icons/menu/Delete.png",
                action: () => {
                    if (item.id !== -1) systemStore.closeWindow(item.id);
                },
            },
        ];

    // --- 应用窗口右键菜单内容定义 ---
    const getNotepadWindowMenu = (): MenuItem[] => [
        {
            label: "撤销",
            icon: "icons/menu/Undo.png",
            action: () => console.log("Notepad: 撤销"),
        },
        { type: "divider" },
        {
            label: "剪切",
            icon: "icons/menu/Cut.png",
            action: () => document.execCommand("cut"),
        },
        {
            label: "复制",
            icon: "icons/menu/Copy.png",
            action: () => document.execCommand("copy"),
        },
        {
            label: "粘贴",
            icon: "icons/menu/Paste.png",
            action: () => document.execCommand("paste"),
        },
        { type: "divider" },
        {
            label: "全选",
            icon: "icons/menu/Select All.png",
            action: () => document.execCommand("selectAll"),
        },
    ];

    // --- 核心方法 ---
    const openMenu = (
        e: MouseEvent,
        type: "desktop" | "icon" | "taskbar" | "window",
        options: any,
    ) => {
        systemStore.closeAllPopups();
        const { handleDblClick, combinedIcons, taskbarItem, handleTaskbarClick } =
            options;
        menuVisible.value = false;
        setTimeout(() => {
            let x = e.clientX;
            let y = e.clientY;
            let w = 170;
            let h = 318;
            if (type === "desktop") {
                contextMenuTargetId.value = null;
                currentMenuItems.value = getDesktopMenu();
            } else if (type === "icon") {
                contextMenuTargetId.value = options.targetId;
                currentMenuItems.value = getIconMenu(handleDblClick, combinedIcons);
                h = 214;
            } else if (type === "taskbar") {
                currentMenuItems.value = getTaskbarMenu(
                    taskbarItem,
                    handleTaskbarClick,
                );
                w = 180;
                h = 110;
            } else if (type === "window") {
                // 根据应用绑定的菜单类型加载对应菜单
                const menuType = options.windowContextMenuType;
                if (menuType === "notepad") {
                    currentMenuItems.value = getNotepadWindowMenu();
                    h = 214;
                } else {
                    // 未知类型或不支持右键菜单，不显示
                    return;
                }
            }
            if (x + w > window.innerWidth) x -= w;
            if (y + h > window.innerHeight) y -= h;
            menuPosition.value = { x, y };
            menuSize.value = { width: w, height: h };
            menuVisible.value = true;
        }, 10);
    };
    const closeMenu = () => {
        menuVisible.value = false;
        contextMenuTargetId.value = null;
    };
    const executeAction = (action?: () => void) => {
        if (action) action();
        closeMenu();
    };

    // --- 重命名 ---
    const renamingId = ref<string | null>(null);
    const renameValue = ref("");
    const finishRename = () => {
        if (renamingId.value && renameValue.value.trim()) {
            fileStore.renameNode(renamingId.value, renameValue.value.trim());
        }
        renamingId.value = null;
        renameValue.value = "";
    };

    return {
        menuVisible,
        menuPosition,
        currentMenuItems,
        menuSize,
        openMenu,
        closeMenu,
        executeAction,
        renamingId,
        renameValue,
        finishRename,
    };
});
