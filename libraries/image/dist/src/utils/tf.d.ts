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
/**
 * Receives an image and normalizes it between -1 and 1.
 * Returns a batched image (1 - element batch) of shape [1, w, h, c]
 * @param rasterElement the element with pixels to convert to a Tensor
 * @param grayscale optinal flag that changes the crop to [1, w, h, 1]
 */
export declare function capture(rasterElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, grayscale?: boolean): tf.Tensor<tf.Rank>;
export declare function cropTensor(img: tf.Tensor3D, grayscaleModel?: boolean, grayscaleInput?: boolean): tf.Tensor3D;
