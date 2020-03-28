const Router = require("@vaadin/router");
const TaskDAO = require("../classes/model/TaskDAO.js").TaskDAO;
const mainGrid = document.createElement("template");
const Swal = require("sweetalert2");
const populate = require("../classes/model/PopulateDB.js").populateDB;
mainGrid.innerHTML = `
<style>
 @import "../../style/layout.css"; 
 @import "../../style/grid_behaviour.css";
 @import "../../style/typography.css"; 
:host{    
    width: 100vw; 
    height: 100vh;
}
@media screen and (max-width: 800px){
    :host{
        height: 100vh;
        width: 100vw;
    }                            
}
</style>
   <div id="main_content" class="row-3 row-s-main-3 col-4-main col-s-1 sm-fill-height">
   
</div>
      
`;


class HomeView extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(mainGrid.content.cloneNode(true));
        this.mainGrid = this.shadowRoot.querySelector("div");
    }

    connectedCallback(){
        this._setupComponents();
        this.taskQueue = this.shadowRoot.querySelector("task-queue");
        this.timer = this.shadowRoot.querySelector("wc-timer");
        this.taskScheduler = this.shadowRoot.querySelector("task-scheduler");

        //If a new task is created the TaskScheduler triggers a 'newtask' event with it in the event object
        this.addEventListener("newtask", (event) => {
            this.taskQueue.addTask(event.detail.task);
        });

        //Set listener of Start/Pause button of Timer
        this.addEventListener("task_start", (event) => {
           if(this.taskQueue.hasNext()){
               this.timer.setTaskAndStart(this.taskQueue.nextTask());
           }
        });

        //When the task has ended remove it from the queue and save in DB
        this.addEventListener("task_end", (event) => {
            let taskToSave = event.detail.task;
                this._save(taskToSave);
            this.taskQueue.taskDone();
        });

        this.addEventListener("task_stop", () =>{
            this.taskQueue.releaseTask();
        });

        //Checking if the user is a first timer
        if(window.localStorage.getItem("old_user") === null) {
            console.log("new user");
            this._deleteDB();
            console.log(populate);
            populate(this._save);
            window.localStorage.setItem("old_user", "true");
        }
    }

    _insertItem(element, ...attributes){
        attributes.forEach(attribute => element.classList.add(attribute));
        this.mainGrid.append(element);
    }

    _setupComponents(){
        //creating wc-timer
        this.timer = document.createElement("wc-timer");
        //creating task queue
        this.taskQueue = document.createElement("task-queue");
        //creating task scheduler
        this.taskScheduler = document.createElement("task-scheduler");

        //Populate the DOM
        this._insertItem(this.taskScheduler, "row-start-1", "row-s-start-1", "col-start-2", "justify-s-center");
        this._insertItem(this.timer, "row-start-2", "row-s-start-2", "row-s-end-2", "col-start-2", "col-end-2", "justify-s-center", "regular");
        this._insertItem(this.taskQueue, "row-start-2", "row-s-start-3", "ros-s-end-3","col-start-4", "col-end-5", "justify-s-center", "justify-s-sm-center");
    }

    _save(task){
       TaskDAO.build().then(
            openedDB => {
                openedDB.saveTask(task)
            },
            error => {
                console.error(error);
                alert(error);
                throw error;
            }
        );
    }

    _deleteDB(){
        TaskDAO.build().then(
            openedDB => {
                openedDB.clearTasks().then(
                    result =>
                    error => console.error(error)
                )
            },
            error => console.error(error)
        );
    }



    //Callbacks for managing the routing behaviours
    onBeforeLeave(location, commands, router){
        //Saving the current queue, to restore it when coming back from statistics page
        sessionStorage.setItem("taskQueueContent", JSON.stringify(this.taskQueue.getQueue()));
        if(this.timer.isRunning()){
            Swal.fire({
                customClass: {
                    title: 'bold',
                    confirmButton: 'bold',
                    content: 'regular',
                    cancelButton: 'bold'
                },
                icon: 'question',
                title: 'Are you sure?',
                text: 'Changing page will stop the timer. Anyway the task queue will be restored if you come back.',
                confirmButtonText: "Go to statistics",
                cancelButtonText: "Cancel",
                showCancelButton: true
            }).then(result => {
                if(result.value){
                    this.timer.killWorker();
                    window.location = `${window.location}stats`;
                }
            });
            return commands.prevent();
        }
    }

    onAfterEnter(location, commands, router) {
        let taskQueueContent = sessionStorage.getItem("taskQueueContent");
        //If we have a saved queue we restore it
        if (taskQueueContent != null) {
            this.taskQueue.setQueue(JSON.parse(taskQueueContent));
            sessionStorage.clear();
        }
    }
}

customElements.define("tasksauce-homeview", HomeView);