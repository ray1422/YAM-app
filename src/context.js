import React from 'react';
export const WSContext = React.createContext({
    ws: null,
    event: null,
    name: "",
    id: ""
});

export const StreamingContext = React.createContext({
    audio: {
        enabled: true,
        setEnabled: () => { }
    },
    video: {
        enabled: true,
        setEnabled: () => { }
    },
    screen: {
        enabled: true,
        setEnabled: () => { }
    },
    userStream: null,
    screenStream: null,
    dummy: null,
    token: "",
    setToken: () => { },
    source: {
        videos: null,
        audios: null,
    }, sourceSwitch: {
        userVideoStream: null,
        userAudioStream: null,
        setUserVideoStream: () => { },
        setUserAudioStream: () => { },
    }
});

export const MessageContext = React.createContext({
    messagesList: [],
    setMessagesList: () => { },
    messagesListRef: null,
    sendMessage: null,
    setSendMessage: () => { },
    providingFiles: [],
    requireFile: {
        value: null,
        setValue: () => { }
    },
    receiveFiles: {},
    setReceiveFiles: {},
});


export const GlobalContext = React.createContext({
    isSettingShow: false,
    setSettingShow: () => { }
});