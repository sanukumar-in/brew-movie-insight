import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("id");

  if (!imdbId || !imdbId.match(/^tt\d{7,}$/)) {
    return NextResponse.json({ error: "Invalid IMDb ID" }, { status: 400 });
  }

  try {
    const movieRes = await fetch(
      `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );
    const movieData = await movieRes.json();

    const movie = movieData.movie_results?.[0];

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found. Please check the IMDb ID." },
        { status: 404 },
      );
    }

    const detailRes = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}?append_to_response=credits`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      },
    );
    const movDetail = await detailRes.json();
    console.log("Fetched movie details:", movDetail);
    return NextResponse.json({
      title: movDetail.title,
      poster: movDetail.poster_path
        ? `https://image.tmdb.org/t/p/w500${movDetail.poster_path}`
        : null,
      cast: movDetail.credits?.cast?.slice(0, 6).map((c) => c.name),
      release_year: movDetail.release_date?.split("-")[0],
      rating: movDetail.vote_average?.toFixed(1),
      plot: movDetail.overview,
      genre: movDetail.genres?.map((g) => g.name).join(", "),
      director: movDetail.credits?.crew?.find((c) => c.job === "Director")
        ?.name,
    });
  } catch (error) {
      console.error("Error fetching movie details:", error);
      return NextResponse.json(
      { error: "Unable to fetch movie details from TMDB" },
      { status: 502 },
      );
  }
}
