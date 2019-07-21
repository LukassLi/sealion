import BasePage from "./BasePage";
import Ball from "../view/Ball";


const {ccclass, property} = cc._decorator;

@ccclass
export default class EndlessPage extends BasePage {

    @property({ type: cc.Label, visible: true, displayName: "生命" })
    public lifeCounter:cc.Label = undefined;  

    start () {
        this.lifeCounter.string = '5'
    }

    public renovete(){
        this.lifeCounter.string = '5'
    }

    public split(ball:Ball):boolean {
        if(!super.split(ball)){
            this.reduceLife();
            return false;
        } else {
            return true
        }
   
    }

    public touch(ball:Ball):boolean{
        if(!super.touch(ball)){
            this.reduceLife();
            return false;
        } else {
            return true
        }
    }

    private reduceLife(){
        const currentLife = Number(this.lifeCounter.string)-1;
        if(currentLife==0){
            this.gameCtrl.gameOver();
        } else {
            this.lifeCounter.string  =currentLife.toString();
        }
    }


}
