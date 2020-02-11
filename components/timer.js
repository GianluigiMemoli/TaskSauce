const START = 1;
const PAUSE = 0;
const STOP = 2;

const POMODORO_PHASE = 'POMODORO';
const BREAK_PHASE = 'BREAK';
const timerTemplate = document.createElement("template");

 timerTemplate.innerHTML = `
<style>  
    :host{
        display: block;
        font-size: 46pt;
    }    
    .pomodoro{
    color:red;
    }
    .break{
    color:green;
    }
</style>
    
    <div id="time"><span class="minutes">00</span>:<span class="seconds">00</span></div>
    <div><button id="start_pause_btn">Start</button><button id="stop_btn">Stop</button></div>
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
        this.innerSeconds = this.shadowRoot.querySelector(".seconds");
        this.innerMinutes = this.shadowRoot.querySelector(".minutes");
        this.startPauseBtn = this.shadowRoot.querySelector("#start_pause_btn");
        this.timeDiv = this.shadowRoot.querySelector("#time");
        this.stopBtn = this.shadowRoot.querySelector("#stop_btn");
        this.startPauseBtn.addEventListener("click",  this._handleStartPause.bind(this));
        this.stopBtn.addEventListener("click", this._stop.bind(this));
    }
    set phase(value){
        this._phase = value;
        if (value == POMODORO_PHASE){
            this.timeDiv.classList.remove("break");
            this.timeDiv.classList.add("pomodoro");
        } else if (value == BREAK_PHASE){
            this.timeDiv.classList.remove("pomodoro");
            this.timeDiv.classList.add("break");
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
        console.error(task);
        this.servingTask = task;
        this._start(task.pomodoro, POMODORO_PHASE);
        this.startPauseBtn.innerHTML = "Pause";
    }



    _setupTimer(timeout){
        this.timeout = timeout;
        this.interval = setInterval(this._updateTime.bind(this), 100)
    }

    _updateTime(){
        if(this.timeout === 0 && this.phase === POMODORO_PHASE){
            clearInterval(this.interval);
            console.log("stopped -> break");
            this._start(this.servingTask.breakDuration, BREAK_PHASE);
            //TODO beep beep beep m*f*ckers
            this._pause();
        } else if (this.phase == BREAK_PHASE && this.timeout === 0){
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
        this.innerSeconds.innerHTML = _stylizeTime(seconds);
        this.innerMinutes.innerHTML = _stylizeTime(minutes);
    }

     _start(timeout, phase){
         this.state = START;
         this.phase = phase;
         if (phase === BREAK_PHASE)
             console.log("launching break");
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
    }

    _resume(){
        this.state = START;
        this.startPauseBtn.innerHTML = "Pause";
        this._setupTimer(this.timeout);
    }
    _askNextTask(){
        this.dispatchEvent(new CustomEvent("task_start", {bubbles: true, composed: true}));
    }
}

function _stylizeTime(time){
    return (time < 10) ? '0' + time : time;
}

customElements.define("wc-timer", Timer);