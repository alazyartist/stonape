"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToK = void 0;
function convertToK(value) {
    return `${(parseFloat(value) / 1000).toFixed(2)}K`;
}
exports.convertToK = convertToK;
