//Modulos
const express = require('express');
const router = express.Router()

//Controller
const ledController = require('../controller/ledController')


//Rutas
router.get('/', ledController.getIndex)
router.get('/hosts', ledController.getHosts)
router.get('/updatedhosts', ledController.updateHosts)
router.get('/pruebaScan', ledController.pruebaScan)




module.exports = router