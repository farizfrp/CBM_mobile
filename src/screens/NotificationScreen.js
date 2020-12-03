import React, { useState, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Color } from '../styles';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useGlobal } from 'reactn';
import ItemColor from '../components/ItemColor';
import { Actions } from 'react-native-router-flux';
import LoadingList from '../components/SkeletonLoading';
import { apiCall, notification } from '../data';
import { DateHelper } from '../helper';
import Spinner from 'react-native-loading-spinner-overlay';

const NotificationScreen = () => {

  const [notificationList, setNotificationList] = useState([]);
  const [notificationCount, setNotificationCount] = useGlobal('notificationCount');
  const [notificationCountClicked, setNotificationCountClicked] = useGlobal('notificationCountClicked');
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isLoadingNavigation, setIsLoadingNavigation] = useState(false);

  const ListEmpty = () => {
    return (
      //View to show when list is empty
      <View contentContainerStyle={{ flexGrow: 1 }} style={styles.MainContainer}>
        <Text style={{ textAlign: 'center', alignItems: "center", color: Color.TEXT_PRIMARY, fontSize: 20, fontWeight: "bold" }}>There's No Notifcation</Text>
      </View>
    );
  }

  const itemCodeToColor = (itemType) => {
    const itemCode = [];
    itemCode['0'] = 'so';
    itemCode['1'] = 'cl';
    itemCode['2'] = 'md';
    itemCode['3'] = 'pbc';
    itemCode['4'] = 'pbc';

    return ItemColor[itemCode[itemType]];

  }

  const alertMessage = (itemType) => {

    Alert.alert("Pengajuan " + itemType + " Tidak Ditemukan");
  
  }

  const menuNavigate = async (itemType, typeId, id) => {
    console.log("menuNavigatemenuNavigatemenuNavigatemenuNavigate")
    if (itemType == "Double Login") { return null }
    else { setIsLoadingNavigation(true); }
    const itemCode = [];
    const screenDetail = [];

    screenDetail['0'] = async () => await apiCall.getSODetail(typeId);
    screenDetail['1'] = async () => await apiCall.getClDetail(typeId);
    screenDetail['2'] = async () => await apiCall.getMDDetail(typeId);
    screenDetail['3'] = () => null;
    screenDetail['4'] = () => null;

    itemCode['0'] = (detail) => detail ? Actions.SalesOrderDetailScreen({ soDetail: detail }) : alertMessage('Sales Order');
    itemCode['1'] = (detail) => detail ? Actions.CreditLimitDetailScreen({ clDetail: detail }) : alertMessage('Credit Limit');
    itemCode['2'] = (detail) => detail ? Actions.MaxDiscDetailScreen({ MDdetail: detail }) : alertMessage('Max Disc');
    itemCode['3'] = () => Actions.BookingCoilScreen({ isBM: true });
    itemCode['4'] = () => Actions.BookingCoilScreen();

    setIsLoadingNavigation(true);     
    itemCode[itemType](await screenDetail[itemType]());
    setIsLoadingNavigation(false);
  }

  const handleTouch = (props) => {
    const item = props.item;
    const index = props.index;

    {
      if (item.is_read) {
        menuNavigate(item.type, item.typeid, item.id);
      }
      else {
 
        let newNotificationList = { ...notificationList };
        newNotificationList[index].is_read = 1;
        setNotificationCount(notificationCount - 1)
       
        menuNavigate(item.type, item.typeid, item.id);
        notification.sync(profile.username, -1)
        notification.postRead(item.id)

      }
    }

  }
  
  const renderList = (props) => {
    const item = props.item;
    const index = props.index;
    const isRead = notificationList[index].is_read


    return (
      //View to show when list is empty
      <TouchableOpacity onPress={() => handleTouch(props)}>
        <View style={isRead ? styles.listItem : styles.listItemSelected}>
          <View style={{ flexDirection: "row", justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <View style={{ flexDirection: "column", flex: 6 }}>
              <Text style={{ fontWeight: "bold", color: Color.TEXT_PRIMARY, backgroundColor: itemCodeToColor(item.type), padding: 3 }}>{item.title}</Text>
              <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 20 }}>{item.body}</Text>
              <Text style={{ fontSize: 15, color: Color.GREY }}>{DateHelper.formatDate(item.created_at)}</Text>
            </View>
            {isRead ? <View style={{ flex: 1 }} /> : <View style={{ fontSize: 15, alignItems: "flex-end", justifyContent: "center", color: "white", right: 0, flex: 1 }}>
              <Text style={{
                width: 10, height: 10, borderRadius: 30, backgroundColor: Color.ALERT,
                textAlign: "center", textAlignVertical: "center", overflow: 'hidden', fontWeight: "bold", color: Color.TEXT_PRIMARY
              }} ></Text>
            </View>}
          </View>

        </View>
      </TouchableOpacity>
    );
  }

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View style={styles.footer}>

        {isLoadMore ? (
          <ActivityIndicator
            color="white"
            style={{ marginLeft: 8 }} />
        ) : null}

      </View>
    );
  };


  async function getNotifList(username, pageNumber) {
    let notificationListResult = await notification.getNotifList(username, pageNumber);
    setPageNumber(pageNumber);
    return notificationListResult;

  }

  async function handlePagination() {
    setIsLoadMore(true)
    let notificationListResult = await getNotifList(profile.username, pageNumber + 1)
    const newNotif = notificationList.concat(notificationListResult)
    setNotificationList(newNotif)
    setIsLoadMore(false)
    console.log("newNotif", newNotif.length)
  }
  async function process() {
    notification.sync(profile.username)
    setIsLoadingNavigation(false)
   // setIsLoadingNavigation(true)
    setIsLoading(true)
    let notificationListResult = await getNotifList(profile.username, 1)
    setNotificationList(notificationListResult)
    setIsLoading(false)
    console.log("refresh notificationCount")
  }


  useEffect(() => {
    notificationCountClicked ? process() : null
    setNotificationCountClicked(false)

  }, [notificationCountClicked]);


  return (
    <View contentContainerStyle={{ flexGrow: 1 }}
      style={styles.container} >
      <Spinner
        visible={isLoadingNavigation}
        cancelable={true}
        textContent={'Getting Data...'}
        textStyle={{ color: Color.TEXT_PRIMARY }}
      />
      {isLoading ? (
        <LoadingList height={100} />
      ) : (
          <FlatList
            data={notificationList}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={ListEmpty}
            renderItem={renderList}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={() => { process() }} />
            }
            keyExtractor={(item) => item.id}
            extraData={notificationCount}
            ListFooterComponent={renderFooter}
            onEndReached={() => {
              handlePagination()
              console.log("END REACHHHHHHHED")
            }}
          />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.SECONDARY
  },
  MainContainer: {
    flex: 1,
    justifyContent: "center"
  },

  listItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: Color.GREY,

    padding: 20,
    backgroundColor: Color.SECONDARY,
    width: wp("100%"),
    flex: 1,
  },
  listItemSelected: {
    borderBottomWidth: 0.5,
    borderBottomColor: Color.GREY,
    padding: 20,
    backgroundColor: Color.PRIMARY,
    width: wp("100%"),
    flex: 1,
  }
}
)

export default NotificationScreen;