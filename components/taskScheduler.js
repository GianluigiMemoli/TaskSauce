import {task} from "../classes/model/Task.js";

const schedulerTemplate = document.createElement("template");

schedulerTemplate.innerHTML = `
    <style>    
        :host{
            display: block;
        }
        #task_name{
            background-color: white;
            border: none;
            border-radius: 0;
            height: 2.5em;
            -webkit-box-shadow: 1px 5px 18px -5px rgba(168,168,168,1);
            -moz-box-shadow: 1px 5px 18px -5px rgba(168,168,168,1);
            box-shadow: 1px 5px 18px -5px rgba(168,168,168,1);
        }
        #add{
            background-color: transparent;
            border: none;
            font-size: 20pt;
            vertical-align: middle;
        }
        #add:hover{
            color: black;
        }
     </style> 
    <div><input id="task_name" type="text" name="task_name" placeholder="Task name"> <button id="add" name="add">+</button></div>
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

