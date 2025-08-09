const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3005;

app.use(cors());

app.get('/richlist', async (req, res) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.coincarp.com/currencies/solana/richlist/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 先等待頁面載入完成
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 檢查可用的 table 選擇器
    const debug = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const tableInfo = Array.from(tables).map((table, index) => {
        return {
          index,
          className: table.className,
          rows: table.querySelectorAll('tbody tr').length
        };
      });
      return { tableCount: tables.length, tableInfo };
    });
    
    console.log('Debug info:', debug);

    // 嘗試多個可能的選擇器
    const selectors = [
      'table.table-hover tbody tr',
      'table tbody tr',
      '.table tbody tr',
      'tbody tr'
    ];
    
    let wallets = [];
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`成功找到選擇器: ${selector}`);
        
        wallets = await page.evaluate((sel) => {
          const rows = Array.from(document.querySelectorAll(sel));
          
          return rows.map((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) return null;
            
            const address = cells[1]?.querySelector('a')?.innerText?.trim() || 
                          cells[1]?.innerText?.trim();
            const solText = cells[2]?.innerText?.replace(/,/g, '') || '0';
            const sol = parseFloat(solText);
            
            return { address, sol };
          }).filter(x => x && x.address && !isNaN(x.sol));
        }, selector);
        
        console.log(`成功抓取到 ${wallets.length} 筆錢包資料`);
        
        if (wallets.length > 0) break;
      } catch (e) {
        console.log(`選擇器 ${selector} 失敗:`, e.message);
        continue;
      }
    }

    await browser.close();
    
    if (wallets.length === 0) {
      return res.status(500).json({ error: '未找到數據', debug });
    }
    
    res.json(wallets.slice(0, 20));
  } catch (err) {
    await browser.close();
    console.error('抓取失敗:', err);
    res.status(500).json({ error: '抓取 Rich List 失敗', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Rich List API is running at http://localhost:${PORT}/richlist`);
});
