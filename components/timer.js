const START = 1;
const PAUSE = 0
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
        this.state = PAUSE;
    }

    connectedCallback(){
        this.innerSeconds = this.shadowRoot.querySelector(".seconds");
        this.innerMinutes = this.shadowRoot.querySelector(".minutes");
        this.shadowRoot.querySelector("#start_pause_btn").addEventListener("click", () => {
           if(this.state === PAUSE) {
               this.dispatchEvent(new CustomEvent("start", {bubbles: true, composed: true}));
               //If there is any, the APPSAUCE will add a task to the timer
           } else {
               this.dispatchEvent(new CustomEvent("pause", {bubbles: true, composed: true}));
               //Here YOU MUST CALL THE PAUSE METHOD AND NOT LET THE APPSAUCE COMPONENT CALL IT!
           }
        });
    }

    start(task){

    }

    _setTime(minutes, seconds){

    }
}

function _stylizeTime(time){
    return (time < 10) ? '0' + time : time;
}

customElements.define("wc-timer", Timer);