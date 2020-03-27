const Task = require("../classes/model/Task.js");
const POMODORO = 25;
const BREAK = 5;
const tableTemplate = document.createElement("template");
tableTemplate.innerHTML = `
<style>
 @import "../../style/layout.css"; 
 @import "../../style/grid_behaviour.css";
 @import "../../style/typography.css"
 @import '../../node_modules/material-design-icons/iconfont/material-icons.css';

:host{
    display: block;        
}  
.scrollable-wrapper{
   display: block;
   overflow-y: auto;
   overflow-x: hidden;
   padding: 2em;
   font-family: 'BalooChettan2 Regular', sans-serif;
   width: 30em;
   height: 30em;
}  

@media screen and (max-width: 800px){
    .scrollable-wrapper{
       margin-top: 50px;
       }
}



.table-flex{
    /*display: flex;
    flex-direction: column;        
    width: 100%;
    */
    display: grid;
    width: 100%;
    grid-auto-rows: 100%;
    row-gap: 1em;
}
.trow{
    display: grid;
    grid-template-columns: 33% 33% 33% 10%;          
    justify-content: left;          
}
.tdata{
    display: inline-block;
    text-align: center;
    width: 5em;
}
.col1{
    grid-column-start: 1;
    grid-column-end: 1;
}

.col2{
    grid-column-start: 2;
    grid-column-end: 2;
}

.col3{
    grid-column-start: 3;
    grid-column-end: 3;
}
.col12{
    grid-column-start: 1;
    grid-column-end: 2;
}

.col23{
    grid-column-start: 2;
    grid-column-end: 3;
}

.col34{
    grid-column-start: 3;
    grid-column-end: 4;
}


.col4{
    grid-column-start: 4;
    grid-column-end: 4;
}

.tdata > input {
    width: 40%;       
    margin-top: 2.5px; 
}

@media screen and (max-width: 800px){
    :host{
        margin-top: 35%;
    }
    .scrollable-wrapper{
        width: 80vw;
        justify-self: center;
    }
}

</style>

<div class="scrollable-wrapper shady white-box roundy justify-s-sm-center shady">
    <div class="table-flex">
        <div class="trow">
            <div class="tdata col12">
                <span>Name</span>
            </div>
            <div class="tdata col23">
                <span>Pomodoro</span>
            </div>
            <div class="tdata col34">
                <span>Break</span>
            </div>            
        </div>        
    </div>
</div>
`;

const tableRecord = document.createElement("template");
tableRecord.innerHTML = `
    <style>   
     @import '../../node_modules/material-design-icons/iconfont/material-icons.css';

    #name_value{
        overflow-x: auto;
        line-height: 40px;
    }
    #delete_btn{
        display: none;
        margin-left: -1.5em;  
        margin-top: 7px;
    }

    .trow:hover > #delete_btn{
        display: inline-block;
    } 
    
    @media screen and (max-width: 800px){
    #delete_btn{
        display: inline-block;
        margin-left: -1.5em;
    }
    }
    .active{
        background-color: #e0f5b9;
    }
    </style>
     <div class="trow regular record grey-box">
     <div class="tdata col1"><span id="name_value"></span></div>
     <div class="tdata col2"><input id="pomodoro_minutes" type="number"></div>
     <div class="tdata col3"><input id="break_minutes" type="number"></div>                 
     <a id="delete_btn"><span class="material-icons">delete</span></a>     
    </div>
`;

class TaskQueue extends HTMLElement{
    constructor(){
        super();
        this.queue = {};
        this.lastTaskID = 0;
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(tableTemplate.content.cloneNode(true));
        this.tbody = this.shadowRoot.querySelector(".table-flex");
        //If user inserts an invalid value for pomodoro or break this will be set true
        this.invalidBreakInputs = new Set();
        this.invalidPomodoroInputs = new Set();
    }

    connectedCallback(){
        console.log("q connected");
        window.addEventListener("start",() => console.log("Ciao dalla queue"));
    }


    addTask(task){
        //Adding task to the queue, with an incremented id
        this.queue[++this.lastTaskID] = task;
        console.log(this.queue);
        //Transform the task in a table row
        let newRecord = tableRecord.content.cloneNode(true);
        //Setting task-id to the <tr>
        newRecord.querySelector(".trow").id = `task-id-${this.lastTaskID}`;
        //Setting task values
        newRecord.querySelector(".trow > .tdata > #name_value").innerHTML = task.name;
        //Default values or user's settings values
        newRecord.querySelector("#pomodoro_minutes").valueAsNumber = task.pomodoro / 60;
        newRecord.querySelector("#break_minutes").valueAsNumber = task.breakDuration / 60;
        //Setting behaviour for delete button
        let index = this.lastTaskID;
        newRecord.querySelector("#delete_btn").addEventListener('click', ()=> this._deleteTask(index));
        //Listen any change to the inputs
        newRecord.querySelector("#pomodoro_minutes").addEventListener("input",  () => this._pomodoroChanged(index));
        newRecord.querySelector("#break_minutes").addEventListener("input",  () => this._breakChanged(index));
        //Effective insert of the row in tables
        this.tbody.appendChild(newRecord);
    }

    //Removes a task thanks its index, then removes the table row that concerns the task
    _deleteTask(index){
        console.log("Removing task");
        delete this.queue[index];
        this._deleteRow(index);
    }

    _pomodoroChanged(taskIndex){
        console.log(`pomodoro changed for id:${taskIndex}`);
        let row = this._getRow(taskIndex);
        let pomodoroMinuteInput = row.querySelector("#pomodoro_minutes");
        let pomodoroMinute = pomodoroMinuteInput.value;
        if(!Number.isInteger(pomodoroMinute) && pomodoroMinute <= 0){
            pomodoroMinuteInput.setCustomValidity("Must be a positive integer");
            this.invalidPomodoroInputs.add(row);
        } else {
            this.queue[taskIndex].pomodoro = pomodoroMinute * 60; //Must be in seconds!
            if(this.invalidPomodoroInputs.has(row)){
                this.invalidPomodoroInputs.delete(row);
                pomodoroMinuteInput.setCustomValidity("");
            }
        }
        //Update task's pomodoro value
        console.log(this.queue[taskIndex]);
    }

    _breakChanged(taskIndex){
        console.log(`break changed for id:${taskIndex}`);
        let row = this._getRow(taskIndex);
        let breakMinuteInput = row.querySelector("#break_minutes");
        let breakMinute = breakMinuteInput.value;
        if(!Number.isInteger(breakMinute) && breakMinute <= 0){
            breakMinuteInput.setCustomValidity("Must be a positive integer");
            this.invalidBreakInputs.add(row);
        } else {
            //Reset, in the case is was invalid
            if(this.invalidBreakInputs.has(row)){
                this.invalidBreakInputs.delete(row);
                breakMinuteInput.setCustomValidity("");
            }
            this.queue[taskIndex].breakDuration = breakMinute * 60; //Must be in seconds!
        }
        //Update task's pomodoro value
        console.log(this.queue[taskIndex]);
    }



    //Given an index it returns a table row, of the indexed task
    _getRow(index){
        return this.shadowRoot.querySelector(`#task-id-${index}`);
    }
    _deleteRow(index){
        let row = this._getRow(index);
        this.invalidPomodoroInputs.delete(row);
        this.invalidBreakInputs.delete(row);
        row.remove();
    }

    _firstIndex(){
        return Object.keys(this.queue)[0];
    }

    nextTask(){
        let firstTaskIndex = Object.keys(this.queue)[0];
        let row = this._getRow(firstTaskIndex);
        row.classList.add("active");
        return this.queue[firstTaskIndex];
    }

    releaseTask(){
        let firstTaskIndex = Object.keys(this.queue)[0];
        let row = this._getRow(firstTaskIndex);
        row.classList.remove("active");
    }

    hasNext(){
        return (Object.entries(this.queue).length > 0 &&  this.invalidBreakInputs.size === 0 && this.invalidPomodoroInputs.size === 0);
    }

    taskDone(){
        let indexToPop = this._firstIndex();
        this._deleteTask(indexToPop);
    }

    getQueue(){
        return this.queue;
    }

    setQueue(queue){
        console.log("setQueue");
        console.log("QUEUE");
        console.log(queue);
        for (let taskID in queue){
            console.log(`TaskID: ${taskID}`);
            console.log(queue[taskID]);
            let task = Object.setPrototypeOf(queue[taskID], Task.task.prototype);
            this.addTask(queue[taskID], task);

        }
    }
}
customElements.define("task-queue", TaskQueue);
