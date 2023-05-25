import * as cc from "cc";
import main_nodes from "./main_nodes";
import { _decorator, Component, Node } from "cc";
import { projectDynamicAtlasManager } from "./dynamic-atlas/atlas-manager";
const { ccclass, property } = _decorator;

cc.dynamicAtlasManager.enabled = false;

@ccclass("main")
export class main extends Component {
	@property(main_nodes)
	nodes = new main_nodes();
	/* ------------------------------- 生命周期 ------------------------------- */
	protected start(): void {
		// 开启合图
		cc.macro.CLEANUP_IMAGE_CACHE = false;
		projectDynamicAtlasManager.enabled = true;

		this.nodes.list
			// .getComponent(cc.ScrollView)
			// .content
			.getComponentsInChildren(cc.UIRenderer)
			.forEach((v) => {
				if (v["spriteFrame"]) {
					projectDynamicAtlasManager.packToDynamicAtlas(v, v["spriteFrame"]);
					// v.updateRenderer();
				}
			});

		// 展示合图
		{
			let texture = projectDynamicAtlasManager.atlases[0].texture;
			let sprite_frame = new cc.SpriteFrame();

			sprite_frame.texture = texture;
			this.nodes.merge_preview.getComponent(cc.Sprite).spriteFrame = sprite_frame;
		}
	}
}
