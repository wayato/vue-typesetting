interface ComponentDesp {
    components: {
        [id: string]: Component
    }

    add(vueComp: VueComp): string
    delete(id: string): boolean
    update(id: string): boolean
    find(id: string): Component
}