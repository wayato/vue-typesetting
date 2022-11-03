interface DivideLeafNode extends Layout<DivideLeafNodeProps> {
    id: string
    compId: string

    init(vueComp: VueComp): void
}

type DivideLeafNodeProps = {
    fatherNode: Page | DivideContainerNode
    flex: number
}