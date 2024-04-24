css = """html {
	font-family: Inter;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.5;
	-webkit-text-size-adjust: 100%;
	background: #fff;
	color: #323232;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-rendering: optimizeLegibility;
}

:root {
	--space: 1;
	--vspace: calc(var(--space) * 1rem);
	--vspace-0: calc(3 * var(--space) * 1rem);
	--vspace-1: calc(2 * var(--space) * 1rem);
	--vspace-2: calc(1.5 * var(--space) * 1rem);
	--vspace-3: calc(0.5 * var(--space) * 1rem);
}

.app {
	max-width: 748px !important;
}

.prose p {
	margin: var(--vspace) 0;
	line-height: var(--vspace * 2);
	font-size: 1rem;
}

code {
	font-family: "Inconsolata", sans-serif;
	font-size: 16px;
}

h1,
h1 code {
	font-weight: 400;
	line-height: calc(2.5 / var(--space) * var(--vspace));
}

h1 code {
	background: none;
	border: none;
	letter-spacing: 0.05em;
	padding-bottom: 5px;
	position: relative;
	padding: 0;
}

h2 {
	margin: var(--vspace-1) 0 var(--vspace-2) 0;
	line-height: 1em;
}

h3,
h3 code {
	margin: var(--vspace-1) 0 var(--vspace-2) 0;
	line-height: 1em;
}

h4,
h5,
h6 {
	margin: var(--vspace-3) 0 var(--vspace-3) 0;
	line-height: var(--vspace);
}

.bigtitle,
h1,
h1 code {
	font-size: calc(8px * 4.5);
	word-break: break-word;
}

.title,
h2,
h2 code {
	font-size: calc(8px * 3.375);
	font-weight: lighter;
	word-break: break-word;
	border: none;
	background: none;
}

.subheading1,
h3,
h3 code {
	font-size: calc(8px * 1.8);
	font-weight: 600;
	border: none;
	background: none;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

h2 code {
	padding: 0;
	position: relative;
	letter-spacing: 0.05em;
}

blockquote {
	font-size: calc(8px * 1.1667);
	font-style: italic;
	line-height: calc(1.1667 * var(--vspace));
	margin: var(--vspace-2) var(--vspace-2);
}

.subheading2,
h4 {
	font-size: calc(8px * 1.4292);
	text-transform: uppercase;
	font-weight: 600;
}

.subheading3,
h5 {
	font-size: calc(8px * 1.2917);
	line-height: calc(1.2917 * var(--vspace));

	font-weight: lighter;
	text-transform: uppercase;
	letter-spacing: 0.15em;
}

h6 {
	font-size: calc(8px * 1.1667);
	font-size: 1.1667em;
	font-weight: normal;
	font-style: italic;
	font-family: "le-monde-livre-classic-byol", serif !important;
	letter-spacing: 0px !important;
}

#start .md > *:first-child {
	margin-top: 0;
}

h2 + h3 {
	margin-top: 0;
}

.md hr {
	border: none;
	border-top: 1px solid var(--block-border-color);
	margin: var(--vspace-2) 0 var(--vspace-2) 0;
}
.prose ul {
	margin: var(--vspace-2) 0 var(--vspace-1) 0;
}

.gap {
	gap: 0;
}
"""
