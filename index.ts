const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#BDBDBD"
const fontFactor : number = 18
const foreColor : string = "#3F51B5"
const scGap : number = 0.02
const delay : number = 20
const lines : number = 5
const rFactor : number = 5
const lineCap = 'round'
const strokeFactor = 90
const nodes : number = 5

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, scale - i / n)
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number) {
        context.beginPath()
        context.arc(x, y, r, 0, 2 * Math.PI)
        context.fill()
    }

    static drawStepLineCircleMover(context : CanvasRenderingContext2D, i : number, w : number, scale : number, j : number) {
        const gap : number = w / lines
        const sf : number  = ScaleUtil.sinify(scale)
        const sfi : number  = ScaleUtil.divideScale(scale, i, lines)
        const sfi1 : number = ScaleUtil.divideScale(scale, 0, 2)
        const sfi2 : number = ScaleUtil.divideScale(scale, 1, 2)
        const lineX2 : number = gap * sfi1
        const r : number = gap / rFactor
        const circleX  : number = gap * sfi2 + r
        context.save()
        context.translate(i * gap, 0)
        DrawingUtil.drawLine(context, 0, 0, lineX2, 0)
        if (i == j) {
            DrawingUtil.drawCircle(context, circleX, 0, r)
        }
        context.restore()
    }

    static drawStepLineCircleMovers(context : CanvasRenderingContext2D, w : number, scale : number) {
        const scDiv : number = 1 / lines
        const j : number = ScaleUtil.sinify(scale) / scDiv
        for (var i = 0; i < lines; i++) {
            DrawingUtil.drawStepLineCircleMover(context, i, w, scale, j)
        }
    }

    static drawSLCNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const hGap = h / (nodes + 1)
        context.lineCap = lineCap
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        context.save()
        context.translate(0, hGap * (i + 1))
        DrawingUtil.drawStepLineCircleMovers(context, w, scale)
        context.restore()
    }
}


class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    state : State = new State()
    animator : Animator = new Animator()

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
        const fontSize = (Math.min(w, h) / fontFactor)
        this.context.font = this.context.font.replace(/\d+/g, `${fontSize}`)
        const text : string = `hello world`
        const tw : number = this.context.measureText(text).width
        const sf : number = ScaleUtil.sinify(this.state.scale)
        this.context.fillText(text, (w / 2  - tw / 2) * sf, h / 2 - fontSize / 2)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.state.startUpdating(() => {
                this.animator.start(() => {
                    this.state.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                    this.render()
                })
            })

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
        this.scale += scGap * this.dir  //---> scale - 1 0, prevScale  - 0, 1
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

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}
