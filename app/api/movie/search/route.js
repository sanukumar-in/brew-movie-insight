import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Please provide a movie title" },
      { status: 400 },
    );
  }

  if (!process.env.TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not configured");
    return NextResponse.json(
      { error: "Movie search is not configured" },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      console.error("TMDB movie search failed:", data.status_message);
      return NextResponse.json(
        { error: "Unable to search movies right now" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      results: (data.results || []).slice(0, 8).map((result) => ({
        id: result.id,
        title: result.title,
        release_year: result.release_date?.split("-")[0] || null,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
          : null,
      })),
    });
  } catch (error) {
    console.error("Error searching movies:", error);
    return NextResponse.json(
      { error: "Unable to search movies right now" },
      { status: 502 },
    );
  }
}
