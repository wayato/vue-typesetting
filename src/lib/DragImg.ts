import Vue from 'vue'
import Line from './Line'


const DragImgComponent = Vue.component('typesetting-drag-img', {
    data() {
        return {
            left: 0,
            top: 0,
            show: false
        }
    },
    computed: {
        position() {
            return this.left + '' + this.top
        }
    },
    methods: {
        // 销毁
        destroyGragImg() {
            this.$el.parentNode?.removeChild(this.$el)
            this.$destroy()
        }
    },
    watch: {
        position(newValue, oldValue) {
            if (newValue != oldValue && oldValue != '00') {
                this.show = true
            }
        }
    },
    render(h) {
        return h('div', {
            style: {
                width: '100px',
                height: '40px',
                border: `2px dashed ${Line.color}`,
                background: '#FFF',
                position: 'fixed',
                opacity: 0.6,
                zIndex: 100,
                left: this.left + 'px',
                top: this.top + 'px',
                pointerEvents: 'none',
                display: this.show ? 'block' : 'none'
            }
        })
    }
})

export default class DragImg {
    // 存储当次拖拽携带的数据
    public static dragData: any

    // 当前产生的拖拽实例
    public static dragVueInstance: any

    // 结束时执行的回调
    public static callback: Function

    public static show(left: number, top: number, dragData: any, callback: Function) {
        this.dragData = dragData
        this.callback = callback
        if (!this.dragVueInstance) {
            this.dragVueInstance = new (Vue.extend(DragImgComponent))()
            document.body.append(this.dragVueInstance.$mount().$el)
        }
        this.dragVueInstance.left = left
        this.dragVueInstance.top = top

        document.addEventListener('mousemove', this.move)
        document.addEventListener('mouseup', this.up)
    }
    public static move(e: MouseEvent) {
        if (DragImg.dragVueInstance) {
            DragImg.dragVueInstance.left = e.x
            DragImg.dragVueInstance.top = e.y
        }
    }
    public static up() {
        DragImg.hide()
        document.removeEventListener('mousemove', DragImg.move)
        document.removeEventListener('mouseup', DragImg.up)
    }
    public static hide() {
        this.dragData = null
        if (this.callback) {
            this.callback()
            this.callback = null
        }
        if (this.dragVueInstance) {
            this.dragVueInstance.destroyGragImg()
            this.dragVueInstance = null
        }
    }
}