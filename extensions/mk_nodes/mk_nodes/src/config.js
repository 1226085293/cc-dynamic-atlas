"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
var config;
(function (config) {
    /** 根节点定位类型 */
    let mount_position_type;
    (function (mount_position_type) {
        /** 固定基类 */
        mount_position_type[mount_position_type["base"] = 0] = "base";
        /** 生成标记 */
        mount_position_type[mount_position_type["mark"] = 1] = "mark";
    })(mount_position_type = config.mount_position_type || (config.mount_position_type = {}));
    /** 插件名 */
    config.name_s = "mk_nodes";
    /** 插件根目录 */
    config.root_path_s = Editor.Package.getPath(config.name_s);
    /** 插件目录 */
    config.path_s = path_1.default.resolve(__dirname, "..");
    /** 生成配置 */
    config.generate_config_as = [
        // 节点
        {
            reg: /^(\+|-\+)/g,
            generate_f: (root, node) => {
                const name_ss = node.name.slice(1).split("@");
                /** 变量名 */
                const name_s = (name_ss[1] || name_ss[0]).replace(/[^\w\u4e00-\u9fa5]/g, "_");
                /** 值 */
                let value_s = [
                    `@property({ displayName: "${name_ss[0]}", type: cc.Node })`,
                    `${name_s}: cc.Node = null!;`,
                ].join("\n");
                // 加上注释
                if (name_ss.length > 1) {
                    value_s = `/** ${name_ss[0]} */\n` + value_s;
                }
                return {
                    name_s: name_s,
                    value_s: value_s,
                    node: node,
                };
            },
        },
        // 排除子节点
        {
            reg: /^(-|\+-)/g,
        },
    ];
})(config || (config = {}));
exports.default = config;
