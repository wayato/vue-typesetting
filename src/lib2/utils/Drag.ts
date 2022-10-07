import MyVue from "./MyVue"

export default class Drag {
    // // typesetting的宿主元素，需要判断是否移出这个范围
    // public static hostEl: HTMLElement

    // // 存储当次拖拽携带的数据
    // public static dragData: any

    // // 当前产生的拖拽实例
    // public static dragVueInstance: any

    // // 结束时执行的回调
    // public static callback: Function

    // static data: any
    static hostDom: HTMLElement
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
        Drag.hostDom.style['pointer-events'] = 'none'
        document.body.append(Drag.hostDom)

        Drag.left.value = e.x
        Drag.top.value = e.y
        Drag.isShow.value = true
        MyVue.render(this.getLayout, Drag.hostDom)
        // if (!this.dragVueInstance) {
        //     this.dragVueInstance = new (Vue.extend(DragImgComponent))()
        //     document.body.append(this.dragVueInstance.$mount().$el)
        // }
        // this.dragVueInstance.left = left
        // this.dragVueInstance.top = top

        document.addEventListener('mousemove', Drag.move)
        document.addEventListener('mouseup', Drag.up)
    }

    static move(e: MouseEvent) {
        // console.log(e)
        Drag.left.value = e.x
        Drag.top.value = e.y
        // console.log(Drag.data)
        // console.log(Drag.vue.reactive)
        // if (Drag.dragVueInstance) {
        //     Drag.dragVueInstance.left = e.x
        //     Drag.dragVueInstance.top = e.y
        //     if (!Drag.dragData.key) return
        //     const { left, top, height, width } = Drag.hostEl.getBoundingClientRect()
        //     if (e.x < left || e.y < top || e.x > left + width || e.y > height + top) {
        //         Drag.dragVueInstance.showDelete = true
        //     } else {
        //         Drag.dragVueInstance.showDelete = false
        //     }
        // }
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
        // this.dragData = null
        // if (this.callback) {
        //     this.callback()
        //     this.callback = null
        // }
        // if (this.dragVueInstance) {
        //     this.dragVueInstance.destroyGragImg()
        //     this.dragVueInstance = null
        // }
    }

    static getLayout(): VNode {
        return MyVue.h('div', {
            style: {
                width: '100px',
                height: '40px',
                border: `2px dashed teal`,
                background: 'rgba(255, 255, 255, 0.6)',
                position: 'fixed',
                zIndex: 100,
                left: Drag.left.value + 'px',
                top: Drag.top.value + 'px',
                pointerEvents: 'none',
                display: Drag.isShow.value ? 'block' : 'none'
            }
        }, '')
    }
}
