import axios from "axios";

import { googleApi } from "./config";

export const getStreetName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApi}`
    );

    if (response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    } else {
      return "Nome da rua não encontrado";
    }
  } catch (error) {
    console.error("Erro ao obter nome da rua:", error.message);
    return "Erro ao obter nome da rua";
  }
};
