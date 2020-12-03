import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import Api from '../components/Api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Color } from '../styles';
import { setGlobal } from 'reactn';

const ProfileScreen = () => {

  let profile = global.profile;


  const [titleSelected, setTitleSelected] = useState('profile');
  function alertLogout() {
    Alert.alert("Hold on!", "Are you sure you want to Logout?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "YES", onPress: () => logout() }
    ]);
    return true;
  }

  function logout() {
    let req = global.profile;
    let username = { username: req.username };
    console.log("Logout called");

    axios.post(Api.Auth.logout, username)
      .then(function (response) {
        setGlobal({
          notificationCount: 0
        })
        global.profile = null
        console.log("Berhasil", response)
        AsyncStorage.removeItem('accountprofile');
        Actions.reset("Login");
      })
      .catch(function (error) {
        console.log("error", error)
      });
  }

  function onTitleCilck(selected) {
    setTitleSelected(selected);

  }

  const ProfileContent = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500
    }).start();

    return (
      <Animated.View style={[
        styles.bodyContent,
        {
          opacity: fadeAnim // Bind opacity to animated value
        }
      ]}>
        <Text style={styles.name}>{"PROFILE"}</Text>

        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{ color: Color.TEXT_PRIMARY }} >{profile.departemen}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{ color: Color.TEXT_PRIMARY }} > {profile.username} </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{ color: Color.TEXT_PRIMARY }} >{profile.status_karyawan}</Text>
        </TouchableOpacity>


      </Animated.View >

    )
  }

  const AboutContent = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500
    }).start();
    return (
      <Animated.View style={[
        styles.bodyContent,
        {
          opacity: fadeAnim // Bind opacity to animated value
        }
      ]}>
        <Text style={styles.name}>{"ABOUT"}</Text>

        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{ color: Color.TEXT_PRIMARY }} > {"CBM Mobile"} </Text>

        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer}>
          <Text style={{ color: Color.TEXT_PRIMARY }} >{"Ibnu Sina, Fariz Reynaldo, Arianda Musi"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonContainer, { marginBottom: 0 }]}>
          <Text style={{ color: Color.TEXT_PRIMARY }} >{Api.Status + ' Ver ' + global.version}</Text>
        </TouchableOpacity>


      </Animated.View>

    )
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.info}>{profile.jabatan}</Text>
          </View>
          <Image style={styles.avatar} source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: 130, alignItems: "flex-start" }}>
          <Text onPress={() => { onTitleCilck('profile') }} style={titleSelected == 'profile' ? styles.titleSelected : styles.title}>Profile</Text>
          <Text onPress={() => { onTitleCilck('about') }} style={titleSelected == 'about' ? styles.titleSelected : styles.title}>About</Text>
        </View>
      </View>
      {titleSelected == 'profile' ? <ProfileContent /> : <AboutContent />}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 70, width: "100%", justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => alertLogout()} >
          <Text style={styles.buttonLogout} >LOGOUT</Text>
        </TouchableOpacity></View>
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.WHITE
  },
  header: {
    backgroundColor: Color.SECONDARY,
    height: hp("35%"),
    paddingHorizontal: 20,
    flexDirection: "column",
    justifyContent: "center"

  },
  buttonLogout: {
    backgroundColor: Color.ALERT,
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    paddingHorizontal: "23%",
    width: wp("84%"),
    paddingVertical: 10,
    fontWeight: "bold",
    borderRadius: 5,

  },
  title: {
    color: "white",
    fontSize: 20,

  },
  titleSelected: {
    color: "white",
    fontSize: 20,
    borderBottomColor: "white",
    borderBottomWidth: 5
  },
  avatar: {
    width: wp("25%"),
    height: wp("25%"),
    borderRadius: 63,
    borderWidth: 4,
    borderColor: "white",
    marginBottom: 0,
    padding: 0,
    marginTop: 0,
    alignItems: "center"
  },
  name: {
    marginTop: 0,
    fontSize: 20,
    color: "white",
    fontWeight: 'bold',
  },
  info: {
    fontSize: 16,
    color: "white",
    marginTop: 0
  },
  body: {
    marginTop: 40,
  },
  bodyContent: {
    alignItems: 'center',
    paddingTop: hp('1%'),
    paddingHorizontal: hp('3%'),
    height: hp('33%'),
    backgroundColor: "grey",
    alignSelf: 'center',
    position: 'absolute',
    borderRadius: 5,
    marginTop: hp('30%'),
    position: "absolute"
  },

  buttonContainer: {
    marginTop: hp("1%"),
    height: "19%",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: "5%",
    width: wp("70%"),
    borderRadius: 5,
    backgroundColor: Color.SECONDARY,
  },
});