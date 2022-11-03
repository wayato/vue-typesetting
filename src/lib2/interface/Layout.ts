interface Layout<T> {
    getLayout(props?: { fatherNode: T }): VNode
}