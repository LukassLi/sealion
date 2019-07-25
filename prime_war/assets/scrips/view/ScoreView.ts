

const {ccclass, property} = cc._decorator;

@ccclass
export default class ScoreView extends cc.Component {

    
    @property({ type: cc.Label, visible: true, displayName: "分数" })
    private scoreLabel: cc.Label= undefined;

    start () {
        this.scoreLabel.string = '0'
    }

    public set score(score:number){
        this.scoreLabel.string = score.toString();
    }

    public get score():number{
        return Number(this.scoreLabel.string);
    }

}
