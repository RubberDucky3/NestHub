import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'http://127.0.0.1:11434/v1',
    apiKey: 'ollama',
});

async function test() {
    try {
        console.log("Sending query to Ollama...");
        const response = await openai.chat.completions.create({
            model: "llama3.2:latest",
            messages: [
                { role: "system", content: "You are a test." },
                { role: "user", content: "Hello!" }
            ],
            temperature: 0.7,
            max_tokens: 50,
        });
        console.log("Response:", response.choices[0].message?.content);
    } catch (e) {
        console.error("Error connecting:", e);
    }
}

test();
