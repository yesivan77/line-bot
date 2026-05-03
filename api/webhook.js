export default async function handler(req, res) {
  const body = req.body;
  const userMsg = body.events?.[0]?.message?.text;

  const prompt = `（貼你的GPT-109提示詞）`;

  const fullInput = prompt + "\n\n" + userMsg;

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
