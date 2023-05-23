"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("../../config"));
const storage_1 = __importDefault(require("../../storage"));
const component = {
    template: fs.readFileSync(`${__dirname}/panel_config.html`, "utf-8"),
    methods: {},
    data() {
        return Object.assign({ config_mount_position_type: config_1.default.mount_position_type }, storage_1.default.data);
    },
    watch: {
        /** 挂载定位方式 */
        mount_position_type(value) {
            storage_1.default.data.mount_position_type = Number(value);
        },
        /** 挂载组件基类 */
        mount_comp_base(value) {
            storage_1.default.data.mount_comp_base = value;
        },
        /** 挂载组件标记 */
        mount_comp_mark(value) {
            storage_1.default.data.mount_comp_mark = value;
        },
        /** 脚本名后缀 */
        script_end_s(value) {
            storage_1.default.data.script_end_s = value;
        },
    },
    created() {
        this.self = this;
    },
    mounted() {
        return __awaiter(this, void 0, void 0, function* () {
            yield storage_1.default.update();
            // 更新数据
            for (const [k_s, v] of Object.entries(storage_1.default.data)) {
                this[k_s] = v;
            }
        });
    },
};
module.exports = component;
