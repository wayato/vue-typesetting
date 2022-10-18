interface Typesetting {
    init(vue: Vue, domId: string): void

    // 开始拖拽
    startDrag(e: MouseEvent, vueComp: VueComp): void

    // 插入组件
    insertComp(comp: Component): boolean

    // 选中组件
    selectComp(id: string): Component

    // 更新组件
    updateComp(id: string, data: Partial<Omit<Component, 'id'>>): boolean

    // 移除组件
    removeComp(id: string): boolean

    // 交换组件
    exchangeComp(id1: string, id2: string): boolean
}
