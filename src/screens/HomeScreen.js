import React, { Component } from 'react';
import Carousel from 'react-native-banner-carousel';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';
import { Icon } from 'react-native-elements';
import { RFValue } from "react-native-responsive-fontsize";
import { Color } from "../styles";

const BannerWidth = "94%";
const BannerHeight = RFValue(130, 580);
const images = [
  "https://kbscertification.co.id/wp-content/uploads/2017/04/slide2.jpg",
  "https://kbscertification.co.id/wp-content/uploads/2017/04/03_bulletsFW.jpg",
  "https://i.pinimg.com/originals/1e/e3/c7/1ee3c7f298a5813ff8f8f13907191701.jpg"
];

export default class HomeScreen extends Component {
  profile = global.profile;
  isApproval = (this.profile.approve_max_disc == 1 || this.profile.approve_so == 1 || this.profile.approve_hris == 1 || this.profile.approve_cl == 1);
  isBookCoil=this.profile.request_bc=="1";
  renderPage(image, index) {
    return (
      <View style={{alignItems:"center"}} key={index}>
        <Image style={{ width: BannerWidth, height: BannerHeight, borderRadius: 5 }} source={{ uri: image }} />
      </View>
    );
  }

  render() {
   
    return (
      <SafeAreaView style={{ backgroundColor: Color.SECONDARY, flex: 1 }}>
        <View style={styles.header}>
          <Text style={{ color: Color.TEXT_PRIMARY, marginBottom: 10, alignSelf:"flex-start", fontSize: RFValue(13, 580) }}>Hi, {this.profile.name}</Text>

          <Carousel
            autoplay
            autoplayTimeout={2000}
            loop
            index={0}
          >
            {images.map((image, index) => this.renderPage(image, index))}
          </Carousel>
          <View
            style={{
              borderColor:Color.GREY,
              marginTop: 10,
              borderWidth:0.2,
              width:"100%"
            }}
          />
        </View>
        <View style={{ flexDirection: "column", justifyContent: "space-around", alignItems: 'center', borderRadius: 0, flex: 1 }}>

          <View style={{ width: "94%" }}>
          <TouchableOpacity onPress={() => Actions.HRMenuScreen()}>
            <View style={{
              flexDirection: "column",
              justifyContent: "center", marginTop: 0, alignItems: 'center', backgroundColor: Color.CHOCOLATE,
              margin: 2,  padding: "5%", borderRadius: 5,
            }}>
              
                <Text style={{ textAlign: 'center' }}><Icon name="users" type="font-awesome" color={Color.TEXT_PRIMARY}  size={RFValue(70, 580)} /> </Text>
                <Text style={{ marginTop: RFValue(15, 580), textAlign: 'center', fontWeight: "bold", color: Color.TEXT_PRIMARY , fontSize: RFValue(15, 580) }}>HR Mobile </Text>
              
            </View>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
            {this.isApproval ? (
              <TouchableOpacity 
              style={{
                flexDirection: "column",
                justifyContent: "center", alignItems: 'center', backgroundColor: Color.GREEN,
                margin: 2,  padding: "5%", borderRadius: 5, flex:1
              }}
              onPress={() => Actions.ApprovalMenuScreen()} >
             
                
                  <Text style={{ textAlign: 'center' }}><Icon name="pencil" type="font-awesome" color={Color.TEXT_PRIMARY}  size={RFValue(50, 580)}  /> </Text>
                  <Text style={{ textAlign: 'center', marginTop: RFValue(15, 580), fontWeight: "bold", color:Color.TEXT_PRIMARY, fontSize: RFValue(15, 580) }}>Approval Management System</Text>
                
            
              </TouchableOpacity>) : (<View />)}
            {this.isBookCoil ? (
              <TouchableOpacity style={{
                flexDirection: "column",
                justifyContent: "center", alignItems: 'center', backgroundColor: Color.BLUE,
                margin: 2,  padding: "5%", borderRadius: 5, flex:1
              }} onPress={() => Actions.BookingCoilScreen()} >
            
                
                  <Text style={{ textAlign: 'center' }}><Icon name="archive" type="material" color={Color.TEXT_PRIMARY}  size={RFValue(50, 580)}  /> </Text>
                  <Text style={{ textAlign: 'center', marginTop: RFValue(15, 580), fontWeight: "bold", color: Color.TEXT_PRIMARY, fontSize: RFValue(15, 580) }}>Booking Coil</Text>
                
            
              </TouchableOpacity>
              ) : (<View />)}
              </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Color.SECONDARY,
    height: RFValue(150, 580),
    padding: 10,
    alignItems:"center"
  },
});
