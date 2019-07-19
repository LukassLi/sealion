import GameCtrl from "../controller/GameCtrl";
import { DebugSettings } from '../util/DebugSettings';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Knife extends cc.Component {
    /** 手指触碰点与球心的位置 */
    private posOffset: cc.Vec2 = undefined;

    /** 移动结束位置 */
    private moveEnd: cc.Vec2 = undefined;

    private _lastestPos: cc.Vec2 = undefined;

    public start() {
        // this.addEventListener();
        // this._lastestPos = this.node.position;
    }

    update(dt: number) {
        // if(this.node.position != this._lastestPos){
        //     this.node.position = this._lastestPos;
        //     if(!this.node.active){
        //         this.node.active = true;
        //     }
        // } else {
        //     if(this.node.active){
        //         this.node.active = false;
        //     }
        // }
    }


    /**
     * 更新位置
     * @param touchPos 移动点的位置
     */
    public move(touchPos: cc.Vec2) {
        // const flag = cc.Intersection.pointInPolygon(touchPos, GameCtrl.instance.bottomPoints);
        // 是否超出可移动区域
        // if (flag || Math.abs(touchPos.x) > 360) {
        //     // 超出的第一个点保留,球才能移动到目标位置
        //     if (!this.moveOut) {
        //         this.moveEnd = touchPos;
        //         this.moveOut = true;
        //     }
        //     return;
        // }
        // this.posOffset = touchPos.sub(this.node.position);
        // this.moveEnd = touchPos;
        // this.updateTriggerBall();
        if(DebugSettings.debugNormal){
            console.log(`knife.pos=${this.node.position}`);
        }

        this.node.position = touchPos;

        // 鼠标移动判断刀的active
        // if(this.node.position.equals(touchPos)){
        //     return false;
        // }
        // this._lastestPos = touchPos;
        // cc.moveTo()
        if(!this.node.active){
            this.node.active = true;
        }
    }

    // /**
    //  * 选中后移动
    //  * @param dt 时间
    //  */
    // public move(dt: number) {
    //     if ( this.posOffset != undefined) {//this._slect &&
    //         const pos = this.posOffset.add(this.node.position);
    //         const speed = this.moveEnd.sub(pos);
    //         speed.mulSelf(1 / dt);
    //         // this.speed = speed;
    //     }
    // }

    /**
     * 监听点击事件
     */
    private addEventListener() {
        this.node.on(
            cc.Node.EventType.TOUCH_START,
            (e) => {
                this.onTouchStart(e);
            },
            this,
        );
    }

    /**
     * 点击触摸处理
     * @param touch 点击事件
     */
    private onTouchStart(touch: cc.Event.EventTouch) {
        // if (GameCtrl.instance.slectBall != undefined)
        //     return;
        // let pos = this.node.convertToNodeSpaceAR(touch.getLocation());
        // if (!this.judgePosOut(pos)) {
        //     this.beChoosed = true;
        // }
        // TODO 将球销毁并且生成两个球，和BallCtrl进行交互
    }
}
