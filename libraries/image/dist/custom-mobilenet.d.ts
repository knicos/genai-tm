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
export declare const IMAGE_SIZE = 224;
/**
 * the metadata to describe the model's creation,
 * includes the labels associated with the classes
 * and versioning information from training.
 */
export interface Metadata {
    tfjsVersion: string;
    tmVersion?: string;
    packageVersion: string;
    packageName: string;
    modelName?: string;
    timeStamp?: string;
    labels: string[];
    userMetadata?: {};
    grayscale?: boolean;
    imageSize?: number;
}
export interface ModelOptions {
    version?: number;
    checkpointUrl?: string;
    alpha?: number;
    trainingLayer?: string;
}
export type ClassifierInputSource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
/**
 * Computes the probabilities of the topK classes given logits by computing
 * softmax to get probabilities and then sorting the probabilities.
 * @param logits Tensor representing the logits from MobileNet.
 * @param topK The number of top predictions to show.
 */
export declare function getTopKClasses(labels: string[], logits: tf.Tensor<tf.Rank>, topK?: number): Promise<{
    className: string;
    probability: number;
}[]>;
export declare class CustomMobileNet {
    model: tf.LayersModel;
    /**
     * the truncated mobilenet model we will train on top of
     */
    protected truncatedModel: tf.LayersModel;
    static get EXPECTED_IMAGE_SIZE(): number;
    protected _metadata: Metadata;
    getMetadata(): Metadata;
    constructor(model: tf.LayersModel, metadata: Partial<Metadata>);
    /**
     * get the total number of classes existing within model
     */
    getTotalClasses(): number;
    /**
     * get the model labels
     */
    getClassLabels(): string[];
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities of the top K classes.
     * @param image the image to classify
     * @param maxPredictions the maximum number of classification predictions
     */
    predictTopK(image: ClassifierInputSource, maxPredictions?: number, flipped?: boolean): Promise<{
        className: string;
        probability: number;
    }[]>;
    /**
     * Given an image element, makes a prediction through mobilenet returning the
     * probabilities for ALL classes.
     * @param image the image to classify
     * @param flipped whether to flip the image on X
     */
    predict(image: ClassifierInputSource, flipped?: boolean): Promise<{
        className: string;
        probability: number;
    }[]>;
    dispose(): void;
}
/**
 * load the base mobilenet model
 * @param modelOptions options determining what model to load
 */
export declare function loadTruncatedMobileNet(modelOptions?: ModelOptions): Promise<tf.Sequential>;
export declare function load(model: string, metadata?: string | Metadata): Promise<CustomMobileNet>;
export declare function loadFromFiles(model: File, weights: File, metadata: File): Promise<CustomMobileNet>;
