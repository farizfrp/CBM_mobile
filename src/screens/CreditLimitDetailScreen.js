import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios';
import { Icon } from 'native-base';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Actions } from 'react-native-router-flux';
import { BarChart, Grid, AreaChart } from 'react-native-svg-charts';
import { Text as TextSVG } from 'react-native-svg';
import { Circle, Path } from 'react-native-svg'
import Api from '../components/Api';
import Modal from 'react-native-modal';
import { Color } from '../styles';
import { DateHelper, NumberHelper } from '../helper';



const CreditLimitDetailScreen = (props) => {
  let profile = global.profile;

  const [modalVisible, setModalVisible] = useState(false);
  const [clDetail, setCLDetail] = useState({});
  const [clDocList, setCLDocList] = useState(clDocList);
  const [isModalApprove, setIsModalApprove] = useState(false);
  const [reason, setReason] = useState('');
  const [onClick, setOnClick] = useState(() => { });
  const [type, setType] = useState('');
  const [bgColor, setBGColor] = useState('');

  let urlFile = Api.FileUrl;
  let transClType = ["CL", "TOP", "CLTOP"];
  let detail = clDetail;
  let dataClValue = [detail.CREDITLIMITOLD, detail.CREDITLIMITNEW]
  let dataTOPValue = [detail.TOPOLD, detail.TOPNEW]
  let dataPAValue = [detail.TOPNEW, detail.AGINGAVG, detail.AGINGMAX]

  const colorCLTOP = ["paleturquoise", "cornflowerblue"]

  let dataCl = [
    {
      value: dataClValue[0],
      svg: {
        fill: colorCLTOP[0],
      },
    },
    {
      value: dataClValue[1],
      svg: {
        fill: colorCLTOP[1],
      },
    },
  ]

  let dataTOP = [
    {
      value: dataTOPValue[0],
      svg: {
        fill: colorCLTOP[0],
      },
    },
    {
      value: dataTOPValue[1],
      svg: {
        fill: colorCLTOP[1],
      },
    },
  ]

  async function getclDocList() {
    let request = { proposeid: clDetail.CLPROPOSEID }
    return await axios.get(Api.CreditLimit.file_cl, {
      params: request
    });
  }



  function openFile(filename) {
    console.log(filename)
    const localFile = `${RNFS.DocumentDirectoryPath}/` + filename;
    let url = urlFile + filename;
    const options = {
      fromUrl: url,
      toFile: localFile
    };
    RNFS.downloadFile(options).promise
      .then(() => FileViewer.open(localFile))
      .then(() => {
        // success
      })
      .catch(error => {
        // error
      });
  }



  async function process() {


    let cldetail = { ...props.clDetail };

    cldetail.CREDITLIMITOLD = NumberHelper.formatMillion(cldetail.CREDITLIMITOLD);
    cldetail.CREDITLIMITNEW = NumberHelper.formatMillion(cldetail.CREDITLIMITNEW);
    cldetail.TOPOLD = NumberHelper.formatMillion(cldetail.TOPOLD);
    cldetail.TOPNEW = NumberHelper.formatMillion(cldetail.TOPNEW);
    cldetail.AGINGAVG = NumberHelper.formatMillion(cldetail.AGINGAVG);
    cldetail.AGINGMAX = NumberHelper.formatMillion(cldetail.AGINGMAX);

    cldetail.FROMARDATE = await DateHelper.formatDate(cldetail.FROMARDATE);
    cldetail.TOARDATE = await DateHelper.formatDate(cldetail.TOARDATE);
    cldetail.LASTINVDATE = await DateHelper.formatDate(cldetail.LASTINVDATE);
    cldetail.SURVEYORDATE = await DateHelper.formatDate(cldetail.SURVEYORDATE);
    setCLDetail(cldetail);
    let clDocList = await getclDocList();
    clDocList = clDocList.data;
    setCLDocList(clDocList)
  }

  function onModalClick(types, onClicks, bgColor) {
    setType(types)
    setOnClick(onClicks)
    setBGColor(bgColor)
    setIsModalApprove(true)
  }

  const LabelCL = ({ x, y, bandwidth, data }) => (
    dataClValue.map((value, index) => (
      <TextSVG
        key={index}
        x={x(index) + (bandwidth / 2)}
        y={y(value) - 10}
        fontSize={14}
        fill={'white'}
        alignmentBaseline={'middle'}
        textAnchor={'middle'}
      >
        {value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " M"}
      </TextSVG>
    ))
  )

  const LabelTOP = ({ x, y, bandwidth, data }) => (
    dataTOPValue.map((value, index) => (
      <TextSVG
        key={index}
        x={x(index) + (bandwidth / 2)}
        y={y(value) - 10}
        fontSize={14}
        fill={'white'}
        alignmentBaseline={'middle'}
        textAnchor={'middle'}
      >
        {value + " D"}
      </TextSVG>
    ))
  )

  const Decorator = ({ x, y, data }) => {
    return data.map((value, index) => (
      <>
        <TextSVG
          key={index}
          x={index != 0 ? x(index) - 20 : x(index) + 20}
          y={y(value) - 10}
          fontSize={14}
          fill={'white'}
          alignmentBaseline={'middle'}
          textAnchor={'middle'}
        >
          {value + " D"}
        </TextSVG>
        <Circle
          key={index}
          cx={x(index)}
          cy={y(value)}
          r={4}
          stroke={'rgb(134, 65, 244)'}
          fill={'white'}
        /></>
    ))
  }


  let onApproveClick = async (reason) => {
    let result = await postApproveCl(reason);
    let status = result.status;
    (status == 200 || status == 201) ?
      (Alert.alert("Berhasil Approve")) :
      (Alert.alert("Gagal"));
    Actions.reset('tabbarx');
    Actions.CreditLimitListScreen();
    result ? '' : Alert.alert("Gagal")
  }

  const onRejectClick = async (reason) => {
    let result = await postRejectCl(reason);
    if (result) Alert.alert("Berhasil Reject");
    Actions.reset('tabbarx');
    Actions.CreditLimitListScreen();
  }

  async function postApproveCl(reason) {
    let request = {
      userax: profile.userax,
      proposeid: [clDetail.CLPROPOSEID],
      approvenote: reason
    }
    return await axios.post(Api.CreditLimit.app_cl, request);
  }

  async function postRejectCl(reason) {

    let request = {
      proposeid: clDetail.CLPROPOSEID,
      cancelnote: reason
    }
    return await axios.post(Api.CreditLimit.notapp_cl, request);
  }




  const Line = ({ line }) => (
    <Path
      d={line}
      stroke={'paleturquoise'}
      fill={'none'}
    />
  )

  const SurveyStatus = (props) => {
    isSurvey = props.isSurvey
    isSurvey = parseInt(isSurvey)
    const backgroundColor = ["red", "green"];
    const label = ["OFF", "ON"];

    return (
      <View style={{ marginBottom: 0 }}>
        <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Survey</Text>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, backgroundColor: backgroundColor[isSurvey], textAlign: "center", fontSize: 18, width: "50%" }}>{label[isSurvey]}</Text>
      </View>)
  }


  const Survey = (props) => {
    isSurvey = props.isSurvey
    isSurvey = parseInt(isSurvey)

    if (isSurvey == 0) return (<View />)
    return (

      <View>

        <Text style={{ color: Color.TEXT_PRIMARY, marginTop: 5, marginBottom: 0, fontWeight: "bold", margin: 5 }}>Survey</Text>
        <View style={styles.detailItem}>
          <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15, alignSelf: "flex-end" }}>{clDetail.SURVEYORDATE}</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}></Text>
            <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>{clDetail.SURVEYORRESUME}</Text>
          </View>
        </View>
      </View>


    )
  }

  useEffect(() => {

    process();

  }, []);

  return (
    <View style={{}}>
      <ScrollView keyboardShouldPersistTaps='handled' style={styles.container}>
        <Modal isVisible={isModalApprove}
          onBackdropPress={() => {
            setIsModalApprove(false)
          }}
        >

          <View style={{ justifyContent: "space-around", alignItems: "center", backgroundColor: "#454343", height: hp("30%"), borderColor: Color.TEXT_PRIMARY }}>
            <Text style={{
              padding: 5, fontSize: 15, fontWeight: "bold", textAlign: "center", textAlignVertical: "center", color: "#F7F7F7"
            }} >
              {type}
            </Text>
            <TextInput
              style={{ borderColor: Color.TEXT_PRIMARY, borderWidth: 3, borderRadius: 5, color: Color.TEXT_PRIMARY, width: "80%" }}
              multiline
              numberOfLines={4}
              placeholder="Type here to fill the reason"
              placeholderTextColor={Color.TEXT_PRIMARY}
              onChangeText={(text) => setReason(text)}
              defaultValue={''}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: "80%", padding: 10 }}>
              <View style={{ width: "45%", backgroundColor: bgColor, padding: 5, borderRadius: 10 }}>
                <TouchableOpacity onPress={() => { onClick(reason) }}>
                  <Text style={{
                    padding: 5, fontSize: 15, fontWeight: "bold", textAlign: "center", textAlignVertical: "center", color: "#F7F7F7"
                  }} >
                    {type}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.detailItem}>

          <View style={{ margin: 10, flexDirection: 'row', justifyContent: "space-between" }}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-around', flex: 2, paddingRight: 10 }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Propose ID</Text>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{clDetail.CLPROPOSEID}</Text>

              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Sales Name</Text>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{clDetail.SALESRESPONSIBLENAME}</Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Customer Name</Text>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY }}>{clDetail.CUSTNAME}</Text>
              </View>

            </View>

            <View style={{ flexDirection: 'column', marginLeft: 0, flex: 1 }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Cabang</Text>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{clDetail.BRANCH}</Text>

              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>Type</Text>
                <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}>{transClType[clDetail.TRANSTYPECL]}</Text>

              </View>
              <SurveyStatus isSurvey={clDetail.SURVEY} />
            </View>
          </View>
        </View>


        <View
          style={{
            borderBottomColor: '#454343',
            borderBottomWidth: 0.19,
            marginTop: 10,


          }}
        />

        <View style={{ padding: 0 }}>
          <View style={{ justifyContent: "space-around", height: "25%", flexDirection: 'row' }}>

            <View style={{
              flex: 1, padding: 20, backgroundColor: "#454343", width: "100%", flexDirection: "column", justifyContent: "space-between",
              borderRadius: 5, shadowColor: "#000", margin: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.35,
              shadowRadius: 4.0,
              elevation: 7
            }}>
              <BarChart
                style={{
                  flex: 1
                }}
                color={colorCLTOP}
                data={dataCl}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                contentInset={{ top: 20, bottom: 10 }}
                yAccessor={({ item }) => item.value}
                spacing={0.2}
                gridMin={0}
              >
                <Grid direction={Grid.Direction.HORIZONTAL} />
                <LabelCL />


              </BarChart>
              <Text style={{ color: Color.TEXT_PRIMARY, textAlign: "center" }}>Credit Limit</Text>
            </View>
            <View style={{
              flex: 1, padding: 20, backgroundColor: "#454343", width: "100%", flexDirection: "column", justifyContent: "space-between",
              borderRadius: 5, shadowColor: "#000", margin: 5,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.35,
              shadowRadius: 4.0,
              elevation: 7
            }}>
              <BarChart
                style={{
                  flex: 1
                }}
                data={dataTOP}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                contentInset={{ top: 20, bottom: 10 }}
                yAccessor={({ item }) => item.value}
                spacing={0.2}
                gridMin={0}
              >
                <Grid direction={Grid.Direction.HORIZONTAL} />
                <LabelTOP />


              </BarChart>
              <Text style={{ color: Color.TEXT_PRIMARY, textAlign: "center" }}>TOP</Text>
            </View>
          </View>
          <Text style={{ color: Color.TEXT_PRIMARY, marginTop: 5, marginBottom: 0, fontWeight: "bold", margin: 5 }}>Payment Analysis</Text>
          <View style={{ justifyContent: "space-around", flexDirection: 'row', margin: 5, marginTop: 0 }}>

            <View style={{
              margin: 3, flex: 1, padding: 25, backgroundColor: "#454343", width: "100%", flexDirection: "column", justifyContent: "space-between",
              borderRadius: 5, shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.35,
              shadowRadius: 4.0,
              elevation: 7
            }}>
              <AreaChart
                style={{ height: 100 }}
                data={dataPAValue}
                svg={{ fill: 'paleturquoise', opacity: .2 }}
                contentInset={{ top: 20, bottom: 10 }}
              >
                <Grid />
                <Line />
                <Decorator />
              </AreaChart>
              <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
                <Text style={{ color: Color.TEXT_PRIMARY, }}>TOP</Text>
                <Text style={{ color: Color.TEXT_PRIMARY }}>AVG</Text>
                <Text style={{ color: Color.TEXT_PRIMARY }}>MAX</Text>
              </View>

              <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: Color.TEXT_PRIMARY, textAlign: "left" }}>From</Text>
                  <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.GREEN, width: "100%" }}>{clDetail.FROMARDATE}</Text>
                </View>
                <View>
                  <Text style={{ color: Color.TEXT_PRIMARY, textAlign: "left" }}>To</Text>
                  <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.ALERT }}>{clDetail.TOARDATE}</Text>
                </View>
                <View>
                  <Text style={{ color: Color.TEXT_PRIMARY, textAlign: "left" }}>Last</Text>
                  <Text style={{ color: Color.TEXT_PRIMARY, backgroundColor: Color.CHOCOLATE }}>{clDetail.LASTINVDATE}</Text>
                </View>


              </View>
            </View>


            <View>
            </View>
          </View>

          <Survey isSurvey={clDetail.SURVEY} />
          <Text style={{ color: Color.TEXT_PRIMARY, marginTop: 5, marginBottom: 0, fontWeight: "bold", margin: 5 }}>AR Analysis</Text>
          <View style={styles.detailItem}>
            {clDetail.RESULTCL != 0 ? (
              <Text style={{ position: "absolute", top: 0, right: 0 }}>
                <Icon name={clDetail.RESULTCL == 1 ? "check" : "times"} type="FontAwesome" style={{ fontSize: 50, color: clDetail.RESULTCL == 1 ? '#7EC693' : "#FF8379" }} />
              </Text>) : <View />}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18, color: Color.TEXT_PRIMARY, fontSize: 18 }}></Text>

              <Text style={{ color: Color.TEXT_PRIMARY, fontSize: 15 }}>{clDetail.COMPLETENOTE}</Text>


            </View>

          </View>
          <View style={{ justifyContent: "space-around", flexDirection: 'row', margin: 5 }}>


          </View>
          <Text style={{ fontWeight: "bold", fontSize: 13, marginBottom: 5, color: Color.TEXT_PRIMARY }}>Preview File</Text>
          <View style={{ marginBottom: 15 }}>
            <FlatList
              data={clDocList}
              renderItem={({ item }) => (
                <View style={{ marginBottom: 5 }}>

                  <TouchableOpacity onPress={() => openFile(item.FILENAME)}>
                    <Text style={{
                      width: '100%', height: 40, fontSize: 13, fontWeight: "bold", borderRadius: 10,
                      backgroundColor: Color.CHOCOLATE, textAlign: "left", textAlignVertical: "center", color: Color.TEXT_PRIMARY
                    }} > {"    "}
                      <Icon name="file" type="FontAwesome" style={{ fontSize: 13, color: Color.TEXT_PRIMARY }} />
                      {"  " + item.NAME}
                    </Text>
                  </TouchableOpacity>
                </View>

              )

              }
              keyExtractor={item => item.email}
            />
          </View>
        </View>

      </ScrollView>

      <View style={{ flexDirection: 'row', backgroundColor: "#2e2b2b", justifyContent: 'space-around', alignItems: "center", padding: 10, flex: 0 }}>

        <View style={{ width: "40%", height: "100%", padding: 5, backgroundColor: 'red', borderRadius: 10 }}>
          <TouchableOpacity onPress={() => onModalClick("Reject", () => onRejectClick, 'red')}>

            <Text style={{
              padding: 5, fontSize: 15, fontWeight: "bold",
              textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
            }} >
              <Icon name="times" type="FontAwesome" style={{ fontSize: 18, color: Color.TEXT_PRIMARY }} />  Reject
          </Text>

          </TouchableOpacity></View>

        <View style={{ width: "40%", backgroundColor: Color.GREEN, padding: 5, borderRadius: 10 }}>
          <TouchableOpacity onPress={() => onModalClick("Approve", () => onApproveClick, Color.GREEN)}>
            <Text style={{
              padding: 5, fontSize: 15, fontWeight: "bold", textAlign: "center", textAlignVertical: "center", color: Color.TEXT_PRIMARY
            }} >
              <Icon name="check" type="FontAwesome" style={{ fontSize: 18, color: Color.TEXT_PRIMARY }} />  Approve
          </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  // FCA5AD
  container: {
    height: "92%",
    padding: 10,
    backgroundColor: Color.SECONDARY
  },

  detailItem: {
    marginTop: 5,
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: Color.PRIMARY,
    width: "100%",
    flexDirection: "column",
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


});

export default CreditLimitDetailScreen;