"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lib_file_ = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lib_byte_1 = __importDefault(require("./lib_byte"));
const lib_log_1 = __importDefault(require("./lib_log"));
const lib_string_extend_1 = __importDefault(require("./lib_string_extend"));
class lib_file {
    constructor() {
        this._log = new lib_log_1.default("lib_file");
    }
    /* ------------------------------- 功能 ------------------------------- */
    /**保证目录存在 */
    _ensure_path_exists(path_s_) {
        let path_ss = path_1.default.resolve(path_s_).split(path_1.default.sep);
        let curr_path_s = "";
        path_ss.forEach((v_s) => {
            curr_path_s += v_s + path_1.default.sep;
            if (!fs_1.default.existsSync(curr_path_s)) {
                fs_1.default.mkdirSync(curr_path_s);
            }
        });
    }
    /**搜索文件/目录 */
    _search(path_s_, match_, config_, result_ss_) {
        if (!fs_1.default.existsSync(path_s_)) {
            return result_ss_;
        }
        if (fs_1.default.statSync(path_s_).isDirectory()) {
            // 排除路径
            if (config_.exclude_ss.includes(path_s_)) {
                return result_ss_;
            }
            // 匹配规则
            if (lib_byte_1.default.get_bit(config_.type_n, lib_file_.file_type.dir)) {
                if (path_s_.match(match_)) {
                    result_ss_.push(path_s_);
                }
            }
            // 遍历文件夹
            fs_1.default.readdirSync(path_s_).forEach((v_s) => {
                this._search(path_1.default.resolve(path_s_, v_s), match_, config_, result_ss_);
            });
        }
        else if (lib_byte_1.default.get_bit(config_.type_n, lib_file_.file_type.file)) {
            // 排除路径
            if (config_.exclude_ss.includes(path_s_)) {
                return result_ss_;
            }
            // 匹配规则
            if (path_s_.match(match_)) {
                result_ss_.push(path_s_);
            }
        }
        return result_ss_;
    }
    /**删除文件/目录 */
    _del(path_s_, config_) {
        // 如果是排除目录和不存在的目录则退出
        if (config_.exclude_ss.includes(path_s_) || !fs_1.default.existsSync(path_s_)) {
            return;
        }
        if (fs_1.default.statSync(path_s_).isDirectory()) {
            /**当前路径 */
            let curr_path_s;
            // 遍历文件夹
            fs_1.default.readdirSync(path_s_).forEach((v_s) => {
                curr_path_s = path_1.default.resolve(path_s_, v_s);
                this._del(curr_path_s, config_);
            });
            // 删除空文件夹
            if (!config_.exclude_ss.filter((v_s) => v_s.startsWith(path_s_)).length) {
                fs_1.default.rmdirSync(path_s_);
            }
        }
        else {
            fs_1.default.unlinkSync(path_s_);
        }
    }
    /**搜索文件/目录 */
    search(root_s_, match_, config_ = new lib_file_.search_config()) {
        let config = new lib_file_.search_config(config_);
        config.exclude_ss = config.exclude_ss.map((v_s) => path_1.default.resolve(v_s));
        return this._search(path_1.default.resolve(root_s_), match_, config, []);
    }
    /**拷贝文件/目录 */
    copy(input_s_, output_s_) {
        // 安检
        if (!fs_1.default.existsSync(input_s_)) {
            return;
        }
        if (fs_1.default.statSync(input_s_).isDirectory()) {
            if (!fs_1.default.existsSync(output_s_)) {
                this._ensure_path_exists(output_s_);
            }
            fs_1.default.readdirSync(input_s_).forEach((v_s) => {
                this.copy(path_1.default.resolve(input_s_, v_s), path_1.default.resolve(output_s_, v_s));
            });
        }
        else {
            let output_dir_s = output_s_.slice(0, output_s_.lastIndexOf(path_1.default.sep));
            if (!fs_1.default.existsSync(output_dir_s)) {
                this._ensure_path_exists(output_dir_s);
            }
            fs_1.default.copyFileSync(input_s_, output_s_);
        }
    }
    /**删除文件/目录 */
    del(path_s_, config_ = new lib_file_.del_config()) {
        let config = new lib_file_.del_config(config_);
        config.exclude_ss = config.exclude_ss.map((v_s) => path_1.default.resolve(v_s));
        return this._del(path_1.default.resolve(path_s_), config);
    }
    /**添加文件/目录 */
    add(path_s_, content_s_) {
        let path_s = path_1.default.normalize(path_s_);
        this._ensure_path_exists(path_1.default.dirname(path_s));
        return new Promise((resolve_f) => {
            fs_1.default.writeFile(path_s, content_s_, (err) => {
                resolve_f(err);
                if (err) {
                    return;
                }
                if (!path_s.startsWith(Editor.Project.path)) {
                    return;
                }
                // 刷新文件
                Editor.Message.send("asset-db", "refresh-asset", lib_string_extend_1.default.fs_path_to_db_path(path_s));
            });
        });
    }
    /**
     * 计算导入路径
     * @param export_s_ 导入路径
     * @param current_s 当前路径
     * @returns
     */
    export_path(export_s_, current_s) {
        // 格式转换
        export_s_ = export_s_.replace(/\\/g, "/").slice(0, export_s_.lastIndexOf("."));
        current_s = current_s.replace(/\\/g, "/");
        // 准备参数
        let temp_s = "./";
        let temp_n, temp2_n;
        let temp_ss = export_s_.split("/");
        let temp2_ss = current_s.split("/");
        // 路径转换
        for (temp2_n = 0; temp2_n < temp_ss.length; ++temp2_n) {
            if (temp_ss[temp2_n] != temp2_ss[temp2_n]) {
                break;
            }
        }
        for (temp_n = temp2_n + 1; temp_n < temp2_ss.length; ++temp_n) {
            temp_s += "../";
        }
        for (temp_n = temp2_n; temp_n < temp_ss.length; ++temp_n) {
            temp_s += `${temp_ss[temp_n]}/`;
        }
        temp_s = temp_s.slice(0, temp_s.length - 1);
        return temp_s;
    }
}
var lib_file_;
(function (lib_file_) {
    let file_type;
    (function (file_type) {
        file_type[file_type["dir"] = 1] = "dir";
        file_type[file_type["file"] = 2] = "file";
    })(file_type = lib_file_.file_type || (lib_file_.file_type = {}));
    class search_config {
        constructor(init_) {
            /**搜索类型 */
            this.type_n = lib_file_.file_type.dir | lib_file_.file_type.file;
            /**排除路径 */
            this.exclude_ss = [];
            Object.assign(this, init_);
        }
    }
    lib_file_.search_config = search_config;
    class del_config {
        constructor(init_) {
            /**排除路径 */
            this.exclude_ss = [];
            Object.assign(this, init_);
        }
    }
    lib_file_.del_config = del_config;
})(lib_file_ = exports.lib_file_ || (exports.lib_file_ = {}));
exports.default = new lib_file();
