interface DivideContainerNode extends Layout<DivideContainerNodeProps> {
    id: string
    ratio: Reactive<number> // 占比: children[0] : children[1]
    direction: Reactive<Direction>

    children: Reactive<[DivideNode, DivideNode]>

    init(node1: DivideNode, node2: DivideNode, direction: Direction): void
    update(id: string, node: DivideNode): boolean
}

type DivideContainerNodeProps = {
    fatherNode: Page | DivideContainerNode
    flex: number
}