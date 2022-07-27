import Vue from 'vue'
import Global from './Global'
import Line from './Line'

export default Vue.component('typesetting-header-footer', {
    props: {
        type: {
            type: String,
            default: 'header'
        },
        height: {
            type: [Number, String],
            default: 0
        },
        changeKey: {
            type: Function
        },
        config: {
            type: Object
        }
    },
    render(h) {
        return h('div', {
            style: {
                display: this.height === 0 ? 'none' : 'flex',
                border: '1px dashed #E6E6FF',
                borderRight: 0,
                height: typeof this.height === 'number' ? this.height + 'px' : this.height
            }
        }, new Array(3).fill(null).map((_, index: number) => {
            return h('div', {
                class: {
                    'vue-typesetting__header-footer': true
                },
                style: {
                    flex: 1,
                    position: 'relative',
                    borderRight: '1px dashed #E6E6FF'
                },
                on: {
                    click: () => {
                        this.changeKey({
                            key: `${this.type}-${index}`,
                            props: {
                                ...this.config
                            }
                        })
                    }
                }
            }, [
                h(Global.getComponent(this.type)),
                // 选中线框
                h('div', {
                    style: {
                        position: 'absolute',
                        inset: 0,
                        border: `2px solid ${Line.color}`,
                        opacity: Global.state.currentKey === `${this.type}-${index}` ? 1 : 0,
                        zIndex: 0
                    }
                })
            ])
        }))
    }
})