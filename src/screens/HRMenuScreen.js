import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight, TouchableOpacity, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'native-base';
export default class HRMenuScreen extends Component{
  profile = this.props.profile;
  logout() {
    let req = this.profile;
    let username = { username: req.username };
    axios.post('http://182.16.173.43/HrMobile/public/api/logout', username)
      .then(function (response) {
        console.log("Berhasil", response)
        AsyncStorage.removeItem('accountprofile');
        Alert.alert('Anda berhasil keluar');
        Actions.Login();
      })
      .catch(function (error) {
        console.log("error", error)
      });
  }

  render() {
    return (
      <View style={{ backgroundColor: "#2e2b2b", flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={[styles.menuItem, { backgroundColor: "green" }]}>
            <TouchableOpacity onPress={() => Actions.PengajuanCutiScreen()}>
              <Text style={{ textAlign: "center" }}><Icon name="ambulance" type="FontAwesome" style={styles.menuItemIcon} /> </Text>
              <Text style={styles.textMenu}>Cuti </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.menuItem, { backgroundColor: "olivedrab" }]}>
            <TouchableOpacity onPress={() => Actions.PengajuanIzinScreen()}>
              <Text style={{ textAlign: "center" }}><Icon name="space-shuttle" type="FontAwesome" style={styles.menuItemIcon} /> </Text>
              <Text style={styles.textMenu}>Izin </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={[styles.menuItem, { backgroundColor: "red" }]}>
            <TouchableOpacity onPress={() => Actions.PengajuanDinasScreen()}>
              <Text style={{ textAlign: "center" }}><Icon name="plane" type="FontAwesome" style={styles.menuItemIcon} /> </Text>
              <Text style={styles.textMenu}>Dinas Luar</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.menuItem, { backgroundColor: "blue" }]}>
            <TouchableOpacity onPress={() => Actions.HRInfoScreen()}>
              <Text style={{ textAlign: "center" }}><Icon name="info" type="FontAwesome" style={styles.menuItemIcon} /> </Text>
              <Text style={styles.textMenu}>Info </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#114D96",
    height: 200,
  },
  textMenu: {
    textAlign: 'center',
    color: "white",
    fontSize: 20,
    textAlignVertical: "center",
    marginTop: 50,
    bottom: 0,

  },
  menuItem: {
    backgroundColor: "#114D96",
    padding: 30,
    margin: 2,
    flex: 1,
    borderRadius: 0
  },
  menuItemIcon: {
    fontSize: 70,
    color: 'white',
    textAlign: "center",

    textAlignVertical: "center"
  },
  avatar: {
    width: 130,
    height: 130,

    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 25
  },
  name: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: '600',
  },
  body: {
    marginTop: 40,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
  },
  name: {
    fontSize: 28,
    color: "#114D96",
    fontWeight: "600"
  },
  info: {
    fontSize: 16,
    color: "#114D96",
    marginTop: 10
  },
  description: {
    fontSize: 16,
    color: "#696969",
    marginTop: 10,
    textAlign: 'center'
  },
  buttonContainer: {
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
    backgroundColor: "#114D96",
  },
});
