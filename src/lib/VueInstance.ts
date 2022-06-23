import Vue from 'vue'
import type { Component, AsyncComponent } from 'vue'

export default class VueInstance {
    // 静态属性：page处于的vue实例
    public static vue: Vue

    // 静态方法：根据组件名称获取vue实例中的组件
    public static getComponent(name: string): Component<any, any, any, any> | AsyncComponent<any, any, any, any> | string {
        return this.vue.$options.components[name] || 'div'
    }
}