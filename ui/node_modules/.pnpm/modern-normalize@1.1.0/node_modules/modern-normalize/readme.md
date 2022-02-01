<div align="center">
	<img src="media/logo.svg" alt="modern-normalize">
	<br>
	<br>
	<div align="center">
		<p>
			<p>
				<sup>
					<a href="https://github.com/sponsors/sindresorhus">My open source work is supported by the community</a>
				</sup>
			</p>
			<sup>Special thanks to:</sup>
			<br>
			<br>
			<a href="https://standardresume.co/tech">
				<img src="https://sindresorhus.com/assets/thanks/standard-resume-logo.svg" width="200"/>
			</a>
		</p>
	</div>
	<br>
	<br>
	<br>
	<br>
</div>

## Differences from [`normalize.css`](https://github.com/necolas/normalize.css)

- Smaller
- Includes only normalizations for the latest Chrome, Firefox, and Safari
- [Sets `box-sizing: border-box`](https://www.paulirish.com/2012/box-sizing-border-box-ftw/)
- [Improves consistency of default fonts](https://github.com/sindresorhus/modern-normalize/issues/3)
- [Sets a more readable tab size](https://github.com/sindresorhus/modern-normalize/issues/17)
- Fully tested

All credit should go to `normalize.css`. I just removed some cruft and added some improvements. If you have questions about the source, check out the [original source](https://github.com/necolas/normalize.css/blame/master/normalize.css) and [this](https://github.com/necolas/normalize.css#extended-details-and-known-issues) for details.

[**The goal of this project is to make itself obsolete.**](https://github.com/sindresorhus/modern-normalize/issues/2)

## Browser support

- Latest Chrome
- Latest Firefox
- Latest Safari

## Install

```
$ npm install modern-normalize
```

###### Download

- [Normal](https://cdn.jsdelivr.net/npm/modern-normalize/modern-normalize.css)
- [Minified](https://cdn.jsdelivr.net/npm/modern-normalize/modern-normalize.min.css)

###### CDN

- [jsdelivr](https://www.jsdelivr.com/package/npm/modern-normalize)
- [unpkg](https://unpkg.com/modern-normalize)
- [cdnjs](https://cdnjs.com/libraries/modern-normalize)

## Usage

```css
@import 'node_modules/modern-normalize/modern-normalize.css';
```

or

```html
<link rel="stylesheet" href="node_modules/modern-normalize/modern-normalize.css">
```

## FAQ

### Can you provide Sass, Less, etc, ports?

There's absolutely no reason to have separate ports for these. They are just CSS supersets and can import CSS directly.

## Related

- [sass-extras](https://github.com/sindresorhus/sass-extras) - Useful utilities for working with Sass
