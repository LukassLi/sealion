import BasePage from "./BasePage";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TimerPage extends BasePage {

    @property({ type: cc.Label, visible: true, displayName: "计时器" })
    public lifeCounter:cc.Label = undefined;  

    start () {
        this.lifeCounter.string = '02:00';
    }

    update(){
        if(this.lifeCounter.string == '00:00'){
            this.gameCtrl.gameOver();
        }
    }

    public renovete(){
        this.lifeCounter.string = '02:00';
    }

}
