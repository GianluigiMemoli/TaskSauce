let moment = require("moment");

class Task{
    constructor(name, obj) {
        if(name && obj){
            throw "Wrong constructor usage\nFor a brand new instance set a name\nFor casting an existing instance pass null as name parameter";
        }
        if(name !== null){
            this._name = name;
            this._pomodoro = 25 * 60;
            this._breakDuration = 5 * 60;
            this._startDate = moment();
        } else if(obj !== undefined){
            Object.assign(this, obj);
        }
    }
    get name(){
        return this._name;
    }
    // in seconds
    set pomodoro(pomodoro){
        this._pomodoro = pomodoro;
    }

    get pomodoro(){
        return this._pomodoro;
    }
    // in seconds
    set breakDuration(breakDuration){
        this._breakDuration = breakDuration;
    }

    get breakDuration(){
        return this._breakDuration;
    }
    //startDate: Date
    set startDate(startDate){
        this._startDate = startDate;
    }

    get startDate(){
        return this._startDate;
    }
}

export const task = Task;
