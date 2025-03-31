import { chromium } from 'playwright';

export async function GET({ request, fetch }) {
  try {
    const gradioServer = 
      request.headers.get("x-gradio-server") || "http://127.0.0.1:7860";
    
    let appTitle = "Gradio App";
    let appDescription = "";
    
    try {
      const configResponse = await fetch(`${gradioServer}/config`);
      if (configResponse.ok) {
        const config = await configResponse.json();
        appTitle = config.title || appTitle;
        appDescription = config.description || appDescription;
      }
    } catch (err) {
      console.warn("Could not fetch app metadata:", err);
    }
    
    const browser = await chromium.launch({
      headless: true
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1200, height: 630 },
        deviceScaleFactor: 1
      });
      
      const page = await context.newPage();
      
      console.log(`Navigating to Gradio app at: ${gradioServer}`);
      await page.goto(gradioServer, {
        waitUntil: 'networkidle',
        timeout: 20000
      });
      
      console.log('Waiting for Gradio container to load');
      try {
        await page.waitForSelector('.gradio-container', { timeout: 10000 });
        console.log('Gradio container loaded successfully');
      } catch (err) {
        console.warn('Timeout waiting for .gradio-container, continuing anyway');
      }
      
      await page.waitForTimeout(2000);
      
      console.log('Taking screenshot of Gradio app');
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false
      });
      console.log(`Screenshot taken, size: ${screenshot.length} bytes`);
      
      console.log('Adding overlay to page');
      await page.evaluate(({ title, description }) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 100%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          padding: 40px;
          box-sizing: border-box;
          pointer-events: none;
        `;
        
        const titleElement = document.createElement('h1');
        titleElement.textContent = title;
        titleElement.style.cssText = `
          color: white;
          font-family: Arial, sans-serif;
          font-size: 50px;
          margin: 0 0 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;
        overlay.appendChild(titleElement);
        
        if (description) {
          const descElement = document.createElement('p');
          descElement.textContent = description;
          descElement.style.cssText = `
            color: white;
            font-family: Arial, sans-serif;
            font-size: 24px;
            opacity: 0.9;
            max-width: 800px;
            line-height: 1.4;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          `;
          overlay.appendChild(descElement);
        }
        
        const footer = document.createElement('div');
        footer.textContent = 'Powered by Gradio';
        footer.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          color: white;
          font-family: Arial, sans-serif;
          font-size: 18px;
          opacity: 0.7;
          background: rgba(0,0,0,0.5);
          padding: 5px 10px;
          border-radius: 4px;
          z-index: 9999;
          pointer-events: none;
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(footer);
        
        document.body.style.background = document.body.style.background;
      }, { title: appTitle, description: appDescription });
      
      console.log('Waiting for overlay to render');
      await page.waitForTimeout(500);
      
      console.log('Taking final screenshot with overlay');
      const finalScreenshot = await page.screenshot({
        type: 'png',
        fullPage: false
      });
      console.log(`Final screenshot taken, size: ${finalScreenshot.length} bytes`);
      
      return new Response(finalScreenshot, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store'
        }
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    return new Response(`Failed to generate OG image: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
