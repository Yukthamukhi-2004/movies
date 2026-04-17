import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import type { TraktMovies } from "../types/trakt";
import "../styles/PopUp.css";
import { Skeleton } from "primereact/skeleton";
import { Button } from "primereact/button";
import "../styles/TrendingMovies.css";

interface PopUpProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  movie: TraktMovies | null;
}

function PopUp({ visible, setVisible, movie }: PopUpProps) {
  const [showVideo, setShowVideo] = useState(false);

  // ✅ Lazy load video — wait 300ms after popup opens before rendering iframe
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShowVideo(true), 300);
      return () => clearTimeout(t);
    } else {
      setShowVideo(false);
    }
  }, [visible]);

  const posterPath =
    movie?.movie.images?.poster?.[0] || movie?.movie.images?.thumb?.[0];
  const posterUrl = posterPath ? `https://${posterPath}` : "";

  const isoDate: string = "2026-03-23T17:42:40.000Z";
  const dateObj = new Date(isoDate);

  const formattedReleaseDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);

  const videoId = movie?.movie.trailer?.split("v=")[1]?.split("&")[0];
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`
    : null;

  const RedirectButton = movie?.movie.homepage;

  const handleButtonClick = () => {
    if (RedirectButton) {
      window.open(RedirectButton, "_blank", "noopener,noreferrer");
    } else {
      console.log("No homepage link available");
    }
  };

  return (
    <div className="text">
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        style={{
          width: "50vw",
          fontWeight: "bold",
          paddingLeft: "10px",
          paddingRight: "7px",
          paddingBottom: "7px",
          paddingTop: "7px",
          borderRadius: "16px",
          border: "solid 1px gray",
        }}
        header={movie?.movie.title}
        pt={{
          root: {
            className:
              "bg-white dark:!bg-black text-black dark:!text-white border-zinc-500",
          },
          header: {
            className:
              "bg-white dark:!bg-black tracking-wide text-black dark:!text-white pb-3",
          },
          content: {
            className: "bg-white dark:!bg-black text-black dark:!text-white",
          },
          closeButton: {
            className: "scale-100 transition-all hover:text dark:bg-black! ",
          },
          closeButtonIcon: {
            className: "stroke-black dark:!stroke-white stroke-2",
          },
        }}
      >
        {movie ? (
          <div className="bg-white dark:!bg-black top-0 transition-colors duration-300">
            <div className="bg-white dark:!bg-black sticky">
              <div className="movie-details bg-white dark:!bg-black text-black dark:!text-white p-4 items-center gap-10 transition-colors duration-300">
                <div className="flex flex-row justify-items-start gap-5">
                  <div className="m-3">
                    {posterUrl && (
                      <img
                        src={posterUrl}
                        alt="Poster"
                        style={{
                          width: "100%",
                          maxHeight: "300px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                  <div className="text-black dark:!text-black text-md font-normal">
                    <strong className="font-black dark:!font-white tracking-wide">
                      {movie.movie.title}
                    </strong>
                    <p>{movie.movie.year}</p>
                    <p>Runtime : {movie.movie.runtime}</p>
                    <p>
                      ⭐{" "}
                      {movie.movie.rating
                        ? movie.movie.rating.toFixed(1)
                        : "N/A"}
                    </p>
                    <p>Latest Updated : {formattedReleaseDate}</p>
                  </div>
                </div>

                <p className="font-black dark:!font-black font-medium ml-2 mt-5">
                  <strong>Overview : </strong>
                  {movie.movie.overview || "No overview available"}
                </p>

                <div>
                  <div
                    className="video-wrapper"
                    style={{
                      position: "relative",
                      paddingTop: "35%",
                      height: "900px",
                      overflow: "hidden",
                      marginBottom: "10px",
                      alignItems: "center",
                    }}
                  >
                    {/* ✅ Only render iframe after 300ms delay */}
                    {showVideo && embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "60px",
                          width: "90%",
                          height: "100%",
                          borderRadius: "10px",
                        }}
                      ></iframe>
                    ) : !showVideo && embedUrl ? (
                      // ✅ Show skeleton while waiting
                      <Skeleton
                        width="90%"
                        height="100%"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "30px",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      <div className="">No trailer available</div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "12px",
                      alignItems: "center",
                      marginLeft: "200px",
                      marginTop: "0px",
                    }}
                  >
                    {movie.movie.genres?.map((genre, index) => (
                      <span
                        key={index}
                        className="genre-chip bg-gray-200 dark:!bg-zinc-800/80 text-black dark:!text-white px-4 py-1 text-lg rounded-full transition-colors duration-300"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="font-black dark:!font-white font-normal">
                  <div>
                    Country : {movie.movie.country?.toUpperCase() || "N/A"}
                  </div>
                  <p>Status : {movie.movie.status || "N/A"}</p>
                  <p>🩷{movie.movie.votes}</p>
                  <p>💬{movie.movie.comment_count}</p>

                  <div className="w-full flex justify-center mt-6">
                    <Button
                      label="Visit HomePage"
                      onClick={handleButtonClick}
                      disabled={!RedirectButton}
                      unstyled
                      className={`max-w-[1000px] px-5 py-2 rounded-xl text-2xl font-bold tracking-wide transition-all ${
                        RedirectButton
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-101 shadow-lg shadow-yellow-500/30"
                          : "bg-gray-200 text-gray-400 dark:!bg-zinc-300 dark:!text-zinc-900 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No movie selected.</p>
        )}
      </Dialog>
    </div>
  );
}

export default PopUp;
