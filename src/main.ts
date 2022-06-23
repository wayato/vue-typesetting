import VueInstance from './lib/VueInstance'
import { Page } from './lib/Page'
import Vue from 'vue'

export default {
    setVue(vue: Vue) {
        VueInstance.vue = vue
    },
    Page
}