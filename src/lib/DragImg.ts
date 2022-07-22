import Vue from 'vue'
import Global from './Global'


const DragImgComponent = Vue.component('typesetting-drag-img', {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        left: {
            type: Number,
            default: 100
        },
        top: {
            type: Number,
            default: 40
        }
    },
    render(h) {
        return h('div', {
            style: {
                width: '100px',
                height: '40px',
                border: '1px solid red',
                position: 'fixed',
                zIndex: 100,
                left: this.left + 'px',
                top: this.top + 'px',
                display: this.show ? 'block' : 'none',
                pointerEvents: 'none'
            }
        }, Global.state.isInner)
    }
})

export default class DragImg {
    public static state = Vue.observable({
        show: false,
        left: 0,
        top: 0
    })
    public static show(left: number, top: number) {
        this.state.left = left
        this.state.top = top
        this.state.show = true
    }
    public static hide() {
        this.state.show = false
    }
    static {
        const component = Vue.extend({
            render: (h) => {
                return h(DragImgComponent, {
                    props: {
                        left: this.state.left,
                        top: this.state.top,
                        show: this.state.show
                    }
                })
            }
        })
        document.body.append(new component().$mount().$el)
    }
}