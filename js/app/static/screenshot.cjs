const { chromium } = require('playwright');

async function captureScreenshot(gradioServer, sampleImage) {
  try {
    console.log("gradioServer::::", gradioServer)
    const browser = await chromium.launch({
      headless: true
    });

    try {
      const context = await browser.newContext({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 1
      });

      const page = await context.newPage();

      await page.goto(gradioServer, {
        waitUntil: "domcontentloaded",
        timeout: 20000
      });

      try {
        await page.waitForSelector(".gradio-container", { timeout: 10000 });
      } catch (err) {}

      await page.waitForTimeout(2000);

      const containDivExists = await page.evaluate(() => {
        const gradioContainer = document.querySelector(".gradio-container");
        if (!gradioContainer) return false;

        const containSelectors = [
          ".contain",
          ".gradio-container > .contain",
          ".gradio-container > div > .contain",
          '.gradio-container > [class*="contain"]',
          '.gradio-container > div[class*="contain"]'
        ];

        for (const selector of containSelectors) {
          if (document.querySelector(selector)) {
            return true;
          }
        }

        return false;
      });

      let screenshot;

      if (containDivExists) {
        const containBox = await page.evaluate(() => {
          const gradioContainer = document.querySelector(".gradio-container");

          const containSelectors = [
            ".contain",
            ".gradio-container > .contain",
            ".gradio-container > div > .contain",
            '.gradio-container > [class*="contain"]',
            '.gradio-container > div[class*="contain"]'
          ];

          let containDiv = null;
          for (const selector of containSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              containDiv = element;
              break;
            }
          }

          if (!containDiv) return null;

          const rect = containDiv.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        });

        if (containBox) {
          const padding = 10;
          const screenshotClip = {
            x: Math.max(0, containBox.x - padding),
            y: Math.max(0, containBox.y - padding),
            width: Math.min(
              containBox.width + padding * 2,
              page.viewportSize().width
            ),
            height: Math.min(
              containBox.height + padding * 2,
              page.viewportSize().height
            )
          };

          screenshot = await page.screenshot({
            type: "png",
            clip: screenshotClip
          });
        } else {
          screenshot = await page.screenshot({
            type: "png",
            fullPage: false
          });
        }
      } else {
        screenshot = await page.screenshot({
          type: "png",
          fullPage: false
        });
      }

      const screenshotBase64 = `data:image/png;base64,${screenshot.toString("base64")}`;

      await page.evaluate(
        (data) => {
          try {
            document.body.innerHTML = "";
            document.body.style.cssText = `
              margin: 0;
              padding: 0;
              background-color: white;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            `;

            const container = document.createElement("div");
            container.style.cssText = `
              width: 1200px;
              height: 630px;
              background-color: white;
              display: flex;
              flex-direction: column;
              position: relative;
              padding: 40px;
              box-sizing: border-box;
            `;

            const imagesContainer = document.createElement("div");
            imagesContainer.style.cssText = `
              display: flex;
              flex-direction: row;
              justify-content: space-around;
              align-items: center;
              flex: 1;
              width: 100%;
            `;

            if (data.sampleImage) {
              const leftContainer = document.createElement("div");
              leftContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 45%;
              `;

              const leftImage = document.createElement("div");
              leftImage.style.cssText = `
                width: 100%;
                height: 400px;
                background-image: url('${data.screenshot}');
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 15px;
              `;
              leftContainer.appendChild(leftImage);
              imagesContainer.appendChild(leftContainer);

              const rightContainer = document.createElement("div");
              rightContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 45%;
              `;

              const rightImage = document.createElement("div");
              rightImage.style.cssText = `
                width: 100%;
                height: 400px;
                background-image: url('${data.sampleImage}');
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 15px;
              `;
              rightContainer.appendChild(rightImage);
              imagesContainer.appendChild(rightContainer);
            } else {
              const fullScreenContainer = document.createElement("div");
              fullScreenContainer.style.cssText = `
                width: 100%;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              `;

              const fullScreenImage = document.createElement("div");
              fullScreenImage.style.cssText = `
                width: 100%;
                height: 500px;
                background-image: url('${data.screenshot}');
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              `;
              fullScreenContainer.appendChild(fullScreenImage);
              imagesContainer.appendChild(fullScreenContainer);
            }

            container.appendChild(imagesContainer);

            const footer = document.createElement("div");
            footer.style.cssText = `
              font-family: Arial, sans-serif;
              font-size: 24px;
              color: #888;
              text-align: right;
              margin-top: 20px;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 8px;
            `;

            const logoImg = document.createElement("img");
            logoImg.src =
              "https://raw.githubusercontent.com/gradio-app/gradio/main/js/_website/src/lib/assets/img/logo.png";
            logoImg.alt = "Gradio Logo";
            logoImg.style.cssText = `
              width: 35px;
              height: 35px;
              object-fit: contain;
            `;
            
            logoImg.onload = () => {
              document.body.setAttribute("data-logo-loaded", "true");
            };
            
            logoImg.onerror = (err) => {
              document.body.setAttribute("data-logo-error", "true");
            };

            const footerText = document.createElement("span");
            footerText.textContent = "Made with Gradio";
            footer.appendChild(logoImg);
            footer.appendChild(footerText);

            container.appendChild(footer);

            document.body.appendChild(container);

            return { success: true };
          } catch (err) {
            return { error: err.toString() };
          }
        },
        {
          screenshot: screenshotBase64,
          sampleImage: sampleImage
        }
      );

      await page.waitForTimeout(100);
      
      try {
        await page.waitForFunction(() => {
          return document.body.getAttribute('data-logo-loaded') === 'true' || 
                 document.body.getAttribute('data-logo-error') === 'true';
        }, { timeout: 5000 });
      } catch (err) {}
      
      await page.waitForTimeout(500);

      const finalScreenshot = await page.screenshot({
        type: "png",
        fullPage: false
      });

      return finalScreenshot;
    } finally {
      await browser.close();
    }
  } catch (error) {
    throw error;
  }
}

module.exports = { captureScreenshot }; 