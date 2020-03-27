const TaskDAO = require("../classes/model/TaskDAO.js").TaskDAO;
const Task = require("../classes/model/Task.js").task;
const moment = require("moment");
const mainGrid = document.createElement("template");

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
   <div id="main_contento" class="row-3 row-s-main-3 col-4-main col-s-1 sm-fill-height">
   
</div>
   
   <!-- DELETE AFTER PRODUCTION  
   <button id="delDB">Delete Database</button>
   <canvas id="chart-o" width="50px"></canvas>
   -->
`;


class HomeView extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(mainGrid.content.cloneNode(true));
        this.mainGrid = this.shadowRoot.querySelector("div");
    }

    connectedCallback(){
        //console.log("BEFORE SETUP");
        this._setupComponents();
        this.taskQueue = this.shadowRoot.querySelector("task-queue");
        this.timer = this.shadowRoot.querySelector("wc-timer");
        this.taskScheduler = this.shadowRoot.querySelector("task-scheduler");

        //If a new task is created the TaskScheduler triggers a 'newtask' event with it in the event object
        this.addEventListener("newtask", (event) => {
            //console.log(this.taskQueue);
            this.taskQueue.addTask(event.detail.task);
        });

        //Set listener on Start/Pause button of Timer
        this.addEventListener("task_start", (event) => {
            //console.log("Ascoltato uno start");
           if(this.taskQueue.hasNext()){
               //console.log("il prossimo c'è");
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
            console.log("Sniffed a stop");
            this.taskQueue.releaseTask();
        });

        /*** DEBUG (TO DELETE) ***/

        //FAKE DATASETS
        this._deleteDB();

        let fromMAR = moment("10/03/2020","DD/MM/YYYY");

        //console.log("From mar: "+fromMAR.format());
        for(let i=0; i < 10; i++){
            //Make 5 standard< duration tasks
            //console.log("save?");
            let fakeTask = new Task("less_done_from_MAR");
            fakeTask.startDate = moment(fromMAR.add(1, "d"));
            //console.log(fakeTask.startDate);
            this._save(fakeTask)
        }

        let fromFEB = moment("01/02/2020","DD/MM/YYYY");
        let increasingDensityCounter = 0;
        for(let i=0; i < 60; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new Task("almost_from_feb");
            fakeTask.startDate = moment(fromFEB.add(1, "d"));
            this._save(fakeTask);
            increasingDensityCounter++;
            if(increasingDensityCounter === 3){
                for(let j = 0 ; j < 5; j++){
                    this._save(fakeTask);
                    //console.log("INC");
                }
                increasingDensityCounter = 0;
            }
        }

        let fromGEN = moment("01/01/2020","DD/MM/YYYY");
        for(let i=0; i < 260; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new Task("most_done_from_GEN");
            fakeTask.startDate = moment(fromGEN.add(1, "d"));
            this._save(fakeTask)
        }


        for(let i=0; i < 30; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new Task("meanly_done_from_NOW");
            fakeTask.startDate = moment();
            this._save(fakeTask)
        }

        this._getAllTasks();


        /**  ^^^^^ TO DELETE AFTER TESTING ENDS    **/
    }

    _insertItem(element, ...attributes){
        attributes.forEach(attribute => element.classList.add(attribute));
        this.mainGrid.append(element);
    }

    _setupComponents(){
        //creating wc-timer
        this.wcTimer = document.createElement("wc-timer");
        //creating task queue
        this.taskQueue = document.createElement("task-queue");
        //creating task scheduler
        this.taskScheduler = document.createElement("task-scheduler");

        //Populate the DOM
        this._insertItem(this.taskScheduler, "row-start-1", "row-s-start-1", "col-start-2", "justify-s-center");
        this._insertItem(this.wcTimer, "row-start-2", "row-s-start-2", "row-s-end-2", "col-start-2", "col-end-2", "justify-s-center", "regular");
        this._insertItem(this.taskQueue, "row-start-2", "row-s-start-3", "ros-s-end-3","col-start-4", "col-end-5", "justify-s-center", "justify-s-sm-center");
    }

    _save(task){
        ////console.log("... save task stub .. ");
        ////console.log(task);
        ////console.log(TaskDAO);
       TaskDAO.build().then(
            openedDB => {
                //console.log("homeview pre-save");
                //console.log(task.startDate);
                openedDB.saveTask(task)
            },
            error => {
                console.error(error);
                alert(error);
                throw error;
            }
        );
    }

    _getAllTasks(){
        //console.log("get all");
        //console.log(TaskDAO);
        TaskDAO.build().then(
            openedDB => {
                openedDB.getAll(true).then(
                    tasks => {
                        //console.log("TASKS:");
                        //console.log(tasks);
                    },
                    error => console.error(error)
                )
            },
            error => console.error(error)
        )
    }

    _deleteDB(){
        //console.log("DEL");
        TaskDAO.build().then(
            openedDB => {
                openedDB.clearTasks().then(
                    result => //console.log("cleared"),
                    error => console.error(error)
                )
            },
            error => console.error(error)
        );
    }



    //Callbacks for managing the routing behaviours
    onBeforeLeave(location, commands, router){
        //console.log("OnBeforeLeave");
        sessionStorage.setItem("taskQueueContent", JSON.stringify(this.taskQueue.getQueue()));
        //console.log("SAVING");
        //console.log(JSON.stringify(this.taskQueue.getQueue()));
    }

    onAfterEnter(location, commands, router) {
        //console.log("After enter");
        let taskQueueContent = sessionStorage.getItem("taskQueueContent");
        if (taskQueueContent != null) {
            this.taskQueue.setQueue(JSON.parse(taskQueueContent));
            sessionStorage.clear();
            //console.log("GOT:");
            //console.log(taskQueueContent);
        }
    }
}

customElements.define("tasksauce-homeview", HomeView);