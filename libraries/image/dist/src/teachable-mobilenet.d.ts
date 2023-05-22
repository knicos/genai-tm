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
import { CustomCallbackArgs } from '@tensorflow/tfjs';
import { CustomMobileNet, Metadata, ClassifierInputSource, ModelOptions } from './custom-mobilenet';
export interface TrainingParameters {
    denseUnits: number;
    epochs: number;
    learningRate: number;
    batchSize: number;
}
export declare class TeachableMobileNet extends CustomMobileNet {
    /**
     * the training model for transfer learning
     */
    protected trainingModel: tf.LayersModel;
    /**
     * Training and validation datasets
     */
    private trainDataset;
    private validationDataset;
    private __stopTrainingResolve;
    private totalSamples;
    examples: Float32Array[][];
    private seed;
    constructor(truncated: tf.LayersModel, metadata: Partial<Metadata>);
    get asSequentialModel(): tf.Sequential;
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
    /**
     * Add a sample of data under the provided className
     * @param className the classification this example belongs to
     * @param sample the image / tensor that belongs in this classification
     */
    addExample(className: number, sample: HTMLImageElement | HTMLCanvasElement | tf.Tensor): Promise<void>;
    /**
     * Classify an input image / Tensor with your trained model. Return all results.
     * @param image the input image / Tensor to classify against your model
     * @param topK how many of the top results do you want? defautls to 3
     */
    predict(image: ClassifierInputSource, flipped?: boolean): Promise<{
        className: string;
        probability: number;
    }[]>;
    /**
     * Classify an input image / Tensor with your trained model. Return topK results
     * @param image the input image / Tensor to classify against your model
     * @param maxPredictions how many of the top results do you want? defautls to 3
     * @param flipped whether to flip an image
     */
    predictTopK(image: ClassifierInputSource, maxPredictions?: number, flipped?: boolean): Promise<{
        className: string;
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
    setLabel(index: number, label: string): void;
    setLabels(labels: string[]): void;
    getLabel(index: number): string;
    getLabels(): string[];
    setName(name: string): void;
    getName(): string;
    stopTraining(): Promise<void>;
    dispose(): void;
    calculateAccuracyPerClass(): Promise<{
        reference: any;
        predictions: tf.Tensor<tf.Rank>;
    }>;
    setSeed(seed: string): void;
}
export declare function createTeachable(metadata: Partial<Metadata>, modelOptions?: ModelOptions): Promise<TeachableMobileNet>;
