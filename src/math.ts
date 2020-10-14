type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' |  'unshift'
type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
  Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
  & {
    readonly length: L 
    [ I : number ] : T
    [Symbol.iterator]: () => IterableIterator<T>   
  }
  

export class vec2 {
    arr : FixedLengthArray<number,2>
    
    constructor(x:number,y:number){
        this.arr =  [x,y]
    }    
    get x() : number{
        return this.arr[0]
    }
    set x(x:number){
        this.arr[0] = x
    }
    get y() : number{
        return this.arr[1]
    }
    set y(y:number){
        this.arr[1] = y
    }

    add(v:vec2) : vec2{
      return new vec2(this.x + v.x, this.y + v.y)  
    }
    sub(v:vec2) : vec2{
      return new vec2(this.x - v.x, this.y - v.y) 
    }
    length():number{
        return Math.hypot(...this.arr)
    }
    normalized() : vec2{
        const length = this.length()
        return new vec2(this.y/length,this.y/length)
    }
    normalize() : vec2{
        const length = this.length()
        this.x /= length
        this.y /= length
        return this
    }
    scalar_mul(vec:vec2):number{
        return this.x * vec.x + this.y * vec.y
    }
    mul(scalar: number):vec2{
        return new vec2(this.x*scalar,this.y*scalar)
    }
    toString(){
        return `(${this.x},${this.y})`
    }
}
