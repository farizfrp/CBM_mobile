import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import { Calendar } from 'react-native-calendars';
import Api from '../components/Api';
export default class PengajuanCutiScreen extends React.Component {
  profile = global.profile;
  state = {
    alasanValue: "",
    markedDates: {},
    modalVisible: false,
    daysString: "",
    dateNow: '',
    sisaCutiTahunan: 0,
    sisaCutiPengganti: 0
  }
  nextDays = [];
  selectedProp = { selected: true, selectedColor: 'blue' }

  async isDateSelected(date) {
    let index = 0;
    for (const day of this.nextDays) {
      console.log(day)
      if (day == date) {
        this.nextDays.splice(index, 1);
        console.log("sama");
        return true
      }
      index++;
    }
    console.log("tidak ada")
    return false;
  }

  async getSisaCuti() {
    let sisaCuti = await axios.get(Api.Cuti.cek_cuti, {
      params: {
        empno: this.profile.username
      }
    });
    sisaCuti = sisaCuti.data[0];
    this.setState({ sisaCutiTahunan: sisaCuti.jmlh_thn });
    this.setState({ sisaCutiPengganti: sisaCuti.jmlh_ganti });
  }

  formatDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    let result = [year, month, day].join('-');
    this.setState({ dateNow: result });
  }

  arrayDayToString() {
    let value = "";
    for (const day of this.nextDays) {
      value = value + ", " + day;
    }
    value = value + "]";
    value = value.substring(1);
    value = value.substring(1);
    value = "[" + value;
    console.log(value);
    value = value.replace(/-/gi, '');
    this.setState({ daysString: value })
    return value;
  }

  async onDateSelect(date) {
    let isDateSelected = await this.isDateSelected(date);
    let markedDates = this.state.markedDates;
    let dateFix = this.state.markedDates;
    if (!isDateSelected) {
      let newDaysObject1 = { [date]: { selected: true } };
      dateFix = Object.assign(newDaysObject1, markedDates);
      this.nextDays.push(date);
    }
    else {
      let newDaysObject1 = {};
      dateFix = Object.assign(newDaysObject1, markedDates);
      delete dateFix[date];
    }
    this.arrayDayToString();
    this.setState({ markedDates: dateFix });
  }

  async onSubmit() {
    let request = {
      hirar: this.profile.hirar,
      empno: this.profile.username,
      schdt: this.state.daysString,
      note: this.state.alasanValue
    }
    await axios.post(Api.Cuti.create_cuti, request);
    Alert.alert("Berhasil Diajukan");
    Actions.popTo('HRMenuScreen');
  }

  componentDidMount() {
    let date = this.formatDate();
    console.log(date)
    this.getSisaCuti();
  }

  render() {
    return (
      <View>
        <View style={styles.detailItem}>
          <View style={{ justifyContent: "space-around", flexDirection: 'row', margin: 5 }}>
            <View style={{
              margin: 3, flex: 1, padding: 25, backgroundColor: "#FFF", width: "100%", flexDirection: "column", justifyContent: "space-around",
              borderRadius: 15, shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.35,
              shadowRadius: 4.0,
              elevation: 7
            }}>
              <Text style={{ color: "#A0A4A8", fontSize: 20, textAlign: "center" }}>Sisa Cuti Tahunan</Text>
              <Text style={{ fontWeight: "bold", color: "#E52A34", margin: 10, fontSize: 30, textAlign: "center" }}>{this.state.sisaCutiTahunan}</Text>
            </View>
            <View style={{
              margin: 3, flex: 1, padding: 25, backgroundColor: "#FFF", width: "100%", flexDirection: "column", justifyContent: "space-between",
              borderRadius: 15, shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.35,
              shadowRadius: 4.0,
              elevation: 7
            }}>
              <Text style={{ color: "#A0A4A8", fontSize: 20, textAlign: "center" }}>Sisa Cuti Pengganti</Text>
              <Text style={{ fontWeight: "bold", color: "#E52A34", margin: 10, fontSize: 30, textAlign: "center" }}>{this.state.sisaCutiPengganti}</Text>
            </View>
          </View>
          <View style={{
            margin: 3, padding: 25, backgroundColor: "#FFF", width: "100%", flexDirection: "column", justifyContent: "space-between",
            borderRadius: 15, shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.35,
            shadowRadius: 4.0,
            elevation: 7
          }}>
            <View style={{ marginBottom: 15 }} >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#52575C" }}>Tanggal Pengajuan</Text>
              <Text style={{ fontSize: 15, color: "#A0A4A8" }}>{this.state.dateNow}</Text>
              <Modal animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                onBackdropPress={() => {
                  this.setState({ modalVisible: false })
                }}
                onRequestClose={() => { this.setState({ modalVisible: false }) }} >
                <View style={styles.centeredView}>
                  <View style={styles.modalView} >
                    <Calendar onDayPress={(day) => { this.onDateSelect(day.dateString) }} markedDates={this.state.markedDates} />
                  </View>
                </View>
              </Modal>
            </View>

            <View style={{ marginBottom: 10 }} >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#52575C" }}>Tanggal Tidak Masuk Kerja</Text>
              <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
                <Text style={{ fontSize: 15, color: "#A0A4A8" }}>{(this.state.daysString == "") ? "Tanggal" : this.state.daysString}</Text></TouchableOpacity>
            </View>
            <View style={{ marginBottom: 10 }} >
              <Text style={{ fontSize: 15, fontWeight: "bold", color: "#52575C" }}>Keperluan Tidak Masuk Kerja</Text>
              <TextInput
                style={{
                  borderBottomColor: '#31B057',
                  borderBottomWidth: 2,
                }}
                onChangeText={text =>
                  this.setState({ alasanValue: text })
                }
              />
            </View>
          </View>
          <View style={{ marginBottom: 0, justifyContent: "center", marginTop: 30 }}>
            <TouchableOpacity onPress={() => this.onSubmit()}>
              <Text style={{
                width: '100%', height: 40, fontSize: 18, borderRadius: 10,
                backgroundColor: '#31B057', textAlign: "center", textAlignVertical: "center", color: "#F7F7F7"
              }} >
                Ajukan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  centeredView: {
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    margin: 0,
    width: "80%",
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  detailItem: {
    margin: 10,
    padding: 10,
    backgroundColor: "#FFF",
    flexDirection: "column",
    justifyContent: "space-around",
    borderRadius: 0,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});