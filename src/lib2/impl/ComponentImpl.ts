import MyVue from "../utils/MyVue";
import Utils from "../utils/Utils";

export default class ComponentImpl implements Component {
    id: string
    vueComp: VueComp;
    props?: any;
    style?: any;
    extra?: any;

    constructor() {
        this.id = Utils.getUUID()
        this.props = {}
        this.style = {}
    }

    update(data: Partial<Omit<Component, "id" | "vueComp">>): void {
        for (const key in data) {
            Reflect.set(this, key, Reflect.get(data, key))
        }
    }
    
    destroy(): void {
        console.log('销毁组件')
    }
}