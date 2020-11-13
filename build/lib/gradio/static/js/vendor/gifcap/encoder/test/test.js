const _log = document.getElementById('log');

function log(str) {
  _log.innerHTML += `${str}<br />`;
}

function benchmarkGifsicle(imageData) {
  return new Promise(c => {
    const start = Date.now();
    const encoder = new GifEncoder({
      width: canvas.width,
      height: canvas.height
    });

    for (const img of imageData) {
      encoder.addFrame(img, 10);
    }

    encoder.once('finished', blob => {
      log(`gifsicle: ${Date.now() - start}ms, ${Math.floor(blob.size / 1000)}Kb`);

      const url = URL.createObjectURL(blob);
      const gifsicle = document.getElementById('gifsicle');
      gifsicle.src = url;
      c();
    });

    encoder.render();
  });
}

function benchmarkGifjs(imageData) {
  return new Promise(c => {
    const start = Date.now();
    const gif = new GIF({
      workers: 1,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: '/encoder/test/gif.worker.js',
    });

    for (const img of imageData) {
      gif.addFrame(img, { delay: 10 });
    }

    gif.once('finished', blob => {
      log(`gifjs: ${Date.now() - start}ms, ${Math.floor(blob.size / 1000)}Kb`);

      const url = URL.createObjectURL(blob);
      const gifjs = document.getElementById('gifjs');
      gifjs.src = url;
      c();
    });

    gif.render();
  });
}

async function benchmark(imageData1, imageData2) {
  log('gifjs: rendering...');
  await benchmarkGifjs(imageData1);
  log('gifsicle: rendering...');
  await benchmarkGifsicle(imageData2);
}

function main() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let frame = 0;
  const imageData1 = [];
  const imageData2 = [];

  const next = () => {
    if (frame === 30) {
      benchmark(imageData1, imageData2);
      return;
    }

    video.currentTime = frame++;
  };

  video.addEventListener('timeupdate', () => {
    ctx.drawImage(video, 0, 0);
    imageData1.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    imageData2.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    next();
  });

  log('capturing frames...');
  next();
}

window.onload = main;