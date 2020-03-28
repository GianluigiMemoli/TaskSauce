const TaskDAO = require("../classes/model/TaskDAO.js").TaskDAO;
const Task = require("../classes/model/Task.js").task;
const Chart = require("chart.js");
const layout = document.createElement("template");
const moment = require("moment");
const monthName ={
    0: "January",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
};
const GENERAL_OVERVIEW = "GENERAL";
const MONTHLY_OVERVIEW = "MONTHLY";
layout.innerHTML = `
<style>
 @import "../../style/layout.css"; 
 @import "../../style/grid_behaviour.css";
 @import "../../style/typography.css"; 
:host{    
    width: 100vw; 
    height: 100vh;
}   
.chart-grid{
    width: 50vw;
    height: 50vh;
    justify-items: center;
}
#chart-container{
    width: 50vw;
    height: 60vh;
    padding: 5em;
}
ul > li{
    display: inline-block;
    margin-right: 1em;    
}

#stats_controller{
    display: flex;    
    justify-content: space-around;
}

#generalBtn, #monthlyBtn{
    padding: 1em;
    color: #fff;
    background-color:  hsl(208, 79%, 28%);;
    border-style: none;
    border-radius: 5px;
    -webkit-box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    -moz-box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    transition: box-shadow 0.3s ease;
}

#generalBtn:hover, #monthlyBtn:hover{
    background-color:  hsl(208, 79%, 38%);
    box-shadow: none;
}

#btnDropDB{
    padding: 1em;
    color: #fff;
    background-color:  hsl(4, 98%, 56%);
    border-style: none;
    border-radius: 5px;
    -webkit-box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    -moz-box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    box-shadow: 2px 1px 20px 0.1px rgba(168,168,168,1);
    transition: box-shadow 0.3s ease;
    
}

#btnDropDB:hover{
    background-color:  hsl(4, 98%, 60%);
    box-shadow: none;
}

.selected{
    background-color:  hsl(208, 79%, 38%) !important; 
    box-shadow: none !important;    
}
@media screen and (max-width: 800px){

#chart-container{
    width: 100vw;
    height: 50vh;
}    

.chart-grid{
    width: 30vw;        
}
}
</style>

<div class="chart-grid row-1 col-1 justify-i-center grey-box">
    <div id="chart-container" class="shady white-box roundy">   
        <ul id="stats_controller"><li><button class="bold" id="generalBtn">General  Overview</button></li><li><button class="bold" id="monthlyBtn">Monthly Overview</button></li><li id="btnAtEnd"><button id="btnDropDB" class="bold">Delete history</button></li></ul>     
        <canvas id="chart" width="100%"></canvas>
    </div>
</div>

`;

function randomColor(){
    return "hsl(" + 360 * Math.random() + ',' +
        (25 + 70 * Math.random()) + '%,' +
        (65 + 10 * Math.random()) + '%)';
}

class Stats extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(layout.content.cloneNode(true));
    }

    _generalOverviewChart(savedTasks) {
        if(this._chart){
            this._chart.destroy();
        }
        let labels = [];
        let arraySizes = [];
        for (let taskName in savedTasks) {
            labels.push(taskName);
            arraySizes.push(savedTasks[taskName].length);
        }
        let ctx = this.shadowRoot.getElementById("chart");
        this._chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data: arraySizes,
                    backgroundColor: randomColor(),
                    hoverBackgroundColor: "rgba(0, 0, 0, 0.2)"
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Frequency",
                    position: "top"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    __makeDataset(_label, _data) {
        return {
            label: _label,
            data: _data,
            borderColor: randomColor(),
            hoverBackgroundColor: "rgba(0, 0, 0, 0.2)",
            fill: false
        }

    }

    __groupByMonth(tasks) {
        let datasets = [];
        for (let label in tasks) {
            let data = [];
            let taskAmountInMonth = {};
            for(let i=0; i < 12; i++){
                taskAmountInMonth[monthName[`${i}`]] = 0;
            }

            for (let id in tasks[label]) {
                let task = new Task(null, tasks[label][id]);
                let month = monthName[`${moment(task.startDate).month()}`];
                taskAmountInMonth[month]++;
            }

            console.log(taskAmountInMonth);
            let dataArray = [];
            for (let monthNum in taskAmountInMonth) {
                let month = monthName[`${monthNum}`];
                dataArray.push(taskAmountInMonth[`${monthNum}`]);
            }
            datasets.push(this.__makeDataset(label, dataArray))
        }
        console.log(datasets);
        return datasets;
    }


    __monthlyOverviewChart(tasks) {
        if(this._chart){
            this._chart.destroy();
        }
        let ctx = this.shadowRoot.getElementById("chart");
        let datasets = this.__groupByMonth(tasks);
        this._chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Semptember', 'October', 'November', 'December'],
                datasets:datasets
            },
            options: {
                responsive: true,
                labels: {
                    display: true
                },
                x: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                },
                y: {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }
            }
        });
    }

    _chartFactory(type) {
        if (type) {
            TaskDAO.build().then(
                openedDB => {
                    openedDB.getAll(true).then(
                        tasks => {
                            console.log("TASKS:");
                            console.log(tasks);
                            switch (type) {
                                case GENERAL_OVERVIEW:
                                    //UI UPDATE
                                    this._generalBtn.classList.add("selected");
                                    this._monthlyBtn.classList.remove("selected");
                                    this._generalOverviewChart(tasks);
                                    break;
                                case MONTHLY_OVERVIEW:
                                    //UI UPDATE
                                    this._generalBtn.classList.remove("selected");
                                    this._monthlyBtn.classList.add("selected");
                                    this.__monthlyOverviewChart(tasks);
                                    break;
                            }
                        },
                        error => console.error(error)
                    )
                },
                error => console.error(error)
            )
        }
    }

    connectedCallback() {
        this._chartFactory(GENERAL_OVERVIEW);
        this._generalBtn = this.shadowRoot.querySelector("#generalBtn");
        this._monthlyBtn = this.shadowRoot.querySelector("#monthlyBtn");
        this._generalBtn.addEventListener('click', () =>{ console.log("GEN"); this._chartFactory(GENERAL_OVERVIEW)});
        this._monthlyBtn.addEventListener('click', () => {console.log("MONT");this._chartFactory(MONTHLY_OVERVIEW)});
        this._deleteDBBtn = this.shadowRoot.querySelector("#btnDropDB");
        this._deleteDBBtn.addEventListener('click', () => this._deleteDB());
    }

    onAfterEnter(context) {
        console.log(context);
        context.pathname = "";
    }
    _removeFromChart(){
        this._chart.data.labels = [];
        this._chart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
        this._chart.update();

    }
    _deleteDB(){
        TaskDAO.build().then(
            openedDB => {
                openedDB.clearTasks().then(
                    result => this._removeFromChart(),
                    error => console.error(error)
                )
            },
            error => console.error(error)
        );
    }

}

customElements.define("tasksauce-stats", Stats);