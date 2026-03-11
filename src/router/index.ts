import { createRouter, createWebHistory } from 'vue-router'
import windows from '@/views/windows.vue'


const routes = [
    {
        path: '/',
        redirect: '/windows'
    },
    {
        path: '/windows',
        name: 'windows',
        component: windows
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router
