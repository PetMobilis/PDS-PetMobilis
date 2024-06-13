import React, { useState, useRef } from "react";
import { View, Text, Button } from "react-native";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation } from "@react-navigation/native"; // Importe o hook useNavigation
import { googleApi } from "./config";
import { socket } from "./socket.js";

const TelaMotorista = () => {
  const navigation = useNavigation(); // Use o hook useNavigation para obter a prop navigation
  const mapEl = useRef(null);
  const [corrida, setCorrida] = useState(null);
  const [distance, setDistance] = useState(0);
  const [emCorrida, setEmCorrida] = useState(false); // Novo estado
  const [corridaAtual, setCorridaAtual] = useState(null);

  socket.on("dadosCorrida", (corrida) => {
    setCorrida(corrida);
    setEmCorrida(false); // Reseta o estado quando uma nova corrida é recebida
  });

  const aceitarCorrida = () => {
    console.log("Corrida aceita!");
    socket.emit("aceitarCorrida"); // Notifica o servidor que a corrida foi aceita
    setCorridaAtual(corrida);
    setCorrida(null); // Limpa os dados da corrida
    setEmCorrida(true); // Define o estado como true quando a corrida é aceita
  
    navigation.navigate('TelaIndoAoPassageiro', { destination: corrida.origin, finalDestination: corrida.destination }); // Navegue para a telaIndoAoPassageiro.js aqui
  };

  const rejeitarCorrida = () => {
    console.log("Corrida rejeitada!");
    socket.emit("rejeitarCorrida"); // Notifica o servidor que a corrida foi rejeitada
    setCorrida(null); // Limpa os dados da corrida
  };

  return (
    <View>
      {emCorrida ? (
        <>
          <Text>Você está em uma corrida, indo até o destino</Text>
          {/* Utiliza corridaAtual em vez de corrida */}
          <MapView
            style={{ width: '100%', height: '50%' }}
            initialRegion={corridaAtual.origin}
            ref={mapEl}
          >
            <MapViewDirections
              origin={corridaAtual.origin}
              destination={corridaAtual.destination}
              apikey={googleApi}
              strokeWidth={3}
              onReady={(result) => {
                mapEl.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50,
                  },
                });
                setDistance(result.distance);
              }}
            />
          </MapView>
          <Text>Origem: {corridaAtual.origin.streetName}</Text>
          <Text>Destino: {corridaAtual.destination.streetName}</Text>
          <Text>Distância: {Math.round(distance)} km</Text>
        </>
      ) : corrida ? (
        <>
          <MapView
            style={{ width: '100%', height: '50%' }}
            initialRegion={corrida.origin}
            ref={mapEl}
          >
            <MapViewDirections
              origin={corrida.origin}
              destination={corrida.destination}
              apikey={googleApi}
              strokeWidth={3}
              onReady={(result) => {
                mapEl.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50,
                  },
                });
                setDistance(result.distance);
              }}
            />
          </MapView>
          <Text>Origem: {corrida.origin.streetName}</Text>
          <Text>Destino: {corrida.destination.streetName}</Text>
          <Text>Distância: {Math.round(distance)} km</Text>
          <Button title="Aceitar Corrida" onPress={aceitarCorrida} />
          <Button title="Rejeitar Corrida" onPress={rejeitarCorrida} />
        </>
      ) : (
        <Text>Aguardando corrida...</Text>
      )}
    </View>
  );
};

export default TelaMotorista;