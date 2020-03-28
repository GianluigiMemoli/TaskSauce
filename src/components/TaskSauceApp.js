const Router = require("@vaadin/router");
const layoutGrid = document.createElement("template");
layoutGrid.innerHTML = `
<style>
 @import "../../style/layout.css"; 
 @import "../../style/grid_behaviour.css";
 @import "../../style/typography.css";
 @import "../../node_modules/intro.js/introjs.css"
 :host{
    margin: 0;  
    display: block;     
}
 a {    
    color: white;
    font-size: 52px;        
 }
 
 #view{
        display: flex;
        align-items: center;
 }
 #navbar{    
    background: rgb(131,58,180);
    background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 0%, rgba(252,120,54,1) 100%, rgba(252,176,69,1) 100%);    
 } 

ul{ 
    margin-left: 12%;
    flex-direction: column;    
    align-self: center;
    justify-content: space-around;    
}

li{
    list-style: none;    
}

.md-36 {
    font-size: 36px !important;
}
    
@media only screen and (max-width: 800px){
    #navbar{
        display: flex;
        flex-direction: row;                
        justify-content: flex-start;
        width: 100vw;
    }
    li{
      display: inline-block;  
      margin: 0;      
    }
    #brand{
        color: #fff;
        font-size: 40px;        
    }
    ul{                
        display: flex;
        flex-shrink: 1;
        flex-direction: row;
        justify-content: space-around;
        margin: 0;
        width: 100vw;
        padding: 0;
    }
    #layout{
        height: 100vh;        
    }    
    img{
        vertical-align: middle;
    }
}
@media screen and (min-width: 801px){
#navbar{
    display: flex;
    flex-direction: column;            
    width: 50%;                        
    z-index: 12;
    justify-content: flex-start;
    
  }

#brand{    
    margin-top: 1em;
    writing-mode: vertical-lr;
    text-align: center;    
    width: auto;    
    font-size: 40px;
    color: #fff;
}
ul{
    padding: 0;
}
}

</style>
    <div id="layout" class="row-1 row-filling row-s-2-nav-layout col-2-nav-layout col-s-1 grey-box">
        <div id="navbar" class="row-s-start-1 col-start-1 col-end-1 grey-box">
            <span id="brand"  class="bold">Tasksauce</span>
            <ul>
                <li><a  href="/"><img src="../../icons/timer.svg"></a></li>
                <li><a href="/stats"><img src="../../icons/chart.svg"></a></li>
            </ul>        
        </div>        
        <div id="view" class="row-s-start-2 justify-s-center col-start-2 justify-i-center align-i-center grey-box"><slot></slot></div>                
    </div>
    

`;

class TaskSauceApp extends HTMLElement{
    constructor() {
        super();
        console.log("Constructed app");
        this.attachShadow({mode:"open"});
        this.shadowRoot.appendChild(layoutGrid.content.cloneNode(true));
        this.navbar = this.shadowRoot.querySelector("#navbar");
        this.view = this.shadowRoot.querySelector("#view");
    }
    connectedCallback(){
        console.log("Connected app");
        this._setupRoutes();
        let view = this.shadowRoot.querySelector("#view");
        view.style.height = `${screen.height}px`;
        window.addEventListener('load', () => {this._fixBrandAlignment();});

    }

    _setupRoutes(){
        let router = new Router.Router(this.view);
        router.setRoutes([
            {path: '/', component: 'tasksauce-homeview'},
            {path: '/stats', component: 'tasksauce-stats'}
        ]);
    }

    _fixBrandAlignment() {
        if (screen.width > 800) {
            let brand = this.shadowRoot.querySelector("#brand");
            let navbar = this.shadowRoot.querySelector("#navbar");
            console.log(navbar);
            let navbarWidth = window.getComputedStyle(navbar).getPropertyValue("width");
            console.log(navbarWidth);
            brand.style.lineHeight = `${navbarWidth}`;
            brand.style.marginBottom = `${navbarWidth}`;
        }
         else {
            let brand = this.shadowRoot.querySelector("#brand");
            let navbar = this.shadowRoot.querySelector("#navbar");
            let icons = this.shadowRoot.querySelectorAll("ul > li > a > img");
            console.log("icons");
            console.log(icons);
            console.log(navbar);
            let navbarHeight = window.getComputedStyle(navbar).getPropertyValue("height");
            console.log(navbarHeight);
            brand.style.lineHeight = `${navbarHeight}`;
         }
        }


}

customElements.define("tasksauce-app", TaskSauceApp);