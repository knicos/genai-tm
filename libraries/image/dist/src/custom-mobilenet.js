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
exports.loadFromFiles = exports.load = exports.loadTruncatedMobileNet = exports.CustomMobileNet = exports.getTopKClasses = exports.IMAGE_SIZE = void 0;
var tf = require("@tensorflow/tfjs");
var tfjs_1 = require("@tensorflow/tfjs");
var tf_1 = require("./utils/tf");
var canvas_1 = require("./utils/canvas");
var version_1 = require("./version");
var DEFAULT_MOBILENET_VERSION = 1;
var DEFAULT_TRAINING_LAYER_V1 = 'conv_pw_13_relu';
var DEFAULT_TRAINING_LAYER_V2 = "out_relu";
var DEFAULT_ALPHA_V1 = 0.25;
var DEFAULT_ALPHA_V2 = 0.35;
exports.IMAGE_SIZE = 224;
/**
 * Receives a Metadata object and fills in the optional fields such as timeStamp
 * @param data a Metadata object
 */
var fillMetadata = function (data) {
    // util.assert(typeof data.tfjsVersion === 'string', () => `metadata.tfjsVersion is invalid`);
    data.packageVersion = data.packageVersion || version_1.version;
    data.packageName = data.packageName || '@teachablemachine/image';
    data.timeStamp = data.timeStamp || new Date().toISOString();
    data.userMetadata = data.userMetadata || {};
    data.modelName = data.modelName || 'untitled';
    data.labels = data.labels || [];
    data.imageSize = data.imageSize || exports.IMAGE_SIZE;
    return data;
};
// tslint:disable-next-line:no-any
var isMetadata = function (c) {
    return !!c && Array.isArray(c.labels);
};
var isAlphaValid = function (version, alpha) {
    if (version === 1) {
        if (alpha !== 0.25 && alpha !== 0.5 && alpha !== 0.75 && alpha !== 1) {
            console.warn("Invalid alpha. Options are: 0.25, 0.50, 0.75 or 1.00.");
            console.log("Loading model with alpha: ", DEFAULT_ALPHA_V1.toFixed(2));
            return DEFAULT_ALPHA_V1;
        }
    }
    else {
        if (alpha !== 0.35 && alpha !== 0.5 && alpha !== 0.75 && alpha !== 1) {
            console.warn("Invalid alpha. Options are: 0.35, 0.50, 0.75 or 1.00.");
            console.log("Loading model with alpha: ", DEFAULT_ALPHA_V2.toFixed(2));
            return DEFAULT_ALPHA_V2;
        }
    }
    return alpha;
};
var parseModelOptions = function (options) {
    options = options || {};
    if (options.checkpointUrl && options.trainingLayer) {
        if (options.alpha || options.version) {
            console.warn("Checkpoint URL passed to modelOptions, alpha options are ignored");
        }
        return [options.checkpointUrl, options.trainingLayer];
    }
    else {
        options.version = options.version || DEFAULT_MOBILENET_VERSION;
        if (options.version === 1) {
            options.alpha = options.alpha || DEFAULT_ALPHA_V1;
            options.alpha = isAlphaValid(options.version, options.alpha);
            console.log("Loading mobilenet ".concat(options.version, " and alpha ").concat(options.alpha));
            // exception is alpha of 1 can only be 1.0
            var alphaString = options.alpha.toFixed(2);
            if (alphaString === "1.00") {
                alphaString = "1.0";
            }
            return [
                // tslint:disable-next-line:max-line-length        
                "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_".concat(alphaString, "_").concat(exports.IMAGE_SIZE, "/model.json"),
                DEFAULT_TRAINING_LAYER_V1
            ];
        }
        else if (options.version === 2) {
            options.alpha = options.alpha || DEFAULT_ALPHA_V2;
            options.alpha = isAlphaValid(options.version, options.alpha);
            console.log("Loading mobilenet ".concat(options.version, " and alpha ").concat(options.alpha));
            return [
                // tslint:disable-next-line:max-line-length        
                "https://storage.googleapis.com/teachable-machine-models/mobilenet_v2_weights_tf_dim_ordering_tf_kernels_".concat(options.alpha.toFixed(2), "_").concat(exports.IMAGE_SIZE, "_no_top/model.json"),
                DEFAULT_TRAINING_LAYER_V2
            ];
        }
        else {
            throw new Error("MobileNet V".concat(options.version, " doesn't exist"));
        }
    }
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
                if (!(typeof metadata === 'string')) return [3 /*break*/, 3];
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
                    throw new Error('Invalid Metadata provided');
                }
                _a.label = 4;
            case 4: return [2 /*return*/, fillMetadata(metadataJSON)];
        }
    });
}); };
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
var CustomMobileNet = /** @class */ (function () {
    function CustomMobileNet(model, metadata) {
        this.model = model;
        this._metadata = fillMetadata(metadata);
    }
    Object.defineProperty(CustomMobileNet, "EXPECTED_IMAGE_SIZE", {
        get: function () {
            return exports.IMAGE_SIZE;
        },
        enumerable: false,
        configurable: true
    });
    CustomMobileNet.prototype.getMetadata = function () {
        return this._metadata;
    };
    /**
     * get the total number of classes existing within model
     */
    CustomMobileNet.prototype.getTotalClasses = function () {
        var output = this.model.output;
        var totalClasses = output.shape[1];
        return totalClasses;
    };
    /**
     * get the model labels
     */
    CustomMobileNet.prototype.getClassLabels = function () {
        return this._metadata.labels;
    };
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities of the top K classes.
     * @param image the image to classify
     * @param maxPredictions the maximum number of classification predictions
     */
    CustomMobileNet.prototype.predictTopK = function (image, maxPredictions, flipped) {
        if (maxPredictions === void 0) { maxPredictions = 10; }
        if (flipped === void 0) { flipped = false; }
        return __awaiter(this, void 0, void 0, function () {
            var croppedImage, logits, classes;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        croppedImage = (0, canvas_1.cropTo)(image, this._metadata.imageSize, flipped);
                        logits = tf.tidy(function () {
                            var captured = (0, tf_1.capture)(croppedImage, _this._metadata.grayscale);
                            return _this.model.predict(captured);
                        });
                        return [4 /*yield*/, getTopKClasses(this._metadata.labels, logits, maxPredictions)];
                    case 1:
                        classes = _a.sent();
                        (0, tfjs_1.dispose)(logits);
                        return [2 /*return*/, classes];
                }
            });
        });
    };
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities for ALL classes.
     * @param image the image to classify
     * @param flipped whether to flip the image on X
     */
    CustomMobileNet.prototype.predict = function (image, flipped) {
        if (flipped === void 0) { flipped = false; }
        return __awaiter(this, void 0, void 0, function () {
            var croppedImage, logits, values, classes, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        croppedImage = (0, canvas_1.cropTo)(image, this._metadata.imageSize, flipped);
                        logits = tf.tidy(function () {
                            var captured = (0, tf_1.capture)(croppedImage, _this._metadata.grayscale);
                            return _this.model.predict(captured);
                        });
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
                        (0, tfjs_1.dispose)(logits);
                        return [2 /*return*/, classes];
                }
            });
        });
    };
    CustomMobileNet.prototype.dispose = function () {
        this.truncatedModel.dispose();
    };
    return CustomMobileNet;
}());
exports.CustomMobileNet = CustomMobileNet;
/**
 * load the base mobilenet model
 * @param modelOptions options determining what model to load
 */
function loadTruncatedMobileNet(modelOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, checkpointUrl, trainingLayer, mobilenet, layer, truncatedModel, model, layer, truncatedModel, model;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = parseModelOptions(modelOptions), checkpointUrl = _a[0], trainingLayer = _a[1];
                    return [4 /*yield*/, tf.loadLayersModel(checkpointUrl)];
                case 1:
                    mobilenet = _b.sent();
                    if (modelOptions && modelOptions.version === 1) {
                        layer = mobilenet.getLayer(trainingLayer);
                        truncatedModel = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
                        model = tf.sequential();
                        model.add(truncatedModel);
                        model.add(tf.layers.flatten());
                        return [2 /*return*/, model];
                    }
                    else {
                        layer = mobilenet.getLayer(trainingLayer);
                        truncatedModel = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
                        model = tf.sequential();
                        model.add(truncatedModel);
                        model.add(tf.layers.globalAveragePooling2d({})); // go from shape [7, 7, 1280] to [1280]
                        return [2 /*return*/, model];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.loadTruncatedMobileNet = loadTruncatedMobileNet;
function load(model, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var customModel, metadataJSON, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tf.loadLayersModel(model)];
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
                    return [2 /*return*/, new CustomMobileNet(customModel, metadataJSON)];
            }
        });
    });
}
exports.load = load;
function loadFromFiles(model, weights, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var customModel, metadataFile, metadataJSON, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, tf.loadLayersModel(tf.io.browserFiles([model, weights]))];
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
                    return [2 /*return*/, new CustomMobileNet(customModel, metadataJSON)];
            }
        });
    });
}
exports.loadFromFiles = loadFromFiles;
//# sourceMappingURL=custom-mobilenet.js.map