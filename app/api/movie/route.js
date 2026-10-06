import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imdbId = searchParams.get("id");
  const tmdbId = searchParams.get("tmdbId");

  if (
    (tmdbId && !/^\d+$/.test(tmdbId)) ||
    (!tmdbId && (!imdbId || !/^tt\d{7,}$/.test(imdbId)))
  ) {
    return NextResponse.json(
      { error: "Invalid movie ID" },
      { status: 400 },
    );
  }

  if (!process.env.TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not configured");
    return NextResponse.json(
      { error: "Movie details are not configured" },
      { status: 500 },
    );
  }

  try {
    let movie;
    if (tmdbId) {
      movie = { id: tmdbId };
    } else {
      const movieRes = await fetch(
        `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        },
      );
      const movieData = await movieRes.json();

      if (!movieRes.ok) {
        console.error("TMDB movie lookup failed:", movieData.status_message);
        return NextResponse.json(
          { error: "Unable to fetch movie details from TMDB" },
          { status: 502 },
        );
      }

      movie = movieData.movie_results?.[0];
    }

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found. Please check the movie ID." },
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

    if (!detailRes.ok) {
      console.error("TMDB movie details failed:", movDetail.status_message);
      return NextResponse.json(
        { error: "Unable to fetch movie details from TMDB" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      title: movDetail.title,
      poster: movDetail.poster_path
        ? `https://image.tmdb.org/t/p/w500${movDetail.poster_path}`
        : null,
      cast: movDetail.credits?.cast?.slice(0, 6).map((castMember) => castMember.name) || [],
      release_year: movDetail.release_date?.split("-")[0] || null,
      rating: movDetail.vote_average?.toFixed(1) || "N/A",
      plot: movDetail.overview || "No plot summary is available.",
      genre: movDetail.genres?.map((genre) => genre.name).join(", ") || "Unknown",
      director:
        movDetail.credits?.crew?.find((crewMember) => crewMember.job === "Director")
          ?.name || "Unknown",
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return NextResponse.json(
      { error: "Unable to fetch movie details from TMDB" },
      { status: 502 },
    );
  }
}
