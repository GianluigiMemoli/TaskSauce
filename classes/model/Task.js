class Task{
    constructor(name) {
        this._name = name;
        this._pomodoro = 25 * 60;
        this._breakDuration = 5 * 60;
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
