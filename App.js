import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TelaInicial from "./telas/telaInicial";
import TelaMotorista from "./telas/telaMotorista";
import TelaPassageiro from "./telas/telaPassageiro";
import TelaCorridaAceita from "./telas/telaCorridaAceita";
import TelaIndoAoPassageiro from "./telas/telaIndoAoPassageiro";
import React from "react";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial">
        <Stack.Screen name="TelaInicial" component={TelaInicial} />
        <Stack.Screen name="TelaMotorista" component={TelaMotorista} />
        <Stack.Screen name="TelaPassageiro" component={TelaPassageiro} />
        <Stack.Screen name="TelaCorridaAceita" component={TelaCorridaAceita} />
        <Stack.Screen name="TelaIndoAoPassageiro" component={TelaIndoAoPassageiro}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
