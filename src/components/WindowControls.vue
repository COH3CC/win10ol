<template>
    <div class="window-controls" @mousedown.stop>
        <button class="control-btn minimize" @click.stop="minimize">
            <img class="control-btn-img" src="icons/system/Remove.png"></img>
        </button>
        <button class="control-btn maximize" @click.stop="toggleMaximize">
            <img 
                class="control-btn-img" 
                :src="isMaximized ? 'icons/system/Chrome Restore.png' : 'icons/system/Chrome Maximize.png'" 
                alt="maximize"
            >
        </button>
        <button class="control-btn close" @click.stop="close">
            <img class="control-btn-img" src="icons/system/close.png"></img>
        </button>
    </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const props = defineProps<{
    windowId: number;
    isMaximized: boolean;
}>();

// 注入 windows.vue 提供的操作
const windowActions = inject<any>('windowActions');

const close = () => windowActions?.close(props.windowId);
const minimize = () => windowActions?.minimize(props.windowId);
const toggleMaximize = () => windowActions?.maximize(props.windowId);
</script>

<style scoped>
.window-controls {
    display: flex;
    height: 100%;
    justify-content: flex-end;
    background-color:rgba(255, 255, 255, 0);
    flex-shrink: 0;
    -webkit-app-region: no-drag;
}
.control-btn {
    width: 48px; 
    height: 100%; 
    flex-shrink: 0;
    border: none;
    background-color:rgba(255, 255, 255, 0);
    cursor: default;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.1s;
}
.control-btn-img {
    /* background-color: aqua; */
    width: 10px;
    height: 10px;
}
.control-btn .icon {
    font-size: 12px;
    color: #000;
}
.control-btn:hover {
    background-color:rgba(255, 255, 255, 0.723);
}
.control-btn.close:hover {
    background-color: #e81123;
}
.control-btn.close:hover .icon {
    background-color:rgba(255, 255, 255, 0);
}
</style>