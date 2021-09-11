import {
    BrowserRouter, Switch, Route,
} from "react-router-dom";
import 'styles/general.css';
import Home from 'pages/Home/index';
import Room from "pages/Room";
import { useState, useEffect } from 'react';
import { GlobalContext, StreamingContext } from "context";

function App() {

    const [userStream, setUserStream] = useState(null);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenStream, setScreenStream] = useState(null);
    const [screenEnabled, setScreenEnabled] = useState(false)
    const [token, setToken] = useState("")

    const [videos, setVideos] = useState(null)
    const [audios, setAudios] = useState(null)

    const [userVideoStream, setUserVideoStream] = useState(0);
    const [userAudioStream, setUserAudioStream] = useState(0);

    const [isSettingShow, setSettingShow] = useState(false);


    useEffect(() => {
        async function start() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                navigator.mediaDevices.enumerateDevices().then((s) => {
                    let v = []
                    let a = []
                    s.forEach((r) => {
                        if (r.kind === "videoinput") {
                            v.push(r);
                        } else if (r.kind === "audioinput") {
                            a.push(r);
                        }
                    })
                    setVideos(v)
                    setAudios(a)
                }
                )
                setUserStream(stream)
            } catch (e) {
                alert(`getUserMedia() error: ${e.name}`);
            }
        }
        start()
    }, [])

    useEffect(() => {
        async function reCapture() {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: audios[userAudioStream].deviceId },
                video: { deviceId: videos[userVideoStream].deviceId }
            });
            console.log(audios[userAudioStream], videos[userVideoStream]);
            setUserStream(stream)
        }
        if (audios && videos)
            reCapture()

    }, [userVideoStream, userAudioStream, audios, videos])

    useEffect(() => {
        if (!userStream) return
        var camVideoTrack = userStream.getVideoTracks()[0];
        var camAudioTrack = userStream.getAudioTracks()[0];
        camVideoTrack.enabled = videoEnabled
        camAudioTrack.enabled = audioEnabled
    }, [videoEnabled, audioEnabled, userStream])

    useEffect(() => {
        if (screenStream || !screenEnabled) return
        async function getScreen() {
            try {
                let captureStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: "always"
                    }, audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
                });

                console.log(captureStream);

                setScreenStream(captureStream)


                captureStream.getVideoTracks()[0].onended = function () {
                    setScreenEnabled(false)
                    setScreenStream(null)
                };
            } catch {
                setScreenEnabled(false)
            }



        }
        getScreen()
    }, [screenEnabled])

    return (
        <GlobalContext.Provider value={{ isSettingShow, setSettingShow }}>
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
                sourceSwitch: {
                    userVideoStream,
                    userAudioStream,
                    setUserVideoStream,
                    setUserAudioStream,
                },
                token
                , setToken,
                source: {
                    videos,
                    audios
                }
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
                </BrowserRouter>
            </StreamingContext.Provider>
        </GlobalContext.Provider>

    );
}

export default App;
