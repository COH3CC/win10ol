import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
    useFileSystemStore,
    type FileSystemNode,
    type FileType,
} from "./fileSystem";
import { useSystemStore, type AppComponentName } from "./system";

export interface DesktopIconItem {
    id: string;
    title: string;
    icon: string;
    type: FileType;
    nodeData: FileSystemNode;
}

export const useDesktopStore = defineStore("desktop", () => {
    const fileStore = useFileSystemStore();
    const systemStore = useSystemStore();

    // 常量配置
    const GAP = 8;
    const ICON_BASE_W = 80;
    const ICON_BASE_H = 90;
    const ICON_WIDTH = ICON_BASE_W + GAP;
    const ICON_HEIGHT = ICON_BASE_H + GAP;
    const desktopWidth = ref(window.innerWidth);
    const desktopHeight = ref(window.innerHeight - 44);
    const draggingIconId = ref<string | null>(null);

    // 计算混合类型的桌面图标
    const combinedDesktopIcons = computed<DesktopIconItem[]>(() => {
        const list: DesktopIconItem[] = [];
        const desktopNode = fileStore.findNodeById("desktop");
        if (desktopNode && desktopNode.children) {
            desktopNode.children.forEach((child) => {
                let icon = child.icon || "icons/application/computer.png";
                if (!child.icon) {
                    if (child.type === "folder") {
                        if (child.children && child.children.length > 0) {
                            icon = "icons/file-explorer/fileicon/162.png";
                        } else {
                            icon = "icons/file-explorer/fileicon/emptyfile.png";
                        }
                    }
                    if (child.name.endsWith(".exe")) icon = "icons/184.png";
                }
                list.push({
                    id: child.id,
                    title: child.name,
                    icon: icon,
                    type: child.type,
                    nodeData: child,
                });
            });
        }
        return list;
    });

    // 计算图标样式
    const getIconStyle = (item: any, index: number) => {
        let leftPos = 0,
            topPos = 0;
        const customPos = customIconPositions.value[item.id];
        if (customPos) {
            leftPos = customPos.x;
            topPos = customPos.y;
        } else {
            const h = desktopHeight.value;
            const maxIconsPerColumn = Math.max(1, Math.floor(h / ICON_HEIGHT));
            const col = Math.floor(index / maxIconsPerColumn);
            const row = index % maxIconsPerColumn;
            leftPos = col * ICON_WIDTH + GAP;
            topPos = row * ICON_HEIGHT + GAP;
        }
        return {
            position: "absolute" as const,
            left: `${leftPos}px`,
            top: `${topPos}px`,
            width: `${ICON_BASE_W}px`,
            height: `${ICON_BASE_H}px`,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center" as const,
            transition:
                draggingIconId.value === item.id
                    ? "none"
                    : "left 0.2s ease-out, top 0.2s ease-out",
            zIndex: draggingIconId.value === item.id ? 100 : 1,
            cursor: "default",
            userSelect: "none" as const,
        };
    };

    // 拖拽逻辑
    const handleIconDrag = (
        item: DesktopIconItem,
        e: MouseEvent,
        renamingId: string | null,
    ) => {
        if (e.button !== 0 || renamingId === item.id) return;
        const mouseStartX = e.clientX;
        const mouseStartY = e.clientY;
        let startX = 0,
            startY = 0;
        const currentPos = customIconPositions.value[item.id];
        if (currentPos) {
            startX = currentPos.x;
            startY = currentPos.y;
        } else {
            const iconIndex = combinedDesktopIcons.value.findIndex(
                (i) => i.id === item.id,
            );
            const h = desktopHeight.value;
            const maxIconsPerColumn = Math.max(1, Math.floor(h / ICON_HEIGHT));
            startX = Math.floor(iconIndex / maxIconsPerColumn) * ICON_WIDTH + GAP;
            startY = (iconIndex % maxIconsPerColumn) * ICON_HEIGHT + GAP;
        }
        let hasMoved = false;
        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - mouseStartX;
            const deltaY = moveEvent.clientY - mouseStartY;
            if (!hasMoved && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
                hasMoved = true;
                draggingIconId.value = item.id;
            }
            if (hasMoved) {
                setIconPosition(item.id, startX + deltaX, startY + deltaY);
            }
        };
        const onMouseUp = () => {
            if (hasMoved && draggingIconId.value) {
                const currentId = draggingIconId.value;
                const pos = customIconPositions.value[currentId];
                if (pos) {
                    let targetX =
                        Math.round((pos.x - GAP) / ICON_WIDTH) * ICON_WIDTH + GAP;
                    let targetY =
                        Math.round((pos.y - GAP) / ICON_HEIGHT) * ICON_HEIGHT + GAP;
                    const maxCols = Math.floor((desktopWidth.value - GAP) / ICON_WIDTH);
                    const maxRows = Math.floor((desktopHeight.value - GAP) / ICON_HEIGHT);
                    targetX = Math.max(
                        GAP,
                        Math.min(targetX, (maxCols - 1) * ICON_WIDTH + GAP),
                    );
                    targetY = Math.max(
                        GAP,
                        Math.min(targetY, (maxRows - 1) * ICON_HEIGHT + GAP),
                    );
                    const isOccupied = combinedDesktopIcons.value.some((icon, idx) => {
                        if (icon.id === currentId) return false;
                        const p = customIconPositions.value[icon.id];
                        let iconX, iconY;
                        if (p) {
                            iconX = p.x;
                            iconY = p.y;
                        } else {
                            const maxIcons = Math.max(
                                1,
                                Math.floor(desktopHeight.value / ICON_HEIGHT),
                            );
                            iconX = Math.floor(idx / maxIcons) * ICON_WIDTH + GAP;
                            iconY = (idx % maxIcons) * ICON_HEIGHT + GAP;
                        }
                        return iconX === targetX && iconY === targetY;
                    });
                    if (!isOccupied) {
                        setIconPosition(currentId, targetX, targetY);
                    } else {
                        setIconPosition(currentId, startX, startY);
                    }
                }
            }
            draggingIconId.value = null;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    const updateDesktopSize = () => {
        desktopWidth.value = window.innerWidth;
        desktopHeight.value = window.innerHeight - 44;
    };
    const customIconPositions = ref<Record<string, { x: number; y: number }>>({});
    const setIconPosition = (id: string, x: number, y: number) => {
        customIconPositions.value[id] = { x, y };
    };
    const handleDesktopIconDblClick = (item: DesktopIconItem) => {
        const { nodeData } = item;
        if (nodeData.type === "app") {
            // 打开应用窗口
            systemStore.openWindow(nodeData.id as AppComponentName, nodeData.name);
        } else if (nodeData.type === "folder") {
            // 打开文件夹
            systemStore.openWindow("FileExplorer", nodeData.name, {
                initialPathId: nodeData.id,
            });
        } else if (nodeData.type === "file") {
            // 处理文件打开逻辑
            if (nodeData.id === "about") {
                systemStore.openWindow("WinAbout", "关于");
            } else if (nodeData.name.toLowerCase().endsWith(".txt")) {
                // 如果是文本文件，用记事本打开
                systemStore.openWindow("Txtreader", nodeData.name, {
                    title: nodeData.name,
                    content: nodeData.content || "",
                });
            }
        }
    };

    return {
        combinedDesktopIcons,
        draggingIconId,
        getIconStyle,
        handleIconDrag,
        updateDesktopSize,
        desktopWidth,
        desktopHeight,
        customIconPositions,
        setIconPosition,
        handleDesktopIconDblClick,
    };
});
