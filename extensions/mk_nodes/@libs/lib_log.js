"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class lib_log {
    constructor(name_s_) {
        this._name_s = name_s_;
        this._head_s = this._name_s;
    }
    /* ------------------------------- 功能函数 ------------------------------- */
    log(...args_as_) {
        console.log(`[${this._head_s}]`, ...args_as_);
    }
    warn(...args_as_) {
        console.warn(`[${this._head_s}]`, ...args_as_);
    }
    error(...args_as_) {
        console.error(`[${this._head_s}]`, ...args_as_);
    }
}
exports.default = lib_log;
