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
import * as tf from '@tensorflow/tfjs';
import { PoseNet } from '@tensorflow-models/posenet';
import { CustomCallbackArgs } from '@tensorflow/tfjs';
import { CustomPoseNet, Metadata } from './custom-posenet';
export interface TrainingParameters {
    denseUnits: number;
    epochs: number;
    learningRate: number;
    batchSize: number;
}
export declare class TeachablePoseNet extends CustomPoseNet {
    model: tf.LayersModel;
    posenetModel: PoseNet;
    /**
     * Training and validation datasets
     */
    private trainDataset;
    private validationDataset;
    private __stopTrainingResolve;
    examples: Float32Array[][];
    private seed;
    /**
     * has the teachable model been trained?
     */
    get isTrained(): boolean;
    /**
     * has the dataset been prepared with all labels and samples processed?
     */
    get isPrepared(): boolean;
    /**
     * how many classes are in the dataset?
     */
    get numClasses(): number;
    constructor(model: tf.LayersModel, posenetModel: PoseNet, metadata: Partial<Metadata>);
    /**
     * Add a sample of data under the provided className
     * @param className the classification this example belongs to
     * @param sample the image / tensor that belongs in this classification
     */
    addExample(className: number, sample: Float32Array): Promise<void>;
    /**
     * Classify a pose output with your trained model. Return all results
     * @param image the input image / Tensor to classify against your model
     */
    predict(poseOutput: Float32Array): Promise<{
        className: string;
        probability: number;
    }[]>;
    /**
     * Classify a pose output with your trained model. Return topK results
     * @param image the input image / Tensor to classify against your model
     * @param maxPredictions how many of the top results do you want? defautls to 3
     */
    predictTopK(poseOutput: Float32Array, maxPredictions?: number): Promise<{
        className: string; /**
         * Classify a pose output with your trained model. Return all results
         * @param image the input image / Tensor to classify against your model
         */
        probability: number;
    }[]>;
    /**
     * process the current examples provided to calculate labels and format
     * into proper tf.data.Dataset
     */
    prepare(): void;
    /**
     * Process the examples by first shuffling randomly per class, then adding
     * one-hot labels, then splitting into training/validation datsets, and finally
     * sorting one last time
     */
    private convertToTfDataset;
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
    save(handlerOrURL: tf.io.IOHandler | string, config?: tf.io.SaveConfig): Promise<tf.io.SaveResult>;
    /**
     * Train your data into a new model and join it with mobilenet
     * @param params the parameters for the model / training
     * @param callbacks provide callbacks to receive training events
     */
    train(params: TrainingParameters, callbacks?: CustomCallbackArgs): Promise<tf.LayersModel>;
    prepareDataset(): void;
    stopTraining(): Promise<void>;
    dispose(): void;
    setLabel(index: number, label: string): void;
    setLabels(labels: string[]): void;
    getLabel(index: number): string;
    getLabels(): string[];
    setName(name: string): void;
    getName(): string;
    calculateAccuracyPerClass(): Promise<{
        reference: tf.Tensor<tf.Rank>;
        predictions: tf.Tensor<tf.Rank>;
    }>;
    setSeed(seed: string): void;
}
export declare function createTeachable(metadata: Partial<Metadata>): Promise<TeachablePoseNet>;
