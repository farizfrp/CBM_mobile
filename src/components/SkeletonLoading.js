import React from 'react';
import { View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Color } from "../styles";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";


const LoadingList = (props) => {
    return (
        <View style={{flex:1, alignItems:"center"}}>

          {  [0, 1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={{
                marginBottom: 12, borderRadius:3, width: "96%", height: props.height || 150,
                backgroundColor: Color.PRIMARY
            }}>
                <SkeletonPlaceholder backgroundColor={Color.SECONDARY}
                    highlightColor={Color.PRIMARY}>
                    <View style={{ flexDirection: "row", padding:"5%" }}>
                        <View style={{ width: 60, height: 60, borderRadius: 50, alignItems:"center", alignSelf:"center", flex:1 }} />
                        <View style={{ marginLeft: 20 , flex:1}}>
                            <View style={{ width: wp("60%"), height: 20, borderRadius: 4 }} />
                            <View style={{  width: "30%", height: 20, borderRadius: 4 , marginTop: 6 }}/>
                            <View style={{width: "50%", height: 20, borderRadius: 4,  marginTop: 6 }}/>
                          {  props.height?<View/>:  <View style={{width: "80%", height: 20, borderRadius: 4,  marginTop: 6 }}/>}
                        </View>
                    </View>
                </SkeletonPlaceholder>
            </View>
        ))
}
        </View>
    )


}
export default LoadingList