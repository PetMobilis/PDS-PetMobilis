import React from 'react';
import { Text, View, Button } from 'react-native';

const TelaInicial = ({ navigation }) => {
  return (
    <View>
      <Text>Selecione sua opção:</Text>
      <Button
        title="Sou Motorista"
        onPress={() => navigation.navigate('TelaMotorista')}
      />
      <Button
        title="Sou Passageiro"
        onPress={() => navigation.navigate('TelaPassageiro')}
      />
    </View>
  );
};

export default TelaInicial;
