<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Gradio Frontend

This directory contains a React App that renders the frontend of the gradio framework.

## Development Setup

To make changes to the gradio frontend, you will need to have the following installed
- npm / node
- python3
- gradio

Once node is installed, make sure to run `npm install` in this directory to install the node packages.

Because this is only the frontend of the library, you must first launch a Gradio interface running on port 7860, which will be used as a backend. You can use any of the demo projects in the gradio/demo folder to serve this backend role, but make sure that the port is set to 7860. Then you launch the development frontend by running `npm run start`. Once this is run, the frontend development will launch on port 3000. It will connect with port 7860 to load the initial configuration and make API calls on submit. 

As a Create-React-App, any changes you make in the code will automatically reflect in the development frontend.

## Committing Changes

In production, the frontend is compiled and stored in the gradio/gradio/frontend directory. (This readme is in gradio/frontend, a different directory outside the python package). To compile, run `npm run build`. At the end of the process, you should see the message "Compiled successfully" - there may be an warning or error thrown about not being able to find bundle.css which you can ignore. To include the compiled js into your local python version of gradio, run `python3 setup.py install` and then launch a gradio interface. Your changes should be visible on port 7860.
>>>>>>> e2384b777c6b805bc6e295a8dc003b0a3d0f80c8
