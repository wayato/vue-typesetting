interface Page {
    id: string
    children: Reactive<Array<AllNode>>

    add(comp: VueComp): string
    delete(id: string): boolean
    update(id: string, data: Omit<AllNode, 'id'>): boolean
    find(id: string): AllNode

    select(id: string): LeafNode
    getLayout(vue: Vue): VNode
}