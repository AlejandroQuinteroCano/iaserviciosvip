const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file:///c:/Users/ssdaquintero/IASERVICIOSVIP/mi-pagina-web/index.html', { waitUntil: 'networkidle2' });
    await page.pdf({ path: 'mi-pagina-web.pdf', format: 'A4' });

    await browser.close();
    console.log('PDF generado con éxito.');
})();