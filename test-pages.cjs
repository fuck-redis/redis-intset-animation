const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set a larger viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  const pages = [
    '/tutorial/what-is-intset',
    '/tutorial/encoding',
    '/tutorial/memory-layout',
    '/tutorial/operations',
    '/tutorial/performance',
    '/tutorial/faq',
    '/tutorial/redis-practice'
  ];

  for (const path of pages) {
    console.log(`Testing: ${path}`);
    try {
      await page.goto(`http://localhost:23714${path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for animations to settle

      // Take screenshot
      await page.screenshot({ path: `test-screenshots${path.replace(/\//g, '-')}.png`, fullPage: false });
      console.log(`  Screenshot saved for ${path}`);

      // Check for console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Check for overlapping elements
      const overlapping = await page.evaluate(() => {
        const videos = document.querySelectorAll('.video-embed');
        const issues = [];
        videos.forEach((video, i) => {
          const rect = video.getBoundingClientRect();
          // Check if video is too small
          if (rect.height < 200) {
            issues.push(`Video ${i} height is only ${rect.height}px - too small!`);
          }
          // Check if video is outside viewport
          if (rect.bottom > window.innerHeight) {
            issues.push(`Video ${i} extends below viewport`);
          }
          // Check if overlapping with other elements
          const elementsBelow = document.elementsFromPoint(rect.left + rect.width/2, rect.bottom + 10);
          if (elementsBelow.length > 1 && !elementsBelow[0].classList.contains('video-embed')) {
            issues.push(`Video ${i} may be overlapping with next element`);
          }
        });
        return issues;
      });

      if (overlapping.length > 0) {
        console.log(`  Issues found:`);
        overlapping.forEach(issue => console.log(`    - ${issue}`));
      } else {
        console.log(`  No overlapping issues detected`);
      }
    } catch (e) {
      console.log(`  Error loading ${path}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Testing complete!');
})();
