import {Tabs} from "expo-router"
import { Ionicons } from '@expo/vector-icons';
import TabTransparente from '@/components/TabBarTransparente';

export default function TabLayout() {
  return(
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#71717100',
      tabBarBackground: TabTransparente,
    }}
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
