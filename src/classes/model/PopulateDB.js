const Task = require("./Task.js").task;
const moment = require("moment");

/* This module's purpose is to have a population in the indexed db, to understand better the the chart's job */

function populate(saveCallback){

    let fromMAR = moment("10/03/2020","DD/MM/YYYY");
    for(let i=0; i < 10; i++){
        //Make 5 standard duration tasks
        //console.log("save?");
        let fakeTask = new Task("less_done_from_MAR");
        fakeTask.startDate = moment(fromMAR.add(1, "d"));
        //console.log(fakeTask.startDate);
        saveCallback(fakeTask)
    }

    let fromFEB = moment("01/02/2020","DD/MM/YYYY");
    let increasingDensityCounter = 0;
    for(let i=0; i < 60; i++){
        //Make 5 standard< duration tasks
        let fakeTask = new Task("almost_from_feb");
        fakeTask.startDate = moment(fromFEB.add(1, "d"));
        saveCallback(fakeTask);
        increasingDensityCounter++;
        if(increasingDensityCounter === 3){
            for(let j = 0 ; j < 5; j++){
                saveCallback(fakeTask);
            }
            increasingDensityCounter = 0;
        }
    }

    let fromGEN = moment("01/01/2020","DD/MM/YYYY");
    for(let i=0; i < 260; i++){
        //Make 5 standard< duration tasks
        let fakeTask = new Task("most_done_from_GEN");
        fakeTask.startDate = moment(fromGEN.add(1, "d"));
        saveCallback(fakeTask)
    }


    for(let i=0; i < 30; i++){
        //Make 5 standard< duration tasks
        let fakeTask = new Task("meanly_done_from_NOW");
        fakeTask.startDate = moment();
        saveCallback(fakeTask)
    }
    
}

export const populateDB = populate;