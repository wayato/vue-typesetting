import type { VueConstructor, VNode } from 'vue'
import Vue from 'vue'
import { Page } from './Page'

export enum BlockType {
    Extru, // 挤压
    Float // 悬浮
}

export interface Entity extends Vue {
    show: boolean
}

export class Block {
    private entity: Entity

    // 寄宿的page实例
    private page: Page

    constructor(id: string, type: BlockType, vue: Vue, page: Page) {
        this.page = page
        this.createBlock(id, type, vue)
    }

    private createBlock(id: string, type: BlockType, vue: Vue) {
        console.log(type)
        const _this = this
        const ComponentCtr: VueConstructor = Vue.extend({
            data() {
                return {
                    show: false
                }
            },
            render(h): VNode {
                const maskStyle = {
                    position: 'absolute',
                    background: '#000',
                    opacity: 0.3
                }
                return h('div', {
                    attrs: {
                        draggable: this.show
                    },
                    style: {
                        position: 'absolute',
                    }
                }, [
                    h(vue.$options.components[id]),
                    h('div', {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            boxSizing: 'border-box',
                            border: '2px solid red',
                            opacity: this.show ? 1 : 0
                        },
                        on: {
                            click: (e: Event) => {
                                if (window.event) { 
                                    // ie 和 谷歌支持阻止冒泡
                                    window.event.cancelBubble = true; 
                                } else { 
                                    // 火狐和谷歌支持的阻止冒泡
                                    e.preventDefault(); 
                                } 
                                _this.page.selectBlock(_this)
                            }
                        }
                    }, [
                        h('div', {
                            style: {
                                ...maskStyle,
                                inset: '0 50% 0 0'
                            },
                        }),
                        h('div', {
                            style: {
                                ...maskStyle,
                                inset: '0 0 0 50%'
                            }
                        }),
                        h('div', {
                            style: {
                                ...maskStyle,
                                inset: '0 0 50% 0'
                            }
                        }),
                        h('div', {
                            style: {
                                ...maskStyle,
                                inset: '50% 0 0 0'
                            }
                        })
                    ])
                ])
            }
        })
        this.entity = new ComponentCtr()
        this.page.insertDomTree(this.entity.$mount().$el)
        this.page.selectBlock(this)
    }

    public setShow(show: boolean) {
        console.log('setShow', show)
        this.entity.show = show
    }
}