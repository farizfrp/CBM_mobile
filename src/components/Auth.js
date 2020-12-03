
import Api from './Api';
import AsyncStorage from '@react-native-community/async-storage';


const Auth = () =>{


  const logout = () =>{
        let username = { username: global.username };
        console.log("Logout called")
        axios.post(Api.Auth.logout, username)
          .then(function (response) {
            console.log("Berhasil", response)
            AsyncStorage.removeItem('accountprofile');
            Alert.alert("Anda Berhasil Log Out")
          })
          .catch(function (error) {
            console.log("error", error)
          });
      }
} 

export default Auth;