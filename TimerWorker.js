
self.onmessage = ('message', (event) =>{
    console.log("WORKER:");
    console.log(event.data);
    let cmd = event.data;
    if(cmd === "START"){
        self._interval = setInterval(() => {
            postMessage("tick");
        }, 1000);
    } else if(cmd === "STOP"){
        console.log("SELF KILLING");
        self.close();
    }

});