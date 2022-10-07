interface DivideContainerNode {
    id: string
    ratio: number // 占比: children[0] : children[1]
    children: [DivideNode, DivideNode]

    getLayout(): VNode
}