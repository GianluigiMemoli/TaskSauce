const POMODORO = 25;
const BREAK = 5;
const tableTemplate = document.createElement("template");
tableTemplate.innerHTML = `
<style>
:host{
    display: block;
}     
h3{
    text-align: left; 
}

th, td{
    padding: 1em;
}
tbody td{
    border-bottom: 1px solid black;
}

</style>

<h3>Task queue</h3>
<table cellspacing="0">
<thead>
<tr>
    <th>Name</th>
    <th>Pomodoro<br><small>(min)</small></th>
    <th>Break<br><small>(min)</small></th>
</tr>
</thead>
<tbody>
</tbody>
</table>
`;

const tableRecord = document.createElement("template");
tableRecord.innerHTML = `
    <style>
    #pomodoro_minutes, 
    #break_minutes{
        width: 5em;
        text-align: center;
        background: white;
        border: none; 
        border-bottom: solid black 1px;        
    }
    </style>
    <tr>
    <td id="name"></td>
    <td id="pomodoro"><input id="pomodoro_minutes" type="number"></td>
    <td id="break"><input id="break_minutes" type="number"></td>
    <td id="del"><button id="delete_btn">del</button></td>
    </tr>
`;

class TaskQueue extends HTMLElement{
    constructor(){
        super();
        this.queue = {};
        this.lastTaskID = 0;
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(tableTemplate.content.cloneNode(true));
        this.tbody = this.shadowRoot.querySelector("tbody");
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
        newRecord.querySelector("tr").id = `task-id-${this.lastTaskID}`;
        //Setting task values
        newRecord.querySelector("#name").innerHTML = task.name;
        //Default values or user's settings values
        newRecord.querySelector("#pomodoro_minutes").valueAsNumber = POMODORO;
        newRecord.querySelector("#break_minutes").valueAsNumber = BREAK;
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
        //  console.log(this.queue);
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
        let row = this.shadowRoot.querySelector(`#task-id-${index}`);
        return row;
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
        return this.queue[firstTaskIndex];
    }

    hasNext(){
        return (Object.entries(this.queue).length > 0 &&  this.invalidBreakInputs.size === 0 && this.invalidPomodoroInputs.size === 0);
    }

    taskDone(){
        let indexToPop = this._firstIndex();
        this._deleteTask(indexToPop);
    }
}
customElements.define("task-queue", TaskQueue);
