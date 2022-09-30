interface TypesettingImpl {
    /**
     * 插入组件
     * @param comp 
     * @param position 
     */
    insertComp(comp: Component, position?: ExtruPosition | FloatPosition): boolean

    /**
     * 选择组件
     * @param id 
     */
    selectComp(id: string): ComponentInfo

    /**
     * 更新属性
     * @param id
     * @param attr 
     * @param data 
     */
    updateAttr <T extends keyof ComponentInfoBeChange> (id: string, attr: T, data: ComponentInfoBeChange[T]): boolean
}
