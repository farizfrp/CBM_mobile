import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Alert } from 'react-native';
import axios from 'axios';
import Api from '../components/Api';
import { Color } from '../styles';
import { Actions } from 'react-native-router-flux';

export default class MaxDiscDetailScreen extends React.Component {
  profile = global.profile;
  state = {
    modalVisible: false,
    singlemaxdisc: {},
    isApproveSuccess: false,
    isLoading: true
  }

  async changeFormatNumber(data) {
    data.MAXDISCOUNT = parseFloat(data.MAXDISCOUNT).toFixed(2);
    data.MASTERMAXDISC = parseFloat(data.MASTERMAXDISC).toFixed(2);
    data.PRICELIST = parseFloat(data.PRICELIST).toFixed(2);
    data.LASTMAXDISC = parseFloat(data.LASTMAXDISC).toFixed(2);
    return data;
  }

  async getMaxDiscList() {
    return axios.get(Api.MaxDisc.filter_cabang, {
      params: {
        userax: this.profile.userax
      }
    });
  }
  
  async approveMaxDiscList() {
    let request = {
      userax: profile.userax,
      recid: [this.state.singlemaxdisc.RECID]
    }
    axios.post(Api.MaxDisc.update_max_disc, request);
  }

  async rejectMaxDiscList() {
    let request = { recid: this.state.singlemaxdisc.RECID }
    axios.post(Api.MaxDisc.reject_max_disc, request);
  }
  async process() {
    console.log(this.props.MDdetail)
    this.setState({ isLoading: true })
    let datamaxdisc = this.props.MDdetail;
    datamaxdisc = await this.changeFormatNumber(datamaxdisc);
    this.setState({ isLoading: false });
    console.log(datamaxdisc);
    this.setState({ singlemaxdisc: datamaxdisc });
  }
  showModalAccept() {
    this.setState({
      isApproveSuccess: true
    });
    setTimeout(() => {
      this.setState({
        isApproveSuccess: false
      })
    }, 1000);
  }

  async componentDidMount() {
    await this.process();
  }
  render() {
    return (
      <View style={styles.centeredView}>
        <View style={styles.detailItem}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around', marginBottom: 5 }}>
              <View>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Contact ID</Text>
                <Text style={{ fontSize: 15, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{this.state.singlemaxdisc.PENAWARANID}</Text>
              </View>
              <View>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Customer Name</Text>
                <Text style={{ fontSize: 15, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{this.state.singlemaxdisc.NAME}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column', marginLeft: 15 }}>
              <View>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Branch </Text>
                <Text style={{ fontSize: 15, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{this.state.singlemaxdisc.CABANG}</Text>
              </View>
              <View>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Price List</Text>
                <Text style={{ fontSize: 15, color: Color.TEXT_PRIMARY, fontSize: 18 }}>Rp. {this.state.singlemaxdisc.PRICELIST}</Text>

              </View>
            </View>

          </View>
          <View style={{marginBottom:5}}>
            <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Item Name</Text>
            <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 18 }}>{this.state.singlemaxdisc.ITEMNAME}</Text>
            <Text>{"\n"}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: "space-around" }}>
            <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
              <Text style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Color.WARNING, textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY }}>{this.state.singlemaxdisc.MASTERMAXDISC}</Text>
              <Text style={{ textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY }} >Master</Text>
            </View>
            <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
              <Text style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Color.YELLOW, textAlign: "center", textAlignVertical: "center", color: "#F7F7F7" }}>{this.state.singlemaxdisc.LASTMAXDISC}</Text>
              <Text style={{ textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY }} >Last</Text>
            </View>
            <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
              <Text style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: Color.SKY, textAlign: "center", textAlignVertical: "center", color: "#F7F7F7" }}>{this.state.singlemaxdisc.MAXDISCOUNT}</Text>
              <Text style={{ textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY }} >Propose</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', bottom: 0, marginTop: 30 }}>
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "crimson" }}
              onPress={() => {
                this.rejectMaxDiscList();
                Alert.alert("Berhasil Reject");
                Actions.pop()
              }}>
              <Text style={styles.textStyle}>Reject</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={{ ...styles.openButton, backgroundColor: "forestgreen" }}
              onPress={() => {
                this.approveMaxDiscList();
                Alert.alert("Berhasil Approve");
                Actions.pop()
              }}>
              <Text style={styles.textStyle}>Accept</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  detailItem: {
    margin: 25,
    padding: 15,
    backgroundColor: "grey",
    width: "90%",

    flexDirection: "column",
    justifyContent: "space-around",
    borderRadius: 5,
    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4.0,
    elevation: 7,
  },
  openButton: {
    width: "45%",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  centeredView: {
    backgroundColor:Color.SECONDARY,
  
    flex:1,
   
  },
  modalView: {
    height: "50%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 0,
    padding: 20,
    alignItems: "center",
    shadowColor: Color.BLACK,

    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
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