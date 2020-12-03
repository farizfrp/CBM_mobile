import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, TouchableWithoutFeedback, SafeAreaView, Alert, TouchableHighlight } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Api from '../components/Api';
import axios from 'axios';
import Autocomplete from 'react-native-autocomplete-input';
import { Picker } from '@react-native-community/picker';
import { Text, Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useGlobal } from 'reactn';
import { Button } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Color } from '../styles';

const EditItemPBCScreen = (props) => {


  const [itemForm, setItemForm] = useGlobal('itemForm');

  const [indexItem, setIndexItem] = useState(0);
  const [itemSuggestion, setItemSuggestion] = useState([]);
  const [hideResults, setHideResults] = useState([]);
  const [isCheck, setIsCheck] = useState(false);
  const [curShowResult, setCurShowResult] = useState(null);
  const [headerQuantity, setHeaderQuantity] = useState(0);

  const [headerPBC, setHeaderPBC] = useGlobal('headerPBC');

  const jenis = [
    {
      "NAME": "Please Select type"
    },
    {
      "NAME": "GALVALUME"
    },
    {
      "NAME": "GALVANIS"
    }
  ]
  const isBSI = [
    {
      "NAME": "Please Select supplier"
    },
    {
      "NAME": "BSI"
    },
    {
      "NAME": "NONBSI"
    }
  ]
  const azOption = [
    {
      "NAME": "Please Select az"
    },
    {
      "NAME": "AZ"
    },
    {
      "NAME": "TOPDECK"
    },
    {
      "NAME": "CBMDECK"
    }
  ]

  useEffect(() => {
    itemForm.length == 0 ? handleAddItem() : ''
  }, []);

  const handleAddItem = () => {
    console.log(indexItem)
    setIndexItem(indexItem + 1)
    itemForm.push({
      key: indexItem,
      isDetailShow: true,
      itemid: '',
      itemname: '',
      itemcolor: '',
      tebal: '',
      lebar: '',
      jenis: jenis[0].NAME,
      az: '',
      unit: 'KG',
      supplier: isBSI[0].NAME,
      qty_booking: null,
      qty_estimation: null

    })
    // itemSuggestion.push([]) for item auto
    // hideResults.push(false)
  }

  const itemNameGenerator = (index, key, value) => {
    let result = '';
    let itemTemp = [...itemForm]
    let supplierTemp = itemTemp[index]['supplier'] == "Please Select supplier" ? '' : itemTemp[index]['supplier'];
    let jenisTemp = itemTemp[index]['jenis'] == "Please Select type" ? '' : itemTemp[index]['jenis'];

    // "GALVALUME 0.5X1219 BSI BLUE"
    result = `${jenisTemp} ${itemTemp[index]['tebal']}${itemTemp[index]['lebar'] ? 'X' + itemTemp[index]['lebar'] : ''} ${(itemTemp[index]['az']).toUpperCase()} ${supplierTemp} ${(itemTemp[index]['itemcolor']).toUpperCase()}`

    return result;
  }

  const onItemTextChange = (index, key, value) => {
    let newValue = value;
    console.log(newValue)
    let itemTemp = [...itemForm];
    itemTemp[index][`${key}`] = newValue;
    itemTemp[index][`itemname`] = itemNameGenerator(index, key, newValue);
    //console.log("itemTemp[index][`itemname`]",itemTemp[index][`itemname`])

    setItemForm(itemTemp)
  }

  async function calculateTotalQtyBooking() {
    var quantity = await itemForm.reduce(async function (prev, cur) {
      console.log(cur.qty)
      const sum = await prev;
      return sum + parseFloat(!cur.qty_booking ? 0 : cur.qty_booking);
    }, 0);
    return quantity;
  }

  async function calculateTotalQtyEstimation() {
    var quantity = await itemForm.reduce(async function (prev, cur) {
      console.log(cur.qty)
      const sum = await prev;
      return sum + parseFloat(!cur.qty_estimation ? 0 : cur.qty_estimation);
    }, 0);
    return quantity;
  }

  const handleInputDetail = (index) => {
    let res = [...itemForm]
    console.log("handleInputDetail", index)
    res[index].isDetailShow = !res[index].isDetailShow
    console.log("handleInputDetail", itemForm[index])
    setItemForm(res)
  }

  const handlePopItem = (index) => {
    console.log("handlePopItem ", index)
    let res = [...itemForm]
    res.splice(index, 1)
    setItemForm(res)
    console.log(itemForm)
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

  async function getItemColor(itemid) {
    console.log('getItemColor', itemid)
    let result = await axios.get(Api.BookingCoil.search_itemcolor, {
      params: {
        itemid
      }
    });
    console.log('getItemSearch', result)
    return result.data;
  }

  const handleSearchItem = async (keyword, index) => {
    let itemSuggestResult = await getItemSearch(keyword);
    console.log("itemSuggestResult", itemSuggestResult)
    let itemSuggestion = [...itemSuggestion]
    itemSuggestion[index] = itemSuggestResult;
    setItemSuggestion(itemSuggestion)
    setCurShowResult(index)
  }

  const handleItemSelect = async (val, index) => {
    console.log("handleItemSelect")
    let itemFormTemp = [...itemForm]
    itemFormTemp[index].itemname = val.ITEMNAME
    itemFormTemp[index].itemid = val.ITEMID

    setItemForm(itemFormTemp)
    let hide = [...hide]
    hide[index] = true
    setHideResults(hide)
  }


  async function isFormValid() {
    for (const index in itemForm) {
      if (!(itemForm[index].itemname
        && !isNaN(itemForm[index].qty_booking)
        && !isNaN(itemForm[index].tebal)
        && !isNaN(itemForm[index].lebar)
        && itemForm[index].jenis != "Please Select type"
        && itemForm[index].supplier != "Please Select supplier"
        && (itemForm[index].az != "Please Select az" && itemForm[index].az)
        && itemForm[index].supplier
      )) {
        console.log("item", itemForm[index])
        console.log("false")
        return false;
      }
    }
    return true;
  }

  async function formValidation() {
    setIsCheck(true);
    let isValid = await isFormValid()
    if (isValid) {
      let qty_booking = await calculateTotalQtyBooking();
      console.log("headerQuantity", headerQuantity)
      let tempValue = headerPBC;
      tempValue[`qty_booking`] = qty_booking;

      setHeaderPBC(tempValue)
      Actions.PreviewPBCScreen()
    } else {
      Alert.alert("Input not valid !.", "Please check input form.")
    }
    console.log("isvalid ", isValid)
  }

  const renderHiddenItem = (data, rowMap) => {
    let index = data.index;
    return (
      <View style={styles.rowBack}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => handlePopItem(index)}>
          <Icon
            name={"trash"}
            type='font-awesome'
            color={"white"}
          />
        </TouchableOpacity>
      </View>
    )
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text onPress={() => Actions.pop()} style={styles.labelBack}><Icon name="arrow-left" type="font-awesome" color="white" /> </Text>
        <Text style={styles.label}> {props.title} </Text>
        {<Text onPress={() => ''
          // handleAddItem()

        } style={[styles.labelBack, { opacity: 1 }]}><Icon size={0} name="plus" type="font-awesome" color="white" /> </Text>}
      </SafeAreaView>
      <ScrollView keyboardShouldPersistTaps='never' style={{ flex: 1, marginTop: 0, flexDirection: "column" }}>
        <SwipeListView
          data={itemForm}
          renderHiddenItem={renderHiddenItem}
          recalculateHiddenLayout={true}
          renderItem={data => {
            let index = data.index
            return (
              <View style={{
                borderWidth: 0.5,
                borderRadius: 3,
                borderColor: !(itemForm[index].itemname && itemForm[index].qty_booking) && isCheck ? 'red' : 'grey',
                padding: 3,
                backgroundColor: Color.SECONDARY,
                alignItems: "flex-start",
                marginBottom: 2
              }}>
                <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.BLUE, width: "100%" }}  > {`Item: ${index + 1}`} </Text>
                <View style={{ flexDirection: 'row', backgroundColor: Color.PRIMARY, borderBottomColor: isCheck && !itemForm[index].itemname ? "red" : Color.TEXT_PRIMARY, borderBottomWidth: 0.5, marginBottom: 2 }}>
                  <TextInput editable={false} placeholder={'Item Name'} placeholderTextColor={Color.GREY}
                    onChangeText={(value) => onItemTextChange(index, 'itemname', value)} style={[{ width: "91%", color: Color.TEXT_PRIMARY }]}>{itemForm[index].itemname}</TextInput>

                  <Icon name={!itemForm[index].isDetailShow ? 'arrow-drop-down' : 'arrow-drop-up'} color="white" size={hp("2%")}
                    onPress={() => handleInputDetail(index)} containerStyle={{ marginRight: 3 }} iconStyle={{ textAlignVertical: "center", fontSize: 30 }}></Icon>
                </View>
                {itemForm[index].isDetailShow ? (
                  // type, tebal, lebar, az, item color, supplier, qty booking, item note,
                  <View style={{ alignSelf: "flex-end" }}>
                    <View style={{ marginTop: 3, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && itemForm[index].jenis == "Please Select type" ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <Picker
                        style={{ color: itemForm[index].isBSI == "Default" ? Color.GREY : Color.TEXT_PRIMARY, justifyContent: "center" }}
                        itemStyle={{ flexWrap: 'wrap'}}
                        selectedValue={itemForm[index].jenis}
                        onValueChange={(value, itemIndex) => {
                          onItemTextChange(index, 'jenis', value)
                        }}>
                        {jenis.map((item, index) => {
                          return <Picker.Item style={{ flexWrap: 'wrap', flex: 1 }} label={item.NAME} value={item.NAME} />
                        })
                        }
                      </Picker>
                    </View>
                    <View style={{ marginTop: 0, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && !itemForm[index].tebal ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <TextInput editable={true} keyboardType='numeric' placeholderTextColor={Color.GREY} placeholder={'Tebal'} onChangeText={(value) => onItemTextChange(index, 'tebal', value)} style={[{ width: wp("80%"), color: Color.TEXT_PRIMARY }]} >{itemForm[index].tebal}</TextInput>
                    </View>
                    <View style={{ marginTop: 0, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && !itemForm[index].lebar ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <TextInput editable={true} keyboardType='numeric' placeholder={'Lebar (tct)'} placeholderTextColor={Color.GREY} onChangeText={(value) => onItemTextChange(index, 'lebar', value)} style={[{ width: wp("80%"), color: Color.TEXT_PRIMARY }]} >{itemForm[index].lebar}</TextInput>
                    </View>


                    <View style={{ flexDirection: "row", marginTop: 0, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && !itemForm[index].az ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <TextInput editable={true} placeholderTextColor={Color.GREY}

                        placeholder={'AZ'}

                        autoCapitalize="characters"
                        onChangeText={(value) => {

                          onItemTextChange(index, 'az', value)
                        }
                        }
                        style={[{ flex: 5, color: Color.TEXT_PRIMARY }]} >{(itemForm[index].az)}</TextInput>



                    </View>
                    <View style={{ marginTop: 0, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <TextInput editable={true} placeholder={'Color (Optional)'} placeholderTextColor={Color.GREY}
                        onChangeText={(value) => onItemTextChange(index, 'itemcolor', value)} autoCapitalize={"characters"}
                        style={[{ width: wp("80%"), color: Color.TEXT_PRIMARY }]} >{itemForm[index].itemcolor}</TextInput>
                    </View>

                    <View style={{ marginTop: 3, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && itemForm[index].supplier == isBSI[0].NAME ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <Picker
                        style={{ color: itemForm[index].supplier == "Default" ? Color.GREY : Color.TEXT_PRIMARY, justifyContent: "center" }}
                        itemStyle={{ flexWrap: 'wrap'}}
                        selectedValue={itemForm[index].supplier}
                        onValueChange={(value, itemIndex) => {
                          onItemTextChange(index, 'supplier', value)
                        }}>
                        {isBSI.map((item, index) => {
                          return <Picker.Item style={{ flexWrap: 'wrap', flex: 1 }} label={item.NAME} value={item.NAME} />
                        })
                        }
                      </Picker>
                    </View>

                    <View style={{ flexDirection: "row", marginTop: 0, marginBottom: 3, backgroundColor: Color.SECONDARY, borderWidth: 0.5, borderColor: isCheck && !itemForm[index].qty_booking ? "red" : Color.TEXT_PRIMARY, borderRadius: 5 }}>
                      <TextInput editable={true} keyboardType='numeric' placeholderTextColor={Color.GREY} 
                      placeholder={`Quantity Booking ${itemForm[index].unit == 'KG' ? "KG" : 'M'}`} 
                      onChangeText={(value) => onItemTextChange(index, 'qty_booking', value)} 
                      style={[{ flex: 5, color: Color.TEXT_PRIMARY }]} >{itemForm[index].qty_booking}</TextInput>
                      <View style={{ flexDirection: "row", flex: 1 }}>

                        <TouchableOpacity onPress={() => onItemTextChange(index, 'unit', itemForm[index].unit == 'KG' ? "M" : 'KG')} style={{ flex: 1, justifyContent: "center", borderRadius: 5, backgroundColor: 'chocolate' }}>
                          <Text style={{ color: "white", textAlign: "center", fontSize: 20, fontWeight: "bold" }}>{itemForm[index].unit}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (<View />)}
              </View>
            )
          }
          }
          rightOpenValue={-75}
        />
      </ScrollView>
      {itemForm.length ? (<Button
        buttonStyle={{ backgroundColor: Color.BLUE }}
        onPress={() => {
          formValidation()
        }}
        title="Review"
      />) : (<View />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 8,
    flexDirection: "column",
    backgroundColor: Color.SECONDARY,
    padding: 10,
    paddingTop: 0
  },
  rowBack: {
    alignItems: 'center',
    borderColor: Color.SECONDARY,
    borderWidth: 3,
    backgroundColor: Color.SECONDARY,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  label: {
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `center`,
    textAlignVertical: `center`,
    color: Color.WHITE,
    backgroundColor: `transparent`
  },
  labelBack: {
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `left`,
    textAlignVertical: `center`,
    color: Color.WHITE,
    backgroundColor: `transparent`

  },
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    width: wp('100%'),
    height: 56,
    backgroundColor: Color.SECONDARY
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
  buttonContainer: {
    marginTop: hp("1%"),
    height: hp("5%"),
    flexDirection: 'row',
    color: "white",
    alignItems: 'center',
    marginBottom: "5%",
    borderRadius: 5,
    backgroundColor: Color.GREY,
  }
})
export default EditItemPBCScreen;