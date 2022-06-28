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
                return new Leaf(childAst).render(h, {
                    props: this.vue.$props,
                    on: this.vue.$listeners,
                    key: childAst.key
                })
            } else {
                return new Container(childAst).render(h, {
                    props: this.vue.$props,
                    on: this.vue.$listeners,
                    key: childAst.key
                })
            }
        })) // concat(new DragLine())
    }
}