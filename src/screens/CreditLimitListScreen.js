import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, Dimensions, Text, View, FlatList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Badge } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { RFValue } from "react-native-responsive-fontsize";
import SearchHeader from 'react-native-search-header';
import { Icon } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobal } from 'reactn';
import { Color } from '../styles';
import LoadingList from '../components/SkeletonLoading';
import { NumberHelper } from '../helper';
import { creditLimit } from '../data';

const DEVICE_WIDTH = Dimensions.get(`window`).width;

const CreditLimitListScreen = (props) => {
  let profile = global.profile;
  const [clCount, setCLCount] = useGlobal('clCount');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clList, setClList] = useState([]);
  const [clListSearch, setClListSearch] = useState([]);
  const [clselected, setCLSelected] = useState({});
  const [creditlimitselected, setCreditLimitSelected] = useState([]);
  const transClType = ["CL", "TOP", "CLTOP"];

  async function search(nameKey, myArray) {
    var arrayRes = [];
    var resCount = 0;
    var nameKey = nameKey.toUpperCase();
    console.log(nameKey)
    for (var i = 0; i < myArray.length; i++) {

      if (myArray[i].CUSTNAME.includes(nameKey) || myArray[i].CLPROPOSEID.includes(nameKey)) {
        console.log("found")
        arrayRes[resCount] = myArray[i];
        resCount++;

      }
    }
    return arrayRes;

  }

  async function onSearch(val) {
    var searchCLResult = await search(val, clListSearch);
    setClList(searchCLResult);
  }


  async function process() {
    // setRefreshing(true);
    setIsLoading(true);
    let datacl = await creditLimit.getList();
    const status = datacl.status;
    datacl = datacl.data;
    console.log("datacl", datacl)
    //datacl = []; //empty data
    setClList(datacl);
    setClListSearch(datacl);
    setCLCount(datacl.length)
    // setRefreshing(false);
    setIsLoading(false);
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

    console.log("item.CLPROPOSEID", item.CLPROPOSEID)
    const selected = { ...clselected }; // copy and mutate new state
    selected[item.CLPROPOSEID] = !selected[item.CLPROPOSEID];
    let selectedcl = creditlimitselected;
    setCLSelected(selected);
    if (selected[item.CLPROPOSEID]) { selectedcl.push(item.CLPROPOSEID) }
    else { selectedcl = popArray(selectedcl, item.CLPROPOSEID) }
    console.log(selected[item.CLPROPOSEID])
    setCreditLimitSelected(selectedcl);
  };

  async function postApproveCl() {
    let request = {
      userax: this.profile.userax,
      proposeid: creditlimitselected
    }
    return await creditLimit.approve(request);
  }

  async function onApproveClick() {
    let result = await postApproveCl();
    let status = result.status;
    (status == 200 || status == 201) ?
      (Alert.alert("Berhasil Approve")) :
      (Alert.alert("Gagal"));
    Actions.reset('tabbarx');
    Actions.CreditLimitListScreen();
  }
  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View contentContainerStyle={{ flexGrow: 1 }} style={styles.MainContainer}>
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
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
        <Text style={styles.labelBack} onPress={creditlimitselected.length == 0 ? () => searchHeaderRef.current.show() : () => Alert.alert('Approval', "Anda akan melakukan " + creditlimitselected.length + " Approval",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Ok", onPress: () => { onApproveClick() } }
          ])} ><Icon name={creditlimitselected.length == 0 ? "search" : "check"} type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
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
          setClList(clListSearch);
        }}
      />
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { process() }} />
      } style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {isLoading ? (<LoadingList />) : (
          <FlatList
            style={{ flex: 1 }}
            data={clList}
            ListEmptyComponent={ListEmpty}
            contentContainerStyle={{ flexGrow: 1 }}
            extraData={clselected}
            renderItem={({ item }) => {
              const itemSelected = clselected[item.CLPROPOSEID];
              return (

                <TouchableOpacity delayLongPress={100}
                  onLongPress={() => { setCreditLimitSelected([]); handleLongPress(item) }}
                  onPress={() => Actions.CreditLimitDetailScreen({ clDetail: item })}>
                  <View>
                    <View style={itemSelected ? styles.listItemSelected : styles.listItem}>
                      <View style={{ flex: 4, flexDirection: 'column' }}>
                        <Text style={{ fontWeight: "bold", padding: 3, borderRadius: 5, color: Color.TEXT_PRIMARY }}>{item.CLPROPOSEID}</Text>
                        <Text style={{ fontWeight: "bold", color: Color.TEXT_PRIMARY, fontSize: 20 }}>{item.CUSTNAME}</Text>
                        <Text style={{ fontSize: 15, color: Color.TEXT_SECONDARY }}></Text>
                        <View style={{ flexDirection: "row" }}>
                          <Text style={{ width: '30%', height: 40, fontSize: 18, fontWeight: "bold", borderRadius: 5, backgroundColor: Color.PURPLE, textAlign: "center", textAlignVertical: "center", color: "#F7F7F7" }} >
                            {item.PAYMTERMIDNEW}
                          </Text>
                          <View style={{ width: '80%', flexDirection: "row", marginLeft: 3, justifyContent: "center", borderRadius: 5, backgroundColor: Color.PURPLE, height: 40 }} >
                            <Text style={{ alignItems: "center", alignSelf: "center", fontSize: 18, fontWeight: "bold", borderRadius: 5, color: Color.TEXT_PRIMARY }}>  Rp. {NumberHelper.formatDecimal(parseFloat(item.CREDITLIMITNEW))} </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'column', marginBottom: RFValue(30, 580), justifyContent: "center" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, backgroundColor: Color.PURPLE, textAlign: "center", width: RFValue(50, 580), borderRadius: 5, color: Color.TEXT_PRIMARY }}>{transClType[item.TRANSTYPECL]}</Text>
                        <Text style={{ fontWeight: "bold", fontSize: 13, color: Color.TEXT_PRIMARY }}>{item.BRANCH}</Text>
                      </View>
                      <Badge style={{ position: "absolute", top: 0, right: 0 }} >
                        <Text style={{ color: Color.TEXT_PRIMARY }}>{item.JUM_DOC}</Text>
                      </Badge>
                    </View>
                  </View>
                </TouchableOpacity>

              )
            }
            }
            keyExtractor={item => item.email}
          />)}
      </ScrollView>
    </SafeAreaView>
  );
}

export default CreditLimitListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY,
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
    padding: 15,


    backgroundColor: Color.PRIMARY,
    width: "95%",
    flex: 1,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderRadius: 5,


  },

  listItemSelected: {
    marginLeft: 10,
    marginBottom: 3,
    padding: 15,


    backgroundColor: Color.PRIMARY,
    width: "95%",
    flex: 1,
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderRadius: 5,
    color: Color.BLACK,


    backgroundColor: "black",
    width: "95%",
  }


});