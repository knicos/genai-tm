"use strict";
/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cropTo = exports.createCanvas = void 0;
var newCanvas = function () { return document.createElement('canvas'); };
function createCanvas(width, height, flipHorizontal) {
    if (width === void 0) { width = 200; }
    if (height === void 0) { height = 200; }
    if (flipHorizontal === void 0) { flipHorizontal = false; }
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    if (flipHorizontal) {
        var ctx = canvas.getContext('2d');
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
    }
    return canvas;
}
exports.createCanvas = createCanvas;
function cropTo(image, size, flipped, canvas) {
    if (flipped === void 0) { flipped = false; }
    if (canvas === void 0) { canvas = newCanvas(); }
    // image image, bitmap, or canvas
    var width = image.width;
    var height = image.height;
    // if video element
    if (image instanceof HTMLVideoElement) {
        width = image.videoWidth;
        height = image.videoHeight;
    }
    var min = Math.min(width, height);
    var scale = size / min;
    var scaledW = Math.ceil(width * scale);
    var scaledH = Math.ceil(height * scale);
    var dx = scaledW - size;
    var dy = scaledH - size;
    canvas.width = canvas.height = size;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, ~~(dx / 2) * -1, ~~(dy / 2) * -1, scaledW, scaledH);
    // canvas is already sized and cropped to center correctly
    if (flipped) {
        ctx.scale(-1, 1);
        ctx.drawImage(canvas, size * -1, 0);
    }
    return canvas;
}
exports.cropTo = cropTo;
//# sourceMappingURL=canvas.js.map