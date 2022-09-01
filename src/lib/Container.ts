import Vue, { PropType } from 'vue'
import Leaf from './Leaf'
import Line from './Line'
import Utils from './Utils'

const Container = Vue.component('typesetting-container', {
    props: {
        changeKey: {
            type: Function
        },
        updateData: {
            type: Function
        },
        dataAST: {
            type: Object as PropType<ContianerAst>
        },
        flex: {
            type: Number,
            default: 1
        },
        global: {
            type: Object
        },
        scale: {
            type: Number
        }
    },
    data() {
        return {
            rect: {}, // TODO
            dragLineShow: false, // 是否显示跟随线
            isDraging: false, // 是否正在拖拽
            dragLineProportion: 0.5 // 跟随线显示的位置比例
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (this.$el) this.rect = this.$el.getBoundingClientRect()
        })
    },
    methods: {
        lineMousemove(e: MouseEvent) {
            if (!this.isDraging) return
            if (this.dataAST.dir === 1) {
                this.dragLineProportion = Number(((e.clientX - this.rect.left) / this.rect.width).toFixed(2))
            } else {
                this.dragLineProportion = Number(((e.clientY - this.rect.top) / this.rect.height).toFixed(2))
            }
            if (this.dragLineProportion > 1) this.dragLineProportion = 1
            if (this.dragLineProportion < 0) this.dragLineProportion = 0
            this.dragLineShow = true
        },
        lineMouseup(e: MouseEvent) {
            if (!this.isDraging || !this.dragLineShow) return
            this.dragLineShow = false
            this.isDraging = false
            this.updateData(this.dataAST.key, {
                ...this.dataAST,
                p: this.dragLineProportion
            })
            document.removeEventListener('mousemove', this.lineMousemove)
            document.removeEventListener('mouseup', this.lineMouseup)
            document.body.style.cursor = 'auto'
        }
    },
    render(h) {
        const getLine = (direction: 1 | 2, proportion: number) => {
            if (direction === 2) {
                return {
                    left: 0,
                    right: 0,
                    height: `${4 / this.scale}px`,
                    top: `calc(${proportion} * 100% - ${2 / this.scale}px`
                }
            } else {
                return {
                    top: 0,
                    bottom: 0,
                    width: `${4 / this.scale}px`,
                    left: `calc(${proportion} * 100% - ${2 / this.scale}px)`
                }
            }
        }
        if (!this.dataAST?.children) return
        return h('div', {
            class: {
                'vue-typesetting__container': true
            },
            style: {
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                flex: this.flex,
                flexDirection: this.dataAST.dir === 1 ? 'row' : 'column'
            },
            on: {
                drop: Utils.stopBubble,
            }
        }, [
            this.dataAST.children.map((childAst: ContianerAst | LeafAst, index: number) => {
                const params = {
                    props: {
                        dataAST: childAst,
                        flex: index === 0 ? this.dataAST.p : (1 - this.dataAST.p),
                        updateData: this.updateData,
                        changeKey: this.changeKey,
                        global: this.global,
                        scale: this.scale
                    },
                    key: childAst.key,
                }
                if ('comp' in childAst) {
                    return h(Leaf, params)
                } else {
                    return h(Container, params)
                }
            }),
            // 跟随线
            h('div', {
                style: {
                    position: 'absolute',
                    background: Line.color,
                    opacity: this.dragLineShow ? 0.5 : 0,
                    ...getLine(this.dataAST.dir, this.dragLineProportion)
                }
            }),
            // 分割线
            h('div', {
                attrs: {
                    draggable: false
                },
                class: {
                    'vue-typesetting__container--line': true
                },
                style: {
                    position: 'absolute',
                    background: Line.color,
                    zIndex: 11,
                    cursor: this.dataAST.dir == 1 ? 'col-resize' : 'row-resize',
                    ...getLine(this.dataAST.dir, this.dataAST.p)
                },
                on: {
                    mousedown: (e: MouseEvent) => {
                        Utils.stopBubble(e)
                        this.isDraging = true
                        this.rect = this.$el.getBoundingClientRect()
                        document.addEventListener('mousemove', this.lineMousemove)
                        document.addEventListener('mouseup', this.lineMouseup)
                        document.body.style.cursor = this.dataAST.dir == 1 ? 'col-resize' : 'row-resize'
                    },
                    mouseup: (e: MouseEvent) => {
                        this.isDraging = false
                    },
                    click: Utils.stopBubble
                },
            })
        ])
    }
})

export default Container