import {task} from "../classes/model/Task.js";

const schedulerTemplate = document.createElement("template");

schedulerTemplate.innerHTML = `
    <style>    
        :host{
            display: block;
        }
      
     </style> 
    <div><input type="text" name="task_name" placeholder="Task name"> <button name="add">Add</button></div>
`;

class TaskScheduler extends HTMLElement{
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(schedulerTemplate.content.cloneNode(true));
    }

    connectedCallback(){
        //Inserting a reference to button and text field
        this.createbtn = this.shadowRoot.querySelector("button");
        this.tasknameField = this.shadowRoot.querySelector("input[name='task_name']");
        this.createbtn.addEventListener('click', this.createTask.bind(this));
    }

    _checkTaskName(name){
        this.tasknameField.setCustomValidity("")
        if (!name.replace(/\s/g, '').length) {
            this._errTaskName("Task name must be non empty");
            return false;
        }
        return true;
    }

    _errTaskName(msg){
        this.tasknameField.setCustomValidity(msg);
    }

    createTask(){
        let taskName = this.tasknameField.value;
        if(this._checkTaskName(taskName)){
            let newTask = new task(taskName);
            let taskEvent = new CustomEvent("newtask", {detail: {"task": newTask}, bubbles: true, composed: true});
            this.shadowRoot.dispatchEvent(taskEvent);
            console.log("Creato task ed evento");
        }
    }

}

customElements.define("task-scheduler", TaskScheduler);

