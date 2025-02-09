# GenAI Teachable Machine (Image)

A simple web-based Machine Learning environment for children and learners to create their own image classifier with behaviours. This variation does not require coding skills, it provides a way to add actions and behaviours to the model without block-based or scripting languages.

A hosted version of this application is freely available [here](https://tm.gen-ai.fi/). The site does not track you or send any data to servers, all calculations are done in your browser. The sharing and collaboration functionality is peer-2-peer.

This application is developed as a part of the [Generation AI](https://www.generation-ai-stn.fi) research project in Finland, in partnership with 12 schools.

## Citation

_N. Pope, J. Kahila, H. Vartiainen and M. Tedre, "Children's AI Design Platform for Making and Deploying ML-Driven Apps: Design, Testing, and Development," in IEEE Transactions on Learning Technologies, doi: 10.1109/TLT.2025.3529994._

## Installation

This is a [React](https://react.dev/) web application that is developed within Node.js using `npm`. If you wish to build your own deployment you will need Node.js installed on your machine. Some of our dependencies are in the github registry which requires you to login using your own github personal access token (see: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry). The source code of these dependencies is here:

-   https://github.com/knicos/genai-base
-   https://github.com/knicos/teachablemachine-community

Steps to install and build:

1. Download the source code from Github.
2. `npm login --scope=@knicos --auth-type=legacy --registry=https://npm.pkg.github.com`
3. `npm install`
4. `npm run build`
5. Copy the contents of the `dist` folder to a web server.

## Development

The app uses "vite". You can start a development server using `npm start` and use `npm test` to run the automated tests.
