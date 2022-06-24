import PNode from "./PNode"
import DragLine from "./Line"
import Leaf from "./Leaf"
import type { CreateElement } from "vue/types/vue"


/**
 * 容器
 */
export default class Container extends PNode<PNodeAST> {
    protected layout(h: CreateElement) {
        return h('div', {
            style: {
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%',
                // flex: this.flex,
                flex: 1,
                flexDirection: this.dataAST.direction
            }
        }, this.dataAST.children.map((childAst: PNodeAST) => {
            if (childAst.component) {
                return h(new Leaf(childAst).create(), {
                    on: {
                        updateData: (...arg: any[]) => {
                            this.vue.$emit('updateData', ...arg)
                        }
                    }
                })
            } else {
                return h(new Container(childAst).create(), {
                    on: {
                        updateData: (...arg: any[]) => {
                            this.vue.$emit('updateData', ...arg)
                        }
                    }
                })
            }
        })) // concat(new DragLine())
    }
}