// //Modulos
// const five = require("johnny-five");

// //Preparar la board 
// const board = new five.Board();

// //Variable para los metodos del led (johnny five)
// let led

// //Variables para la board y el led
// const ledVariables = {
//   isReady: false,
//   isOn: false,
// };


// //Crear la callback de la board y asignar el led 13 en el arduino
// board.on("ready", () => {
// led = new five.Led(13);
//   led.off();
//   ledVariables.isReady = true;
// });

// //Crear la variable de control del led
// const toggleLed = () => {
//   if (ledVariables.isOn) {
//     led.off();
//     ledVariables.isOn = false;
//   } else {
//     led.on();
//     ledVariables.isOn = true;
//   }
// };

// module.exports = { toggleLed, ledVariables };

