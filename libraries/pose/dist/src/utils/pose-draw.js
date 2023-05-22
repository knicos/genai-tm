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
exports.drawSegment = exports.drawSkeleton = exports.toTuple = exports.drawPoint = exports.drawKeypoints = void 0;
var util_1 = require("@tensorflow-models/posenet/dist/util");
var FILL_COLOR = "aqua";
var STROKE_COLOR = "aqua";
var KEYPOINT_SIZE = 4;
var LINE_WIDTH = 2;
/**
 * Draw pose keypoints onto a canvas
 */
function drawKeypoints(keypoints, minConfidence, ctx, keypointSize, fillColor, strokeColor, scale) {
    if (keypointSize === void 0) { keypointSize = KEYPOINT_SIZE; }
    if (fillColor === void 0) { fillColor = FILL_COLOR; }
    if (strokeColor === void 0) { strokeColor = STROKE_COLOR; }
    if (scale === void 0) { scale = 1; }
    for (var i = 0; i < keypoints.length; i++) {
        var keypoint = keypoints[i];
        if (keypoint.score < minConfidence) {
            continue;
        }
        var _a = keypoint.position, y = _a.y, x = _a.x;
        drawPoint(ctx, y * scale, x * scale, keypointSize, fillColor, strokeColor);
    }
}
exports.drawKeypoints = drawKeypoints;
function drawPoint(ctx, y, x, keypointSize, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(x, y, keypointSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}
exports.drawPoint = drawPoint;
function toTuple(position) {
    return [position.y, position.x];
}
exports.toTuple = toTuple;
function drawSkeleton(keypoints, minConfidence, ctx, lineWidth, strokeColor, scale) {
    if (lineWidth === void 0) { lineWidth = LINE_WIDTH; }
    if (strokeColor === void 0) { strokeColor = STROKE_COLOR; }
    if (scale === void 0) { scale = 1; }
    var adjacentKeyPoints = (0, util_1.getAdjacentKeyPoints)(keypoints, minConfidence);
    adjacentKeyPoints.forEach(function (keypoints) {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), ctx, lineWidth, strokeColor, scale);
    });
}
exports.drawSkeleton = drawSkeleton;
function drawSegment(_a, _b, ctx, lineWidth, strokeColor, scale) {
    var ay = _a[0], ax = _a[1];
    var by = _b[0], bx = _b[1];
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}
exports.drawSegment = drawSegment;
//# sourceMappingURL=pose-draw.js.map