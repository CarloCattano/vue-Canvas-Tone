<template>
  <div id="app">
    <button @click="mtoggle">{{num_draw_bub}}</button>
    <canvas width="100%" height="100%" @touchup="drag = false" @touchdown="drag = true"
                                       @mousedown="drag = true" @mouseup="drag = false" 
                                       @click="handleClick" @mousemove="moveit" @touchmove="t_move"></canvas>
    </div>
</template>
<script>
import { Convolver } from "tone";
import { Filter } from "tone"
import bottle from "../public/sampleIR.wav";
import { PingPongDelay } from "tone";
import {Oscillator} from "tone"
import {Panner } from "tone"
import { Bubbles } from './components/bubbles.js'

export default {
  name: 'App',
  data() {
    return {
      drag:     false,
      isLoaded: false,
      canvX : window.innerWidth,
      canvY:  window.innerHeight,
      bub:"",
      num_draw_bub:1,
      bubbles:[],
      oscillators:[],
      panners:[],
    }
  },

  created() {
    this.Convolver = new Convolver(bottle).toMaster();
    this.Convolver.wet.value = 0.3;
    this.pingPong = new PingPongDelay("16n", 0.2).connect(this.Convolver);
    this.filter = new Filter("1200","lowpass").connect(this.pingPong)
    this.filter.Q.value = 0.5
  },
  mounted() {
    this.direction = 1
    this.canvas = document.getElementsByTagName("canvas")[0]
    this.ctx = this.canvas.getContext("2d")
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.init();
    window.requestAnimationFrame(this.draw);
  },

  watch: {
    canvX: function(newS){
      this.canvas.width = newS
    },
    canvY: function(newS){
      this.canvas.height = newS
    },
  },
  computed: {
    getAngleX:function(){
      return  (this.spawnX + (Math.cos(this.rateUpdate)*30)).toFixed(2)
    },
    getAngleY:function(){
      return ( this.spawnY + (Math.sin(this.rateUpdate)*30)).toFixed(2)
    }
  },
  methods: {
    moveit:function(e){
      this.mX = (e.clientX / this.canvas.width)
      this.mY = (e.clientY / this.canvas.height)
      this.spawnY = e.layerY
      this.spawnX = e.layerX
      if(this.drag){
        if(this.bubbles.length > 0){
            this.bubbles.pop()
            this.oscillators[this.oscillators.length-1].stop()
            this.oscillators.pop()
        }
      }
    },
    init: function() {
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      window.requestAnimationFrame(this.draw);
    },
    draw: function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      for(var i=0;i<this.bubbles.length;i++){
        this.bubbles[i].show(16)
        this.bubbles[i].move(this.oscillators[i],0.0001,this.panners[i])
        this.bubbles[i].play()
      } 

      this.ctx.strokeStyle = "black"
      this.ctx.beginPath();       // Start a new path
      this.ctx.moveTo(this.canvas.width/2, 0);    // Move the pen to (30, 50)
      this.ctx.lineTo(this.canvas.width/2, this.canvas.height);  // Draw a line to (150, 100)
      this.ctx.stroke();
      this.ctx.beginPath();       // Start a new path
      this.ctx.moveTo(0, this.canvas.height/2);    // Move the pen to (30, 50)
      this.ctx.lineTo(this.canvas.width, this.canvas.height/2);  // Draw a line to (150, 100)
      this.ctx.stroke();      
 
      window.requestAnimationFrame(this.draw)
    },
    handleClick(e) {
      this.spawnX = e.clientX - e.target.offsetTop
      this.spawnY = e.clientY - e.target.offsetLeft
      if(this.bubbles.length < 18){
        for(var q = 0;q<this.num_draw_bub;q++){

          this.bubbles.push(new Bubbles(this.spawnX+(q*32),this.spawnY+(q*32),this.ctx,this.canvas.width,this.canvas.height,3))
          this.panners.push(new Panner(0.5).connect(this.filter))
          this.oscillators.push(new Oscillator({
            "frequency":(128*this.bubbles.length+1)  ,
            "type": "sawtooth10",//"sawtooth10",
            "volume": -12,
            "detune": Math.random() * 3,}).start().connect(this.panners[this.oscillators.length]))
        }
        this.num_draw_bub = 1
      }else if(this.bubbles.length >= 18 ){
          this.bubbles.shift()
          this.oscillators[this.oscillators.length-1].stop()
          this.panners.  shift()
          this.oscillators.shift()
      }
    },
    t_move(e) {
        var touches = e.changedTouches;
        for (var i = 0; i < touches.length; i++) {
          this.mX = (touches[i].clientX / this.canvas.width)
          this.mY = (touches[i].clientY / this.canvas.height)
          this.spawnX = touches[i].clientX - touches[i].target.offsetTop
          this.spawnY = touches[i].clientY - touches[i].target.offsetLeft
        }
        if(touches.length > 0){
          this.drag = true
           if(this.drag){
              if(this.bubbles.length > 0){
                  this.bubbles.pop()
                  this.oscillators[this.oscillators.length-1].stop()
                  this.oscillators.pop()
              }
            }
        }
    },
    mtoggle(){
      this.num_draw_bub += 1
      console.log("TOOOG")
    }
  },

}

</script>
<style>
#app {
  font-family: 'Courier New', Courier, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
  padding:0px;
}
body {
  position:absolute;
  overscroll-behavior: none;
  overflow: hidden;
  padding:0px;
  margin:0px;
  width: 100%;
  height: 100%;
}
button {
  position: absolute;
  font-size: 18px;
  font-weight: 600;
  width: 12%;
  height: 8%;
  background: rgba(0,0,0,0);
}

</style>
