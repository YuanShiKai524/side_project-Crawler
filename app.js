const path = require('path');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const open = require('open');
const app = express();

// 端口
const port = 8080;
// 使用靜態文件
app.use(express.static(path.join(__dirname, "static")));

// 使用解析body
app.use(bodyParser.urlencoded({ extended: true }));

// 接收post請求
app.post("/info", (req, res) => {
  const input = req.body.input;
  const idArr = input.split(" ");
  let tableData = `<table style="border: 3px solid gray; border-collapse: collapse; background-color: lightyellow; position: relative; top: 20px; left: 20px;"><tr><th style="border: 1px solid gray; border-right: 0px; padding: 7px;">貨號</th><th style="border: 1px solid gray; border-right: 0px; padding: 7px;" colspan="5">價格</th></tr>`;
  const dataArr = [];
  const fetchData = async (id) => {
    const url = `https://feebee.com.tw/s/${id}/?sort=p`;
    try {
      const promise = await axios.get(url);
      return promise;
    } catch (err) {
      console.log(err);
    }
  };
  const getData = () => {
    // 循環每一組傳進來的貨號
    idArr.forEach(async (id) => {
      const promise = await fetchData(id);
      const data = promise.data;
      const $ = cheerio.load(data);
      const priceArr = [];
      const linkArr = [];

      // 迭代取值(價格)
      for(let i = 0; i < 5; i++) {
        const p = $("li.price-info > span").eq(i).attr("aria-label");
        priceArr.push(p.slice(2));
      }
      // 迭代取值(商品連結)
      for(let j = 0; j < 5; j++) {
        const link = $("li.action > a.items_link").eq(j).attr("href");
        linkArr.push(link);
      }
      
      // 解構賦值
      const [price3, price4, price5, price6, price7] = priceArr;
      const [link3, link4, link5, link6, link7] = linkArr;
      const dataStr = `<tr><td style="padding: 7px; border: 1px solid gray;">${id}</td><td style="padding: 7px; border: 1px solid gray;"><a href='${link3}'>${price3}元</a></td><td style="padding: 7px; border: 1px solid gray;"><a href='${link4}'>${price4}元</a></td><td style="padding: 7px; border: 1px solid gray;"><a href='${link5}'>${price5}元</a></td><td style="padding: 7px; border: 1px solid gray;"><a href='${link6}'>${price6}元</a></td><td style="padding: 7px; border: 1px solid gray;"><a href='${link7}'>${price7}元</a></td></tr>`;
      tableData = tableData + dataStr;
      dataArr.push(tableData);
      if (dataArr.length === idArr.length) {
        res.send(dataArr[dataArr.length - 1] + `</table></br><button style="cursor: pointer; position: relative; top: 20px; left: 400px; padding: 10px; background-color: lightblue; border: 0.5px solid gray; border-radius: 4px; margin-bottom: 50px;" onclick="location.href='/'">回上一頁</button><style>a {color: pink;} a:hover {color: #059862;}</style>`);
      }
    });
  }
  getData();
});
// 建立服務器
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  open(`http://localhost:${port}`);
});