import MyVue from "./MyVue"

export default class Drag {
    static hostDom: HTMLElement
    static vueComp: VueComp
    static isShow: Reactive<boolean>
    static left: Reactive<number>
    static top: Reactive<number>

    static init(): void {
        Drag.isShow = MyVue.reactive<boolean>(false)
        Drag.left = MyVue.reactive<number>(0)
        Drag.top = MyVue.reactive<number>(0)
    }

    static show(e: MouseEvent): void {
        if (Drag.isShow.value) return
        Drag.hostDom = document.createElement('div')
        Drag.hostDom.style.position = 'fixed'
        Drag.hostDom.style.pointerEvents = 'none'
        document.body.append(Drag.hostDom)

        Drag.left.value = e.x
        Drag.top.value = e.y
        Drag.isShow.value = true
        MyVue.render(this.getLayout, Drag.hostDom)

        document.addEventListener('mousemove', Drag.move)
        document.addEventListener('mouseup', Drag.up)
    }

    static move(e: MouseEvent) {
        Drag.left.value = e.x
        Drag.top.value = e.y
    }

    static up() {
        Drag.hide()
        document.removeEventListener('mousemove', Drag.move)
        document.removeEventListener('mouseup', Drag.up)
    }

    static hide() {
        Drag.isShow.value = false
        if (Drag.hostDom) {
            document.body.removeChild(Drag.hostDom)
        } else {
            Drag.hostDom = null
        }
    }

    static setComp(vueComp: VueComp) {
        Drag.vueComp = vueComp
    }

    static getComp(): VueComp {
        // 只提供一次获取
        const vueComp: VueComp = Drag.vueComp
        Drag.vueComp = null
        return vueComp
    }

    static getLayout(): VNode {
        return MyVue.h('div', {
            class: 'vue-typesetting__drag',
            style: {
                left: Drag.left.value + 'px',
                top: Drag.top.value + 'px',
                display: Drag.isShow.value ? 'block' : 'none'
            }
        }, '')
    }
}
