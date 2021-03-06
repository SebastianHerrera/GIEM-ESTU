module.exports = (app, passport) => {

  const  MongoClient = require('mongodb').MongoClient

  var db

  MongoClient.connect('mongodb+srv://admin:GIEM@giem-4mkhr.mongodb.net/login-node?retryWrites=true&w=majority', (err, client) => {
  if (err) return console.log(err)
      db = client.db('login-node') // whatever your database name is
  })

    app.get("/",   (req, res) => {
      res.render("index", {
        page: req.urlbr,
        user: req.user
      });
    });

    app.post('/loginEStu',  passport.authenticate("estu-login",  {
        successRedirect: "/perfil",
        failureRedirect: "/",
        failureFlash: true
      })
    );

    app.get('/completar', isLoggedIn, (req, res) => {
      res.render('completar', {
        user: req.user.estudiantes
      })
    })

    app.post('/completar', isLoggedIn, (req, res) => {
      console.log("Quiere actualizar, el sexo a : ", req.body.sexo)

      db.collection('estudiantes').updateOne({'_id': req.user._id}, {$set:  {'estudiantes.edad': req.body.edad, 'estudiantes.sexo': req.body.sexo, 'estudiantes.grado': req.body.grado, 'estudiantes.datos': true}}, (err, results) =>{
        console.log("El usuario a cambiado sus datos correctamente")

        if (err) {
          console.log(err)
        }

        res.redirect('/perfil')
      }) 

    })

    app.get('/perfil', isLoggedIn, (req, res, next) => {
      /**
       * Buscamos en la base da datos independiente del req que nos da express,
       * Ya que por alguna razon, este da como 'undefined' a la propiedad .datos.
       */
      db.collection('estudiantes').find({'_id': req.user._id}).toArray(function (err, results){
       

        if(!results[0].estudiantes.datos){
          res.redirect('/completar')
        }else{
          
          db.collection('tests').find({'test.estudianteCorreo': req.user.estudiantes.correo}).toArray((err, result)  => { 

            if(err) res.send(err)
            if(result[0]){

              var cossas = result[0].test
  
              function comparar ( a, b ){ return a - b; }
  
              function sortByValue(jsObj){
                var sortedArray = [];
                for(var i in jsObj){
                    sortedArray.push([jsObj[i], i]);
                }
                return sortedArray.sort(comparar);
              } 
  
        
  
  
  
              var ordenadoPorValor = sortByValue(cossas)
  
              console.table(ordenadoPorValor)
  
              res.render("perfil", {
                user: results[0].estudiantes,
                resultados: ordenadoPorValor
              })
            }else{
              res.render("perfil", {
                user: results[0].estudiantes,
               
              })
            }


           

          })

          
        }

       
      })


        

      

      
    })




    app.get('/logout', (req, res) => {
      req.logout();
      res.redirect('/');
    });
  

   
};
  
  /** Esto, es un middleware, que nos verifica si es usuario tiene una session abierta
   * en caso de que no, pidrá avanzar normlamente, pero en caso de que no halla inicado sesison
   * lo rederigimos al menú de inicio
   */
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    res.redirect("/");
  }
  
