"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [movie, setMovie] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState("search");

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a movie title");
      return;
    }

    setIsLoading(true);
    setLoadingMode("search");
    setError(null);
    setSearchResults([]);
    setHasSearched(false);
    setMovie(null);
    setSentiment(null);
    try {
      const searchRes = await fetch(
        `/api/movie/search?q=${encodeURIComponent(query.trim())}`,
      );
      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        setError(searchData.error || "Failed to search movies.");
        return;
      }

      setSearchResults(searchData.results);
      setHasSearched(true);
    } catch (err) {
      setError("Failed to search movies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMovie = async (selectedMovie) => {
    setIsLoading(true);
    setLoadingMode("analyze");
    setError(null);
    setSearchResults([]);
    setHasSearched(false);
    setQuery(selectedMovie.title);
    setMovie(null);
    setSentiment(null);

    try {
      const movieRes = await fetch(
        `/api/movie?tmdbId=${encodeURIComponent(selectedMovie.id)}`,
      );
      const movieData = await movieRes.json();

      if (!movieRes.ok) {
        setError(movieData.error || "Failed to fetch movie details.");
        return;
      }

      setMovie(movieData);

      const sentimentRes = await fetch(`/api/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: movieData.title,
          plot: movieData.plot,
          rating: movieData.rating,
          genre: movieData.genre,
        }),
      });

      const sentimentData = await sentimentRes.json();
      if (sentimentRes.ok) {
        setSentiment(sentimentData);
      }
    } catch (err) {
      setError("Failed to analyze this movie. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-2xl font-bold">Brew</span>
        </div>
        <a
          href="https://github.com/sanukumar-in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border border-orange-500/30 
             rounded-full text-orange-400 hover:bg-orange-500/10 
             transition-all duration-200 text-sm"
        >
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>Sanu Kumar</span>
        </a>
      </nav>

      {/* Hero */}
      <div className="text-center py-20 px-4">
        <h1 className="text-6xl font-bold mb-4">
          <span className="text-orange-500">AI Movie</span> Insight
        </h1>
        <p className="text-white/50 text-lg">
          Search for a movie to discover what audiences really think
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4">
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by movie title"
            aria-label="Movie title"
            className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 
                       text-white placeholder-white/30 focus:outline-none 
                       focus:border-orange-500 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-400 
                             text-white font-semibold rounded-xl transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed
                             duration-200 hover:scale-105 active:scale-95"
          >
            {isLoading && loadingMode === "search" ? "Searching..." : "Search"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectMovie(result)}
                className="flex w-full items-center gap-4 border-b border-white/10 p-3 text-left last:border-b-0 hover:bg-white/5"
              >
                {result.poster ? (
                  <Image
                    src={result.poster}
                    alt=""
                    width={48}
                    height={72}
                    className="h-[72px] w-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-12 flex-shrink-0 items-center justify-center rounded bg-white/10 text-xs text-white/40">
                    No poster
                  </div>
                )}
                <span>
                  <span className="block font-medium text-white">
                    {result.title}
                  </span>
                  <span className="mt-1 block text-sm text-white/50">
                    {result.release_year || "Release date unknown"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {hasSearched && searchResults.length === 0 && !isLoading && (
          <p className="mt-4 text-center text-sm text-white/50">
            No movies found. Try another title.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-400 mt-4 text-sm">{error}</p>
      )}

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 mt-16 mb-16">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div
              className="w-10 h-10 border-2 border-orange-500 border-t-transparent 
                    rounded-full animate-spin"
            />
            <p className="text-white/50">
              {loadingMode === "search" ? "Searching movies..." : "Analyzing movie..."}
            </p>
          </div>
        )}

        {movie && (
          <div className="flex gap-8">
            {/* Poster */}
            {movie.poster ? (
              <Image
                src={movie.poster}
                alt={movie.title}
                width={192}
                height={288}
                className="rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-72 w-48 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/40">
                No poster
              </div>
            )}

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-4xl font-bold">{movie.title}</h2>
              <div className="flex gap-3 mt-3">
                <span className="text-orange-400">⭐ {movie.rating}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{movie.release_year}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{movie.genre}</span>
              </div>
              <p className="text-white/40 text-sm mt-1">
                Directed by {movie.director}
              </p>
              <p className="text-white/70 mt-4 leading-relaxed">{movie.plot}</p>
            </div>
          </div>
        )}

        {/* Cast */}
        {movie && (
          <div className="mt-8 flex flex-wrap gap-2">
            <p className="w-full text-white/40 text-xs uppercase tracking-widest mb-2">
              Cast
            </p>
            {movie.cast.map((name, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/5 border border-white/10 
                               rounded-full text-white/70 text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Sentiment */}
        {sentiment && (
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                AI Sentiment Analysis
              </h3>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize
        ${sentiment.classification === "positive" ? "bg-green-500/20 text-green-400 border border-green-500/30" : ""}
        ${sentiment.classification === "mixed" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : ""}
        ${sentiment.classification === "negative" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
      `}
              >
                {sentiment.classification === "positive"
                  ? "😊"
                  : sentiment.classification === "mixed"
                    ? "😐"
                    : "😞"}{" "}
                {sentiment.classification}
              </span>
            </div>

            {/* Score bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">Audience Score</span>
                <span className="text-white font-bold">
                  {sentiment.audienceScore}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000
            ${sentiment.classification === "positive" ? "bg-green-400" : ""}
            ${sentiment.classification === "mixed" ? "bg-yellow-400" : ""}
            ${sentiment.classification === "negative" ? "bg-red-400" : ""}
          `}
                  style={{ width: `${sentiment.audienceScore}%` }}
                />
              </div>
            </div>

            <p className="text-white/70 leading-relaxed mb-4">
              {sentiment.sentimentSummary}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-green-400 text-sm font-medium mb-2">
                  ✅ What audiences love
                </p>
                <ul className="space-y-1">
                  {sentiment.positivePoints.map((p, i) => (
                    <li key={i} className="text-white/60 text-sm flex gap-2">
                      <span className="text-green-400">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-red-400 text-sm font-medium mb-2">
                  ⚠️ Common criticisms
                </p>
                <ul className="space-y-1">
                  {sentiment.negativePoints.map((p, i) => (
                    <li key={i} className="text-white/60 text-sm flex gap-2">
                      <span className="text-red-400">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
