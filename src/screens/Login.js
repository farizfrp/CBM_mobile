import React, { Component } from 'react';
import {StyleSheet,Text,View} from 'react-native';
import Logo from '../components/Logo';
import Form from '../components/Form';
import Api from '../components/Api';
import { Color } from "../styles";

export default class Login extends Component{

    render() {

        console.log("Login Screen")
        return (
            <View style={styles.container}>
                <Logo />
                <Form type="Login" />
                <View style={styles.signupTextCont}>
        <Text style={styles.signupText}>{Api.Status + " "}Version</Text>
        <Text style={styles.signupButton}> {global.version}</Text>
                </View>
            </View>
        )
    }
}



const styles = StyleSheet.create({
    container: {
        backgroundColor: Color.BLUE ,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signupTextCont: {
        flexGrow: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingVertical: 16,
        flexDirection: 'row'
    },
    signupText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16
    },
    signupButton: {
        color: Color.TEXT_PRIMARY,
        fontSize: 16,
        fontWeight: '500'
    }
});