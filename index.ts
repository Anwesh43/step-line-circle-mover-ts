const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#BDBDBD"
const fontFactor : number = 18
const foreColor : string = "#3F51B5"
const delay : number = 25
const lines : number = 5
const scGap : number = 0.02 / lines
const rFactor : number = 5
const lineCap = 'round'
const strokeFactor = 90
const nodes : number = 5

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
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
        const sfi : number  = ScaleUtil.divideScale(sf, i, lines)
        if (sfi == 0) {
            return
        }
        const sfi1 : number = ScaleUtil.divideScale(sfi, 0, 2)
        const sfi2 : number = ScaleUtil.divideScale(sfi, 1, 2)
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
        const j : number = Math.floor(ScaleUtil.sinify(scale) / scDiv)
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

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h) // x -> 0, y -> 0, width - w, height - h
        //DrawingUtil.drawSLCNode(this.context, 0, this.state.scale)
    }

    handleTap() {
        this.canvas.onmousedown = () => {


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

class SLCNode {

    state : State = new State()
    prev : SLCNode
    next : SLCNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SLCNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawSLCNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SLCNode {
        var curr : SLCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class StepLineCircle {

    root : SLCNode = new SLCNode(0)
    curr : SLCNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

  slc : StepLineCircle = new StepLineCircle()
  animator : Animator = new Animator()

  render(context : CanvasRenderingContext2D) {
      this.slc.draw(context)
  }

  handleTap(cb : Function) {
      this.slc.startUpdating(() => {
          this.animator.start(() => {
              this.slc.update(() => {
                  this.animator.stop()
                  cb()
              })
              cb()
          })
      })
  }

}
