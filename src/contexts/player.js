import { createContext, useContext, useEffect, useRef, useState } from "react";

export const PlayerContext = createContext();

export default function PlayerProvider({ children }) {
  const [media, setMedia] = useState({
    id: null,
    url: "",
    width: 0,
    height: 0,
    title: "",
    view: null,
    startTime: 0,
    autoPlay: true,
  });

  const [hasWindow, setHasWindow] = useState(false);
  const [ready, setReady] = useState(false);
  const [pip, setPip] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const dash = useRef(null);

  const reset = () => {
    if (dash.current) {
      dash.current.reset();
      setPip(false);
      setMedia({
        id: null,
        url: "",
        width: 0,
        height: 0,
        title: "",
        view: null,
        startTime: 0,
        autoPlay: true,
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("dashjs").then((dashjs) => {
        dash.current = dashjs.MediaPlayer().create();
        dash.current.initialize();
      });

      setHasWindow(true);
    }
  }, []);

  useEffect(() => {
    if (media.url && dash.current) {
      const { view, url, autoPlay, startTime } = media;

      dash.current.attachSource(url);
      dash.current.attachView(view);
      dash.current.setAutoPlay(autoPlay);

      dash.current.on("playbackPlaying", (event) => {
        setPlaying(true);
      });

      dash.current.on("playbackPaused", (event) => {
        setPlaying(false);
      });

      dash.current.on("playbackTimeUpdated", (event) => {
        setTime(event.time);
      });

      dash.current.on("streamInitialized", (event) => {
        setDuration(event.streamInfo.duration);
        dash.current.seek(startTime);
      });
    }
  }, [media.id]);

  const togglePlay = () => {
    if (playing) {
      dash.current.pause();
    } else {
      dash.current.play();
    }
  };

  const value = {
    media,
    pip,
    dash: dash.current,
    time,
    duration,
    playing,
    reset,
    setMedia,
    setPip,
    togglePlay,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
