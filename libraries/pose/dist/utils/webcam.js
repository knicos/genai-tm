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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webcam = void 0;
var autobind_decorator_1 = require("autobind-decorator");
var canvas_1 = require("./canvas");
var defaultVideoOptions = {
    facingMode: 'user',
    frameRate: 24
};
var fillConstraints = function (options) {
    options.facingMode = options.facingMode || defaultVideoOptions.facingMode;
    options.frameRate = options.frameRate || defaultVideoOptions.frameRate;
    options.aspectRatio = options.aspectRatio || defaultVideoOptions.aspectRatio;
    return options;
};
var Webcam = exports.Webcam = /** @class */ (function () {
    function Webcam(width, height, flip) {
        if (width === void 0) { width = 400; }
        if (height === void 0) { height = 400; }
        if (flip === void 0) { flip = false; }
        this.width = width;
        this.height = height;
        this.flip = flip;
    }
    Webcam.prototype.getWebcam = function (options) {
        if (options === void 0) { options = {}; }
        if (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
            return Promise.reject('Your browser does not support WebRTC. Please try another one.');
        }
        options.width = 640;
        var videoOptions = fillConstraints(options);
        var video = document.createElement('video');
        return window.navigator.mediaDevices.getUserMedia({ video: videoOptions })
            .then(function (mediaStream) {
            video.srcObject = mediaStream;
            video.addEventListener('loadedmetadata', function (event) {
                var vw = video.videoWidth, vh = video.videoHeight;
                video.width = vw;
                video.height = vh;
            });
            return video;
        }, function () {
            return Promise.reject('Could not open your camera. You may have denied access.');
        });
    };
    // setup or setupWebcam
    Webcam.prototype.setup = function (options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.webcam) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.getWebcam(options)];
                    case 1:
                        _a.webcam = _b.sent();
                        if (!this.canvas) {
                            this.canvas = document.createElement('canvas');
                            this.canvas.width = this.width;
                            this.canvas.height = this.height;
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Webcam.prototype.play = function () {
        var promise = this.webcam.play();
        return promise;
    };
    Webcam.prototype.pause = function () {
        this.webcam.pause();
    };
    Webcam.prototype.stop = function () {
        this.stopStreamedVideo(this.webcam);
    };
    Webcam.prototype.update = function () {
        this.renderCameraToCanvas();
    };
    Webcam.prototype.stopStreamedVideo = function (videoEl) {
        var stream = videoEl.srcObject;
        var tracks = stream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
        videoEl.srcObject = null;
    };
    Webcam.prototype.renderCameraToCanvas = function () {
        if (this.canvas && this.webcam) {
            var ctx = this.canvas.getContext('2d');
            if (this.webcam.videoWidth !== 0) {
                var croppedCanvas = (0, canvas_1.cropTo)(this.webcam, this.width, this.flip);
                ctx.drawImage(croppedCanvas, 0, 0);
            }
        }
    };
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "getWebcam", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "setup", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "play", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "pause", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "stop", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "update", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "stopStreamedVideo", null);
    __decorate([
        autobind_decorator_1.default
    ], Webcam.prototype, "renderCameraToCanvas", null);
    return Webcam;
}());
//# sourceMappingURL=webcam.js.map