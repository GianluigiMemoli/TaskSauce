const ProgressBar = require("progressbar.js");

const START = 1;
const PAUSE = 0;
const STOP = 2;

const POMODORO_PHASE = 'POMODORO';
const BREAK_PHASE = 'BREAK';
const BREAK_COLOR = "#bbeaa6";
const POMODORO_COLOR = "#ed9a73";
const timerTemplate = document.createElement("template");

 timerTemplate.innerHTML = `
<style>  
 @import "../../style/layout.css"; 
    :host{
        display: block;
        font-size: 46pt;        
    }    
               
    #time{
    text-align: center;
    }
    
    #prog{
        margin-top: 1em;
        height: 5em; 
        width: 5em;        
    }
    
    #btns{
        display: flex;
        justify-content: center;
        margin-top: 1em;
    }
    #timer_container{
        padding: 0.5em;
    }
</style>
    
<audio id="timer_buzz" loop>
    <source src="../timer_sound/timer.mp3" type="audio/mpeg">     
</audio>
<div id="timer_container" class="white-box shady roundy">
        <div id="prog"></div>
        <div id="btns"><input type="image" src="../../icons/play.svg" id="start_pause_btn"><input type="image" src="../../icons/stop.svg" id="stop_btn"></div>
</div>          
`;

 class Timer extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(timerTemplate.content.cloneNode(true));
        //Current time
        this.state = STOP;
        this.timeout = 0;
    }

    connectedCallback() {
        this.startPauseBtn = this.shadowRoot.querySelector("#start_pause_btn");
        this.stopBtn = this.shadowRoot.querySelector("#stop_btn");
        this.timerBuzz = this.shadowRoot.querySelector("#timer_buzz");
        this.startPauseBtn.addEventListener("click",  this._handleStartPause.bind(this));
        this.stopBtn.addEventListener("click", this._stop.bind(this));
        this.progressBar = new ProgressBar.Circle(this.shadowRoot.querySelector("#prog"), {
            text:{value: "00:00", alignToBottom: true},
            strokeWidth: 2,
            trailColor:"#f1f3f4",
            fill: "#f1f3f4"
        });
        this.phase = POMODORO_PHASE;
        this._loadProgressbarProgress(1, 800);
        console.log(this.progressBar);

    }

    set phase(value){
        this._phase = value;
        if(value === BREAK_PHASE) {
            this._setProgressbarColor(BREAK_COLOR);
        }else{
            this._setProgressbarColor(POMODORO_COLOR);
            }

    }

    get phase(){
        return this._phase;
    }

    _initWorker(start, step){
        this.killWorker();
        if(window.Worker){
            console.log("worker setup");
            this._timeWorker = new Worker("TimerWorker.js");
            this._timeWorker.addEventListener("message", event => {
                this._updateTime(event.data);
            });
            this._timeWorker.postMessage(["START", start, step]);
            this._timeWorker.onerror = (err) => alert(err);
        }
    }
    killWorker(){
        if(this._timeWorker){
            this._timeWorker.terminate();
        }
    }
    _handleStartPause(){
        if(this.state === STOP) {
            console.log("start event firing");
            this._askNextTask();
        } else if(this.state === START){
            this.dispatchEvent(new CustomEvent("pause", {bubbles: true, composed: true}));
            this._pause();
        } else if(this.state === PAUSE){
            this._resume();
        }
    }

    setTaskAndStart(task){
        console.log("Setting: "+task);
        this.servingTask = task;
        this._start(task.pomodoro, POMODORO_PHASE);
        console.log("SET");
        console.log(this.startPauseBtn.src);
        this.startPauseBtn.src = "../../icons/pause.svg";
        console.log(this.startPauseBtn.src);
    }



    _setupTimer(timeout) {
        this.timeout = timeout;
        this.progressStep = this.progressBar.value() / timeout;
        this._initWorker(this.progressBar.value(), this.progressStep);
    }

    _updateTime(progressValue){

        console.log("updating");
        if(this.timeout === 0 && this.phase === POMODORO_PHASE){
            console.log("stopped -> break");
            this._start(this.servingTask.breakDuration, BREAK_PHASE);
            this._timeWorker.postMessage(["STOP"]);
            this._pause();
            this.killWorker();
            this.timerBuzz.play();
        } else if (this.phase === BREAK_PHASE && this.timeout === 0){
            this._stop();
            this.dispatchEvent(new CustomEvent("task_end", {composed: true, bubbles: true, detail: {task: this.servingTask}}));
            this.timerBuzz.play();
        } else{
            this.timeout--;
            let minutes = Math.floor(this.timeout / 60);
            let seconds = this.timeout % 60;
            this._setTime(minutes, seconds, progressValue);
        }
    }


    _setTime(minutes, seconds, progressValue){
        this.progressBar.setText(`${_stylizeTime(minutes)}:${_stylizeTime(seconds)}`);


        this._loadProgressbarProgress(progressValue, 100);
    }

     _start(timeout, phase){
        this.timerBuzz.pause();
         this.state = START;
         this.phase = phase;
         if (phase === BREAK_PHASE)
             console.log("launching break");
         this._loadProgressbarProgress(1, 800);
         this._setupTimer(timeout);

         }

    _pause(){
        console.log('paused');
        this.killWorker();
        this.startPauseBtn.src = "../../icons/play.svg";
        this.state = PAUSE;
    }

    _stop(){
        this.timeout = 0;
        this.killWorker();
        this.timerBuzz.pause();
        this.startPauseBtn.src = "../../icons/play.svg";
        this.state = STOP;
        this.phase = POMODORO_PHASE;
        this._setTime(0, 0);
        this._loadProgressbarProgress(1, 800);
        this.dispatchEvent(new CustomEvent("task_stop", {bubbles: true, composed: true}));
    }

    _resume(){
        this.timerBuzz.pause();
        this.state = START;
        this.startPauseBtn.src = "../../icons/pause.svg";
        this._setupTimer(this.timeout);
    }
    _askNextTask(){
        this.dispatchEvent(new CustomEvent("task_start", {bubbles: true, composed: true}));
    }

    _setProgressbarColor(color){
        this.progressBar.path.setAttribute('stroke', `${color}`);
        console.log(this.progressBar.path.attributes.stroke);
        console.log(this.progressBar.text.style);
        this.progressBar.text.style["color"] =  `'${color}'`;
    }

    _loadProgressbarProgress(progress, duration){
        this.progressBar.animate(progress, {
            duration: duration,
            offset: 0
        });
    }

    isRunning(){
        return this.timeout > 0;
    }



}

function _stylizeTime(time){
    return (time < 10) ? '0' + time : time;
}

customElements.define("wc-timer", Timer);