import {task} from "../classes/model/Task.js";

const schedulerTemplate = document.createElement("template");

schedulerTemplate.innerHTML = `
    <style>    
    @import "../../style/layout.css"; 
    @import "../../style/grid_behaviour.css";
    @import "../../style/typography.css"; 
        :host{
            display: block;
        }
        
        
        #task_name{
            background-color white;
            border: none;
            height: 2.5em;            
            border-radius: 90px;          
            padding: 0.2em;                          
        }
        
        @media screen and (max-width: 800px){
            :host{
              margin-top: 5%;                  
            }
            #task_name{                                   
                height: auto; 
                width: auto;
                padding: 0.2em;                                      
            }
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
        #scheduler{
            display: flex;                        
            flex-wrap: nowrap;
            align-self: center;
            margin-bottom: 4em;
            border-radius: 100px;
            justify-content: flex-start;
            background: rgb(131,58,180);
            background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 0%, rgba(252,120,54,1) 100%, rgba(252,176,69,1) 100%);  
        }
     </style> 
    <div id="scheduler" class="shady"><input id="task_name" type="text" name="task_name" placeholder="Task name"><button id="add" name="add">+</button></div>
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
        this.tasknameField.setCustomValidity("");
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
            this.tasknameField.value="";
        }
    }

}

customElements.define("task-scheduler", TaskScheduler);

