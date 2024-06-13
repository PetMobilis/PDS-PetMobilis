const express = require("express");
const app = express();
const http = require("http").createServer(app);
const Server = require("socket.io").Server;
const cors = require("cors");

const io = new Server(http);

const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let corrida = null;

app.post("/api", (req, res) => {
  const { origin, destination } = req.body;

  if (origin && destination) {
    corrida = { origin, destination };
    return res.status(201).send();
  } else {
    return res
      .status(400)
      .json({ message: "Dados inválidos. Verifique origin e destination." });
  }
});

app.get("/api", (_, res) => {
  if (corrida) {
    return res.status(200).json(corrida);
  } else {
    return res
      .status(404)
      .json({ message: "Nenhuma corrida disponível no momento." });
  }
});

io.on("connection", (socket) => {
  console.log("Um usuário se conectou");

  socket.on("getCorrida", () => {
    if (corrida) {
      socket.broadcast.emit("dadosCorrida", corrida);
    } else {
      socket.broadcast.emit("erro", {
        message: "Nenhuma corrida disponível no momento.",
      });
    }
  });

  socket.on("aceitarCorrida", () => {
    corrida = null;
    socket.broadcast.emit("corridaAceita");
  });
  socket.on("driverArrived", () => {
    console.log("Motorista chegou ao local de embarque");
    socket.broadcast.emit("driverArrived");
  });
  socket.on("rejeitarCorrida", () => {
    corrida = null;
    socket.broadcast.emit("corridaRejeitada");
  
    
  
  });
  

  // Novo evento para receber a localização do motorista
  socket.on("updateLocation", (location) => {
    console.log("Localização do motorista recebida:", location);
    socket.broadcast.emit("driverLocationUpdate", location);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor está rodando em ${PORT}`);
});
