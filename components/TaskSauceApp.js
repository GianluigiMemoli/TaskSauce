import {TaskDAO} from "../classes/model/TaskDAO.js";
import {task} from "../classes/model/Task.js";
import Chart from "Chart.js"
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
   <button id="delDB">Delete Database</button>
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
            console.log(this.taskQueue);
            this.taskQueue.addTask(event.detail.task);
        });

        //Set listener on Start/Pause button of Timer
        this.addEventListener("task_start", (event) => {
            console.log("Ascoltato uno start");
           if(this.taskQueue.hasNext()){
               console.log("il prossimo c'è");
               this.timer.setTaskAndStart(this.taskQueue.nextTask());
           }
        });

        //When the task has ended remove it from the queue and save in DB
        this.addEventListener("task_end", (event) => {
            let taskToSave = event.detail.task;
                this._save(taskToSave);
            this.taskQueue.taskDone();
        });

        /*** DEBUG (TO DELETE) ***/
        this.deleteDBBtn = this.shadowRoot.getElementById('delDB');
        this.deleteDBBtn.onclick = this._deleteDB;
        //FAKE DATASETS
        this._deleteDB();
        for(let i=0; i < 10; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new task("less_done");
            this._save(fakeTask)
        }
        for(let i=0; i < 60; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new task("most_done");
            this._save(fakeTask)
        }

        for(let i=0; i < 30; i++){
            //Make 5 standard< duration tasks
            let fakeTask = new task("meanly_done");
            this._save(fakeTask)
        }

        this._getAllTasks();
        /**  ^^^^^ TO DELETE AFTER TESTING ENDS    **/
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

    _save(task){
        console.log("... save task stub .. ");
        console.log(task);
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

    _getAllTasks(){
        TaskDAO.build().then(
            openedDB => {
                openedDB.getAll(true).then(
                    tasks => {
                        console.log("TASKS:");
                        console.log(tasks);
                    },
                    error => console.error(error)
                )
            },
            error => console.error(error)
        )
    }

    _deleteDB(){
        TaskDAO.build().then(
            openedDB => {
                openedDB.clearTasks().then(
                    result => console.log("cleared"),
                    error => console.error(error)
                )
            },
            error => console.error(error)
        );
    }
}

customElements.define("task-sauce", TaskSauceApp);