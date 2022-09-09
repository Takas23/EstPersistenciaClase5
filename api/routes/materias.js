var express = require("express");
var router = express.Router();
var models = require("../models");


//consulta general
router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.materia
    .findAll({ 
      attributes: ["id", "nombre"] // columnas que muestra
    })
    .then(materias => res.send(materias))
    .catch(() => res.sendStatus(500));
});


// insercion de datos
router.post("/", (req, res) => { //insercion
  models.materia
    .create({ nombre: req.body.nombre }) //body={json} .nombre=el atributo dentro del json
    .then(materia => res.status(201).send({ id: materia.id })) //status=respuesta y manda el id de la insercion
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});


//buscador de materia por id
const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};


// consulta por id
router.get("/:id", (req, res) => { // accede por el id que pasemos
  findMateria(req.params.id, { // recibe el req=parametro id
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


// actualizacion de dato por id
router.put("/:id", (req, res) => { // update tabla set campo = valor
  const onSuccess = materia =>
    materia
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] }) // dato a actualizar
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


//eliminacion por id
router.delete("/:id", (req, res) => { // elimina registro
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findMateria(req.params.id, { //busca registro
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
