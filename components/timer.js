import "../node_modules/progressbar.js/dist/progressbar.js";

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
</style>
    
<audio id="timer_buzz" loop>
    <source src="../timer_sound/timer.mp3" type="audio/mpeg">     
</audio>

    <div id="prog"></div>
    <div id="btns"><button id="start_pause_btn">Start</button><button id="stop_btn">Stop</button></div>
`;

 class Timer extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(timerTemplate.content.cloneNode(true));
        //Current time
        this.state = STOP;
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

    /*
    * step: function(state, circle, attachment) {
        circle.path.setAttribute('stroke', state.color);
    },
    * */
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

    _handleStartPause(){
        console.log("premuto");
        console.log(this.state);
        if(this.state === STOP) {
            console.log("start event firing");
            this._askNextTask();
            //If there is any, the APPSAUCE will add a task to the timer
        } else if(this.state === START){
            this.dispatchEvent(new CustomEvent("pause", {bubbles: true, composed: true}));
            this._pause();
            //Here YOU MUST CALL THE PAUSE METHOD AND NOT LET THE APPSAUCE COMPONENT CALL IT!
        } else if(this.state === PAUSE){

            this._resume();
        }
    }

    setTaskAndStart(task){
        console.log("Setting: "+task);
        this.servingTask = task;
        this._start(task.pomodoro, POMODORO_PHASE);
        this.startPauseBtn.innerHTML = "Pause";
    }



    _setupTimer(timeout) {
        this.timeout = timeout;
        this.progressStep = 1 / timeout;
        this.interval = setInterval(this._updateTime.bind(this), 100);
    }

    _updateTime(){
        if(this.timeout === 0 && this.phase === POMODORO_PHASE){
            clearInterval(this.interval);
            console.log("stopped -> break");
            this._start(this.servingTask.breakDuration, BREAK_PHASE);
            this._pause();
            this.timerBuzz.play();
        } else if (this.phase === BREAK_PHASE && this.timeout === 0){
            this._stop();
            this.dispatchEvent(new CustomEvent("task_end", {composed: true, bubbles: true, detail: {task: this.servingTask}}));
        } else{
            this.timeout--;
            let minutes = Math.floor(this.timeout / 60);
            let seconds = this.timeout % 60;
            console.log(`min: ${minutes} sec: ${seconds}`);
            this._setTime(minutes, seconds);
        }
    }


    _setTime(minutes, seconds){
        this.progressBar.setText(`${_stylizeTime(minutes)}:${_stylizeTime(seconds)}`);
        //this.progressBar.set(this.progressBar.value() - this.progressStep);
        let newProgress;
        if (this.progressBar.value() - this.progressStep < 0){
            newProgress = 0;
        }
        else {
            newProgress = this.progressBar.value() - this.progressStep;
        }

        this._loadProgressbarProgress(newProgress, 50);
    }

     _start(timeout, phase){
         this.state = START;
         this.phase = phase;
         if (phase === BREAK_PHASE)
             console.log("launching break");
         this._loadProgressbarProgress(1, 800);
         this._setupTimer(timeout);

         }

    _pause(){
        clearInterval(this.interval);
        this.startPauseBtn.innerHTML = "Start";
        this.state = PAUSE;
    }

    _stop(){
        clearInterval(this.interval);
        this.startPauseBtn.innerHTML = "Start";
        this.state = STOP;
        this.phase = POMODORO_PHASE;
        this._setTime(0, 0);
        this._loadProgressbarProgress(1, 800);
    }

    _resume(){
        this.timerBuzz.pause();
        this.state = START;
        this.startPauseBtn.innerHTML = "Pause";
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
        },
            function () {
                console.log('Animation has finished');
            });
    }
}

function _stylizeTime(time){
    return (time < 10) ? '0' + time : time;
}

customElements.define("wc-timer", Timer);