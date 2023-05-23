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
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.load = void 0;
const log_1 = __importDefault(require("./log"));
const cc = __importStar(require("cc"));
const fs = __importStar(require("fs"));
const config_1 = __importDefault(require("./config"));
const storage_1 = __importDefault(require("./storage"));
const path_1 = __importDefault(require("path"));
const lib_file_1 = __importDefault(require("../../@libs/lib_file"));
const string_extend_1 = __importDefault(require("./lib/string_extend"));
function load() {
    // 初始化本地 lib
    string_extend_1.default.init({
        prettier_path_s: Editor.Project.path,
    });
}
exports.load = load;
// export function unload(): void {}
/** 场景事件放在此处 */
exports.methods = {
    /** 场景刷新事件 */
    scene_update_fs: [],
    /** 判断基类是否一致 */
    base_class_comparison(value_, super_s_) {
        const temp = self.cc.js.getSuper(value_);
        if (!temp) {
            return false;
        }
        if (self.cc.js.getClassName(temp) === super_s_) {
            return true;
        }
        return this.base_class_comparison(temp, super_s_);
    },
    /** 查找挂载路径 */
    find_mount_path(node_) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            /** 非 cc 组件 */
            const component_as = node_.components.filter((v) => !self.cc.js.getClassName(v).startsWith("cc."));
            /** 挂载组件 */
            let mount_comp = null;
            switch (storage_1.default.data.mount_position_type) {
                case config_1.default.mount_position_type.base:
                    {
                        mount_comp =
                            (_a = component_as.find((v) => this.base_class_comparison(v.constructor, storage_1.default.data.mount_comp_base))) !== null && _a !== void 0 ? _a : null;
                    }
                    break;
                case config_1.default.mount_position_type.mark:
                    {
                        for (const v of component_as) {
                            if (v.__scriptUuid) {
                                const path_s = path_1.default.normalize((yield Editor.Message.request("asset-db", "query-path", v.__scriptUuid)));
                                if (path_s) {
                                    const content_s = fs.readFileSync(path_s, "utf-8");
                                    if (content_s === null || content_s === void 0 ? void 0 : content_s.includes(storage_1.default.data.mount_comp_mark)) {
                                        mount_comp = v;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    break;
            }
            return mount_comp;
        });
    },
    /** 获取引用节点 */
    get_nodes(root_, node_ = root_, result_as_ = []) {
        return __awaiter(this, void 0, void 0, function* () {
            /** 中断生成 */
            let break_b;
            for (const v of node_.children) {
                break_b = false;
                // 生成
                config_1.default.generate_config_as.forEach((v2) => {
                    if (v.name.match(v2.reg)) {
                        if (v2.generate_f) {
                            const generate = v2.generate_f(root_, v);
                            // 存在同名引用节点
                            if (result_as_.find((v3) => v3.name_s === generate.name_s)) {
                                log_1.default.error("存在同名引用节点", generate.node[" INFO "]);
                            }
                            else {
                                result_as_.push(v2.generate_f(root_, v));
                            }
                        }
                        // 中断
                        else {
                            break_b = true;
                        }
                    }
                });
                // 判断是否为另一个 nodes 节点
                if (!break_b) {
                    /** 非 cc 组件 */
                    const component_as = v.components.filter((v2) => !self.cc.js.getClassName(v2).startsWith("cc."));
                    for (const v2 of component_as) {
                        if (v2.__scriptUuid) {
                            const path_s = path_1.default.normalize((yield Editor.Message.request("asset-db", "query-path", v2.__scriptUuid)));
                            /** nodes 文件路径 */
                            const nodes_file_path_s = path_s.slice(0, path_s.length - 3) + storage_1.default.data.script_end_s + ".ts";
                            if (fs.existsSync(nodes_file_path_s)) {
                                break_b = true;
                            }
                        }
                    }
                }
                if (!break_b) {
                    yield this.get_nodes(root_, v, result_as_);
                }
            }
            return result_as_;
        });
    },
    /**
     * 删除生成代码
     * @param path_s_ 文件路径
     * @param content_s_ 文件内容
     * @returns
     */
    del_generate_code(path_s_, content_s_) {
        /** nodes 文件名 */
        const nodes_file_s = path_1.default.basename(path_s_, ".ts") + storage_1.default.data.script_end_s;
        // 删除脚本
        {
            const path_s = path_1.default.join(path_1.default.dirname(path_s_), nodes_file_s + ".ts");
            lib_file_1.default.del(path_s);
        }
        // 删除导入
        {
            let index_n = content_s_.indexOf(`import ${nodes_file_s} from`);
            if (index_n !== -1) {
                // 找到换行符
                index_n = Math.max(0, content_s_.lastIndexOf("\n", index_n));
                // 删除导入
                content_s_ =
                    content_s_.slice(0, index_n) +
                        content_s_.slice(content_s_.indexOf("\n", index_n) + 1);
            }
        }
        // 删除属性
        {
            /** 前缀 */
            const start_s = `(@property\\(${nodes_file_s}\\))`;
            /** 后缀 */
            const end_s = `(nodes = new ${nodes_file_s}\\(\\);)`;
            /** 匹配结果 */
            const match_result = content_s_.match(new RegExp(`${start_s}([^]*)${end_s}`));
            if (match_result) {
                /** 删除开始位置 */
                const del_start_n = content_s_.lastIndexOf("\n", match_result.index);
                /** 删除结束位置 */
                const del_end_n = match_result.index + match_result[0].length;
                content_s_ =
                    content_s_.slice(0, del_start_n) +
                        content_s_.slice(del_end_n, content_s_.length);
            }
        }
        return content_s_;
    },
    /**
     * 添加生成代码
     * @param path_s_ 文件路径
     * @param content_s_ 文件内容
     * @param mount_comp_ 挂载组件
     * @returns
     */
    add_generate_code(path_s_, content_s_, mount_comp_) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            /** 组件名 */
            const comp_name_s = self.cc.js.getClassName(mount_comp_);
            /** nodes 文件名 */
            const nodes_file_s = path_1.default.basename(path_s_, ".ts") + storage_1.default.data.script_end_s;
            /** 引用节点数据 */
            const nodes = yield this.get_nodes(mount_comp_.node);
            // 生成脚本
            {
                let nodes_script_s = fs.readFileSync(path_1.default.join(config_1.default.path_s, "res/template"), "utf-8");
                // 类名
                nodes_script_s = nodes_script_s.replace(/类名/g, nodes_file_s);
                // 属性
                nodes_script_s = nodes_script_s.replace("// 属性", nodes.map((v) => v.value_s).join("\n\n"));
                // 格式化
                nodes_script_s = string_extend_1.default.format(nodes_script_s);
                // 生成
                {
                    const path_s = path_1.default.join(path_1.default.dirname(path_s_), path_1.default.basename(path_s_, ".ts") + storage_1.default.data.script_end_s + ".ts");
                    lib_file_1.default.add(path_s, nodes_script_s);
                }
            }
            // 添加 node 导入
            {
                /** 当前导入位置 */
                const index_n = content_s_.indexOf(`import ${nodes_file_s} from`);
                // 添加
                if (index_n === -1) {
                    content_s_ = `import ${nodes_file_s} from "./${nodes_file_s}";\n` + content_s_;
                }
            }
            // 添加属性
            {
                /** 添加位置 */
                let index_n = content_s_.indexOf(storage_1.default.data.mount_comp_mark);
                // 初始化添加位置
                {
                    if (index_n === -1) {
                        const match_result = content_s_.match(new RegExp(
                        // eslint-disable-next-line no-useless-escape
                        `export( default)* class ${comp_name_s} extends (.+)( *){`));
                        index_n = (_a = match_result === null || match_result === void 0 ? void 0 : match_result.index) !== null && _a !== void 0 ? _a : -1;
                        if (index_n === -1) {
                            log_1.default.error("add_generate_code - 未找到声明添加位置");
                            return content_s_;
                        }
                        index_n += match_result[0].length;
                    }
                    else {
                        index_n += storage_1.default.data.mount_comp_mark.length;
                    }
                    index_n = content_s_.indexOf("\n", index_n);
                }
                // 添加声明
                content_s_ =
                    content_s_.slice(0, index_n) +
                        "\n" +
                        [`@property(${nodes_file_s})`, `nodes = new ${nodes_file_s}();`].join("\n") +
                        content_s_.slice(index_n);
            }
            // 属性赋值
            {
                /** 当前节点路径 */
                const node_path_s = mount_comp_.node[" INFO "].split(", path: ")[1];
                this.scene_update_fs.push({
                    valid_f: () => Boolean(cc.find(node_path_s)),
                    event_f: () => {
                        const node = cc.find(node_path_s);
                        /** 组件下标 */
                        const comp_index_n = node.components.findIndex((v) => v.name === mount_comp_.name);
                        // 更新属性列表
                        nodes.forEach((v) => {
                            // 场景刷新后 node 失效
                            Editor.Message.send("scene", "set-property", {
                                uuid: node.uuid,
                                path: `__comps__.${comp_index_n}.nodes.${v.name_s}`,
                                dump: {
                                    type: "cc.Node",
                                    value: {
                                        uuid: cc.find(v.node[" INFO "].split(", path: ")[1])
                                            .uuid,
                                    },
                                },
                            });
                        });
                    },
                });
            }
            // 格式化
            content_s_ = string_extend_1.default.format(content_s_);
            return content_s_;
        });
    },
    /** 生成节点引用 */
    generate_nodes(node_uuid_s_) {
        return __awaiter(this, void 0, void 0, function* () {
            const node = self.cce.Node.query(node_uuid_s_);
            if (!node) {
                log_1.default.error("generate_nodes - 节点未找到");
                return;
            }
            /** 挂载组件 */
            const mount_comp = yield this.find_mount_path(node);
            if (!mount_comp) {
                log_1.default.error("generate_nodes - 挂载组件不存在");
                return;
            }
            /** 挂载路径 */
            const mount_path_s = path_1.default.normalize((yield Editor.Message.request("asset-db", "query-path", mount_comp.__scriptUuid)));
            /** 挂载脚本 */
            let content_s = fs.readFileSync(mount_path_s, "utf-8");
            // 删除旧代码
            content_s = this.del_generate_code(mount_path_s, content_s);
            // 生成新代码
            content_s = yield this.add_generate_code(mount_path_s, content_s, mount_comp);
            // 保存文件
            lib_file_1.default.add(mount_path_s, content_s);
        });
    },
    /* ------------------------------- 事件 ------------------------------- */
    /** 生成代码 */
    event_generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const node_uuid_ss = Editor.Selection.getSelected("node");
            if (!node_uuid_ss.length) {
                return;
            }
            // 更新存储数据
            yield storage_1.default.update();
            // 生成节点引用
            for (const v_s of node_uuid_ss) {
                yield this.generate_nodes(v_s);
            }
            log_1.default.log("生成结束");
        });
    },
    /** 场景刷新 */
    event_scene_update() {
        // 执行事件
        this.scene_update_fs.forEach((v) => __awaiter(this, void 0, void 0, function* () {
            if (v.valid_f && !(yield v.valid_f())) {
                return;
            }
            v.event_f();
        }));
        this.scene_update_fs.splice(0, this.scene_update_fs.length);
    },
};
