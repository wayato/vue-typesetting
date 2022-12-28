import Vue, { PropType } from 'vue'
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
        },
        pageInfo: {
            type: Object as PropType<PageInfo>
        },
        scale: {
            type: Number
        }
    },
    render(h) {
        return h('div', {
            class: {
                'vue-typesetting__header-footer': true
            },
            style: {
                display: /^0/.test(this.height) ? 'none' : 'flex',
                border: `${1.5 / this.scale}px dashed #E6E6FF`,
                height: typeof this.height === 'number' ? this.height + 'px' : this.height,
                borderColor: (this.global.preview || this.disabled) ? 'transparent' : '#E6E6FF',
                transition: 'borderColor .3s'
            }
        }, new Array(3).fill(null).map((_, index: number) => {
            return h('div', {
                class: {
                    'vue-typesetting__header-footer--content': !this.disabled
                },
                style: {
                    flex: 1,
                    width: 0,
                    position: 'relative',
                    borderRight: `${1.5 / this.scale}px dashed #E6E6FF`,
                    borderColor: (this.global.preview || this.disabled) ? 'transparent' : '#E6E6FF',
                    transition: 'borderColor .3s'
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
                    props: {
                        ...this.config[index],
                        page: this.pageInfo.page,
                        total: this.pageInfo.total
                    },
                    style: {
                        height: '100%'
                    }
                }),
                // 选中线框
                h('div', {
                    style: {
                        position: 'absolute',
                        right: `${-1.5 / this.scale}px`,
                        left: `${-1.5 / this.scale}px`,
                        top: `${-1.5 / this.scale}px`,
                        bottom: `${-1.5 / this.scale}px`,
                        border: `${Line.getWeight(this.scale)}px solid ${Line.color}`,
                        opacity: this.global.currentKey === `${this.type}-${index}` ? 1 : 0,
                        zIndex: 0
                    }
                })
            ])
        }))
    }
})