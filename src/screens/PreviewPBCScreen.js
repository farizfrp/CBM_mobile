import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Api from '../components/Api';
import axios from 'axios';
import Autocomplete from 'react-native-autocomplete-input';
import { Text, Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useGlobal, setGlobal } from 'reactn';
import { Button } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import Spinner from 'react-native-loading-spinner-overlay';
import { Color } from '../styles';


//axios.defaults.timeout = 5;

const PreviewPBCScreen = () => {
  const [itemSuggestion, setItemSuggestion] = useState([]);
  const [hideResults, setHideResults] = useState([]);
  const [curShowResult, setCurShowResult] = useState(null);
  const [spinner, setSpinner] = useState(false);
  const [isModalApprove, setIsModalApprove] = useState(false);

  const [itemForm, setItemForm] = useGlobal('itemForm');
  const [headerPBC, setHeaderPBC] = useGlobal('headerPBC');
  const [reservedBookingId, setReservedBookingId] = useGlobal('reservedBookingId');

  const {
    custnum,
    qty_booking,
    custname,
    salesnum,
    salesname,
    estdate,
    branch } = headerPBC;

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

  function formatDate(dateString) {
    if (dateString == "1900-01-01 00:00:00.000") { return ' - ' }
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dateVar = new Date(dateString);
    let result = dateVar.getDate() + " " + shortMonths[dateVar.getMonth()] + " " + dateVar.getFullYear();
    console.log("formatDate", result)
    return result;
  }

  async function postPBC() {
    let request = {
      bookingid: reservedBookingId,
      qty_booking,
      qty_estimation:0,
      custnum,
      custname,
      salesnum,
      salesname,
      branch,
      unit:itemForm[0].unit,
      username: profile.username,
      to_date: new Date(estdate),
      item: itemForm
    }
    //console.log(request)
    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();
    setTimeout(() => {
      source.cancel();
    }, 1000 * 10);

    let result = await axios.post(Api.BookingCoil.submit_pbc_sales, request, { cancelToken: source.token, timeout: 1000 * 1 }).then((res) => {
      console.log("berhasil", res)
      return res;
    }
    ).catch(
      (err) => {
        console.log("gagal", err)
        return false;
      }
    )
    return result;
  }

  function formatNumber(amount) {
    return Number(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const submitPBC = async () => {
    setSpinner(true)
    let result = await postPBC();
    setSpinner(false);
    console.log("result", result)

    if (result) {
      console.log("result", result.data)
      result.data == "Data done" ?
        Alert.alert("Coil Berhasil Diajukan. 👍", "Cek status pengajuan anda pada menu booking coil.") :
        Alert.alert("Duplikasi Booking Coil !😳 ", "Silahkan cek status booking anda.");
      Actions.popTo('BookingCoilScreen');
      Actions.refresh({ propName: 'a' })
      setGlobal({ itemForm: [], headerPBC: {}, reservedBookingId: null })
    }
    else {
      Alert.alert("Gagal Mengajukan Coil. 😔", "Silahkan Coba beberapa saat lagi.");
      Actions.popTo('BookingCoilScreen');
      Actions.refresh({ propName: 'a' })
    }
  }
  useEffect(() => {
  }, []);

  return (

    <View style={styles.container}>
      <Spinner
        visible={spinner}
        cancelable={true}
        textContent={'Loading...'}
        textStyle={{ color: Color.TEXT_PRIMARY }}
      />

      <ScrollView keyboardShouldPersistTaps='always' style={{ flex: 1, marginTop: 0, flexDirection: "column" }}>
        <View style={styles.detailItem}>
          <View style={{ justifyContent: "space-around", flexDirection: 'row' }}>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
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
                <Text style={styles.labelValue}>{reservedBookingId}</Text>
              </View>
              <View>
                <Text style={styles.label}>Qty Booking </Text>
                <Text style={styles.labelValue}>{formatNumber(qty_booking) + " "+ (itemForm.length?itemForm[0].unit:'null') }</Text>
              </View>
              <View>
                <Text style={styles.label}>Estimation Date</Text>
                <Text style={styles.labelValue}>{formatDate(estdate)}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView style={{ flexGrow: 1 }}>
          <Text style={styles.label}>Item List</Text>
          {
            itemForm.map((value, index) => {

              return (
                <View style={{
                  borderWidth: 0.5,
                  borderRadius: 3,
                  borderColor: Color.GREY,
                  padding: 3,
                  borderColor: Color.TEXT_PRIMARY,
                  alignItems: "flex-start",
                  marginBottom: 2
                }}>

                  <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.BLUE, width: "100%" }} > {`Item ${index + 1}`} </Text>
                  <View style={{ flexDirection: 'row', backgroundColor: Color.PRIMARY, flex: 1 }}>
                    <Autocomplete
                      editable={false}
                      onFocus={() => {
                        console.log("triggered")
                        let hideTemp = [...hideResults]
                        hideTemp[curShowResult] = true
                        setHideResults(hideTemp)
                      }}
                      style={[{ width: wp("90%"), color: "white" }]}
                      inputContainerStyle={{ borderWidth: 0 }}
                      placeholder={'Item Name'}
                      data={itemSuggestion[index]}
                      hideResults={hideResults[index]}
                      defaultValue={` ${itemForm[index].itemname}`}
                      onChangeText={text => handleSearchItem(text, index)}
                      renderItem={({ item, i }) => {
                        return (
                          <TouchableOpacity onPress={() => handleItemSelect(item, index)}>
                            <Text style={{ color: "black", fontSize: 18 }}>{`(${item.ITEMID}) ${item.ITEMNAME}`}</Text>
                          </TouchableOpacity>
                        )
                      }}
                    />
                    <Icon name={!itemForm[index].isDetailShow ? 'arrow-drop-down' : 'arrow-drop-up'} color="white" size={hp("2%")}
                      onPress={() => handleInputDetail(index)} containerStyle={{ marginRight: 3 }} iconStyle={{ textAlignVertical: "center", fontSize: 30 }}></Icon>
                  </View>
                  {itemForm[index].isDetailShow ? (
                    <View style={{ alignSelf: "flex-end" }}>
                    <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Jenis"}</Text>
                    <View style={styles.valueContainer}>
                         <Text style={styles.textItemValue} >{itemForm[index].jenis}</Text>
                       </View>
                       <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Tebal"}</Text>
                   <View style={styles.valueContainer}>
                   <Text style={styles.textItemValue} >{formatNumber(itemForm[index].tebal)}</Text>
                   </View>
                   <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Lebar"}</Text>
                   <View style={styles.valueContainer}>
                   <Text style={styles.textItemValue} >{formatNumber(itemForm[index].lebar)}</Text>
                   </View>
                   <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Az"}</Text>
                   <View style={styles.valueContainer}>
                     <Text style={styles.textItemValue} >{itemForm[index].az}</Text>
                   </View>
                   <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Color"}</Text>
                   <View style={styles.valueContainer}>
                   <Text style={styles.textItemValue} >{itemForm[index].itemcolor}</Text>
                   </View>
                   <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Supplier"}</Text>
                   <View style={styles.valueContainer}>
                     <Text style={styles.textItemValue} >{itemForm[index].supplier}</Text>
                   </View>
                   
           
                   <Text style={{ color: Color.TEXT_PRIMARY, width: "80%", marginTop: 6 }} >{"Quantity Booking"}</Text>
                   <View style={styles.valueContainer}>
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
      <Button
        buttonStyle={{ backgroundColor: Color.BLUE }}
        onPress={() => {
          submitPBC()
        }}
        title="Submit"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'center',
    backgroundColor: Color.SECONDARY,
    padding: 10,
    paddingTop: 0
  },
  spinnerTextStyle: {
    color: Color.TEXT_PRIMARY
  },
  detailItem: {
    alignSelf: 'center',
    padding: 15,
    marginBottom: 5,
    backgroundColor: Color.PRIMARY,
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-around",
    borderRadius: 5,
    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    }
  },
  label:
  {
    color: "white",
    fontSize: 15,
    fontWeight: "bold"
  },
  labelValue: {
    fontSize: 15,
    color: Color.TEXT_SECONDARY,
    color: "white",
    fontSize: 18,
    marginBottom: 10
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
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

  buttonContainer: {
    marginTop: hp("1%"),
    height: hp("5%"),
    flexDirection: 'row',
    color: "white",
    alignItems: 'center',
    marginBottom: "5%",
    borderRadius: 5,
    backgroundColor: Color.PRIMARY,
  }
})
export default PreviewPBCScreen;