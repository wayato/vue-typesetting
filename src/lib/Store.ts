import Vue from 'vue'
import type { Component, AsyncComponent } from 'vue'

/**
 * 仓库
 */
export default class Store {
    // page处于的vue实例
    private static vue: Vue
    
    // 设置vue
    public static setVue(vue: Vue) {
        this.vue = vue
    }

    // 根据组件名称获取vue实例中的组件
    public static getComponent(name: string): Component<any, any, any, any> | AsyncComponent<any, any, any, any> | string {
        return this.vue.$options.components[name] || 'div'
    }
}