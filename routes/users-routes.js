const express = require('express')

const router = express.Router()

// Première route de du backend de l'application PPSMJ
router.get('/', (req, res, next) => {
    res.json({message: "Hello from Mon Suivi Justice backend"})
})

module.exports = router