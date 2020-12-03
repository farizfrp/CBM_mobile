import React, { useEffect } from 'react';
import { useGlobal } from 'reactn';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { Actions } from 'react-native-router-flux';
import { Icon, Badge } from 'native-base';
import { RFValue } from "react-native-responsive-fontsize";
import Api from '../components/Api';
import { maxDisc } from '../data';
import Color from '../styles/colors';


const ApprovalMenuScreen = () => {
  const isBM = true;
  const [maxDiscCount, setMaxDiscCount] = useGlobal('maxDiscCount');
  const [soCount, setSOCount] = useGlobal('soCount');
  const [clCount, setCLCount] = useGlobal('clCount');
  const [pbcCount, setPBCCount] = useGlobal('pbcCount');
  const [poCount, setPOCount] = useGlobal('poCount');

  let menuProps = {
    maxDisc: {
      backgroundColor: Color.CHOCOLATE,
      onPress: Actions.MaxDiscListScreen,
      iconName: "percent",
      title: "Max Disc",
      stateVar: maxDiscCount,
      isShow: profile.approve_max_disc == 1
    },
    salesOrder: {
      backgroundColor: Color.BLUE,
      onPress: Actions.SalesOrderListScreen,
      iconName: "book",
      title: "Sales Order",
      stateVar: soCount,
      isShow: profile.approve_so == 1
    },
    creditLimit: {
      backgroundColor: Color.PURPLE,
      onPress: Actions.CreditLimitListScreen,
      iconName: "credit-card-alt",
      title: "Credit Limit",
      stateVar: clCount,
      isShow: profile.approve_cl == 1
    },
    bookingCoil: {
      backgroundColor: Color.GREY,
      onPress: () => Actions.BookingCoilScreen({ isBM }),
      iconName: "barcode",
      title: "Booking Coil",
      stateVar: pbcCount,
      isShow: profile.approve_bc == 1
    },
    cuti: {
      backgroundColor: Color.YELLOW,
      onPress: Actions.ApprovalCutiList,
      iconName: "ambulance",
      title: "Cuti",
      stateVar: 0,
      isShow: profile.approve_hris == 1
    },
    dinas: {
      backgroundColor: Color.GREEN,
      onPress: Actions.ApprovalCutiList,
      iconName: "plane",
      title: "Dinas",
      stateVar: 0,
      isShow: profile.approve_hris == 1
    },
    izin: {
      backgroundColor: Color.GREYLIGHTS,
      onPress: Actions.ApprovalIzinList,
      iconName: "space-shuttle",
      title: "Izin",
      stateVar: 0,
      isShow: profile.approve_hris == 1
    },
    purchaseOrder: {
      backgroundColor: Color.SKY,
      onPress: Actions.PurchaseOrderListScreen,
      iconName: "shopping-cart",
      title: "Purchase Order",
      stateVar: poCount,
      isShow: true
    }
  }

  async function getSoCount() {
    let result = await axios.get(Api.SalesOrder.count_app_so, {
      params: {
        userax: profile.userax
      }
    });
    return result.data;
  }

  async function getPBCCount() {
    let result = await axios.get(Api.BookingCoil.count_list_app_pbc, {
      params: {
        userax: profile.userax
      }
    });
    return result.data;
  }

  async function getClCount() {
    let result = await axios.get(Api.CreditLimit.count_show_cl, {
      params: {
        userax: profile.userax
      }
    });
    return result.data;
  }

  async function getPoCount() {
    let result = await axios.get(Api.PurchaseOrder.count, {
      params: {
        userax:profile.userax
      }
    });
    return result.data;
  }

  async function process() {
    maxDiscCount, clCount, maxDiscCount

    setMaxDiscCount(await maxDisc.count())

    setSOCount(await getSoCount())

    setCLCount(await getClCount())

    setPBCCount(await getPBCCount())

    setPOCount(await getPoCount())

  }

  const MenuItem = (props) => {
    let { isShow, backgroundColor, onPress, iconName, title, stateVar } = props.props;
    if (isShow) {
      return (

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: backgroundColor }]} onPress={() => onPress()}>
          <Text style={{ textAlign: "center", textAlignVertical: "center" }}><Icon name={iconName} type="FontAwesome" style={styles.menuItemIcon} /> </Text>
          <Text style={styles.textMenu}>{title} </Text>

          {
            stateVar != 0 ? (<Badge style={{ position: "absolute", top: 0, right: 0 }} >
              <Text style={{ color: Color.TEXT_PRIMARY }}>{stateVar}</Text>
            </Badge>) : (<View />)
          }</TouchableOpacity>
      )
    }
    else return (<View />)

  }

  useEffect(() => {
    process();
  }, []);
  return (
    <ScrollView style={{ backgroundColor: Color.SECONDARY, flex: 1 }}>
      <View style={{ flexDirection: "column", justifyContent: "space-around", margin: 5 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <MenuItem props={menuProps.maxDisc} />
          <MenuItem props={menuProps.salesOrder} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <MenuItem props={menuProps.creditLimit} />
          <MenuItem props={menuProps.bookingCoil} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <MenuItem props={menuProps.purchaseOrder} />
          <MenuItem props={menuProps.cuti} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <MenuItem props={menuProps.dinas} />
          <MenuItem props={menuProps.izin} />
        </View>
      </View>
    </ScrollView>
  );
}

export default ApprovalMenuScreen;
const styles = StyleSheet.create({

  menuItemIcon: {
    fontSize: RFValue(50, 580),
    color: Color.TEXT_PRIMARY,
    textAlign: "center",
    textAlignVertical: "center"
  },
  menuItem: {
    padding: RFValue(20, 580),
    margin: 5,
    flex: 1,
    borderRadius: 0
  },
  textMenu: {
    textAlign: 'center',
    color: "white",
    fontSize: RFValue(14, 580),
    textAlignVertical: "center",
    marginTop: 50,
    bottom: 0
  }

});
