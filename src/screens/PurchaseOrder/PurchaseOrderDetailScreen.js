import React, { useState, useEffect } from 'react';
import { useGlobal } from 'reactn';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { Icon } from 'native-base';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modal';
import Api from '../../components/Api';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Color } from '../../styles';
import { purchaseOrderDetailItemSPD, purchaseOrderDetailItemSPN } from '../../data/dummy/purchaseOrder/purchaseOrderDetail';
import { NumberHelper } from '../../helper';

const PurchaseOrderDetailScreen = (props) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [poDetail, setPODetail] = useState(props.poDetail);
  const [isSoItemListLoading, setIsSoItemListLoading] = useState(false);
  const [poDocList, setPODocList] = useState([]);
  const [poItemList, setPOItemList] = useState([]);

  const [isModalApprove, setIsModalApprove] = useState(false);
  const [type, setType] = useState('');
  const [bgColor, setBGColor] = useState('');
  const [onClick, setOnClick] = useState(() => { });
  const [reason, setReason] = useState('');

  const [poCount, setPOCount] = useGlobal('poCount');

  profile = global.profile;

  async function getPODocList(purchid) {
    let request = { purchid: purchid }
    return await axios.post(Api.PurchaseOrder.get_file, request);
  }

  async function updatePO(reason, type) {
    let request = {
      userax: profile.userax,
      purchid: [poDetail.PURCHID],
      reason,
      type: type
    }

    return await axios.post(Api.PurchaseOrder.update, request);
  }

  async function getPOItemList() {
    let request = { purchid: poDetail.PURCHID }
    let result = await axios.get(Api.PurchaseOrder.get_item, {
      params: request
    });
    result = result.data;
    return result;
  }

  async function process() {
    //let itemList = purchaseOrderDetailItemSPN;
    let itemList = await getPOItemList();
    setPOItemList(itemList)
    console.log("props.PURCHID", poDetail.PURCHID)
    let poDocList = await getPODocList(poDetail.PURCHID);
    setPODocList(poDocList.data)
  }

  function format(amount) {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  function openFile(filename) {
    console.log(filename)
    const localFile = `${RNFS.DocumentDirectoryPath}/` + filename;
    const options = {
      fromUrl: Api.FileUrl + filename,
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

  const rejectPBC = async (reason, type) => {
    let result = await updatePO(reason, type);
    setPOCount(poCount-1)
  
    if (result) {
      Alert.alert("Purchase Order Dibatalkan.", "Cek status pengajuan anda pada menu Purchase Order.");
      Actions.popTo('PurchaseOrderListScreen');
      Actions.refresh({})

    }
    else {
      Alert.alert("Gagal Reject Purchase Order.", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('PurchaseOrderListScreen');
      Actions.refresh({})

    }
  }

  const approvePBC = async (reason, type) => {
    let result = await updatePO(reason, type);
    setPOCount(poCount-1)
    
    if (result) {
      Alert.alert("Purchase Order Disetujui.", "Berhasil Menyetujui Purchase Order");
      Actions.popTo('PurchaseOrderListScreen');
      Actions.refresh({})


    }
    else {
      Alert.alert("Gagal Menyetujui Purchase Order", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('PurchaseOrderListScreen');
      Actions.refresh({})

    }
  }

  function onModalClick(types, onClicks, bgColor) {
    console.log("onModal Clickkkkkk")
    setType(types)
    setOnClick(onClicks)
    setBGColor(bgColor)
    setIsModalApprove(true)
  }

  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View style={styles.MainContainer} contentContainerStyle={{ flexGrow: 1 }} >
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.GREY, fontSize: 12, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
  }

  const ItemList = (itemProps) => {
    itemProps = itemProps.item
    // console.log(itemProps)
    return (
      //View to show when list is empty
      <View style={styles.itemList} >
        <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15, fontWeight: "bold" }}>{itemProps.NAME}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: Color.GREY, fontSize: 13 }}>{NumberHelper.formatDecimal(itemProps.BASEQTY)}</Text>
            <Text style={{ color: Color.GREY, fontSize: 13 }}> {itemProps.PURCHUNIT}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            {itemProps.QTYFISIK ? <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15, fontWeight: "bold" }}>{NumberHelper.formatDecimal(itemProps.QTYFISIK)}</Text> : <View />}
            {itemProps.INVENTSERIALID ? <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}> | {NumberHelper.formatDecimal(itemProps.INVENTSERIALID)}</Text> : <View />}
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15, fontWeight: "bold" }}>{`${NumberHelper.currencyConverter(itemProps.CURRENCYCODE)}${NumberHelper.formatDecimal(itemProps.PURCHPRICE)}`}</Text>
          <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>{itemProps.INVENTLOCATIONID}</Text>
        </View>

        <View
          style={{
            borderColor: Color.GREY,
            marginTop: 10,
            borderWidth: 0.2,
            width: "100%"
          }}
        />
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: Color.GREY, fontSize: 15 }}>Total </Text>
          <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.SKY, fontSize: 15, fontWeight: "bold" }}>{NumberHelper.currencyConverter(itemProps.CURRENCYCODE)}{NumberHelper.formatDecimal(itemProps.LINEAMOUNT)}</Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    // Update the document title using the browser API
    process();

  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Color.SECONDARY }}>
      <Modal isVisible={isModalApprove}
        style={{ flex: 1 }}
        onBackdropPress={() => {
          setIsModalApprove(false)
        }}
      >
        <View style={{ justifyContent: "space-around", alignItems: "center", backgroundColor: "grey", height: hp("30%"), borderColor: Color.TEXT_PRIMARY }}>
          <Text style={{
            padding: 5, fontSize: 15, fontWeight: "bold", textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
          }} >
            {type}
          </Text>
          <TextInput
            style={{ borderColor: Color.TEXT_PRIMARY, borderWidth: 3, borderRadius: 5, color: Color.TEXT_PRIMARY, width: "80%" }}
            multiline
            numberOfLines={4}
            placeholder="Type here to fill the reason"
            placeholderTextColor="white"
            onChangeText={(text) => setReason(text)}
            defaultValue={''}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: "80%", padding: 10 }}>
            <View style={{ width: "45%", backgroundColor: bgColor, padding: 5, borderRadius: 10 }}>
              <TouchableOpacity onPress={() => { onClick(reason, type) }}>
                <Text style={{
                  padding: 5, fontSize: 15, fontWeight: "bold", textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
                }} >
                  {type}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View style={styles.detailItem}>
          <View style={{ justifyContent: "space-around", flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around', flex: 3 }}>
              <View>
                <Text style={styles.label}>ID</Text>
                <Text style={styles.labelValue}>{poDetail.PURCHID}</Text>

              </View>
              <View>
            
              <Text style={styles.label}>Data Area</Text>
                <Text style={styles.labelValue}>{poDetail.DATAAREAID}</Text>
              </View>
              <View style={{}}>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.labelValue}>{poDetail.ACCOUNTNAME}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'column', flex: 1 }}>
            
              <View>
                <Text style={styles.label}>Proposed By</Text>
                <Text style={styles.labelValue}>{poDetail.CREATEDBY}</Text>
              </View>

              <View>
                <Text style={styles.label}>TOP</Text>
                <Text style={styles.labelValue}>{poDetail.PAYMENT}</Text>

              </View>
            </View>
          </View>
          <Text style={{
            width: '100%', height: 40, fontSize: 20, fontWeight: "bold", borderRadius: 5,
            backgroundColor: Color.SKY, textAlign: "center", textAlignVertical: "center", color: Color.WHITE
          }} >
            {NumberHelper.currencyConverter(poDetail.CURRENCYCODE)}{format(parseFloat(poDetail.AMOUNT))}
          </Text>
        </View>

        <View style={{ padding: 25, paddingVertical: 0 }}>
          <Text style={{ fontWeight: "bold", fontSize: 13, marginBottom: 5, color: Color.TEXT_PRIMARY }}>Item List</Text>
          <View style={{ marginBottom: 15 }}>
            <FlatList
              data={poItemList}
              renderItem={ItemList}
              ListEmptyComponent={ListEmpty}
              keyExtractor={item => item.email}
            />
          </View>
        </View>

        <View style={{ padding: 25, paddingVertical: 0 }}>
          <Text style={{ fontWeight: "bold", fontSize: 13, marginBottom: 5, color: Color.TEXT_PRIMARY }}>Preview File</Text>
          <View style={{ marginBottom: 15 }}>
            <FlatList
              data={poDocList}
              ListEmptyComponent={ListEmpty}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 5 }}>
                  <TouchableOpacity onPress={() => openFile(item.FILENAME)}>
                    <Text style={{
                      width: '100%', height: 40, fontSize: 13, fontWeight: "bold", borderRadius: 10,
                      backgroundColor: Color.CHOCOLATE, textAlign: "left", textAlignVertical: "center", color: Color.TEXT_PRIMARY
                    }} > {"    "}
                      <Icon name="file" type="FontAwesome" style={{ fontSize: 13, color: Color.TEXT_PRIMARY }} />
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
      <View style={{ backgroundColor: Color.SECONDARY, flexDirection: "row", justifyContent: "center", marginBottom: 25, padding: 10 }}>
        <Button
          containerStyle={{ flex: 1, margin: 3 }}
          buttonStyle={{ backgroundColor: "red" }}
          onPress={() =>
            onModalClick("Reject", () => rejectPBC, 'red')
          }
          title="Reject"
        />
        <Button
          containerStyle={{ flex: 1, margin: 3 }}
          buttonStyle={{ backgroundColor: "green" }}
          onPress={() =>
            onModalClick("Approve", () => approvePBC, 'green')
          }
          title="Approve"
        />

      </View>
    </View>

  );
}

export default PurchaseOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
  
    backgroundColor: Color.SECONDARY
  },
  itemTextValue: {
    backgroundColor: Color.BLUE,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 2,
    color: Color.TEXT_PRIMARY
  },
  itemTextLabel: {
    color: Color.TEXT_PRIMARY
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
  itemList: {
    marginBottom: hp("1%"),
    padding: 15,
    backgroundColor: Color.PRIMARY,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-around",
    flexDirection: "column",
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
  detailItem: {
    margin: 25,
    marginTop:0,
    marginBottom:5,
    padding: 15,
    backgroundColor: Color.PRIMARY,  
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
  TouchableOpacityStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    width: wp("98%"),
    marginVertical: 0,
    backgroundColor: Color.PRIMARY,
    borderRadius: 0,
    paddingVertical: 15,
    paddingHorizontal: 2,
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