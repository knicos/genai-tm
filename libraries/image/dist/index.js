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
exports.version = exports.Webcam = exports.createTeachable = exports.TeachableMobileNet = exports.loadTruncatedMobileNet = exports.loadFromFiles = exports.load = exports.CustomMobileNet = exports.IMAGE_SIZE = void 0;
var custom_mobilenet_1 = require("./custom-mobilenet");
Object.defineProperty(exports, "IMAGE_SIZE", { enumerable: true, get: function () { return custom_mobilenet_1.IMAGE_SIZE; } });
Object.defineProperty(exports, "CustomMobileNet", { enumerable: true, get: function () { return custom_mobilenet_1.CustomMobileNet; } });
Object.defineProperty(exports, "load", { enumerable: true, get: function () { return custom_mobilenet_1.load; } });
Object.defineProperty(exports, "loadFromFiles", { enumerable: true, get: function () { return custom_mobilenet_1.loadFromFiles; } });
Object.defineProperty(exports, "loadTruncatedMobileNet", { enumerable: true, get: function () { return custom_mobilenet_1.loadTruncatedMobileNet; } });
var teachable_mobilenet_1 = require("./teachable-mobilenet");
Object.defineProperty(exports, "TeachableMobileNet", { enumerable: true, get: function () { return teachable_mobilenet_1.TeachableMobileNet; } });
Object.defineProperty(exports, "createTeachable", { enumerable: true, get: function () { return teachable_mobilenet_1.createTeachable; } });
var webcam_1 = require("./utils/webcam");
Object.defineProperty(exports, "Webcam", { enumerable: true, get: function () { return webcam_1.Webcam; } });
var version_1 = require("./version");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_1.version; } });
//# sourceMappingURL=index.js.map