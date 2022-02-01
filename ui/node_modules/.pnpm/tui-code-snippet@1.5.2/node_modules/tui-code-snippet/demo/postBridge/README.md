# Avoid IE11 popup POST bugs

IE11 can't post form data to popup window. [related issues](http://answers.microsoft.com/en-us/ie/forum/ie11-iewindows8_1/ie11-cant-post-form-data-to-specific-frame-or/481ba8d7-64cf-414f-b366-be9c809d9297?auth=1)

You can avoid this problem with `tui-code-snippet` popup module. please check this demo (demo/postBridge)

## How to execute the demo

1. install node dependency modules in project root

```
npm i
```

2. execute demo server

```
node demo/postBridge/server.js
```

3. connect demo page by several browsers

http://localhost:3000/popup.html


You can see the popup open and receive posted data properly.
