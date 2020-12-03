import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, StatusBar, Text, View, FlatList, TouchableOpacity, RefreshControl, ScrollView, SafeAreaView, Alert} from 'react-native';
import axios from 'axios';
import { Badge } from 'native-base';
import { Icon } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import SearchHeader from 'react-native-search-header';
import Api from '../components/Api';
import PBCStatus from '../components/PBCStatus';
import { FloatingAction } from "react-native-floating-action";
import { Color } from "../styles";
import LoadingList from '../components/SkeletonLoading';
import { DateHelper, NumberHelper } from '../helper';

//import PbcDummy from '../components/dataDummy';

const DEVICE_WIDTH = Dimensions.get(`window`).width;


const BookingCoilScreen = (props) => {
  profile = global.profile;
  const isBM = props.isBM;
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pbclist, setPBCList] = useState([]);
  const [pbclistsearch, setPBCListSearch] = useState([]);
  const [pbcselected, setPBCSelected] = useState({});
  const [bookingcoilselected, setBookingCoilSelected] = useState([]);


  const CustomActionComponent = (props) => {
    props = props.props
    return (
      <View on style={{ flexDirection: 'row' }}>
        <Text style={{ backgroundColor: Color.TEXT_PRIMARY, padding: 5, borderRadius: 5, alignSelf: "center" }}>{props.label}</Text>
        <Icon
          reverse
          name={props.iconName}
          type='font-awesome'
          color={props.color}
        />
      </View>
    )
  }
  const statusCode = []
  //  statusCode["all"] = 0;
  statusCode["acc"] = { status1: 1, status2: 2 };
  statusCode["success"] = { status1: 3, status2: 5 };
  statusCode["all"] = { status1: 99, status2: 99 };
  const actions = [
    {
      name: "all",
      render: props => <CustomActionComponent props={{ color: Color.ALERT, label: "All", iconName: "list" }} />,
      position: 1
    },
    {
      name: "acc",
      render: props => <CustomActionComponent props={{ color: Color.CHOCOLATE, label: "Approve / Reject", iconName: "level-up" }} />,
      position: 3
    },
    {
      name: "success",
      render: props => <CustomActionComponent props={{ color: Color.GREEN, label: "Success", iconName: "check" }} />,
      position: 2
    },
    {
      name: "new",
      render: props => <CustomActionComponent props={{ color: Color.GREY, label: "Add New", iconName: "plus" }} />,
      position: 4
    }
  ];

  async function getPBCList(status1, status2) {
    let urlPBCList = isBM ? Api.BookingCoil.list_app_pbc : (status1 == 99 ? Api.BookingCoil.listall_pbc : Api.BookingCoil.list_pbc)
    let params = isBM ? { userax: profile.userax } : { username: profile.username, status1, status2 }
    return await axios.get(urlPBCList, { params });
    //return await axios.get(urlPBCList);
  }

  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View style={styles.MainContainer} contentContainerStyle={{ flexGrow: 1 }} >
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>No Data Found</Text>
      </View>
    );
  }

  function formatDate(dateString) {
    if (dateString == "1900-01-01 00:00:00.000") { return ' - ' }
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let dateVar = new Date(dateString.replace(' ', 'T'));
    let result = dateVar.getDate() + " " + shortMonths[dateVar.getMonth()] + " " + dateVar.getFullYear();

    return result;

  }

  async function process(status1, status2) {
    setIsLoading(true);

    let datapbc = await getPBCList(status1, status2)
    //let datapbc = pbcDummy;
    console.log("pbcDummy", datapbc)
    setPBCList(datapbc.data);
    setPBCListSearch(datapbc.data);
    setIsLoading(false);
  }

  async function search(nameKey, myArray) {
    var arrayRes = [];
    var resCount = 0;
    var nameKey = nameKey.toUpperCase();
    console.log(nameKey)
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].bookingid.includes(nameKey) || myArray[i].custname.includes(nameKey)) {
        console.log("found")
        arrayRes[resCount] = myArray[i];
        resCount++;
      }
    }
    return arrayRes;
  }

  async function onSearch(val) {
    var searchPBCResult = await search(val, pbclistsearch);
    setPBCList(searchPBCResult);
  }

  function popArray(arr, value) {

    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  

  useEffect(() => {
    // Update the document title using the browser API
    process(0, 0);
  }, [props]);
  const searchHeaderRef = React.useRef(null);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <View style={styles.header}>
        <Text onPress={() => Actions.pop()} style={styles.labelBack}><Icon name="arrow-left" type="font-awesome" color={Color.TEXT_PRIMARY} /> </Text>
        <Text style={styles.label}> {props.title} </Text>
        <Text style={styles.labelBack} onPress={bookingcoilselected.length == 0 ? () => searchHeaderRef.current.show() : () => Alert.alert('Approval', "Anda akan melakukan " + bookingcoilselected.length + " Approval",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Ok", onPress: () => { onApproveClick() } }
          ])} ><Icon name={bookingcoilselected.length == 0 ? "search" : "check"} type="font-awesome" color={Color.TEXT_PRIMARY} /> </Text>
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
          setPBCList(pbclistsearch)
        }}

      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { process(0, 0) }} />
        } contentContainerStyle={{ flexGrow: 1 }}
        style={styles.container}>
        {isLoading ? (<LoadingList/>) : (
            <FlatList
              style={{ flex: 1 }}
              data={pbclist}
              ListEmptyComponent={ListEmpty}
              contentContainerStyle={{ flexGrow: 1 }}
              extraData={pbcselected}
              renderItem={({ item }) => {
                const itemSelected = pbcselected[item.id];
                return (
                  <View style={itemSelected ? styles.listItemSelected : styles.listItem}>
                    {!isBM ? <Badge style={{
                      backgroundColor: PBCStatus[parseInt(item.status)].statusColor, width: "100%",
                      borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 3, borderTopRightRadius: 3, marginBottom: 2, alignItems: "center"
                    }} >
                      <Text style={{ color: Color.TEXT_PRIMARY }}>{PBCStatus[parseInt(item.status)].statusLabel}</Text>
                    </Badge> : <View />}
                    <TouchableOpacity delayLongPress={100} onPress={() => Actions.DetailPBCScreen({ isBM, pbcDetail: item })}>
                      <View style={{ flexDirection: "row", justifyContent: 'space-between', flexWrap: 'wrap', padding: 15 }}>
                        <View style={{ flex: 5, flexDirection: 'column' }}>
                          <Text style={{ fontWeight: "normal", color: Color.TEXT_PRIMARY, borderRadius: 0, marginBottom: 3, width: "80%", padding: 3 }}>{item.bookingid}</Text>
                          <Text style={{ fontWeight: "bold", fontSize: 20, color: Color.TEXT_PRIMARY }}>{item.custname}</Text>
                          <Text style={{ fontSize: 15, color: Color.TEXT_SECONDARY }}></Text>
                          <Text style={{
                            width: '100%', paddingHorizontal: 10, height: 40, borderRadius: 5, fontSize: 18, fontWeight: "bold", borderRadius: 3, backgroundColor: Color.BLUE,
                            textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
                          }} >
                            {NumberHelper.formatDefault(item.qty_booking) + " " + item.unit}
                          </Text>
                        </View>

                        <View style={{ flex: 2, flexDirection: 'column', justifyContent: "flex-start", alignItems: 'center' }}>

                          <Text style={{ fontSize: 13, color: Color.TEXT_PRIMARY, marginBottom: 1 }}>{formatDate(item.from_date)}</Text>
                          <Text style={{ fontSize: 13, color: Color.TEXT_PRIMARY, marginBottom: 1 }}>{"|"}</Text>
                          <Text style={{ fontSize: 13, color: Color.TEXT_PRIMARY, marginBottom: 1 }}>{"|"}</Text>
                          <Text style={{ fontSize: 13, color: Color.TEXT_PRIMARY, marginBottom: 8 }}>{formatDate(item.to_date)}</Text>
                          <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY }}>{item.cabang}</Text>

                        </View>
                      </View>
                    </TouchableOpacity>

                  </View>
                )
              }
              }

            />)}
      </ScrollView>
      {!isBM ?
        (

          <FloatingAction
            actionsPaddingTopBottom={0}
            color={Color.ALERT}
            overlayColor={'rgba(0, 0, 0, 0.7)'}
            floatingIcon={<Icon
              name={"chevron-up"}
              type='font-awesome'
              color={Color.WHITE}
            />}
            actions={actions}
            onPressItem={name => {
              name != 'new' ? process(statusCode[name].status1, statusCode[name].status2) : Actions.PengajuanBookingCoilScreen()
            }}
          />

        ) : (<View />)
      }

    </SafeAreaView>
  );
}

export default BookingCoilScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY
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

  listItem: {
    marginLeft: 10,
    marginBottom: 3,
    borderWidth: 0,
    borderRadius: 3,
    paddingTop: 0,
    paddingBottom: 0,
    padding: 0,
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
    borderWidth: 1,
    paddingTop: 0,
    borderRadius: 3,
    padding: 0,
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