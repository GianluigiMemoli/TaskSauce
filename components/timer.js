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
    
</style>
    
    <div><span class="minutes">00</span>:<span class="seconds">00</span></div>
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
        this.startPauseBtn.addEventListener("click",  this._handleStartPause.bind(this));
    }
    _handleStartPause(){
        console.log("premuto");
        console.log(this.state);
        if(this.state === STOP) {
            console.log("start event firing");
            this.dispatchEvent(new CustomEvent("start", {bubbles: true, composed: true}));
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
            this._start(this.servingTask.break, BREAK_PHASE);
        } else if (this.phase == BREAK_PHASE && this.timeout === 0){
            clearInterval(this.interval);
            //CODE FOR GET NEXT TASK OR STOP!!!!!!!!!!
        } else{
            console.log(`timeout: ${this.timeout}`)
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

    _resume(){
        this.state = START;
        this.startPauseBtn.innerHTML = "Pause";
        this._setupTimer(this.timeout);
    }
}

function _stylizeTime(time){
    return (time < 10) ? '0' + time : time;
}

customElements.define("wc-timer", Timer);