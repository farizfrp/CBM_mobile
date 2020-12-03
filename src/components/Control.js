import { Actions } from 'react-native-router-flux';
import AsyncStorage from '@react-native-community/async-storage';
import { Text, View, StatusBar} from 'react-native';


import React, { Component } from 'react';

export default class Control extends Component {

  async Control() {
   console.log("control")
    var value = await AsyncStorage.getItem('accountprofile');
    value = await JSON.parse(value);

    var value = await AsyncStorage.getItem('tokens');
    value = await JSON.parse(value);
    global.tokens = value;
    console.log(value)
    if (value) {
      global.profile = value;
  
      Actions.reset('tabbarx');
      console.log("sudah login")
    }
    else Actions.reset('Login');
  }

  componentWillMount() {
    console.log("Control");
    this.Control();
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
         <StatusBar
        backgroundColor="#2e2b2b"
        barStyle="light-content"
      />
      </View>
    );
  }
}