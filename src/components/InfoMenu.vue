<template>
    <div class="info-popup-menu-container" :class="{ 'dark': theme === 'dark' }">
        <div class="info-popup-menu-info-top">
            <div class="info-popup-menu-info-top-tabar">
                <div class="info-popup-menu-info-top-tabar-name">通知</div>
                <div class="info-popup-menu-info-top-tabar-btn">
                    <button class="info-popup-menu-info-top-tabar-btn-button quiet-hours-btn" @click="toggleTheme"
                        :class="{ 'active': isNightMode }">
                        <img class="info-popup-menu-info-top-tabar-btn-button-img"
                            src="icons/system/Quiet Hours.png" />
                    </button>
                    <button class="info-popup-menu-info-top-tabar-btn-button"
                        @click="notificationStore.clearAllSystem()">
                        <img class="info-popup-menu-info-top-tabar-btn-button-img" src="icons/system/Delete.png" />
                    </button>
                </div>
            </div>
            <div class="info-popup-menu-info-top-view">
                <div class="info-popup-menu-info-top-view-info-area">
                    <template v-for="(notifications, source) in groupedNotifications" :key="source">
                        <template v-if="notifications.length === 1 || expandedSources.has(String(source))">
                            <div v-for="n in notifications" :key="n.id" class="info-popup-menu-info-top-view-info"
                                :style="getItemStyle('single', n.id)" @mousedown="onDragStart($event, 'single', n.id)"
                                @touchstart="onDragStart($event, 'single', n.id)">
                                <div class="info-popup-menu-info-top-view-info-top">
                                    <div class="info-popup-menu-info-top-view-info-top-l">
                                        <div class="info-popup-menu-info-top-view-info-top-l-imgbox">
                                            <img class="info-popup-menu-info-top-view-info-top-l-img"
                                                :src="getSourceIcon(String(source))" />
                                        </div>
                                        <div class="info-popup-menu-info-top-view-info-top-l-info">{{ source }}</div>
                                    </div>
                                    <div class="info-popup-menu-info-top-view-info-top-r">
                                        <button class="info-popup-menu-info-top-view-info-top-r-btn"
                                            @click.stop="removeSingle(String(n.id))" @mousedown.stop @touchstart.stop>
                                            <img class="info-popup-menu-info-top-view-info-top-r-btn-img"
                                                src="icons/system/Cancel.png" />
                                        </button>
                                    </div>
                                </div>
                                <div class="info-popup-menu-info-top-view-info-low">
                                    <div class="info-popup-menu-info-top-view-info-low-imgbox">
                                        <img class="info-popup-menu-info-top-view-info-low-img"
                                            :src="getSourceIcon(n.source || '')" />
                                    </div>
                                    <div class="info-popup-menu-info-top-view-info-low-info-area">
                                        <div class="info-popup-menu-info-top-view-info-low-info-area-tab">
                                            <span class="info-popup-menu-info-top-view-info-low-info-area-tab-info">{{
                                                n.source }}</span>
                                        </div>
                                        <div class="info-popup-menu-info-top-view-info-low-info-area-info">
                                            <span class="info-popup-menu-info-top-view-info-low-info-area-info-info">{{
                                                n.message }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="info-popup-menu-info-top-view-info-2"
                                :style="getItemStyle('group', String(source))"
                                @mousedown="onDragStart($event, 'group', String(source))"
                                @touchstart="onDragStart($event, 'group', String(source))">
                                <div class="info-popup-menu-info-top-view-info-top">
                                    <div class="info-popup-menu-info-top-view-info-top-l">
                                        <div class="info-popup-menu-info-top-view-info-top-l-imgbox">
                                            <img class="info-popup-menu-info-top-view-info-top-l-img"
                                                :src="getSourceIcon(String(source))" />
                                        </div>
                                        <div class="info-popup-menu-info-top-view-info-top-l-info">{{ source }}</div>
                                    </div>
                                    <div class="info-popup-menu-info-top-view-info-top-r">
                                        <button class="info-popup-menu-info-top-view-info-top-r-btn"
                                            @click.stop="removeGroup(String(source))" @mousedown.stop @touchstart.stop>
                                            <img class="info-popup-menu-info-top-view-info-top-r-btn-img"
                                                src="icons/system/Cancel.png" />
                                        </button>
                                    </div>
                                </div>
                                <div class="info-popup-menu-info-top-view-info-2-low">
                                    <div class="info-popup-menu-info-top-view-info-2-low-info">
                                        <div class="info-popup-menu-info-top-view-info-low-imgbox">
                                            <img class="info-popup-menu-info-top-view-info-low-img"
                                                :src="getSourceIcon(notifications[0]?.source || '')" />
                                        </div>
                                        <div class="info-popup-menu-info-top-view-info-low-info-area">
                                            <div class="info-popup-menu-info-top-view-info-low-info-area-tab">
                                                <span
                                                    class="info-popup-menu-info-top-view-info-low-info-area-tab-info">{{
                                                    notifications[0]?.source }}</span>
                                            </div>
                                            <div class="info-popup-menu-info-top-view-info-low-info-area-info">
                                                <span
                                                    class="info-popup-menu-info-top-view-info-low-info-area-info-info">{{
                                                    notifications[0]?.message ?? '' }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="info-popup-menu-info-top-view-info-2-low-more"
                                        @click.stop="expandSource(String(source))" @mousedown.stop @touchstart.stop>
                                        <span class="info-popup-menu-info-top-view-info-2-low-more-info">{{
                                            notifications.length - 1 }}
                                            条通知</span>
                                        <img class="info-popup-menu-info-top-view-info-2-low-more-info-img"
                                            src="icons/system/Chevron Down.png" />
                                    </button>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>
            </div>
        </div>

        <div class="info-popup-menu-info-low">
            <div class="info-popup-menu-info-low-1">
                <div class="info-popup-menu-info-low-1-l">
                    <img class="info-popup-menu-info-low-1-img" src="icons/system/Battery 10.png" />
                    <span class="info-popup-menu-info-low-1-l-info">100%</span>
                </div>
                <div class="info-popup-menu-info-low-1-r">
                    <img class="info-popup-menu-info-low-1-img-2" src="icons/system/Setting.png" />
                </div>
            </div>
            <div class="info-popup-menu-info-low-2">
                <img class="info-popup-menu-info-low-2-img" src="icons/system/Brightness.png" />
                <div class="info-popup-menu-info-low-2-slider-box">
                    <input type="range" class="win10-slider" min="20" max="100" v-model="brightness"
                        :style="{ backgroundSize: ((brightness - 20) / 80 * 100) + '% 100%' }">
                </div>
            </div>
            <div class="info-popup-menu-info-low-3">
                <img class="info-popup-menu-info-low-2-img" src="icons/system/Volume 3.png" />
                <div class="info-popup-menu-info-low-2-slider-box">
                    <input type="range" class="win10-slider" min="0" max="100" v-model="volume"
                        :style="{ backgroundSize: volume + '% 100%' }">
                </div>
                <img class="info-popup-menu-info-low-3-img2" src="icons/system/Mix Volumes.png"></img>
            </div>
            <div class="info-popup-menu-info-low-4">
                <button class="info-popup-menu-info-low-4-btn">展开</button>
            </div>
            <div class="info-popup-menu-info-low-5">
                <button class="info-popup-menu-info-low-5-btn" @click="toggleAction('network')"
                    :class="{ 'active': actionStates.network }">
                    <div class="info-popup-menu-info-low-5-btn-imgbox">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img" src="icons/system/Wifi.png">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img"
                            src="icons/system/Cheveron Right 20.png">
                    </div>
                    <div class="info-popup-menu-info-low-5-btn-info">
                        <span class="info-popup-menu-info-low-5-btn-info-info">网络</span>
                    </div>
                </button>
                <button class="info-popup-menu-info-low-5-btn" @click="toggleAction('bluetooth')"
                    :class="{ 'active': actionStates.bluetooth }">
                    <div class="info-popup-menu-info-low-5-btn-imgbox">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img" src="icons/system/Bluetooth.png">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img"
                            src="icons/system/Cheveron Right 20.png">
                    </div>
                    <div class="info-popup-menu-info-low-5-btn-info">
                        <span class="info-popup-menu-info-low-5-btn-info-info">蓝牙</span>
                    </div>
                </button>
                <button class="info-popup-menu-info-low-5-btn" @click="toggleSystemTheme"
                    :class="{ 'active': theme === 'dark' }">
                    <div class="info-popup-menu-info-low-5-btn-imgbox">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img" src="icons/system/Light.png">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img"
                            src="icons/system/Cheveron Right 20.png">
                    </div>
                    <div class="info-popup-menu-info-low-5-btn-info">
                        <span class="info-popup-menu-info-low-5-btn-info-info">深色模式</span>
                    </div>
                </button>
                <button class="info-popup-menu-info-low-5-btn" @click="toggleAction('airplane')"
                    :class="{ 'active': actionStates.airplane }">
                    <div class="info-popup-menu-info-low-5-btn-imgbox">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img" src="icons/system/Airplane.png">
                        <img class="info-popup-menu-info-low-5-btn-imgbox-img"
                            src="icons/system/Cheveron Right 20.png">
                    </div>
                    <div class="info-popup-menu-info-low-5-btn-info">
                        <span class="info-popup-menu-info-low-5-btn-info-info">飞行模式</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSystemStore } from '../stores/system';
import { useNotificationStore, type Notification } from '../stores/notification';
import { computed, reactive, ref, onUnmounted } from 'vue';

const systemStore = useSystemStore();
const notificationStore = useNotificationStore();

const removingKeys = reactive(new Set<string>());
const swipeOffsets = reactive(new Map<string, number>());
const draggingKey = ref<string | null>(null);
const startX = ref(0);
const dragMeta = ref<{ type: 'single' | 'group', id: string | number } | null>(null);

const getSwipeKey = (type: 'single' | 'group', id: string | number) => `${type}-${id}`;

const handleRemoveAnimation = (key: string, callback: () => void) => {
    removingKeys.add(key);
    swipeOffsets.set(key, 500);
    setTimeout(() => {
        callback();
        removingKeys.delete(key);
        swipeOffsets.delete(key);
    }, 300);
};

const removeSingle = (id: string) => {
    const key = getSwipeKey('single', id);
    handleRemoveAnimation(key, () => notificationStore.remove(id));
};

const removeGroup = (source: string) => {
    const key = getSwipeKey('group', source);
    handleRemoveAnimation(key, () => notificationStore.clearByCategory(source));
};

const onDragStart = (e: MouseEvent | TouchEvent, type: 'single' | 'group', id: string | number) => {
    const key = getSwipeKey(type, id);
    if (removingKeys.has(key)) return;

    draggingKey.value = key;
    dragMeta.value = { type, id };
    startX.value = (e instanceof MouseEvent) ? e.clientX : e.touches?.[0]?.clientX ?? 0;

    if (e instanceof MouseEvent) {
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);
    } else {
        window.addEventListener('touchmove', onDragMove);
        window.addEventListener('touchend', onDragEnd);
    }
};

const onDragMove = (e: MouseEvent | TouchEvent) => {
    if (!draggingKey.value) return;

    const currentX = (e instanceof MouseEvent) ? e.clientX : e.touches?.[0]?.clientX ?? 0;
    const diff = currentX - startX.value;

    if (diff > 0) {
        swipeOffsets.set(draggingKey.value, diff);
    }
};

const onDragEnd = (e: MouseEvent | TouchEvent) => {
    if (!draggingKey.value || !dragMeta.value) return;

    const key = draggingKey.value;
    const offset = swipeOffsets.get(key) || 0;
    const { type, id } = dragMeta.value;

    if (offset > 150) {
        if (type === 'single') removeSingle(String(id));
        else removeGroup(String(id));
    } else {
        swipeOffsets.set(key, 0);
        setTimeout(() => swipeOffsets.delete(key), 300);
    }

    draggingKey.value = null;
    dragMeta.value = null;

    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
};

const getItemStyle = (type: 'single' | 'group', id: string | number) => {
    const key = getSwipeKey(type, id);
    const offset = swipeOffsets.get(key) || 0;
    const isRemoving = removingKeys.has(key);
    const isDragging = draggingKey.value === key;

    return {
        transform: `translateX(${offset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        opacity: 1
    };
};

onUnmounted(() => {
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
});

const { brightness, volume, theme, isNightMode } = storeToRefs(systemStore);

const toggleTheme = () => {
    isNightMode.value = !isNightMode.value;
};

const toggleSystemTheme = () => {
    systemStore.setTheme(theme.value === 'light' ? 'dark' : 'light');
};

const actionStates = reactive({
    network: true,
    bluetooth: true,
    airplane: false
});

const toggleAction = (key: keyof typeof actionStates) => {
    actionStates[key] = !actionStates[key];
};

const expandedSources = reactive(new Set<string>());

const groupedNotifications = computed(() => {
    const groups: Record<string, Notification[]> = {};

    const systemNotifications = notificationStore.notifications.filter(n => n.isSystem);

    systemNotifications.forEach(n => {
        const category = n.category || '系统';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(n);
    });

    for (const category in groups) {
        groups[category]?.sort((a, b) => {
            const tsA = a?.timestamp != null ? Number(a.timestamp) : 0;
            const tsB = b?.timestamp != null ? Number(b.timestamp) : 0;
            return tsA - tsB;
        });
    }

    return groups;
});

const expandSource = (source: string) => {
    expandedSources.add(source);
};

const getSourceIcon = (source: string) => {
    if (!source) return 'icons/system/System.png';
    switch (source) {
        case '日程': return 'icons/system/Calendar.png';
        case '系统': return 'icons/system/System.png';
        case '设置': return 'icons/system/Setting.png';
        case '应用': return 'icons/system/System.png';
        default: return 'icons/system/System.png';
    }
};
</script>

<style scoped>
.info-popup-menu-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    /* background-color: aqua; */
}

.info-popup-menu-info-top {
    display: flex;
    width: 100%;
    flex: 1;
    min-height: 0;
    background-color: rgba(255, 255, 255, 0.650);
    flex-direction: column;
}

.info-popup-menu-info-top-tabar {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 35px;
    justify-content: space-between;
    /* background-color: burlywood; */
}

.info-popup-menu-info-top-tabar-name {
    display: flex;
    margin-left: 15px;
    height: 20px;
    font-size: 14px;
    align-items: center;
    color: #1a1a1a;
    margin-top: 10px;
    /* background-color: #ff4d4d; */
}

.info-popup-menu-info-top-tabar-btn {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-right: 15px;
    width: 65px;
    height: 20px;
    gap: 10px;
    margin-top: 10px;
    /* background-color: blueviolet; */
}

.info-popup-menu-info-top-tabar-btn-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    padding: 0;
    border: 0;
    background-color: #ffffffe0;
}

.info-popup-menu-info-top-tabar-btn-button:active {
    transform: scale(0.9);
}

.quiet-hours-btn.active {
    background-color: #068b64;
}

.info-popup-menu-container.dark .quiet-hours-btn.active {
    background-color: #785f3b;
}

.info-popup-menu-info-top-tabar-btn-button-img {
    display: flex;
    width: 12px;
    height: 12px;
}


.info-popup-menu-info-top-view {
    display: flex;
    flex: 1;
    /* background-color: blueviolet; */
    overflow-y: scroll;
    scrollbar-width: none;
}

.info-popup-menu-info-top-view::-webkit-scrollbar {
    display: none;
}

.info-popup-menu-info-top-view-info-area {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    /* background-color: darkgoldenrod; */
}

.info-popup-menu-info-top-view-info {
    display: flex;
    flex-direction: column;
    background-color: #ffffffbe;
    width: 300px;
    height: 70px;
    margin-left: 15px;
    user-select: none;
}

.info-popup-menu-info-top-view-info-top {
    display: flex;
    width: auto;
    height: 25px;
    margin-left: 10px;
    margin-right: 10px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    /* background-color: rgba(0, 255, 255, 0.815); */
}

.info-popup-menu-info-top-view-info-top-l {
    display: flex;
    flex-direction: row;
}

.info-popup-menu-info-top-view-info-top-l-imgbox {
    display: flex;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background-color: #71b81400;
}

.info-popup-menu-info-top-view-info-top-l-img {
    display: flex;
    width: 12px;
    height: 12px;
}

.info-popup-menu-info-top-view-info-top-l-info {
    display: flex;
    margin-left: 5px;
    font-size: 11px;
    color: #1a1a1a;
    align-items: center;
    justify-content: center;
}

.info-popup-menu-info-top-view-info-top-r {
    display: flex;
    width: 20px;
    height: 20px;
}

.info-popup-menu-info-top-view-info-top-r-btn {
    display: flex;
    width: 20px;
    height: 20px;
    border: none;
    align-items: center;
    justify-content: flex-end;
    margin-top: 2px;
    background-color: rgba(0, 13, 255, 0);
    cursor: pointer;
}

.info-popup-menu-info-top-view-info-top-r-btn-img {
    display: flex;
    width: 12px;
    height: 12px;
    pointer-events: none;
}

.info-popup-menu-info-top-view-info-low {
    display: flex;
    flex-direction: row;
    width: auto;
    height: 45px;
    margin-left: 10px;
    margin-right: 10px;
    /* background-color: rgb(0, 98, 0); */
}

.info-popup-menu-info-top-view-info-low-imgbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.791);
}

.info-popup-menu-info-top-view-info-low-img {
    display: flex;
    width: 15px;
    height: 15px;
}

.info-popup-menu-info-top-view-info-low-info-area {
    display: flex;
    width: 230px;
    height: 35px;
    margin-left: 10px;
    flex-direction: column;
    /* background-color: #fff34d; */
}

.info-popup-menu-info-top-view-info-low-info-area-tab {
    display: flex;
    width: 100%;
    height: 50%;
    /* background-color: #0078d7; */
}

.info-popup-menu-info-top-view-info-low-info-area-tab-info {
    display: flex;
    font-size: 12px;
    color: #000000;
}

.info-popup-menu-info-top-view-info-low-info-area-info {
    display: flex;
    width: 100%;
    height: 50%;
}

.info-popup-menu-info-top-view-info-low-info-area-info-info {
    display: flex;
    font-size: 12px;
    color: #1a1a1a;
}


.info-popup-menu-info-top-view-info-2 {
    display: flex;
    flex-direction: column;
    background-color: #ffffffbe;
    width: 300px;
    height: 97px;
    margin-left: 15px;
    user-select: none;
}

.info-popup-menu-info-top-view-info-2-low {
    display: flex;
    flex-direction: column;
    width: auto;
    height: 63px;
    margin-left: 10px;
    margin-right: 10px;
    /* background-color: darkgreen; */
}

.info-popup-menu-info-top-view-info-2-low-info {
    display: flex;
    width: 280px;
    height: 45px;
    align-items: center;
    /* background-color: #db4dff; */
}

.info-popup-menu-info-top-view-info-2-low-more {
    display: flex;
    flex-direction: row;
    width: 52px;
    height: 19px;
    align-items: center;
    justify-content: center;
    border: none;
    gap: 4px;
    background-color: #c1dfd8;
}

.info-popup-menu-info-top-view-info-2-low-more-info {
    display: flex;
    font-size: 8px;
    color: #057555;
}

.info-popup-menu-info-top-view-info-2-low-more-info-img {
    display: flex;
    width: 8px;
    height: 8px;
    color: #057555;
}


.info-popup-menu-info-low {
    display: flex;
    height: auto;
    flex-shrink: 0;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.750);
}

.info-popup-menu-info-low-1 {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 30px;
    /* background-color: #ff4d4d; */
}

.info-popup-menu-info-low-1-l {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 15px;
    gap: 4px;
}

.info-popup-menu-info-low-1-img {
    display: flex;
    width: 16px;
    height: 16px;
}

.info-popup-menu-info-low-1-l-info {
    display: flex;
    font-size: 12px;
    color: #1a1a1a;
}

.info-popup-menu-info-low-1-r {
    display: flex;
    padding-right: 15px;
    align-items: center;
}

.info-popup-menu-info-low-1-img-2 {
    display: flex;
    width: 12px;
    height: 12px;
    /* background-color: #4dd5ff; */
}

.info-popup-menu-info-low-2 {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 30px;
    /* background-color: #fff34d; */
    padding-right: 15px;
    box-sizing: border-box;
}

.info-popup-menu-info-low-2-img {
    display: flex;
    width: 18px;
    height: 18px;
    margin-left: 15px;
    margin-right: 15px;
}

.info-popup-menu-info-low-2-slider-box {
    display: flex;
    width: 234px;
    align-items: center;
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

.info-popup-menu-container.dark .win10-slider {
    background-color: #544739;
    background-image: linear-gradient(#785f3b, #785f3b);
}

.info-popup-menu-container.dark .win10-slider::-webkit-slider-thumb {
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

.info-popup-menu-info-low-3 {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 30px;
    padding-right: 15px;
    box-sizing: border-box;
    /* background-color: #71ff4d; */
}

.info-popup-menu-info-low-3-img2 {
    display: flex;
    width: 18px;
    height: 18px;
    margin-left: 15px;
}

.info-popup-menu-info-low-4 {
    display: flex;
    width: 100%;
    height: 30px;
    align-items: flex-end;
    /* background-color: #4dd5ff; */
}

.info-popup-menu-info-low-4-btn {
    display: flex;
    width: 30px;
    height: 20px;
    font-size: 12px;
    margin-left: 15px;
    margin-right: 15px;
    border: none;
    background-color: #ff4d4d00;
}

.info-popup-menu-info-low-5 {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 80px;
    gap: 10px;
    justify-content: center;
    align-items: center;
    /* background-color: #ff4dff; */
}

.info-popup-menu-info-low-5-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 70px;
    height: 60px;
    background-color: #ffffff;
    border: none;
    transition: all 0.2s ease;
    cursor: pointer;
}

.info-popup-menu-info-low-5-btn:hover {
    background-color: rgba(255, 255, 255, 0.8);
}

.info-popup-menu-info-low-5-btn:active {
    transform: scale(0.95);
}

.info-popup-menu-info-low-5-btn.active {
    background-color: #068b64 !important;
}

.info-popup-menu-info-low-5-btn.active .info-popup-menu-info-low-5-btn-info-info {
    color: white;
}

.info-popup-menu-info-low-5-btn.active .info-popup-menu-info-low-5-btn-imgbox-img {
    filter: invert(1);
}

.info-popup-menu-info-low-5-btn-imgbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 55px;
    height: 35px;
    /* background-color: #ff4d4d; */
}

.info-popup-menu-info-low-5-btn-imgbox-img {
    display: flex;
    width: 16px;
    height: 16px;
    border: none;
    background-color: rgba(95, 158, 160, 0);
}

.info-popup-menu-info-low-5-btn-info {
    display: flex;
    width: 55px;
    height: 30px;
    align-items: center;
    /* background-color: #31da83; */
}

.info-popup-menu-info-low-5-btn-info-info {
    display: flex;
    font-size: 12px;
}


.info-popup-menu-container.dark .info-popup-menu-info-top {
    background-color: #21201e;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-tabar-name {
    color: #ffffff;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-view-info,
.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-2 {
    background-color: #434141;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-top-l-info,
.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-low-info-area-info-info,
.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-low-info-area-tab-info {
    color: #ffffff;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-low-imgbox {
    background-color: rgba(80, 80, 80, 0.8);
}

.info-popup-menu-container.dark .info-popup-menu-info-low {
    background-color: #2f2c2b;
}

.info-popup-menu-container.dark .info-popup-menu-info-low-4-btn {
    color: #ffffff;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-2-low-more-info {
    color: #ffffff;
}

.info-popup-menu-container.dark .info-popup-menu-info-low-1-l-info,
.info-popup-menu-container.dark .info-popup-menu-info-low-5-btn-info-info {
    color: #ffffff;
}

.info-popup-menu-container.dark .info-popup-menu-info-low-5-btn {
    background-color: #4d4b49;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-view-info-2-low-more {
    background-color: #785f3b;
}

.info-popup-menu-container.dark .info-popup-menu-info-low-5-btn:hover {
    background-color: rgb(58, 57, 57);
}

.info-popup-menu-container.dark img {
    filter: invert(1);
}

.info-popup-menu-container.dark .info-popup-menu-info-low-5-btn.active {
    background-color: #785f3b !important;
}

.info-popup-menu-container.dark .info-popup-menu-info-top-tabar-btn-button {
    background-color: #4c4a4a;
}
</style>