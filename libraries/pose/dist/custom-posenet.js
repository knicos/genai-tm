"use strict";
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
exports.loadFromFiles = exports.load = exports.loadPoseNet = exports.CustomPoseNet = exports.getTopKClasses = void 0;
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
var tf = require("@tensorflow/tfjs");
var posenet = require("@tensorflow-models/posenet");
var util_1 = require("@tensorflow-models/posenet/dist/util");
var version_1 = require("./version");
var posenet_1 = require("@tensorflow-models/posenet");
var MAX_PREDICTIONS = 3;
/**
 * Receives a Metadata object and fills in the optional fields such as timeStamp
 * @param data a Metadata object
 */
var fillMetadata = function (data) {
    // util.assert(
    // 	typeof data.tfjsVersion === "string",
    // 	() => `metadata.tfjsVersion is invalid`
    // );
    data.packageVersion = data.packageVersion || version_1.version;
    data.packageName = '@teachablemachine/pose';
    data.timeStamp = data.timeStamp || new Date().toISOString();
    data.userMetadata = data.userMetadata || {};
    data.modelName = data.modelName || "untitled";
    data.labels = data.labels || [];
    data.modelSettings = fillConfig(data.modelSettings);
    return data;
};
// tslint:disable-next-line:no-any
var isMetadata = function (c) {
    return !!c &&
        Array.isArray(c.labels);
};
/**
 * process either a URL string or a Metadata object
 * @param metadata a url to load metadata or a Metadata object
 */
var processMetadata = function (metadata) { return __awaiter(void 0, void 0, void 0, function () {
    var metadataJSON, metadataResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(typeof metadata === "string")) return [3 /*break*/, 3];
                return [4 /*yield*/, fetch(metadata)];
            case 1:
                metadataResponse = _a.sent();
                return [4 /*yield*/, metadataResponse.json()];
            case 2:
                metadataJSON = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                if (isMetadata(metadata)) {
                    metadataJSON = metadata;
                }
                else {
                    throw new Error("Invalid Metadata provided");
                }
                _a.label = 4;
            case 4: return [2 /*return*/, fillMetadata(metadataJSON)];
        }
    });
}); };
/**
 * process posenet configuration options
 * @param config a ModelSettings object
 */
var fillConfig = function (config) {
    if (config === void 0) { config = {}; }
    if (!config.posenet) {
        config.posenet = {};
    }
    config.posenet.architecture = config.posenet.architecture || 'MobileNetV1';
    config.posenet.outputStride = config.posenet.outputStride || 16;
    config.posenet.inputResolution = config.posenet.inputResolution || 257;
    config.posenet.multiplier = config.posenet.multiplier || 0.75;
    return config;
};
/**
 * Computes the probabilities of the topK classes given logits by computing
 * softmax to get probabilities and then sorting the probabilities.
 * @param logits Tensor representing the logits from MobileNet.
 * @param topK The number of top predictions to show.
 */
function getTopKClasses(labels, logits, topK) {
    if (topK === void 0) { topK = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var values;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, logits.data()];
                case 1:
                    values = _a.sent();
                    return [2 /*return*/, tf.tidy(function () {
                            topK = Math.min(topK, values.length);
                            var valuesAndIndices = [];
                            for (var i = 0; i < values.length; i++) {
                                valuesAndIndices.push({ value: values[i], index: i });
                            }
                            valuesAndIndices.sort(function (a, b) {
                                return b.value - a.value;
                            });
                            var topkValues = new Float32Array(topK);
                            var topkIndices = new Int32Array(topK);
                            for (var i = 0; i < topK; i++) {
                                topkValues[i] = valuesAndIndices[i].value;
                                topkIndices[i] = valuesAndIndices[i].index;
                            }
                            var topClassesAndProbs = [];
                            for (var i = 0; i < topkIndices.length; i++) {
                                topClassesAndProbs.push({
                                    className: labels[topkIndices[i]],
                                    probability: topkValues[i]
                                });
                            }
                            return topClassesAndProbs;
                        })];
            }
        });
    });
}
exports.getTopKClasses = getTopKClasses;
var CustomPoseNet = /** @class */ (function () {
    function CustomPoseNet(model, posenetModel, metadata) {
        this.model = model;
        this.posenetModel = posenetModel;
        this._metadata = fillMetadata(metadata);
    }
    // public model: tf.LayersModel;
    CustomPoseNet.prototype.getMetadata = function () {
        return this._metadata;
    };
    /**
     * get the model labels
     */
    CustomPoseNet.prototype.getClassLabels = function () {
        return this._metadata.labels;
    };
    /**
     * get the total number of classes existing within model
     */
    CustomPoseNet.prototype.getTotalClasses = function () {
        var output = this.model.output;
        var totalClasses = output.shape[1];
        return totalClasses;
    };
    CustomPoseNet.prototype.estimatePose = function (sample, flipHorizontal) {
        if (flipHorizontal === void 0) { flipHorizontal = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, heatmapScores, offsets, displacementFwd, displacementBwd, padding, posenetOutput, pose;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.estimatePoseOutputs(sample)];
                    case 1:
                        _a = _b.sent(), heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd, padding = _a.padding;
                        posenetOutput = this.poseOutputsToAray(heatmapScores, offsets, displacementFwd, displacementBwd);
                        return [4 /*yield*/, this.poseOutputsToKeypoints(sample, heatmapScores, offsets, displacementFwd, displacementBwd, padding, flipHorizontal)];
                    case 2:
                        pose = _b.sent();
                        return [2 /*return*/, { pose: pose, posenetOutput: posenetOutput }];
                }
            });
        });
    };
    // for multi pose
    // taken from: https://github.com/tensorflow/tfjs-models/blob/master/posenet/src/posenet_model.ts
    CustomPoseNet.prototype.estimatePoseOutputs = function (sample) {
        return __awaiter(this, void 0, void 0, function () {
            var inputResolution, _a, resized, padding, _b, heatmapScores, offsets, displacementFwd, displacementBwd;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        inputResolution = this.posenetModel.inputResolution;
                        _a = (0, util_1.padAndResizeTo)(sample, inputResolution), resized = _a.resized, padding = _a.padding;
                        return [4 /*yield*/, this.posenetModel.baseModel.predict(resized)];
                    case 1:
                        _b = _c.sent(), heatmapScores = _b.heatmapScores, offsets = _b.offsets, displacementFwd = _b.displacementFwd, displacementBwd = _b.displacementBwd;
                        resized.dispose();
                        return [2 /*return*/, { heatmapScores: heatmapScores, offsets: offsets, displacementFwd: displacementFwd, displacementBwd: displacementBwd, padding: padding }];
                }
            });
        });
    };
    CustomPoseNet.prototype.poseOutputsToAray = function (heatmapScores, offsets, displacementFwd, displacementBwd) {
        var axis = 2;
        var concat = tf.concat([heatmapScores, offsets], axis);
        var concatArray = concat.dataSync();
        concat.dispose();
        return concatArray;
    };
    CustomPoseNet.prototype.poseOutputsToKeypoints = function (input, heatmapScores, offsets, displacementFwd, displacementBwd, padding, flipHorizontal) {
        if (flipHorizontal === void 0) { flipHorizontal = false; }
        return __awaiter(this, void 0, void 0, function () {
            var config, _a, height, width, outputStride, inputResolution, _b, scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, poses, resultPoses;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = {
                            maxDetections: MAX_PREDICTIONS,
                            scoreThreshold: 0.5,
                            nmsRadius: 20
                        };
                        _a = (0, util_1.getInputTensorDimensions)(input), height = _a[0], width = _a[1];
                        outputStride = this.posenetModel.baseModel.outputStride;
                        inputResolution = this.posenetModel.inputResolution;
                        return [4 /*yield*/, (0, util_1.toTensorBuffers3D)([heatmapScores, offsets, displacementFwd, displacementBwd])];
                    case 1:
                        _b = _c.sent(), scoresBuffer = _b[0], offsetsBuffer = _b[1], displacementsFwdBuffer = _b[2], displacementsBwdBuffer = _b[3];
                        return [4 /*yield*/, (0, posenet_1.decodeMultiplePoses)(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius)];
                    case 2:
                        poses = _c.sent();
                        resultPoses = (0, util_1.scaleAndFlipPoses)(poses, [height, width], inputResolution, padding, flipHorizontal);
                        heatmapScores.dispose();
                        offsets.dispose();
                        displacementFwd.dispose();
                        displacementBwd.dispose();
                        return [2 /*return*/, resultPoses[0]];
                }
            });
        });
    };
    /**
     * Given an image element, makes a prediction through posenet returning the
     * probabilities for ALL classes.
     * @param image the image to classify
     * @param flipped whether to flip the image on X
     */
    CustomPoseNet.prototype.predict = function (poseOutput) {
        return __awaiter(this, void 0, void 0, function () {
            var embeddings, logits, values, classes, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embeddings = tf.tensor([poseOutput]);
                        logits = this.model.predict(embeddings);
                        return [4 /*yield*/, logits.data()];
                    case 1:
                        values = _a.sent();
                        classes = [];
                        for (i = 0; i < values.length; i++) {
                            classes.push({
                                className: this._metadata.labels[i],
                                probability: values[i]
                            });
                        }
                        embeddings.dispose();
                        logits.dispose();
                        return [2 /*return*/, classes];
                }
            });
        });
    };
    /**
     * Given an image element, makes a prediction through posenet returning the
     * probabilities of the top K classes.
     * @param image the image to classify
     * @param maxPredictions the maximum number of classification predictions
     */
    CustomPoseNet.prototype.predictTopK = function (poseOutput, maxPredictions) {
        if (maxPredictions === void 0) { maxPredictions = MAX_PREDICTIONS; }
        return __awaiter(this, void 0, void 0, function () {
            var embeddings, logits, topKClasses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embeddings = tf.tensor([poseOutput]);
                        logits = this.model.predict(embeddings);
                        return [4 /*yield*/, getTopKClasses(this._metadata.labels, logits, maxPredictions)];
                    case 1:
                        topKClasses = _a.sent();
                        embeddings.dispose();
                        logits.dispose();
                        return [2 /*return*/, topKClasses];
                }
            });
        });
    };
    CustomPoseNet.prototype.dispose = function () {
        this.posenetModel.dispose();
    };
    return CustomPoseNet;
}());
exports.CustomPoseNet = CustomPoseNet;
function loadPoseNet(config) {
    if (config === void 0) { config = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var posenetModel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = fillConfig(config);
                    return [4 /*yield*/, posenet.load({
                            architecture: config.posenet.architecture,
                            outputStride: config.posenet.outputStride,
                            inputResolution: config.posenet.inputResolution,
                            multiplier: config.posenet.multiplier
                        })];
                case 1:
                    posenetModel = _a.sent();
                    return [2 /*return*/, posenetModel];
            }
        });
    });
}
exports.loadPoseNet = loadPoseNet;
function load(checkpoint, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var customModel, metadataJSON, _a, posenetModel;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tf.loadLayersModel(checkpoint)];
                case 1:
                    customModel = _b.sent();
                    if (!metadata) return [3 /*break*/, 3];
                    return [4 /*yield*/, processMetadata(metadata)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = null;
                    _b.label = 4;
                case 4:
                    metadataJSON = _a;
                    return [4 /*yield*/, loadPoseNet(metadataJSON.modelSettings)];
                case 5:
                    posenetModel = _b.sent();
                    return [2 /*return*/, new CustomPoseNet(customModel, posenetModel, metadataJSON)];
            }
        });
    });
}
exports.load = load;
function loadFromFiles(json, weights, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var customModel, metadataFile, metadataJSON, _a, posenetModel;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tf.loadLayersModel(tf.io.browserFiles([json, weights]))];
                case 1:
                    customModel = _b.sent();
                    return [4 /*yield*/, new Response(metadata).json()];
                case 2:
                    metadataFile = _b.sent();
                    if (!metadata) return [3 /*break*/, 4];
                    return [4 /*yield*/, processMetadata(metadataFile)];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = null;
                    _b.label = 5;
                case 5:
                    metadataJSON = _a;
                    return [4 /*yield*/, loadPoseNet(metadataJSON.modelSettings)];
                case 6:
                    posenetModel = _b.sent();
                    return [2 /*return*/, new CustomPoseNet(customModel, posenetModel, metadataJSON)];
            }
        });
    });
}
exports.loadFromFiles = loadFromFiles;
//# sourceMappingURL=custom-posenet.js.map