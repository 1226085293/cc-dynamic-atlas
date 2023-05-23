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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const fs = __importStar(require("fs"));
const log_1 = __importDefault(require("../log"));
class string_extend {
    /* ------------------------------- 功能 ------------------------------- */
    /** 初始化 */
    init(config_) {
        this._config = new string_extend_.init_config(config_);
        this._load_prettier_config();
    }
    /** 格式化 */
    format(source_s_, option_) {
        let result_s = source_s_;
        try {
            const config = option_ !== null && option_ !== void 0 ? option_ : this._prettier_config;
            // 防止解析错误
            if (config && !config.parser) {
                config.parser = "typescript";
            }
            result_s = prettier_1.default.format(source_s_, config !== null && config !== void 0 ? config : {
                filepath: "*.ts",
            });
        }
        catch (err) {
            log_1.default.error("格式化代码失败", source_s_);
            result_s = source_s_;
        }
        return result_s;
    }
    /** 读取 prettier 配置 */
    _load_prettier_config() {
        if (!this._config.prettier_path_s) {
            return;
        }
        let config_path_s = path_1.default.join(this._config.prettier_path_s, ".prettierrc.js");
        // js 配置
        if (fs.existsSync(config_path_s)) {
            this._prettier_config = require(config_path_s);
            return;
        }
        // json 配置
        config_path_s = path_1.default.join(this._config.prettier_path_s, ".prettierrc.json");
        if (fs.existsSync(config_path_s)) {
            this._prettier_config = JSON.parse(fs.readFileSync(config_path_s, "utf-8"));
        }
    }
}
var string_extend_;
(function (string_extend_) {
    class init_config {
        constructor(init_) {
            Object.assign(this, init_);
        }
    }
    string_extend_.init_config = init_config;
})(string_extend_ || (string_extend_ = {}));
exports.default = new string_extend();
