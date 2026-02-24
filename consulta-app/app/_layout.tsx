import {Tabs} from "expo-router"
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return(
  <Tabs
    screenOptions={{tabBarActiveTintColor: '#6395ec'}}
  >
    <Tabs.Screen
      name="Inicio"
      options={{
        tabBarLabel:"Home",
        tabBarIcon: ({color, size}) => <Ionicons name="home" color={color} size={size}/>
      }}
      
    />

  </Tabs>
);}
