import { Block, BlockType } from './Block'
import Utils from './Utils'
import Vue from 'vue'

export class Page  {
    // 宿主dom节点
    private $el: HTMLElement

    // 宿主节点处于的vue实例，需要获取该实例中已注册的组件
    private vueEntity: Vue

    // block存储仓库
    private blocksDepo: Map<string, Block> = new Map()

    // 当前选中的block
    private currentBlock: Block | null = null
    
    constructor(el: HTMLElement, vueEntity: Vue) {
        this.$el = el
        this.$el.style.position = 'relative' // 保证是相对定位
        this.vueEntity = vueEntity
        this.setTargetListener()
    }

    // 设置寄宿的元素的监听事件
    private setTargetListener() {
        this.$el.addEventListener('dragover', (e: DragEvent) => e.preventDefault())
        this.$el.addEventListener('drop', (e: DragEvent) => {
            console.log('page drop')
            this.drop(e)
        })
        this.$el.addEventListener('click', () => this.blankClick())
    }

    // 组件drop事件
    private drop(e: DragEvent) {
        const config: string = e.dataTransfer.getData('config')
        if (config !== '') {
            const {id, type}: {id: string, type: BlockType} = JSON.parse(config)
            if (this.blocksDepo.has(id)) return // 重复组件不再新建
            // 创建block实例
            const block = new Block()
            this.$el.append(block.createElement(
                this.vueEntity.$options.components[id], 
                (e) => this.selectBlock(block), 
                (e: DragEvent) => {
                    Utils.stopBubble(e)
                    console.log('block', id, 'drop')
                    this.drop(e)
                }
            ))
            this.selectBlock(block) // 选中新创建的block
            this.blocksDepo.set(id, block) // 存入仓库
            
        }
    }

    // page空白部分点击事件
    private blankClick() {
        if (this.currentBlock !== null) {
            this.currentBlock.setSelected(false)
        }
        this.currentBlock = null
    }

    // 选中block
    private selectBlock(block: Block) {
        block.setSelected(true) // 聚焦选中的block
        this.currentBlock = block
        
    }

    public remove() {
        console.log('改变了')
        console.log(this.$el)
    }
}