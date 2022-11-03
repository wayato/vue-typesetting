import Dispatch from '../utils/Dispatch';
import MyVue from '../utils/MyVue';
import Utils from '../utils/Utils'
import Component from './ComponentImpl'

class ComponentDespImpl implements ComponentDesp {
    currentId: Reactive<string>
    components: Reactive<{ 
        [id: string]: Reactive<Component>
    }>

    init(): void {
        this.currentId = MyVue.reactive<string>('')
        this.components = MyVue.reactive<{ 
            [id: string]: Reactive<Component>
        }>({})
    }
    select(id: string): void {
        this.currentId.value = id
        Dispatch.emit('select', id)
    }
    add(vueComp: VueComp): string {
        const component = new Component()
        component.vueComp = vueComp
        Reflect.set(this.components, component.id, MyVue.reactive<Component>(component))
        return component.id
    }
    delete(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    update(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    find(id: string): Component {
        return Reflect.get(this.components, id)
    }
    clear(): void {
        if (typeof this.components === 'object') {
            for (const id in this.components) {
                this.components[id].destroy()
                Reflect.deleteProperty(this.components, id)
            }
        }
        this.init()
    }
}

export default new ComponentDespImpl()