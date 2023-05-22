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
exports.version = exports.drawSegment = exports.drawPoint = exports.drawSkeleton = exports.drawKeypoints = exports.createCanvas = exports.Webcam = exports.createTeachable = exports.TeachablePoseNet = exports.loadFromFiles = exports.load = exports.CustomPoseNet = void 0;
var custom_posenet_1 = require("./custom-posenet");
Object.defineProperty(exports, "CustomPoseNet", { enumerable: true, get: function () { return custom_posenet_1.CustomPoseNet; } });
Object.defineProperty(exports, "load", { enumerable: true, get: function () { return custom_posenet_1.load; } });
Object.defineProperty(exports, "loadFromFiles", { enumerable: true, get: function () { return custom_posenet_1.loadFromFiles; } });
var teachable_posenet_1 = require("./teachable-posenet");
Object.defineProperty(exports, "TeachablePoseNet", { enumerable: true, get: function () { return teachable_posenet_1.TeachablePoseNet; } });
Object.defineProperty(exports, "createTeachable", { enumerable: true, get: function () { return teachable_posenet_1.createTeachable; } });
var webcam_1 = require("./utils/webcam");
Object.defineProperty(exports, "Webcam", { enumerable: true, get: function () { return webcam_1.Webcam; } });
var canvas_1 = require("./utils/canvas");
Object.defineProperty(exports, "createCanvas", { enumerable: true, get: function () { return canvas_1.createCanvas; } });
var pose_draw_1 = require("./utils/pose-draw");
Object.defineProperty(exports, "drawKeypoints", { enumerable: true, get: function () { return pose_draw_1.drawKeypoints; } });
Object.defineProperty(exports, "drawSkeleton", { enumerable: true, get: function () { return pose_draw_1.drawSkeleton; } });
Object.defineProperty(exports, "drawPoint", { enumerable: true, get: function () { return pose_draw_1.drawPoint; } });
Object.defineProperty(exports, "drawSegment", { enumerable: true, get: function () { return pose_draw_1.drawSegment; } });
var version_1 = require("./version");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_1.version; } });
//# sourceMappingURL=index.js.map