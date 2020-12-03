import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, StatusBar, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import axios from 'axios';
import { Badge } from 'native-base';
import { Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';
import SearchHeader from 'react-native-search-header';
import Api from '../components/Api';
import { Color } from '../styles';
import LoadingList from '../components/SkeletonLoading';
const DEVICE_WIDTH = Dimensions.get(`window`).width;


const SalesOrderListScreen = (props) => {
  profile = global.profile;

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [solist, setSOList] = useState([]);
  const [solistsearch, setSOListSearch] = useState([]);
  const [soselected, setSOSelected] = useState({});
  const [salesorderselected, setSalesOrderSelected] = useState([]);

  function format(amount) {
    return Number(amount)
      .toFixed(2)
      .replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  async function getSoList() {
    console.log(Api.SalesOrder.show_approve_so)
    return await axios.get(Api.SalesOrder.show_approve_so, {
      params: {
        userax: profile.userax
      }
    });
  }

  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View style={styles.MainContainer} contentContainerStyle={{ flexGrow: 1 }} >
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
  }

  async function process() {
    // setRefreshing(true);

    setIsLoading(true);
    let dataso = await getSoList();
    dataso = dataso.data;
    console.log(dataso);
    setSOList(dataso);
    setSOListSearch(dataso);
    //setRefreshing(false);
    setIsLoading(false);
  }

  async function search(nameKey, myArray) {
    var arrayRes = [];
    var resCount = 0;
    var nameKey = nameKey.toUpperCase();
    console.log(nameKey)
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].SALESID.includes(nameKey) || myArray[i].CUSTOMER_NAME.includes(nameKey)) {
        console.log("found")
        arrayRes[resCount] = myArray[i];
        resCount++;
      }
    }
    return arrayRes;
  }

  async function onSearch(val) {
    var searchSOResult = await search(val, solistsearch);
    setSOList(searchSOResult);
  }

  function popArray(arr, value) {

    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }
  

  const handleLongPress = (item) => {
    // do anything here to handle long presses

    console.log("item.RECID", item.RECID)
    const selected = { ...soselected }; // copy and mutate new state
    selected[item.RECID] = !selected[item.RECID];
    let selectedso = salesorderselected;
    setSOSelected(selected);
    if (selected[item.RECID]) { selectedso.push(parseInt(item.RECID)) }
    else { selectedso = popArray(selectedso, parseInt(item.RECID)) }
    console.log(selected[item.RECID])

    setSalesOrderSelected(selectedso);


  };


  async function onApproveClick() {
    let result = await postApproveSo();
    if (result) {
      Alert.alert("Berhasil Approve");
      Actions.reset('tabbarx');
      Actions.SalesOrderListScreen();
    }
  }


  async function postApproveSo() {
    let request = {
      userax: this.profile.userax,
      recid: salesorderselected
    }
    return await axios.post(Api.SalesOrder.approve_so, request);
  }
  useEffect(() => {
    // Update the document title using the browser API
    process();
  }, []);
  const searchHeaderRef = React.useRef(null);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <View style={styles.header}>
        <Text onPress={() => Actions.pop()} style={styles.labelBack}><Icon name="arrow-left" type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
        <Text style={styles.label}> {props.title} </Text>
        <Text style={styles.labelBack} onPress={salesorderselected.length == 0 ? () => searchHeaderRef.current.show() : () => Alert.alert('Approval', "Anda akan melakukan " + salesorderselected.length + " Approval",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Ok", onPress: () => { onApproveClick() } }
          ])} ><Icon name={salesorderselected.length == 0 ? "search" : "check"} type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
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
          setSOList(solistsearch)
        }}

      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { process() }} />
        } contentContainerStyle={{ flexGrow: 1 }}
        style={styles.container}>
        {isLoading ? (<LoadingList/>) : (
            <FlatList
              style={{ flex: 1 }}
              data={solist}
              ListEmptyComponent={ListEmpty}
              contentContainerStyle={{ flexGrow: 1 }}
              extraData={soselected}
              renderItem={({ item }) => {
                const itemSelected = soselected[item.RECID];
                return (
                  <View style={itemSelected ? styles.listItemSelected : styles.listItem}>
                    <TouchableOpacity delayLongPress={100} onLongPress={() => { setSalesOrderSelected([]); handleLongPress(item) }} onPress={() => Actions.SalesOrderDetailScreen({ soDetail: item })}>
                      <View style={{ flexDirection: "row", justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <View style={{ flex: 3, flexDirection: 'column' }}>
                          <Text style={{ fontWeight: "bold", color: Color.TEXT_PRIMARY, borderRadius: 3, backgroundColor: Color.BLUE, width: "40%", padding: 3 }}>{item.SALESID}</Text>
                          <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.TEXT_PRIMARY }}>{item.CUSTOMER_NAME}</Text>
                          <Text style={{ fontSize: 15, color: Color.TEXT_SECONDARY }}></Text>
                          <Text style={{ width: '80%', height: 40, borderRadius: 3,  fontSize: 18, fontWeight: "bold", backgroundColor: Color.BLUE, textAlign: "center", textAlignVertical: "center", color: "#F7F7F7" }} >
                            Rp. {format(parseFloat(item.TOTAL))}
                          </Text>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>

                          <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>

                            <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY }}>{item.CABANG}</Text>
                            <Text style={{ fontSize: 13, color: Color.TEXT_PRIMARY }}>{item.SEGMEN}</Text>
                          </View>

                        </View>


                      </View>
                    </TouchableOpacity><Badge style={{ position: "absolute", top: 0, right: 0 }} >
                      <Text style={{ color: Color.TEXT_PRIMARY }}>{item.JUM_DOC}</Text>
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

export default SalesOrderListScreen;

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