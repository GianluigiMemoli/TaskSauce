
self.onmessage = ('message', (event) =>{
    console.log("WORKER:");
    console.log(event.data);
    let cmd = event.data[0];
    if(cmd === "START"){
        let progressStep = event.data[2];
        let progressValue = event.data[1];
        self._interval = setInterval(() => {
            if (progressValue - progressStep < 0){
                progressValue = 0;
            }
            else {
                progressValue -= progressStep;
            }
            console.log(progressValue);
            postMessage(progressValue);
        }, 1000);
    } else if(cmd === "STOP"){
        console.log("SELF KILLING");
        self.close();
    }

});