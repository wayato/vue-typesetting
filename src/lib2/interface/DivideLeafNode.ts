interface DivideLeafNode extends Layout<Page | DivideContainerNode> {
    id: string
    compId: string

    init(vueComp: VueComp): void
}