import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { useNotificationStore } from "./notification";

export type FileType = "root" | "drive" | "folder" | "file" | "app";

export interface FileSystemNode {
    id: string;
    parentId: string | null;
    name: string;
    type: FileType;
    icon?: string;
    children?: FileSystemNode[];
    content?: string;
    filePath?: string | null;
    updatedAt: string;
}
export interface TabInstance {
    id: number;
    currentPathId: string;
    historyStack: string[];
    historyIndex: number;
}
export interface MenuOption {
    label?: string;
    icon?: string;
    action?: string;
    style?: Record<string, any>;
    isDivider?: boolean;
    disabled?: boolean;
    isApp?: boolean;
}

export interface QuotaInfo {
    used: number;
    total: number;
    usedMB: string;
    totalMB: string;
    percent: number;
    // 流量信息（可选，Panel.vue 暂未展示）
    traffic?: {
        todayBytes: number;
        monthBytes: number;
        dailyLimitBytes: number;
        monthlyLimitBytes: number;
        todayPercent: number;
        monthPercent: number;
    };
}

export const useFileSystemStore = defineStore("fileSystem", () => {
    // ---- 存储状态 ----
    const isLoading = ref(false);
    const loadError = ref<string | null>(null);

    // ---- 存储配额 ----
    const quota = ref<QuotaInfo | null>({
        used: 0,
        total: 1024 * 1024 * 1024, // 1GB
        usedMB: "0",
        totalMB: "1024",
        percent: 0,
    });

    const fetchQuota = async () => {
        // 本地模拟配额计算
        const userNodes = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
        const usedBytes = JSON.stringify(userNodes).length; // 简单模拟大小
        const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
        quota.value = {
            used: usedBytes,
            total: 1024 * 1024 * 100, // 100MB 模拟限制
            usedMB: usedMB,
            totalMB: "100",
            percent: (usedBytes / (1024 * 1024 * 100)) * 100,
        };
    };

    //  从 LocalStorage 加载用户文件树
    const loadUserFiles = async () => {
        try {
            isLoading.value = true;
            loadError.value = null;
            
            // 从本地存储读取
            const nodes: FileSystemNode[] = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
            
            // 先清理已有的用户节点（id以"db-"开头的），防止重复注入
            cleanUserNodes(fileSystemTree);
            // 注入到对应父节点
            injectUserNodes(nodes);
            // 同时刷新配额
            await fetchQuota();
        } catch (err: any) {
            loadError.value = "文件加载失败";
            console.error("[FileSystem] 加载本地文件失败", err);
        } finally {
            isLoading.value = false;
        }
    };
    // 递归清理所有db-前缀节点
    const cleanUserNodes = (nodes: FileSystemNode[]) => {
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (node && node.id.startsWith("db-")) {
                nodes.splice(i, 1);
            } else if (node && node.children) {
                cleanUserNodes(node.children);
            }
        }
    };
    // 将本地存储的节点树注入到对应的系统父目录
    const injectUserNodes = (nodes: FileSystemNode[]) => {
        for (const node of nodes) {
            const parent = findNodeById(node.parentId ?? "");
            if (parent && parent.children !== undefined) {
                // 检查是否已存在，避免重复
                if (!parent.children.find(c => c.id === node.id)) {
                    parent.children.push(node);
                }
            } else if (!node.parentId || node.parentId === "home") {
                const desktop = findNodeById("desktop");
                if (desktop?.children && !desktop.children.find(c => c.id === node.id)) {
                    node.parentId = "desktop";
                    desktop.children.push(node);
                }
            }
        }
    };
    // 保存节点到 LocalStorage
    const persistCreate = async (
        tempNode: FileSystemNode,
        parentId: string
    ): Promise<FileSystemNode | null> => {
        try {
            // 如果节点已有正式ID（以db-开头），直接使用
            const newNode: FileSystemNode = {
                ...tempNode,
                id: tempNode.id.startsWith("db-") ? tempNode.id : `db-${Date.now()}`,
                parentId,
                updatedAt: getCurrentTime(),
            };

            const userNodes = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
            userNodes.push(newNode);
            localStorage.setItem("win10_user_files", JSON.stringify(userNodes));

            // 如果ID发生了变化，才执行替换逻辑
            if (newNode.id !== tempNode.id) {
                replaceNodeInTree(tempNode.id, newNode);
            }
            return newNode;
        } catch (err: any) {
            console.error("[FileSystem] 创建节点失败", err);
            return null;
        }
    };
    const uploadFile = async (file: File, parentId: string): Promise<FileSystemNode | null> => {
        const notificationStore = useNotificationStore();

        // 模拟文件读取并存入 LocalStorage (注意：LocalStorage 大小有限)
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = async (e) => {
                const content = e.target?.result as string;
                const newNode: FileSystemNode = {
                    id: `db-${Date.now()}`,
                    parentId,
                    name: file.name,
                    type: 'file',
                    updatedAt: getCurrentTime(),
                    content: content, // 模拟文件内容
                    filePath: null,
                };

                try {
                    const userNodes = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
                    userNodes.push(newNode);
                    localStorage.setItem("win10_user_files", JSON.stringify(userNodes));

                    const parent = findNodeById(parentId);
                    if (parent && parent.children) {
                        parent.children.push(newNode);
                    }
                    
                    fetchQuota();
                    notificationStore.success('文件上传成功（已存入本地存储）');
                    resolve(newNode);
                } catch (err) {
                    notificationStore.error('本地存储空间不足，无法保存文件');
                    resolve(null);
                }
            };
            reader.readAsDataURL(file); // 使用 base64 模拟文件内容
        });
    };
    // 保存重命名到 LocalStorage
    const persistRename = async (id: string, newName: string) => {
        if (!id.startsWith("db-")) return;
        try {
            const userNodes: FileSystemNode[] = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
            const node = userNodes.find(n => n.id === id);
            if (node) {
                node.name = newName;
                node.updatedAt = getCurrentTime();
                localStorage.setItem("win10_user_files", JSON.stringify(userNodes));
            }
        } catch (err) {
            console.error("[FileSystem] 重命名同步失败", err);
        }
    };
    // 删除本地存储节点
    const persistDelete = async (id: string) => {
        if (!id.startsWith("db-")) return;
        try {
            let userNodes: FileSystemNode[] = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
            // 递归删除逻辑简化：只删除当前节点，如果需要级联删除，需额外处理
            userNodes = userNodes.filter(n => n.id !== id);
            localStorage.setItem("win10_user_files", JSON.stringify(userNodes));
            // 删除成功后刷新配额
            fetchQuota();
        } catch (err) {
            console.error("[FileSystem] 删除同步失败", err);
        }
    };
    // 移动节点到新父节点
    const persistMove = async (id: string, newParentId: string): Promise<boolean> => {
        if (!id.startsWith('db-')) return false;
        try {
            const userNodes: FileSystemNode[] = JSON.parse(localStorage.getItem("win10_user_files") || "[]");
            const node = userNodes.find(n => n.id === id);
            if (node) {
                node.parentId = newParentId;
                node.updatedAt = getCurrentTime();
                localStorage.setItem("win10_user_files", JSON.stringify(userNodes));
                return true;
            }
            return false;
        } catch (err) {
            console.error('[FileSystem] 移动节点失败', err);
            return false;
        }
    };
    // 仅从本地树删除节点，不触发后端删除
    const removeNodeLocally = (id: string) => {
        const remove = (nodes: FileSystemNode[]): boolean => {
            for (const [index, node] of nodes.entries()) {
                if (node.id === id) { nodes.splice(index, 1); return true; }
                if (node.children && remove(node.children)) return true;
            }
            return false;
        };
        remove(fileSystemTree);
    };
    const replaceNodeInTree = (tempId: string, realNode: FileSystemNode) => {
        const replace = (nodes: FileSystemNode[]): boolean => {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i]?.id === tempId) {
                    // 保留子节点
                    const existingChildren = nodes[i]?.children;
                    nodes[i] = { ...realNode };
                    if (existingChildren && existingChildren.length > 0 && realNode.type === "folder") {
                        nodes[i]!.children = existingChildren;
                    }
                    return true;
                }
                if (nodes[i]?.children && replace(nodes[i]?.children || [])) return true;
            }
            return false;
        };
        replace(fileSystemTree);
    };

    // ---- 日期 ----
    const DEFAULT_DATE = "2026/3/9 21:00";
    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    };

    // 文件系统
    const homeNode: FileSystemNode = {
        id: "home",
        parentId: null,
        name: "主页",
        type: "root",
        updatedAt: DEFAULT_DATE,
        children: [],
    };
    const fileSystemTree = reactive<FileSystemNode[]>([
        {
            id: "desktop",
            parentId: "home",
            name: "桌面",
            type: "folder",
            updatedAt: DEFAULT_DATE,
            children: [
                {
                    id: "FileExplorer",
                    parentId: "desktop",
                    name: "此电脑",
                    type: "app",
                    icon: "109.png",
                    updatedAt: DEFAULT_DATE,
                },
                {
                    id: "WinSetting",
                    parentId: "desktop",
                    name: "设置",
                    type: "app",
                    icon: "27.png",
                    updatedAt: DEFAULT_DATE,
                },
                {
                    id: "WinAbout",
                    parentId: "desktop",
                    name: "关于项目",
                    type: "app",
                    icon: "/appicons/about.png",
                    updatedAt: DEFAULT_DATE,
                },
                {
                    id: "Txtreader",
                    parentId: "desktop",
                    name: "记事本",
                    type: "app",
                    icon: "22.png",
                    updatedAt: DEFAULT_DATE,
                },
            ],
        },
        {
            id: "download",
            parentId: "home",
            name: "下载",
            type: "folder",
            updatedAt: DEFAULT_DATE,
            children: [],
        },
        {
            id: "docs",
            parentId: "home",
            name: "文档",
            type: "folder",
            updatedAt: DEFAULT_DATE,
            children: [],
        },
        {
            id: "music",
            parentId: "home",
            name: "音乐",
            type: "folder",
            updatedAt: DEFAULT_DATE,
            children: [],
        },
        {
            id: "video",
            parentId: "home",
            name: "视频",
            type: "folder",
            updatedAt: DEFAULT_DATE,
            children: [],
        },
        {
            id: "c-drive",
            parentId: "home",
            name: "此电脑 (C:)",
            type: "drive",
            updatedAt: DEFAULT_DATE,
            children: [
                {
                    id: "windows",
                    parentId: "c-drive",
                    name: "Windows",
                    type: "folder",
                    updatedAt: DEFAULT_DATE,
                    children: [],
                },
                {
                    id: "program_files",
                    parentId: "c-drive",
                    name: "Program Files",
                    type: "folder",
                    updatedAt: DEFAULT_DATE,
                    children: [],
                },
            ],
        },
        {
            id: "d-drive",
            parentId: "home",
            name: "Data (D:)",
            type: "drive",
            updatedAt: DEFAULT_DATE,
            children: [],
        },
    ]);

    // 图标系统
    const ICON_ASSETS = {
        home: "/icons/file-explorer/fileicon/Home1.png",
        folder: "/icons/file-explorer/fileicon/emptyfile.png",
        drive: "/icons/file-explorer/fileicon/C.png",
        drive_data: "/icons/file-explorer/fileicon/D.png",
        unknown_file: "/icons/file-explorer/fileicon/unknow.png",
        desktop: "/icons/file-explorer/fileicon/desktop.png",
        download: "/icons/file-explorer/fileicon/download.png",
        docs: "/icons/file-explorer/fileicon/document.png",
        music: "/icons/file-explorer/fileicon/music.png",
        video: "/icons/file-explorer/fileicon/video.png",
        apps: {
            "this-pc-app": "109.png",
            "settings-app": "27.png",
            FileExplorer: "109.png",
            WinSetting: "27.png",
            Txtreader: "22.png",
        } as Record<string, string>,
        extensions: {
            txt: "/icons/102.png",
            doc: "/icons/112.png",
            docx: "/icons/112.png",
            xls: "/icons/112.png",
            mp3: "/icons/108.png",
            mp4: "/icons/189.png",
            exe: "/icons/184.png",
            png: "/icons/132.png",
            jpg: "/icons/132.png",
            jpeg: "/icons/132.png",
            zip: "/icons/4.png",
        } as Record<string, string>,
    };
    const getFileIcon = (node: FileSystemNode | null | undefined): string => {
        if (!node) return ICON_ASSETS.home;
        if (node.icon) return node.icon;
        if (node.type === "app") {
            return ICON_ASSETS.apps[node.id] || ICON_ASSETS.unknown_file;
        }
        if (node.id === "desktop") return ICON_ASSETS.desktop;
        if (node.id === "download") return ICON_ASSETS.download;
        if (node.id === "docs") return ICON_ASSETS.docs;
        if (node.id === "music") return ICON_ASSETS.music;
        if (node.id === "video") return ICON_ASSETS.video;
        if (node.id === "c-drive") return ICON_ASSETS.drive;
        if (node.id === "d-drive") return ICON_ASSETS.drive_data;
        if (node.type === "root") return ICON_ASSETS.home;
        if (node.type === "drive") return ICON_ASSETS.drive;
        if (node.type === "folder") return ICON_ASSETS.folder;
        if (node.type === "file") {
            const parts = node.name.split(".");
            if (parts.length > 1) {
                const ext = parts.pop()?.toLowerCase();
                if (ext && ICON_ASSETS.extensions[ext]) {
                    return ICON_ASSETS.extensions[ext];
                }
            }
            return ICON_ASSETS.unknown_file;
        }
        return ICON_ASSETS.folder;
    };
    const getFileDisplayType = (node: FileSystemNode): string => {
        if (node.type === "folder") return "文件夹";
        if (node.type === "drive") return "驱动器";
        if (node.type === "app") return "应用";
        const parts = node.name.split(".");
        if (parts.length > 1) {
            const ext = parts.pop()?.toLowerCase();
            return ext ? `${ext.toUpperCase()} 文件` : "文件";
        }
        return "文件";
    };
    const getDisplayPath = (item: FileSystemNode): string => {
        if (item.parentId === "home") return "本地存储";
        if (item.parentId) {
            const parent = findNodeById(item.parentId);
            return parent ? parent.name : "系统";
        }
        return "系统";
    };

    // Tab 标签页
    const tabs = ref<TabInstance[]>([
        {
            id: Date.now(),
            currentPathId: "home",
            historyStack: ["home"],
            historyIndex: 0,
        },
    ]);
    const activeTabId = ref<number>(tabs.value[0]?.id ?? 0);
    const activeTab = computed((): TabInstance => {
        const found = tabs.value.find((t) => t.id === activeTabId.value);
        if (found) return found;
        return (
            tabs.value[0] || {
                id: 0,
                currentPathId: "home",
                historyStack: ["home"],
                historyIndex: 0,
            }
        );
    });
    const currentNode = computed(() => {
        return findNodeById(activeTab.value.currentPathId) || null;
    });
    const setActiveTab = (id: number) => {
        activeTabId.value = id;
    };
    const addNewTab = () => {
        const newTab: TabInstance = {
            id: Date.now(),
            currentPathId: "home",
            historyStack: ["home"],
            historyIndex: 0,
        };
        tabs.value.push(newTab);
        activeTabId.value = newTab.id;
    };
    const closeTab = (index: number) => {
        if (tabs.value.length <= 1) return;
        const targetTab = tabs.value[index];
        if (!targetTab) return;
        const closedTabId = targetTab.id;
        tabs.value.splice(index, 1);
        if (activeTabId.value === closedTabId) {
            const nextIndex =
                index >= tabs.value.length ? tabs.value.length - 1 : index;
            const nextTab = tabs.value[nextIndex];
            if (nextTab) {
                activeTabId.value = nextTab.id;
            }
        }
    };
    const navigateTo = (id: string) => {
        const tab = activeTab.value;
        if (tab.currentPathId === id) return;
        // 验证目标是否存在(主页除外)
        const target = findNodeById(id);
        if (!target && id !== "home") return;
        // 如果在历史中间位置导航新路径，截断后面的历史
        if (tab.historyIndex < tab.historyStack.length - 1) {
            tab.historyStack = tab.historyStack.slice(0, tab.historyIndex + 1);
        }
        tab.historyStack.push(id);
        tab.historyIndex++;
        tab.currentPathId = id;
        // 导航时清除选中状态
        setSelection(null);
    };
    const getTabStyle = (id: number) => {
        const isActive = activeTabId.value === id;
        return {
            backgroundColor: isActive
                ? "rgba(255, 255, 255, 0.648)"
                : "rgba(255, 255, 255, 0.328)",
            flex: isActive ? "1 0 170px" : "0 1 170px",
            maxWidth: "170px",
            minWidth: isActive ? "100px" : "35px",
            transition: "all 0.2s ease",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
        };
    };
    const closeTabById = (id: number) => {
        if (tabs.value.length <= 1) return;
        const index = tabs.value.findIndex((t) => t.id === id);
        if (index === -1) return;

        tabs.value.splice(index, 1);
        if (activeTabId.value === id) {
            const nextIndex =
                index >= tabs.value.length ? tabs.value.length - 1 : index;
            const nextTab = tabs.value[nextIndex];
            if (nextTab) {
                activeTabId.value = nextTab.id;
            } else {
                activeTabId.value = tabs.value[0]?.id ?? 0;
            }
        }
    };
    const getTabName = (tab: TabInstance): string => {
        const node = findNodeById(tab.currentPathId);
        return node?.name || "主页";
    };
    const getTabIcon = (tab: TabInstance): string => {
        const node = findNodeById(tab.currentPathId);
        return getFileIcon(node);
    };
    const isNodeActive = (nodeId: string): boolean => {
        return activeTab.value.currentPathId === nodeId;
    };

    // 面包屑
    const breadcrumbs = computed(() => {
        const crumbs: FileSystemNode[] = [];
        let curr: FileSystemNode | null | undefined = currentNode.value;

        while (curr) {
            crumbs.unshift(curr);
            if (curr.parentId) {
                curr = findNodeById(curr.parentId);
            } else if (curr.id !== "home") {
                curr = findNodeById("home");
            } else {
                curr = null;
            }
        }
        const firstCrumb = crumbs[0];
        if (firstCrumb && firstCrumb.id !== "home") {
            if (firstCrumb.parentId) {
                const home = findNodeById("home");
                if (home) crumbs.unshift(home);
            }
        }
        // 特殊处理：如果是 home 节点本身
        if (crumbs.length === 0 && currentNode.value?.id === "home") {
            const home = findNodeById("home");
            if (home) crumbs.push(home);
        }
        return crumbs;
    });
    const findNodeByPath = (pathParts: string[]): FileSystemNode | null => {
        if (pathParts.length === 0) return null;
        if (pathParts[0] === "主页" && pathParts.length === 1)
            return findNodeById("home");

        let currentNode: FileSystemNode | null = findNodeById("home");

        // 跳过第一个 "主页" 节点开始向下查找
        const searchParts =
            pathParts[0] === "主页" ? pathParts.slice(1) : pathParts;

        for (const part of searchParts) {
            if (!currentNode) return null;
            // 递归或从扁平树中查找子节点名称匹配的
            const children = getAllChildren(currentNode.id);
            const nextNode = children.find((child) => child.name === part);
            if (nextNode) {
                currentNode = nextNode;
            } else {
                return null;
            }
        }
        return currentNode;
    };
    const getAllChildren = (parentId: string): FileSystemNode[] => {
        const results: FileSystemNode[] = [];
        const search = (nodes: FileSystemNode[]) => {
            for (const node of nodes) {
                if (node.parentId === parentId) results.push(node);
                if (node.children) search(node.children);
            }
        };
        search(fileSystemTree);
        return results;
    };
    const findNodeById = (
        id: string,
        nodes: FileSystemNode[] = fileSystemTree,
    ): FileSystemNode | null => {
        if (id === "home") return homeNode;
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(id, node.children);
                if (found) return found;
            }
        }
        return null;
    };
    const findNodeByNames = (
        names: string[],
        currentNodes: FileSystemNode[],
    ): FileSystemNode | null => {
        if (names.length === 0) return null;
        const targetName = names[0];
        const foundNode = currentNodes.find((n) => n.name === targetName);
        if (!foundNode) return null;
        if (names.length === 1) {
            return foundNode;
        } else if (foundNode.children) {
            return findNodeByNames(names.slice(1), foundNode.children);
        }
        return null;
    };

    //面包屑侧边按钮
    const navigationButtons = computed(() => [
        {
            name: "back",
            icon: "/icons/file-explorer/navigaticon/back1.png",
            handler: goBack,
            disabled: activeTab.value.historyIndex <= 0,
            title: "后退",
        },
        {
            name: "forward",
            icon: "/icons/file-explorer/navigaticon/For1.png",
            handler: goForward,
            disabled:
                activeTab.value.historyIndex >= activeTab.value.historyStack.length - 1,
            title: "前进",
        },
        {
            name: "up",
            icon: "/icons/file-explorer/navigaticon/up1.png",
            handler: goUp,
            disabled:
                !currentNode.value?.parentId &&
                activeTab.value.currentPathId === "home",
            title: "向上",
        },
        {
            name: "refresh",
            icon: "/icons/file-explorer/navigaticon/Refresh1.png",
            handler: refresh,
            disabled: false,
            title: "刷新",
        },
    ]);
    const goBack = () => {
        const tab = activeTab.value;
        if (tab.historyIndex > 0) {
            tab.historyIndex--;
            tab.currentPathId = tab.historyStack[tab.historyIndex] ?? "home";
            setSelection(null);
        }
    };
    const goForward = () => {
        const tab = activeTab.value;
        if (tab.historyIndex < tab.historyStack.length - 1) {
            tab.historyIndex++;
            tab.currentPathId = tab.historyStack[tab.historyIndex] ?? "home";
            setSelection(null);
        }
    };
    const goUp = () => {
        const node = currentNode.value;
        if (node && node.parentId) navigateTo(node.parentId);
        else if (node && node.id !== "home") navigateTo("home");
    };
    const refresh = () => {
        loadUserFiles();
    };

    //导航栏功能区按钮
    const toolbarActionButtons = computed(() => [
        {
            name: "cut",
            icon: "/icons/file-explorer/toolbaricon/Cut.png",
            handler: handleToolbarCut,
            title: "剪切",
            disabled: !selectionState.selectedItemId,
        },
        {
            name: "copy",
            icon: "/icons/file-explorer/toolbaricon/Copy.png",
            handler: handleToolbarCopy,
            title: "复制",
            disabled: !selectionState.selectedItemId,
        },
        {
            name: "paste",
            icon: "/icons/file-explorer/toolbaricon/Paste.png",
            handler: handleToolbarPaste,
            title: "粘贴",
            disabled: !clipboardState.sourceNode,
            style: { opacity: clipboardState.sourceNode ? 1 : 0.5 },
        },
        {
            name: "rename",
            icon: "/icons/file-explorer/toolbaricon/Rename.png",
            handler: handleToolbarRename,
            title: "重命名",
            disabled: !selectionState.selectedItemId,
        },
        {
            name: "delete",
            icon: "/icons/file-explorer/toolbaricon/Delete.png",
            handler: handleDelete,
            title: "删除",
            disabled: !selectionState.selectedItemId,
        },
    ]);
    const handleToolbarRename = () => {
        const notificationStore = useNotificationStore();
        if (!selectionState.selectedItemId) {
            notificationStore.warning("请先选择一个项目");
            return;
        }
        startRename(selectionState.selectedItemId);
    };
    const handleToolbarCut = () => {
        const notificationStore = useNotificationStore();
        if (!selectionState.selectedItemId) {
            notificationStore.warning("请先选择一个项目");
            return;
        }
        const node = findNodeById(selectionState.selectedItemId);
        if (node?.type === "app") {
            notificationStore.error("“应用”类型文件无法执行剪切操作");
            return;
        }
        if (node) {
            const protectedIds = [
                "desktop",
                "download",
                "docs",
                "music",
                "video",
                "c-drive",
                "d-drive",
                "home",
            ];
            if (protectedIds.includes(node.id)) {
                notificationStore.error("系统目录不允许移动");
                return;
            }
            setClipboard(node, true);
        }
    };
    const handleToolbarCopy = () => {
        const notificationStore = useNotificationStore();
        if (!selectionState.selectedItemId) {
            notificationStore.warning("请先选择一个项目");
            return;
        }
        const node = findNodeById(selectionState.selectedItemId);
        if (node?.type === "app") {
            notificationStore.error("“应用”类型文件无法执行复制操作");
            return;
        }
        if (node) {
            setClipboard(node, false);
        }
    };
    const handleToolbarPaste = async () => {
        const notificationStore = useNotificationStore();
        const result = await executePaste(activeTab.value.currentPathId);
        if (!result.success) {
            notificationStore.error(result.message);
        }
    };
    const handleDelete = () => {
        const notificationStore = useNotificationStore();
        const selectedId = selectionState.selectedItemId;
        if (!selectedId) {
            notificationStore.warning("请先选择一个项目");
            return;
        }
        const protectedIds = [
            "desktop",
            "download",
            "docs",
            "music",
            "video",
            "c-drive",
            "d-drive",
            "home",
        ];

        if (protectedIds.includes(selectedId)) {
            notificationStore.error("系统目录不允许删除");
            return;
        }
        deleteNode(selectedId);
        setSelection(null);
    };

    //导航栏菜单按钮
    const toolbarDropdownButtons = computed(() => [
        {
            id: "new",
            class: "content-view-top-left-1",
            title: "新建",
            icon: "/icons/file-explorer/toolbaricon/Add To.png",
            handler: handleCreateNewFolder,
            hasDropdown: true,
            menuKey: null,
        },
        {
            id: "sort",
            class: "content-view-top-left-3",
            title: "排序",
            icon: "/icons/file-explorer/toolbaricon/Sort.png",
            handler: () => toggleMenu("sort"),
            hasDropdown: true,
            menuKey: "sort",
            subItems: [
                { label: "名称", action: () => handleSortAction("name") },
                { label: "修改日期", action: () => handleSortAction("date") },
                { label: "类型", action: () => handleSortAction("type") },
            ],
        },
        {
            id: "view",
            class: "content-view-top-left-4",
            title: "查看",
            icon: "/icons/file-explorer/toolbaricon/All Apps.png",
            handler: () => toggleMenu("view"),
            hasDropdown: true,
            menuKey: "view",
            subItems: [
                { label: "平铺", action: () => handleViewAction("largeIcons") },
                { label: "详细信息", action: () => handleViewAction("details") },
            ],
        },
        {
            id: "more",
            class: "content-view-top-left-5",
            title: "更多",
            icon: "/icons/file-explorer/toolbaricon/More.png",
            handler: () => toggleMenu("more"),
            hasDropdown: true,
            menuKey: "more",
            subItems: [
                { label: "属性", action: () => handleMoreAction("properties") },
                { label: "选项", action: () => handleMoreAction("options") },
            ],
        },
    ]);
    const newButton = computed(() => toolbarDropdownButtons.value[0]);
    const toggleMenu = (menu: "view" | "sort" | "more" | null) => {
        const targetMenu = uiState.openMenu === menu ? null : menu;
        setOpenMenu(targetMenu);
    };
    const handleSortAction = (action: "name" | "date" | "type") => {
        setSortKey(action);
        setOpenMenu(null);
    };
    const handleViewAction = (action: "largeIcons" | "details") => {
        setViewMode(action);
        setOpenMenu(null);
    };
    const handleMoreAction = (action: string) => {
        console.log("More action:", action);
        setOpenMenu(null);
    };
    const handleCreateNewFolder = () => {
        const parentId = activeTab.value.currentPathId;
        const newFolder = createNewFolder(parentId);
        if (newFolder) {
            setSelection(newFolder.id);
            startRename(newFolder.id);
        }
    };
    const handleCreateNewFile = () => {
        const parentId = activeTab.value.currentPathId;
        const newFile = createNewFile(parentId);
        if (newFile) {
            setSelection(newFile.id);
            startRename(newFile.id);
        }
    };

    //  UI 状态操作
    const uiState = reactive({
        viewMode: "details" as "largeIcons" | "details",
        sortKey: "name" as "name" | "date" | "type",
        collapsedGroups: new Set<string>(),
        openMenu: null as "view" | "sort" | "more" | null,
        addressBar: {
            isEditing: false,
            inputValue: "",
        },
    });
    const selectionState = reactive({
        selectedItemId: null as string | null,
    });
    const renameState = reactive({
        editingNodeId: null as string | null,
        inputValue: "",
    });
    const clipboardState = reactive({
        sourceNode: null as FileSystemNode | null,
        isCut: false,
    });
    const sortedCurrentChildren = computed(() => {
        const node = currentNode.value;
        if (!node || !node.children) return [];
        const sortedList = [...node.children];
        return sortedList.sort((a, b) => {
            if (a.type !== b.type) {
                if (a.type === "folder" || a.type === "drive") return -1;
                if (b.type === "folder" || b.type === "drive") return 1;
            }
            // 使用 store.uiState.sortKey
            switch (uiState.sortKey) {
                case "date":
                    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
                case "type":
                    return getFileDisplayType(a).localeCompare(getFileDisplayType(b));
                case "name":
                default:
                    return a.name.localeCompare(b.name, "zh-CN");
            }
        });
    });

    // 侧边栏和主页配置
    const sidebarGroups = computed(() => {
        const quickAccessIds = ["desktop", "download", "docs", "music", "video"];
        const driveIds = ["c-drive", "d-drive"];
        const getNodes = (ids: string[]) =>
            ids.map((id) => findNodeById(id)).filter((n): n is FileSystemNode => !!n);
        return [
            {
                id: "quick-access",
                title: "快速访问",
                items: getNodes(quickAccessIds),
            },
            { id: "drives", title: "驱动器", items: getNodes(driveIds) },
        ];
    });
    const homeViewGroups = computed(() => [
        {
            id: "home-quick",
            title: "常用位置",
            isCollapsed: uiState.collapsedGroups.has("home-quick"),
            items: [
                "desktop",
                "download",
                "docs",
                "music",
                "video",
                "c-drive",
                "d-drive",
            ]
                .map((id) => findNodeById(id))
                .filter((n): n is FileSystemNode => !!n),
        },
        {
            id: "home-recent",
            title: "最近使用",
            isCollapsed: uiState.collapsedGroups.has("home-recent"),
            items: [
                {
                    id: "recent1",
                    parentId: null,
                    name: "工作计划.txt",
                    type: "file",
                } as FileSystemNode,
            ],
        },
    ]);

    // --- Actions ---
    const setViewMode = (mode: "largeIcons" | "details") => {
        uiState.viewMode = mode;
        uiState.openMenu = null;
    };
    const setSortKey = (key: "name" | "date" | "type") => {
        uiState.sortKey = key;
        uiState.openMenu = null;
    };
    const toggleGroupCollapse = (groupId: string) => {
        if (uiState.collapsedGroups.has(groupId)) {
            uiState.collapsedGroups.delete(groupId);
        } else {
            uiState.collapsedGroups.add(groupId);
        }
    };
    const setOpenMenu = (menu: "view" | "sort" | "more" | null) => {
        uiState.openMenu = menu;
    };

    const setSelection = (id: string | null) => {
        selectionState.selectedItemId = id;
    };
    const startRename = (id: string) => {
        const node = findNodeById(id);
        if (node) {
            // 系统预设目录不允许重命名
            const protectedIds = [
                "desktop",
                "download",
                "docs",
                "music",
                "video",
                "c-drive",
                "d-drive",
                "home",
            ];
            if (protectedIds.includes(node.id)) {
                console.warn("系统预设目录不允许重命名");
                return;
            }
            renameState.editingNodeId = id;
            renameState.inputValue = node.name;
        }
    };
    const submitRename = () => {
        if (!renameState.editingNodeId) return;
        const finalName = renameState.inputValue.trim();
        if (finalName) {
            renameNode(renameState.editingNodeId, finalName);
        }
        renameState.editingNodeId = null;
    };
    const setClipboard = (node: FileSystemNode | null, isCut: boolean) => {
        clipboardState.sourceNode = node;
        clipboardState.isCut = isCut;
    };
    const executePaste = async (targetPathId: string): Promise<{ success: boolean; message: string; newNode?: FileSystemNode | null }> => {
        if (!clipboardState.sourceNode)
            return { success: false, message: '剪贴板为空' };
        if (targetPathId === 'home')
            return { success: false, message: '不能在主页粘贴文件' };

        const sourceNode = clipboardState.sourceNode;
        const wasCut = clipboardState.isCut;
        const isDbNode = sourceNode.id.startsWith('db-');
        const isLocalNode = sourceNode.id.startsWith('local-');

        if (wasCut && isDbNode) {
            // ✅ 已持久化节点的剪切：直接 PATCH parentId（Move），保留原 db-id 和子节点
            // 1. 先从本地树中移除原节点位置
            removeNodeLocally(sourceNode.id);
            // 2. 更新节点的 parentId 并插入目标位置
            const movedNode: FileSystemNode = { ...sourceNode, parentId: targetPathId };
            const targetParent = findNodeById(targetPathId);
            if (targetParent?.children) {
                targetParent.children.push(movedNode);
            }
            // 3. 同步到后端
            await persistMove(sourceNode.id, targetPathId);

            clipboardState.sourceNode = null;
            clipboardState.isCut = false;
            selectionState.selectedItemId = null;
            return { success: true, message: '文件已移动', newNode: movedNode };

        } else {
            // 复制，或剪切本地临时节点
            const newNode = pasteNode(sourceNode, targetPathId);
            if (!newNode) return { success: false, message: '粘贴失败' };

            if (wasCut) {
                // 临时节点剪切：删本地旧节点（不需要后端删除，因为从未保存）
                removeNodeLocally(sourceNode.id);
                clipboardState.sourceNode = null;
                clipboardState.isCut = false;
                selectionState.selectedItemId = null;
            }

            // 如果源节点是本地节点，粘贴后的节点也应该是本地节点，不触发持久化
            if (!isLocalNode) {
                await persistCreate(newNode, targetPathId);
            }
            return { success: true, message: wasCut ? '文件已移动' : '文件已复制', newNode };
        }
    };
    const startEditingPath = () => {
        // 将当前面包屑路径转为 文件夹1\文件夹2 格式
        uiState.addressBar.inputValue = breadcrumbs.value
            .map((c) => c.name)
            .join("\\");
        uiState.addressBar.isEditing = true;
    };
    const cancelEditingPath = () => {
        uiState.addressBar.isEditing = false;
    };
    const submitPath = () => {
        if (!uiState.addressBar.isEditing) return;
        const targetPath = uiState.addressBar.inputValue.trim();
        uiState.addressBar.isEditing = false;

        if (!targetPath || targetPath === "主页") {
            navigateTo("home");
            return;
        }

        const parts = targetPath.split("\\").filter((p) => p.trim() !== "");
        const targetNode = findNodeByPath(parts);
        if (targetNode) {
            navigateTo(targetNode.id);
        } else {
            alert(`找不到路径: ${targetPath}`);
        }
    };

    //  文件操作逻辑
    const createNewFolder = (parentId: string) => {
        const parent = findNodeById(parentId);
        if (!parent) return null;
        if (!parent.children) parent.children = [];
        let newName = "新建文件夹";
        let counter = 1;
        const exists = (name: string) =>
            parent.children!.some((node) => node.name === name);
        if (exists(newName)) {
            counter = 2;
            while (exists(`新建文件夹${counter}`)) counter++;
            newName = `新建文件夹${counter}`;
        }
        const newId = `db-${Date.now()}`;
        const newFolder: FileSystemNode = {
            id: newId,
            parentId: parentId,
            name: newName,
            type: "folder",
            children: [],
            updatedAt: getCurrentTime(),
        };
        parent.children.push(newFolder);
        // 异步同步到后端（不阻塞UI）
        persistCreate(newFolder, parentId);
        return newFolder;
    };
    const createNewFile = (parentId: string) => {
        const parent = findNodeById(parentId);
        if (!parent || !parent.children) return null;
        let newName = "新建文本文档.txt";
        let counter = 1;
        while (parent.children.some((n) => n.name === newName)) {
            newName = `新建文本文档(${++counter}).txt`;
        }
        const newId = `db-${Date.now()}`;
        const newFile: FileSystemNode = {
            id: newId,
            parentId: parentId,
            name: newName,
            type: "file",
            updatedAt: getCurrentTime(),
            content: "",
        };
        parent.children.push(newFile);
        // 异步同步到后端
        persistCreate(newFile, parentId);
        return newFile;
    };
    const renameNode = (id: string, newName: string) => {
        const node = findNodeById(id);
        if (node) {
            node.name = newName;
            node.updatedAt = getCurrentTime();
            // 同步到后端（仅用户创建的节点）
            persistRename(id, newName);
        }
    };
    const deleteNode = (id: string) => {
        // 先同步到后端（仅用户创建节点）
        persistDelete(id);
        const remove = (nodes: FileSystemNode[]): boolean => {
            for (const [index, node] of nodes.entries()) {
                if (node.id === id) {
                    nodes.splice(index, 1);
                    return true;
                }
                if (node.children && remove(node.children)) {
                    return true;
                }
            }
            return false;
        };
        remove(fileSystemTree);
    };
    const copyNode = (node: FileSystemNode): FileSystemNode => {
        const isLocal = node.id.startsWith('local-');
        const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        return {
            ...node,
            id: isLocal ? `local-${newId}` : newId,
            updatedAt: getCurrentTime(),
            children: node.children
                ? node.children.map((child) => copyNode(child))
                : undefined,
        };
    };
    const pasteNode = (sourceNode: FileSystemNode, targetParentId: string) => {
        if (sourceNode.type === "app") {
            console.warn("应用类型文件无法执行复制或剪切操作");
            return null;
        }
        const parent = findNodeById(targetParentId);
        if (!parent || !parent.children) return null;
        const newNode = copyNode(sourceNode);
        newNode.parentId = targetParentId;
        let finalName = newNode.name;
        const exists = (name: string) =>
            parent.children!.some((n) => n.name === name);
        if (exists(finalName)) {
            finalName = `${newNode.name} - 副本`;
            let counter = 2;
            while (exists(finalName)) {
                finalName = `${newNode.name} - 副本 (${counter})`;
                counter++;
            }
        }
        newNode.name = finalName;
        parent.children.push(newNode);
        return newNode;
    };

    //右键菜单
    const itemMenuOptions = computed((): MenuOption[] => {
        const target = contextMenuState.targetItem;
        const isOpenApp = target && target.type === "app";
        
        return [
            { 
                label: "打开",
                icon: isOpenApp ? getFileIcon(target) : "/icons/menu/Open File.png",
                action: "open",
                isApp: isOpenApp ?? undefined
            },
            { label: "下载", 
              icon: "/icons/menu/Download.png",
              action: "download" },
            { isDivider: true },
            {
                label: "剪切",
                icon: "/icons/menu/Cut.png",
                action: "cut",
                disabled: !selectionState.selectedItemId,
            },
            {
                label: "复制",
                icon: "/icons/menu/Copy.png",
                action: "copy",
                disabled: !selectionState.selectedItemId,
            },
            {
                label: "重命名",
                icon: "/icons/menu/Rename1.png",
                action: "rename",
                disabled: !selectionState.selectedItemId,
            },
            { isDivider: true },
            {
                label: "删除",
                icon: "/icons/menu/Delete.png",
                action: "delete",
                disabled: !selectionState.selectedItemId,
                style: { color: "#e81123" },
            },
        ];
    });
    const blankMenuOptions = computed((): MenuOption[] => [
        {
            label: "粘贴",
            icon: "/icons/Paste1.png",
            action: "paste",
            disabled: !clipboardState.sourceNode,
            style: { opacity: clipboardState.sourceNode ? 1 : 0.5 },
        },
        { isDivider: true },
        {
            label: "新建文件夹",
            icon: "/icons/menu/Add1.png",
            action: "new-folder"
        },
        {
            label: "新建文件",
            icon: "/icons/menu/Add To1.png",
            action: "new-file"
        },
        { isDivider: true },
        {
            label: "属性",
            icon: "/icons/menu/Info.png",
            action: "properties"
        },
    ]);

    // 右键菜单状态
    const contextMenuState = reactive({
        show: false,
        x: 0,
        y: 0,
        type: "blank" as "blank" | "item",
        targetItem: null as FileSystemNode | null,
    });
    const activeMenuOptions = computed(() => {
        return contextMenuState.type === "blank"
            ? blankMenuOptions.value
            : itemMenuOptions.value;
    });
    const handleContextMenu = (
        event: MouseEvent,
        item: FileSystemNode | null = null,
    ) => {
        event.preventDefault();
        event.stopPropagation();
        contextMenuState.x = event.clientX;
        contextMenuState.y = event.clientY;

        if (item) {
            contextMenuState.type = "item";
            contextMenuState.targetItem = item;
            setSelection(item.id); // 选中该项
        } else {
            contextMenuState.type = "blank";
            contextMenuState.targetItem = null;
        }
        contextMenuState.show = true;
    };
    const closeContextMenu = () => {
        contextMenuState.show = false;
    };
    const handleMenuAction = (
        action: string,
        handleItemDbClick: (node: FileSystemNode) => void,
    ) => {
        switch (action) {
            case "open":
                if (contextMenuState.targetItem)
                    handleItemDbClick(contextMenuState.targetItem);
                break;
            case "copy":
                handleToolbarCopy();
                break;
            case "cut":
                handleToolbarCut();
                break;
            case "paste":
                handleToolbarPaste();
                break;
            case "rename":
                handleToolbarRename();
                break;
            case "delete":
                handleDelete();
                break;
            case "new-folder":
                handleCreateNewFolder();
                break;
            case "new-file":
                handleCreateNewFile();
                break;
            case "download":
                if (contextMenuState.targetItem) {
                    handleDownload(contextMenuState.targetItem);
                }
                break;
        }
        closeContextMenu();
    };

    // 外部导入文件/文件夹（改为纯本地存储）
    const importFile = async (file: File, parentId: string) => {
        const parent = findNodeById(parentId);
        if (!parent || !parent.children) return null;

        // 如果是文本类文件，读取其内容以便在记事本中查看
        let content = '';
        const textExtensions = ['.txt', '.js', '.ts', '.json', '.md', '.html', '.css', '.vue'];
        const isTextFile = file.type.startsWith('text/') || 
                          textExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (isTextFile) {
            try {
                content = await file.text();
            } catch (err) {
                console.error('读取文件内容失败:', err);
            }
        }

        const newNode: FileSystemNode = {
            id: `local-file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            parentId: parentId,
            name: file.name,
            type: 'file',
            updatedAt: getCurrentTime(),
            content: content,
            // 对于非文本文件，可以存储一个本地 URL
            filePath: URL.createObjectURL(file),
        };

        parent.children.push(newNode);
        return newNode;
    };

    const importFolder = async (name: string, parentId: string): Promise<FileSystemNode | null> => {
        const parent = findNodeById(parentId);
        if (!parent) return null;
        if (!parent.children) parent.children = [];

        let newName = name;
        let counter = 1;
        const exists = (n: string) => parent.children!.some(node => node.name === n);

        while (exists(newName)) {
            newName = `${name}(${counter})`;
            counter++;
        }

        const localFolder: FileSystemNode = {
            id: `local-folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            parentId: parentId,
            name: newName,
            type: 'folder',
            children: [],
            updatedAt: getCurrentTime()
        };

        parent.children.push(localFolder);
        // 不再调用 persistCreate，直接返回本地节点
        return localFolder;
    };
    const handleDownload = (node: FileSystemNode) => {
        const notificationStore = useNotificationStore();

        // ── 系统内置节点或本地存储节点 ──
        if (node.type === 'file' && node.content !== undefined) {
            let blob: Blob;
            if (node.content.startsWith('data:')) {
                // 如果是 base64 数据（上传的文件）
                const parts = node.content.split(',');
                const byteString = atob(parts[1] || '');
                const mimeString = parts[0]?.split(':')?.[1]?.split(';')?.[0] || 'application/octet-stream';
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                blob = new Blob([ab], { type: mimeString });
            } else {
                // 如果是普通文本
                blob = new Blob([node.content], { type: 'text/plain;charset=utf-8' });
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = node.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            notificationStore.success(`已开始下载 "${node.name}"`);
        } else if (node.type === 'folder') {
            notificationStore.warning('本地模式暂不支持打包下载文件夹');
        }
    };


    const resetUIState = () => {
        const initialTab: TabInstance = {
            id: Date.now(),
            currentPathId: "home",
            historyStack: ["home"],
            historyIndex: 0,
        };
        tabs.value = [initialTab];
        activeTabId.value = initialTab.id;

        uiState.viewMode = "details";
        uiState.sortKey = "name";
        uiState.collapsedGroups.clear();
        uiState.openMenu = null;
        uiState.addressBar.isEditing = false;
        uiState.addressBar.inputValue = "";

        selectionState.selectedItemId = null;
        renameState.editingNodeId = null;
        renameState.inputValue = "";
        clipboardState.sourceNode = null;
        clipboardState.isCut = false;

        contextMenuState.show = false;
    };

    return {
        itemMenuOptions,
        blankMenuOptions,
        contextMenuState,
        activeMenuOptions,
        handleContextMenu,
        closeContextMenu,
        handleMenuAction,

        // Data & Constants
        ICON_ASSETS,
        fileSystemTree,
        tabs,
        activeTabId,

        // 存储状态
        isLoading,
        loadError,
        loadUserFiles,
        quota,
        fetchQuota,

        // State (Reactive)
        uiState,
        selectionState,
        renameState,
        clipboardState,

        // Computeds
        activeTab,
        currentNode,
        sortedCurrentChildren,
        breadcrumbs,
        sidebarGroups,
        homeViewGroups,
        getDisplayPath,
        startEditingPath,
        cancelEditingPath,
        submitPath,
        getTabStyle,
        closeTabById,
        getTabName,
        getTabIcon,
        isNodeActive,

        navigationButtons,
        refresh,
        toolbarDropdownButtons,
        newButton,
        toggleMenu,
        handleSortAction,
        handleViewAction,
        handleMoreAction,
        handleCreateNewFolder,

        toolbarActionButtons,
        handleToolbarCut,
        handleToolbarRename,
        handleToolbarCopy,
        handleToolbarPaste,
        handleDelete,

        // Methods / Actions
        getFileIcon,
        getFileDisplayType,
        findNodeById,
        findNodeByPath,
        createNewFolder,
        createNewFile,
        renameNode,
        deleteNode,

        pasteNode,
        copyNode,

        // Navigation Actions
        setActiveTab,
        addNewTab,
        closeTab,
        navigateTo,
        goBack,
        goForward,
        goUp,

        // UI Actions
        setViewMode,
        setSortKey,
        toggleGroupCollapse,
        setOpenMenu,
        setSelection,
        startRename,
        submitRename,
        setClipboard,
        executePaste,
        importFile,
        importFolder,
        uploadFile,
        handleDownload,
        resetUIState,
    };
});
