<template>
  <div id="app">
		<div id="myModal" @click="show = !show" class="modal"  v-if="show">
			<div class="modal-content">
				<h2>Magic Sound Bubbles®</h2>
				<h3>An experiment using html5 canvas and the Audio API</h3>
			<p>Click anywhere to generate a <b>Sound Bubble®</b>. To remove a bubble simply drag
				your cursor while pressing down <br>
			</p>
			<p>To learn more about <b>creative coding</b> and animations I highly recommend seeing <b>Daniel Shiffman</b> content
			and visiting <a href="https://p5js.org/">p5.js</a> for a good walkthrough. I've applied what I've learned there
			in here but, without using the library, just with plain js with a bit of <i>Vue</i></p>
			<br>
			<p>The <i>source code for this site is on my <a href="https://github.com/CarloCattano/vue-Canvas-Tone">Github</a> </i></p>
		</div>
	</div>
    <button @click="mtoggle">{{num_draw_bub}}</button>
    <canvas width="100%" height="100%" @touchup="drag = false" @touchdown="drag = true"
                @mousedown="drag = true" @mouseup="drag = false" @click="handleClick" 
                @mousemove="moveit" @touchmove="t_move">
    </canvas>
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
      show: true,
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
    this.Convolver.wet.value = 0.7;
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
          this.panners.shift()
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
    },
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
/* The Modal (background) */
.modal {
  display: inline;
  position: fixed; 
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%; 
  height: 100%; 
  overflow: auto; 
  background-color: rgb(0,0,0); 
  background-color: rgba(0,0,0,0.4); 
}
/* Modal Content/Box */
.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  height : auto;
  font-size: 1.4rem;
  animation: 1.5s slide-right ;
  font: "Lucida Console" , monospace;    -webkit-font-smoothing: antialiased;
  border-radius: 2rem;
 
}
@media only screen and (max-width:500px)  {
  .modal {
    display: inline; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto; /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
    height : 50vh;
    font-size: 14px;
    animation: 1.5s slide-right ;
    font: "Lucida Console" , monospace;    -webkit-font-smoothing: antialiased;
    border-radius: 2rem;
    }
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}
.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.some-animation-panel{
  opacity: 0.1;
  visibility: hidden;
  transform: rotate(45deg)
}
.modal-vue-panel.modal-vue-show.some-animation-panel{
  visibility: visible;
  width:100%;
  height:100%;
}
.slide-right {
  -webkit-animation: slide-right 2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: slide-right 2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
@keyframes slide-right {
  0% {
    -webkit-transform: translateX(-400px);
            transform: translateX(-400px);
  }
  100% {
    -webkit-transform: translateX(0px);
            transform: translateX(0px);
  }
}
@-webkit-keyframes slide-right {
  0% {
    -webkit-transform: translateX(-400px);
            transform: translateX(-400px);
  }
  100% {
    -webkit-transform: translateX(0px);
            transform: translateX(0px);
  }
}

</style>
