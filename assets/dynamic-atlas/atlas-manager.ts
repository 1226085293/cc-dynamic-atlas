import { EDITOR } from "cc/env";
import { Atlas } from "./atlas";
import * as cc from "cc";

export class DynamicAtlasManager extends cc.System {
	public static instance: DynamicAtlasManager;

	private _atlases: Atlas[] = [];
	private _atlasIndex = -1;

	private _maxAtlasCount = 5;
	private _textureSize = 2048;
	private _maxFrameSize = 512;
	private _textureBleeding = true;

	private _enabled = false;
	/** 当前更新 label 的 SpriteFrame */
	currentUpdatedLabelSpriteFrame: cc.SpriteFrame;

	/**
	 * @en
	 * Enable or disable the dynamic atlas.
	 *
	 * @zh
	 * 开启或关闭动态图集。
	 */
	get enabled() {
		return this._enabled;
	}
	set enabled(value) {
		if (this._enabled === value) return;

		if (value) {
			this.reset();
			cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.beforeSceneLoad, this);
		} else {
			this.reset();
			cc.director.off(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, this.beforeSceneLoad, this);
		}

		this._enabled = value;
	}

	/**
	 * @en
	 * The maximum number of atlases that can be created.
	 *
	 * @zh
	 * 可以创建的最大图集数量。
	 */
	get maxAtlasCount() {
		return this._maxAtlasCount;
	}
	set maxAtlasCount(value) {
		this._maxAtlasCount = value;
	}

	/**
	 * @en
	 * Get the current created atlas count.
	 *
	 * @zh
	 * 获取当前已经创建的图集数量。
	 */
	get atlasCount() {
		return this._atlases.length;
	}

	/**
	 * @en
	 * Whether to enable textureBleeding.
	 *
	 * @zh
	 * 是否开启 textureBleeding。
	 */
	get textureBleeding() {
		return this._textureBleeding;
	}
	set textureBleeding(enable) {
		this._textureBleeding = enable;
	}

	/**
	 * @en
	 * The size of the created atlas.
	 *
	 * @zh
	 * 创建的图集的宽高。
	 */
	get textureSize() {
		return this._textureSize;
	}
	set textureSize(value) {
		this._textureSize = value;
	}

	/**
	 * @en
	 * The maximum size of the picture that can be added to the atlas.
	 *
	 * @zh
	 * 可以添加进图集的图片的最大尺寸。
	 */
	get maxFrameSize() {
		return this._maxFrameSize;
	}
	set maxFrameSize(value) {
		this._maxFrameSize = value;
	}

	private newAtlas() {
		let atlas = this._atlases[++this._atlasIndex];
		if (!atlas) {
			atlas = new Atlas(this._textureSize, this._textureSize);
			this._atlases.push(atlas);
		}
		return atlas;
	}

	private beforeSceneLoad() {
		this.reset();
	}

	/**
	 * @internal
	 */
	public init() {
		this.enabled = !cc.macro.CLEANUP_IMAGE_CACHE;
	}

	/**
	 * @en
	 * Append a sprite frame into the dynamic atlas.
	 *
	 * @zh
	 * 添加碎图进入动态图集。
	 *
	 * @method insertSpriteFrame
	 * @param spriteFrame  the sprite frame that will be inserted in the atlas.
	 */
	public insertSpriteFrame(spriteFrame) {
		if (EDITOR && !cc["GAME_VIEW"]) return null;
		if (!this._enabled || this._atlasIndex === this._maxAtlasCount || !spriteFrame || spriteFrame._original) return null;

		if (!spriteFrame.packable) return null;

		// hack for pixel game,should pack to different sampler atlas
		const sampler = spriteFrame.texture.getSamplerInfo();
		if (sampler.minFilter !== cc.gfx.Filter.LINEAR || sampler.magFilter !== cc.gfx.Filter.LINEAR || sampler.mipFilter !== cc.gfx.Filter.NONE) {
			return null;
		}

		let atlas = this._atlases[this._atlasIndex];
		if (!atlas) {
			atlas = this.newAtlas();
		}

		const frame = atlas.insertSpriteFrame(spriteFrame);
		if (!frame && this._atlasIndex !== this._maxAtlasCount) {
			atlas = this.newAtlas();
			return atlas.insertSpriteFrame(spriteFrame);
		}
		return frame;
	}

	/**
	 * @en
	 * Reset all dynamic atlases, and all existing ones will be destroyed.
	 *
	 * @zh
	 * 重置所有动态图集，已有的动态图集会被销毁。
	 *
	 * @method reset
	 */
	public reset() {
		for (let i = 0, l = this._atlases.length; i < l; i++) {
			this._atlases[i].destroy();
		}
		this._atlases.length = 0;
		this._atlasIndex = -1;
	}

	/**
	 * @en
	 * Delete a sprite from the atlas.
	 *
	 * @zh
	 * 从动态图集中删除某张碎图。
	 *
	 * @method deleteAtlasSpriteFrame
	 * @param spriteFrame  the sprite frame that will be removed from the atlas.
	 */
	public deleteAtlasSpriteFrame(spriteFrame) {
		if (!spriteFrame._original) return;

		let atlas;
		for (let i = this._atlases.length - 1; i >= 0; i--) {
			atlas = this._atlases[i];
			cc.js.array.fastRemove(atlas._innerSpriteFrames, spriteFrame);
		}
		const texture = spriteFrame._original._texture;
		this.deleteAtlasTexture(texture);
	}

	/**
	 * @en
	 * Delete a texture from the atlas.
	 *
	 * @zh
	 * 从动态图集中删除某张纹理。
	 *
	 * @method deleteAtlasTexture
	 * @param texture  the texture that will be removed from the atlas.
	 */
	public deleteAtlasTexture(texture) {
		if (texture) {
			for (let i = this._atlases.length - 1; i >= 0; i--) {
				this._atlases[i].deleteInnerTexture(texture);

				if (this._atlases[i].isEmpty()) {
					this._atlases[i].destroy();
					this._atlases.splice(i, 1);
					this._atlasIndex--;
				}
			}
		}
	}

	/**
	 * @en
	 * Pack the sprite in the dynamic atlas and update the atlas information of the sprite frame.
	 *
	 * @zh
	 * 将图片打入动态图集，并更新该图片的图集信息。
	 *
	 * @method packToDynamicAtlas
	 * @param frame  the sprite frame that will be packed in the dynamic atlas.
	 */
	public packToDynamicAtlas(comp: cc.UIRenderer, frame: any) {
		if ((EDITOR && !cc["GAME_VIEW"]) || !this._enabled) return;

		if (frame && !frame._original && frame.packable && frame.texture && frame.texture.width > 0 && frame.texture.height > 0) {
			// label 处理（需添加判断是否能合图）
			if (comp instanceof cc.Label) {
				let texture = frame.texture as cc.Texture2D;
				let rect = cc.rect();

				texture["__oldUploadData"] = texture.uploadData;
				texture.uploadData = function (...args_as: any[]) {
					// 更新渲染数据
					texture["__oldUploadData"].call(this, ...args_as);

					// 重新合图
					projectDynamicAtlasManager.deleteAtlasTexture(texture);
					projectDynamicAtlasManager.currentUpdatedLabelSpriteFrame = frame;
					packedFrame = projectDynamicAtlasManager.insertSpriteFrame(frame);

					// 保存原始数据
					frame._original = {
						_texture: frame._texture,
						_x: frame._rect.x,
						_y: frame._rect.y,
					};

					// 赋值合图
					frame._texture = packedFrame.texture;
					// 重置包围盒
					frame._rect.set(packedFrame.x, packedFrame.y, args_as[0].width, args_as[0].height);

					// 防止 ttfUtils._uploadTexture 中还原
					rect.set(frame.rect);
					let oldCalculateUV = frame._calculateUV;
					frame._calculateUV = function (...args_as: any[]) {
						frame._rect.set(rect);
						oldCalculateUV.call(this, ...args_as);
						frame._calculateUV = oldCalculateUV;
					};
				};
			}

			let packedFrame = this.insertSpriteFrame(frame);
			if (packedFrame) {
				// 设置动态合图
				frame._setDynamicAtlasFrame(packedFrame);
			}
		}
	}
}

export const projectDynamicAtlasManager: DynamicAtlasManager = (DynamicAtlasManager.instance = new DynamicAtlasManager());

cc.director.registerSystem("projectDynamicAtlasManager", projectDynamicAtlasManager, 0);
