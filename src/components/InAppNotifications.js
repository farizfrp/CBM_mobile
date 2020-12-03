import React from 'react';
import { useGlobal } from 'reactn';
import { StyleSheet, Text, View } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { Icon } from 'native-base';
import { NotificationProfile } from '../helper';

const IS_IOS = Platform.OS === 'ios';

const notificationText = 'Hello World!';

const InAppNotification = () => {
	const [inAppNotifProp, setInAppNotifProp] = useGlobal('inAppNotifProp');
	let menuProps = NotificationProfile.getMenuProps(inAppNotifProp.type);
	let notificationRef = inAppNotifProp.ref;
	onTapHandlerStateChange = (event) => {
		const {state} = event.nativeEvent;
	
		switch (state) {
			case 2:
				// pressIn
				break;
			case 4:
				// pressOut
				NotificationProfile.menuNavigate(inAppNotifProp.type, inAppNotifProp.id )
				notificationRef.current?.hide();
				break;
			default:
				break;
		}
	};
	
	return (
		<TapGestureHandler onHandlerStateChange={onTapHandlerStateChange}>
		<View style={IS_IOS ? styles.customView : styles.customViewAndroid}>
			<View style={{ backgroundColor: menuProps?.backgroundColor||'grey', padding: 15, justifyContent:"center", alignItems:"center", borderRadius: 5, flex:1 }}>
				<Icon name={menuProps?.iconName} style={{ color: "white" }} type="FontAwesome" />
			</View>
			<View style={{flex:8, marginLeft:10}}>
				<Text style={{ color: "white", fontWeight: "bold" }}>{inAppNotifProp.title}</Text>
					<View style={styles.customButton}>
						<Text style={{ color: "white" }}>{inAppNotifProp.body}</Text>
					</View>				
			</View>
		</View>
		</TapGestureHandler>
	);
}

const styles = StyleSheet.create({
	customView: {
		backgroundColor: 'grey',
		width: '100%',
		height: 100,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 16,
	},
	customViewAndroid: {
		backgroundColor: 'grey',
		borderRadius: 5,
		padding: 10,
		flexDirection: 'row',
		width: '102%',
		height: 100,
		alignItems: 'center',
		justifyContent: 'space-around'
	}
});

export default InAppNotification;