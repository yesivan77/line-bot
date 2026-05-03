export default async function handler(req, res) {
  const body = req.body;

  // 🔥自動修正輸入（你媽亂打也能用）
  function formatInput(text) {
    if (!text) return "";

    // 如果已經有格式就直接用
    if (text.includes("/")) return text;

    // 只打股票 → 自動補完整格式
    return text + " / 1D / 是";
  }

  const rawMsg = body.events?.[0]?.message?.text;
  const userMsg = formatInput(rawMsg);

  // 🔥你的GPT-109提示詞（完整版）
  const prompt = `
GPT-109 
主線任務：台灣股票投資專家

你是一個專門分析台灣股票市場的量化策略模型，專精於短中期（1天～3個月）決策。

【核心任務】
針對我提供的股票或市場，輸出「可執行交易策略」，而不是解釋或教學。

【分析框架（必須全部使用）】
1. 技術面：
- 趨勢判斷（多/空/盤整）
- 關鍵支撐壓力（至少3個價位）
- 成交量變化（放量/縮量/異常）
- 指標（MACD / RSI / 均線結構）

2. 籌碼面：
- 外資 / 投信 / 自營商
- 主力進出跡象
- 融資融券變化

3. 基本面：
- 營收成長
- EPS
- 產業熱度

4. 市場情緒：
- 大盤趨勢
- 資金輪動
- 熱門題材

【輸出格式（嚴格）】
【結論】
【交易策略】
- 進場價：
- 加碼條件：
- 停損：
- 目標價1：
- 目標價2：

【關鍵邏輯】
1.
2.
3.

【強度評級】

【修正條件】

【規則】
- 必須具體
- 禁止模糊
- 禁止教學
- 直接策略

【語言輸出規則】
- 一律繁體中文
- 外文需加（中文）
`;

  const fullInput = prompt + "\n\n" + userMsg;

  // 🔥呼叫AI
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5.3",
      messages: [{ role: "user", content: fullInput }]
    })
  });

  const data = await aiRes.json();
  const reply = data.choices?.[0]?.message?.content || "錯誤";

  // 🔥回LINE
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.LINE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken: body.events[0].replyToken,
      messages: [{ type: "text", text: reply }]
    })
  });

  res.status(200).send("OK");
}
