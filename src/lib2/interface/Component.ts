interface Component {
    id: string
    vueComp: VueComp
    props?: any
    style?: any
    extra?: any

    update(data: Partial<Omit<Component, 'id' | 'vueComp'>>): void
    destroy(): void
}