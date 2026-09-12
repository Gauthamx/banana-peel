# Sir Peels-A-Lot

Sir Peels-A-Lot is a React and Vite app that uses a Teachable Machine image model to decide which end of a banana should be opened. It supports image uploads and live webcam analysis, then presents a confidence score, a playful AI roast, and an optional set of generated scientist-mode metrics.

## Features

- Upload JPG, PNG, or WEBP images by browsing or dragging them into the input area.
- Analyze a live webcam feed when camera permissions are available.
- Classify the image as stem side, bottom/blossom side, or no banana.
- Show a confidence meter, verdict explanation, and raw model detection.
- Enable Scientist Mode for additional curvature, stem probability, entropy, peelability, and ripeness readouts.
- Use the interactive "what if I don't?" response for stem and bottom verdicts.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A modern browser with camera support if webcam mode is used

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint against the project. |

## How the model works

The model is loaded from the Teachable Machine URL configured in `src/components/BananaAnalyzer.jsx`. The app loads `model.json` and `metadata.json`, sends the selected image or webcam video element to the model, and selects the class with the highest probability.

The current model URL is:

```text
https://teachablemachine.withgoogle.com/models/MGa1ic7Im/
```

To use a different model, replace `MODEL_URL` in `BananaAnalyzer.jsx`. The model's class names should include `stem` for the stem-side verdict, `bottom` or `blossom` for the bottom-side verdict, and one of `no banana`, `background`, `none`, `other`, or `nothing` for the no-banana verdict.

## Project structure

```text
src/
	App.jsx                    Main layout, cursor effect, and Scientist Mode toggle
	App.css                    Application layout, glass styling, animations, and responsive rules
	index.css                  Global body reset
	main.jsx                   React entry point
	components/
		ImageInput.jsx           Upload, drag-and-drop, preview, and webcam input
		BananaAnalyzer.jsx       Model loading, prediction, verdicts, and result panels
public/
	favicon.svg                Browser favicon
	icons.svg                  Shared SVG icon definitions
```

## Notes

- Webcam analysis requires the browser to grant camera permission.
- The app depends on the hosted Teachable Machine model, so analysis requires network access.
- The scientist metrics are intentionally generated from the model probability and are presented as playful, unverifiable diagnostics.
