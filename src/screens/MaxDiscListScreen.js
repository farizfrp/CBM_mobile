import React, { useState, useEffect } from 'react';
import {
  Dimensions, StyleSheet, Text, Alert, View, FlatList, ScrollView,
  RefreshControl, TouchableOpacity,
  TouchableHighlight, SafeAreaView
} from 'react-native';
import Modal from 'react-native-modal';
import { Icon } from 'native-base';
import SearchHeader from 'react-native-search-header';
import { Actions } from 'react-native-router-flux';
import { useGlobal } from 'reactn';
import { Color } from '../styles';
import LoadingList from '../components/SkeletonLoading';
import { maxDisc } from '../data';
import { formatDefault, formatDecimal } from '../helper/number';

const DEVICE_WIDTH = Dimensions.get(`window`).width;




const MaxDiscListScreen = (props) => {
  const [maxDiscCount, setMaxDiscCount] = useGlobal('maxDiscCount');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isApproveSuccess, setIsApproveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maxdisclist, setMaxdisclist] = useState([]);
  const [maxdisclistsearch, setMaxdisclistSearch] = useState([]);
  const [singlemaxdisc, setSinglemaxdisc] = useState({});
  const [mdselected, setMdSelected] = useState({});
  const [maxdiscselected, setMaxDiscSelected] = useState([]);
  profile = global.profile;


  async function changeFormatNumber(data) {
    let result = [];
    data = await data.map(obj => {
      obj.MAXDISCOUNT = parseFloat(obj.MAXDISCOUNT).toFixed(2);
      obj.MASTERMAXDISC = parseFloat(obj.MASTERMAXDISC).toFixed(2);
      obj.PRICELIST = formatDecimal(obj.PRICELIST);
      obj.LASTMAXDISC = parseFloat(obj.LASTMAXDISC).toFixed(2);
      result.push(obj);
    });
    return result;
  }


  async function approveMaxDiscList(selected) {
    let request = {
      userax: profile.userax,
      recid: selected
    }

    let result = await maxDisc.multiApprove(request);
    let status = result.status;
    (status == 200 || status == 201) ?
      (Alert.alert("Berhasil Approve")) :
      (Alert.alert("Gagal"));
    setModalVisible(false);
    process();
  }

  async function rejectMaxDiscList() {
    let result = await maxDisc.reject(singlemaxdisc.RECID)
    let status = result.status;
    (status == 200 || status == 201) ?
      (Alert.alert("Berhasil Reject")) :
      (Alert.alert("Gagal"));
    setModalVisible(false);
    process();
  }

  async function process() {
    console.log("process")
    setIsLoading(true);
    // setRefreshing(true);
    let datamaxdisc = await maxDisc.getList();
    datamaxdisc = await changeFormatNumber(datamaxdisc);
    setIsLoading(false);
    //setRefreshing(false);

    setMaxdisclist(datamaxdisc);
    setMaxdisclistSearch(datamaxdisc);
    setMaxDiscCount(datamaxdisc.length);
  }

  function showModalAccept() {
    setIsApproveSuccess(true)
    setTimeout(() => {
      setIsApproveSuccess(false)
    }, 1000);
  }

  function popArray(arr, value) {

    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  const handleLongPress = (item) => {

    console.log(item.RECID)
    const selected = { ...mdselected }; // copy and mutate new state
    selected[item.RECID] = !selected[item.RECID];
    let selectedmd = maxdiscselected;
    setMdSelected(selected);
    if (selected[item.RECID]) { selectedmd.push(parseInt(item.RECID)) }
    else { selectedmd = popArray(selectedmd, parseInt(item.RECID)) }
    setMaxDiscSelected(selectedmd);

    console.log("length", maxdiscselected.length)
  };

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

  async function search(nameKey, myArray) {

    var arrayRes = [];
    var resCount = 0;
    var nameKey = nameKey.toUpperCase();
    console.log(nameKey)
    for (var i = 0; i < myArray.length; i++) {
      console.log(myArray[i].ITEMNAME)
      if (myArray[i].PENAWARANID.includes(nameKey) || myArray[i].NAME.includes(nameKey) || myArray[i].CABANG.includes(nameKey)) {
        console.log("found")
        arrayRes[resCount] = myArray[i];
        resCount++;

      }
    }
    return arrayRes;
  }

  async function onSearch(val) {
    var searchMaxDiscountResult = await search(val, maxdisclistsearch);
    setMaxdisclist(searchMaxDiscountResult);
  }

  const searchHeaderRef = React.useRef(null);
  return (
    <SafeAreaView style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text onPress={() => Actions.pop()} style={styles.labelBack}><Icon name="arrow-left" type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
        <Text style={styles.label}> {props.title} </Text>
        <Text style={styles.labelBack} onPress={maxdiscselected.length == 0 ? () => searchHeaderRef.current.show() : () => Alert.alert('Approval', "Anda akan melakukan " + maxdiscselected.length + " Approval",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "Ok", onPress: () => { approveMaxDiscList(maxdiscselected) } }
          ])} ><Icon name={maxdiscselected.length == 0 ? "search" : "check"} type="FontAwesome" style={{ color: Color.TEXT_PRIMARY }} /> </Text>
      </SafeAreaView>
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
          setMaxdisclist(maxdisclistsearch);
        }}

      />
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { process() }} />
      }>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isApproveSuccess}
          onRequestClose={() => {
            setIsApproveSuccess(false);
          }}
        >
          <View style={styles.modalRequest}>
            <Text>
              <Icon name="check-circle" type="FontAwesome" style={{ fontSize: 80, color: Color.GREEN }} />

            </Text>
          </View>
        </Modal>

        <Modal
          transparent={true}
          isVisible={modalVisible}
          backdropColor="black"
          backdropOpacity={0.7}
          onBackdropPress={() => {
            setModalVisible(false)
          }}
          onRequestClose={() => {
            setModalVisible(false)
          }}
          onDismiss={() => {
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.detailItem}>
              <View style={{ flexDirection: 'row' }}>


                <View style={{ flexDirection: 'column', justifyContent: 'space-around', width: "60%", marginBottom: 5 }}>
                  <View>
                    <Text style={styles.labelModal}>Contact ID</Text>
                    <Text style={styles.valueModal}>{singlemaxdisc.PENAWARANID}</Text>

                  </View>
                  <View>
                    <Text style={styles.labelModal}>Customer Name</Text>
                    <Text style={styles.valueModal}>{singlemaxdisc.NAME}</Text>

                  </View>

                </View>

                <View style={{ flexDirection: 'column', marginLeft: 15 }}>
                  <View>
                    <Text style={styles.labelModal}>Branch</Text>
                    <Text style={styles.valueModal}>{singlemaxdisc.CABANG}</Text>

                  </View>
                  <View>
                    <Text style={styles.labelModal}>Price List</Text>
                    <Text style={styles.valueModal}>Rp. {singlemaxdisc.PRICELIST}</Text>

                  </View>
                </View>

              </View>
              <View style={{}}>
                <Text style={styles.labelModal}>Item Name</Text>
                <Text style={styles.valueModal}>{singlemaxdisc.ITEMNAME}</Text>

              </View>
              <View style={{ flexDirection: 'row', justifyContent: "space-around" }}>
                <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
                  <Text style={styles.valueLabelModal}>{singlemaxdisc.MASTERMAXDISC}</Text>
                  <Text style={styles.textLabelModal} >Master</Text>
                </View>
                <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
                  <Text style={[styles.valueLabelModal, { backgroundColor: Color.YELLOW }]}>{singlemaxdisc.LASTMAXDISC}</Text>
                  <Text style={styles.textLabelModal} >Last</Text>
                </View>
                <View style={{ flexDirection: 'column', justifyContent: "space-around" }}>
                  <Text style={[styles.valueLabelModal, { backgroundColor: Color.BLUE }]}>{singlemaxdisc.MAXDISCOUNT}</Text>
                  <Text style={styles.textLabelModal} >Propose</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', bottom: 0, marginTop: 50 }}>
                <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: Color.ALERT }}
                  onPress={() => rejectMaxDiscList()}>
                  <Text style={styles.textStyle}>Reject</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={{ ...styles.openButton, backgroundColor: "forestgreen" }}
                  onPress={() => approveMaxDiscList([singlemaxdisc.RECID])}>
                  <Text style={styles.textStyle}>Accept</Text>
                </TouchableHighlight>

              </View>
            </View>
          </View>

        </Modal>

        {isLoading ? (<LoadingList height={100} />) : (
          <FlatList
            data={maxdisclist}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={ListEmpty}
            extraData={mdselected}
            renderItem={({ item }) => {

              const itemSelected = mdselected[item.RECID];

              return (
                <View style={itemSelected ? styles.listItemSelected : styles.listItem}>
                  <TouchableOpacity delayLongPress={100} onLongPress={() => { setMaxDiscSelected([]); handleLongPress(item); }} onPress={() => {
                    //Actions.MaxDiscDetailScreen({MDdetail:item})
                    setModalVisible(true);

                    setSinglemaxdisc(item)
                  }}>
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <View style={{ flexDirection: "column", flex: 6 }}>
                        <Text style={{ fontWeight: "bold", color: "white", backgroundColor: "chocolate", width: "50%", padding: 3 }}>{item.PENAWARANID}</Text>
                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>{item.NAME}</Text>
                        <Text style={{ fontSize: 15, color: "white" }}>{item.ITEMNAME}</Text>
                      </View>
                      <View style={{ fontSize: 15, alignItems: "center", justifyContent: "center", color: "white", right: 0, flex: 1 }}>
                        <Text onPress={() => handleLongPress(item)} style={{
                          width: 60, height: 60, borderRadius: 30, backgroundColor: 'chocolate',
                          textAlign: "center", textAlignVertical: "center", overflow: 'hidden', fontWeight: "bold", color: Color.TEXT_PRIMARY
                        }} >
                          {itemSelected ? <Icon name='check' type="FontAwesome" style={Color.TEXT_PRIMARY} /> : item.MAXDISCOUNT} </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY
  },
  valueLabelModal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: 'chocolate',
    textAlign: "center",
    textAlignVertical: "center",
    color: Color.TEXT_PRIMARY
  },
  textLabelModal: {
    textAlign: "center",
    textAlignVertical: "center",
    color: "white",
    fontSize: 12
  },
  labelModal: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 0
  }
  ,
  valueModal: {
    fontSize: 15,
    color: "white",
    fontSize: 18,
    marginBottom: 8
  }
  ,
  MainContainer: {
    flex: 1,
    justifyContent: "center"
  },
  status: {
    zIndex: 10,
    elevation: 2,
    width: DEVICE_WIDTH,
    height: 21,
    backgroundColor: Color.SECONDARY
  },
  header: {
    flexDirection: "row",
    justifyContent: 'space-between',
    width: DEVICE_WIDTH,
    height: 56,
    backgroundColor: Color.SECONDARY
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

  detailItem: {
    margin: 0,
    padding: 30,
    backgroundColor: Color.PRIMARY,
    width: "100%",
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
  listItem: {
    marginLeft: 10,
    marginBottom: 3,
    borderRadius: 3,
    padding: 20,
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
    padding: 20,
    backgroundColor: "black",
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
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalRequest: {
    flex: 1,
    justifyContent: 'center', // Used to set Text Component Vertically Center
    alignItems: 'center', // Used to set Text Component Horizontally Center

  },
  modalView: {
    height: "50%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 0,
    padding: 20,
    alignItems: "center",
    shadowColor: Color.BLACK,

    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    width: "45%",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});
//AppRegistry.registerComponent('MaxDiscListScreen', () => MaxDiscListScreen);
export default MaxDiscListScreen;
