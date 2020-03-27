import {task} from "./Task.js";
const DB_NAME = "TasksDB";
const TASK_STORE = "TaskHistory";


class TaskDAO_ {
    constructor(db) {
        this.db = db;
    }

    static async build(){
        let db = await this.openDB();
        return new TaskDAO_(db);
    }

   static openDB() {
        return new Promise(((resolve, reject) => {
            let openRequest = indexedDB.open(DB_NAME, 4);
            openRequest.onupgradeneeded = function () {
                let db = openRequest.result;
                if (!db.objectStoreNames.contains(TASK_STORE)) {
                    db.createObjectStore(TASK_STORE, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                }
                resolve(db);
            };

            openRequest.onsuccess = function () {
                let db = openRequest.result;
                //console.log("From promise\n" + db);
                //console.log("Has store:" + db.objectStoreNames.contains(TASK_STORE));
                resolve(db);
            };

            openRequest.onerror = () =>{
                reject(openRequest.error);
            };
        }));
    }

    saveTask(task){
        return new Promise(((resolve, reject) => {
            let transaction = this.db.transaction(TASK_STORE, 'readwrite');
            let objStore = transaction.objectStore(TASK_STORE);
            //console.log(`before parsing ${task.startDate}`);
            task.startDate = new Date(task.startDate);
            //console.log(`before saving ${task.startDate}`);
            let addRequest = objStore.add(task);
            addRequest.onsuccess = () => resolve("Fine");
            addRequest.onerror = () => {
                //console.log("(TDAO)Error: "+addRequest.error);
                reject(addRequest.error);
            }
        }));
    }

    clearTasks(){
        return new Promise(((resolve, reject) => {
            let transaction = this.db.transaction(TASK_STORE, 'readwrite');
            let objStore = transaction.objectStore(TASK_STORE);
            let clearRequest = objStore.clear();
            clearRequest.onsuccess = () => resolve("Fine");
            clearRequest.onerror = () => {
                //console.log("(TDAO)Error: "+clearRequest.error);
                reject(clearRequest.error);
            }
        }));
    }

    getAll(group){
        // groupBy is a parameter that given
        return new Promise(((resolve, reject) => {
            let transaction = this.db.transaction(TASK_STORE);
            let objStore = transaction.objectStore(TASK_STORE);
            let getRequest = objStore.getAll();
            getRequest.onsuccess = function () { 
                //console.log("RAW:\n" + getRequest.result);
                let results;
                if(group){
                    /*
                        Make a dictionary where the task's name is
                        the key to access to a task array, where every task has
                        that key as name.
                    */
                    results = {};
                    getRequest.result.forEach(task => {
                       if(!results.hasOwnProperty(task._name)){
                           results[task._name] = [task]
                       } else {
                           results[task._name].push(task);
                       }
                    });
                } else{
                    results = getRequest.result;
                }
                resolve(results);
            };
            getRequest.onerror = function () {
              reject(getRequest.error);
            }
        }));
    }

}
export const TaskDAO = TaskDAO_;