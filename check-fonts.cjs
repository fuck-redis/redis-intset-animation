const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // First check homepage nav
  await page.goto('http://localhost:56954/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const navInfo = await page.evaluate(() => {
    const items = {};

    // Nav links
    const navLinks = document.querySelectorAll('.nav-link');
    items.navLinks = {
      count: navLinks.length,
      fontSize: Array.from(navLinks).map(el => window.getComputedStyle(el).fontSize)
    };

    // Brand text
    const brandH1 = document.querySelector('.brand-text h1');
    items.brandH1 = brandH1 ? window.getComputedStyle(brandH1).fontSize : 'not found';

    // GitHub link
    const githubLink = document.querySelector('.github-link');
    items.githubLink = githubLink ? window.getComputedStyle(githubLink).fontSize : 'not found';

    return items;
  });

  // Then go to tutorial page to check sidebar
  await page.goto('http://localhost:56954/tutorial', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const sidebarInfo = await page.evaluate(() => {
    const items = {};

    // Sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    items.sidebarLinks = {
      count: sidebarLinks.length,
      fontSize: Array.from(sidebarLinks).map(el => window.getComputedStyle(el).fontSize)
    };

    // Chapter titles
    const chapterTitles = document.querySelectorAll('.tutorial-sidebar .chapter-title');
    items.chapterTitles = {
      count: chapterTitles.length,
      fontSize: Array.from(chapterTitles).map(el => window.getComputedStyle(el).fontSize)
    };

    // Chapter numbers
    const chapterNumbers = document.querySelectorAll('.chapter-number');
    items.chapterNumbers = {
      count: chapterNumbers.length,
      fontSize: Array.from(chapterNumbers).map(el => window.getComputedStyle(el).fontSize)
    };

    return items;
  });

  const fontInfo = { navInfo, sidebarInfo };

  console.log('Font info:', JSON.stringify(fontInfo, null, 2));

  await browser.close();
})();
