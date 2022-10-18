interface FloatLeafNode {
    id: string
    compId: string
    left: number | string
    top: number | string
    width: number | string
    height: number | string
    zIndex: number

    getLayout(): VNode
}