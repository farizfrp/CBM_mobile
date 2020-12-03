import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Icon } from 'native-base';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modal';
import Api from '../components/Api';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { Color } from '../styles';

const SalesOrderDetailScreen = (props) => { 

  const [modalVisible, setModalVisible] = useState(false);
  const [soDetail, setSODetail] = useState(props.soDetail);
  const [isSoItemListLoading, setIsSoItemListLoading] = useState(false);
  const [soDocList, setSODocList] = useState([]);
  const [soItemList, setSoItemList] = useState([]);
  
  profile = global.profile;

  urlFile = Api.FileUrl;
  async function getSoDocList() {
    let request = { penawaranId: soDetail.PENAWARANID }
    return await axios.post(Api.SalesOrder.approve_so_doc, request);
  }

  async function postApproveSo() {
    let request = {
      userax: profile.userax,
      recid: [soDetail.RECID]
    }
    return await axios.post(Api.SalesOrder.approve_so, request);
  }

  async function getSoItemList() {
    let request = { nomer_so: soDetail.SALESID }
    let result = await axios.get(Api.SalesOrder.approve_detail_so, {
      params: request
    });
    result = result.data;
    return result;
  }

  async function process() {
    let soDocList = await getSoDocList();
    soDocList = soDocList.data;
    console.log(soDocList);
    setSODocList(soDocList)
  
  }

  function format(amount) {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function openFile(filename) {
    console.log(filename)
    const localFile = `${RNFS.DocumentDirectoryPath}/` + filename;
    let url = urlFile + filename;
    const options = {
      fromUrl: url,
      toFile: localFile
    };
    RNFS.downloadFile(options).promise
      .then(() => FileViewer.open(localFile))
      .then(() => {
        // success
      })
      .catch(error => {
        console.log(error)
        // error
      });
  }

  async function onTotalClick() {
    setModalVisible(true)
    setIsSoItemListLoading(true)
    let SoItemList = await getSoItemList();
    console.log("SoItemList", SoItemList)
    setSoItemList(SoItemList)
    setIsSoItemListLoading(false)
  }

  async function onApproveClick() {
    let result = await postApproveSo();
    let status = result.status;
    (status == 200 || status == 201) ?
      (Alert.alert("Berhasil Approve")) :
      (Alert.alert("Gagal"));
    Actions.reset('tabbarx');
    Actions.SalesOrderListScreen();

  }

  useEffect(() => {
    // Update the document title using the browser API
    process();

  }, []);
 
    return (
      <View style={{ flex: 1, backgroundColor:Color.SECONDARY }}>
      <ScrollView style={styles.container}>
        <Modal animationType="slide" transparent={true}
          isVisible={modalVisible}
          transparent={true}
          backdropColor="black"
          backdropOpacity={0.7}
          onBackdropPress={() => {
            setModalVisible(false)
          }}
          onRequestClose={() => {
            setModalVisible(false)
           
          }}
          onRequestClose={() => { }}>
          <View style={styles.centeredView}>
         {isSoItemListLoading? <ActivityIndicator size="large" style={{ alignItems: "center" }} color={Color.BLUE} /> : <View style={styles.modalView}>
              <Text style={{ position: "absolute", top: "3%", right: "1%" }}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon style={{ fontSize: 25, color: 'white' }} name="times-circle" type="FontAwesome" />
                </TouchableOpacity> </Text>

              <FlatList
                data={soItemList}
                renderItem={({ item }) => (
                  <View style={{ marginBottom: 10 }}>
                    <Text style={{ marginTop: 5, fontSize: 15, color: Color.TEXT_PRIMARY }}>Item Name</Text>
                    <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, marginBottom: 2.5 }}>{item.itemname}</Text>
                    <View style={{ flex: 5, flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderColor: Color.TEXT_SECONDARY }}>
                      <View style={{ flex: 1, margin: 4, color: Color.TEXT_PRIMARY }}><Text style={styles.itemTextLabel}>Qty</Text>
                        <Text style={styles.itemTextValue}>{format(parseFloat(item.SALESQTY).toFixed(2))}</Text></View>
                      <View style={{ flex: 1, margin: 4, color: Color.TEXT_PRIMARY }}><Text style={styles.itemTextLabel}>Disc</Text>
                      <Text style={styles.itemTextValue}>{format(parseFloat(item.LINEPERCENT).toFixed(2))}</Text></View>
                      <View style={{ flex: 2, margin: 4, color: Color.TEXT_PRIMARY }}><Text style={styles.itemTextLabel}>Price</Text>
                        <Text style={styles.itemTextValue}>{format((parseFloat(item.LINEAMOUNT) / parseFloat(item.SALESQTY)).toFixed(2))}</Text></View>
                      <View style={{ flex: 3, margin: 4, color: Color.TEXT_PRIMARY }}><Text style={styles.itemTextLabel}>Net Amount</Text>
                        <Text style={styles.itemTextValue}>{format(parseFloat(item.LINEAMOUNT).toFixed(2))}</Text></View>
                    </View>
                  </View>
                )
                }
                keyExtractor={item => item.email}
              />
            </View>}
          </View>
        </Modal>
        <View style={styles.detailItem}>
          <View style={{ justifyContent: "space-around", flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around', flex:3 }}>
              <View>
                <Text style={styles.label}>Sales Order</Text>
                <Text style={styles.labelValue}>{soDetail.SALESID}</Text>

              </View>
              <View>
                <Text style={styles.label}>Sales Name</Text>
                <Text style={styles.labelValue}>{soDetail.SALES_RESP_NAME}</Text>

              </View>
              <View style={{}}>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.labelValue}>{soDetail.CUSTOMER_NAME}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column' , flex:1}}>
              <View>
                <Text style={styles.label}>Branch</Text>
                <Text style={styles.labelValue}>{soDetail.CABANG}</Text>
              </View>
              <View>
                <Text style={styles.label}>Segmen</Text>
                <Text style={styles.labelValue}>{soDetail.SEGMEN}</Text>

              </View>
              <View>
                <Text style={styles.label}>TOP</Text>
                <Text style={styles.labelValue}>{soDetail.PAYMENT}</Text>

              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => { onTotalClick(); }}>
            <Text style={{
              width: '100%', height: 40, fontSize: 20, fontWeight: "bold", borderRadius: 5,
              backgroundColor: Color.BLUE, textAlign: "center", textAlignVertical: "center", color: Color.WHITE
            }} >
              Rp. {format(parseFloat(soDetail.TOTAL))}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 25 }}>
          <Text style={{ fontWeight: "bold", fontSize: 13, marginBottom: 5, color: Color.TEXT_PRIMARY }}>Preview File</Text>
          <View style={{ marginBottom: 15 }}>
            <FlatList
              data={soDocList}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 5 }}>

                  <TouchableOpacity onPress={() => openFile(item.FILENAME)}>
                    <Text style={{
                      width: '100%', height: 40, fontSize: 13, fontWeight: "bold", borderRadius: 10,
                      backgroundColor: Color.CHOCOLATE, textAlign: "left", textAlignVertical: "center", color: Color.TEXT_PRIMARY
                    }} > {"    "}
                      <Icon name="file" type="FontAwesome" style={{ fontSize: 13, color: Color.TEXT_PRIMARY}} />
                      {"  " + item.NAME}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={item => item.email}
            />
          </View>
        </View>

      </ScrollView>
      <View style={{ backgroundColor:Color.SECONDARY, justifyContent: 'flex-end', marginBottom: 25, padding: 10 }}>
          <TouchableOpacity onPress={() => onApproveClick()}>
            <Text style={{
              width: '100%', height: 40, fontSize: 15, fontWeight: "bold", borderRadius: 10,
              backgroundColor: Color.GREEN, textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
            }} >
              <Icon name="check" type="FontAwesome" style={{ fontSize: 18, color: Color.TEXT_PRIMARY }} />  Approve
          </Text>
          </TouchableOpacity>

        </View>

      </View>

    );
  }

  export default SalesOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY
  },
  itemTextValue:{
    backgroundColor: Color.BLUE, 
    fontSize: 15, 
    fontWeight: "bold", 
    textAlign: "center", 
    borderRadius: 2, 
    color: Color.TEXT_PRIMARY
  },
  itemTextLabel:{
    color:Color.TEXT_PRIMARY
  },
  label:
  {
    color: Color.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "bold"
  },
  labelValue: {
    fontSize: 15,
    color: Color.TEXT_SECONDARY,
    color: Color.TEXT_PRIMARY,
    fontSize: 18,
    marginBottom: 10
  },
  detailItem: {
    margin: 25,
    padding: 15,
    backgroundColor: Color.PRIMARY,
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
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {

    width: widthPercentageToDP("98%"),

    marginVertical:0,
    backgroundColor: Color.PRIMARY,
    borderRadius: 0,

    paddingVertical:15,
    paddingHorizontal:2,

    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});