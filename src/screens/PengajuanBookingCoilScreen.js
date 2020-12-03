import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Keyboard, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Api from '../components/Api';
import Cabang from '../components/Cabang';
import axios from 'axios';
import Autocomplete from 'react-native-autocomplete-input';
import { Actions } from 'react-native-router-flux';
import { Profiler, useGlobal } from 'reactn';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button, Icon } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Color } from "../styles";

const PengajuanBookingCoilScreen = () => {

  const [customerSuggestion, setCustomerSuggestion] = useState([]);
  const [salesSuggestion, setSalesSuggestion] = useState([]);
  const [hideCustomerResults, setHideCustomerResults] = useState(false);
  const [hideSalesResults, setHideSalesResults] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [headerPBC, setHeaderPBC] = useGlobal('headerPBC');
  const [reservedBookingId, setReservedBookingId] = useGlobal('reservedBookingId');
  const [spinner, setSpinner] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [keyboardDidShow, setKeyboardDidShow] = useState(false);
  /*-----Comment_Example------*/
  const [branch, setBranch] = useState(Cabang.map(c => ({ label: c.cabang_ax, value: c.cabang_ax })));

  const buttonMargin = 20;
  useEffect(() => {
    if (!reservedBookingId) {
      reserveID()
    }
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
    console.log(branch)
    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => {
    console.log("keyyy show")
    setKeyboardDidShow(true)
  };

  const _keyboardDidHide = () => {
    console.log("keyyy HIDEEE")
    setKeyboardDidShow(false)
  };


  async function getCustomerSearch(keyword) {
    console.log('key', keyword)
    let result = await axios.get(Api.BookingCoil.search_customer, {
      params: {
        custname: keyword,
        custnum: ''
      }
    });
    return result.data;
  }


  async function getBookingID() {
    let result = await axios.post(Api.BookingCoil.reserve_id_pbc, {
      params: {
        username: Profiler.username,
      }
    });
    return result;
  }


  async function reserveID() {
    setSpinner(true)
    let result = await getBookingID();
    if ((result.status == 200 || result.status == 201) && result.data) {
      result = result.data[0];
      setReservedBookingId(result.bookingid)
      setSpinner(false)
    }

    setSpinner(false)
  }

  const handleSearchCust = async (keyword) => {
    console.log(headerPBC.custname)
    let custSuggest = await getCustomerSearch(headerPBC.custname);

    setCustomerSuggestion(custSuggest)
    setHideCustomerResults(false)
    console.log("customerSuggestion", custSuggest)
    console.log("customerSuggestion", customerSuggestion)
  }

  async function getSalesSearch(keyword) {
    console.log('key', keyword)
    let result = await axios.get(Api.BookingCoil.search_sales, {
      params: {
        salesname: keyword,
      }
    });

    return result.data;
  }

  const handleSearchSales = async (keyword) => {
    let salesSuggest = await getSalesSearch(keyword);

    setSalesSuggestion(salesSuggest)
    setHideSalesResults(false)
    console.log("salesSuggest", salesSuggest)
    console.log("salesSuggest", salesSuggestion)
  }

  const handleInput = async (key, value) => {
    let tempValue = headerPBC;
    tempValue[`${key}`] = value;
    setHeaderPBC(tempValue)
  }

  function formatDate(dateString) {
    if (dateString == "") { return ' - ' }
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dateVar = new Date(dateString);
    let result = dateVar.getDate() + " " + shortMonths[dateVar.getMonth()] + " " + dateVar.getFullYear();
    return result;
  }

  const handleDateChange = async (dateString) => {
    let tempValue = headerPBC;
    let value = { [dateString]: { selected: true } };
    tempValue[`selectedDate`] = value;
    tempValue[`estdate`] = dateString;
    setHeaderPBC(tempValue)
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        extraHeight={1000}
        style={{ flex: 1 }}>

        <Spinner
          visible={spinner}
          cancelable={true}
          textContent={'Loading...'}
          textStyle={{ color: Color.TEXT_PRIMARY }}
        />
        <View style={
          {
            margin: 0,
            padding: 0
          }}>
          <Text style={{ color: Color.TEXT_SECONDARY }} > {"Booking ID"} </Text>
          <View style={styles.buttonContainer}>
            <Text style={{ color: Color.TEXT_PRIMARY }} > {reservedBookingId} </Text>
          </View>
        </View>
        <View style={{
          marginBottom: buttonMargin,
          ...(Platform.OS !== 'android' && {
            zIndex: 10
          }),
        }}>
          <Text style={{ color: Color.TEXT_SECONDARY }} > {"Cabang"} </Text>
          <DropDownPicker
            items={branch}
            searchable={false}
            placeholder="Select Branch"
            //  defaultValue={headerPBC.branch}
            placeholderStyle={{ paddingHorizontal: 0, marginLeft: 0, color: Color.GREY }}
            dropDownStyle={{ backgroundColor: Color.PRIMARY }}
            itemStyle={{ borderBottomColor: Color.TEXT_PRIMARY, borderBottomWidth: 0.5, height: "15%" }}
            labelStyle={{ color: Color.TEXT_PRIMARY }}
            zIndex={4000}
            containerStyle={{ height: hp("6%") }}
            style={{
              backgroundColor: Color.PRIMARY,
              borderColor: !headerPBC.branch && isCheck ? "red" : "grey",
              borderRadius: 5
            }}
            onChangeItem={(item, index) => {
              console.log(item)
              handleInput('branch', item.value)
              console.log(headerPBC)
            }} />

        </View>
        <View style={{
          marginBottom: buttonMargin
        }}>
          <View style={{ flexDirection: "row", width: "100%" }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Text style={{ color: Color.TEXT_SECONDARY }} > {`${isNewCustomer ? 'New Customer:' : 'Customer:'}`} </Text>
              <Text style={{ color: Color.TEXT_PRIMARY }} > {`${isNewCustomer ? 'NE01' : (headerPBC.custnum) ? headerPBC.custnum : 'Not Selected'}`} </Text>
            </View>
            <TouchableOpacity style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}
              onPress={() => {
                if (isNewCustomer) {
                  handleInput('custnum', '')
                  setIsNewCustomer(false)
                  setHideCustomerResults(false)
                }
                else {
                  handleInput('custnum', 'NE01')
                  setIsNewCustomer(true)
                  setHideCustomerResults(true)
                }
              }}>
              <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: "chocolate", textAlign: "center", paddingHorizontal: 5, borderRadius: 3 }}>
                {(headerPBC.custnum == "NE01") ? "Existing Customer" : "New Customer"} </Text>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: "row", backgroundColor: Color.PRIMARY, borderWidth: 1, width: "100%",
            borderRadius: 5, borderColor: (!headerPBC.custnum || !headerPBC.custname) && isCheck ? 'red' : 'grey'
          }}>
            <Autocomplete
              style={[styles.buttonContainer, { marginBottom: 0, width: wp("85%") }]}
              onBlur={() => setHideCustomerResults(true)}
              onFocus={() => {
                console.log("onFocus")
                isNewCustomer ? setHideCustomerResults(true) :
                  setHideCustomerResults(false)
              }}
              onEndEditing={() => setHideCustomerResults(true)}
              placeholder={isNewCustomer ? 'Type Customer Name' : 'Select Customer'}
              placeholderTextColor={Color.TEXT_SECONDARY}
              // listContainerStyle={{height:"50%"}}
              flatListProps={{ nestedScrollEnabled: true, }}
              listStyle={{ backgroundColor: Color.GREY, maxHeight: "60%" }}
              inputContainerStyle={{ borderWidth: 0, borderRadius: 5, borderColor: (!headerPBC.custnum || !headerPBC.custname) && isCheck ? 'red' : 'grey' }}
              data={customerSuggestion}
              hideResults={hideCustomerResults}
              defaultValue={`${headerPBC.custname || ''}`}
              onChangeText={text => {
                handleInput('custname', text)
              }

              }
              renderItem={({ item, i }) => (
                <TouchableOpacity onPress={() => {
                  handleInput('custnum', item.ACCOUNTNUM)
                  handleInput('custname', item.NAME)
                  console.log("name", item.NAME)
                  setHideCustomerResults(true)
                }}
                  style={{ borderBottomColor: Color.TEXT_PRIMARY, borderBottomWidth: 0.5, paddingVertical: 5 }} >
                  <Text style={{ color: "white", fontSize: 18 }}>{`(${item.ACCOUNTNUM}) ${item.NAME} (${item.CABANG})`}</Text>
                </TouchableOpacity>
              )}
            />

            {
              isNewCustomer ? null :
                <View style={{ justifyContent: "center" }}><Icon onPress={() => {
                  !isNewCustomer ? handleSearchCust(headerPBC.custname) : ''
                }} name="search" color={Color.TEXT_PRIMARY}
                  iconStyle={{ fontSize: 30 }}></Icon></View>
            }

          </View>
        </View>
        <View style={{
          marginBottom: buttonMargin
        }}>

          <View style={{ flexDirection: "row" }}>
            <Text style={{ color: Color.TEXT_SECONDARY }} > {`Sales Resp:`} </Text>
            <Text style={{ color: Color.TEXT_PRIMARY }} > {`${headerPBC.salesnum ? headerPBC.salesnum : 'not selected'}`} </Text>
          </View>
          <View style={{
            flexDirection: "row", backgroundColor: Color.PRIMARY, borderWidth: 1,
            borderRadius: 5, borderColor: !headerPBC.salesnum && isCheck ? 'red' : 'grey'
          }}>
            <Autocomplete
              style={[styles.buttonContainer, { marginBottom: 0 }]}
              onBlur={() => setHideSalesResults(true)}
              onEndEditing={() => setHideSalesResults(true)}
              onFocus={() => setHideSalesResults(false)}
              flatListProps={{ nestedScrollEnabled: true }}
              placeholder={'Select Sales'}
              placeholderTextColor={"grey"}
              listStyle={{ flex: 1, backgroundColor: Color.GREY, maxHeight: "60%", borderColor: "white", borderWidth: 0.5 }}
              inputContainerStyle={{ borderWidth: 0, borderRadius: 5, borderColor: !headerPBC.salesnum && isCheck ? 'red' : 'grey' }}
              data={salesSuggestion}
              hideResults={hideSalesResults}
              defaultValue={headerPBC.salesname}
              onChangeText={text => {
                handleSearchSales(text)
                handleInput('salesname', text)
              }}
              renderItem={({ item, i }) => (
                <TouchableOpacity onPress={() => {
                  handleInput('salesnum', item.EMPLID)
                  handleInput('salesname', item.NAME)
                  console.log("salesnum", item.EMPLID)
                  setHideSalesResults(true)
                }}
                  style={{ borderBottomColor: Color.TEXT_PRIMARY, borderBottomWidth: 0.5, paddingVertical: 5 }}>
                  <Text style={{ color: "white", fontSize: 18 }}>{`(${item.EMPLID}) ${item.NAME}`}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
        <View style={{

          marginBottom: buttonMargin
        }}>
          <Text style={{ color: "grey" }} > {"Estimation Date"} </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={[styles.buttonContainer, { backgroundColor: Color.PRIMARY, borderWidth: 1, borderColor: !headerPBC.estdate && isCheck ? "red" : "grey", color: "#FFF", borderRadius: 5 }]}>
              <Text style={{ color: headerPBC.estdate ? "white" : "grey" }} > {headerPBC.estdate ? formatDate(headerPBC.estdate) + " (Change)" : 'Select Date'} </Text>
            </View>
          </TouchableOpacity>

          <Modal animationType="slide"
            transparent={true}
            visible={modalVisible}
            onBackdropPress={() => {
              setModalVisible(false)
            }}
            onRequestClose={() => { setModalVisible(false) }} >
            <View style={styles.centeredView}>
              <View style={styles.modalView} >
                <Calendar onDayPress={(day) => { console.log("calendar changed"); handleDateChange(day.dateString) }} markedDates={headerPBC.selectedDate} />
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAwareScrollView>

      {keyboardDidShow ? null : <View style={{
        justifyContent: 'flex-end',
        marginBottom: 36
      }}
      >
        <Button
          buttonStyle={{ backgroundColor: Color.BLUE }}

          onPress={() => {
            setIsCheck(true)
            let isValid = headerPBC.custnum && headerPBC.custname && headerPBC.salesnum && headerPBC.estdate && headerPBC.branch;
            isValid ? Actions.EditItemPBCScreen() : Alert.alert("Input not valid !.", "Please check input form.")
            //   
          }}
          title="Next"
        />
      </View>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height:hp("92%"),
    flexDirection: "column",
    backgroundColor: Color.SECONDARY,
    paddingVertical: 0,
    padding: 10
  },

  centeredView: {
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    margin: 0,
    width: "80%",
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  TouchableOpacityStyle: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 0,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },
  FloatingButtonStyle: {
    resizeMode: 'contain',
    width: 50,
    height: 50,
  },
  buttonContainer: {
    marginTop: hp("0%"),
    paddingHorizontal: 8,
    height: hp("6%"),
    flexDirection: 'row',
    color: "white",
    alignItems: 'center',
    marginBottom: "5%",
    borderRadius: 5,
    backgroundColor: Color.PRIMARY,
  }
})
export default PengajuanBookingCoilScreen;