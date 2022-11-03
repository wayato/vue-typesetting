interface DivideLeafNode {
    id: string
    compId: string
    fatherNode: Page | DivideContainerNode

    init(fatherNode: Page | DivideContainerNode, vueComp: VueComp): void
    getLayout(): VNode
}