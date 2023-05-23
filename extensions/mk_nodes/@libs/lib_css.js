"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class lib_css_extend {
    /** 动态加载 css */
    load(info_as_) {
        info_as_.forEach((v) => {
            var _a;
            let css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = v.url_s;
            for (let k2_n = 0, len_n = v.parent.children.length; k2_n < len_n; ++k2_n) {
                if (((_a = v.parent.children.item(k2_n)) === null || _a === void 0 ? void 0 : _a.outerHTML) === css.outerHTML) {
                    return;
                }
            }
            console.log("css", v.url_s);
            v.parent.appendChild.call(v.parent, css);
        });
    }
}
exports.default = new lib_css_extend();
