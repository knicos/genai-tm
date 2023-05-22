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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.createTeachable = exports.TeachableMobileNet = void 0;
var tf = require("@tensorflow/tfjs");
var tfjs_1 = require("@tensorflow/tfjs");
var tf_1 = require("./utils/tf");
var custom_mobilenet_1 = require("./custom-mobilenet");
var seedrandom = require("seedrandom");
var VALIDATION_FRACTION = 0.15;
// tslint:disable-next-line:no-any
var isTensor = function (c) {
    return typeof c.dataId === 'object' && typeof c.shape === 'object';
};
/**
 * Converts an integer into its one-hot representation and returns
 * the data as a JS Array.
 */
function flatOneHot(label, numClasses) {
    var labelOneHot = new Array(numClasses).fill(0);
    labelOneHot[label] = 1;
    return labelOneHot;
}
/**
 * Shuffle an array of Float32Array or Samples using Fisher-Yates algorithm
 * Takes an optional seed value to make shuffling predictable
 */
function fisherYates(array, seed) {
    var _a;
    var length = array.length;
    // need to clone array or we'd be editing original as we goo
    var shuffled = array.slice();
    for (var i = (length - 1); i > 0; i -= 1) {
        var randomIndex = void 0;
        if (seed) {
            randomIndex = Math.floor(seed() * (i + 1));
        }
        else {
            randomIndex = Math.floor(Math.random() * (i + 1));
        }
        _a = [shuffled[randomIndex], shuffled[i]], shuffled[i] = _a[0], shuffled[randomIndex] = _a[1];
    }
    return shuffled;
}
var TeachableMobileNet = /** @class */ (function (_super) {
    __extends(TeachableMobileNet, _super);
    function TeachableMobileNet(truncated, metadata) {
        var _this = _super.call(this, tf.sequential(), metadata) || this;
        // private __stopTrainingReject: (error: Error) => void;
        // Number of total samples
        _this.totalSamples = 0;
        // Array of all the examples collected
        _this.examples = [];
        // the provided model is the truncated mobilenet
        _this.truncatedModel = truncated;
        return _this;
    }
    Object.defineProperty(TeachableMobileNet.prototype, "asSequentialModel", {
        get: function () {
            return this.model;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TeachableMobileNet.prototype, "isTrained", {
        /**
         * has the teachable model been trained?
         */
        get: function () {
            return !!this.model && this.model.layers && this.model.layers.length > 2;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TeachableMobileNet.prototype, "isPrepared", {
        /**
         * has the dataset been prepared with all labels and samples processed?
         */
        get: function () {
            return !!this.trainDataset;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TeachableMobileNet.prototype, "numClasses", {
        /**
         * how many classes are in the dataset?
         */
        get: function () {
            return this._metadata.labels.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a sample of data under the provided className
     * @param className the classification this example belongs to
     * @param sample the image / tensor that belongs in this classification
     */
    // public async addExample(className: number, sample: HTMLCanvasElement | tf.Tensor) {
    TeachableMobileNet.prototype.addExample = function (className, sample) {
        return __awaiter(this, void 0, void 0, function () {
            var cap, example, activation;
            return __generator(this, function (_a) {
                cap = isTensor(sample) ? sample : (0, tf_1.capture)(sample, this._metadata.grayscale);
                example = this.truncatedModel.predict(cap);
                activation = example.dataSync();
                cap.dispose();
                example.dispose();
                // save samples of each class separately
                this.examples[className].push(activation);
                // increase our sample counter
                this.totalSamples++;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Classify an input image / Tensor with your trained model. Return all results.
     * @param image the input image / Tensor to classify against your model
     * @param topK how many of the top results do you want? defautls to 3
     */
    TeachableMobileNet.prototype.predict = function (image, flipped) {
        if (flipped === void 0) { flipped = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.model) {
                    throw new Error('Model has not been trained yet, called train() first');
                }
                return [2 /*return*/, _super.prototype.predict.call(this, image, flipped)];
            });
        });
    };
    /**
     * Classify an input image / Tensor with your trained model. Return topK results
     * @param image the input image / Tensor to classify against your model
     * @param maxPredictions how many of the top results do you want? defautls to 3
     * @param flipped whether to flip an image
     */
    TeachableMobileNet.prototype.predictTopK = function (image, maxPredictions, flipped) {
        if (maxPredictions === void 0) { maxPredictions = 10; }
        if (flipped === void 0) { flipped = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.model) {
                    throw new Error('Model has not been trained yet, called train() first');
                }
                return [2 /*return*/, _super.prototype.predictTopK.call(this, image, maxPredictions, flipped)];
            });
        });
    };
    /**
     * process the current examples provided to calculate labels and format
     * into proper tf.data.Dataset
     */
    TeachableMobileNet.prototype.prepare = function () {
        for (var classes in this.examples) {
            if (classes.length === 0) {
                throw new Error('Add some examples before training');
            }
        }
        var datasets = this.convertToTfDataset();
        this.trainDataset = datasets.trainDataset;
        this.validationDataset = datasets.validationDataset;
    };
    /**
     * Process the examples by first shuffling randomly per class, then adding
     * one-hot labels, then splitting into training/validation datsets, and finally
     * sorting one last time
     */
    TeachableMobileNet.prototype.convertToTfDataset = function () {
        // first shuffle each class individually
        // TODO: we could basically replicate this by insterting randomly
        for (var i = 0; i < this.examples.length; i++) {
            this.examples[i] = fisherYates(this.examples[i], this.seed);
        }
        // then break into validation and test datasets
        var trainDataset = [];
        var validationDataset = [];
        var _loop_1 = function (i) {
            var y = flatOneHot(i, this_1.numClasses);
            var classLength = this_1.examples[i].length;
            var numValidation = Math.ceil(VALIDATION_FRACTION * classLength);
            var numTrain = classLength - numValidation;
            var classTrain = this_1.examples[i].slice(0, numTrain).map(function (dataArray) {
                return { data: dataArray, label: y };
            });
            var classValidation = this_1.examples[i].slice(numTrain).map(function (dataArray) {
                return { data: dataArray, label: y };
            });
            trainDataset = trainDataset.concat(classTrain);
            validationDataset = validationDataset.concat(classValidation);
        };
        var this_1 = this;
        // for each class, add samples to train and validation dataset
        for (var i = 0; i < this.examples.length; i++) {
            _loop_1(i);
        }
        // finally shuffle both train and validation datasets
        trainDataset = fisherYates(trainDataset, this.seed);
        validationDataset = fisherYates(validationDataset, this.seed);
        var trainX = tf.data.array(trainDataset.map(function (sample) { return sample.data; }));
        var validationX = tf.data.array(validationDataset.map(function (sample) { return sample.data; }));
        var trainY = tf.data.array(trainDataset.map(function (sample) { return sample.label; }));
        var validationY = tf.data.array(validationDataset.map(function (sample) { return sample.label; }));
        // return tf.data dataset objects
        return {
            trainDataset: tf.data.zip({ xs: trainX, ys: trainY }),
            validationDataset: tf.data.zip({ xs: validationX, ys: validationY })
        };
    };
    /**
     * Saving `model`'s topology and weights as two files
     * (`my-model-1.json` and `my-model-1.weights.bin`) as well as
     * a `metadata.json` file containing metadata such as text labels to be
     * downloaded from browser.
     * @param handlerOrURL An instance of `IOHandler` or a URL-like,
     * scheme-based string shortcut for `IOHandler`.
     * @param config Options for saving the model.
     * @returns A `Promise` of `SaveResult`, which summarizes the result of
     * the saving, such as byte sizes of the saved artifacts for the model's
     *   topology and weight values.
     */
    TeachableMobileNet.prototype.save = function (handlerOrURL, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.model.save(handlerOrURL, config)];
            });
        });
    };
    /**
     * Train your data into a new model and join it with mobilenet
     * @param params the parameters for the model / training
     * @param callbacks provide callbacks to receive training events
     */
    TeachableMobileNet.prototype.train = function (params, callbacks) {
        if (callbacks === void 0) { callbacks = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var originalOnTrainEnd, numLabels, inputShape, inputSize, varianceScaling, optimizer, trainData, validationData, history, jointModel;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        originalOnTrainEnd = callbacks.onTrainEnd || (function () { });
                        callbacks.onTrainEnd = function (logs) {
                            if (_this.__stopTrainingResolve) {
                                _this.__stopTrainingResolve();
                                _this.__stopTrainingResolve = null;
                            }
                            originalOnTrainEnd(logs);
                        };
                        // Rest of trian function
                        if (!this.isPrepared) {
                            this.prepare();
                        }
                        numLabels = this.getLabels().length;
                        tfjs_1.util.assert(numLabels === this.numClasses, function () { return "Can not train, has ".concat(numLabels, " labels and ").concat(_this.numClasses, " classes"); });
                        inputShape = this.truncatedModel.outputs[0].shape.slice(1);
                        inputSize = tf.util.sizeFromShape(inputShape);
                        if (this.seed) {
                            varianceScaling = tf.initializers.varianceScaling({ seed: 3.14 });
                        }
                        else {
                            varianceScaling = tf.initializers.varianceScaling({});
                        }
                        this.trainingModel = tf.sequential({
                            layers: [
                                tf.layers.dense({
                                    inputShape: [inputSize],
                                    units: params.denseUnits,
                                    activation: 'relu',
                                    kernelInitializer: varianceScaling,
                                    useBias: true
                                }),
                                tf.layers.dense({
                                    kernelInitializer: varianceScaling,
                                    useBias: false,
                                    activation: 'softmax',
                                    units: this.numClasses
                                })
                            ]
                        });
                        optimizer = tf.train.adam(params.learningRate);
                        // const optimizer = tf.train.rmsprop(params.learningRate);
                        this.trainingModel.compile({
                            optimizer: optimizer,
                            // loss: 'binaryCrossentropy',
                            loss: 'categoricalCrossentropy',
                            metrics: ['accuracy']
                        });
                        if (!(params.batchSize > 0)) {
                            throw new Error("Batch size is 0 or NaN. Please choose a non-zero fraction");
                        }
                        trainData = this.trainDataset.batch(params.batchSize);
                        validationData = this.validationDataset.batch(params.batchSize);
                        return [4 /*yield*/, this.trainingModel.fitDataset(trainData, {
                                epochs: params.epochs,
                                validationData: validationData,
                                callbacks: callbacks
                            })];
                    case 1:
                        history = _a.sent();
                        jointModel = tf.sequential();
                        jointModel.add(this.truncatedModel);
                        jointModel.add(this.trainingModel);
                        this.model = jointModel;
                        optimizer.dispose(); // cleanup of memory
                        return [2 /*return*/, this.model];
                }
            });
        });
    };
    /*
     * Setup the exampls array to hold samples per class
     */
    TeachableMobileNet.prototype.prepareDataset = function () {
        for (var i = 0; i < this.numClasses; i++) {
            this.examples[i] = [];
        }
    };
    TeachableMobileNet.prototype.setLabel = function (index, label) {
        this._metadata.labels[index] = label;
    };
    TeachableMobileNet.prototype.setLabels = function (labels) {
        this._metadata.labels = labels;
        this.prepareDataset();
    };
    TeachableMobileNet.prototype.getLabel = function (index) {
        return this._metadata.labels[index];
    };
    TeachableMobileNet.prototype.getLabels = function () {
        return this._metadata.labels;
    };
    TeachableMobileNet.prototype.setName = function (name) {
        this._metadata.modelName = name;
    };
    TeachableMobileNet.prototype.getName = function () {
        return this._metadata.modelName;
    };
    TeachableMobileNet.prototype.stopTraining = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            _this.trainingModel.stopTraining = true;
            _this.__stopTrainingResolve = resolve;
            // this.__stopTrainingReject = reject;
        });
        return promise;
    };
    TeachableMobileNet.prototype.dispose = function () {
        this.trainingModel.dispose();
        _super.prototype.dispose.call(this);
    };
    /*
     * Calculate each class accuracy using the validation dataset
     */
    TeachableMobileNet.prototype.calculateAccuracyPerClass = function () {
        return __awaiter(this, void 0, void 0, function () {
            var validationXs, validationYs, batchSize, iterations, batchesX, batchesY, itX, itY, allX, allY, i, batchedXTensor, batchedXPredictionTensor, argMaxX, batchedYTensor, argMaxY, reference, predictions, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        validationXs = this.validationDataset.mapAsync(function (dataset) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, dataset.xs];
                            });
                        }); });
                        validationYs = this.validationDataset.mapAsync(function (dataset) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, dataset.ys];
                            });
                        }); });
                        batchSize = Math.min(validationYs.size, 32);
                        iterations = Math.ceil(validationYs.size / batchSize);
                        batchesX = validationXs.batch(batchSize);
                        batchesY = validationYs.batch(batchSize);
                        return [4 /*yield*/, batchesX.iterator()];
                    case 1:
                        itX = _a.sent();
                        return [4 /*yield*/, batchesY.iterator()];
                    case 2:
                        itY = _a.sent();
                        allX = [];
                        allY = [];
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < iterations)) return [3 /*break*/, 7];
                        return [4 /*yield*/, itX.next()];
                    case 4:
                        batchedXTensor = _a.sent();
                        batchedXPredictionTensor = this.trainingModel.predict(batchedXTensor.value);
                        argMaxX = batchedXPredictionTensor.argMax(1);
                        allX.push(argMaxX);
                        return [4 /*yield*/, itY.next()];
                    case 5:
                        batchedYTensor = _a.sent();
                        argMaxY = batchedYTensor.value.argMax(1);
                        allY.push(argMaxY);
                        // 3. dispose of all our tensors
                        batchedXTensor.value.dispose();
                        batchedXPredictionTensor.dispose();
                        batchedYTensor.value.dispose();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 3];
                    case 7:
                        reference = tf.concat(allY);
                        predictions = tf.concat(allX);
                        // only if we concatenated more than one tensor for preference and reference
                        if (iterations !== 1) {
                            for (i = 0; i < allX.length; i++) {
                                allX[i].dispose();
                                allY[i].dispose();
                            }
                        }
                        return [2 /*return*/, { reference: reference, predictions: predictions }];
                }
            });
        });
    };
    /*
     * optional seed for predictable shuffling of dataset
     */
    TeachableMobileNet.prototype.setSeed = function (seed) {
        this.seed = seedrandom(seed);
    };
    return TeachableMobileNet;
}(custom_mobilenet_1.CustomMobileNet));
exports.TeachableMobileNet = TeachableMobileNet;
function createTeachable(metadata, modelOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var mobilenet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, custom_mobilenet_1.loadTruncatedMobileNet)(modelOptions)];
                case 1:
                    mobilenet = _a.sent();
                    return [2 /*return*/, new TeachableMobileNet(mobilenet, metadata)];
            }
        });
    });
}
exports.createTeachable = createTeachable;
//# sourceMappingURL=teachable-mobilenet.js.map