import { defineStore } from "pinia";
import { ref, computed, shallowRef, onMounted, onUnmounted } from "vue";
import FileExplorer from "../components/File-Explorer.vue";
import WinAbout from "../components/winabout.vue";
import WinSetting from "../components/winsetting.vue";
import txtreader from "@/components/Notepad.vue";
import { useFileSystemStore } from "./fileSystem";
import { useMenuStore } from "./menu";

export const APP_IDS = {
    FILE_EXPLORER: "FileExplorer",
    WIN_SETTING: "WinSetting",
    WIN_ABOUT: "WinAbout",
    TXT_READER: "Txtreader",
    MS_ACCESS: "Mincrosoft Access",
    MS_EXCEL: "Mincrosoft Excel",
    MS_PPT: "Mincrosoft PowerPoint",
    EDGE: "Microsoft Edge",
    TERMINAL: "Windows Terminal",
} as const;
export type AppComponentName = (typeof APP_IDS)[keyof typeof APP_IDS];

// 应用窗口右键菜单类型：null 表示不支持右键菜单
export type AppContextMenuType = "notepad" | null;

export interface WindowInstance {
    id: number;
    component: any;
    componentName: AppComponentName;
    title: string;
    top: number;
    left: number;
    width: number;
    height: number;
    zIndex: number;
    isMinimized: boolean;
    isMaximized: boolean;
    snapState: "none" | "left" | "right";
    restoreTop: number;
    restoreLeft: number;
    restoreWidth: number;
    restoreHeight: number;
    props?: any;
    // 应用绑定的右键菜单类型，null 表示该应用不支持右键菜单
    contextMenuType: AppContextMenuType;
}
interface AppWindowConfig {
    defaultWidth?: number;
    defaultHeight?: number;
    // 应用内右键菜单类型，null 或不填表示该应用不支持右键菜单
    contextMenuType?: AppContextMenuType;
}

interface AppConfigItem {
    componentName: AppComponentName;
    title: string;
    icon: string;
    taskbarIcon: string;
    component: any;
    windowConfig?: AppWindowConfig;
}

export const useSystemStore = defineStore("system", () => {
    const theme = ref<"light" | "dark">("light");

    const setTheme = (newTheme: "light" | "dark") => {
        theme.value = newTheme;

        // 自动切换对应主题的壁纸
        if (backgroundType.value === "图片") {
            const themePath = `images/desktop/${newTheme}/`;
            const options = wallOptions.value.filter(wall => wall.includes(themePath));
            if (options.length > 0) {
                // 如果当前壁纸不属于新主题，则自动从对应主题中随机挑选一张
                if (wallpaper.value && !wallpaper.value.includes(themePath)) {
                    const randomIndex = Math.floor(Math.random() * options.length);
                    wallpaper.value = options[randomIndex];
                }
            }
        }
    };

    // 应用注册表
    const APP_CONFIG: AppConfigItem[] = [
        {
            componentName: APP_IDS.FILE_EXPLORER,
            title: "此电脑",
            icon: "appicons/computer.png",
            taskbarIcon: "appicons/File Explorer.png",
            component: shallowRef(FileExplorer),
            windowConfig: {
                defaultWidth: 975,
                defaultHeight: 558,
                contextMenuType: null,
            },
        },
        {
            componentName: APP_IDS.WIN_SETTING,
            title: "设置",
            icon: "appicons/Setting.png",
            taskbarIcon: "appicons/Setting.png",
            component: shallowRef(WinSetting),
            windowConfig: {
                defaultWidth: 1000,
                defaultHeight: 600,
                contextMenuType: null,
            },
        },
        {
            componentName: APP_IDS.WIN_ABOUT,
            title: "关于项目",
            icon: "appicons/about.png",
            taskbarIcon: "appicons/about.png",
            component: shallowRef(WinAbout),
            windowConfig: {
                defaultWidth: 600,
                defaultHeight: 500,
                contextMenuType: null,
            },
        },
        {
            componentName: APP_IDS.TXT_READER,
            title: "记事本",
            icon: "appicons/Notepad.png",
            taskbarIcon: "appicons/Notepad.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 1000,
                defaultHeight: 600,
                contextMenuType: "notepad",
            },
        },
        {
            componentName: "Mincrosoft Access",
            title: "Access",
            icon: "appicons/Access.png",
            taskbarIcon: "appicons/Access.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 975,
                defaultHeight: 558,
                contextMenuType: null,
            },
        },
        {
            componentName: "Mincrosoft Excel",
            title: "Excel",
            icon: "appicons/Excel.png",
            taskbarIcon: "appicons/Excel.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 975,
                defaultHeight: 558,
                contextMenuType: null,
            },
        },
        {
            componentName: "Mincrosoft PowerPoint",
            title: "PowerPoint",
            icon: "appicons/PowerPoint.png",
            taskbarIcon: "appicons/PowerPoint.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 975,
                defaultHeight: 558,
                contextMenuType: null,
            },
        },
        {
            componentName: APP_IDS.FILE_EXPLORER,
            title: "文件管理器",
            icon: "appicons/File Explorer.png",
            taskbarIcon: "appicons/File Explorer.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 975,
                defaultHeight: 558,
                contextMenuType: null,
            },
        },
        {
            componentName: "Microsoft Edge",
            title: "Edge",
            icon: "appicons/Microsoft Edge.png",
            taskbarIcon: "appicons/Microsoft Edge.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 1100,
                defaultHeight: 700,
                contextMenuType: null,
            },
        },
        {
            componentName: "Windows Terminal",
            title: "终端",
            icon: "appicons/Windows Terminal.png",
            taskbarIcon: "appicons/Windows Terminal.png",
            component: shallowRef(txtreader),
            windowConfig: {
                defaultWidth: 800,
                defaultHeight: 500,
                contextMenuType: null,
            },
        },
    ];

    // 任务栏
    const fixedApps = ref<AppComponentName[]>([
        APP_IDS.FILE_EXPLORER,
        APP_IDS.WIN_SETTING,
    ]);
    const isAppFixed = (id: string) => fixedApps.value.includes(id as AppComponentName);
    const getAppIcon = (name: string) => {
        const app = APP_CONFIG.find((app) => app.componentName === name);
        return app?.taskbarIcon;
    };
    const togglePinApp = (id: string) => {
        const fileStore = useFileSystemStore();
        const node = fileStore.findNodeById(id);

        if (!node || node.type !== "app") return;
        const index = fixedApps.value.indexOf(id as AppComponentName);
        if (index > -1) {
            fixedApps.value.splice(index, 1);
        } else {
            if (Object.values(APP_IDS).includes(id as any)) {
                fixedApps.value.push(id as AppComponentName);
            }
        }
    };
    const taskbarItems = computed(() => {
        const items: any[] = [];
        const processedNames = new Set<string>();

        // 处理固定应用
        fixedApps.value.forEach((appId) => {
            const appConfig = APP_CONFIG.find((a) => a.componentName === appId);
            if (appConfig) {
                const win = openWindows.value.find((w) => w.componentName === appId);
                items.push({
                    id: win ? win.id : -1,
                    componentName: appConfig.componentName,
                    title: appConfig.title,
                    state: win ? (win.isMinimized ? "minimized" : "open") : "closed",
                });
                processedNames.add(appId);
            }
        });

        // 处理未固定但已打开的应用
        openWindows.value.forEach((win) => {
            if (!processedNames.has(win.componentName)) {
                items.push({
                    id: win.id,
                    componentName: win.componentName,
                    title: win.title,
                    state: win.isMinimized ? "minimized" : "open",
                });
            }
        });
        return items;
    });
    const handleTaskbarClick = (item: any) => {
        // 查找是否已有该应用的窗口实例
        const win = openWindows.value.find((w) => w.id === item.id);

        if (!win) {
            // 如果窗口不存在，打开新窗口
            openWindow(item.componentName, item.title);
        } else if (win.isMinimized) {
            // 如果窗口已最小化，恢复显示并置顶
            win.isMinimized = false;
            bringToFront(win.id);
        } else {
            // 如果窗口已在桌面
            if (win.id === activeWindowId.value) {
                // 如果当前已经是活动窗口，则最小化
                minimizeWindow(win.id);
            } else {
                // 如果不是活动窗口，则将其置顶
                bringToFront(win.id);
            }
        }
    };

    // 按钮列表
    const leftMenuButtons = ref([
        {
            id: "start",
            name: "开始",
            icon: "icons/Global Navigation Button.png",
            actionName: "toggleSubMenu",
        },
        {
            id: "user",
            name: "Guest",
            icon: "icons/Contact.png",
            actionName: "noop",
        },
        { id: "docs", name: "文档", icon: "icons/Page.png", actionName: "noop" },
        { id: "pics", name: "图片", icon: "icons/Photo 2.png", actionName: "noop" },
        {
            id: "settings",
            name: "设置",
            icon: "icons/Setting.png",
            actionName: "openSettings",
        },
        {
            id: "power",
            name: "电源",
            icon: "icons/Power Button.png",
            actionName: "logout",
        },
    ]);
    const tibarLeftButtons = ref([
        {
            id: "start",
            name: "开始",
            icon: "icons/system/Windows 10.png",
            hoverIcon: "icons/system/Windows 10X.png",
            iconSize: 18,
            hoverIconSize: 18,
            class: "open",
            actionName: "toggleStartMenu",
        },
        {
            id: "search",
            name: "搜索",
            icon: "icons/system/Search1.png",
            hoverIcon: "icons/system/Search.png",
            iconSize: 18,
            hoverIconSize: 18,
            class: "",
            actionName: "search",
        },
        {
            id: "taskview",
            name: "任务视图",
            icon: "icons/system/Task View1.png",
            hoverIcon: "icons/system/Task View.png",
            iconSize: 18,
            hoverIconSize: 18,
            class: "",
            actionName: "taskview",
        },
    ]);
    const tibarRightButtons = computed(() => [
        {
            id: "infoview",
            class: "tibar-right-infoview",
            actionName: "toggleInfoMenu",
            isCustom: true,
        },
        {
            id: "time",
            class: "tibar-right-time",
            actionName: "toggleTimeMenu",
            isTime: true,
        },
        {
            id: "aibtn",
            class: "tibar-right-aibtn",
            actionName: "toggleAiMenu",
            icon: "icons/system/Cortana Black.png",
            darkIcon: "icons/system/Cortana Dark.png",
            hoverIcon: "icons/system/Cortana Blue.png",
            imgClass: "tibar-right-aibtn-img",
        },
    ]);
    const executeAction = (actionName: string) => {
        const actions: Record<string, () => void> = {
            toggleSubMenu: () => toggleSubMenu(),
            toggleStartMenu: () => toggleStartMenu(),
            toggleInfoMenu: () => toggleInfoMenu(),
            toggleTimeMenu: () => toggleTimeMenu(),
            toggleAiMenu: () => toggleAiMenu(),
            openSettings: () => openWindow("WinSetting", "设置"),
            logout: () => logout(),
            search: () => console.log("Open Search"),
            taskview: () => console.log("Open Task View"),
            noop: () => { },
        };

        if (actions[actionName]) {
            actions[actionName]();
        } else {
            console.warn(`Action "${actionName}" is not defined.`);
        }
    };
    const topButton = computed(() =>
        leftMenuButtons.value.find((btn) => btn.id === "start"),
    );
    const bottomButtons = computed(() =>
        leftMenuButtons.value.filter((btn) => btn.id !== "start"),
    );

    //系统组件菜单
    const showInfoMenu = ref(false);
    const showTimeMenu = ref(false);
    const showAiMenu = ref(false);
    const showStartMenu = ref(false);
    const showSubMenu = ref(false);
    const startMenuWidth = ref(631);
    const startMenuHeight = ref(595);
    const isResizingStartMenu = ref(false);
    const resizeDirection = ref<"top" | "right" | "top-right" | null>(null);
    const START_MENU_WIDTH_TARGETS = [298, 631, 954, 1277];
    let menuHoverTimer: any = null;
    const menuStore = useMenuStore();
    const toggleStartMenu = () => {
        menuStore.closeMenu();
        showStartMenu.value = !showStartMenu.value;
        if (!showStartMenu.value) {
            showSubMenu.value = false;
        } else {
            showInfoMenu.value = false;
            showTimeMenu.value = false;
            showAiMenu.value = false;
        }
    };
    const toggleSubMenu = (state?: boolean) => {
        menuStore.closeMenu();
        showSubMenu.value = state !== undefined ? state : !showSubMenu.value;
    };
    const updateStartMenuSize = (width: number, height: number) => {
        startMenuWidth.value = width;
        startMenuHeight.value = height;
    };
    const finalizeStartMenuWidth = () => {
        const closestWidth = START_MENU_WIDTH_TARGETS.reduce((prev, curr) => {
            return Math.abs(curr - startMenuWidth.value) <
                Math.abs(prev - startMenuWidth.value)
                ? curr
                : prev;
        });
        startMenuWidth.value = closestWidth;
    };
    const toggleInfoMenu = () => {
        menuStore.closeMenu();
        showInfoMenu.value = !showInfoMenu.value;
        if (showInfoMenu.value) {
            showTimeMenu.value = false;
            showAiMenu.value = false;
            showStartMenu.value = false;
        }
    };
    const toggleTimeMenu = () => {
        menuStore.closeMenu();
        showTimeMenu.value = !showTimeMenu.value;
        if (showTimeMenu.value) {
            showInfoMenu.value = false;
            showAiMenu.value = false;
            showStartMenu.value = false;
        }
    };
    const toggleAiMenu = () => {
        menuStore.closeMenu();
        showAiMenu.value = !showAiMenu.value;
        if (showAiMenu.value) {
            showInfoMenu.value = false;
            showTimeMenu.value = false;
            showStartMenu.value = false;
        }
    };
    const closeAllPopups = () => {
        if (menuHoverTimer) clearTimeout(menuHoverTimer);
        showInfoMenu.value = false;
        showTimeMenu.value = false;
        showAiMenu.value = false;
        showStartMenu.value = false;
        showSubMenu.value = false;
    };
    const handleLeftMenuMouseEnter = () => {
        if (menuHoverTimer) clearTimeout(menuHoverTimer);
        menuHoverTimer = setTimeout(() => {
            showSubMenu.value = true;
        }, 500);
    };
    const handleLeftMenuMouseLeave = () => {
        if (menuHoverTimer) clearTimeout(menuHoverTimer);
    };
    const handleSubMenuMouseEnter = () => {
        if (menuHoverTimer) clearTimeout(menuHoverTimer);
    };
    const handleSubMenuMouseLeave = () => {
        showSubMenu.value = false;
    };

    // 壁纸
    const wallOptions = ref<string[]>([
        "images/desktop/light/green.jpg",
        "images/desktop/light/light.jpg",
        "images/desktop/light/light2.jpg",
        "images/desktop/light/light3.jpg",
        "images/desktop/light/light4.jpg",
        "images/desktop/light/light5.jpg",
        "images/desktop/light/Windows (1).jpg",
        "images/desktop/light/Windows (2).jpg",
        "images/desktop/dark/dark3.jpg",
        "images/desktop/dark/5.jpg",
        "images/desktop/dark/dark3.jpg",
        "images/desktop/dark/dark4.jpg",
        "images/desktop/dark/Fire Spiral.jpg",
        "images/desktop/dark/Layers.jpg",
        "images/desktop/dark/The Grid.jpg",
        "images/desktop/dark/Windows (3).jpg",
    ]);
    const lockOptions = ref<string[]>([
        "images/lock/green.jpg",
        "images/lock/win10fish.jpg",
        "images/lock/Data Link.jpg",
    ]);
    const colorOptions = ref<string[]>([
        "#0078d7",
        "#ef6950",
        "#0099bc",
        "#00120d",
        "#5133ab",
        "#e81123",
    ]);

    const backgroundType = ref<"图片" | "纯色">("图片");
    const backgroundColor = ref(colorOptions.value[0]);
    const wallpaper = ref(wallOptions.value[0]);
    const useThumbnails = ref(true); // 是否使用缩略图
    const lockBackgroundType = ref<"图片" | "纯色">("图片");
    const lockBackgroundColor = ref(colorOptions.value[0]);
    const lockWallpaper = ref(lockOptions.value[1]);

    const setWallpaper = (img: string) => {
        wallpaper.value = img;
        backgroundType.value = "图片";
    };
    const setBackgroundColor = (color: string) => {
        backgroundColor.value = color;
        backgroundType.value = "纯色";
    };
    const setBackgroundType = (type: "图片" | "纯色") => {
        backgroundType.value = type;
    };
    const setLockWallpaper = (img: string) => {
        lockWallpaper.value = img;
        lockBackgroundType.value = "图片";
    };
    const setLockBackgroundColor = (color: string) => {
        lockBackgroundColor.value = color;
        lockBackgroundType.value = "纯色";
    };
    const setLockBackgroundType = (type: "图片" | "纯色") => {
        lockBackgroundType.value = type;
    };
    const desktopStyle = computed(() => {
        if (backgroundType.value === "图片") {
            return {
                backgroundImage: `url('${wallpaper.value}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            };
        } else {
            return {
                backgroundColor: backgroundColor.value,
            };
        }
    });
    const lockScreenStyle = computed(() => {
        if (lockBackgroundType.value === "图片") {
            return {
                backgroundImage: `url('${lockWallpaper.value}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            };
        } else {
            return {
                backgroundColor: lockBackgroundColor.value,
            };
        }
    });

    // 亮度与夜间模式
    const brightness = ref(100);
    const isNightMode = ref(false);
    const nightModeIntensity = ref(50);

    // 定时夜间模式
    const isTimeNightMode = ref(false);
    const nightModeType = ref<"sunset" | "custom">("sunset");
    const nightModeStart = ref({ hour: 21, minute: 0 });
    const nightModeEnd = ref({ hour: 7, minute: 0 });

    const checkNightModeSchedule = () => {
        if (!isTimeNightMode.value) return;

        const now = currentTime.value;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        let startInMinutes, endInMinutes;

        if (nightModeType.value === "sunset") {
            // 模拟日落日出时间：18:00 - 06:00
            startInMinutes = 18 * 60;
            endInMinutes = 6 * 60;
        } else {
            startInMinutes =
                nightModeStart.value.hour * 60 + nightModeStart.value.minute;
            endInMinutes = nightModeEnd.value.hour * 60 + nightModeEnd.value.minute;
        }

        let shouldBeNightMode = false;
        if (startInMinutes < endInMinutes) {
            // 同一天内，例如 08:00 - 18:00
            shouldBeNightMode =
                currentTimeInMinutes >= startInMinutes &&
                currentTimeInMinutes < endInMinutes;
        } else {
            // 跨天，例如 21:00 - 07:00
            shouldBeNightMode =
                currentTimeInMinutes >= startInMinutes ||
                currentTimeInMinutes < endInMinutes;
        }

        if (isNightMode.value !== shouldBeNightMode) {
            isNightMode.value = shouldBeNightMode;
        }
    };

    const globalBrightnessStyle = computed(() => {
        const brightnessValue = brightness.value / 100;
        let filters = [`brightness(${brightnessValue})`];

        if (isNightMode.value) {
            // 夜间模式：增加 sepia (褐色) 和降低蓝光效果
            // 强度 0-100 对应 sepia(0) 到 sepia(0.6)
            const sepiaValue = (nightModeIntensity.value / 100) * 0.6;
            filters.push(`sepia(${sepiaValue})`);
            // 稍微增加饱和度补偿 sepia 带来的灰度感
            const saturateValue = 1 + (nightModeIntensity.value / 100) * 0.2;
            filters.push(`saturate(${saturateValue})`);
            // 稍微向暖色调偏移
            const hueRotateValue = -(nightModeIntensity.value / 100) * 10;
            filters.push(`hue-rotate(${hueRotateValue}deg)`);
        }

        return {
            filter: filters.join(" "),
        };
    });

    // 锁屏
    const isLocked = ref(true);
    const showLogin = ref(false);
    const handleLockScreenClick = () => {
        if (!showLogin.value) showLogin.value = true;
    };
    const login = () => {
        isLocked.value = false;
        showLogin.value = false;
        closeAllPopups();
    };
    const logout = () => {
        isLocked.value = true;
        showLogin.value = false;
    };
    const triggerRefresh = () => {
        if (isRefreshing.value) return;
        isRefreshing.value = true;
        setTimeout(() => {
            isRefreshing.value = false;
        }, 300);
    };
    const setShowLogin = (value: boolean) => {
        showLogin.value = value;
    };

    // --- 时间与日期 ---
    const currentTime = ref(new Date());
    let timer: any = null;
    const updateTime = () => {
        currentTime.value = new Date();
        checkNightModeSchedule();
    };
    onMounted(() => {
        if (!timer) {
            timer = setInterval(updateTime, 1000);
        }
    });
    onUnmounted(() => {
        if (timer) clearInterval(timer);
    });
    const timeDisplay = computed(() => {
        const h = currentTime.value.getHours().toString().padStart(2, "0");
        const m = currentTime.value.getMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    });
    const dateDisplayTaskbar = computed(() => {
        const y = currentTime.value.getFullYear();
        const m = (currentTime.value.getMonth() + 1).toString().padStart(2, "0");
        const d = currentTime.value.getDate().toString().padStart(2, "0");
        return `${y}/${m}/${d}`;
    });
    const dateDisplayLock = computed(() => {
        return currentTime.value.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        });
    });

    // --- 窗口管理 ---
    const openWindows = ref<WindowInstance[]>([]);
    const zIndex = ref(10);
    let nextWindowId = 1;
    const DEFAULT_WINDOW_WIDTH = 975;
    const DEFAULT_WINDOW_HEIGHT = 558;
    const OFFSET_STEP = 30;
    const MAX_OFFSET = 150;
    const activeWindowId = computed<number>(() => {
        const activeWin = openWindows.value.find(
            (win) => win.zIndex === zIndex.value && !win.isMinimized,
        );
        return activeWin ? activeWin.id : -1;
    });
    const bringToFront = (id: number) => {
        zIndex.value++;
        const win = openWindows.value.find((w) => w.id === id);
        if (win) {
            win.zIndex = zIndex.value;
            if (win.isMinimized) win.isMinimized = false;
        }
    };
    const openWindow = (
        componentName: AppComponentName,
        title: string,
        props: any = {},
    ) => {
        //检查是否存在 (对于 FileExplorer 特殊处理路径更新逻辑)
        const existingWindow = openWindows.value.find(
            (win) => win.componentName === componentName,
        );
        if (existingWindow) {
            if (componentName === "FileExplorer" && props.initialPathId) {
                existingWindow.props = { ...existingWindow.props, ...props };
            }
            // 恢复并置顶
            if (existingWindow.isMinimized) existingWindow.isMinimized = false;
            bringToFront(existingWindow.id);
            return;
        }
        const appInfo = APP_CONFIG.find((a) => a.componentName === componentName);
        if (!appInfo) return;
        //计算初始位置
        const desktopWidth = window.innerWidth;
        const desktopHeight = window.innerHeight - 44;
        const windowWidth = appInfo.windowConfig?.defaultWidth ?? DEFAULT_WINDOW_WIDTH;
        const windowHeight = appInfo.windowConfig?.defaultHeight ?? DEFAULT_WINDOW_HEIGHT;
        const centerLeft = (desktopWidth - windowWidth) / 2;
        const centerTop = (desktopHeight - windowHeight) / 2;
        const offset = (openWindows.value.length * OFFSET_STEP) % MAX_OFFSET;
        const initialLeft = Math.max(0, centerLeft + offset);
        const initialTop = Math.max(0, centerTop + offset);
        const newWindow: WindowInstance = {
            id: nextWindowId++,
            component: appInfo.component,
            componentName: componentName,
            title: title || appInfo.title,
            top: initialTop,
            left: initialLeft,
            width: windowWidth,
            height: windowHeight,
            zIndex: zIndex.value + 1,
            isMinimized: false,
            isMaximized: false,
            snapState: "none",
            restoreTop: initialTop,
            restoreLeft: initialLeft,
            restoreWidth: windowWidth,
            restoreHeight: windowHeight,
            props: props,
            contextMenuType: appInfo.windowConfig?.contextMenuType ?? null,
        };
        openWindows.value.push(newWindow);
        bringToFront(newWindow.id);
    };
    const closeWindow = (id: number) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (win && win.componentName === APP_IDS.FILE_EXPLORER) {
            const fileStore = useFileSystemStore();
            fileStore.resetUIState();
        }
        openWindows.value = openWindows.value.filter((win) => win.id !== id);
    };
    const minimizeWindow = (id: number) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (win) win.isMinimized = true;
    };
    const toggleMaximizeWindow = (id: number) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        // 如果窗口当前是半屏或全屏，统一先恢复
        if (win.isMaximized || win.snapState !== "none") {
            win.isMaximized = false;
            win.snapState = "none"; // 重置半屏状态
            win.top = win.restoreTop;
            win.left = win.restoreLeft;
            win.width = win.restoreWidth;
            win.height = win.restoreHeight;
        } else {
            // 保存当前位置用于恢复
            win.restoreTop = win.top;
            win.restoreLeft = win.left;
            win.restoreWidth = win.width;
            win.restoreHeight = win.height;

            win.isMaximized = true;
            win.top = 0;
            win.left = 0;
            win.width = window.innerWidth;
            win.height = window.innerHeight - 44; // 扣除任务栏高度
        }
    };
    const startResizeStartMenu = (
        direction: "top" | "right" | "top-right",
        e: MouseEvent,
    ) => {
        isResizingStartMenu.value = true;
        resizeDirection.value = direction;

        const startX = e.clientX;
        const startY = e.clientY;
        const initialWidth = startMenuWidth.value;
        const initialHeight = startMenuHeight.value;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizingStartMenu.value) return;

            let newWidth = initialWidth;
            let newHeight = initialHeight;

            // 宽度计算
            if (
                resizeDirection.value === "right" ||
                resizeDirection.value === "top-right"
            ) {
                newWidth = initialWidth + (moveEvent.clientX - startX);
                // 限制最小宽度及最大宽度（不超过窗口）
                newWidth = Math.max(298, Math.min(newWidth, window.innerWidth - 50));
            }

            // 高度计算
            if (
                resizeDirection.value === "top" ||
                resizeDirection.value === "top-right"
            ) {
                newHeight = initialHeight - (moveEvent.clientY - startY);
                // 限制最小高度及最大高度
                newHeight = Math.max(
                    300,
                    Math.min(newHeight, window.innerHeight - 100),
                );
            }

            // 更新实时尺寸
            updateStartMenuSize(newWidth, newHeight);
        };

        const onMouseUp = () => {
            if (
                resizeDirection.value === "right" ||
                resizeDirection.value === "top-right"
            ) {
                // 执行阶梯吸附逻辑
                finalizeStartMenuWidth();
            }

            isResizingStartMenu.value = false;
            resizeDirection.value = null;
            // 移除全局监听
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        // 注册全局监听以保证拖拽平滑
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    const windowActions = {
        close: (id: number) => closeWindow(id),
        minimize: (id: number) => minimizeWindow(id),
        maximize: (id: number) => toggleMaximizeWindow(id),
    };

    // --- 状态定义 ---
    const dragState = ref<{
        id: number;
        startX: number;
        startY: number;
        initialTop: number;
        initialLeft: number;
    } | null>(null);
    const resizeState = ref<any>(null);
    const MIN_WINDOW_WIDTH = 400;
    const MIN_WINDOW_HEIGHT = 228;
    const windowHeaderHeight = ref(40);
    const startDrag = (id: number, e: MouseEvent) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        bringToFront(id);
        const startX = e.clientX;
        const startY = e.clientY;
        const initialTop = win.top;
        const initialLeft = win.left;

        const onMouseMove = (moveEvent: MouseEvent) => {
            let newLeft = initialLeft + (moveEvent.clientX - startX);
            let newTop = initialTop + (moveEvent.clientY - startY);

            // 如果窗口处于全屏或半屏状态，只要一动，就恢复原始大小
            if (win.isMaximized || win.snapState !== "none") {
                const ratio = (moveEvent.clientX - win.left) / win.width;
                win.isMaximized = false;
                win.snapState = "none";
                win.width = win.restoreWidth;
                win.height = win.restoreHeight;
                // 调整 newLeft，使鼠标保持在标题栏相对位置
                newLeft = moveEvent.clientX - win.width * ratio;
                newTop = moveEvent.clientY - 15; // 假设标题栏高度感应
            }

            win.left = newLeft;
            win.top = newTop;
        };

        const onMouseUp = (upEvent: MouseEvent) => {
            handleWindowSnap(id, upEvent.clientX, upEvent.clientY); // 松开时判断是否吸附
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };
    const handleDrag = (e: MouseEvent) => {
        if (!dragState.value) return;
        const { id, startX, startY, initialTop, initialLeft } = dragState.value;
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        // --- 处理最大化还原逻辑 ---
        if (win.isMaximized) {
            // 计算鼠标在当前屏幕上的比例位置，用于还原后窗口位置的定位
            const desktopWidth = window.innerWidth;
            const ratio = e.clientX / desktopWidth;

            //关闭最大化状态
            win.isMaximized = false;
            //恢复还原前的大小
            win.width = win.restoreWidth;
            win.height = win.restoreHeight;

            //重新计算拖拽状态的 initialLeft 和 startX
            // 让窗口还原后，鼠标依然位于窗口标题栏的相对位置（例如居中）
            const newLeft = e.clientX - win.width * ratio;
            win.left = newLeft;
            win.top = 0; // 还原到顶部

            // 更新 dragState，否则后续计算会基于最大化时的 0,0 坐标导致跳变
            dragState.value.initialLeft = newLeft;
            dragState.value.initialTop = 0;
            dragState.value.startX = e.clientX;
            dragState.value.startY = e.clientY;

            return; // 本次循环结束，下一帧开始正常拖拽
        }

        // --- 原有的正常拖拽逻辑 ---
        const desktopHeight = window.innerHeight - 44;
        let nT = dragState.value.initialTop + (e.clientY - dragState.value.startY);
        let nL = dragState.value.initialLeft + (e.clientX - dragState.value.startX);

        // 边界限制
        nT = Math.max(0, Math.min(nT, desktopHeight - windowHeaderHeight.value));

        win.top = nT;
        win.left = nL;

        // 实时同步还原位置
        win.restoreTop = nT;
        win.restoreLeft = nL;
    };
    const startResize = (id: number, direction: string, e: MouseEvent) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        bringToFront(id);
        resizeState.value = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: win.width,
            startHeight: win.height,
            startTop: win.top,
            startLeft: win.left,
            direction,
        };

        document.addEventListener("mousemove", handleResize);
        document.addEventListener("mouseup", stopResize);
    };
    const handleResize = (e: MouseEvent) => {
        if (!resizeState.value) return;
        const {
            id,
            startX,
            startY,
            startWidth,
            startHeight,
            startTop,
            startLeft,
            direction,
        } = resizeState.value;
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        let nW = startWidth,
            nH = startHeight,
            nT = startTop,
            nL = startLeft;
        const dX = e.clientX - startX,
            dY = e.clientY - startY;

        if (direction.includes("right")) nW = startWidth + dX;
        if (direction.includes("bottom")) nH = startHeight + dY;
        if (direction.includes("left")) {
            nW = startWidth - dX;
            nL = startLeft + dX;
        }
        if (direction.includes("top")) {
            nH = startHeight - dY;
            nT = startTop + dY;
        }

        // 边界限制逻辑
        if (nW < MIN_WINDOW_WIDTH) {
            if (direction.includes("left"))
                nL = startLeft + (startWidth - MIN_WINDOW_WIDTH);
            nW = MIN_WINDOW_WIDTH;
        }
        if (nH < MIN_WINDOW_HEIGHT) {
            if (direction.includes("top"))
                nT = startTop + (startHeight - MIN_WINDOW_HEIGHT);
            nH = MIN_WINDOW_HEIGHT;
        }
        if (nT < 0) {
            nH = nH + nT;
            nT = 0;
        }

        // 更新窗口属性
        win.width = nW;
        win.height = nH;
        win.top = nT;
        win.left = nL;
        win.restoreWidth = nW;
        win.restoreHeight = nH;
        win.restoreTop = nT;
        win.restoreLeft = nL;
    };
    const stopResize = () => {
        resizeState.value = null;
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", stopResize);
    };
    const stopDrag = (e: MouseEvent) => {
        if (!dragState.value) return;
        const windowId = dragState.value.id;
        const desktopWidth = window.innerWidth;
        const desktopHeight = window.innerHeight - 44;

        handleWindowSnap(windowId, e.clientX, e.clientY);

        dragState.value = null;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    };

    // --- 窗口吸附常量 ---
    const SNAP_THRESHOLD = 50;
    const SNAP_SIDE = "side";
    const SNAP_TOP = "top";
    const handleWindowSnap = (id: number, mouseX: number, mouseY: number) => {
        const win = openWindows.value.find((w) => w.id === id);
        if (!win) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 44;
        const threshold = 10; // 边缘触发阈值

        // 顶部全屏
        if (mouseY <= threshold) {
            if (!win.isMaximized) toggleMaximizeWindow(id);
        }
        // 左侧半屏
        else if (mouseX <= threshold) {
            win.restoreTop = win.top;
            win.restoreLeft = win.left;
            win.restoreWidth = win.width;
            win.restoreHeight = win.height;

            win.isMaximized = false;
            win.snapState = "left";
            win.top = 0;
            win.left = 0;
            win.width = screenWidth / 2;
            win.height = screenHeight;
        }
        // 右侧半屏
        else if (mouseX >= screenWidth - threshold) {
            win.restoreTop = win.top;
            win.restoreLeft = win.left;
            win.restoreWidth = win.width;
            win.restoreHeight = win.height;

            win.isMaximized = false;
            win.snapState = "right";
            win.top = 0;
            win.left = screenWidth / 2;
            win.width = screenWidth / 2;
            win.height = screenHeight;
        }
    };
    const handleWindowResize = () => {
        // 更新所有最大化窗口的尺寸以适配新屏幕大小
        openWindows.value.forEach((win) => {
            if (win.isMaximized) {
                win.width = window.innerWidth;
                win.height = window.innerHeight - 44;
            }
        });
    };
    onMounted(() => {
        window.addEventListener("resize", handleWindowResize);
    });
    onUnmounted(() => {
        window.removeEventListener("resize", handleWindowResize);
    });

    // 亮度
    const volume = ref(50);
    const isRefreshing = ref(false);

    // 在 Store 初始化时注册全局监听
    onMounted(() => {
        window.addEventListener("resize", handleWindowResize);
    });
    onUnmounted(() => {
        window.removeEventListener("resize", handleWindowResize);
    });

    return {
        wallOptions,
        lockOptions,
        fixedApps,
        isAppFixed,
        togglePinApp,
        openWindows,
        windowActions,
        topButton,
        bottomButtons,
        handleWindowResize,
        handleLeftMenuMouseEnter,
        handleLeftMenuMouseLeave,
        handleSubMenuMouseEnter,
        handleSubMenuMouseLeave,
        zIndex,
        activeWindowId,
        windowHeaderHeight,
        startDrag,
        handleWindowSnap,
        APP_CONFIG,
        getAppIcon,
        handleTaskbarClick,
        startResize,
        SNAP_TOP,
        SNAP_SIDE,

        brightness,
        isNightMode,
        nightModeIntensity,
        isTimeNightMode,
        nightModeType,
        nightModeStart,
        nightModeEnd,
        volume,
        isLocked,
        isRefreshing,
        globalBrightnessStyle,
        login,
        logout,
        triggerRefresh,

        openWindow,
        closeWindow,
        minimizeWindow,
        toggleMaximizeWindow,
        bringToFront,

        taskbarItems,
        backgroundType,
        backgroundColor,
        colorOptions,
        wallpaper,
        useThumbnails,
        lockBackgroundType,
        lockBackgroundColor,
        lockWallpaper,
        desktopStyle,
        lockScreenStyle,
        setWallpaper,
        setBackgroundColor,
        setBackgroundType,
        setLockWallpaper,
        setLockBackgroundColor,
        setLockBackgroundType,

        showStartMenu,
        showSubMenu,
        startMenuWidth,
        startMenuHeight,
        isResizingStartMenu,
        resizeDirection,
        toggleStartMenu,
        toggleSubMenu,
        updateStartMenuSize,
        finalizeStartMenuWidth,

        handleLockScreenClick,
        showLogin,
        showInfoMenu,
        showTimeMenu,
        showAiMenu,
        toggleInfoMenu,
        toggleTimeMenu,
        toggleAiMenu,
        closeAllPopups,
        leftMenuButtons,
        tibarLeftButtons,
        tibarRightButtons,
        executeAction,
        currentTime,
        timeDisplay,
        dateDisplayTaskbar,
        dateDisplayLock,
        setShowLogin,
        startResizeStartMenu,
        theme,
        setTheme,
    };
});
