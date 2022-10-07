import Utils from '../utils/Utils'
import Component from './ComponentImpl'

export default class ComponentDespImpl implements ComponentDesp {
    components: { [id: string]: Component; };
    add(vueComp: VueComp): string {
        const component = new Component()
        component.id = Utils.getUUID()
        component.vueComp = vueComp
        Reflect.set(this.components, component.id, component)
        return component.id
    }
    delete(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    update(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    find(id: string): Component {
        throw new Error("Method not implemented.");
    }

}