// TODO: change this constant in setting based value
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
        console.log("tq");
        this.queue = {};
        this.lastTaskID = 0;
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(tableTemplate.content.cloneNode(true));
        this.tbody = this.shadowRoot.querySelector("tbody");
    }

    connectedCallback(){
        console.log("q connected");

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
        //Effective insert of the row in tables
        this.tbody.appendChild(newRecord);
    }

    _deleteTask(index){
        console.log("Removing task");
        delete this.queue[index];
        console.log(this.queue);
        this._deleteRow(index);
    }

    _deleteRow(index){
        let row = this.shadowRoot.querySelector(`#task-id-${index}`);
        row.remove();
    }



    nextTask(){
        return this.queue[this.queue.length - 1];
    }

    hasNext(){
        return (this.queue.length > 0);
    }

}
customElements.define("task-queue", TaskQueue);
