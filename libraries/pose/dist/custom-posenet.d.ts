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
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import { PosenetInput, Padding } from "@tensorflow-models/posenet/dist/types";
import { ModelConfig } from "@tensorflow-models/posenet";
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
    modelSettings?: {};
}
export interface PoseModelSettings {
    posenet: Partial<ModelConfig>;
}
export type ClassifierInputSource = PosenetInput;
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
export declare class CustomPoseNet {
    model: tf.LayersModel;
    posenetModel: posenet.PoseNet;
    protected _metadata: Metadata;
    getMetadata(): Metadata;
    constructor(model: tf.LayersModel, posenetModel: posenet.PoseNet, metadata: Partial<Metadata>);
    /**
     * get the model labels
     */
    getClassLabels(): string[];
    /**
     * get the total number of classes existing within model
     */
    getTotalClasses(): number;
    estimatePose(sample: PosenetInput, flipHorizontal?: boolean): Promise<{
        pose: posenet.Pose;
        posenetOutput: Float32Array;
    }>;
    estimatePoseOutputs(sample: PosenetInput): Promise<{
        heatmapScores: tf.Tensor3D;
        offsets: tf.Tensor3D;
        displacementFwd: tf.Tensor3D;
        displacementBwd: tf.Tensor3D;
        padding: Padding;
    }>;
    poseOutputsToAray(heatmapScores: tf.Tensor3D, offsets: tf.Tensor3D, displacementFwd: tf.Tensor3D, displacementBwd: tf.Tensor3D): Float32Array;
    poseOutputsToKeypoints(input: PosenetInput, heatmapScores: tf.Tensor3D, offsets: tf.Tensor3D, displacementFwd: tf.Tensor3D, displacementBwd: tf.Tensor3D, padding: Padding, flipHorizontal?: boolean): Promise<posenet.Pose>;
    /**
     * Given an image element, makes a prediction through posenet returning the
     * probabilities for ALL classes.
     * @param image the image to classify
     * @param flipped whether to flip the image on X
     */
    predict(poseOutput: Float32Array): Promise<{
        className: string;
        probability: number;
    }[]>;
    /**
     * Given an image element, makes a prediction through posenet returning the
     * probabilities of the top K classes.
     * @param image the image to classify
     * @param maxPredictions the maximum number of classification predictions
     */
    predictTopK(poseOutput: Float32Array, maxPredictions?: number): Promise<{
        className: string;
        probability: number;
    }[]>;
    dispose(): void;
}
export declare function loadPoseNet(config?: Partial<PoseModelSettings>): Promise<posenet.PoseNet>;
export declare function load(checkpoint: string, metadata?: string | Metadata): Promise<CustomPoseNet>;
export declare function loadFromFiles(json: File, weights: File, metadata: File): Promise<CustomPoseNet>;
