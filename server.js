const sqlite = require('sqlite')
const express = require('express')
const Promise = require('bluebird')
const bodyParser = require('body-parser')
const usersSeed = require('./public/members.json')
const racesSeed = require('./public/races.json')
const playersHasRacesSeed = require('./public/players_has_races.json') 
const app = express()
require('./passport-strategy')

const auth = require ('./auth')
let db

app.use(express.static('public'))
app.use(bodyParser.json())
app.use('/auth', auth)

const insertMember = m => {
  const { image, name, nickname, email } = m
  return db.get('INSERT INTO members(image, name, nickname, email ) VALUES(?, ?, ?, ?)', image, name, nickname, email,)
  .then(() => db.get('SELECT last_insert_rowid() as id'))
  .then(({ id }) => db.get('SELECT * from members WHERE id = ?', id))
}


//date format text
const insertRace = r => {
  const { nameRace } = r
  return db.get('INSERT INTO races(nameRace) VALUES(?)', nameRace)
  .then(() => db.get('SELECT last_insert_rowid() as id'))
  .then(({ id }) => db.get('SELECT * from races WHERE id = ?', id))
}

const insertPlayerRace = pr => {
  const { race_id, player_id, position } = pr
  return db.get('INSERT INTO players_has_races(race_id, player_id, position) VALUES(?, ?, ?)', race_id, player_id, position)
  .then(() => db.get('SELECT * from players_has_races'))
}


// code qui remplit la db exemple
const dbPromise = Promise.resolve()
.then(() => sqlite.open('./database.sqlite', { Promise }))
.then(_db => {
  db = _db
  return db.migrate({ force: 'last' })
})
.then(() => Promise.map(usersSeed, m => insertMember(m)))
.then(() => Promise.map(racesSeed, r => insertRace(r)))
.then(() => Promise.map(playersHasRacesSeed, pr => insertPlayerRace(pr).then(pr)))
  
//update a position 
const updatePosition = up => {
  const { race_id, player_id, position } = up
  return db.get('UPDATE players_has_races SET position=? WHERE race_id=? AND player_id=?', position, race_id, player_id)
  .then(() => db.get('SELECT * from players_has_races'))
}

const html = `
<!doctype html>
<html class="no-js" lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Mario Kart Contest</title>
    <link rel="icon" type="image" href="favicon.ico"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">  
    <link href="https://use.fontawesome.com/releases/v5.0.8/css/all.css" rel="stylesheet">
    <link rel="stylesheet" href="/style.css">
  </head>
  <body>
    <div id="main" class="pb-5">
    </div>
    <footer class="container-fluid pt-5">
      <div class="row justify-content-center text-center">
        <div class="col-12">
          <img src="https://vignette.wikia.nocookie.net/mariokart/images/f/fc/ItemBoxMK8.png/revision/latest?cb=20140520032019" class="image-footer image-fluid" alt="#">
        </div>
      </div>
      <div class="row justify-content-around text-center">
        <div class="col-md-4">
          <h5 class="text-uppercase">Suivez nous</h5>
            <div class="mt-3">     
              <a href="https://fr-fr.facebook.com/wildcodeschool/" target=blank ><i class="fab fa-facebook-square rounded-circle"></i></a>
              <a href="https://twitter.com/wildcodeschool" target="_blank"><i class="fab fa-twitter rounded-circle"></i></a>
              <a href="https://www.linkedin.com/school/wild-code-school/" target=blank ><i class="fab fa-linkedin-in rounded-circle"></i></a>
              <a href="https://www.instagram.com/wildcodeschool/" target="_blank"><i class="fab fa-instagram rounded-circle"></i></a>
            </div>
          </div>
        <div class="col-md-4">
          <h5 class="text-uppercase">Nos partenaires</h5>
            <ul class="list-group">
              <li><a href="https://github.com/WildCodeSchool/reims-0218-worldcuppronostics"target=blank>world cup pronostics</a></li>
              <li><a href="https://github.com/WildCodeSchool/reims-0218-artezicreloaded"target=blank>artezic reloaded</a></li>
              <li><a href="https://github.com/WildCodeSchool/reims-0218-bookyourwilder"target=blank>book your wilder</a>  </li>
            </ul>
        </div>
        <div class="col-12">
          <div class="footer-copyright py-3 text-center">© 2018 Copyright:
            <a href="https://www.linkedin.com/in/anahita-vahdani-39736215a/"target=blank>Anahita - </a>
            <a href="https://www.linkedin.com/in/anthony-fischer-62436115a/"target=blank>Anthony - </a>
            <a href="https://www.linkedin.com/in/dorian-massot-10b839151/"target=blank>Dorian - </a>
            <a href="https://www.linkedin.com/in/khalid-el-idrissi-a9a36115a/"target=blank>Khalid</a>
          </div>   
        </div>
      </div>
    </footer>
  <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
  <script src="/page.js"></script>
  <script type="module"  src="/app.js"></script>
  </body>
</html>`

app.get('/members', (req, res) => {
  db.all('SELECT * from members')
  .then(records => {
    return res.json(records)
  })
})

app.get('/race', (req, res) => {
  db.all('SELECT * from races')
  .then(records => {
    return res.json(records)
  })
})

//CREATE
app.post('/members', (req, res) => {
  return insertMember(req.body)
  .then(record => res.json(record))
})

//UPDATE POSITION
app.put('/courses', (req, res) => {
  return updatePosition(req.body) 
  .then(setPosition => {
    res.json(setPosition)
  })
})

app.post('/race', (req, res) => {
  return insertRace(req.body)
  .then(record => res.json(record))
})

app.post('/addPlayerToRace', (req, res) => {
  return insertPlayerRace(req.body)
  .then(record => res.json(record))
})

app.get('/courses', (req, res) => {
  db.all(
    `SELECT races.id as race_id, races.nameRace, members.id as player_id, position, name, nickname, image
    from races
    left join players_has_races on players_has_races.race_id = races.id
    left join members on members.id = players_has_races.player_id
    order by position`
  )
  .then(records => {
    const racesPlayers = records.map(
      race => ({
        id: race.race_id,
        nameRace: race.nameRace,
        player: {
          id: race.player_id,
          name: race.name,
          nickname: race.nickname,
          image: race.image,
          position: race.position
        }
      })
    ).reduce((acc, race) => {
      if (!acc[race.id]) {
        acc[race.id] = {
          id: race.id,
          nameRace: race.nameRace,
          players: race.player.id ? [race.player] : []
        }
      } else {
        acc[race.id].players = [
          ...acc[race.id].players,
          race.player
        ]
      }
      return acc
    }, {})
    return res.json(Object.values(racesPlayers))
  })
})

//READ
app.get('*', (req, res) => {
  res.send(html)
  res.end()
})

app.listen(3000)
