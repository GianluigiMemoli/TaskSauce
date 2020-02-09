const mainGrid = document.createElement("template");

mainGrid.innerHTML = `
<style>
 @import "../style/layout.css"; 
 @import "../style/grid_behaviour.css";
 @import "../style/typography.css"; 
:host{
    display: block; 
}
</style>
   <div class="row-6 col-3"></div>
`;


class TaskSauceApp extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(mainGrid.content.cloneNode(true));
        this.mainGrid = this.shadowRoot.querySelector("div");
    }

    connectedCallback(){
        this._setupItems();

        this.taskQueue = this.shadowRoot.querySelector("task-queue");
        this.timer = this.shadowRoot.querySelector("wc-timer");
        this.taskScheduler = this.shadowRoot.querySelector("task-scheduler");
        //If a new task is created the TaskScheduler triggers a 'newtask' event with it in the event object
        this.addEventListener("newtask", (event) => {
            this.taskQueue.addTask(event.detail.task);
        });
        //Set listener on Start/Pause button of Timer
        this.addEventListener("start", (event) => {
           if(this.queue.hasNext()){
               this.timer.start(this.queue.nextTask());
           }
        });
    }

    _insertItem(element, ...attributes){
        attributes.forEach(attribute => element.classList.add(attribute));
        this.mainGrid.append(element);
    }

    _setupItems(){
        //creating wc-timer
        let timer = document.createElement("wc-timer");
        this.wcTimer = timer;
        this._insertItem(timer, "row-start-2", "col-start-2", "col-end-3", "justify-s-center", "regular");
        //creating task queue
        let taskQueue = document.createElement("task-queue");
        this.taskQueue = taskQueue;
        this._insertItem(taskQueue, "row-start-2", "col-start-3", "justify-s-center");
        //creating task scheduler
        let taskScheduler = document.createElement("task-scheduler");
        this.taskScheduler = taskScheduler;
        this._insertItem(taskScheduler, "row-start-1", "col-start-2", "justify-s-center");
    }

}

customElements.define("task-sauce", TaskSauceApp);