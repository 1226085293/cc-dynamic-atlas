"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_log_1 = __importDefault(require("../../@libs/lib_log"));
const config_1 = __importDefault(require("./config"));
exports.default = new lib_log_1.default(config_1.default.name_s);
