interface Component {
    id: string
    vueComp: VueComp
    props?: any
    style?: any
    extra?: any

    destroy(): void
}