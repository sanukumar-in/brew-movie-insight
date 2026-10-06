import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  const { title, plot, rating, genre } = await request.json();

  if (!title || !plot || !rating || !genre) {
    return NextResponse.json(
      { error: "Missing required movie data" },
      { status: 400 },
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: `You are a movie analyst. Analyze this movie and give audience sentiment.
          
            Movie: ${title}
            Genre: ${genre}
            IMDb Rating: ${rating}/10
            Plot: ${plot}

            Reply with ONLY this JSON, no extra text:
            {
            "sentimentSummary": "2-3 sentences about how audiences feel about this movie",
            "classification": "positive" or "mixed" or "negative",
            "positivePoints": ["point 1", "point 2", "point 3"],
            "negativePoints": ["point 1", "point 2"],
            "audienceScore": a number between 0 and 100
            }

            Rules:
            - positive = rating 7.5 and above
            - mixed = rating 5.5 to 7.4
            - negative = rating below 5.5`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const sentiment = JSON.parse(completion.choices[0].message.content.trim());
    return NextResponse.json(sentiment);
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 },
    );
  }
}
