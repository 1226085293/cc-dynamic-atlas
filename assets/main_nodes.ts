import * as cc from "cc";
const { ccclass, property } = cc._decorator;

@ccclass("main_nodes")
class main_nodes {
	/** 合图预览 */
	@property({ displayName: "合图预览", type: cc.Node })
	merge_preview: cc.Node = null!;

	/** ScrollView */
	@property({ displayName: "ScrollView", type: cc.Node })
	list: cc.Node = null!;
}

export default main_nodes;
