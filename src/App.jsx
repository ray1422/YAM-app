import {
  BrowserRouter, Switch, Route,
} from "react-router-dom";
import 'styles/general.css';
import Home from 'pages/Home/index';
import Room from "pages/Room";
import { useState, useEffect } from 'react';
import { StreamingContext } from "context";

function App() {

  const [userStream, setUserStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenStream, setScreenStream] = useState(null);
  const [screenEnabled, setScreenEnabled] = useState(false)

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        navigator.mediaDevices.enumerateDevices().then((s) =>
          s.forEach((r) => {
            let videos = []
            let audios = []
            if (r.type === "videoinput") {

            } else if (r.type === "audioinput") {
            }
          }
          )


        )

        setUserStream(stream)
      } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
      }
    }
    start()
  }, [])

  useEffect(() => {
    if (!userStream) return
    var camVideoTrack = userStream.getVideoTracks()[0];
    var camAudioTrack = userStream.getAudioTracks()[0];
    camVideoTrack.enabled = videoEnabled
    camAudioTrack.enabled = audioEnabled
  }, [videoEnabled, audioEnabled])

  useEffect(() => {
    if (screenStream || !screenEnabled) return
    async function getScreen() {
      let captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        }, audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });

      setScreenStream(captureStream)
    }
    getScreen()

  }, [screenEnabled])

  return (
    <StreamingContext.Provider value={{
      audio: {
        enabled: audioEnabled,
        setEnabled: setAudioEnabled
      },
      video: {
        enabled: videoEnabled,
        setEnabled: setVideoEnabled
      },
      screen: {
        enabled: screenEnabled,
        setEnabled: setScreenEnabled
      },
      userStream: userStream,
      screenStream: screenStream,
    }}> <BrowserRouter>
        <Switch>
          <Route path="/room/:id/:name">
            <Room />
          </Route>
          <Route path="/:name">
            <Home />
          </Route>
          <Route path="/">
            <Home />
          </Route>
          {/* <Route path="/">
      Not Found
    </Route> */}
        </Switch>
      </BrowserRouter></StreamingContext.Provider>

  );
}

export default App;
