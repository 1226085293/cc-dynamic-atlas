"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
class storage {
    constructor() {
        this.data = {
            /** 定位类型 */
            mount_position_type: config_1.default.mount_position_type.mark,
            /** 定位基类 */
            mount_comp_base: "cc.Component",
            /** 定位标记 */
            mount_comp_mark: "extends Component {",
            /** 脚本名后缀 */
            script_end_s: "_nodes",
        };
        this.update();
        const data = this.data;
        this.data = new Proxy(data, {
            get: (target, key) => {
                return data[key];
            },
            set: (target, key, value) => {
                data[key] = value;
                Editor.Profile.setConfig(config_1.default.name_s, key, value);
                return true;
            },
        });
    }
    /* ------------------------------- 功能 ------------------------------- */
    /** 更新存储数据 */
    update(key_) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (key_) {
                this["data"][key_] =
                    (_a = (yield Editor.Profile.getConfig(config_1.default.name_s, key_))) !== null && _a !== void 0 ? _a : this[key_];
            }
            else {
                for (const k_s in this.data) {
                    if (typeof this.data[k_s] !== "function") {
                        this.data[k_s] =
                            (_b = (yield Editor.Profile.getConfig(config_1.default.name_s, k_s))) !== null && _b !== void 0 ? _b : this.data[k_s];
                    }
                }
            }
        });
    }
}
exports.default = new storage();
