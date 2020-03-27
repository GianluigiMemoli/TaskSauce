
window.addEventListener('load',() =>{
    let bodyDOM = document.querySelector("body");
    if (screen.width <= 800){
        bodyDOM.style.overflowY = "auto";
        console.log("DONE");
    }
    window.addEventListener('resize', () => {
        console.log("RESIZE");
        console.log(`width ${screen.width}\nheight: ${screen.height}`);
    })
});


