
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";

const AppNavigator = createStackNavigator({
  Login: { screen: Login },
  HomeScreen: { screen: HomeScreen},
  DetailsScreen: { screen: DetailsScreen},
});

const AppContainer = createAppContainer(AppNavigator);
export default AppContainer;
