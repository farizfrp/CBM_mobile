import React, { useState, useEffect } from 'react';
import { useGlobal } from 'reactn';
import { StyleSheet, Dimensions, StatusBar, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import { Badge } from 'native-base';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import SearchHeader from 'react-native-search-header';
import Api from '../../components/Api';
import { Color } from '../../styles';
import LoadingList from '../../components/SkeletonLoading';
import { purchaseOrderList } from '../../data/dummy/purchaseOrder/purchaseOrderList';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { DateHelper, NumberHelper } from '../../helper';

const DEVICE_WIDTH = Dimensions.get(`window`).width;


const PurchaseOrderListScreen = (props) => {
  profile = global.profile;

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [poList, setPOList] = useState([]);
  const [poListSearch, setPOListSearch] = useState([]);
  const [poSelected, setPOSelected] = useState({});
  const [purchaseOrderSelected, setPurchaseOrderSelected] = useState([]);
  const [poCount, setPOCount] = useGlobal('poCount');

  function format(amount) {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  async function getPoList() {
    console.log(Api.PurchaseOrder.get_list)
    return await axios.get(Api.PurchaseOrder.get_list, {
      params: {
        userax: profile.userax
      }
    });
  }

  const ListEmpty = () => {
    return (
      <View style={styles.MainContainer} contentContainerStyle={{ flexGrow: 1 }} >
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
  }

  async function process() {
    setIsLoading(true);
    let dataPO = await getPoList();
    console.log(dataPO);
    setPOList(dataPO.data);
    setPOListSearch(dataPO.data);
    setIsLoading(false);
  }

  async function search(nameKey, myArray) {
    var arrayRes = [];
    var resCount = 0;
    var nameKey = nameKey.toUpperCase();

    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].PURCHID.includes(nameKey) || myArray[i].ACCOUNTNAME.includes(nameKey)) {
        console.log("found")
        arrayRes[resCount] = myArray[i];
        resCount++;
      }
    }
    return arrayRes;
  }

  async function onSearch(val) {
    var searchPOResult = await search(val, poListSearch);
    console.log("searchPOResult", searchPOResult)
    setPOList(searchPOResult);
  }

  function popArray(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  const handleLongPress = (item) => {
    const selected = { ...poSelected }; // copy and mutate new state

    selected[item.RECID] = !selected[item.RECID];
    let selectedpo = purchaseOrderSelected;
    setPOSelected(selected);
    if (selected[item.RECID]) { selectedpo.push(item.PURCHID) }
    else { selectedpo = popArray(selectedpo, item.PURCHID) }
    setPurchaseOrderSelected(selectedpo);

  };

  async function onApproveClick() {
    let result = await postApproveSo();
    console.log("purchaseOrderSelected",purchaseOrderSelected)
    if (result) {
      setPOCount(poCount-purchaseOrderSelected.length)
      Alert.alert("Berhasil Approve");
      process()
    }
  }

  async function postApproveSo() {
    let request = {
      userax: this.profile.userax,
      purchid: purchaseOrderSelected,
      type:"Approve",
      reason:"Multi Approve"
    }
    return await axios.post(Api.PurchaseOrder.update, request);
  }

  useEffect(() => {
    process();
  }, [poCount]);
  
  const searchHeaderRef = React.useRef(null);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <View style={styles.header}>
        <Text onPress={() => Actions.pop()} style={styles.labelBack}><Icon name="arrow-left" type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
        <Text style={styles.label}> {props.title} </Text>
        <Text style={styles.labelBack} onPress={purchaseOrderSelected.length == 0 ? () => searchHeaderRef.current.show() : () => Alert.alert('Approval', "Anda akan melakukan " + purchaseOrderSelected.length + " Approval. \nApakah anda yakin ?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Ok", onPress: () => { onApproveClick() } }
          ])} ><Icon name={purchaseOrderSelected.length == 0 ? "search" : "check"} type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
      </View>
      <SearchHeader
        ref={searchHeaderRef}
        placeholder='Search...'
        placeholderColor='gray'
        enableSuggestion={false}
        onEnteringSearch={(val) => onSearch(val.nativeEvent.text)}
        onHide={() => {
          searchHeaderRef.current.clear();
        }}
        onClear={() => {
          setPOList(poListSearch)
        }}

      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { process() }} />
        } contentContainerStyle={{ flexGrow: 1 }}
        style={styles.container}>
        {isLoading ? (<LoadingList />) : (
          <FlatList
            style={{ flex: 1 }}
            data={poList}
            ListEmptyComponent={ListEmpty}
            contentContainerStyle={{ flexGrow: 1 }}
            extraData={poSelected}
            renderItem={({ item }) => {
              const itemSelected = poSelected[item.RECID];
              return (
                <View style={itemSelected ? styles.listItemSelected : styles.listItem}>
                  <TouchableOpacity delayLongPress={100} onLongPress={() => { setPurchaseOrderSelected([]); handleLongPress(item) }} onPress={() => Actions.PurchaseOrderDetailScreen({ poDetail: item })}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <View style={{  flexDirection: 'column' }}>
                        <View><Text style={{ fontWeight: "bold", color: Color.TEXT_PRIMARY, borderRadius: 3, padding: 3 }}>{item.PURCHID}</Text></View>
                        <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.TEXT_PRIMARY }}>{item.ACCOUNTNAME}</Text>
                        <Text style={{ fontSize: 15, color: Color.TEXT_SECONDARY }}></Text>
                        <Text style={{ width:wp("45%"), height: 40, borderRadius: 3, fontSize: 18, fontWeight: "bold", backgroundColor: Color.SKY, textAlign: "center", textAlignVertical: "center", color: "#F7F7F7" }} >
                        {NumberHelper.currencyConverter(item.CURRENCYCODE)}{NumberHelper.formatDecimal(item.AMOUNT)}
                        </Text>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center' }}>                
                          <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY }}>{DateHelper.formatDate(item.TRANSDATE)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity><Badge style={{ position: "absolute", top: 0, right: 0 }} >
                    <Text style={{ color: Color.TEXT_PRIMARY }}>{3}</Text>
                  </Badge>
                </View>
              )
            }
            }
            keyExtractor={item => item.email}
          />)}
      </ScrollView>
    </SafeAreaView>
  );
}

export default PurchaseOrderListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY
  },
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    width: DEVICE_WIDTH,
    height: 56,
    backgroundColor: Color.SECONDARY
  },
  MainContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  labelBack: {
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `left`,
    textAlignVertical: `center`,
    color: Color.TEXT_PRIMARY,
    backgroundColor: `transparent`

  },
  label: {
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `center`,
    textAlignVertical: `center`,
    color: Color.TEXT_PRIMARY,
    backgroundColor: `transparent`
  },
  searchLabel: {
    fontSize: 20,
    fontWeight: `600`,
    textAlign: `right`,
    textAlignVertical: `center`,
    color: Color.TEXT_PRIMARY,
    backgroundColor: `transparent`
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 3,
    borderRadius: 3,
    padding: 15,
    backgroundColor: Color.PRIMARY,
    width: "95%",
    flex: 1,
    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4.0,
    elevation: 7,
  },
  listItemSelected: {
    marginLeft: 10,
    marginBottom: 3,
    borderRadius: 3,
    padding: 15,
    backgroundColor: Color.BLACK,
    width: "95%",
    flex: 1,
    opacity: 0.7,
    shadowColor: Color.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 4.0,
    elevation: 7,
  },
});