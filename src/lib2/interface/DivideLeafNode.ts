interface DivideLeafNode {
    id: string
    compId: string

    init(vueComp: VueComp): void
    getLayout(): VNode
}