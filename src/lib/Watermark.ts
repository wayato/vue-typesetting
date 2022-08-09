import Vue from 'vue'

export default Vue.component('typesetting-watermark', {
    props: {
        src: {
            type: String,
            default: ''
        }
    },
    render(h) {
        return h('img', {
            domProps: {
                src: this.src
            }
        })
    }
})