import PauseView from "../view/PauseView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PauseCtrl extends PauseView {

    start(){
        this.addEventListener()
    }

    private addEventListener(){

        this.btnHome.on('click',()=>{
            // TODO
        })
        this.btnReplay.on('click',()=>{
            // TODO
        })
        this.btnResume.on('click',()=>{
            // TODO
        })
    }
  
}
