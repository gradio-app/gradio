# How to add support for more languages

1. Create a new json file in this directory
2. Name the file after the language code (Here's a list: http://4umi.com/web/html/languagecodes.php)
3. Please provide clear and complete translations. Take a look at the [`en.json`](https://github.com/gradio-app/gradio/blob/master/ui/packages/app/public/lang/en.json) file for the corresponding English text.
4. Lastly, the json file will need to be imported and added into the [`i18n.js` file](https://github.com/gradio-app/gradio/blob/master/ui/packages/app/src/i18n.js)

That's it! Looking forward to your language 🌎
