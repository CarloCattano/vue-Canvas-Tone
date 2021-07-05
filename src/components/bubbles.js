
export class Bubbles  {
    constructor(x ,y ,ctx,w,h,s){
        this.fadeout = 0.2
        this.ctx = ctx
        this.x = x
        this.size = 15
        this.y = y
        this.accel = 1.3
        this.speed = s 
        this.w = w ,this.h = h
        this.velx = this.speed 
        this.vely =  this.speed
        
    }
    move(source=null,ran = 0,panner){
        this.source = source
        let vol = -12
        let force = this.speed * this.accel
        if(this.accel > 0){
            this.accel /= 1.0024
        }
        if(this.accel > 3){
            this.accel = 3
        }
        if(this.speed > 0.01)
        if(this.x >= this.w-10){
            this.velx = -force + Math.random()*ran
            this.accel *=  1.15
            this.source.volume.linearRampToValueAtTime(vol,0.08)
            this.source.volume.setTargetAtTime(-100,0.5,0.5)
        }else if(this.x <= 10){
            this.velx = force + Math.random()*ran
            this.source.volume.linearRampToValueAtTime(vol,0.08)
            this.source.volume.setTargetAtTime(-100,0.5,0.5)
            this.accel *=  1.15
        }
        if(this.y >= this.h-20){
            this.source.volume.linearRampToValueAtTime(vol,0.08)
            this.source.volume.setTargetAtTime(-100,0.5,0.5)
            this.vely = -force + Math.random()*ran
            this.accel *=  1.13
        }
        else if(this.y <= 10){
            this.source.volume.linearRampToValueAtTime(vol,0.08)
            this.vely = force + Math.random()*ran
            this.source.volume.setTargetAtTime(-100,0.5,0.5)
            this.accel *= 1.3   
        }
        this.x += this.velx
        this.y += this.vely
        this.pan = (((this.x/this.w)*2)-1).toFixed(2)
        panner.pan.linearRampToValueAtTime(this.pan,0.1)
        
    }
    show ( ){
        this.ctx.beginPath();
        this.ctx.fillStyle = "black"
        this.ctx.arc( this.x,  this.y,this.size/(this.accel+1.1),0,2* Math.PI);
        this.ctx.fill()
        this.ctx.strokeStyle = "white"
        this.ctx.stroke();
    }
    play(){
        let notes = [0,1200,-1200,0,1200,0,1200]

        if(this.x >= this.w-10){
            if(this.y >= this.h/2){
                this.source.detune.linearRampToValueAtTime(notes[0],0.05)
                
            }else if(this.y <= this.h/2){
                this.source.detune.linearRampToValueAtTime(notes[1],0.05)
            }
        }else if(this.x <= 10){
            if(this.y >= this.h/2){
                this.source.detune.linearRampToValueAtTime(notes[2],0.05)
            }else if(this.y <= this.h/2){
                this.source.detune.linearRampToValueAtTime(notes[3],0.05)
            }
        }
        if(this.y >= this.h-20){
            if(this.x >= this.w/2){
                this.source.detune.linearRampToValueAtTime(notes[4],0.05)
            }else if(this.x <= this.w/2){
                this.source.detune.linearRampToValueAtTime(notes[5],0.05)
            }
        }
        else if(this.y <= 10){
            if(this.x <= this.w/2){
                this.source.detune.linearRampToValueAtTime(0,0.05)
            }else if(this.x >= this.w/2){
                this.source.detune.linearRampToValueAtTime(1200,0.05)
            }
        }
    }
}
