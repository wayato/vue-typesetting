export default class Line {
    public static color: string = 'rgba(77, 77, 238, 1)'
    public static weight: number = 2

    // 根据缩放调整border的宽度，最小不超过本身
    public static getWeight(scale: number): number {
        let result: number = Math.ceil(this.weight / scale)
        if (result < this.weight) result = this.weight
        return result
    }
}