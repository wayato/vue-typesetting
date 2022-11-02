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
    
    destroy(): void {
        console.log('销毁组件')
    }
}