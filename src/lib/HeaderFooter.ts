import Vue from 'vue'
import Line from './Line'

export default Vue.component('typesetting-header-footer', {
    props: {
        type: {
            type: String,
            default: 'header'
        },
        // 渲染页眉页脚的组件名称
        comp: {
            type: String
        },
        // 是否禁用操作
        disabled: {
            type: Boolean,
            default: false
        },
        height: {
            type: [Number, String],
            default: 0
        },
        changeKey: {
            type: Function
        },
        config: {
            type: Array
        },
        global: {
            type: Object
        }
    },
    render(h) {
        return h('div', {
            class: {
                'vue-typesetting__header-footer-wrap': true
            },
            style: {
                display: this.height === 0 ? 'none' : 'flex',
                border: '1px dashed #E6E6FF',
                borderRight: 0,
                height: typeof this.height === 'number' ? this.height + 'px' : this.height
            }
        }, new Array(3).fill(null).map((_, index: number) => {
            return h('div', {
                class: {
                    'vue-typesetting__header-footer': !this.disabled
                },
                style: {
                    flex: 1,
                    position: 'relative',
                    borderRight: '1px dashed #E6E6FF'
                },
                on: {
                    click: () => {
                        if (this.disabled) return
                        this.changeKey({
                            key: `${this.type}-${index}`,
                            props: {
                                ...this.config[index]
                            }
                        })
                    }
                }
            }, [
                h(this.global.hostVue.$options.components[this.comp] || 'div', {
                    style: {
                        height: '100%'
                    }
                }),
                // 选中线框
                h('div', {
                    style: {
                        position: 'absolute',
                        inset: 0,
                        border: `2px solid ${Line.color}`,
                        opacity: this.global.currentKey === `${this.type}-${index}` ? 1 : 0,
                        zIndex: 0
                    }
                })
            ])
        }))
    }
})