import React, { useState, useRef, useEffect } from "react";
import { Text, View, Button } from "react-native";
import { css } from "./css/Css";
import MapView, {Marker} from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation } from '@react-navigation/native'; // Importe o hook useNavigation

import { googleApi } from "./config";

import { api } from "./api.js";
import { getStreetName } from "./utils.js";
import { socket } from "./socket.js";

const TelaPassageiro = () => {
  const navigation = useNavigation(); // Use o hook useNavigation para obter a prop navigation
  const mapEl = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(0);

  const [rideAccepted, setRideAccepted] = useState(false);

  useEffect(() => {
    // Adiciona um ouvinte para o evento 'corridaAceita'
    socket.on('corridaAceita', () => {
      setRideAccepted(true);
      navigation.navigate('TelaCorridaAceita', { origin, destination }); // Navegue para a TelaCorridaAceita aqui
    });

    // Limpa o ouvinte quando o componente é desmontado
    return () => {
      socket.off('corridaAceita');
    };
  }, [origin, destination]); // Adicione origin e destination como dependências do useEffect


  const getLocationAsync = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const originStreetNameResponse = await getStreetName(
          location.coords.latitude,
          location.coords.longitude
        );

        setOrigin({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          streetName: originStreetNameResponse,
        });

    
      } else {
        throw new Error("Location permission not granted");
      }
    } catch (error) {
      console.error("Error fetching location:", error.message);
    }
  };

  const [searchingForDriver, setSearchingForDriver] = useState(false);

  const sendRideData = () => {
    if (origin && destination) {
      // Envia os dados da corrida para o servidor
      api
        .post("", { origin, destination })
        .then((response) => {
          if (response.status !== 201) {
            console.error(
              "Erro ao enviar dados da corrida:",
              response.statusText
            );
            return;
          }

          // Inicia a busca por um motorista
          setSearchingForDriver(true);

          socket.emit("getCorrida");
        })
        .catch((error) => {
          console.error("Erro ao enviar dados da corrida:", error.message);
        });
    } else {
      console.log(
        "Por favor, defina a origem e o destino antes de enviar os dados da corrida."
      );
    }
  };

  return (
    <View style={css.container}>
      <MapView
        style={css.map}
        initialRegion={origin}
        showUserLocation={true}
        zoomEnabled={true}
        loadingEnabled={true}
        ref={mapEl}
      >
        {origin && (
          <Marker
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
          />
        )}
        {destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
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
        )}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
          />
        )}
      </MapView>
      <View style={css.search}>
        <Text>Distância: {Math.round(distance)} km</Text>
        <Button
          title="Use minha localização atual"
          onPress={getLocationAsync}
        />
        {!origin ? (
          <GooglePlacesAutocomplete 
            placeholder="De onde você está partindo?"
            onPress={async (_, details = null) => {
              if (details && details.geometry && details.geometry.location) {
                const originStreetNameResponse = await getStreetName(
                  details.geometry.location.lat,
                  details.geometry.location.lng
                );
        
                console.log('originStreetNameResponse:', originStreetNameResponse);
                console.log('details:', details);
        
                setOrigin({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                  streetName: originStreetNameResponse,
                });
                
              } else {
                console.error("Detalhes de localização não estão disponíveis.");
              }
            }}
            getDefaultValue={() => ""}
            query={{
              key: googleApi,
              language: "en",
            }}
            fetchDetails={true}
            styles={{ listView: { height: 250 } }}
          />
        ) : (
          <Text>{origin.streetName}</Text>
        )}
        {!destination ? (
          <GooglePlacesAutocomplete
            placeholder="Para onde ir?"
            onPress={async (_, details = null) => {
              if (details && details.geometry && details.geometry.location) {
                const destinationStreetNameResponse = await getStreetName(
                  details.geometry.location.lat,
                  details.geometry.location.lng
                );
          
                console.log('destinationStreetNameResponse:', destinationStreetNameResponse);
                console.log('details:', details);
          
                setDestination({
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                  streetName: destinationStreetNameResponse,
                });
                
              } else {
                console.error("Detalhes de localização não estão disponíveis.");
              }
            }}
            getDefaultValue={() => ""}
            query={{
              key: googleApi,
              language: "en",
            }}
            fetchDetails={true}
            styles={{ listView: { height: 100 } }}
          />
        ) : (
          <Text>{destination.streetName}</Text>
        )}
        {searchingForDriver && <Text>Procurando um motorista...</Text>}
        {rideAccepted && <Text>A corrida foi aceita por um motorista!</Text>}
      </View>
      <Button
  title="Enviar dados da corrida"
  onPress={sendRideData}
  accessibilityLabel="Enviar os dados da corrida para o servidor"
  style={css.button}
/>

    </View>
  );
  
};

export default TelaPassageiro;