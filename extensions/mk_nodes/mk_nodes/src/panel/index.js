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
const fs = __importStar(require("fs"));
const vue = __importStar(require("vue"));
const panel_config = __importStar(require("./config/panel_config"));
const panel_container = __importStar(require("./container/panel_container"));
const weak_map = new WeakMap();
const option = {
    listeners: {},
    template: fs.readFileSync(`${__dirname}/index.html`, "utf-8"),
    style: fs.readFileSync(`${__dirname}/index.css`, "utf-8"),
    $: {
        app: "#app",
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = vue.createApp({});
            // 标记自定义元素
            app.config.compilerOptions.isCustomElement = (tag_s) => tag_s.startsWith("ui-");
            // 面板容器
            app.component("container", panel_container);
            // 配置面板
            app.component("config", panel_config);
            // 挂载
            app.mount(this.$.app);
            weak_map.set(this, app);
        }
    },
    close() {
        const app = weak_map.get(this);
        if (app) {
            app.unmount();
        }
    },
};
module.exports = Editor.Panel.define(option);
