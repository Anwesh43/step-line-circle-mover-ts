const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#BDBDBD"
const fontFactor : number = 18
const foreColor : string = "#3F51B5"
const scGap : number = 0

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    count : number = 0
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h) // x -> 0, y -> 0, width - w, height - h
        this.context.fillStyle = foreColor
        const text : string = `hello world ${this.count}`
        const tw : number = this.context.measureText(text).width
        const fontSize = Math.min(w, h) / fontFactor
        this.context.font = this.context.font.replace(/\d+/g, `${fontSize}`)
        this.context.fillText(text, w / 2 - tw / 2, h / 2 - fontSize / 2)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.count++
            this.render()
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
