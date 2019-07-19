// // Copyright (C) 2019, Flickering Inc. All rights reserved.
// // Author: hongchangfu (hongchangfu@flickering.ai)

// //结束页面

// import FinishView from "../view/FinishView";
// import GameCtrl from "./GameCtrl";
// // import MySound, { AudioType } from "../MySound";
// // import RootNode, { postMessageName } from "../RootNode";

// const { ccclass, property } = cc._decorator;

// const enum Type {
//     normal = 888,
//     week = 750,
//     best = 650
// }

// @ccclass
// export default class FinishCtrl extends FinishView {
//     start() {
//         this.addEventListener();
//     }

//     /**
//      * 控制面板打开
//      * @param active 是否打开
//      */
//     public open(active: boolean) {
//         let instance = GameCtrl.instance;
//         if (!active) {
//             RootNode.instance.postMessage(postMessageName.finishBack, undefined);
//             instance.maskPanl.active = false;
//             this.node.active = false;
//             return;
//         }
//         this.node.active = true;
//         let data = RootNode.instance.userDate;
//         data.curscore = instance.Score;
//         this.setSize();
//         RootNode.instance.postMessage(postMessageName.finish, data);
//         this.node.runAction(cc.fadeIn(0.3));
//         RootNode.instance.fadeIn(0.3);
//         RootNode.instance.updateScore(instance.Score);
//         RootNode.instance.gameLog.recordAction("finish");
//         RootNode.instance.gameLog.sendAction();
//     }

//     /**
//      * 监听重玩,返回首页按键
//      */
//     private addEventListener() {
//         this.replayBtn.on("click", () => {
//             MySound.instance.playAudio(AudioType.Button);
//             GameCtrl.instance.replay();
//             //重玩开始记录游戏操作
//             RootNode.instance.gameLog.startRecorder();
//         });

//         this.homeBtn.on("click", () => {
//             MySound.instance.playAudio(AudioType.Button);
//             RootNode.instance.postMessage(postMessageName.finishBack, undefined);
//             RootNode.instance.loadScene("home");
//         })

//         this.shareBtn.on("click", () => {
//             MySound.instance.playAudio(AudioType.Button);
//             RootNode.instance.onShareBtn(1);
//         })

//         this.chartsBtn.on("click", () => {
//             MySound.instance.playAudio(AudioType.Button);
//             GameCtrl.instance.charts.open();
//         })
//     }

//     /**
//      * 设置面板高度
//      */
//     private setSize() {
//         let data = RootNode.instance.userDate;
        
//         //网络异常
//         if(data.weeknum == -1)
//         {
//             this.node.height = Type.best;
//             return;
//         }
//         let height = Type.normal
//         if (data.curscore > data.maxscore) {
//             height = Type.best;
//         } else if (data.curscore > data.maxweekscore) {
//             height = Type.week;
//         }
//         this.node.height = height;
//     }
// }