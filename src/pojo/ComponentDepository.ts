import type { Component } from 'vue'

export default class ComponentDepository {
    private components: Map<string, Component> = new Map()

    public setComponent(name: string, component: Component) {
        this.components.set(name, component)
    }

    public getComponent(name: string): Component {
        return this.components.get(name)
    }
}