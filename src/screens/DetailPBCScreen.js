import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Api from '../components/Api';
import axios from 'axios';
import Autocomplete from 'react-native-autocomplete-input';
import { Text, Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { Button } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import Modal from 'react-native-modal';
import Spinner from 'react-native-loading-spinner-overlay';
import { Color } from '../styles';

const DetailPBCScreen = (props) => {
  let PBCdata = props.pbcDetail;
  const isBM = props.isBM;
  const [itemSuggestion, setItemSuggestion] = useState([]);
  const [hideResults, setHideResults] = useState([]);
  const [curShowResult, setCurShowResult] = useState(null);
  const [isModalApprove, setIsModalApprove] = useState(false);
  const [type, setType] = useState('');
  const [bgColor, setBGColor] = useState('');
  const [onClick, setOnClick] = useState(() => { });
  const [reason, setReason] = useState('');
  const [spinner, setSpinner] = useState(false);

  const [itemForm, setItemForm] = useState([]);
  const [headerPBC, setHeaderPBC] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const {
    custname,
    status,
    salesname,
    estdate = PBCdata.from_date,
    branch = PBCdata.cabang,
    qty_booking,
    unit,
    ppicnote
  } = headerPBC;

  async function getPBCItem(idcoil) {
    console.log(Api.BookingCoil.detail_pbc)
    return await axios.get(Api.BookingCoil.detail_pbc, {
      params: {
        idcoil
      }
    });
  }

  function formatDate(dateString) {
    if (dateString == "1900-01-01 00:00:00.000") { return ' - ' }
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dateVar = new Date(dateString.replace(' ', 'T'));
    let result = dateVar.getDate() + " " + shortMonths[dateVar.getMonth()] + " " + dateVar.getFullYear();
    console.log("formatDate", result)
    return result;
  }

  async function setItem(bookingid) {
    let item = await getPBCItem(bookingid);
    item = item.data;
    //let item = itemDummy
    setItemForm(item);
    setIsLoading(false)
  }

  useEffect(() => {
    setHeaderPBC(PBCdata);
    console.log("pbcDetail", PBCdata);
    setItem(PBCdata.bookingid);

  }, []);

  const onItemTextChange = (index, key, value) => {
    console.log("i", index)
    itemForm[index][`${key}`] = value
    console.log("item", itemForm)
  }

  const handleInputDetail = (index) => {
    let res = [...itemForm]
    console.log("handleInputDetail", index)
    res[index].isDetailShow = !res[index].isDetailShow
    console.log("handleInputDetail", itemForm[index])
    setItemForm(res)
  }

  async function getItemSearch(keyword) {
    console.log('key', keyword)
    let result = await axios.get(Api.BookingCoil.search_item, {
      params: {
        itemname: keyword
      }
    });
    console.log('getItemSearch', result)
    return result.data;
  }

  const handleSearchItem = async (keyword, index) => {
    let itemSuggestResult = await getItemSearch(keyword);
    console.log("itemSuggestResult", itemSuggestResult)
    let hide = [...hideResults]
    let itemSuggestion = [...itemSuggestion]
    hide[index] = false;
    itemSuggestion[index] = itemSuggestResult;
    setHideResults(hide)
    setItemSuggestion(itemSuggestion)
    setCurShowResult(index)
  }

  const handleItemSelect = (val, index) => {
    let itemFormTemp = [...itemForm]
    itemFormTemp[index].itemname = val.ITEMNAME
    itemFormTemp[index].itemid = val.ITEMID
    setItemForm(itemFormTemp)
    let hide = [...hide]
    hide[index] = true
    setHideResults(hide)
  }

  async function postPBC(postType, reason) {
    request = {
      bookingid: PBCdata.bookingid,
      userax: profile.userax,
      username: profile.username,
      appnote: reason
    }
    setSpinner(true)

    let result = await axios.post(postType, request);
    setSpinner(false)
    return result

  }

  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View style={styles.MainContainer} contentContainerStyle={{ flexGrow: 1 }} >
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
  }

  const cancelPBC = async (reason) => {
    let result = await postPBC(Api.BookingCoil.cancel_pbc, reason);
    if (result) {
      Alert.alert("Coil Dibatalkan.", "Cek status pengajuan anda pada menu booking coil.");
      Actions.popTo('BookingCoilScreen');
      Actions.refresh({})

    }
    else {
      Alert.alert("Gagal Membatalkan Booking Coil.", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('BookingCoilScreen');
      Actions.refresh({})

    }
  }
  const rejectPBC = async (reason) => {
    let result = await postPBC(Api.BookingCoil.notapp_pbc, reason);
    if (result) {
      Alert.alert("Booking Coil Dibatalkan.", "Cek status pengajuan anda pada menu booking coil.");
      Actions.popTo('BookingCoilScreen', { isBM });
      Actions.refresh({})

    }
    else {
      Alert.alert("Gagal Reject Booking Coil.", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('BookingCoilScreen', { isBM });
      Actions.refresh({})

    }
  }

  const approvePBC = async (reason) => {
    let result = await postPBC(Api.BookingCoil.app_pbc, reason);

    if (result) {
      Alert.alert("Booking Coil Disetujui.", "Berhasil Menyetujui Booking Coil");
      Actions.popTo('BookingCoilScreen', { isBM });
      Actions.refresh({})


    }
    else {
      Alert.alert("Gagal Menyetujui Booking Coil", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('BookingCoilScreen', { isBM });
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
  function formatNumber(amount) {
    return Number(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  return (
    <View style={styles.container}>
      <Spinner
        visible={spinner}
        cancelable={true}
        textContent={'Loading...'}
        textStyle={{ color: Color.TEXT_PRIMARY }}
      />
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
              <TouchableOpacity onPress={() => { onClick(reason) }}>
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
      <ScrollView keyboardShouldPersistTaps='always' style={{ flex: 1, marginTop: 0, flexDirection: "column" }}>
        <View style={styles.detailItem}>
          <View style={{ justifyContent: "space-around", flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around', padding: 3 }}>
              <View>
                <Text style={styles.label}>Sales Name</Text>
                <Text style={styles.labelValue}>{salesname}</Text>
              </View>
              <View>
                <Text style={styles.label}>Customer Name</Text>
                <Text style={styles.labelValue}>{custname}</Text>
              </View>
              <View style={{}}>
                <Text style={styles.label}>Branch</Text>
                <Text style={styles.labelValue}>{branch}</Text>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: 'column', padding: 3 }}>
              <View>
                <Text style={styles.label}>ID Booking Coil</Text>
                <Text style={styles.labelValue}>{PBCdata.bookingid}</Text>
              </View>
              <View>
                <Text style={styles.label}>Qty Booking</Text>
                <Text style={styles.labelValue}>{formatNumber(qty_booking) + " " + unit}</Text>
              </View>
              <View>
                <Text style={styles.label}>Estimation Date</Text>
                <Text style={styles.labelValue}>{formatDate(estdate)}</Text>
              </View>
            </View>
          </View>
        </View>
        {status == "3" || status == "5" ?
          <View style={styles.detailItem}>
            <Text style={styles.label}>PPIC Note</Text>
            <Text style={styles.labelValue}>{ppicnote ? ppicnote : " - "}</Text>
          </View> : <View />}
        <ScrollView style={{ flexGrow: 1 }}>
          <Text style={styles.label}>Item List</Text>
          {
            isLoading ? (
              <View style={{
                flex: 1,
                justifyContent: "center"
              }}>
                <ActivityIndicator size="large" style={{ alignItems: "center" }} color={Color.BLUE} />
              </View>) :
              itemForm.length == 0 ? <ListEmpty /> :
                itemForm.map((value, index) => {
                  return (
                    <View style={{
                      borderWidth: 0.5,
                      borderRadius: 3,
                      borderColor: 'grey',
                      padding: 3,
                      borderColor: Color.WHITE,
                      alignItems: "flex-start",
                      marginBottom: 2
                    }}>

                      <Text style={{ color: Color.WHITE, backgroundColor: Color.BLUE, width: "100%" }} > {`Item ${index + 1}`} </Text>
                      <View style={{ flexDirection: 'row', backgroundColor: Color.PRIMARY, flex: 1 }}>
                        <Autocomplete
                          editable={false}
                          onFocus={() => {
                            console.log("triggered")
                            let hideTemp = [...hideResults]
                            hideTemp[curShowResult] = true
                            setHideResults(hideTemp)
                          }}
                          style={[{ width: wp("90%"), color: Color.TEXT_PRIMARY }]}
                          inputContainerStyle={{ borderWidth: 0 }}
                          placeholder={'Item Name'}
                          data={itemSuggestion[index]}
                          hideResults={hideResults[index]}
                          defaultValue={itemForm[index].itemname}
                          onChangeText={text => handleSearchItem(text, index)}
                          renderItem={({ item, i }) => {
                            return (
                              <TouchableOpacity onPress={() => handleItemSelect(item, index)}>
                                <Text style={{ color: "black", fontSize: 18 }}>{`(${item.ITEMID}) ${item.ITEMNAME}`}</Text>
                              </TouchableOpacity>
                            )
                          }}
                        />
                        <Icon name={!itemForm[index].isDetailShow ? 'arrow-drop-down' : 'arrow-drop-up'} color={Color.TEXT_PRIMARY} size={hp("2%")}
                          onPress={() => handleInputDetail(index)} containerStyle={{ marginRight: 3 }} iconStyle={{ textAlignVertical: "center", fontSize: 30 }}></Icon>
                      </View>
                      {itemForm[index].isDetailShow ? (
                        // type, tebal, lebar, az, item color, supplier, qty booking, item note,
                        <View style={{ alignSelf: "flex-end" }}>
                          <Text style={styles.itemTextLabel} >{"Jenis"}</Text>
                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{itemForm[index].jenis}</Text>
                          </View>
                          <Text style={styles.itemTextLabel} >{"Tebal"}</Text>
                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{formatNumber(itemForm[index].tebal)}</Text>
                          </View>
                          <Text style={styles.itemTextLabel} >{"Lebar"}</Text>
                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{formatNumber(itemForm[index].lebar)}</Text>
                          </View>

                          <Text style={styles.itemTextLabel} >{"Az"}</Text>



                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{itemForm[index].az}</Text>
                          </View>
                          <Text style={styles.itemTextLabel} >{"Color"}</Text>
                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{itemForm[index].itemcolor}</Text>
                          </View>
                          <Text style={styles.itemTextLabel} >{"Supplier"}</Text>
                          <View style={styles.valueContainer}>
                            <Text style={styles.textItemValue} >{itemForm[index].supplier}</Text>
                          </View>


                          <Text style={styles.itemTextLabel} >{"Quantity Booking"}</Text>
                          <View style={[styles.valueContainer, { flexDirection: "row" }]}>
                            <Text style={styles.textItemValue} >{formatNumber(itemForm[index].qty_booking) + " " + itemForm[index].unit}</Text>

                          </View>
                        </View>
                      ) : (<View />)}
                    </View>
                  )
                })
          }
        </ScrollView>
      </ScrollView>

      {
        isBM ? <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Button
            containerStyle={{ flex: 1, margin: 3 }}
            style={[styles.TouchableOpacityStyle]}
            buttonStyle={{ backgroundColor: "red" }}
            onPress={() =>
              onModalClick("Reject", () => rejectPBC, 'red')
            }
            title="Reject"
          />
          <Button
            containerStyle={{ flex: 1, margin: 3 }}
            style={[styles.TouchableOpacityStyle]}
            buttonStyle={{ backgroundColor: "green" }}
            onPress={() =>
              onModalClick("Approve", () => approvePBC, 'green')
            }
            title="Approve"
          />
        </View> :
          PBCdata.status == 0 ? <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Button
              containerStyle={{ flex: 1, margin: 3 }}
              style={[styles.TouchableOpacityStyle]}
              buttonStyle={{ backgroundColor: "red" }}
              onPress={() =>
                onModalClick("Cancel", () => cancelPBC, 'red')
              }
              title="Cancel"
            /></View> : <View />
      }
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    backgroundColor: "#2e2b2b",
    padding: 10,
    paddingTop: 0
  },
  detailItem: {
    alignSelf: 'center',
    padding: 15,
    marginBottom: hp("1%"),
    backgroundColor: "#454343",
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-around",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    }
  },
  itemTextLabel: {
    color: Color.TEXT_PRIMARY,
    width: "80%",
    marginTop: 6
  },
  label:
  {
    color: Color.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "normal"
  },
  labelValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: Color.TEXT_SECONDARY,
    color: "white",
    fontSize: 18,
    marginBottom: 10
  },
  valueContainer:
  {
    marginTop: 0,
    marginBottom: 3,
    backgroundColor: Color.SECONDARY,
    borderWidth: 0.5,
    borderColor: Color.WHITE,
    borderRadius: 5,
    padding: 10
  },
  textItemValue:
  {
    width: wp("80%"),
    color: Color.TEXT_PRIMARY,
    textAlign: "right",
    fontSize: 20
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },

  TouchableOpacityStyle: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
  },

  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },


})
export default DetailPBCScreen;