
import GameCtrl from "../controller/GameCtrl";
import { DebugSettings } from "../util/DebugSettings";
import Ball from "../view/Ball";
import Utils from "../util/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default abstract class BasePage extends cc.Component {

    protected gameCtrl:GameCtrl = undefined;

    start () {
        this.gameCtrl = GameCtrl.instance;
    }

    public split(ball:Ball):boolean {
        const num = ball.ballNum;
        if(!Utils.isPrime(num)){
            this.addScore(num);
            return true;
        }
        this.subScore(num);
        return false;
    }

    public touch(ball:Ball):boolean{
        const num = ball.ballNum;
        if(Utils.isPrime(num)){
            this.addScore(num);
            return true;
        }
        this.subScore(num);
        return false;
    }

    protected addScore(score:number){
        // todo 不同页面可能不同的逻辑处理
        this.gameCtrl.addScore(score);
    }

    protected subScore(score:number){
        // todo 不同页面可能不同的逻辑处理
        const retScore = -score;
        this.gameCtrl.addScore(retScore);
    }

    public abstract renovete();
}
