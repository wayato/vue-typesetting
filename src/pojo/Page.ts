import { Block, BlockType } from './Block'
import Vue from 'vue'

export class Page  {
    // 页面寄宿的元素dom
    private $el: HTMLElement

    // 当前处于的vue实例
    private entity: Vue

    // 存储当前页面上的所有block
    private blocks: Map<string, Block> = new Map()

    // 当前选中的block
    private currentBlock: Block | null = null
    
    constructor(el: HTMLElement, entity: Vue) {
        this.$el = el
        this.$el.style.position = 'relative' // 保证是相对定位
        this.entity = entity
        this.setTargetListener()
    }

    // 设置寄宿的元素的监听事件
    private setTargetListener() {
        this.$el.addEventListener('dragover', e => e.preventDefault())
        this.$el.addEventListener('drop', e => this.insertBlock(e))
        this.$el.addEventListener('click', () => this.blankClick())
    }

    // 插入block
    private insertBlock(e: DragEvent) {
        const {id, type}: {id: string, type: BlockType} = JSON.parse(e.dataTransfer.getData('config'))
        if (this.blocks.has(id)) return // 重复组件不再新建
        this.currentBlock = new Block(id, type, this.entity, this) // 创建block实例
        this.blocks.set(id, this.currentBlock) // 存入仓库
    }

    // 插入dom树
    public insertDomTree(el: Element) {
        this.$el.append(el)
    }

    // page空白部分点击事件
    private blankClick() {
        if (this.currentBlock !== null) {
            this.currentBlock.setShow(false)
        }
        this.currentBlock = null
    }

    // 选中page上的block
    public selectBlock(block: Block) {
        console.log('setBlock')
        this.currentBlock = block
        this.currentBlock.setShow(true)
    }

    public remove() {
        console.log('改变了')
        console.log(this.$el)
    }
}