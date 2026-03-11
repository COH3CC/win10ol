<template>
    <WindowFrame v-if="!currentCategory" :window-id="windowId" :is-maximized="isMaximized" title="设置"
        @drag-start="(e) => emit('drag-start', e)">
        <template #header>
            <div class="setting-custom-header-1" :class="{ 'dark-mode': theme === 'dark' }">
                <div class="setting-title-area-1">
                    <div class="setting-title-text" :style="{ color: theme === 'dark' ? 'white' : '#333' }">设置</div>
                </div>
                <div class="setting-title-btn-1">
                    <WindowControls :window-id="windowId" :is-maximized="isMaximized" />
                </div>
            </div>
        </template>

        <div class="setting-view">
            <div class="setting-view-one" :class="{ 'dark-mode': theme === 'dark' }">
                <div class="setting-header">
                    <h1>Windows 设置</h1>
                    <div class="search-box">
                        <div class="search-wrapper">
                            <input type="text" placeholder="搜索设置" class="search-input" />
                            <span class="search-icon">
                                <img class="search-input-img" src="/icons/Search1.png"></img>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="setting-grid">
                    <div v-for="item in menuItems" :key="item.id" class="grid-item" @click="selectCategory(item)">
                        <div class="icon">
                            <img class="setting-icon" :src="item.icon" :alt="item.title" />
                        </div>
                        <div class="text">
                            <span class="title">{{ item.title }}</span>
                            <span class="desc">{{ item.desc }}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </WindowFrame>

    <WindowFrame v-else :window-id="windowId" :is-maximized="isMaximized" @drag-start="(e) => emit('drag-start', e)">
        <template #header>
            <div class="setting-custom-header-2" :class="{ 'dark-mode': theme === 'dark' }">
                <div class="setting-title-area-2">
                    <div class="setting-title-area-viewtitle">
                        <button class="setting-title-area-viewtitle-btn" @click="currentCategory = null">
                            <img class="setting-title-area-viewtitle-img" src="/icons/back2.png" />
                        </button>
                        <span class="setting-title-area-viewtitle-info">设置</span>
                    </div>
                </div>
                <div class="setting-title-btn-2">
                    <WindowControls :window-id="windowId" :is-maximized="isMaximized" />
                </div>
            </div>
        </template>

        <div class="setting-view">
            <div class="setting-container" :class="{ 'dark-mode': theme === 'dark' }">
                <aside class="sidebar">
                    <button class="back-btn" @click="currentCategory = null">
                        <img class="back-btn-img" src="/icons/Home.png" />
                        <div class="back-btn-info">主页</div>
                    </button>
                    <div class="sidebar-search">
                        <input type="text" placeholder="搜索设置" class="sidebar-search-input"></input>
                        <span class="search-icon">
                            <img class="search-icon-img" src="/icons/Search1.png" />
                        </span>
                    </div>
                    <div class="sidebar-title">{{ currentCategory.title }}</div>
                    <ul class="sidebar-menu">
                        <li v-for="sub in currentCategory.subs" :key="sub.name"
                            :class="{ active: currentSub === sub.name }" @click="currentSub = sub.name"
                            style="display: flex; align-items: center;">
                            <img :src="sub.icon"
                                style="width: 18px; height: 18px; margin-right: 12px; object-fit: contain;" />
                            {{ sub.name }}
                        </li>
                    </ul>
                </aside>
                <main class="content">
                    <div class="dummy-setting-item">
                        <div v-if="currentSub === '显示'" class="display-settings">
                            <h2 class="setting-sidrbar-name">显示</h2>
                            <p style="font-size: 14px;">亮度和颜色</p>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Brightness.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">亮度</div>
                                            <div class="setting-info-left-r-low">更改内置显示器亮度</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <button class="setting-info-right-r" @click="toggleBrightnessDetail">
                                            <img class="setting-info-right-r-img"
                                                :style="{ transform: showBrightnessDetail ? 'rotate(180deg)' : 'none' }"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="showBrightnessDetail" class="setting-info-sub-panel-sec">
                                    <div class="setting-info-input-name">亮度</div>
                                    <div class="setting-info-input">
                                        <input type="range" class="win10-slider" min="20" max="100" v-model="brightness"
                                            :style="{ backgroundSize: ((brightness - 20) / 80 * 100) + '% 100%' }">
                                    </div>
                                </div>
                                <div v-if="showBrightnessDetail" class="setting-info-sub-panel">
                                    <input type="checkbox" class="setting-info-sub-panel-box"
                                        v-model="isAutoBrightnessEnabled"></input>
                                    <div class="setting-info-sub-panel-name">跟随光线变化自动更改亮度</div>
                                </div>
                            </div>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Light.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">夜间模式</div>
                                            <div class="setting-info-left-r-low">使用较暖颜色屏蔽蓝光</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-btn-right">
                                        <div class="setting-info-right-lbtn">
                                            <div class="setting-info-right-l-name">{{ isNightMode ? '开' : '关' }}</div>
                                            <div class="win10-switch" :class="{ 'is-active': isNightMode }"
                                                @click="isNightMode = !isNightMode">
                                                <div class="switch-handle"></div>
                                            </div>
                                        </div>
                                        <button class="setting-info-right-r" @click="toggleNightmodelDetail">
                                            <img class="setting-info-right-r-img" src="/icons/Chevron Down.png"
                                                :style="{ transform: showNightmodelDetail ? 'rotate(180deg)' : 'none' }" />
                                        </button>
                                    </div>
                                </div>

                                <div v-if="showNightmodelDetail" class="setting-info-sub-panel-sec">
                                    <div class="setting-info-input-name">强度</div>
                                    <div class="setting-info-input">
                                        <input type="range" class="win10-slider" min="0" max="100"
                                            v-model="nightModeIntensity"
                                            :style="{ backgroundSize: nightModeIntensity + '% 100%' }">
                                    </div>
                                </div>
                                <div v-if="showNightmodelDetail" class="setting-info-sub-panel-sec"
                                    :class="{ 'is-grey-white': nightModeType === 'sunset' }">
                                    <div class="setting-info-input-name">在指定时间开启夜间模式</div>
                                    <div class="setting-info-sub-panel-sec-btn">
                                        <div class="setting-info-sub-panel-sec-btn-l">
                                            <div class="setting-info-sub-panel-sec-btn-l-name">{{ isTimeNightMode ? '开':'关' }}</div>
                                            <div class="win10-switch-sec" :class="{ 'is-active': isTimeNightMode }"
                                                @click="isTimeNightMode = !isTimeNightMode">
                                                <div class="switch-handle-sec"></div>
                                            </div>
                                        </div>
                                        <div class="setting-info-sub-panel-sec-btn-r">
                                            <button class="setting-info-sub-panel-sec-btn-r-btn"
                                                @click="toggleTimeDetail" :disabled="!isTimeNightMode"
                                                :style="{ opacity: isTimeNightMode ? 1 : 0.5 }">
                                                <img class="setting-info-right-r-img"
                                                    src="/public/icons/Chevron Down.png"
                                                    :style="{ transform: showTimeDetail ? 'rotate(180deg)' : 'none' }" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="showNightmodelDetail && showTimeDetail"
                                    class="setting-info-sub-panel-sec-thr">
                                    <div class="setting-info-sub-panel-sec-thr-t"
                                        :class="{ 'is-grey-white': nightModeType !== 'sunset' }">
                                        <div class="setting-info-sub-panel-sec-thr-t-l">
                                            <input type="radio" class="setting-info-sub-panel-sec-thr-t-l-input"
                                                name="night-mode-selection" value="sunset" v-model="nightModeType" />
                                            <div class="setting-info-sub-panel-sec-thr-t-l-name">日落至日出</div>
                                        </div>
                                        <div class="setting-info-sub-panel-sec-thr-t-r"></div>
                                    </div>
                                    <div class="setting-info-sub-panel-sec-thr-l"
                                        :class="{ 'is-grey-white': nightModeType !== 'custom' }">
                                        <div class="setting-info-sub-panel-sec-thr-l-left">
                                            <input type="radio" name="night-mode-selection" value="custom"
                                                v-model="nightModeType"
                                                class="setting-info-sub-panel-sec-thr-t-l-input" />
                                            <div class="setting-info-sub-panel-sec-thr-t-l-name">自定义时间</div>
                                        </div>
                                        <div class="setting-info-sub-panel-sec-thr-l-right">
                                            <div class="setting-info-sub-panel-sec-thr-l-right-start">
                                                <div class="setting-info-sub-panel-sec-thr-t-l-name">启用时间</div>
                                                <div class="time-picker-box">
                                                    <input type="number" class="time-input"
                                                        v-model.number="nightModeStart.hour" min="0" max="23"
                                                        :disabled="nightModeType !== 'custom'" />
                                                    <div class="time-divider"></div>
                                                    <input type="number" class="time-input"
                                                        v-model.number="nightModeStart.minute" min="0" max="59"
                                                        :disabled="nightModeType !== 'custom'" />
                                                </div>
                                            </div>

                                            <div class="setting-info-sub-panel-sec-thr-l-right-end">
                                                <div class="setting-info-sub-panel-sec-thr-t-l-name">至</div>
                                                <div class="time-picker-box">
                                                    <input type="number" class="time-input"
                                                        v-model.number="nightModeEnd.hour" min="0" max="23"
                                                        :disabled="nightModeType !== 'custom'" />
                                                    <div class="time-divider"></div>
                                                    <input type="number" class="time-input"
                                                        v-model.number="nightModeEnd.minute" min="0" max="59"
                                                        :disabled="nightModeType !== 'custom'" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div v-else-if="currentSub === '声音'" class="display-settings">
                            <h2 class="setting-sidrbar-name">声音</h2>
                            <p style="font-size: 14px;">输出</p>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Volume 3.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">主音量</div>
                                            <div class="setting-info-left-r-low">调整设备音量的声音大小</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <button class="setting-info-right-r" @click="toggleSoundDetail">
                                            <img class="setting-info-right-r-img"
                                                :style="{ transform: showSoundDetail ? 'rotate(180deg)' : 'none' }"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="showSoundDetail" class="setting-info-sub-panel-sec">
                                    <div class="setting-info-input-name">音量</div>
                                    <div class="setting-info-input">
                                        <input type="range" class="win10-slider" min="0" max="100" v-model="volume"
                                            :style="{ backgroundSize: volume + '% 100%' }">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentSub === '系统信息'" class="display-settings">
                            <h2 class="setting-sidrbar-name">系统信息</h2>

                            <div class="setting-group-container">
                                <div class="setting-info-sys">
                                    <div class="setting-info-sys-left">
                                        <img class="setting-info-sys-left-img" src="/icons/system/Windows 10.png" />
                                        <div class="setting-info-sys-left-name">Windows 版本</div>
                                    </div>
                                    <div class="setting-info-sys-right">
                                        <button class="setting-info-sys-right-func">
                                            <span class="setting-info-sys-right-func-name">复制</span>
                                        </button>
                                        <button class="setting-info-sys-right-btn" @click="toggleWinVersion">
                                            <img class="setting-info-sys-right-btn-img"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>

                                <div v-if="showWinVersion" class="setting-info-sys-more">
                                    <div class="setting-info-sys-more-left">
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">版本</span>
                                            <span class="setting-info-sys-more-left-row-value">Windows 10 专业版</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">版本号</span>
                                            <span class="setting-info-sys-more-left-row-value">26H2</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">安装日期</span>
                                            <span class="setting-info-sys-more-left-row-value">2026/3/9</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">内部版本</span>
                                            <span class="setting-info-sys-more-left-row-value">26100.7523</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">体验包</span>
                                            <span class="setting-info-sys-more-left-row-value">Windows
                                                功能体验包1000.261000.313.0</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-btn">Microsoft 服务协议</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-btn">Microsoft 软件许可协议</span>
                                        </div>
                                    </div>

                                    <div class="setting-info-sys-more-right">
                                        <img class="setting-info-sys-more-right-img" src="/icons/system/st10.png"/>
                                        <!-- <div class="setting-info-sys-more-right-name">Windows 10</div> -->
                                    </div>
                                </div>
                            </div>

                            <div class="setting-group-container">
                                <div class="setting-info-sys">
                                    <div class="setting-info-sys-left">
                                        <img class="setting-info-sys-left-img" src="/icons/System.png" />
                                        <div class="setting-info-sys-left-name">设备信息</div>
                                    </div>
                                    <div class="setting-info-sys-right">
                                        <button class="setting-info-sys-right-func">
                                            <span class="setting-info-sys-right-func-name">重命名设备</span>
                                        </button>
                                        <button class="setting-info-sys-right-func">
                                            <span class="setting-info-sys-right-func-name">复制</span>
                                        </button>
                                        <button class="setting-info-sys-right-btn" @click="toggleDeviceInfo">
                                            <img class="setting-info-sys-right-btn-img"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>

                                <div v-if="showDeviceInfo" class="setting-info-sys-more">
                                    <div class="setting-info-sys-more-left">
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">设备名称</span>
                                            <span class="setting-info-sys-more-left-row-value">Admin的电脑</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">处理器</span>
                                            <span class="setting-info-sys-more-left-row-value">Amtel Ultra7-9800X3D</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">机带RAM</span>
                                            <span class="setting-info-sys-more-left-row-value">32GB</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">设备ID</span>
                                            <span
                                                class="setting-info-sys-more-left-row-value">12345-67890-12345-67890</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">产品ID</span>
                                            <span
                                                class="setting-info-sys-more-left-row-value">114514-1919-0180-1145-114514191981</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">系统类型</span>
                                            <span class="setting-info-sys-more-left-row-value">64位操作系统,基于x64的处理器</span>
                                        </div>
                                        <div class="setting-info-sys-more-left-row">
                                            <span class="setting-info-sys-more-left-row-label">笔和触控</span>
                                            <span class="setting-info-sys-more-left-row-value">没有可用于此显示器的笔或触控输入</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentSub === '背景'" class="display-settings">
                            <h2 class="setting-sidrbar-name">背景</h2>


                            <div class="sys-wallpaper" :style="systemStore.backgroundType === '图片' ? {
                                backgroundImage: `url('${systemStore.wallpaper}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            } : {
                                backgroundColor: systemStore.backgroundColor
                            }"></div>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Photo 2.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">设置背景</div>
                                            <div class="setting-info-left-r-low">设置不同模式的背景</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <div class="wallpaper-mode-container">
                                            <div class="setting-info-right-modle"
                                                @click="showWallpaperModeDropdown = !showWallpaperModeDropdown">
                                                <span class="selected-mode-text">{{ systemStore.backgroundType }}</span>
                                                <img class="selected-mode-img" src="/icons/Chevron Down.png"
                                                    :style="{ transform: showWallpaperModeDropdown ? 'rotate(180deg)' : 'none' }" />
                                            </div>

                                            <div v-if="showWallpaperModeDropdown" class="win10-dropdown-menu">
                                                <div v-for="mode in wallpaperModes" :key="mode" class="dropdown-item"
                                                    @click="selectWallpaperMode(mode)">
                                                    {{ mode }}
                                                </div>
                                            </div>
                                        </div>

                                        <button class="setting-info-right-r" @click="toggleWallpaperDetail">
                                            <img class="setting-info-right-r-img"
                                                :style="{ transform: showWallpaperDetail ? 'rotate(180deg)' : 'none' }"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>
                                <div class="setting-info-sub-panel-sec" v-if="showWallpaperDetail && systemStore.backgroundType === '图片'">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-r" style="margin-left: 48px;">
                                            <div class="setting-info-left-r-top">渲染缩略图</div>
                                            <div class="setting-info-left-r-low">启用后预览将使用低分辨率渲染以提高性能</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <div class="setting-info-right-lbtn-3">
                                            <div class="setting-info-right-l-name">{{ useThumbnails ? '开' : '关' }}</div>
                                            <div class="win10-switch" :class="{ 'is-active': useThumbnails }"
                                                @click="useThumbnails = !useThumbnails">
                                                <div class="switch-handle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="setting-info-sub-panel-sec-fou" v-if="showWallpaperDetail">
                                    <div v-if="systemStore.backgroundType === '图片'" class="wallpaper-mode-content">
                                        <div class="wallpaper-preview-grid">
                                            <div v-for="img in systemStore.wallOptions" :key="img"
                                                @click="systemStore.setWallpaper(img)" class="wallpaper-item"
                                                :class="{ 'active-border': systemStore.wallpaper === img, 'is-thumbnail': useThumbnails }">
                                                <img :src="img" loading="lazy" />
                                            </div>
                                            <div class="wallpaper-add">
                                                <img class="wallpaper-add-btn" src="/icons/Add.png" />
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="systemStore.backgroundType === '纯色'" class="color-mode-content">
                                        <div
                                            style="display: flex; flex-wrap: wrap; gap: 8px; margin: 0 15px; flex-shrink: 0; max-width: 250px;">
                                            <div v-for="color in systemStore.colorOptions" :key="color"
                                                @click="systemStore.setBackgroundColor(color)"
                                                style="width: 32px; height: 32px; cursor: pointer; border: 2px solid transparent;"
                                                :style="{ backgroundColor: color, borderColor: systemStore.backgroundColor === color ? '#000' : 'transparent' }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="showWallpaperDetail" class="setting-info-wall-info">
                                    <span class="setting-info-wall-info-name">为桌面图像选择适应模式</span>
                                    <div class="setting-info-wall-right">
                                        <div class="setting-info-right-modle">
                                            <span class="selected-mode-text">填充</span>
                                            <img class="selected-mode-img" src="/icons/Chevron Down.png" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentSub === '主题'" class="display-settings">
                            <h2 class="setting-sidrbar-name">主题</h2>

                            <div class="display-settings-wall-view">
                                <div class="sys-wallpaper" :style="{
                                    backgroundImage: `url('${systemStore.wallpaper}')`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }">
                                    <div class="wallpaper-float-block"
                                        :style="{ backgroundColor: activeFloatBlockColor }">
                                        <div class="wallpaper-transparent-hole"></div>
                                    </div>
                                </div>
                                <div class="display-settings-wall-view-right">
                                    <div class="display-settings-wall-view-topbtn">
                                        <div class="setting-group-container">
                                            <div class="setting-info is-small">
                                                <div class="setting-info-left">
                                                    <div class="setting-info-left-l">
                                                        <img class="setting-info-left-l-img"
                                                            src="/icons/Photo 2.png" />
                                                    </div>
                                                    <div class="setting-info-left-r">
                                                        <div class="setting-info-left-r-top">背景</div>
                                                        <div class="setting-info-left-r-low">自定义背景</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="display-settings-wall-view-topbtn">
                                        <div class="setting-group-container">
                                            <div class="setting-info is-small">
                                                <div class="setting-info-left">
                                                    <div class="setting-info-left-l">
                                                        <img class="setting-info-left-l-img"
                                                            src="/icons/Photo 2.png" />
                                                    </div>
                                                    <div class="setting-info-left-r">
                                                        <div class="setting-info-left-r-top">颜色</div>
                                                        <div class="setting-info-left-r-low">自动</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="display-settings-wall-view-topbtn">
                                        <button class="display-settings-wall-view-topbtn-btn">保存</button>
                                    </div>
                                </div>
                            </div>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Personalize.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">更改主题</div>
                                            <div class="setting-info-left-r-low">选择壁纸、声音和颜色的组合,让你的桌面富有个性</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <button class="setting-info-right-r" @click="toggleThemeDetail">
                                            <img class="setting-info-right-r-img"
                                                :style="{ transform: showThemeDetail ? 'rotate(180deg)' : 'none' }"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>

                                <div v-if="showThemeDetail" class="setting-info-sub-panel-sec-fou">
                                    <div class="setting-info-sub-panel-sec-fou-area">
                                        <div class="setting-info-sub-panel-sec-fou-area-theme" :style="{
                                            backgroundImage: `url('${systemStore.wallpaper}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }"
                                            @click="activeFloatBlockColor = '#ffffffa9'; systemStore.setTheme('light')">
                                            <div class="wallpaper-float-block-2"
                                                style="cursor: pointer; pointer-events: auto;">
                                                <div class="wallpaper-transparent-hole-2"></div>
                                            </div>
                                        </div>
                                        <div class="setting-info-sub-panel-sec-fou-area-theme" :style="{
                                            backgroundImage: `url('${systemStore.wallpaper}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }"
                                            @click="activeFloatBlockColor = '#000000a9'; systemStore.setTheme('dark')">
                                            <div class="wallpaper-float-block-2"
                                                style="background-color: #000000a9; cursor: pointer; pointer-events: auto;">
                                                <div class="wallpaper-transparent-hole-2"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Brightness.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">更改模式</div>
                                            <div class="setting-info-left-r-low">设置 Windows 和应用默认显示的模式</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <div class="wallpaper-mode-container">
                                            <div class="setting-info-right-modle"
                                                @click="showThemeModeDropdown = !showThemeModeDropdown">
                                                <span class="selected-mode-text">{{ systemStore.theme === 'light' ? '浅色':'深色' }}</span>
                                                <img class="selected-mode-img" src="/icons/Chevron Down.png"
                                                    :style="{ transform: showThemeModeDropdown ? 'rotate(180deg)' : 'none' }" />
                                            </div>
                                            <div v-if="showThemeModeDropdown" class="win10-dropdown-menu">
                                                <div class="dropdown-item" @click="selectThemeMode('light')">浅色</div>
                                                <div class="dropdown-item" @click="selectThemeMode('dark')">深色</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentSub === '锁屏界面'" class="display-settings">
                            <h2 class="setting-sidrbar-name">锁屏界面</h2>

                            <div class="sys-wallpaper" :style="systemStore.lockScreenStyle">
                            </div>

                            <div class="setting-group-container">
                                <div class="setting-info">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-l">
                                            <img class="setting-info-left-l-img" src="/icons/Photo 2.png" />
                                        </div>
                                        <div class="setting-info-left-r">
                                            <div class="setting-info-left-r-top">背景</div>
                                            <div class="setting-info-left-r-low">选择要在锁屏界面显示的背景</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <div class="wallpaper-mode-container">
                                            <div class="setting-info-right-modle"
                                                @click="showLockWallpaperModeDropdown = !showLockWallpaperModeDropdown">
                                                <span class="selected-mode-text">{{ systemStore.lockBackgroundType
                                                    }}</span>
                                                <img class="selected-mode-img" src="/icons/Chevron Down.png"
                                                    :style="{ transform: showLockWallpaperModeDropdown ? 'rotate(180deg)' : 'none' }" />
                                            </div>

                                            <div v-if="showLockWallpaperModeDropdown" class="win10-dropdown-menu">
                                                <div v-for="mode in wallpaperModes" :key="mode" class="dropdown-item"
                                                    @click="selectLockWallpaperMode(mode)">
                                                    {{ mode }}
                                                </div>
                                            </div>
                                        </div>

                                        <button class="setting-info-right-r" @click="togglelockWallpaperDetail">
                                            <img class="setting-info-right-r-img"
                                                :style="{ transform: showlockWallpaperDetail ? 'rotate(180deg)' : 'none' }"
                                                src="/icons/Chevron Down.png" />
                                        </button>
                                    </div>
                                </div>
                                <div class="setting-info-sub-panel-sec" v-if="showlockWallpaperDetail && systemStore.lockBackgroundType === '图片'">
                                    <div class="setting-info-left">
                                        <div class="setting-info-left-r" style="margin-left: 48px;">
                                            <div class="setting-info-left-r-top">渲染缩略图</div>
                                            <div class="setting-info-left-r-low">启用后预览将使用低分辨率渲染以提高性能</div>
                                        </div>
                                    </div>
                                    <div class="setting-info-right">
                                        <div class="setting-info-right-lbtn-3">
                                            <div class="setting-info-right-l-name">{{ useThumbnails ? '开' : '关' }}</div>
                                            <div class="win10-switch" :class="{ 'is-active': useThumbnails }"
                                                @click="useThumbnails = !useThumbnails">
                                                <div class="switch-handle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="setting-info-sub-panel-sec-fou" v-if="showlockWallpaperDetail">
                                    <div v-if="systemStore.lockBackgroundType === '图片'" class="wallpaper-mode-content">
                                        <div class="wallpaper-preview-grid">
                                            <div v-for="img in systemStore.lockOptions" :key="img"
                                                @click="systemStore.setLockWallpaper(img)" class="wallpaper-item"
                                                :class="{ 'active-border': systemStore.lockWallpaper === img, 'is-thumbnail': useThumbnails }">
                                                <img :src="img" loading="lazy" />
                                            </div>
                                            <div class="wallpaper-add">
                                                <img class="wallpaper-add-btn" src="/icons/Add.png" />
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else-if="systemStore.lockBackgroundType === '纯色'" class="color-mode-content">
                                        <div
                                            style="display: flex; flex-wrap: wrap; gap: 8px; margin: 0 15px; flex-shrink: 0; max-width: 250px;">
                                            <div v-for="color in systemStore.colorOptions" :key="color"
                                                @click="systemStore.setLockBackgroundColor(color)"
                                                style="width: 32px; height: 32px; cursor: pointer; border: 2px solid transparent;"
                                                :style="{ backgroundColor: color, borderColor: systemStore.lockBackgroundColor === color ? '#000' : 'transparent' }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="currentSub === 'WLAN'">
                            <p>正在搜索可用网络...</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </WindowFrame>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import WindowFrame from './WindowFrame.vue';
import WindowControls from './WindowControls.vue';
import { useSystemStore } from '../stores/system';

const props = defineProps<{
    windowId: number;
    isMaximized: boolean;
}>();

const emit = defineEmits(['drag-start']);

const systemStore = useSystemStore();
const {
    brightness,
    volume,
    theme,
    isNightMode,
    nightModeIntensity,
    isTimeNightMode,
    nightModeType,
    nightModeStart,
    nightModeEnd,
    useThumbnails
} = storeToRefs(systemStore);

const currentCategory = ref<any>(null);
const currentSub = ref<string>('');

const menuItems = [
    {
        id: 'sys',
        icon: '/icons/System.png',
        title: '系统',
        desc: '显示、声音、系统信息',
        subs: [
            { name: '显示', icon: '/icons/TVMonitor.png' },
            { name: '声音', icon: '/icons/Volume 3.png' },
            { name: '系统信息', icon: '/icons/Error.png' }
        ]
    },
    {
        id: 'dev',
        icon: '/icons/Devices.png',
        title: '设备',
        desc: '蓝牙、打印机、鼠标',
        subs: ['蓝牙和其他设备', '打印机和扫描仪']
    },
    {
        id: 'net',
        icon: '/icons/Globe.png',
        title: '网络和 Internet',
        desc: 'WLAN、飞机模式、VPN',
        subs: ['状态', 'WLAN', '以太网']
    },
    {
        id: 'per',
        icon: '/icons/Personalize.png',
        title: '个性化',
        desc: '背景、锁屏、颜色',
        subs: [
            { name: '背景', icon: '/icons/Photo 2.png' },
            { name: '主题', icon: '/icons/Personalize.png' },
            { name: '锁屏界面', icon: '/icons/Lockscreen Desktop.png' },
        ]
    },
    {
        id: 'apps',
        icon: '/icons/All Apps.png',
        title: '应用',
        desc: '卸载、默认应用、可选功能',
        subs: ['应用和功能', '默认应用']
    },
    {
        id: 'game',
        icon: '/icons/Game.png',
        title: '游戏',
        desc: '游戏栏、捕获、广播',
        subs: ['游戏栏', '捕获']
    },
    {
        id: 'acc',
        icon: '/icons/Ease Of Access.png',
        title: '辅助功能',
        desc: '讲述人、放大镜、高对比度',
        subs: ['讲述人', '放大镜']
    },
    {
        id: 'time',
        icon: '/icons/Time Language.png',
        title: '时间和语言',
        desc: '区域、语言、语音',
        subs: ['日期和时间', '语言']
    },
    {
        id: 'acc_user',
        icon: '/icons/Contact.png',
        title: '账户',
        desc: '你的信息、同步设置',
        subs: ['你的信息', '电子邮件和账户']
    },
];

const showBrightnessDetail = ref(false);
const showSoundDetail = ref(false);
const isAutoBrightnessEnabled = ref(true);

const showNightmodelDetail = ref(false);
const showTimeDetail = ref(false);

// --- UI State: Wallpaper & Theme ---
const showWallpaperModeDropdown = ref(false);
const showLockWallpaperModeDropdown = ref(false);
const wallpaperModes = ['图片', '纯色'];
const showlockWallpaperDetail = ref(false);
const showWallpaperDetail = ref(false);
const showThemeDetail = ref(false);
const showThemeModeDropdown = ref(false);
const activeFloatBlockColor = ref(systemStore.theme === 'light' ? '#ffffffa9' : '#000000a9');

// --- UI State: System Info ---
const showWinVersion = ref(true);
const showDeviceInfo = ref(false);

// --- Methods: Navigation ---
const selectCategory = (item: any) => {
    const allowedIds = ['sys', 'per'];
    if (allowedIds.includes(item.id)) {
        currentCategory.value = item;
        if (item.subs && item.subs.length > 0) {
            currentSub.value = typeof item.subs[0] === 'string' ? item.subs[0] : item.subs[0].name;
        }
    } else {
        console.log(`${item.title} 菜单暂未开放`);
    }
};

// --- Methods: Toggles ---
const toggleBrightnessDetail = () => showBrightnessDetail.value = !showBrightnessDetail.value;
const toggleSoundDetail = () => showSoundDetail.value = !showSoundDetail.value;
const toggleWinVersion = () => showWinVersion.value = !showWinVersion.value;
const toggleDeviceInfo = () => showDeviceInfo.value = !showDeviceInfo.value;
const toggleThemeDetail = () => showThemeDetail.value = !showThemeDetail.value;
const toggleWallpaperDetail = () => showWallpaperDetail.value = !showWallpaperDetail.value;
const togglelockWallpaperDetail = () => showlockWallpaperDetail.value = !showlockWallpaperDetail.value;

const toggleNightmodelDetail = () => {
    if (showNightmodelDetail.value) {
        showTimeDetail.value = false;
    }
    showNightmodelDetail.value = !showNightmodelDetail.value;
};

const toggleTimeDetail = () => {
    if (showNightmodelDetail.value && isTimeNightMode.value) {
        showTimeDetail.value = !showTimeDetail.value;
    }
};

const selectWallpaperMode = (mode: string) => {
    systemStore.setBackgroundType(mode as '图片' | '纯色');
    showWallpaperModeDropdown.value = false;
};

const selectLockWallpaperMode = (mode: string) => {
    systemStore.setLockBackgroundType(mode as '图片' | '纯色');
    showLockWallpaperModeDropdown.value = false;
};

const selectThemeMode = (mode: 'light' | 'dark') => {
    systemStore.setTheme(mode);
    showThemeModeDropdown.value = false;
};

// --- Watchers ---
watch(isNightMode, (newVal) => {
    if (!newVal) {
    }
});

watch(isTimeNightMode, (newVal) => {
    if (!newVal) {
        showTimeDetail.value = false;
    }
});
</script>

<style scoped>
.setting-custom-header-1 {
    display: flex;
    justify-content: space-between;
    height: 40px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.500);
}
.setting-title-area-1 {
    display: flex;
    height: 40px;
    width: 220px;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.500);
}
.setting-title-text {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: 13px;
    color: #333;
    padding-left: 12px;
    flex: 1;
    background-color: rgba(255, 255, 255, 0);
}
.setting-title-btn-1 {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    background-color: rgba(255, 255, 255, 0.500);
}


.setting-view {
    height: 100%;
    background: rgba(255, 255, 255, 0);
    color: #333;
    display: flex;
    flex-direction: column;
}
.setting-view-one {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.875);
}
.setting-header {
    text-align: center;
    padding: 40px 0;
}
.setting-header h1 {
    font-weight: 300;
    font-size: 28px;
    margin-bottom: 20px;
}
.search-box input {
    width: 100%;
    height: 34px;
    padding-left: 12px;
    padding-right: 35px;
    background: rgba(255, 255, 255, 0.450);
    border: none;
}
.search-wrapper {
    position: relative;
    width: 300px;
    margin: 0 auto;
    display: flex;
    align-items: center;
}
.search-input {
    border-radius: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    font-family: inherit;
    height: 30px;
}
.search-input:focus {
    outline: none;
    border: none;
    border-radius: 0;
}
.search-icon {
    position: absolute;
    right: 10px;
    font-size: 14px;
    color: #666;
    align-items: center;
    /* background-color: #0078d7; */
    pointer-events: none;
}
.search-input-img {
    display: flex;
    width: 14px;
    height: 14px;
    align-items: center;
    /* background-color: rgba(255, 255, 255, 0.264); */
}
.setting-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: flex-start;
    gap: 30px;
    padding: 0 40px 40px;
    overflow-y: auto;
    max-width: 1200px;
    margin: 0 auto;
}
.setting-grid::-webkit-scrollbar {
    display: none;
}
.setting-grid {
    -ms-overflow-style: none;
}
.grid-item {
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    transition: background 0.2s;
    width: 220px;
    height: 75px;
    flex-shrink: 0;
}
.grid-item:hover {
    background: rgba(255, 255, 255, 0.600);
}
.grid-item .icon {
    font-size: 32px;
    margin-right: 15px;
    /* background-color: #0078d7; */
}
.setting-icon {
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    /* background-color: aqua; */
}
.grid-item .title {
    display: block;
    font-size: 15px;
}
.grid-item .desc {
    font-size: 12px;
    color: #666;
}


.setting-custom-header-2 {
    display: flex;
    justify-content: space-between;
    height: 40px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0);
}
.setting-title-area-2 {
    display: flex;
    height: 40px;
    width: 220px;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.700);
}
.setting-title-area-viewtitle {
    display: flex;
    flex-direction: row;
    height: 40px;
    align-items: center;
    width: 100%;
    background-color: rgba(255, 255, 255, 0);
}
.setting-title-area-viewtitle-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 40px;
    border: none;
    background-color: rgba(0, 104, 184, 0);
}
.setting-title-area-viewtitle-btn:hover {
    background-color: rgb(255, 255, 255, 0.875);
}
.setting-title-area-viewtitle-img {
    display: flex;
    width: 16px;
    height: 16px;
    background-color: rgba(0, 104, 184, 0);
}
.setting-title-area-viewtitle-info {
    display: flex;
    font-size: 13px;
    margin-left: 12px;
}
.setting-title-btn-2 {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    background-color: rgba(255, 255, 255, 0.875);
}


.setting-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    box-sizing: border-box;
}
.sidebar {
    width: 220px;
    background: rgba(255, 255, 255, 0.700);
    padding: 20px 0;
}
.back-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 196px;
    margin-top: 10px;
    margin-left: 12px;
    height: 34px;
    border-radius: 0;
    border: none;
    background-color: #d9141400;
}
.back-btn:hover {
    background-color: #ffffff91;
}
.back-btn-img {
    display: flex;
    width: 16px;
    height: 16px;
    /* background-color:aqua; */
    align-items: center;
    margin-left: 12px;
}
.back-btn-info {
    margin-left: 8px;
    font-size: 14px;
    color: black;
}
.sidebar-search {
    display: flex;
    flex-direction: row;
    width: 196px;
    height: 34px;
    margin-left: 12px;
    margin-top: 10px;
    background-color: #0076d700;
    align-items: center;
    position: relative;
}
.sidebar-search-input {
    width: 100%;
    height: 30px;
    border-radius: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    font-family: inherit;
    border: none;
    padding-left: 10px;
    background-color: rgba(255, 255, 255, 0.450);
}
.search-icon {
    position: absolute;
    right: 10px;
    font-size: 14px;
    color: #666;
    align-items: center;
    pointer-events: none;
    background-color: rgba(127, 255, 212, 0);
    width: 16px;
    height: 16px;
    align-items: center;
}
.search-icon-img {
    width: 16px;
    height: 16px;
}
.sidebar-title {
    width: 196px;
    margin-left: 12px;
    padding-left: 8px;
    margin-top: 10px;
    font-size: 15px;
    align-items: center;
    height: 25px;
    background-color: #0076d700;
    color: black;
}
.sidebar-menu {
    list-style: none;
    margin-top: 12px;
}
.sidebar-menu li {
    position: relative;
    padding: 10px 25px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s;
    height: 45px;
}
.sidebar-menu li:hover {
    background: rgba(122, 122, 122, 0.25);
}
.sidebar-menu li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 25%;
    height: 50%;
    width: 3px;
    background-color: #068b64;
    opacity: 0;
    transition: opacity 0.1s, transform 0.2s;
    transform: scaleY(0.5);
}
.sidebar-menu li.active {
    background: rgba(122, 122, 122, 0.1);
}
.sidebar-menu li.active::before {
    opacity: 1;
    transform: scaleY(1);
}
.dark-mode .sidebar-menu li::before {
    background-color: #785f3b;
}


.content {
    display: flex;
    flex: 1;
    background: rgba(255, 255, 255, 0.875);
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.content::-webkit-scrollbar {
    display: none;
}
.content h2 {
    font-weight: 300;
    margin-bottom: 10px;
}
.dummy-setting-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-left: 18px;
    height: 100%;
    background-color: #d83f3f00;
}
.display-settings {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #0068b800;
}
.setting-sidrbar-name {
    font-size: 24px;
    padding-top: 20px;
}
.setting-group-container {
    display: flex;
    flex-direction: column;
    background-color: #0068b800;
    width: 100%;
    margin-bottom: 3px;
}


.setting-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: calc(100% - 18px);
    height: 54px;
    align-items: center;
    background-color: #fafcfc;
    position: relative;
    z-index: 2;
}
.setting-info.is-small {
    height: 36px;
    background-color: transparent;
}
.setting-info-left {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    width: 400px;
    height: 54px;
    background-color: rgba(0, 255, 255, 0);
}
.setting-info.is-small .setting-info-left {
    width: 180px;
    height: 36px;
}
.setting-info-left-l {
    display: flex;
    width: 48px;
    height: 54px;
    align-items: center;
    padding-left: 12px;
    background-color: rgba(214, 218, 127, 0);
}
.setting-info.is-small .setting-info-left-l {
    height: 36px;
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
.setting-info.is-small .setting-info-left-r {
    width: 150px;
    height: 36px;
}
.setting-info-left-r-top {
    display: flex;
    width: 100px;
    height: 27px;
    font-size: 14px;
    padding-top: 8px;
    background-color: rgba(185, 129, 109, 0);
}
.setting-info.is-small .setting-info-left-r-top {
    height: 18px;
    font-size: 13px;
    padding-top: 0;
}
.setting-info-left-r-low {
    display: flex;
    width: 1;
    height: 27px;
    font-size: 12px;
    padding-top: 2px;
    color: #0000007b;
    background-color: rgba(223, 134, 134, 0);
}
.setting-info.is-small .setting-info-left-r-low {
    width: 150px;
    height: 18px;
    font-size: 13px;
    padding-top: 0;
    color: #00000058;
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
.setting-info-right {
    overflow: visible !important;
    background-color: transparent !important;
}
.setting-info-right-r {
    display: flex;
    width: 24px;
    height: 24px;
    margin-top: 15px;
    margin-right: 8px;
    border: none;
    background-color: #598eba00;
}
.setting-info-right-r-img {
    display: flex;
    width: 16px;
    height: 16px;
    margin-left: 4px;
    margin-top: 4px;
    align-items: center;
    background-color: rgba(100, 148, 237, 0);
}
.setting-info-sub-panel-sec {
    display: flex;
    flex-direction: row;
    width: calc(100% - 18px);
    justify-content: space-between;
    min-height: 40px;
    background-color: #ffffff;
    margin-top: 5px;
    align-items: center;
}
/* .setting-info-sub-panel-sec-2 {
    display: flex;
    flex-direction: row;
    width: calc(100% - 18px);
    justify-content: space-between;
    min-height: 45px;
    background-color: #ffffff;
    margin-top: 5px;
    align-items: center;
} */
.setting-info-input-name {
    display: flex;
    font-size: 13px;
    margin-left: 12px;
    flex-shrink: 0;
    background-color: rgba(127, 255, 212, 0);
}
.win10-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    background-color: #9cccbb;
    background-image: linear-gradient(#068b64, #068b64);
    background-size: 0% 100%;
    background-repeat: no-repeat;
    outline: none;
    cursor: pointer;
    flex-shrink: 0;
}
.win10-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 11.5px;
    height: 11.5px;
    background-color: #ffffff;

    background-image: radial-gradient(circle, #068b64 3px, transparent 3px);
    background-repeat: no-repeat;
    background-position: center;

    border-radius: 50%;
    cursor: pointer;
    border: none;
}
.setting-view-one.dark-mode .win10-slider,
.setting-container.dark-mode .win10-slider {
    background-color: #544739;
    background-image: linear-gradient(#785f3b, #785f3b);
}
.setting-view-one.dark-mode .win10-slider::-webkit-slider-thumb,
.setting-container.dark-mode .win10-slider::-webkit-slider-thumb {
    background-image: radial-gradient(circle, #785f3b 3px, transparent 3px);
}
.win10-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background-color: #0078d7;
    background-image: radial-gradient(circle, #ffffff 5px, transparent 5px);
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 50%;
    cursor: pointer;
    border: none;
}



.info-popup-menu-info-low-3-btn-l,
.info-popup-menu-info-low-3-btn-r {
    width: 32px;
    height: 32px;
    background-size: 20px;
    background-position: center;
    background-repeat: no-repeat;
    background-color: transparent;
    border: none;
    cursor: pointer;
}
.info-popup-menu-info-low-3-btn-l {
    background-image: url('/icons/Volume 3.png');
}
.info-popup-menu-info-low-3-btn-r {
    background-image: url('/icons/Chevron Right.png');
}



.setting-info-btn-right {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-shrink: 0;
    overflow: hidden;
    width: 140px;
    height: 54px;
    background-color: rgba(165, 42, 42, 0);
}
.setting-info-right-l {
    display: flex;
    flex-direction: row;
    width: 190px;
    height: 54px;
    align-items: center;
    margin-right: 8px;
    background-color: #23c4b100;
}
.setting-info-right-l-name {
    display: flex;
    font-size: 13px;
}
.setting-info-right-lbtn {
    display: flex;
    flex-direction: row;
    width: 100px;
    height: 54px;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    background-color: rgba(0, 255, 255, 0);
    cursor: pointer;
}
.setting-info-right-lbtn-3 {
    display: flex;
    flex-direction: row;
    width: 100px;
    height: 54px;
    align-items: center;
    justify-content: flex-end;
    margin-right: 12px;
    gap: 12px;
    background-color: rgba(0, 255, 255, 0);
    cursor: pointer;
}


.win10-switch {
    position: relative;
    width: 40px;
    height: 20px;
    border: 2px solid #333;
    border-radius: 10px;
    background-color: transparent;
    transition: all 0.2s ease;
    flex-shrink: 0;
}
/* Win10 滑块小圆点 */
.switch-handle {
    position: absolute;
    top: 3px;
    left: 4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #333333;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s;
}
.win10-switch.is-active {
    background-color: #027353;
    border-color: #027353;
}
/* 激活状态：圆点移动并变白 */
.win10-switch.is-active .switch-handle {
    transform: translateX(20px);
    background-color: #fff;
}



.setting-info-sub-panel {
    display: flex;
    flex-direction: row;
    width: calc(100% - 18px);
    height: 40px;
    background-color: #ffffff;
    margin-top: 5px;
    align-items: center;
}
.setting-info-sub-panel-box {
    display: flex;
    margin-left: 48px;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    -webkit-appearance: none;
    appearance: none;
    background-color: transparent;
    border: 1.5px solid #333;
    border-radius: 0 !important;
    cursor: pointer;
    position: relative;
    outline: none;
}
.setting-info-sub-panel-box:checked {
    background-color: #027353;
    border-color: #027353;
}
.setting-info-sub-panel-box:checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
.dark-mode .setting-info-sub-panel-box {
    border-color: #ffffff;
}
.setting-info-sub-panel-name {
    display: flex;
    font-size: 13px;
    margin-left: 8px;
    align-items: center;
}



/* 灰白样式类 */
.is-grey-white {
    color: #999 !important;
}
.is-grey-white .setting-info-input-name,
.is-grey-white .setting-info-sub-panel-sec-btn-l-name,
.is-grey-white .setting-info-sub-panel-sec-thr-t-l-name,
.is-grey-white .time-input,
.is-grey-white .time-divider {
    color: #999 !important;
}
.is-grey-white .win10-switch-sec {
    border-color: #999 !important;
}
.is-grey-white .win10-switch-sec.is-active {
    background-color: #999 !important;
    border-color: #999 !important;
}
.is-grey-white .setting-info-sub-panel-sec-thr-t-l-input {
    border-color: #999 !important;
}
.is-grey-white .setting-info-sub-panel-sec-thr-t-l-input:checked {
    border-color: #999 !important;
}
.is-grey-white .setting-info-sub-panel-sec-thr-t-l-input::after {
    background-color: #999 !important;
}
.is-grey-white .time-picker-box {
    border-color: #999 !important;
}
.is-grey-white .setting-info-right-r-img {
    filter: grayscale(1) opacity(0.5);
}



.setting-info-right-r-img {
    transition: transform 0.2s ease;
}
.setting-info-input {
    display: flex;
    width: 190px;
    margin-right: 40px;
    margin-left: 10px;
    align-items: center;
    background-color: #0068b800;
    flex-shrink: 0;
}
/* .setting-info-sub-panel-sec {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: calc(100% - 18px);
    height: 40px;
    background-color: #ffffff;
    margin-top: 5px;
    align-items: center;
} */
.setting-info-sub-panel-sec-btn {
    display: flex;
    flex-direction: row;
    width: 140px;
    height: 30px;
    background-color: #0068b800;
}
.setting-info-sub-panel-sec-btn-l {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: 100px;
    height: 30px;
    gap: 10px;
    background-color: rgba(255, 0, 128, 0);
}
.setting-info-sub-panel-sec-btn-l-name {
    display: flex;
    font-size: 13px;
    align-items: center;
}



.win10-switch-sec {
    position: relative;
    width: 40px;
    height: 20px;
    margin-top: 5px;
    border: 2px solid #333;
    border-radius: 10px;
    background-color: transparent;
    transition: all 0.2s ease;
    flex-shrink: 0;
}
/* Win10 滑块小圆点 */
.switch-handle-sec {
    position: absolute;
    top: 3px;
    left: 4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #333333;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s;
}
/* 激活状态 */
.win10-switch-sec.is-active {
    background-color: #027353;
    border-color: #027353;
}
/* 激活状态：圆点移动并变白 */
.win10-switch-sec.is-active .switch-handle-sec {
    transform: translateX(20px);
    background-color: #fff;
}



.setting-info-right-lbtn:hover .win10-switch-sec:not(.is-active) {
    border-color: #000;
}
.setting-info-right-lbtn:hover .win10-switch-sec.is-active {
    background-color: #0067b8;
    border-color: #0067b8;
}
.setting-info-sub-panel-sec-btn-r-btn {
    display: flex;
    width: 24px;
    height: 24px;
    border: 0;
    margin-top: 3px;
    margin-left: 8px;
    background-color: #ffffff00;
}
.setting-info-sub-panel-sec-thr {
    display: flex;
    flex-direction: column;
    width: calc(100% - 18px);
    height: 80px;
    background-color: #ffffff;
    margin-top: 5px;
    justify-content: space-around;
    padding: 5px 0;
}
.setting-info-sub-panel-sec-thr-t,
.setting-info-sub-panel-sec-thr-l {
    display: flex;
    flex-direction: row;
    width: calc(100% - 30px);
    height: 30px;
    margin-left: 30px;
    align-items: center;
    background-color: transparent;
    justify-content: space-between;
}
.setting-info-sub-panel-sec-thr-t-l {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 50%;
    height: 30px;
    background-color: #ff583300;
}
.setting-info-sub-panel-sec-thr-t-l-input {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border: 1.5px solid #333;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    transition: border-color 0.2s;
    flex-shrink: 0;
}
/* 选中状态：边框变为 Win10 蓝色 */
.setting-info-sub-panel-sec-thr-t-l-input:checked {
    border-color: #068b64;
}
/* 使用伪元素绘制中心实心圆 */
.setting-info-sub-panel-sec-thr-t-l-input::after {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #068b64;
    transform: scale(0);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
/* 选中时，伪元素放大显示 */
.setting-info-sub-panel-sec-thr-t-l-input:checked::after {
    transform: scale(1);
}
.setting-info-sub-panel-sec-thr-t-l-name {
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-left: 8px;
    flex-shrink: 0;
    overflow: hidden;
}
.setting-info-sub-panel-sec-thr-l-left {
    display: flex;
    flex-direction: row;
    width: 100px;
    height: 30px;
    align-items: center;
    background-color: #9dcdf100;
}
.setting-info-sub-panel-sec-thr-l-right {
    display: flex;
    align-items: center;
    margin-right: 40px;
    height: 30px;
    flex-direction: row;
    background-color: #9de25800;
}
.setting-info-sub-panel-sec-thr-l-right-start {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #c9210e00;
    margin-right: 0;
    flex-shrink: 0;
    overflow: hidden;
    margin-left: 60px;
}
.setting-info-sub-panel-sec-thr-l-right-end {
    display: flex;
    align-items: center;
    background-color: #2200b800;
    margin-left: 10px;
}
.setting-info-sub-panel-sec-thr-l-right-end .setting-info-sub-panel-sec-thr-t-l-name {
    margin-left: 0;
    margin-right: 10px;
    font-size: 13px;
    white-space: nowrap;
}
/* 专门针对“启用时间”这个容器内部的文字进行设置 */
.setting-info-sub-panel-sec-thr-l-right-start .setting-info-sub-panel-sec-thr-t-l-name {
    margin-left: 0;
    margin-right: 10px;
    font-size: 13px;
    white-space: nowrap;
}


.time-picker-box {
    display: flex;
    align-items: center;
    border: 1.5px solid #33333384;
    background-color: #fff;
    height: 24px;
    margin: 0;
}
.time-input {
    width: 48px;
    height: 100%;
    border: none;
    outline: none;
    text-align: center;
    font-size: 12px;
    font-family: inherit;
    background: transparent;
    padding: 0;
    -moz-appearance: textfield;
}
.time-input::-webkit-outer-spin-button,
.time-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
.time-divider {
    width: 1.5px;
    height: 100%;
    background-color: #33333384;
}


/* 响应式/间距优化 */
.setting-info-sub-panel-sec-thr-l-right-start,
.setting-info-sub-panel-sec-thr-l-right-end {
    display: flex;
    align-items: center;
    background-color: transparent;
}


/* 禁用状态（当夜间模式未开启时） */
.setting-info-sub-panel-sec-thr-l-right-start[disabled] .time-picker-box {
    border-color: #ccc;
    color: #ccc;
}
.setting-info-right-sound-input {
    display: flex;
    align-items: center;
    margin-right: 40px;
}
.setting-info-sound-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex-shrink: 0;
    overflow: hidden;
    width: 230px;
    height: 54px;
    background-color: rgba(165, 42, 42, 0);
}


.setting-info-sys {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: calc(100% - 18px);
    height: 40px;
    background-color: #ffffff;
    align-items: center;
}
.setting-info-sys-left {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    overflow: hidden;
}
.setting-info-sys-left-img {
    display: flex;
    width: 18px;
    height: 18px;
    background-color: #0068b800;
    align-items: center;
    margin-left: 12px;
}
.setting-info-sys-left-name {
    display: flex;
    font-size: 13px;
    align-items: center;
    margin-left: 8px;
}
.setting-info-sys-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    margin-left: 10px;
    gap: 12px;
    width: 150px;
    flex-shrink: 0;
    overflow: hidden;
    height: 40px;
    background-color: #ffffff00;
}
.setting-info-sys-right-func {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    width: auto;
    height: 20px;
    border: none;
    background-color: rgba(222, 184, 135, 0);
}
.setting-info-sys-right-func:hover {
    background-color: white;
}
.setting-info-sys-right-btn {
    display: flex;
    width: 16px;
    height: 16px;
    margin-right: 12px;
    background-color: #cc161600;
    border: none;
}
.setting-info-sys-right-btn-img {
    display: flex;
    width: 16px;
    height: 16px;
}
.setting-info-sys-right-func-name {
    font-size: 12px;
    padding-left: 3px;
    padding-right: 3px;
    flex-shrink: 0;
    overflow: hidden;
    color: #027353;
}
.dark-mode .setting-info-sys-right-func-name {
    color: #785f3b;
}
.setting-info-sys-more {
    display: flex;
    flex-direction: row;
    width: calc(100% - 18px);
    height: 204px;
    background-color: #ffffff;
    margin-top: 5px;
}
.setting-info-sys-more-left {
    display: flex;
    flex-direction: column;
    width: 350px;
    height: 100%;
    background-color: #0068b800;
}
.setting-info-sys-more-left-row {
    display: flex;
    flex-direction: row;
    margin-top: 8px;
    background-color: rgba(95, 158, 160, 0);
    width: 100%;
    height: 20px;
    gap: 16px;
    align-items: center;
}
.setting-info-sys-more-left-row-label {
    display: flex;
    font-size: 13px;
    margin-left: 44px;
    width: 80px;
    background-color: rgba(127, 255, 212, 0);
}
.setting-info-sys-more-left-row-value {
    font-size: 13px;
    width: 350px;
    color: rgba(0, 0, 0, 0.644);
    background-color: rgba(137, 43, 226, 0);
}
.setting-info-sys-more-left-row-btn {
    display: flex;
    font-size: 13px;
    margin-left: 44px;
    width: 160px;
    color: #027353;
    background-color: rgba(128, 255, 0, 0);
}


.dark-mode .setting-info-sys-more-left-row-btn {
    color: #785f3b;
}
.setting-info-sys-more-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    flex: 1;
    gap: 10px;
    background-color: rgba(255, 228, 196, 0);
}
.setting-info-sys-more-right-img {
    display: flex;
    width: auto;
    height: 60px;
    margin-top: 20px;
    margin-right: 18px;
    background-color: #0076d700;
}
.setting-info-sys-more-right-name {
    display: flex;
    margin-top: 25px;
    height: 60px;
    width: 140px;
    margin-right: 18px;
    font-size: 25px;
    align-items: center;
    color: #0067b8;
    background-color: #0076d700;
}
.setting-info-sub-panel-sec-fou {
    display: flex;
    flex-direction: column;
    width: calc(100% - 18px);
    min-height: 80px;
    height: auto;
    margin-top: 5px;
    background-color: #ffffff;
    justify-content: center;
    padding: 10px 0;
}


.sys-wallpaper {
    display: flex;
    width: 220px;
    flex-shrink: 0;
    position: relative;
    height: 120px;
    margin-bottom: 10px;
    background-color: #00b8005d;
}
.wallpaper-mode-content {
    display: flex;
    width: 100%;
    height: auto;
    align-items: center;
    background-color: #24c2b000;
}
.wallpaper-preview-grid {
    display: grid;
    grid-template-columns: repeat(8, 60px);
    gap: 12px;
    align-items: center;
    margin-left: 48px;
    background-color: #56dd3b00;
}
.wallpaper-item {
    width: 60px;
    height: 60px;
    overflow: hidden;
    transition: all 0.2s;
    border: 2px solid transparent;
    cursor: pointer;
    position: relative;
    background-color: #eee;
}
.wallpaper-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter 0.3s ease;
}
.wallpaper-item.is-thumbnail img {
    filter: blur(2px) contrast(0.8) brightness(1.1);
    image-rendering: pixelated;
}
.wallpaper-item.is-thumbnail:hover img {
    filter: blur(0);
}
.wallpaper-item.active-border {
    border-color: #0078d7;
}
.dark-mode .wallpaper-item.active-border {
    border-color: #785f3b;
}
.wallpaper-add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    overflow: hidden;
    background-color: #91919174;
}
.wallpaper-add-btn {
    display: flex;
    width: 16px;
    height: 16px;
}
.color-mode-content {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    background-color: #2e640d00;
}
/* 容器，用于定位下拉菜单 */
.wallpaper-mode-container {
    position: relative;
    display: flex;
    align-items: center;
}


.setting-info-right-modle {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    border: 1.5px solid #33333384;
    background-color: #fff;
    height: 24px;
    width: 64px;
    margin-right: 12px;
    margin-left: 12px;
    padding: 0 8px;
    cursor: pointer;
    transition: border-color 0.2s;
}
.selected-mode-text {
    font-size: 12px;
    color: #333;
    user-select: none;
}


/* 下拉菜单面板 */
.win10-dropdown-menu {
    position: absolute;
    top: 38px;
    left: 12px;
    width: 64px;
    background: white;
    border: 1.5px solid #33333384;
    z-index: 100;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
/* 下拉选项样式 */
.dropdown-item {
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.1s;
}
.dropdown-item:hover {
    background-color: #e5e5e5;
}
.selected-mode-img {
    width: 12px;
    height: 12px;
    background-color: #0068b800;
}
.setting-info-wall-info {
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    justify-content: space-between;
    width: calc(100% - 18px);
    height: 40px;
    background-color: #ffffff;
    margin-top: 5px;
    align-items: center;
}
.setting-info-wall-info-name {
    display: flex;
    flex-shrink: 0;
    font-size: 13px;
    margin-left: 48px;
}
.setting-info-wall-right {
    display: flex;
    margin-right: 32px;
    background-color: #0068b800;
}
.display-settings-wall-view {
    display: flex;
    flex-direction: row;
    background-color: rgba(0, 255, 255, 0);
}
.display-settings-wall-view-right {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.display-settings-wall-view-topbtn {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 170px;
    height: 36px;
    margin-left: 12px;
    background-color: #589bcf00;
}
.display-settings-wall-view-topbtn-btn {
    display: flex;
    width: 70px;
    height: 30px;
    font-size: 13px;
    align-items: center;
    justify-content: center;
    color: #000;
    margin-top: 3px;
    background-color: rgb(255, 255, 255);
    border: none;
}
.wallpaper-float-block {
    position: absolute;
    width: 65px;
    height: 60px;
    /* background-color: #ffffffa9;  */
    left: 10px;
    top: 50px;
    display: flex;
    justify-content: center;
    -webkit-mask-image:
        linear-gradient(#fff, #fff),
        linear-gradient(#fff, #fff);
    -webkit-mask-clip: content-box;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%, 34px 8px;
    -webkit-mask-position: 0 0, center bottom 8px;
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
.wallpaper-transparent-hole {
    position: absolute;
    width: 34px;
    height: 8px;
    bottom: 8px;
    background-color: rgba(255, 255, 255, 0.271);
    backdrop-filter: blur(2px);
    left: 50%;
    transform: translateX(-50%);
    border: 1px solid rgba(255, 255, 255, 0.4);
    pointer-events: none;
}


.setting-info-sub-panel-sec-fou-area {
    display: flex;
    flex-direction: row;
    width: 240px;
    height: 60px;
    margin-left: 48px;
    gap: 12px;
    background-color: #5af4c300;
}
.setting-info-sub-panel-sec-fou-area-theme {
    display: flex;
    position: relative;
    width: 80px;
    height: 60px;
    background-color: #0067b8;
}
.wallpaper-float-block-2 {
    position: absolute;
    width: 35px;
    height: 32px;
    background-color: #ffffffa9;
    left: 6px;
    top: 22px;
    display: flex;
    justify-content: center;
    -webkit-mask-image:
        linear-gradient(#fff, #fff),
        linear-gradient(#fff, #fff);
    -webkit-mask-clip: content-box;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%, 18px 5px;
    -webkit-mask-position: 0 0, center bottom 4px;
    -webkit-mask-composite: xor;
    mask-composite: exclude;
}
.wallpaper-transparent-hole-2 {
    position: absolute;
    width: 18px;
    height: 5px;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
}
.setting-info-right-theme {
    display: flex;
    height: 100%;
    align-items: center;
}


/* --- Dark Mode Styles --- */
.setting-view-one.dark-mode {
    background-color: #2f2c2b;
    color: white;
}
.setting-custom-header-1.dark-mode {
    background-color: #21201e;
}

/* Header Areas in Dark Mode */
.setting-custom-header-1.dark-mode .setting-title-area-1,
.setting-custom-header-1.dark-mode .setting-title-btn-1 {
    background-color: transparent;
}

/* Window Controls in Dark Mode */
.setting-custom-header-1.dark-mode :deep(.control-btn-img) {
    filter: invert(1);
}
.setting-custom-header-1.dark-mode :deep(.control-btn:hover) {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-custom-header-1.dark-mode :deep(.control-btn.close:hover) {
    background-color: #e81123;
}

/* Search Box in Dark Mode */
.setting-view-one.dark-mode .search-box input {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}
.setting-view-one.dark-mode .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.7);
}
.setting-view-one.dark-mode .search-input-img {
    filter: invert(1);
}

/* Grid Items in Dark Mode */
.setting-view-one.dark-mode .grid-item:hover {
    background: rgba(255, 255, 255, 0.05);
}
.setting-view-one.dark-mode .grid-item .title {
    color: white;
}
.setting-view-one.dark-mode .grid-item .desc {
    color: #aaa;
}
.setting-view-one.dark-mode .setting-icon {
    filter: invert(1);
}


/* Clear backgrounds for inner header containers in dark mode */
.setting-custom-header-2.dark-mode .setting-title-area-2 {
    background-color: #2f2c2b;
}
.setting-custom-header-2.dark-mode .setting-title-btn-2 {
    background-color: #21201e;
}
.setting-custom-header-2.dark-mode .setting-title-area-viewtitle-info {
    color: white;
}
.setting-custom-header-2.dark-mode .setting-title-area-viewtitle-img {
    filter: invert(1);
}
.setting-custom-header-2.dark-mode .setting-title-area-viewtitle-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* Window Controls in Dark Mode (Header 2) */
.setting-custom-header-2.dark-mode :deep(.control-btn-img) {
    filter: invert(1);
}
.setting-custom-header-2.dark-mode :deep(.control-btn:hover) {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-custom-header-2.dark-mode :deep(.control-btn.close:hover) {
    background-color: #e81123;
}

/* Sidebar */
.setting-container.dark-mode .sidebar {
    background-color: #2f2c2b;
    color: white;
}
.setting-container.dark-mode .sidebar-title {
    color: white;
}
.setting-container.dark-mode .back-btn-info {
    color: white;
}
.setting-container.dark-mode .back-btn-img {
    filter: invert(1);
}
.setting-container.dark-mode .back-btn:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-container.dark-mode .sidebar-menu li {
    color: white;
}
.setting-container.dark-mode .sidebar-menu li:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-container.dark-mode .sidebar-menu li.active {
    background-color: rgba(255, 255, 255, 0.05);
}
.setting-container.dark-mode .sidebar-menu li img {
    filter: invert(1);
}

/* Search Box in Sidebar */
.setting-container.dark-mode .sidebar-search-input {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}
.setting-container.dark-mode .sidebar-search-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}
.setting-container.dark-mode .search-icon-img {
    filter: invert(1);
}

/* Content Area */
.setting-container.dark-mode .content {
    background-color: #21201e;
    color: white;
}
.setting-container.dark-mode .content h2 {
    color: white;
}

/* Setting Info Rows */
.setting-container.dark-mode .setting-info {
    background-color: rgba(45, 45, 45, 0.95);
    color: white;
}
.setting-container.dark-mode .setting-info.is-small {
    background-color: transparent;
}
.setting-container.dark-mode .setting-info-left-r-low {
    color: #bbb;
}
.setting-container.dark-mode .setting-info-left-l-img,
.setting-container.dark-mode .setting-info-right-r-img {
    filter: invert(1);
}

/* Sub Panels */
.setting-container.dark-mode .setting-info-sub-panel,
.setting-container.dark-mode .setting-info-sub-panel-sec,
.setting-container.dark-mode .setting-info-sub-panel-sec-thr,
.setting-container.dark-mode .setting-info-sub-panel-sec-fou,
.setting-container.dark-mode .setting-info-sys,
.setting-container.dark-mode .setting-info-sys-more,
.setting-container.dark-mode .setting-info-wall-info {
    background-color: rgba(45, 45, 45, 0.95);
    color: white;
}

/* Inputs & Controls */
.setting-container.dark-mode .win10-switch {
    border-color: #fff;
}
.setting-container.dark-mode .win10-switch.is-active {
    border-color: #816443;
    background-color: #816443;
}
.setting-container.dark-mode .win10-switch .switch-handle {
    background-color: #fff;
}
.setting-container.dark-mode .win10-switch.is-active .switch-handle {
    background-color: #fff;
}
.setting-container.dark-mode .win10-switch-sec.is-active {
    border-color: #816443;
    background-color: #816443;
}
.setting-container.dark-mode .setting-info-sub-panel-sec-thr-t-l-input:checked {
    border-color: #785f3b;
}
.setting-container.dark-mode .setting-info-sub-panel-sec-thr-t-l-input::after {
    background-color: #785f3b;
}
.setting-container.dark-mode .switch-handle-sec {
    background-color: #fff;
}
.setting-container.dark-mode .setting-info-sub-panel-box:checked {
    background-color: #785f3b;
    border-color: #785f3b;
}

/* Dropdowns & Pickers */
.setting-container.dark-mode .setting-info-right-modle,
.setting-container.dark-mode .time-picker-box {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
}
.setting-container.dark-mode .selected-mode-text {
    color: white;
}
.setting-container.dark-mode .selected-mode-img {
    filter: invert(1);
}
.setting-container.dark-mode .win10-dropdown-menu {
    background-color: #2d2d2d;
    border-color: #444;
    color: white;
}
.setting-container.dark-mode .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-container.dark-mode .time-divider {
    background-color: rgba(255, 255, 255, 0.3);
}

/* System Info */
.setting-container.dark-mode .setting-info-sys-left-img {
    filter: invert(1);
}
.setting-container.dark-mode .setting-info-sys-right-func {
    color: white;
}
.setting-container.dark-mode .setting-info-sys-right-func:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
.setting-container.dark-mode .setting-info-sys-right-btn-img {
    filter: invert(1);
}
.setting-container.dark-mode .setting-info-sys-more-left-row-value {
    color: #ccc;
}
.setting-container.dark-mode .setting-info-sys-more-right-name {
    color: #3fa9f5;
}

/* Wallpaper Preview Grid */
.setting-container.dark-mode .wallpaper-add {
    background-color: rgba(255, 255, 255, 0.2);
}
.setting-container.dark-mode .wallpaper-add-btn {
    filter: invert(1);
}

/* Buttons */
.setting-container.dark-mode .display-settings-wall-view-topbtn-btn {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
}
</style>