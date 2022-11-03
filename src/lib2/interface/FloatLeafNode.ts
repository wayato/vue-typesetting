interface FloatLeafNode extends Layout<FloatLeafNodeProps> {
    id: string
    compId: string
    left: number | string
    top: number | string
    width: number | string
    height: number | string
    zIndex: number
}

type FloatLeafNodeProps = {
    fatherNode: Page
}