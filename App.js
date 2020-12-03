import React, { useEffect, useRef } from 'react';
import { StatusBar, LogBox, Alert, AppState } from 'react-native';
import axios from 'axios';
import Routes from './src/Routes';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';
import { setGlobal } from 'reactn';
import { Color } from "./src/styles";
import { notification, auth } from './src/data';
import { NotificationHandler, Auth, Utils } from './src/helper';
import InAppNotifications from './src/components/InAppNotifications';
import ConnectionStatusNotifications from './src/components/ConnectionStatusNotifications';
import NetInfo from "@react-native-community/netinfo";
import { Notification } from "react-native-in-app-message";

axios.defaults.timeout = 10000;
axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  console.log("error message", error)
  Alert.alert(`${error}.`, "Please Check Your Internet Connection First. Then, You Can Ask CBM IT Dev Team For Help.")
});

setGlobal({
  headerPBC: {},
  itemForm: [],
  notificationList: [],
  notificationCountClicked: false,
  maxDiscCount: 0,
  soCount: 0,
  clCount: 0,
  pbcCount: 0,
  poCount:0,
  isInternetConnected: true,
})

setGlobal({
  inAppNotifProp: {
    title: 'default',
    body: 'aaa',
    backgroundColor: 'white',
    onPress: () => console.log("default global press"),
    id: 'bbb',
    type: 0,
  }
})
LogBox.ignoreAllLogs();

messaging().onTokenRefresh(async (firebaseToken) => {
  auth.updateFirebaseToken(firebaseToken)
  console.log("tokenRefresh")
})

messaging().setBackgroundMessageHandler(async (remoteMessage) => {

  //console.log("setBackgroundMessageHandler notifMessage.type", notifMessage.type)
  let notifMessage = remoteMessage.data;
  var value = await AsyncStorage.getItem('accountprofile');
  value = await JSON.parse(value);
  global.profile = value;
  notification.sync(global.profile.username)

  if (notifMessage.type == "logout") {
    Auth.logout();
    return;
  }

  else return;
});

const handle = async (remoteMessage) => {
  await Utils.wait(1000); //In Case App Not Ready
  // console.log("getInitialNotification Triggered", remoteMessage);
  NotificationHandler.onNotifOpenHandle(remoteMessage);
}

const appStateHandler = () => {

  const appState = useRef(AppState.currentState);
  // const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      Auth.handle(nextAppState, global.profile || false);
      //  console.log("App has come to the foreground!");
    }
    else if (nextAppState == "background") {

      Auth.handle(global.profile || false);

    }

    appState.current = nextAppState;
    // setAppStateVisible(appState.current);
  };

}

const App = () => {
  let notificationRef = useRef();
  let connectionStatusRef = useRef();
  let offlineConnectionStatusRef = useRef();

  appStateHandler()

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // if(!state.isConnected) 
      if (!state.isConnected) offlineConnectionStatusRef.current?.show()
      else {
        offlineConnectionStatusRef.current?.hide()
        connectionStatusRef.current?.show()

      }
      setGlobal({ isInternetConnected: state.isConnected })

      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
    });
    return unsubscribe;

  }, [])

  function onKillApp() {
    Auth.handle("inactive", true);
  }


  useEffect(() => { return onKillApp() }, [])

  useEffect(() => {

    axios.interceptors.request.use(function (config) {
      config.headers.Authorization = global.tokens;
      config.headers.User = global.profile?.username;
      return config;
    });

    messaging().getInitialNotification().then(async (remoteMessage) => {
      if (remoteMessage) {
        handle(remoteMessage);
        //  Alert.alert("getInitialNotification Triggered", JSON.stringify(remoteMessage));
      }
    });

    messaging().onNotificationOpenedApp(remoteMessage => {

      NotificationHandler.onNotifOpenHandle(remoteMessage);
      // Alert.alert("onNotificationOpenedApp Triggered", JSON.stringify(remoteMessage))
    });

    messaging().subscribeToTopic('global').then(() => console.log('Subscribed to topic!'));

  }, []);


  useEffect(() => {

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      NotificationHandler.inAppNotifHandle(remoteMessage, notificationRef);
      return unsubscribe;
    })

  }, [])

  return (
    <React.Fragment>
      <StatusBar
        backgroundColor={Color.SECONDARY}
        barStyle="light-content" />
      <Routes />

      <Notification
        style={{ borderRadius: 5 }}
        onPress={() => console.log("inAppNotif pressed")}
        customComponent={<InAppNotifications />}
        ref={notificationRef} />
      <Notification onPress={() => console.log("inAppNotif pressed")} customComponent={<ConnectionStatusNotifications />} ref={connectionStatusRef} />
      <Notification onPress={() => console.log("inAppNotif pressed")} duration={999999999} customComponent={<ConnectionStatusNotifications />} ref={offlineConnectionStatusRef} />
    </React.Fragment>
  );
};
export default App;