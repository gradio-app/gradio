export const make_html = (entrypoint: string): string => {
	return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Gradio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entrypoint}"></script>
  </body>
</html>
`;
};
